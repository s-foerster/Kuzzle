export const LEADERBOARD_REQUEST_TIMEOUT_MS = 15_000;
export const LEADERBOARD_MAX_AUTO_RETRIES = 1;
export const LEADERBOARD_RETRY_DELAY_MS = 250;

export function createLeaderboardTimeoutError() {
  const error = new Error("Le chargement du classement a dépassé le délai.");
  error.code = "LEADERBOARD_TIMEOUT";
  return error;
}

export function createLeaderboardCancelledError() {
  const error = new Error("Le chargement du classement a été annulé.");
  error.code = "LEADERBOARD_CANCELLED";
  return error;
}

export function isRetryableLeaderboardError(error) {
  if (!error || error.code === "LEADERBOARD_CANCELLED") return false;
  if (error.code === "LEADERBOARD_TIMEOUT" || error.isAcquireTimeout) return true;
  if (error.name === "AbortError" || error instanceof TypeError) return true;

  const message = String(error.message || error).toLowerCase();
  return message.includes("network") || message.includes("failed to fetch");
}

export function isCurrentLeaderboardRequest(requestId, latestRequestId) {
  return requestId === latestRequestId;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function runLeaderboardRequest(
  task,
  {
    signal: externalSignal,
    timeoutMs = LEADERBOARD_REQUEST_TIMEOUT_MS,
    maxRetries = LEADERBOARD_MAX_AUTO_RETRIES,
    retryDelayMs = LEADERBOARD_RETRY_DELAY_MS,
    shouldRetry = isRetryableLeaderboardError,
  } = {},
) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (externalSignal?.aborted) throw createLeaderboardCancelledError();

    const controller = new AbortController();
    let timeoutId = null;
    let timedOut = false;
    let externalAbortHandler = null;

    const taskPromise = Promise.resolve().then(() => task(controller.signal));
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(createLeaderboardTimeoutError());
      }, timeoutMs);
    });

    const externalAbortPromise = externalSignal
      ? new Promise((_, reject) => {
          externalAbortHandler = () => {
            controller.abort();
            reject(createLeaderboardCancelledError());
          };
          externalSignal.addEventListener("abort", externalAbortHandler, {
            once: true,
          });
        })
      : null;

    try {
      return await Promise.race(
        externalAbortPromise
          ? [taskPromise, timeoutPromise, externalAbortPromise]
          : [taskPromise, timeoutPromise],
      );
    } catch (error) {
      if (
        attempt >= maxRetries ||
        !shouldRetry(error) ||
        externalSignal?.aborted
      ) {
        throw error;
      }
      await delay(retryDelayMs);
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (externalSignal && externalAbortHandler) {
        externalSignal.removeEventListener("abort", externalAbortHandler);
      }
      if (timedOut) controller.abort();
    }
  }

  throw new Error("Le chargement du classement a échoué.");
}
