import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLeaderboardTimeoutError,
  isCurrentLeaderboardRequest,
  runLeaderboardRequest,
} from "./src/utils/leaderboardRequest.js";

test("abandonne une requête qui ne répond jamais après le délai", async () => {
  await assert.rejects(
    runLeaderboardRequest(() => new Promise(() => {}), {
      timeoutMs: 10,
      maxRetries: 0,
    }),
    (error) => error.code === "LEADERBOARD_TIMEOUT",
  );
});

test("effectue une seule relance automatique puis échoue proprement", async () => {
  let attempts = 0;

  await assert.rejects(
    runLeaderboardRequest(() => {
      attempts += 1;
      return Promise.reject(createLeaderboardTimeoutError());
    }, {
      timeoutMs: 20,
      maxRetries: 1,
      retryDelayMs: 1,
    }),
    (error) => error.code === "LEADERBOARD_TIMEOUT",
  );

  assert.equal(attempts, 2);
});

test("retourne la réponse après une relance réussie", async () => {
  let attempts = 0;

  const result = await runLeaderboardRequest(() => {
    attempts += 1;
    if (attempts === 1) return Promise.reject(createLeaderboardTimeoutError());
    return Promise.resolve({ entries: [1, 2, 3] });
  }, {
    timeoutMs: 20,
    maxRetries: 1,
    retryDelayMs: 1,
  });

  assert.deepEqual(result, { entries: [1, 2, 3] });
  assert.equal(attempts, 2);
});

test("annule une requête précédente sans la relancer", async () => {
  const controller = new AbortController();
  const request = runLeaderboardRequest(() => new Promise(() => {}), {
    signal: controller.signal,
    timeoutMs: 1_000,
    maxRetries: 1,
  });

  controller.abort();

  await assert.rejects(
    request,
    (error) => error.code === "LEADERBOARD_CANCELLED",
  );
});

test("une réponse obsolète ne peut pas remplacer la requête courante", () => {
  assert.equal(isCurrentLeaderboardRequest(3, 3), true);
  assert.equal(isCurrentLeaderboardRequest(2, 3), false);
});
