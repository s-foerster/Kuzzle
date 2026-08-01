export const GAME_TYPES = Object.freeze({
  HEARTS: "hearts",
  LUMIZLE: "lumizle",
});

const PUZZLE_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export function resultKey(gameType, puzzleDate) {
  return `${gameType}:${puzzleDate}`;
}

export function isValidGameResult(result) {
  if (!result || !Object.values(GAME_TYPES).includes(result.game_type)) {
    return false;
  }
  if (
    typeof result.puzzle_date !== "string" ||
    !PUZZLE_ID_RE.test(result.puzzle_date)
  ) {
    return false;
  }
  if (!Number.isInteger(result.time_seconds) || result.time_seconds <= 0) {
    return false;
  }
  return (
    Number.isInteger(result.verify_count) && result.verify_count >= 0
  );
}

export function isBetterGameResult(candidate, existing) {
  if (!isValidGameResult(candidate)) return false;
  if (!isValidGameResult(existing)) return true;
  if (
    candidate.game_type !== existing.game_type ||
    candidate.puzzle_date !== existing.puzzle_date
  ) {
    return false;
  }

  if (candidate.game_type === GAME_TYPES.LUMIZLE) {
    return candidate.time_seconds < existing.time_seconds;
  }

  return (
    candidate.verify_count < existing.verify_count ||
    (candidate.verify_count === existing.verify_count &&
      candidate.time_seconds < existing.time_seconds)
  );
}

function safeParse(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function asInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function addCandidate(target, invalid, raw) {
  const candidate = {
    game_type: raw.game_type,
    puzzle_date:
      typeof raw.puzzle_date === "string" ? raw.puzzle_date.trim() : "",
    time_seconds: asInteger(raw.time_seconds),
    verify_count: asInteger(raw.verify_count),
  };
  const key = resultKey(candidate.game_type, candidate.puzzle_date);

  if (!isValidGameResult(candidate)) {
    invalid.push(candidate);
    return;
  }

  const existing = target.get(key);
  if (!existing || isBetterGameResult(candidate, existing)) {
    target.set(key, candidate);
  }
}

/**
 * Collecte les performances locales classables.
 * Les niveaux terminés sans métriques fiables restent dans `invalid` et ne sont
 * jamais envoyés au classement.
 */
export function collectLocalGameResults(storage = globalThis.localStorage) {
  if (!storage) return { valid: [], invalid: [] };

  const candidates = new Map();
  const invalid = [];
  const heartsCompleted = safeParse(
    storage,
    "hearts-completed-levels",
    [],
  );
  const heartsStats = safeParse(storage, "hearts-level-stats", {});
  const lumizleCompleted = safeParse(
    storage,
    "lumizle-completed-levels",
    [],
  );
  const lumizleStats = safeParse(storage, "lumizle-level-stats", {});

  for (const puzzleDate of Array.isArray(heartsCompleted)
    ? heartsCompleted
    : []) {
    const stats = heartsStats?.[puzzleDate] || {};
    addCandidate(candidates, invalid, {
      game_type: GAME_TYPES.HEARTS,
      puzzle_date: puzzleDate,
      time_seconds: stats.elapsedTime,
      verify_count: stats.verifyCount,
    });
  }

  for (const puzzleDate of Array.isArray(lumizleCompleted)
    ? lumizleCompleted
    : []) {
    const stats = lumizleStats?.[puzzleDate] || {};
    addCandidate(candidates, invalid, {
      game_type: GAME_TYPES.LUMIZLE,
      puzzle_date: puzzleDate,
      time_seconds: stats.elapsedSeconds,
      verify_count: 0,
    });
  }

  return { valid: [...candidates.values()], invalid };
}

export function getBetterLocalResults(localResults, remoteResults) {
  const remoteByKey = new Map(
    remoteResults
      .filter((result) => result.completed !== false)
      .map((result) => [
        resultKey(result.game_type, result.puzzle_date),
        result,
      ]),
  );

  return localResults.filter((candidate) => {
    const remote = remoteByKey.get(
      resultKey(candidate.game_type, candidate.puzzle_date),
    );
    return !remote || isBetterGameResult(candidate, remote);
  });
}
