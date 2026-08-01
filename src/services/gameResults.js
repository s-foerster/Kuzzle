import { ref } from "vue";
import { supabase } from "../lib/supabase.js";
import {
  GAME_TYPES,
  collectLocalGameResults,
  getBetterLocalResults,
  isBetterGameResult,
  isValidGameResult,
  resultKey,
} from "../utils/gameResults.js";
import { invalidateLeaderboardCache } from "../composables/useLeaderboard.js";

const PAGE_SIZE = 1000;
const SYNC_BATCH_SIZE = 50;

export const gameResultsSyncing = ref(false);
export const gameResultsSyncError = ref(null);
export const gameResultsPendingCount = ref(0);
export const gameResultsInvalidCount = ref(0);
export const gameResultsSyncRevision = ref(0);
export const gameResultStatuses = ref({});

const activeSyncs = new Map();

function getSyncErrorMessage(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  if (code === "42702" || message.toLowerCase().includes("ambiguous")) {
    return "Le service de classement doit être mis à jour. Votre score est conservé.";
  }
  if (
    code === "42501" ||
    code === "PGRST301" ||
    message.toLowerCase().includes("jwt")
  ) {
    return "Votre session a expiré. Reconnectez-vous pour synchroniser ce score.";
  }
  if (
    typeof navigator !== "undefined" &&
    navigator.onLine === false
  ) {
    return "Vous êtes hors connexion. Votre score sera synchronisé plus tard.";
  }
  return "Synchronisation impossible pour le moment. Votre score est conservé.";
}

function setStatuses(results, status, message = null) {
  if (!results.length) return;
  const next = { ...gameResultStatuses.value };
  for (const result of results) {
    next[resultKey(result.game_type, result.puzzle_date)] = {
      status,
      message,
    };
  }
  gameResultStatuses.value = next;
}

function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Une victoire reste utilisable même si le stockage local est indisponible.
  }
}

function mergeRemoteIntoLocalStorage(remoteResults, storage) {
  if (!storage) return;

  const configs = {
    [GAME_TYPES.HEARTS]: {
      completedKey: "hearts-completed-levels",
      statsKey: "hearts-level-stats",
      toStats: (row) => ({
        elapsedTime: row.time_seconds,
        verifyCount: row.verify_count,
      }),
      fromStats: (puzzleDate, stats) => ({
        game_type: GAME_TYPES.HEARTS,
        puzzle_date: puzzleDate,
        time_seconds: Number(stats?.elapsedTime),
        verify_count: Number(stats?.verifyCount),
      }),
    },
    [GAME_TYPES.LUMIZLE]: {
      completedKey: "lumizle-completed-levels",
      statsKey: "lumizle-level-stats",
      toStats: (row) => ({ elapsedSeconds: row.time_seconds }),
      fromStats: (puzzleDate, stats) => ({
        game_type: GAME_TYPES.LUMIZLE,
        puzzle_date: puzzleDate,
        time_seconds: Number(stats?.elapsedSeconds),
        verify_count: 0,
      }),
    },
  };

  for (const [gameType, config] of Object.entries(configs)) {
    let completed = [];
    let stats = {};
    try {
      const parsedCompleted = JSON.parse(
        storage.getItem(config.completedKey) || "[]",
      );
      const parsedStats = JSON.parse(storage.getItem(config.statsKey) || "{}");
      completed = Array.isArray(parsedCompleted) ? parsedCompleted : [];
      stats = parsedStats && typeof parsedStats === "object" ? parsedStats : {};
    } catch {
      completed = [];
      stats = {};
    }

    const completedSet = new Set(completed);
    for (const row of remoteResults) {
      if (row.game_type !== gameType || !row.completed) continue;
      completedSet.add(row.puzzle_date);

      if (!isValidGameResult(row)) continue;
      const localResult = config.fromStats(
        row.puzzle_date,
        stats[row.puzzle_date],
      );
      if (!isValidGameResult(localResult) || isBetterGameResult(row, localResult)) {
        stats[row.puzzle_date] = config.toStats(row);
      }
    }

    writeJson(storage, config.completedKey, [...completedSet]);
    writeJson(storage, config.statsKey, stats);
  }
}

/** Récupère tout l'historique malgré la limite PostgREST de 1 000 lignes. */
export async function fetchAllRemoteGameResults(userId) {
  if (!supabase || !userId) return [];

  const results = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("game_results")
      .select(
        "id,user_id,game_type,puzzle_date,completed,time_seconds,verify_count,created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    results.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return results;
}

async function runSync(userId, storage) {
  gameResultsSyncing.value = true;
  gameResultsSyncError.value = null;

  try {
    if (!supabase) throw new Error("Supabase non disponible");
    if (!userId) {
      return { success: false, reason: "auth_required", changedKeys: [] };
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new Error("Connexion indisponible");
    }

    const { error: profileError } = await supabase.rpc("ensure_my_profile");
    if (profileError) throw profileError;

    const remoteResults = await fetchAllRemoteGameResults(userId);
    mergeRemoteIntoLocalStorage(remoteResults, storage);

    const local = collectLocalGameResults(storage);
    const pending = getBetterLocalResults(local.valid, remoteResults);
    gameResultsInvalidCount.value = local.invalid.length;
    gameResultsPendingCount.value = pending.length;
    setStatuses(local.valid, "saved");
    setStatuses(local.invalid, "invalid");
    setStatuses(pending, "syncing");

    const rpcRows = [];
    for (let index = 0; index < pending.length; index += SYNC_BATCH_SIZE) {
      const batch = pending.slice(index, index + SYNC_BATCH_SIZE);
      const { data, error } = await supabase.rpc("sync_game_results", {
        p_results: batch,
      });
      if (error) throw error;
      rpcRows.push(...(data || []));
    }

    const changedKeys = [];
    const rowsByKey = new Map(
      rpcRows.map((row) => [resultKey(row.game_type, row.puzzle_date), row]),
    );
    const nextStatuses = { ...gameResultStatuses.value };
    for (const candidate of pending) {
      const key = resultKey(candidate.game_type, candidate.puzzle_date);
      const row = rowsByKey.get(key);
      const status = row?.status || "unchanged";
      nextStatuses[key] = { status: status === "invalid" ? "invalid" : "saved" };
      if (status === "inserted" || status === "improved") {
        changedKeys.push(key);
        invalidateLeaderboardCache(
          candidate.puzzle_date,
          candidate.game_type,
        );
      }
    }
    gameResultStatuses.value = nextStatuses;
    gameResultsPendingCount.value = 0;
    gameResultsSyncRevision.value += 1;

    return {
      success: true,
      remoteResults,
      results: rpcRows,
      changedKeys,
      invalidCount: local.invalid.length,
      pendingCount: 0,
    };
  } catch (error) {
    const local = collectLocalGameResults(storage);
    gameResultsPendingCount.value = local.valid.length;
    gameResultsInvalidCount.value = local.invalid.length;
    gameResultsSyncError.value = getSyncErrorMessage(error);
    console.error("[gameResults] Synchronisation impossible:", error);
    setStatuses(local.valid, "pending", gameResultsSyncError.value);
    return {
      success: false,
      reason: "sync_failed",
      error,
      changedKeys: [],
      pendingCount: local.valid.length,
      invalidCount: local.invalid.length,
    };
  } finally {
    gameResultsSyncing.value = false;
  }
}

export function syncGameResults({
  userId,
  storage = globalThis.localStorage,
} = {}) {
  const syncKey = userId || "anonymous";
  if (activeSyncs.has(syncKey)) return activeSyncs.get(syncKey);

  const sync = runSync(userId, storage).finally(() => {
    activeSyncs.delete(syncKey);
  });
  activeSyncs.set(syncKey, sync);
  return sync;
}
