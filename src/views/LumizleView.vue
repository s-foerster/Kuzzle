<template>
  <main class="app-main">
    <!-- Loading -->
    <div v-if="lumizleIsLoading" class="loading">
      <div class="spinner"></div>
      <p>Chargement du puzzle…</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="lumizleError" class="error-message">
      <p>❌ Erreur : {{ lumizleError }}</p>
      <button @click="initDailyPuzzle()" class="btn btn-primary">
        Réessayer
      </button>
    </div>

    <!-- Jeu -->
    <div v-else-if="lumizlePuzzle" class="game-container">
      <!-- Timer -->
      <div class="timer-row">
        <div
          class="timer-display"
          :class="{
            'timer-paused': lumizleIsPaused,
            'timer-won': lumizleIsWon,
          }"
        >
          <span class="timer-icon">⏱</span>
          <span class="timer-value">{{ lumizleFormattedTime }}</span>
        </div>
        <button
          v-if="lumizleIsTimerStarted && !lumizleIsWon"
          @click="lumizleTogglePause"
          class="btn-pause"
          :class="{ 'btn-pause--active': lumizleIsPaused }"
        >
          {{ lumizleIsPaused ? "▶ Reprendre" : "⏸ Pause" }}
        </button>
      </div>

      <!-- Victoire -->
      <Transition name="victory-slide">
        <div v-if="lumizleIsWon" class="victory-card">
          <div class="victory-confetti">🎉</div>
          <h2>Félicitations&nbsp;!</h2>
          <p>Vous avez résolu le puzzle Lumizle !</p>
          <div class="victory-stats">
            <div class="stat-item">
              <span class="stat-label">⏱ Temps</span>
              <span class="stat-value">{{ lumizleFormattedTime }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Pause -->
      <Transition name="modal-fade">
        <div
          v-if="lumizleIsPaused"
          class="pause-modal"
          @click.self="lumizleTogglePause"
        >
          <div class="pause-content">
            <h2>⏸ Pause</h2>
            <div class="pause-timer">{{ lumizleFormattedTime }}</div>
            <button @click="lumizleTogglePause" class="btn btn-primary">
              ▶ Reprendre
            </button>
          </div>
        </div>
      </Transition>

      <!-- Grille + Règles -->
      <div
        class="lumizle-play-area"
        :class="{ 'grid-blurred': lumizleIsPaused }"
      >
        <div class="lumizle-grid-area">
          <LumizleGrid
            :game-state="lumizleGameState"
            :initial-grid="lumizlePuzzle.initialGrid"
            :fixed-cells="lumizleFixedCells"
            :violating-cells="lumizleViolatingCells"
            :grid-size="lumizlePuzzle.metadata.gridSize"
            :is-won="lumizleIsWon"
            @cell-click="lumizleHandleCellClick"
            @cell-drag="lumizleHandleCellDrag"
          />
        </div>
        <div class="lumizle-rules-area">
          <LumizleRules :rules="lumizlePuzzle.rules" />
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button
          @click="lumizleUndo"
          class="btn btn-secondary"
          :disabled="lumizleUndoHistory.length === 0 || lumizleIsWon"
          title="Annuler le dernier coup"
        >
          &#x21A9;
        </button>
        <button @click="lumizleResetGameState" class="btn btn-secondary">
          🔄
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import LumizleGrid from "../components/Lumizle/LumizleGrid.vue";
import LumizleRules from "../components/Lumizle/LumizleRules.vue";
import { useLumizle } from "../composables/useLumizle.js";
import { useNavigationStore } from "../stores/navigation.js";
import { useAuthStore } from "../stores/auth.js";

const navStore = useNavigationStore();
const authStore = useAuthStore();

const {
  puzzle: lumizlePuzzle,
  gameState: lumizleGameState,
  isWon: lumizleIsWon,
  isLoading: lumizleIsLoading,
  error: lumizleError,
  formattedTime: lumizleFormattedTime,
  isTimerStarted: lumizleIsTimerStarted,
  isPaused: lumizleIsPaused,
  togglePause: lumizleTogglePause,
  undoHistory: lumizleUndoHistory,
  undo: lumizleUndo,
  fixedCells: lumizleFixedCells,
  violatingCells: lumizleViolatingCells,
  handleCellClick: lumizleHandleCellClick,
  handleCellDrag: lumizleHandleCellDrag,
  resetGameState: lumizleResetGameState,
  initPuzzle: lumizleInitPuzzle,
  initPracticePuzzle: lumizleInitPracticePuzzle,
  markCompleted: lumizleMarkCompleted,
  currentDate: lumizleCurrentDate,
  elapsedSeconds: lumizleElapsedSeconds,
} = useLumizle();

function getDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function initDailyPuzzle() {
  lumizleInitPuzzle(getDateKey(new Date()));
}

// Niveaux complétés Lumizle
const lumizleCompletedLevels = ref(
  JSON.parse(localStorage.getItem("lumizle-completed-levels") || "[]"),
);

watch(lumizleIsWon, async (won) => {
  if (!won || !lumizleCurrentDate.value) return;
  const id = lumizleCurrentDate.value;
  lumizleMarkCompleted(id);
  if (!lumizleCompletedLevels.value.includes(id)) {
    lumizleCompletedLevels.value.push(id);
    localStorage.setItem(
      "lumizle-completed-levels",
      JSON.stringify(lumizleCompletedLevels.value),
    );
  }

  // Supabase (si connecté et puzzle quotidien)
  const isPractice =
    id.startsWith("easy_") ||
    id.startsWith("medium_") ||
    id.startsWith("hard_");
  if (authStore.isLoggedIn && !isPractice) {
    try {
      const { supabase } = await import("../lib/supabase.js");
      if (supabase) {
        const { error: saveError } = await supabase.from("game_results").upsert(
          {
            user_id: authStore.user.id,
            game_type: "lumizle",
            puzzle_date: id,
            completed: true,
            time_seconds: lumizleElapsedSeconds.value,
          },
          { onConflict: "user_id,game_type,puzzle_date" },
        );

        if (saveError) {
          console.error(
            "❌ [LumizleView] Erreur sauvegarde Supabase:",
            saveError.message || saveError,
          );
        } else {
          console.log("✅ [LumizleView] Résultat sauvegardé dans Supabase");
        }
      }
    } catch (e) {
      console.error("❌ [LumizleView] Supabase save exception:", e);
    }
  }
});

onMounted(() => {
  const pending = navStore.consumePendingPuzzle();
  if (pending?.type === "lumizle-practice") {
    lumizleInitPracticePuzzle(pending.data.puzzle, pending.data.id);
  } else {
    initDailyPuzzle();
  }
});
</script>

<style scoped>
.app-main {
  flex: 1;
  padding: 1.5rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loading {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-text-soft);
}
.spinner {
  width: 44px;
  height: 44px;
  margin: 0 auto 1rem;
  border: 4px solid var(--color-primary-bg);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.error-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-error);
}

.game-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.timer-display {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--color-primary);
  padding: 0.5rem 1.25rem;
  background: var(--color-primary-bg);
  border: 2px solid var(--color-primary-light);
  border-radius: 999px;
  transition: all 0.3s ease;
}
.timer-icon {
  font-size: 1rem;
}
.timer-value {
  font-variant-numeric: tabular-nums;
}
.timer-display.timer-paused {
  color: var(--color-warning);
  border-color: var(--color-warning);
  background: #fff8f0;
  animation: blink 1.5s ease-in-out infinite;
}
.timer-display.timer-won {
  color: var(--color-success);
  border-color: var(--color-success);
  background: var(--color-success-light);
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.65;
  }
}

.btn-pause {
  padding: 0.5rem 1.1rem;
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-pause:hover {
  background: var(--color-primary);
  color: white;
}
.btn-pause--active {
  background: var(--gradient-success);
  border-color: var(--color-success);
  color: white;
}

.victory-card {
  width: 100%;
  background: var(--gradient-success);
  color: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  text-align: center;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-md);
}
.victory-confetti {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.victory-card h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}
.victory-card > p {
  opacity: 0.9;
  margin-bottom: 1rem;
}
.victory-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 0.75rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.stat-label {
  font-size: 0.8rem;
  opacity: 0.85;
  font-weight: 600;
  text-transform: uppercase;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.victory-slide-enter-active {
  animation: slideDown 0.5s ease;
}
.victory-slide-leave-active {
  animation: slideUpFade 0.3s ease forwards;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideUpFade {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-12px);
  }
}

.grid-blurred {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
}
.pause-modal {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 44, 58, 0.35);
}
.pause-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: 2.5rem 3rem;
  text-align: center;
  box-shadow: 0 16px 48px rgba(44, 44, 58, 0.2);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pause-content h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}
.pause-timer {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-warning);
  margin-bottom: 1.5rem;
  font-variant-numeric: tabular-nums;
}
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.lumizle-play-area {
  width: 100%;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  max-width: 820px;
  transition: filter 0.3s ease;
}
.lumizle-grid-area {
  flex: 1 1 0;
  min-width: 0;
}
.lumizle-rules-area {
  flex: 0 0 200px;
  min-width: 160px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  width: 100%;
}
.btn {
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.btn-secondary {
  background: var(--color-bg-muted);
  color: var(--color-text-soft);
  border: 1.5px solid var(--color-border);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
  color: var(--color-text);
  transform: translateY(-1px);
}

@media (max-width: 680px) {
  .lumizle-play-area {
    flex-direction: column;
    align-items: stretch;
  }
  .lumizle-rules-area {
    flex: none;
  }
}
@media (max-width: 600px) {
  .app-main {
    padding: 1rem 0.75rem 1.5rem;
  }
  .actions {
    gap: 0.5rem;
  }
  .btn {
    padding: 0.65rem 1.1rem;
    font-size: 0.9rem;
  }
}
</style>
