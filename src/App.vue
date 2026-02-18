<template>
  <div id="app">
    <!-- ===== HEADER ===== -->
    <header class="app-header">
      <div class="header-inner">
        <button
          v-if="view === 'game'"
          class="btn-back"
          @click="view = 'landing'"
          title="Retour"
        >
          ← Retour
        </button>
        <div
          class="header-brand"
          :class="{ 'brand-centered': view === 'landing' }"
        >
          <img
            src="./assets/kuzzle_logo.png"
            alt="Kuzzle"
            class="header-logo"
          />
          <h1 class="brand-title">Kuzzle</h1>
        </div>
        <div class="header-actions">
          <button
            v-if="view === 'game'"
            class="btn-icon"
            @click="isHowToPlayOpen = true"
            title="Comment jouer"
          >
            ?
          </button>
          <div v-else class="header-actions-spacer"></div>
        </div>
      </div>
    </header>

    <!-- ===== LANDING PAGE ===== -->
    <main v-if="view === 'landing'" class="landing-main">
      <!-- Hero -->
      <section class="landing-hero">
        <p class="landing-tagline">Un nouveau puzzle chaque jour</p>
      </section>

      <!-- Carte du jeu -->
      <section class="games-section">
        <div class="games-grid">
          <div class="game-card" @click="startGame">
            <div class="game-card-icon">❤️</div>
            <div class="game-card-body">
              <h3>Puzzle Cœurs</h3>
              <p>
                Placez les cœurs selon les règles. Grille du {{ formattedDate }}
              </p>
              <div class="game-card-badge">Quotidien</div>
            </div>
            <div class="game-card-arrow">›</div>
          </div>
          <!-- Futurs jeux (placeholder) -->
          <div class="game-card game-card--soon">
            <div class="game-card-icon">🔷</div>
            <div class="game-card-body">
              <h3>Prochain jeu</h3>
              <p>Bientôt disponible…</p>
            </div>
            <div class="game-card-badge game-card-badge--soon">Bientôt</div>
          </div>
        </div>
      </section>

      <!-- Section Comment jouer + Practice -->
      <section class="how-section">
        <div class="how-inner">
          <h2 class="how-title">Comment jouer</h2>

          <!-- Animations identiques à la popup -->
          <div class="how-rules-wrapper">
            <HowToPlayRules />
          </div>

          <!-- Practice collections -->
          <div class="practice-section">
            <h3 class="practice-title">Niveaux d'entraînement</h3>
            <p class="practice-subtitle">
              Entraînez-vous avant le puzzle du jour
            </p>
            <div class="practice-grid">
              <div
                v-for="level in practiceLevels"
                :key="level.id"
                class="practice-card"
                :class="`practice-card--${level.difficulty}`"
                @click="startPractice(level)"
              >
                <div class="practice-card-header">
                  <span class="practice-diff-label">{{ level.label }}</span>
                  <span
                    v-if="completedLevels.includes(level.id)"
                    class="practice-done"
                    >✓</span
                  >
                </div>
                <div class="practice-card-name">{{ level.name }}</div>
                <div class="practice-card-size">
                  Grille {{ level.gridSize }}×{{ level.gridSize }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="newsletter-section">
        <div class="newsletter-inner">
          <div class="newsletter-text">
            <h3>🔔 Rappel quotidien</h3>
            <p>Recevez un rappel chaque jour pour ne pas rater le puzzle !</p>
          </div>
          <form class="newsletter-form" @submit.prevent="submitNewsletter">
            <input
              v-if="!newsletterSubmitted"
              v-model="newsletterEmail"
              type="email"
              placeholder="votre@email.com"
              class="newsletter-input"
              required
            />
            <button
              v-if="!newsletterSubmitted"
              type="submit"
              class="btn btn-primary"
            >
              S'inscrire
            </button>
            <p v-else class="newsletter-confirm">
              ✉️ Merci ! Vous serez notifié.
            </p>
          </form>
        </div>
      </section>

      <footer class="app-footer">
        <p>Un nouveau puzzle chaque jour — revenez demain !</p>
      </footer>
    </main>

    <!-- ===== VUE JEU ===== -->
    <main v-else class="app-main">
      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Chargement du puzzle…</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="error-message">
        <p>❌ Erreur : {{ error }}</p>
        <button @click="initPuzzle()" class="btn btn-primary">Réessayer</button>
      </div>

      <!-- Jeu -->
      <div v-else-if="puzzle" class="game-container">
        <!-- Date -->
        <div class="date-display">
          <p>{{ formattedDate }}</p>
        </div>

        <!-- Timer -->
        <div class="timer-row">
          <div
            class="timer-display"
            :class="{ 'timer-paused': isPaused, 'timer-won': isWon }"
          >
            <span class="timer-icon">⏱</span>
            <span class="timer-value">{{ formattedTime }}</span>
          </div>
          <button
            v-if="isTimerStarted && !isWon"
            @click="togglePause"
            class="btn-pause"
            :class="{ 'btn-pause--active': isPaused }"
          >
            {{ isPaused ? "▶ Reprendre" : "⏸ Pause" }}
          </button>
        </div>

        <!-- Message de victoire -->
        <Transition name="victory-slide">
          <div v-if="isWon" class="victory-card">
            <div class="victory-confetti">🎉</div>
            <h2>Félicitations&nbsp;!</h2>
            <p>Vous avez résolu le puzzle du jour !</p>
            <div class="victory-stats">
              <div class="stat-item">
                <span class="stat-label">⏱ Temps</span>
                <span class="stat-value">{{ formattedTime }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">🔍 Vérifications</span>
                <span class="stat-value">{{ verifyCount }}</span>
              </div>
            </div>
            <div v-if="verifyCount === 0" class="perfect-badge">
              🏆 Perfect Game !
            </div>
          </div>
        </Transition>

        <!-- Popup Pause -->
        <Transition name="modal-fade">
          <div v-if="isPaused" class="pause-modal" @click.self="togglePause">
            <div class="pause-content">
              <h2>⏸ Pause</h2>
              <div class="pause-timer">{{ formattedTime }}</div>
              <button @click="togglePause" class="btn btn-primary">
                ▶ Reprendre
              </button>
            </div>
          </div>
        </Transition>

        <!-- Calendrier 7 derniers jours -->
        <div v-if="!isPracticeMode" class="archive-calendar">
          <button
            v-for="day in last7Days"
            :key="day.dateKey"
            class="cal-day"
            :class="{
              'cal-day--active': currentArchiveDate === day.dateKey,
              'cal-day--today': day.isToday,
            }"
            @click="loadArchiveDay(day)"
          >
            <span class="cal-weekday">{{ day.weekday }}</span>
            <span class="cal-num">{{ day.dayNum }}</span>
          </button>
        </div>

        <!-- Grille de jeu -->
        <div class="grid-wrapper" :class="{ 'grid-blurred': isPaused }">
          <GameGrid
            :game-state="gameState"
            :zones="puzzle.zones"
            :solution="puzzle.solution"
            :show-solution="false"
            :grid-size="puzzle.zones.length"
            :is-won="isWon"
            @cell-click="handleCellClick"
            @cell-drag="handleCellDrag"
          />
        </div>

        <!-- Message de vérification (binaire) -->
        <Transition name="check-pop">
          <div
            v-if="checkResult"
            class="check-message"
            :class="checkResult.isCorrect ? 'check-correct' : 'check-error'"
          >
            {{ checkResult.isCorrect ? "✅ Correct !" : "❌ Incorrect" }}
          </div>
        </Transition>

        <!-- Boutons d'action -->
        <div class="actions">
          <button
            @click="checkErrors"
            class="btn btn-primary"
            :disabled="isWon"
          >
            Vérifier
          </button>
          <button
            @click="undo"
            class="btn btn-secondary"
            :disabled="undoHistory.length === 0 || isWon"
            title="Annuler le dernier coup"
          >
            &#x21A9;
          </button>
          <button @click="resetGameState" class="btn btn-secondary">🔄</button>
        </div>
      </div>
    </main>

    <!-- Modal Comment jouer (pendant le jeu) -->
    <HowToPlayModal :is-open="isHowToPlayOpen" @close="closeHowToPlay" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import GameGrid from "./components/GameGrid.vue";
import HowToPlayModal from "./components/HowToPlay/HowToPlayModal.vue";
import HowToPlayRules from "./components/HowToPlay/HowToPlayRules.vue";
import { useGame } from "./composables/useGame.js";
import practicePuzzlesData from "../practice-puzzles.json";
import puzzleCacheData from "../puzzle-cache.json";

// ===== Navigation =====
const view = ref("landing"); // 'landing' | 'game'
const isPracticeMode = ref(false);

const isHowToPlayOpen = ref(false);

const {
  gameState,
  puzzle,
  isWon,
  isLoading,
  error,
  formattedDate,
  checkResult,
  isPaused,
  isTimerStarted,
  formattedTime,
  verifyCount,
  initPuzzle,
  initPracticePuzzle,
  handleCellClick,
  handleCellDrag,
  resetGameState,
  undo,
  undoHistory,
  checkErrors,
  togglePause,
} = useGame();

// ===== 7 derniers jours (depuis puzzle-cache.json) =====
function getDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const isToday = i === 0;
    days.push({
      dateKey: getDateKey(d),
      weekday: isToday
        ? "Auj"
        : d
            .toLocaleDateString("fr-FR", { weekday: "short" })
            .replace(".", "")
            .slice(0, 3),
      dayNum: String(d.getDate()).padStart(2, "0"),
      isToday,
    });
  }
  return days;
}
const last7Days = getLast7Days();
const todayKey = getDateKey(new Date());
const currentArchiveDate = ref(todayKey);

function loadArchiveDay(day) {
  currentArchiveDate.value = day.dateKey;
  if (day.isToday) {
    initPuzzle();
    return;
  }
  const entry = puzzleCacheData[day.dateKey];
  if (!entry) return;
  initPracticePuzzle({
    id: day.dateKey,
    zones: entry.puzzle.zones,
    solution: entry.puzzle.solution,
    metadata: entry.metadata || {},
  });
}

// ===== Landing — niveaux practice =====
const PRACTICE_KEEP = [
  "easy_2",
  "medium_1",
  "medium_3",
  "hard_1",
  "hard_2",
  "hard_3",
];
const PRACTICE_LABELS = [
  { label: "Facile", name: "Niveau 1" },
  { label: "Facile", name: "Niveau 2" },
  { label: "Moyen", name: "Niveau 1" },
  { label: "Moyen", name: "Niveau 2" },
  { label: "Difficile", name: "Niveau 1" },
  { label: "Difficile", name: "Niveau 2" },
];
const practiceLevels = practicePuzzlesData
  .filter((p) => PRACTICE_KEEP.includes(p.id))
  .sort((a, b) => PRACTICE_KEEP.indexOf(a.id) - PRACTICE_KEEP.indexOf(b.id))
  .map((p, i) => ({ ...p, ...PRACTICE_LABELS[i] }));

const completedLevels = ref(
  JSON.parse(localStorage.getItem("hearts-completed-levels") || "[]"),
);

function startGame() {
  currentArchiveDate.value = todayKey;
  isPracticeMode.value = false;
  view.value = "game";
}

function startPractice(level) {
  isPracticeMode.value = true;
  initPracticePuzzle(level);
  view.value = "game";
}

// ===== Newsletter =====
const newsletterEmail = ref("");
const newsletterSubmitted = ref(!!localStorage.getItem("newsletterEmail"));
function submitNewsletter() {
  if (!newsletterEmail.value) return;
  localStorage.setItem("newsletterEmail", newsletterEmail.value);
  newsletterSubmitted.value = true;
}

// ===== Comment jouer (popup, pendant le jeu) =====
function closeHowToPlay() {
  localStorage.setItem("howToPlaySeen", "true");
  isHowToPlayOpen.value = false;
}

onMounted(() => {
  initPuzzle();
});
</script>

<style scoped>
/* ===== HEADER ===== */
.app-header {
  background: #fff;
  color: var(--color-text);
  padding: 0.9rem 1.5rem;
  box-shadow: 0 1px 0 var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-centered {
  /* sur la landing, le brand est naturellement centré via justify-content */
}

.header-logo {
  height: 2rem;
  width: auto;
  display: block;
}

.brand-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  font-family: var(--font-family);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  min-width: 2.5rem;
}

.header-actions-spacer {
  width: 2.5rem;
}

.btn-back {
  background: transparent;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-soft);
  font-family: var(--font-family);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-icon {
  background: var(--color-primary-bg);
  border: 1.5px solid var(--color-primary-light);
  color: var(--color-primary);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-icon:hover {
  background: var(--color-primary);
  color: white;
}

/* ===== LANDING ===== */
.landing-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.landing-hero {
  text-align: center;
  padding: 2rem 1.5rem 0.5rem;
}

.landing-tagline {
  font-size: 1rem;
  color: var(--color-text-soft);
  font-weight: 500;
}

/* ===== GAMES SECTION ===== */
.games-section {
  padding: 1.25rem 1.5rem;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.games-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-card {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.game-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.game-card--soon {
  opacity: 0.5;
  cursor: default;
}
.game-card--soon:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
  border-color: var(--color-border);
}

.game-card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.game-card-body {
  flex: 1;
}
.game-card-body h3 {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
}
.game-card-body p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-soft);
}

.game-card-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-light);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}
.game-card-badge--soon {
  background: var(--color-bg-muted);
  color: var(--color-text-soft);
  border-color: var(--color-border);
}

.game-card-arrow {
  font-size: 1.5rem;
  color: var(--color-text-soft);
  flex-shrink: 0;
}

/* ===== HOW TO PLAY section (landing, inline) ===== */
.how-section {
  background: var(--color-primary-bg);
  border-top: 1.5px solid var(--color-border);
  padding: 2rem 1.5rem;
  flex: 1;
}

.how-inner {
  max-width: 700px;
  margin: 0 auto;
}

.how-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  margin-bottom: 1.25rem;
  text-align: center;
}

.rules-grid {
  display: none; /* remplacé par HowToPlayRules */
}

.how-rules-wrapper {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1rem;
  margin-bottom: 1.75rem;
  display: flex;
  align-items: stretch;
}

/* ===== PRACTICE ===== */
.practice-section {
  margin-top: 0.5rem;
}

.practice-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.2rem;
}

.practice-subtitle {
  font-size: 0.82rem;
  color: var(--color-text-soft);
  margin-bottom: 0.9rem;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.practice-card {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.practice-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.practice-card--easy {
  border-left: 3px solid var(--color-success);
}
.practice-card--medium {
  border-left: 3px solid var(--color-warning);
}
.practice-card--hard {
  border-left: 3px solid var(--color-error);
}

.practice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.practice-diff-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-soft);
}

.practice-done {
  color: var(--color-success);
  font-weight: 800;
  font-size: 0.9rem;
}

.practice-card-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
}

.practice-card-size {
  font-size: 0.75rem;
  color: var(--color-text-soft);
}

/* ===== APP MAIN (jeu) ===== */
.app-main {
  flex: 1;
  padding: 1.5rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== LOADING / ERROR ===== */
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

/* ===== GAME CONTAINER ===== */
.game-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== DATE ===== */
.date-display {
  text-align: center;
  margin-bottom: 0.75rem;
}
.date-display p {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-soft);
  text-transform: capitalize;
}

/* ===== TIMER ===== */
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
.btn-pause--active:hover {
  opacity: 0.9;
}

/* ===== VICTORY ===== */
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
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.perfect-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
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

/* ===== PAUSE MODAL ===== */
.grid-wrapper {
  width: 100%;
  position: relative;
  transition: filter 0.3s ease;
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

/* ===== CHECK MESSAGE ===== */
.check-message {
  margin: 0.75rem 0;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
}
.check-correct {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 2px solid var(--color-success);
}
.check-error {
  background: var(--color-error-light);
  color: var(--color-error);
  border: 2px solid var(--color-error);
}
.check-pop-enter-active {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.check-pop-leave-active {
  transition: opacity 0.3s ease;
}
.check-pop-leave-to {
  opacity: 0;
}

/* ===== BOUTONS ===== */
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
.btn:disabled:hover {
  transform: none;
  box-shadow: none;
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
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
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

/* ===== CALENDAR (7 derniers jours) ===== */
.archive-calendar {
  display: inline-flex;
  gap: 0;
  justify-content: center;
  margin-bottom: 0.75rem;
  background: var(--color-bg-muted, #f5f0f1);
  border: 1.5px solid var(--color-border);
  border-radius: calc(var(--radius-md) + 2px);
  padding: 3px;
}
.cal-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.3rem 0.45rem;
  cursor: pointer;
  min-width: 36px;
  font-family: var(--font-family);
  transition: background 0.15s;
}
.cal-day:hover {
  background: rgba(0, 0, 0, 0.05);
}
.cal-day--active {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
.cal-day--today.cal-day--active .cal-weekday {
  color: var(--color-primary);
}
.cal-day--today.cal-day--active .cal-num {
  color: var(--color-primary);
}
.cal-weekday {
  font-size: 0.6rem;
  text-transform: uppercase;
  color: var(--color-text-soft);
  font-weight: 700;
  letter-spacing: 0.03em;
}
.cal-num {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
}

/* ===== NEWSLETTER ===== */
.newsletter-section {
  background: var(--color-bg-muted);
  border-top: 1.5px solid var(--color-border);
  padding: 1.5rem 1.5rem;
}
.newsletter-inner {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.newsletter-text h3 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  margin-bottom: 0.2rem;
}
.newsletter-text p {
  font-size: 0.85rem;
  color: var(--color-text-soft);
}
.newsletter-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.newsletter-input {
  padding: 0.6rem 1rem;
  border: 1.5px solid var(--color-primary-light);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 0.9rem;
  outline: none;
  width: 200px;
  transition: border-color 0.2s;
  background: white;
  color: var(--color-text);
}
.newsletter-input:focus {
  border-color: var(--color-primary);
}
.newsletter-confirm {
  color: var(--color-success);
  font-weight: 700;
  font-size: 0.95rem;
}

/* ===== FOOTER ===== */
.app-footer {
  background: var(--color-bg-muted);
  padding: 1.25rem;
  text-align: center;
  color: var(--color-text-soft);
  font-size: 0.85rem;
  border-top: 1px solid var(--color-border);
}

/* ===== MOBILE ===== */
@media (max-width: 600px) {
  .app-main {
    padding: 1rem 0.75rem 1.5rem;
  }
  .how-rules-wrapper {
    padding: 1rem 0.5rem;
  }
  .practice-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .game-container {
    max-width: 100%;
  }
  .pause-content {
    padding: 2rem 1.5rem;
    border-radius: var(--radius-lg);
    margin: 1rem;
  }
  .pause-timer {
    font-size: 2.8rem;
  }
  .actions {
    gap: 0.5rem;
  }
  .btn {
    padding: 0.65rem 1.1rem;
    font-size: 0.9rem;
  }
  .newsletter-inner {
    flex-direction: column;
    text-align: center;
  }
  .newsletter-form {
    justify-content: center;
    width: 100%;
  }
  .newsletter-input {
    width: 100%;
    max-width: 280px;
  }
  .victory-stats {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .practice-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }
  .practice-card {
    padding: 0.6rem 0.5rem;
  }
}

@media (max-width: 380px) {
  .header-logo {
    height: 1.6rem;
  }
  .brand-title {
    font-size: 1.25rem;
  }
  .timer-display {
    font-size: 1.2rem;
    padding: 0.4rem 1rem;
  }
  .actions {
    flex-direction: column;
    align-items: center;
  }
  .btn {
    width: 100%;
    max-width: 280px;
  }
  .practice-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
