<template>
  <main class="app-main">
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
        <div class="timer-display" :class="{ 'timer-paused': isPaused, 'timer-won': isWon }">
          <span class="timer-icon">⏱</span>
          <span class="timer-value">{{ formattedTime }}</span>
        </div>
        <button
          v-if="isTimerStarted && !isWon"
          @click="togglePause"
          class="btn-pause"
          :class="{ 'btn-pause--active': isPaused }"
        >
          {{ isPaused ? '▶ Reprendre' : '⏸ Pause' }}
        </button>
      </div>

      <!-- Victoire -->
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
          <div v-if="verifyCount === 0" class="perfect-badge">🏆 Perfect Game !</div>
        </div>
      </Transition>

      <!-- Pause -->
      <Transition name="modal-fade">
        <div v-if="isPaused" class="pause-modal" @click.self="togglePause">
          <div class="pause-content">
            <h2>⏸ Pause</h2>
            <div class="pause-timer">{{ formattedTime }}</div>
            <button @click="togglePause" class="btn btn-primary">▶ Reprendre</button>
          </div>
        </div>
      </Transition>

      <!-- Calendrier 30 jours -->
      <div v-if="!isPracticeMode" class="archive-calendar-wrap">
        <div class="archive-calendar" ref="calendarRef">
          <button
            v-for="day in last30Days"
            :key="day.dateKey"
            class="cal-day"
            :class="{
              'cal-day--active': currentArchiveDate === day.dateKey,
              'cal-day--today':  day.isToday,
              'cal-day--done':   completedLevels.includes(day.dateKey),
            }"
            @click="loadArchiveDay(day)"
          >
            <span class="cal-weekday">{{ day.weekday }}</span>
            <span class="cal-num">{{ day.dayNum }}</span>
            <span v-if="completedLevels.includes(day.dateKey)" class="cal-done-badge">✓</span>
          </button>
        </div>
      </div>

      <!-- Grille -->
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

      <!-- Message vérification -->
      <Transition name="check-pop">
        <div
          v-if="checkResult"
          class="check-message"
          :class="checkResult.isCorrect ? 'check-correct' : 'check-error'"
        >
          {{ checkResult.isCorrect ? '✅ Correct !' : '❌ Incorrect' }}
        </div>
      </Transition>

      <!-- Actions -->
      <div class="actions">
        <button @click="checkErrors" class="btn btn-primary" :disabled="isWon">Vérifier</button>
        <button
          @click="undo"
          class="btn btn-secondary"
          :disabled="undoHistory.length === 0 || isWon"
          title="Annuler le dernier coup"
        >&#x21A9;</button>
        <button @click="resetGameState" class="btn btn-secondary">🔄</button>
      </div>
    </div>

    <!-- Modal Comment jouer -->
    <HowToPlayModal :is-open="isHowToPlayOpen" @close="closeHowToPlay" />
  </main>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GameGrid      from '../components/GameGrid.vue'
import HowToPlayModal from '../components/HowToPlay/HowToPlayModal.vue'
import { useGame }   from '../composables/useGame.js'
import { useNavigationStore } from '../stores/navigation.js'
import { useAuthStore }       from '../stores/auth.js'
import puzzleCacheData from '../../puzzle-cache.json'

const router    = useRouter()
const navStore  = useNavigationStore()
const authStore = useAuthStore()

// ── Composable jeu ───────────────────────────────────────────────────────────
const {
  gameState, puzzle, isWon, isLoading, error, formattedDate, currentDate,
  checkResult, isPaused, isTimerStarted, formattedTime, verifyCount,
  elapsedTime,
  initPuzzle, initPracticePuzzle,
  handleCellClick, handleCellDrag,
  resetGameState, undo, undoHistory, checkErrors, fillWithSolution, togglePause,
} = useGame()

// ── Mode practice ────────────────────────────────────────────────────────────
const isPracticeMode = ref(false)

// ── Comment jouer ────────────────────────────────────────────────────────────
const isHowToPlayOpen = ref(false)
function closeHowToPlay() {
  localStorage.setItem('howToPlaySeen', 'true')
  isHowToPlayOpen.value = false
}

// Exposer pour le header de App.vue via provide/inject
defineExpose({ openHowToPlay: () => { isHowToPlayOpen.value = true } })

// ── Calendrier ───────────────────────────────────────────────────────────────
function getDateKey(d) {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getLast30Days() {
  const days  = []
  const today = new Date()
  for (let i = 0; i <= 29; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const isToday = i === 0
    days.push({
      dateKey: getDateKey(d),
      weekday: isToday
        ? 'Auj'
        : d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').slice(0, 3),
      dayNum:  String(d.getDate()).padStart(2, '0'),
      isToday,
    })
  }
  return days
}

const last30Days         = getLast30Days()
const todayKey           = getDateKey(new Date())
const currentArchiveDate = ref(todayKey)
const calendarRef        = ref(null)

function loadArchiveDay(day) {
  currentArchiveDate.value = day.dateKey
  if (day.isToday) { initPuzzle(); return }
  const entry = puzzleCacheData[day.dateKey]
  if (!entry) return
  isPracticeMode.value = true
  initPracticePuzzle({
    id:       day.dateKey,
    zones:    entry.puzzle.zones,
    solution: entry.puzzle.solution,
    metadata: entry.metadata || {},
  })
}

// ── Niveaux complétés (Hearts) ───────────────────────────────────────────────
const completedLevels = ref(
  JSON.parse(localStorage.getItem('hearts-completed-levels') || '[]')
)

const currentLevelId = computed(() => {
  if (!currentDate.value) return null
  if (currentDate.value.startsWith('practice_')) {
    return currentDate.value.replace('practice_', '')
  }
  if (/^\d{8}$/.test(currentDate.value)) {
    return `${currentDate.value.slice(0, 4)}-${currentDate.value.slice(4, 6)}-${currentDate.value.slice(6, 8)}`
  }
  return currentDate.value
})

const isCurrentLevelCompleted = computed(
  () => !!currentLevelId.value && completedLevels.value.includes(currentLevelId.value)
)

function checkAndFillIfCompleted() {
  nextTick(() => {
    if (isCurrentLevelCompleted.value && !isWon.value) fillWithSolution()
  })
}
watch(puzzle,      p  => { if (p) checkAndFillIfCompleted() })
watch(currentDate, checkAndFillIfCompleted)

// Sauvegarder dans localStorage + Supabase à la victoire
watch(isWon, async (won) => {
  if (!won || !currentDate.value) return

  // Construire l'ID du niveau
  let completedId
  if (currentDate.value.startsWith('practice_')) {
    completedId = currentDate.value.replace('practice_', '')
  } else if (/^\d{8}$/.test(currentDate.value)) {
    completedId = `${currentDate.value.slice(0, 4)}-${currentDate.value.slice(4, 6)}-${currentDate.value.slice(6, 8)}`
  } else {
    completedId = currentDate.value
  }

  // localStorage (toujours)
  if (!completedLevels.value.includes(completedId)) {
    completedLevels.value.push(completedId)
    localStorage.setItem('hearts-completed-levels', JSON.stringify(completedLevels.value))
  }

  // Supabase (si connecté et puzzle quotidien)
  if (authStore.isLoggedIn && !currentDate.value.startsWith('practice_')) {
    try {
      const { supabase } = await import('../lib/supabase.js')
      if (supabase) {
        await supabase.from('game_results').upsert({
          user_id:      authStore.user.id,
          game_type:    'hearts',
          puzzle_date:  completedId,
          completed:    true,
          time_seconds: elapsedTime.value,
          verify_count: verifyCount.value,
        }, { onConflict: 'user_id,game_type,puzzle_date' })
      }
    } catch (e) {
      console.warn('[GameView] Supabase save error:', e)
    }
  }
})

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  const pending = navStore.consumePendingPuzzle()
  if (pending?.type === 'practice') {
    isPracticeMode.value = true
    initPracticePuzzle(pending.data)
  } else {
    isPracticeMode.value = false
    currentArchiveDate.value = todayKey
    initPuzzle()
  }
})
</script>

<style scoped>
.app-main {
  flex: 1;
  padding: 1.5rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading { text-align: center; padding: 4rem 0; color: var(--color-text-soft); }
.spinner {
  width: 44px; height: 44px;
  margin: 0 auto 1rem;
  border: 4px solid var(--color-primary-bg);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-message { text-align: center; padding: 2rem; color: var(--color-error); }

.game-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Date */
.date-display { text-align: center; margin-bottom: 0.75rem; }
.date-display p {
  font-size: 0.95rem; font-weight: 600;
  color: var(--color-text-soft); text-transform: capitalize;
}

/* Timer */
.timer-row {
  display: flex; align-items: center;
  justify-content: center; gap: 0.75rem;
  margin-bottom: 1rem;
}
.timer-display {
  display: flex; align-items: center; gap: 0.4rem;
  font-weight: 700; font-size: 1.4rem; color: var(--color-primary);
  padding: 0.5rem 1.25rem;
  background: var(--color-primary-bg);
  border: 2px solid var(--color-primary-light);
  border-radius: 999px;
  transition: all 0.3s ease;
}
.timer-icon { font-size: 1rem; }
.timer-value { font-variant-numeric: tabular-nums; }
.timer-display.timer-paused {
  color: var(--color-warning); border-color: var(--color-warning);
  background: #fff8f0; animation: blink 1.5s ease-in-out infinite;
}
.timer-display.timer-won {
  color: var(--color-success); border-color: var(--color-success);
  background: var(--color-success-light);
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.65; } }

.btn-pause {
  padding: 0.5rem 1.1rem;
  border: 2px solid var(--color-primary);
  background: transparent; color: var(--color-primary);
  font-family: var(--font-family); font-size: 0.9rem; font-weight: 700;
  border-radius: 999px; cursor: pointer; transition: all 0.2s;
}
.btn-pause:hover { background: var(--color-primary); color: white; }
.btn-pause--active { background: var(--gradient-success); border-color: var(--color-success); color: white; }

/* Victory */
.victory-card {
  width: 100%; background: var(--gradient-success);
  color: white; padding: 1.5rem; border-radius: var(--radius-lg);
  text-align: center; margin-bottom: 1rem; box-shadow: var(--shadow-md);
}
.victory-confetti { font-size: 2.5rem; margin-bottom: 0.5rem; }
.victory-card h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem; }
.victory-card > p { opacity: 0.9; margin-bottom: 1rem; }
.victory-stats { display: flex; justify-content: center; gap: 2rem; margin-bottom: 0.75rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
.stat-label { font-size: 0.8rem; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
.stat-value { font-size: 1.5rem; font-weight: 800; font-variant-numeric: tabular-nums; }
.perfect-badge {
  display: inline-block; background: rgba(255,255,255,0.25);
  padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.95rem; font-weight: 700;
}
.victory-slide-enter-active { animation: slideDown 0.5s ease; }
.victory-slide-leave-active { animation: slideUpFade 0.3s ease forwards; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUpFade { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-12px); } }

/* Pause modal */
.grid-wrapper { width: 100%; position: relative; transition: filter 0.3s ease; }
.grid-blurred { filter: blur(6px); pointer-events: none; user-select: none; }
.pause-modal {
  position: fixed; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  background: rgba(44, 44, 58, 0.35);
}
.pause-content {
  background: var(--color-bg-card); border-radius: var(--radius-xl);
  padding: 2.5rem 3rem; text-align: center;
  box-shadow: 0 16px 48px rgba(44, 44, 58, 0.2);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pause-content h2 { font-size: 1.8rem; font-weight: 800; color: var(--color-text); margin-bottom: 0.75rem; }
.pause-timer { font-size: 3.5rem; font-weight: 800; color: var(--color-warning); margin-bottom: 1.5rem; font-variant-numeric: tabular-nums; }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Calendar */
.archive-calendar-wrap {
  width: 100%; overflow-x: auto; margin-bottom: 0.75rem;
  scrollbar-width: none; -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
}
.archive-calendar-wrap::-webkit-scrollbar { display: none; }
.archive-calendar {
  display: inline-flex; gap: 0;
  background: var(--color-bg-muted, #f5f0f1);
  border: 1.5px solid var(--color-border);
  border-radius: calc(var(--radius-md) + 2px);
  padding: 3px; min-width: max-content;
}
.cal-day {
  display: flex; flex-direction: column; align-items: center; gap: 0.1rem;
  background: transparent; border: none; border-radius: var(--radius-md);
  padding: 0.3rem 0.45rem; cursor: pointer; min-width: 36px;
  font-family: var(--font-family); transition: background 0.15s;
}
.cal-day:hover { background: rgba(0,0,0,0.05); }
.cal-day--active { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
.cal-day--today.cal-day--active .cal-weekday,
.cal-day--today.cal-day--active .cal-num { color: var(--color-primary); }
.cal-weekday { font-size: 0.6rem; text-transform: uppercase; color: var(--color-text-soft); font-weight: 700; }
.cal-num { font-size: 0.95rem; font-weight: 800; color: var(--color-text); line-height: 1; }
.cal-day--done .cal-num { color: var(--color-success); }
.cal-done-badge { font-size: 0.55rem; font-weight: 900; color: var(--color-success); }

/* Check message */
.check-message {
  margin: 0.75rem 0; padding: 0.7rem 1.5rem;
  border-radius: 999px; font-size: 1rem; font-weight: 700; text-align: center;
}
.check-correct { background: var(--color-success-light); color: var(--color-success); border: 2px solid var(--color-success); }
.check-error   { background: var(--color-error-light);   color: var(--color-error);   border: 2px solid var(--color-error);   }
.check-pop-enter-active { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.check-pop-leave-active { transition: opacity 0.3s ease; }
.check-pop-leave-to { opacity: 0; }

/* Boutons */
.actions {
  display: flex; justify-content: center;
  gap: 0.75rem; flex-wrap: wrap;
  margin-top: 0.75rem; width: 100%;
}
.btn {
  padding: 0.7rem 1.4rem; border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: var(--gradient-primary); color: white; box-shadow: var(--shadow-sm); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn-secondary {
  background: var(--color-bg-muted); color: var(--color-text-soft);
  border: 1.5px solid var(--color-border);
}
.btn-secondary:hover:not(:disabled) { background: var(--color-border); color: var(--color-text); transform: translateY(-1px); }

@media (max-width: 600px) {
  .app-main { padding: 1rem 0.75rem 1.5rem; }
  .game-container { max-width: 100%; }
  .pause-content { padding: 2rem 1.5rem; border-radius: var(--radius-lg); margin: 1rem; }
  .pause-timer { font-size: 2.8rem; }
  .actions { gap: 0.5rem; }
  .btn { padding: 0.65rem 1.1rem; font-size: 0.9rem; }
  .victory-stats { gap: 1.5rem; }
}
@media (max-width: 380px) {
  .timer-display { font-size: 1.2rem; padding: 0.4rem 1rem; }
  .actions { flex-direction: column; align-items: center; }
  .btn { width: 100%; max-width: 280px; }
}
</style>
