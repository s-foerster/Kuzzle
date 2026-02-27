<template>
  <main class="app-main">
    <!-- Chargement initial -->
    <div v-if="!authStore.initialized" class="page-loading">
      <div class="spinner"></div>
      <p>Chargement…</p>
    </div>

    <div v-else class="profil-container">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="profil-header">
        <div class="profil-avatar-lg">
          <img
            v-if="authStore.avatarUrl"
            :src="authStore.avatarUrl"
            :alt="authStore.username"
            referrerpolicy="no-referrer"
          />
          <span v-else>{{ initials }}</span>
        </div>
        <div class="profil-info">
          <h1 class="profil-username">{{ authStore.username }}</h1>
          <p class="profil-email">{{ authStore.user?.email }}</p>
          <span v-if="authStore.isPremium" class="premium-badge">⭐ Premium</span>
        </div>
      </div>

      <!-- ── Pass Premium ─────────────────────────────────────────── -->
      <Transition name="fade">
        <div v-if="paymentSuccess" class="profil-section profil-section--success">
          <div class="success-banner">
            <span class="success-icon">🎉</span>
            <div>
              <p class="success-title">Paiement confirmé ! Bienvenue dans le Pass Premium.</p>
              <p class="success-sub">Toutes vos nouvelles fonctionnalités sont désormais actives.</p>
            </div>
          </div>
        </div>
      </Transition>

      <div class="profil-section profil-section--premium" :class="{ 'profil-section--premium-active': authStore.isPremium }">
        <!-- Non-premium : card de vente -->
        <template v-if="!authStore.isPremium">
          <div class="premium-sell-header">
            <span class="premium-sell-icon">⭐</span>
            <div>
              <h2 class="premium-sell-title">Pass Premium</h2>
              <p class="premium-sell-sub">Débloquez toutes les fonctionnalités — une seule fois.</p>
            </div>
          </div>
          <ul class="premium-features">
            <li>✨ Accès à l’archive complète (tous les puzzles passés)</li>
            <li>💡 Indices illimités</li>
            <li>🎨 Thèmes et couleurs exclusifs</li>
            <li>💛 Soutenir le développement de Kuzzle</li>
          </ul>
          <p v-if="subscriptionError" class="field-error">{{ subscriptionError }}</p>
          <button
            class="btn btn-premium"
            :disabled="subscriptionLoading"
            @click="handleCheckout"
          >
            {{ subscriptionLoading ? 'Chargement…' : 'Obtenir le Pass Premium' }}
          </button>
        </template>

        <!-- Premium actif : gestion -->
        <template v-else>
          <div class="premium-active-content">
            <span class="premium-active-icon">⭐</span>
            <div>
              <h2 class="premium-active-title">Pass Premium actif</h2>
              <p class="premium-active-sub">Merci pour votre soutien ! Vous avez accès à toutes les fonctionnalités.</p>
            </div>
          </div>
          <p v-if="subscriptionError" class="field-error">{{ subscriptionError }}</p>
          <button
            class="btn btn-outline btn-sm"
            :disabled="subscriptionLoading"
            @click="handlePortal"
          >
            {{ subscriptionLoading ? 'Chargement…' : 'Gérer mon abonnement' }}
          </button>
        </template>
      </div>

      <!-- ── Nom d'utilisateur ──────────────────────────────────────────── -->
      <div class="profil-section">
        <h2 class="section-title">Nom d'utilisateur</h2>
        <div class="username-form">
          <input
            v-model="newUsername"
            type="text"
            class="input-field"
            placeholder="Nouveau pseudo"
            maxlength="20"
            :disabled="savingUsername"
            @keydown.enter="saveUsername"
          />
          <button
            class="btn btn-primary btn-sm"
            @click="saveUsername"
            :disabled="savingUsername || !newUsername.trim() || newUsername.trim() === authStore.username || !!usernameFormatError"
          >
            {{ savingUsername ? '…' : 'Sauvegarder' }}
          </button>
        </div>
        <p class="format-hint">3–20 caractères · lettres minuscules, chiffres et _</p>
        <p v-if="usernameFormatError" class="field-error">{{ usernameFormatError }}</p>
        <p v-else-if="usernameError" class="field-error">{{ usernameError }}</p>
        <p v-else-if="usernameSuccess" class="field-success">Pseudo mis à jour !</p>
      </div>

      <!-- ── Import localStorage ─────────────────────────────────────────── -->
      <Transition name="fade">
        <div v-if="localImportCount > 0 || importSuccess" class="profil-section profil-section--import">
          <div class="import-header">
            <div class="import-icon">📦</div>
            <div class="import-text">
              <p class="import-title">Historique local détecté</p>
              <p class="import-sub">
                {{ localImportCount }} niveau{{ localImportCount > 1 ? 'x' : '' }} complété{{ localImportCount > 1 ? 's' : '' }} hors connexion
              </p>
            </div>
          </div>
          <button
            class="btn btn-secondary btn-sm"
            @click="importLocalHistory"
            :disabled="importing || importSuccess"
          >
            {{ importing ? 'Import en cours…' : importSuccess ? 'Importé !' : `Importer ${localImportCount} niveau${localImportCount > 1 ? 'x' : ''}` }}
          </button>
          <p v-if="importSuccess" class="field-success">Historique importé avec succès.</p>
        </div>
      </Transition>

      <!-- ── Statistiques ────────────────────────────────────────────────── -->
      <div class="profil-section">
        <h2 class="section-title">Mes statistiques</h2>

        <div v-if="loadingStats" class="inline-loading">
          <div class="spinner-sm"></div>
          <span>Chargement…</span>
        </div>

        <div v-else class="stats-content">
          <!-- Hearts -->
          <div class="game-stats-block">
            <div class="game-stats-label">
              <span class="game-dot game-dot--hearts"></span> Kuzzle
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ stats.heartsGames }}</div>
                <div class="stat-label">Parties jouées</div>
              </div>
              <div class="stat-card stat-card--highlight">
                <div class="stat-value">{{ stats.bestHearts || '—' }}</div>
                <div class="stat-label">Meilleur temps</div>
              </div>
              <div class="stat-card" :class="{ 'stat-card--streak': streaks.hearts.current > 0 }">
                <div class="stat-value">
                  {{ streaks.hearts.current }}<span v-if="streaks.hearts.current > 1" class="streak-flame"> 🔥</span>
                </div>
                <div class="stat-label">Streak actuel</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ streaks.hearts.best }}</div>
                <div class="stat-label">Meilleur streak</div>
              </div>
            </div>
          </div>

          <!-- Lumizle -->
          <div class="game-stats-block">
            <div class="game-stats-label">
              <span class="game-dot game-dot--lumizle"></span> Lumizle
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ stats.lumizleGames }}</div>
                <div class="stat-label">Parties jouées</div>
              </div>
              <div class="stat-card stat-card--highlight">
                <div class="stat-value">{{ stats.bestLumizle || '—' }}</div>
                <div class="stat-label">Meilleur temps</div>
              </div>
              <div class="stat-card" :class="{ 'stat-card--streak': streaks.lumizle.current > 0 }">
                <div class="stat-value">
                  {{ streaks.lumizle.current }}<span v-if="streaks.lumizle.current > 1" class="streak-flame"> 🔥</span>
                </div>
                <div class="stat-label">Streak actuel</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ streaks.lumizle.best }}</div>
                <div class="stat-label">Meilleur streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Historique ──────────────────────────────────────────────────── -->
      <div class="profil-section">
        <h2 class="section-title">Historique</h2>

        <div v-if="loadingStats" class="inline-loading">
          <div class="spinner-sm"></div>
          <span>Chargement…</span>
        </div>

        <template v-else>
          <!-- Tabs filtre -->
          <div class="history-tabs" role="tablist">
            <button
              v-for="tab in historyTabs"
              :key="tab.value"
              role="tab"
              :aria-selected="historyFilter === tab.value"
              class="history-tab"
              :class="{ 'history-tab--active': historyFilter === tab.value }"
              @click="historyFilter = tab.value"
            >
              {{ tab.label }}
              <span class="tab-count">{{ tabCount(tab.value) }}</span>
            </button>
          </div>

          <!-- Liste vide -->
          <div v-if="filteredResults.length === 0" class="empty-state">
            <p class="empty-icon">🎮</p>
            <p>Aucune partie enregistrée.</p>
            <p class="empty-sub">Jouez un puzzle pour commencer !</p>
          </div>

          <!-- Résultats -->
          <div v-else class="results-list">
            <div v-for="r in visibleResults" :key="r.id" class="result-row">
              <span class="result-badge" :class="`result-badge--${r.game_type}`">
                {{ r.game_type === 'hearts' ? 'Kuzzle' : 'Lumizle' }}
              </span>
              <span class="result-date">{{ formatDate(r.puzzle_date) }}</span>
              <div class="result-meta">
                <span class="result-time">{{ formatSeconds(r.time_seconds) }}</span>
                <span v-if="r.verify_count != null && r.game_type === 'hearts'" class="result-verify">
                  {{ r.verify_count }} vérif.
                </span>
              </div>
              <span class="result-check">✓</span>
            </div>
          </div>

          <!-- Voir plus -->
          <button v-if="hasMore" class="btn-load-more" @click="showMore">
            Voir {{ Math.min(20, filteredResults.length - displayCount) }} de plus
            <span class="load-more-total">({{ filteredResults.length - displayCount }} restant{{ filteredResults.length - displayCount > 1 ? 's' : '' }})</span>
          </button>
        </template>
      </div>

      <!-- ── Actions ────────────────────────────────────────────────────── -->
      <div class="profil-actions">
        <button class="btn btn-outline" @click="handleLogout">Se déconnecter</button>
        <button class="btn btn-danger-text" @click="openDeleteModal">
          Supprimer mon compte
        </button>
      </div>

    </div><!-- /profil-container -->

    <!-- ── Modal suppression compte ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="modal-overlay"
          @click.self="closeDeleteModal"
        >
          <div class="delete-modal" role="dialog" aria-modal="true">
            <div class="delete-modal-icon">⚠️</div>
            <h3 class="delete-modal-title">Supprimer mon compte</h3>
            <p class="delete-modal-body">
              Cette action est <strong>irréversible</strong>. Votre profil, vos statistiques et tout votre historique seront définitivement supprimés.
            </p>
            <p class="delete-modal-confirm-hint">
              Tapez votre adresse e-mail <strong class="confirm-username">{{ authStore.user?.email }}</strong> pour confirmer :
            </p>
            <input
              v-model="deleteConfirmInput"
              type="text"
              class="input-field"
              :placeholder="authStore.user?.email"
              autocomplete="off"
              @keydown.enter="deleteAccount"
            />
            <p v-if="deleteError" class="field-error">{{ deleteError }}</p>
            <div class="delete-modal-actions">
              <button
                class="btn btn-outline"
                @click="closeDeleteModal"
                :disabled="deletingAccount"
              >
                Annuler
              </button>
              <button
                class="btn btn-danger"
                @click="deleteAccount"
                :disabled="deleteConfirmInput !== (authStore.user?.email || '') || deletingAccount"
              >
                {{ deletingAccount ? 'Suppression…' : 'Supprimer définitivement' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useSubscription } from '../composables/useSubscription.js'
import { supabase } from '../lib/supabase.js'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

// ── Initiales avatar (fallback) ────────────────────────────────────────────
const initials = computed(() => {
  const name = authStore.username || authStore.user?.email || '?'
  return name.replace(/[@._\-]/g, ' ').split(/\s+/).filter(Boolean)
    .map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

// ── Pass Premium (Stripe) ─────────────────────────────────────────────────
const {
  startCheckout, openPortal,
  loading: subscriptionLoading, error: subscriptionError,
} = useSubscription()
const paymentSuccess = ref(false)

async function handleCheckout() {
  await startCheckout()
}

async function handlePortal() {
  await openPortal()
}

// ── Changement de pseudo ──────────────────────────────────────────────────
const newUsername    = ref(authStore.username || '')
const savingUsername = ref(false)
const usernameError  = ref('')
const usernameSuccess = ref(false)

// Resynchroniser si le profil charge après le mount (OAuth, page refresh)
watch(() => authStore.username, v => {
  newUsername.value = v ?? ''
})

// Validation format en temps réel
const usernameFormatError = computed(() => {
  const val = newUsername.value.trim()
  if (!val) return ''
  if (val.length < 3)  return 'Au moins 3 caractères requis.'
  if (val.length > 20) return 'Maximum 20 caractères.'
  if (!/^[a-z0-9_]+$/.test(val)) return 'Lettres minuscules, chiffres et _ uniquement.'
  return ''
})

async function saveUsername() {
  usernameError.value   = ''
  usernameSuccess.value = false
  if (usernameFormatError.value) return
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

// ── Données stats (chargées depuis Supabase) ──────────────────────────────
const loadingStats = ref(true)
const allResults   = ref([])   // max 365 résultats, ordre DESC

const stats = ref({
  heartsGames:  0, bestHearts:  null,
  lumizleGames: 0, bestLumizle: null,
})

const streaks = ref({
  hearts:  { current: 0, best: 0 },
  lumizle: { current: 0, best: 0 },
})

// ── Historique : tabs + pagination côté client ────────────────────────────
const historyFilter = ref('all')
const displayCount  = ref(20)

const historyTabs = [
  { value: 'all',     label: 'Tout' },
  { value: 'hearts',  label: 'Kuzzle' },
  { value: 'lumizle', label: 'Lumizle' },
]

function tabCount(filter) {
  if (filter === 'all') return allResults.value.length
  return allResults.value.filter(r => r.game_type === filter).length
}

const filteredResults = computed(() => {
  if (historyFilter.value === 'all') return allResults.value
  return allResults.value.filter(r => r.game_type === historyFilter.value)
})

const visibleResults = computed(() => filteredResults.value.slice(0, displayCount.value))
const hasMore        = computed(() => displayCount.value < filteredResults.value.length)

watch(historyFilter, () => { displayCount.value = 20 })
function showMore() { displayCount.value += 20 }

// ── Import depuis localStorage ────────────────────────────────────────────
const importCandidates = ref([])
const importing        = ref(false)
const importSuccess    = ref(false)

const localImportCount = computed(() => importCandidates.value.length)

const DAILY_RE = /^\d{4}-\d{2}-\d{2}$/

function computeImportCandidates() {
  const existing = new Set(allResults.value.map(r => `${r.game_type}:${r.puzzle_date}`))
  const candidates = []
  try {
    const hearts = JSON.parse(localStorage.getItem('hearts-completed-levels')  || '[]')
    for (const d of hearts) {
      if (DAILY_RE.test(d) && !existing.has(`hearts:${d}`))
        candidates.push({ game_type: 'hearts', puzzle_date: d })
    }
    const lumizle = JSON.parse(localStorage.getItem('lumizle-completed-levels') || '[]')
    for (const d of lumizle) {
      if (DAILY_RE.test(d) && !existing.has(`lumizle:${d}`))
        candidates.push({ game_type: 'lumizle', puzzle_date: d })
    }
  } catch (_) { /* localStorage peut être inaccessible */ }
  importCandidates.value = candidates
}

async function importLocalHistory() {
  if (!supabase || !authStore.user || importing.value) return
  importing.value  = true
  importSuccess.value = false
  try {
    const rows = importCandidates.value.map(c => ({
      user_id:     authStore.user.id,
      game_type:   c.game_type,
      puzzle_date: c.puzzle_date,
      completed:   true,
      // time_seconds et verify_count absents du localStorage → NULL en DB
    }))
    // Insérer par lots de 50 pour éviter les requêtes trop grandes
    const BATCH = 50
    for (let i = 0; i < rows.length; i += BATCH) {
      await supabase
        .from('game_results')
        .upsert(rows.slice(i, i + BATCH), {
          onConflict: 'user_id,game_type,puzzle_date',
          ignoreDuplicates: true,
        })
    }
    importCandidates.value = []
    importSuccess.value = true
    await loadStats()
    setTimeout(() => { importSuccess.value = false }, 4000)
  } catch (e) {
    console.warn('[ProfilView] Import error:', e)
  } finally {
    importing.value = false
  }
}

// ── Calcul des streaks (jours calendaires consécutifs) ────────────────────
function calcStreak(gameType) {
  // Dates uniques au format YYYY-MM-DD, triées ASC (tri lexicographique correct pour ce format)
  const dateStrs = [...new Set(
    allResults.value
      .filter(r => r.game_type === gameType && r.completed && DAILY_RE.test(r.puzzle_date))
      .map(r => r.puzzle_date)
  )].sort()

  if (!dateStrs.length) return { current: 0, best: 0 }

  // Meilleur streak (séquence la plus longue)
  let best = 1, run = 1
  for (let i = 1; i < dateStrs.length; i++) {
    const diff = Math.round((new Date(dateStrs[i]) - new Date(dateStrs[i - 1])) / 86400000)
    if (diff === 1) { run++; if (run > best) best = run }
    else            { run = 1 }
  }

  // Streak actuel (depuis aujourd'hui ou hier — le joueur n'a peut-être pas encore joué aujourd'hui)
  const now  = new Date()
  const pad  = n => String(n).padStart(2, '0')
  const toStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const todayStr = toStr(now)
  const yest  = new Date(now); yest.setDate(yest.getDate() - 1)
  const yestStr  = toStr(yest)

  const last = dateStrs[dateStrs.length - 1]
  let current = 0
  if (last === todayStr || last === yestStr) {
    current = 1
    for (let i = dateStrs.length - 2; i >= 0; i--) {
      const diff = Math.round((new Date(dateStrs[i + 1]) - new Date(dateStrs[i])) / 86400000)
      if (diff === 1) current++
      else            break
    }
  }

  return { current, best }
}

// ── Chargement principal ──────────────────────────────────────────────────
async function loadStats() {
  if (!supabase || !authStore.user) { loadingStats.value = false; return }
  loadingStats.value = true
  try {
    // Timeout de 10s → évite le chargement infini si Supabase ne répond pas
    let timeoutId
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), 10000)
    })

    const { data, error } = await Promise.race([
      supabase
        .from('game_results')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })
        .limit(365),
      timeoutPromise,
    ])
    clearTimeout(timeoutId)

    if (error) {
      // Table inexistante (42P01) ou autre erreur DB → dégradation gracieuse
      console.info('[ProfilView] game_results inaccessible:', error.code, error.message)
      return
    }

    if (data) {
      allResults.value = data

      const hearts  = data.filter(r => r.game_type === 'hearts')
      const lumizle = data.filter(r => r.game_type === 'lumizle')

      const minTime = arr => arr.length
        ? formatSeconds(Math.min(...arr.map(r => r.time_seconds).filter(Boolean)))
        : null

      stats.value = {
        heartsGames:  hearts.length,
        bestHearts:   minTime(hearts),
        lumizleGames: lumizle.length,
        bestLumizle:  minTime(lumizle),
      }

      streaks.value = {
        hearts:  calcStreak('hearts'),
        lumizle: calcStreak('lumizle'),
      }

      computeImportCandidates()
    }
  } catch (e) {
    console.info('[ProfilView] loadStats interrompu:', e.message)
  } finally {
    loadingStats.value = false
  }
}

// ── Formatters ────────────────────────────────────────────────────────────
function formatSeconds(s) {
  if (s == null || s === '') return '—'
  const m = Math.floor(s / 60), sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return dateStr }
}

// ── Suppression du compte ─────────────────────────────────────────────────
const showDeleteModal    = ref(false)
const deleteConfirmInput = ref('')
const deletingAccount    = ref(false)
const deleteError        = ref('')

function openDeleteModal() {
  deleteConfirmInput.value = ''
  deleteError.value = ''
  showDeleteModal.value = true
}
function closeDeleteModal() {
  if (!deletingAccount.value) showDeleteModal.value = false
}

async function deleteAccount() {
  const confirmTarget = authStore.user?.email || ''
  if (deleteConfirmInput.value !== confirmTarget || deletingAccount.value) return
  deletingAccount.value = true
  deleteError.value = ''
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) throw new Error('Session introuvable. Reconnectez-vous.')

    const apiUrl = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${apiUrl}/api/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Erreur lors de la suppression.')

    authStore.logout()
    router.replace('/')
  } catch (e) {
    deleteError.value = e.message || 'Erreur lors de la suppression.'
    deletingAccount.value = false
  }
}

// ── Déconnexion ───────────────────────────────────────────────────────────
function handleLogout() {
  authStore.logout()
  router.replace('/')
}

// Déclencher le chargement des stats quand l'utilisateur devient disponible
// (ou change de compte). { immediate: true } couvre aussi le cas du mount initial.
watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (newUser && newUser.id !== oldUser?.id) {
      loadStats()
    } else if (!newUser) {
      allResults.value = []
      loadingStats.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  newUsername.value = authStore.username || ''

  // Détecter le retour Stripe après paiement (?success=true)
  // et rafraîchir le profil pour mettre à jour is_premium.
  if (route.query.success === 'true') {
    paymentSuccess.value = true
    // Rafraîchir le profil depuis Supabase (is_premium vient d'être mis à jour par le webhook)
    if (authStore.user) {
      authStore.fetchProfile(authStore.user.id)
    }
    // Nettoyer le paramètre de l'URL sans recharger la page
    router.replace({ query: {} })
    // Masquer la bannière après 6 secondes
    setTimeout(() => { paymentSuccess.value = false }, 6000)
  }
})
</script>

<style scoped>
.app-main {
  flex: 1;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Loading ── */
.page-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-text-soft);
}
.spinner {
  width: 44px; height: 44px;
  border: 4px solid var(--color-primary-bg);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
.spinner-sm {
  width: 18px; height: 18px; flex-shrink: 0;
  border: 3px solid var(--color-primary-bg);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.inline-loading {
  display: flex; align-items: center; gap: 0.5rem;
  color: var(--color-text-soft); font-size: 0.9rem;
  padding: 0.5rem 0;
}

/* ── Container ── */
.profil-container {
  width: 100%; max-width: 600px;
  display: flex; flex-direction: column; gap: 1.5rem;
}

/* ── Section card ── */
.profil-section {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
}
.section-title {
  font-size: 0.8rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-soft); margin: 0 0 1rem;
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
  width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
  background: var(--gradient-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 800; color: white; overflow: hidden;
}
.profil-avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.profil-username { font-size: 1.35rem; font-weight: 800; color: var(--color-text); margin: 0 0 0.15rem; }
.profil-email    { font-size: 0.83rem; color: var(--color-text-soft); margin: 0 0 0.35rem; }
.premium-badge {
  display: inline-block; font-size: 0.72rem; font-weight: 700;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white; padding: 0.18rem 0.55rem; border-radius: 999px;
}

/* ── Username form ── */
.username-form { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
.input-field {
  flex: 1; min-width: 140px;
  padding: 0.55rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.9rem;
  background: var(--color-bg); color: var(--color-text);
  outline: none; transition: border-color 0.2s;
}
.input-field:focus { border-color: var(--color-primary); }
.format-hint  { font-size: 0.78rem; color: var(--color-text-soft); margin: 0.4rem 0 0; opacity: 0.75; }
.field-error  { font-size: 0.82rem; color: var(--color-error);   margin: 0.35rem 0 0; }
.field-success{ font-size: 0.82rem; color: var(--color-success);  margin: 0.35rem 0 0; }

/* ── Import localStorage ── */
.profil-section--import {
  border-color: var(--color-primary-light);
  background: var(--color-primary-bg);
}
.import-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.85rem; }
.import-icon   { font-size: 1.4rem; line-height: 1; }
.import-title  { font-weight: 700; font-size: 0.9rem; color: var(--color-text); margin: 0 0 0.15rem; }
.import-sub    { font-size: 0.82rem; color: var(--color-text-soft); margin: 0; }

/* ── Stats ── */
.stats-content { display: flex; flex-direction: column; gap: 1.25rem; }

.game-stats-block { display: flex; flex-direction: column; gap: 0.6rem; }
.game-stats-label {
  display: flex; align-items: center; gap: 0.45rem;
  font-size: 0.82rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-soft);
}
.game-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.game-dot--hearts  { background: var(--color-primary); }
.game-dot--lumizle { background: #3b82f6; }

.stats-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;
}
.stat-card {
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem; text-align: center;
  transition: border-color 0.2s;
}
.stat-card--highlight {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-light);
}
.stat-card--streak {
  background: linear-gradient(135deg, #fff7ed, #fff3e0);
  border-color: #fb923c;
}
.stat-value {
  font-size: 1.75rem; font-weight: 800;
  color: var(--color-text); line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stat-card--highlight .stat-value { color: var(--color-primary); }
.stat-card--streak    .stat-value { color: #ea580c; }
.stat-label {
  font-size: 0.72rem; font-weight: 600;
  color: var(--color-text-soft); margin-top: 0.3rem;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.streak-flame { font-size: 1.2rem; }

/* ── Historique ── */
.history-tabs {
  display: flex; gap: 0.35rem; margin-bottom: 0.85rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0;
}
.history-tab {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem 0.6rem;
  font-family: var(--font-family); font-size: 0.85rem; font-weight: 700;
  color: var(--color-text-soft); background: transparent; border: none;
  border-bottom: 2.5px solid transparent; margin-bottom: -2px;
  cursor: pointer; transition: color 0.15s, border-color 0.15s;
}
.history-tab:hover { color: var(--color-text); }
.history-tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
.tab-count {
  font-size: 0.72rem; font-weight: 700;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  padding: 0.1rem 0.4rem; border-radius: 999px;
  min-width: 18px; text-align: center;
}
.history-tab--active .tab-count {
  background: var(--color-primary);
  color: white;
}

.empty-state {
  text-align: center; padding: 1.5rem 0;
  color: var(--color-text-soft); font-size: 0.9rem;
}
.empty-icon { font-size: 2rem; margin: 0 0 0.5rem; }
.empty-sub  { font-size: 0.82rem; opacity: 0.7; margin: 0.2rem 0 0; }

.results-list { display: flex; flex-direction: column; gap: 0.35rem; }
.result-row {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.5rem 0.65rem;
  background: var(--color-bg); border-radius: var(--radius-sm);
  font-size: 0.87rem;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}
.result-row:hover { border-color: var(--color-border); }

.result-badge {
  font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem;
  border-radius: 999px; flex-shrink: 0;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.result-badge--hearts  { background: var(--color-primary-bg); color: var(--color-primary); }
.result-badge--lumizle { background: #eff6ff; color: #3b82f6; }
.result-date  { flex: 1; color: var(--color-text); font-weight: 600; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-meta  { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.result-time  { font-variant-numeric: tabular-nums; color: var(--color-primary); font-weight: 700; font-size: 0.87rem; }
.result-verify{ color: var(--color-text-soft); font-size: 0.78rem; }
.result-check { color: var(--color-success); font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }

.btn-load-more {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  width: 100%; margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  background: var(--color-bg); border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.85rem; font-weight: 700;
  color: var(--color-text-soft); cursor: pointer;
  transition: all 0.15s ease;
}
.btn-load-more:hover { border-color: var(--color-primary); color: var(--color-primary); }
.load-more-total { font-weight: 400; opacity: 0.65; }

/* ── Actions ── */
.profil-actions {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 0.25rem;
  flex-wrap: wrap; gap: 0.75rem;
}

/* ── Boutons ── */
.btn {
  padding: 0.65rem 1.3rem; border: none; border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.9rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-sm { padding: 0.5rem 0.95rem; font-size: 0.85rem; }
.btn-primary {
  background: var(--gradient-primary); color: white; box-shadow: var(--shadow-sm);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn-secondary {
  background: var(--color-primary-bg); color: var(--color-primary);
  border: 1.5px solid var(--color-primary-light);
}
.btn-secondary:hover:not(:disabled) { background: var(--color-primary-light); }
.btn-outline {
  background: transparent; color: var(--color-text-soft);
  border: 1.5px solid var(--color-border);
}
.btn-outline:hover:not(:disabled) { border-color: var(--color-text-soft); color: var(--color-text); }
.btn-danger {
  background: var(--color-error, #dc2626); color: white;
  border: none;
}
.btn-danger:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-danger-text {
  background: transparent; border: none;
  color: var(--color-error, #dc2626);
  font-family: var(--font-family); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; padding: 0.4rem 0.25rem; opacity: 0.75;
  transition: opacity 0.15s;
}
.btn-danger-text:hover { opacity: 1; text-decoration: underline; }

/* ── Pass Premium ── */
.profil-section--success {
  border-color: #22c55e;
  background: #f0fdf4;
}
.success-banner {
  display: flex; align-items: flex-start; gap: 0.75rem;
}
.success-icon  { font-size: 1.6rem; flex-shrink: 0; }
.success-title { font-weight: 700; font-size: 0.92rem; color: #166534; margin: 0 0 0.2rem; }
.success-sub   { font-size: 0.82rem; color: #166534; opacity: 0.85; margin: 0; }

.profil-section--premium {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fcd34d;
}
.profil-section--premium-active {
  background: linear-gradient(135deg, #fffbeb 0%, #ecfdf5 100%);
  border-color: #6ee7b7;
}

.premium-sell-header {
  display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 1rem;
}
.premium-sell-icon  { font-size: 1.75rem; flex-shrink: 0; }
.premium-sell-title {
  font-size: 1.05rem; font-weight: 800; color: var(--color-text); margin: 0 0 0.15rem;
}
.premium-sell-sub { font-size: 0.84rem; color: var(--color-text-soft); margin: 0; }

.premium-features {
  list-style: none; padding: 0; margin: 0 0 1.1rem;
  display: flex; flex-direction: column; gap: 0.45rem;
}
.premium-features li {
  font-size: 0.88rem; color: var(--color-text);
}

.btn-premium {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white; border: none; border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.95rem; font-weight: 800;
  cursor: pointer; letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  transition: all 0.2s ease;
}
.btn-premium:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.5);
}
.btn-premium:disabled { opacity: 0.5; cursor: not-allowed; }

.premium-active-content {
  display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.85rem;
}
.premium-active-icon  { font-size: 1.75rem; flex-shrink: 0; }
.premium-active-title {
  font-size: 1.05rem; font-weight: 800; color: var(--color-text); margin: 0 0 0.15rem;
}
.premium-active-sub { font-size: 0.84rem; color: var(--color-text-soft); margin: 0; }


/* ── Modal suppression ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem; z-index: 1000;
}
.delete-modal {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem 1.75rem;
  max-width: 420px; width: 100%;
  box-shadow: var(--shadow-md), 0 0 0 1px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 0.85rem;
}
.delete-modal-icon  { font-size: 2.5rem; text-align: center; }
.delete-modal-title {
  font-size: 1.15rem; font-weight: 800; color: var(--color-text);
  margin: 0; text-align: center;
}
.delete-modal-body  { font-size: 0.88rem; color: var(--color-text-soft); margin: 0; line-height: 1.55; }
.delete-modal-confirm-hint { font-size: 0.85rem; color: var(--color-text-soft); margin: 0; }
.confirm-username { color: var(--color-text); }
.delete-modal-actions {
  display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.25rem;
  flex-wrap: wrap;
}
.delete-modal-actions .btn { flex: 1; min-width: 120px; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,  .modal-leave-to      { opacity: 0; }
.modal-enter-active .delete-modal,
.modal-leave-active .delete-modal {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.modal-enter-from .delete-modal,
.modal-leave-to   .delete-modal {
  transform: scale(0.95) translateY(8px); opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 500px) {
  .profil-header { flex-direction: column; text-align: center; }
  .stats-grid    { grid-template-columns: 1fr 1fr; }
  .profil-actions { justify-content: center; }
  .delete-modal-actions { flex-direction: column-reverse; }
}
</style>
