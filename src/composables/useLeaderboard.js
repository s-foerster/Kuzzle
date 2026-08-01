import { computed, ref } from "vue";
import {
  isCurrentLeaderboardRequest,
  runLeaderboardRequest,
} from "../utils/leaderboardRequest.js";

const _cache = new Map();
const CACHE_TTL_MS = 60_000;

export function invalidateLeaderboardCache(puzzleDate, gameType = "hearts") {
  _cache.delete(`${puzzleDate}_${gameType}`);
}

export function useLeaderboard() {
  const entries = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const currentUserResult = ref(null);

  let _currentDate = null;
  let _currentType = null;
  let _requestGeneration = 0;
  let _activeRequestController = null;
  let _lastRequest = null;

  const topEntries = computed(() => entries.value.slice(0, 3));
  const currentUserEntry = computed(
    () =>
      currentUserResult.value ??
      entries.value.find((entry) => entry.is_current_user) ??
      null,
  );
  const currentUserRank = computed(
    () => currentUserEntry.value?.rank ?? null,
  );

  function reset() {
    _requestGeneration += 1;
    _activeRequestController?.abort();
    _activeRequestController = null;
    entries.value = [];
    total.value = 0;
    error.value = null;
    loading.value = false;
    currentUserResult.value = null;
    _currentDate = null;
    _currentType = null;
    _lastRequest = null;
  }

  async function fetchLeaderboard(
    puzzleDate,
    gameType = "hearts",
    limit = 10,
    offset = 0,
    { bypassCache = false } = {},
  ) {
    if (!puzzleDate) return;

    const requestId = ++_requestGeneration;
    _activeRequestController?.abort();
    const requestController = new AbortController();
    _activeRequestController = requestController;
    _lastRequest = { puzzleDate, gameType, limit, offset };

    const cacheKey = `${puzzleDate}_${gameType}`;
    const cached = _cache.get(cacheKey);
    const now = Date.now();

    if (
      !bypassCache &&
      offset === 0 &&
      cached &&
      now - cached.timestamp < CACHE_TTL_MS
    ) {
      entries.value = [...cached.entries];
      total.value = cached.total;
      currentUserResult.value = cached.currentUserEntry
        ? { ...cached.currentUserEntry }
        : null;
      _currentDate = puzzleDate;
      _currentType = gameType;
      loading.value = false;
      _activeRequestController = null;
      return;
    }

    loading.value = true;
    error.value = null;
    _currentDate = puzzleDate;
    _currentType = gameType;

    try {
      const { supabase } = await import("../lib/supabase.js");
      if (!supabase) throw new Error("Supabase non disponible");

      const [leaderboardResponse, currentUserResponse] =
        await runLeaderboardRequest(
          async (signal) => {
            const leaderboardRequest = supabase
              .rpc("get_leaderboard", {
                p_puzzle_date: puzzleDate,
                p_game_type: gameType,
                p_limit: limit,
                p_offset: offset,
              })
              .abortSignal(signal);

            if (offset !== 0) {
              return [await leaderboardRequest, null];
            }

            return await Promise.all([
              leaderboardRequest,
              supabase
                .rpc("get_my_leaderboard_entry", {
                  p_puzzle_date: puzzleDate,
                  p_game_type: gameType,
                })
                .abortSignal(signal),
            ]);
          },
          { signal: requestController.signal },
        );

      if (!isCurrentLeaderboardRequest(requestId, _requestGeneration)) return;

      const { data, error: rpcError } = leaderboardResponse;
      const currentUserError = currentUserResponse?.error;

      if (rpcError) {
        if (
          rpcError.code === "42501" ||
          rpcError.message?.includes("permission")
        ) {
          error.value = "auth_required";
        } else {
          error.value = rpcError.message;
          console.error("[useLeaderboard] RPC error:", rpcError);
        }
        return;
      }

      if (currentUserError) {
        error.value = currentUserError.message;
        console.error(
          "[useLeaderboard] Current-user RPC error:",
          currentUserError,
        );
        return;
      }

      const rows = data || [];

      if (offset === 0) {
        entries.value = rows;
        currentUserResult.value = currentUserResponse?.data?.[0] ?? null;
      } else {
        const existingRanks = new Set(entries.value.map((entry) => entry.rank));
        for (const row of rows) {
          if (!existingRanks.has(row.rank)) entries.value.push(row);
        }
      }

      total.value =
        rows.length > 0
          ? Number(rows[0].total_count)
          : currentUserResult.value
            ? Number(currentUserResult.value.total_count)
            : 0;

      if (offset === 0) {
        _cache.set(cacheKey, {
          entries: [...entries.value],
          total: total.value,
          currentUserEntry: currentUserResult.value
            ? { ...currentUserResult.value }
            : null,
          timestamp: Date.now(),
        });
      }
    } catch (requestError) {
      if (!isCurrentLeaderboardRequest(requestId, _requestGeneration)) return;
      if (requestError?.code === "LEADERBOARD_CANCELLED") return;
      error.value = requestError?.message ?? "Erreur inconnue";
      console.error("[useLeaderboard] Exception:", requestError);
    } finally {
      if (isCurrentLeaderboardRequest(requestId, _requestGeneration)) {
        loading.value = false;
        if (_activeRequestController === requestController) {
          _activeRequestController = null;
        }
      }
    }
  }

  async function loadMore() {
    if (
      !_currentDate ||
      loading.value ||
      (total.value > 0 && entries.value.length >= total.value)
    ) {
      return;
    }

    await fetchLeaderboard(
      _currentDate,
      _currentType ?? "hearts",
      10,
      entries.value.length,
      { bypassCache: true },
    );
  }

  async function retry() {
    if (!_lastRequest || loading.value) return;
    const { puzzleDate, gameType, limit, offset } = _lastRequest;
    await fetchLeaderboard(puzzleDate, gameType, limit, offset, {
      bypassCache: true,
    });
  }

  function invalidateCache(puzzleDate, gameType = "hearts") {
    invalidateLeaderboardCache(puzzleDate, gameType);
  }

  return {
    entries,
    total,
    loading,
    error,
    topEntries,
    currentUserEntry,
    currentUserRank,
    fetchLeaderboard,
    loadMore,
    retry,
    invalidateCache,
    reset,
  };
}
