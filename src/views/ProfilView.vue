<template>
  <main class="app-main">
    <div class="loading" v-if="!authStore.initialized">
      <div class="spinner"></div>
      <p>Chargement…</p>
    </div>

    <div v-else class="profil-container">
      <!-- Header profil -->
      <div class="profil-header">
        <div class="profil-avatar-lg">
          <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" :alt="authStore.username" />
          <span v-else>{{ initials }}</span>
        </div>
        <div class="profil-info">
          <h1 class="profil-username">{{ authStore.username }}</h1>
          <p class="profil-email">{{ authStore.user?.email }}</p>
          <span v-if="authStore.isPremium" class="premium-badge">⭐ Premium</span>
        </div>
      </div>

      <!-- Modifier le username -->
      <div class="profil-section">
        <h2 class="section-title">Nom d'utilisateur</h2>
        <div class="username-form">
          <input
            v-model="newUsername"
            type="text"
            class="input-field"
            placeholder="Nouveau nom"
            maxlength="20"
            :disabled="savingUsername"
          />
          <button
            class="btn btn-primary btn-sm"
            @click="saveUsername"
            :disabled="savingUsername || !newUsername.trim() || newUsername === authStore.username"
          >
            {{ savingUsername ? '…' : 'Sauvegarder' }}
          </button>
        </div>
        <p v-if="usernameError" class="field-error">{{ usernameError }}</p>
        <p v-if="usernameSuccess" class="field-success">Nom mis à jour !</p>
      </div>

      <!-- Stats -->
      <div class="profil-section">
        <h2 class="section-title">Mes statistiques</h2>
        <div v-if="loadingStats" class="stats-loading">Chargement…</div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-value">{{ stats.totalGames }}</div>
            <div class="stat-card-label">Parties jouées</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value">{{ stats.heartsGames }}</div>
            <div class="stat-card-label">Puzzles Cœurs</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value">{{ stats.lumizleGames }}</div>
            <div class="stat-card-label">Puzzles Lumizle</div>
          </div>
          <div class="stat-card stat-card--highlight">
            <div class="stat-card-value">{{ stats.bestHearts || '—' }}</div>
            <div class="stat-card-label">Meilleur temps Cœurs</div>
          </div>
        </div>
      </div>

      <!-- Historique récent -->
      <div class="profil-section">
        <h2 class="section-title">Historique récent</h2>
        <div v-if="loadingStats" class="stats-loading">Chargement…</div>
        <div v-else-if="recentResults.length === 0" class="empty-state">
          Aucune partie enregistrée pour l'instant. Jouez un puzzle pour commencer !
        </div>
        <div v-else class="results-list">
          <div v-for="r in recentResults" :key="r.id" class="result-row">
            <span class="result-type">{{ r.game_type === 'hearts' ? '❤️' : '🔷' }}</span>
            <span class="result-date">{{ formatDate(r.puzzle_date) }}</span>
            <span class="result-time">{{ formatSeconds(r.time_seconds) }}</span>
            <span v-if="r.verify_count !== null" class="result-verify">
              {{ r.verify_count }} vérif.
            </span>
            <span class="result-done">✓</span>
          </div>
        </div>
      </div>

      <!-- Déconnexion -->
      <div class="profil-actions">
        <button class="btn btn-danger" @click="handleLogout">Se déconnecter</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../lib/supabase.js'

const router    = useRouter()
const authStore = useAuthStore()

// Initiales pour l'avatar (fallback)
const initials = computed(() => {
  const name = authStore.username || authStore.user?.email || '?'
  return name.slice(0, 2).toUpperCase()
})

// ── Username edit ─────────────────────────────────────────────────────────
const newUsername    = ref(authStore.username || '')
const savingUsername = ref(false)
const usernameError  = ref('')
const usernameSuccess= ref(false)

async function saveUsername() {
  usernameError.value  = ''
  usernameSuccess.value= false
  savingUsername.value = true
  const result = await authStore.updateUsername(newUsername.value.trim())
  savingUsername.value = false
  if (result?.error) {
    usernameError.value = result.error
  } else {
    usernameSuccess.value = true
    setTimeout(() => { usernameSuccess.value = false }, 3000)
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────
const loadingStats  = ref(true)
const recentResults = ref([])
const stats = ref({ totalGames: 0, heartsGames: 0, lumizleGames: 0, bestHearts: null })

async function loadStats() {
  if (!supabase || !authStore.user) { loadingStats.value = false; return }
  try {
    const { data } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      recentResults.value = data.slice(0, 10)
      stats.value.totalGames   = data.length
      stats.value.heartsGames  = data.filter(r => r.game_type === 'hearts').length
      stats.value.lumizleGames = data.filter(r => r.game_type === 'lumizle').length
      const heartTimes = data
        .filter(r => r.game_type === 'hearts' && r.time_seconds)
        .map(r => r.time_seconds)
      stats.value.bestHearts = heartTimes.length
        ? formatSeconds(Math.min(...heartTimes))
        : null
    }
  } catch (e) {
    console.warn('[ProfilView] Stats load error:', e)
  } finally {
    loadingStats.value = false
  }
}

// ── Formatters ────────────────────────────────────────────────────────────
function formatSeconds(s) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}
function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
  } catch { return dateStr }
}

// ── Déconnexion ───────────────────────────────────────────────────────────
async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  newUsername.value = authStore.username || ''
  loadStats()
})
</script>

<style scoped>
.app-main {
  flex: 1; padding: 2rem 1.5rem;
  display: flex; flex-direction: column; align-items: center;
}

.loading { text-align: center; padding: 4rem 0; color: var(--color-text-soft); }
.spinner {
  width: 44px; height: 44px; margin: 0 auto 1rem;
  border: 4px solid var(--color-primary-bg); border-top: 4px solid var(--color-primary);
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.profil-container {
  width: 100%; max-width: 600px;
  display: flex; flex-direction: column; gap: 1.75rem;
}

/* ── Header profil ── */
.profil-header {
  display: flex; align-items: center; gap: 1.25rem;
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}
.profil-avatar-lg {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--gradient-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 800; color: white;
  overflow: hidden; flex-shrink: 0;
}
.profil-avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.profil-username {
  font-size: 1.4rem; font-weight: 800; color: var(--color-text); margin: 0 0 0.2rem;
}
.profil-email { font-size: 0.85rem; color: var(--color-text-soft); margin: 0 0 0.4rem; }
.premium-badge {
  display: inline-block; font-size: 0.75rem; font-weight: 700;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white; padding: 0.2rem 0.6rem; border-radius: 999px;
}

/* ── Sections ── */
.profil-section {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
}
.section-title {
  font-size: 0.9rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-soft); margin: 0 0 1rem;
}

/* Username form */
.username-form { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
.input-field {
  flex: 1; min-width: 150px;
  padding: 0.55rem 0.9rem;
  border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.9rem;
  background: var(--color-bg); color: var(--color-text); outline: none;
  transition: border-color 0.2s;
}
.input-field:focus { border-color: var(--color-primary); }
.field-error   { font-size: 0.82rem; color: var(--color-error); margin-top: 0.4rem; }
.field-success { font-size: 0.82rem; color: var(--color-success); margin-top: 0.4rem; }

/* Stats grid */
.stats-loading { color: var(--color-text-soft); font-size: 0.9rem; }
.stats-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;
}
.stat-card {
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-md);
  padding: 1rem; text-align: center;
}
.stat-card--highlight { background: var(--gradient-primary); border: none; color: white; }
.stat-card-value { font-size: 2rem; font-weight: 800; color: var(--color-primary); line-height: 1; }
.stat-card--highlight .stat-card-value { color: white; }
.stat-card-label { font-size: 0.75rem; color: var(--color-text-soft); margin-top: 0.3rem; font-weight: 600; }
.stat-card--highlight .stat-card-label { color: rgba(255,255,255,0.85); }

/* Results list */
.empty-state { font-size: 0.9rem; color: var(--color-text-soft); text-align: center; padding: 1rem 0; }
.results-list { display: flex; flex-direction: column; gap: 0.4rem; }
.result-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  background: var(--color-bg); border-radius: var(--radius-sm);
  font-size: 0.88rem;
}
.result-type  { font-size: 1rem; }
.result-date  { flex: 1; color: var(--color-text); font-weight: 600; }
.result-time  { font-variant-numeric: tabular-nums; color: var(--color-primary); font-weight: 700; }
.result-verify{ color: var(--color-text-soft); font-size: 0.8rem; }
.result-done  { color: var(--color-success); font-weight: 800; }

/* Actions */
.profil-actions { display: flex; justify-content: center; }

/* Boutons */
.btn {
  padding: 0.7rem 1.4rem; border: none; border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-sm { padding: 0.55rem 1rem; font-size: 0.9rem; }
.btn-primary { background: var(--gradient-primary); color: white; box-shadow: var(--shadow-sm); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn-danger {
  background: transparent; color: var(--color-error);
  border: 1.5px solid var(--color-error);
}
.btn-danger:hover { background: var(--color-error-light); }

@media (max-width: 500px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .profil-header { flex-direction: column; text-align: center; }
}
</style>
