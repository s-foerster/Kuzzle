<template>
  <main class="landing-main">
    <!-- Hero -->
    <section class="landing-hero">
      <p class="landing-tagline">Un nouveau puzzle chaque jour</p>
    </section>

    <!-- Cartes des jeux -->
    <section class="games-section">
      <div class="games-grid">
        <div class="game-card" @click="goToGame">
          <div class="game-card-icon">❤️</div>
          <div class="game-card-body">
            <h3>Puzzle Cœurs</h3>
            <p>Placez les cœurs selon les règles. Grille du {{ formattedToday }}</p>
            <div class="game-card-badge">Quotidien</div>
          </div>
          <div class="game-card-arrow">›</div>
        </div>

        <div class="game-card" @click="goToLumizle">
          <div class="game-card-icon">🔷</div>
          <div class="game-card-body">
            <h3>Lumizle</h3>
            <p>Colorez les cellules claires et sombres. Grille du {{ formattedToday }}</p>
            <div class="game-card-badge">Quotidien</div>
          </div>
          <div class="game-card-arrow">›</div>
        </div>
      </div>
    </section>

    <!-- Comment jouer + Practice Hearts -->
    <section class="how-section">
      <div class="how-inner">
        <div class="how-title-row">
          <h2 class="how-title">Comment jouer</h2>
          <button class="btn-lesson" @click="emit('openTutorial')">
            📖 Leçon interactive
          </button>
        </div>

        <div class="how-rules-wrapper">
          <HowToPlayRules />
        </div>

        <!-- Practice Hearts -->
        <div class="practice-section">
          <h3 class="practice-title">Niveaux d'entraînement</h3>
          <p class="practice-subtitle">Entraînez-vous avant le puzzle du jour</p>
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
                <span v-if="completedLevels.includes(level.id)" class="practice-done">✓</span>
              </div>
              <div class="practice-card-name">{{ level.name }}</div>
              <div class="practice-card-size">Grille {{ level.gridSize }}×{{ level.gridSize }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Practice Lumizle -->
    <section class="lumizle-section">
      <div class="lumizle-inner">
        <h3 class="practice-title">Lumizle — Niveaux d'entraînement</h3>
        <p class="practice-subtitle">Pratiquez les puzzles de coloriage noir/blanc</p>
        <div class="practice-grid">
          <div
            v-for="level in lumizlePracticeLevels"
            :key="level.id"
            class="practice-card"
            :class="`practice-card--${level.difficulty}`"
            @click="startLumizlePractice(level)"
          >
            <div class="practice-card-header">
              <span class="practice-diff-label">{{ level.label }}</span>
              <span v-if="lumizleCompletedLevels.includes(level.id)" class="practice-done">✓</span>
            </div>
            <div class="practice-card-name">{{ level.name }}</div>
            <div class="practice-card-size">
              Grille {{ level.puzzle.metadata.gridSize }}×{{ level.puzzle.metadata.gridSize }}
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
          <button v-if="!newsletterSubmitted" type="submit" class="btn btn-primary">
            S'inscrire
          </button>
          <p v-else class="newsletter-confirm">✉️ Merci ! Vous serez notifié.</p>
        </form>
      </div>
    </section>

    <footer class="app-footer">
      <p>Un nouveau puzzle chaque jour — revenez demain !</p>
    </footer>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HowToPlayRules from '../components/HowToPlay/HowToPlayRules.vue'
import { useNavigationStore } from '../stores/navigation.js'
import practicePuzzlesData  from '../../practice-puzzles.json'
import lumizlePuzzlesData   from '../data/lumizle-puzzles.json'

const emit   = defineEmits(['openTutorial'])
const router = useRouter()
const navStore = useNavigationStore()

// ── Date d'aujourd'hui (format FR) ──────────────────────────────────────────
const formattedToday = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)

// ── Navigation ───────────────────────────────────────────────────────────────
function goToGame() {
  router.push('/game')
}

function goToLumizle() {
  router.push('/lumizle')
}

// ── Niveaux practice Hearts ──────────────────────────────────────────────────
const PRACTICE_KEEP = ['easy_2', 'medium_1', 'medium_3', 'hard_1', 'hard_2', 'hard_3']
const PRACTICE_LABELS = [
  { label: 'Facile', name: 'Niveau 1' },
  { label: 'Facile', name: 'Niveau 2' },
  { label: 'Moyen',  name: 'Niveau 1' },
  { label: 'Moyen',  name: 'Niveau 2' },
  { label: 'Difficile', name: 'Niveau 1' },
  { label: 'Difficile', name: 'Niveau 2' },
]
const practiceLevels = practicePuzzlesData
  .filter(p => PRACTICE_KEEP.includes(p.id))
  .sort((a, b) => PRACTICE_KEEP.indexOf(a.id) - PRACTICE_KEEP.indexOf(b.id))
  .map((p, i) => ({ ...p, ...PRACTICE_LABELS[i] }))

const completedLevels = ref(
  JSON.parse(localStorage.getItem('hearts-completed-levels') || '[]')
)

function startPractice(level) {
  navStore.setPendingPuzzle('practice', level)
  router.push('/game')
}

// ── Niveaux practice Lumizle ─────────────────────────────────────────────────
const LUMIZLE_PRACTICE_KEEP = ['easy_1', 'easy_2', 'easy_3', 'medium_1', 'medium_2', 'medium_3']
const LUMIZLE_LABELS_MAP = {
  easy_1:   { label: 'Facile', name: 'Niveau 1' },
  easy_2:   { label: 'Facile', name: 'Niveau 2' },
  easy_3:   { label: 'Facile', name: 'Niveau 3' },
  medium_1: { label: 'Moyen',  name: 'Niveau 1' },
  medium_2: { label: 'Moyen',  name: 'Niveau 2' },
  medium_3: { label: 'Moyen',  name: 'Niveau 3' },
}
const lumizlePracticeLevels = LUMIZLE_PRACTICE_KEEP
  .map(id => {
    const entry = lumizlePuzzlesData[id]
    return entry ? { ...entry, ...LUMIZLE_LABELS_MAP[id] } : null
  })
  .filter(Boolean)

const lumizleCompletedLevels = ref(
  JSON.parse(localStorage.getItem('lumizle-completed-levels') || '[]')
)

function startLumizlePractice(entry) {
  navStore.setPendingPuzzle('lumizle-practice', { puzzle: entry.puzzle, id: entry.id })
  router.push('/lumizle')
}

// ── Newsletter ───────────────────────────────────────────────────────────────
const newsletterEmail     = ref('')
const newsletterSubmitted = ref(!!localStorage.getItem('newsletterEmail'))
function submitNewsletter() {
  if (!newsletterEmail.value) return
  localStorage.setItem('newsletterEmail', newsletterEmail.value)
  newsletterSubmitted.value = true
}

// Relire les niveaux complétés depuis localStorage à chaque montage
// (ex: retour depuis /game après une victoire)
onMounted(() => {
  completedLevels.value = JSON.parse(
    localStorage.getItem('hearts-completed-levels') || '[]'
  )
  lumizleCompletedLevels.value = JSON.parse(
    localStorage.getItem('lumizle-completed-levels') || '[]'
  )
})
</script>

<style scoped>
/* ── Landing ── */
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

/* ── Games section ── */
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
.game-card-icon { font-size: 2rem; flex-shrink: 0; }
.game-card-body { flex: 1; }
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
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-light);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}
.game-card-arrow {
  font-size: 1.5rem;
  color: var(--color-text-soft);
  flex-shrink: 0;
}

/* ── How to play ── */
.how-section {
  background: var(--color-primary-bg);
  border-top: 1.5px solid var(--color-border);
  padding: 2rem 1.5rem;
  flex: 1;
}
.how-inner { max-width: 700px; margin: 0 auto; }
.how-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  margin-bottom: 0;
  text-align: center;
}
.how-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.btn-lesson {
  background: linear-gradient(135deg, #fff0f2 0%, #ffe4e9 100%);
  border: 1.5px solid #e05a6e55;
  color: #b03050;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: var(--font-family);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}
.btn-lesson:hover {
  background: linear-gradient(135deg, #ffe4e9 0%, #ffd0d8 100%);
  box-shadow: 0 2px 8px rgba(176, 48, 80, 0.15);
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

/* ── Practice ── */
.practice-section { margin-top: 0.5rem; }
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
.practice-card--easy   { border-left: 3px solid var(--color-success); }
.practice-card--medium { border-left: 3px solid var(--color-warning); }
.practice-card--hard   { border-left: 3px solid var(--color-error); }
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
.practice-done { color: var(--color-success); font-weight: 800; font-size: 0.9rem; }
.practice-card-name { font-size: 0.88rem; font-weight: 700; color: var(--color-text); }
.practice-card-size { font-size: 0.75rem; color: var(--color-text-soft); }

/* ── Lumizle section ── */
.lumizle-section {
  background: var(--color-bg-muted);
  border-top: 1.5px solid var(--color-border);
  padding: 1.5rem;
}
.lumizle-inner { max-width: 700px; margin: 0 auto; }

/* ── Newsletter ── */
.newsletter-section {
  background: var(--color-bg-muted);
  border-top: 1.5px solid var(--color-border);
  padding: 1.5rem;
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
.newsletter-text p { font-size: 0.85rem; color: var(--color-text-soft); }
.newsletter-form { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
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
.newsletter-input:focus { border-color: var(--color-primary); }
.newsletter-confirm { color: var(--color-success); font-weight: 700; font-size: 0.95rem; }

/* ── Boutons ── */
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
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

/* ── Footer ── */
.app-footer {
  background: var(--color-bg-muted);
  padding: 1.25rem;
  text-align: center;
  color: var(--color-text-soft);
  font-size: 0.85rem;
  border-top: 1px solid var(--color-border);
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .newsletter-inner { flex-direction: column; text-align: center; }
  .newsletter-form  { justify-content: center; width: 100%; }
  .newsletter-input { width: 100%; max-width: 280px; }
}
@media (max-width: 480px) {
  .practice-grid { grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .practice-card { padding: 0.6rem 0.5rem; }
}
@media (max-width: 380px) {
  .practice-grid { grid-template-columns: 1fr 1fr; }
}
</style>
