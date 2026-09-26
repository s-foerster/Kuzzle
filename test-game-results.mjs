import test from "node:test";
import assert from "node:assert/strict";
import {
  collectLocalGameResults,
  getBetterLocalResults,
  isBetterGameResult,
} from "./src/utils/gameResults.js";

function memoryStorage(initial = {}) {
  const values = new Map(
    Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]),
  );
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("collecte les quotidiens et entraînements des deux jeux", () => {
  const storage = memoryStorage({
    "hearts-completed-levels": ["2026-08-01", "easy_2"],
    "hearts-level-stats": {
      "2026-08-01": { elapsedTime: 95, verifyCount: 1 },
      easy_2: { elapsedTime: 70, verifyCount: 0 },
    },
    "lumizle-completed-levels": ["2026-08-01", "test1"],
    "lumizle-level-stats": {
      "2026-08-01": { elapsedSeconds: 120 },
      test1: { elapsedSeconds: 80 },
    },
  });

  const collected = collectLocalGameResults(storage);
  assert.equal(collected.valid.length, 4);
  assert.equal(collected.invalid.length, 0);
  assert.ok(
    collected.valid.some(
      (row) => row.game_type === "hearts" && row.puzzle_date === "easy_2",
    ),
  );
  assert.ok(
    collected.valid.some(
      (row) => row.game_type === "lumizle" && row.puzzle_date === "test1",
    ),
  );
});

test("écarte les performances sans métriques fiables", () => {
  const storage = memoryStorage({
    "hearts-completed-levels": ["zero", "missing_verify"],
    "hearts-level-stats": {
      zero: { elapsedTime: 0, verifyCount: 0 },
      missing_verify: { elapsedTime: 60 },
    },
    "lumizle-completed-levels": ["missing_time"],
    "lumizle-level-stats": {},
  });

  const collected = collectLocalGameResults(storage);
  assert.equal(collected.valid.length, 0);
  assert.equal(collected.invalid.length, 3);
});

test("Kuzzle privilégie les vérifications puis le temps", () => {
  const existing = {
    game_type: "hearts",
    puzzle_date: "easy_2",
    time_seconds: 50,
    verify_count: 2,
  };
  assert.equal(
    isBetterGameResult(
      { ...existing, time_seconds: 100, verify_count: 1 },
      existing,
    ),
    true,
  );
  assert.equal(
    isBetterGameResult(
      { ...existing, time_seconds: 40, verify_count: 2 },
      existing,
    ),
    true,
  );
  assert.equal(
    isBetterGameResult(
      { ...existing, time_seconds: 30, verify_count: 3 },
      existing,
    ),
    false,
  );
});

test("Lumizle conserve uniquement le meilleur temps", () => {
  const existing = {
    game_type: "lumizle",
    puzzle_date: "test1",
    time_seconds: 90,
    verify_count: 0,
  };
  assert.equal(
    isBetterGameResult({ ...existing, time_seconds: 80 }, existing),
    true,
  );
  assert.equal(
    isBetterGameResult({ ...existing, time_seconds: 100 }, existing),
    false,
  );
});

test("n'envoie que les résultats absents ou meilleurs", () => {
  const local = [
    {
      game_type: "hearts",
      puzzle_date: "easy_2",
      time_seconds: 60,
      verify_count: 0,
    },
    {
      game_type: "lumizle",
      puzzle_date: "test1",
      time_seconds: 100,
      verify_count: 0,
    },
    {
      game_type: "hearts",
      puzzle_date: "hard_1",
      time_seconds: 180,
      verify_count: 2,
    },
  ];
  const remote = [
    { ...local[0], time_seconds: 80 },
    { ...local[1], time_seconds: 90 },
  ];

  const pending = getBetterLocalResults(local, remote);
  assert.deepEqual(
    pending.map((row) => row.puzzle_date).sort(),
    ["easy_2", "hard_1"],
  );
});

