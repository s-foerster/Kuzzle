import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useAuthStore = defineStore('auth', () => {
  // ── État ────────────────────────────────────────────────────────────────
  const user        = ref(null)     // objet auth Supabase (id, email, metadata…)
  const profile     = ref(null)     // profil public (username, is_premium…)
  const initialized = ref(false)    // session vérifiée au moins une fois
  const loading     = ref(false)    // opération en cours (login, register…)
  const error       = ref(null)     // dernier message d'erreur

  // Modal d'auth
  const authModalOpen       = ref(false)
  const authModalInitialTab = ref('login') // 'login' | 'register'

  // ── Getters ─────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!user.value)
  const isPremium  = computed(() => profile.value?.is_premium ?? false)
  const username   = computed(() =>
    profile.value?.username
    ?? user.value?.user_metadata?.full_name
    ?? user.value?.email?.split('@')[0]
    ?? null
  )
  const avatarUrl = computed(() =>
    profile.value?.avatar_url
    ?? user.value?.user_metadata?.avatar_url
    ?? null
  )

  // ── Helpers internes ────────────────────────────────────────────────────
  function clearError() { error.value = null }

  async function fetchProfile(userId) {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()   // maybeSingle : null si 0 lignes, sans erreur PGRST116
    if (data) profile.value = data
  }

  async function createProfile(userId, usernameValue, avatarUrlValue = null) {
    if (!supabase) return
    const { error: err } = await supabase
      .from('profiles')
      .insert({ id: userId, username: usernameValue, avatar_url: avatarUrlValue })
    if (err) console.warn('[auth] createProfile error:', err.message)
  }

  // ── Listener de session ─────────────────────────────────────────────────
  // Le store Pinia est un singleton : ce bloc s'exécute exactement UNE FOIS,
  // peu importe combien de fois init() est appelé. Pas de doublons.
  if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Mettre à jour l'état de base AVANT tout await,
      // pour que initialized soit vrai dès que possible.
      if (session?.user) {
        user.value = session.user
      } else {
        user.value    = null
        profile.value = null
      }
      initialized.value = true

      // Opérations async (DB) après avoir marqué initialized
      if (session?.user) {
        // Charger / recharger le profil si l'utilisateur a changé
        if (!profile.value || profile.value.id !== session.user.id) {
          await fetchProfile(session.user.id)
        }

        // Créer le profil à la première connexion Google/OAuth
        if (event === 'SIGNED_IN' && !profile.value) {
          const googleName   = session.user.user_metadata?.full_name
          const googleAvatar = session.user.user_metadata?.avatar_url
          const defaultUsername = (googleName || session.user.email?.split('@')[0] || 'joueur')
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 20)
          await createProfile(session.user.id, defaultUsername, googleAvatar)
          await fetchProfile(session.user.id)
        }
      }
    })
  }

  // ── Initialisation ───────────────────────────────────────────────────────
  // Idempotente : peut être appelée plusieurs fois sans effet de bord.
  // Elle hydrate simplement le store avec la session actuelle.
  async function init() {
    if (!supabase) {
      initialized.value = true
      return
    }
    // Garde d'idempotence : onAuthStateChange a peut-être déjà tout hydraté.
    if (initialized.value) return

    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      user.value = session.user
      if (!profile.value || profile.value.id !== session.user.id) {
        await fetchProfile(session.user.id)
      }
    } else {
      user.value    = null
      profile.value = null
    }

    initialized.value = true
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  async function loginWithEmail(emailVal, passwordVal) {
    if (!supabase) return { error: 'Supabase non configuré' }
    clearError()
    loading.value = true
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: emailVal,
        password: passwordVal,
      })
      if (err) { error.value = err.message; return { error: err.message } }
      return { data }
    } finally {
      loading.value = false
    }
  }

  async function register(emailVal, passwordVal, usernameVal) {
    if (!supabase) return { error: 'Supabase non configuré' }
    clearError()
    loading.value = true
    try {
      // Vérifier l'unicité du username avant de créer le compte
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', usernameVal)
        .single()
      if (existing) {
        error.value = 'Ce nom d\'utilisateur est déjà pris.'
        return { error: error.value }
      }

      const { data, error: err } = await supabase.auth.signUp({
        email: emailVal,
        password: passwordVal,
      })
      if (err) { error.value = err.message; return { error: err.message } }

      if (data.user) {
        await createProfile(data.user.id, usernameVal)
        await fetchProfile(data.user.id)
      }
      return { data }
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    if (!supabase) return { error: 'Supabase non configuré' }
    clearError()
    loading.value = true
    // Pas de finally ici : la page va se recharger via le redirect OAuth.
    // Si signInWithOAuth échoue (erreur réseau), on reset manuellement.
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // URL de retour après Google. Doit être dans la liste des redirects autorisés
        // dans le dashboard Supabase → Authentication → URL Configuration.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (err) {
      error.value   = err.message
      loading.value = false
      return { error: err.message }
    }
    // Pas de return : le navigateur redirige vers Google.
  }

  function logout() {
    // Effacer l'état local immédiatement → déconnexion instantanée
    user.value    = null
    profile.value = null
    // Invalider la session côté serveur en arrière-plan (ignorer les erreurs réseau)
    if (supabase) supabase.auth.signOut().catch(() => {})
  }

  async function updateUsername(newUsername) {
    if (!supabase || !user.value) return { error: 'Non connecté' }
    clearError()

    // ── Validation du format ─────────────────────────────────────────────
    const trimmed = (newUsername || '').trim()
    if (trimmed.length < 3)
      return { error: 'Le pseudo doit contenir au moins 3 caractères.' }
    if (trimmed.length > 20)
      return { error: 'Le pseudo ne peut pas dépasser 20 caractères.' }
    if (!/^[a-z0-9_]+$/.test(trimmed))
      return { error: 'Uniquement des lettres minuscules, chiffres et _ sont autorisés.' }

    loading.value = true
    try {
      // ── Vérification d'unicité (exclure l'utilisateur courant) ───────────
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', user.value.id)
        .maybeSingle()

      if (existing) {
        error.value = 'Ce pseudo est déjà pris.'
        return { error: error.value }
      }

      // ── Mise à jour ──────────────────────────────────────────────────────
      const { error: err } = await supabase
        .from('profiles')
        .update({ username: trimmed })
        .eq('id', user.value.id)

      if (err) {
        // Traduire les erreurs brutes en français
        if (err.code === '23505' || err.message?.includes('unique')) {
          error.value = 'Ce pseudo est déjà pris.'
        } else {
          error.value = 'Erreur lors de la mise à jour. Réessayez.'
        }
        return { error: error.value }
      }

      if (profile.value) profile.value.username = trimmed
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  // ── Contrôle de la modale ───────────────────────────────────────────────
  function openAuthModal(tab = 'login') {
    authModalInitialTab.value = tab
    authModalOpen.value = true
  }
  function closeAuthModal() {
    authModalOpen.value = false
    error.value = null
  }

  return {
    // État
    user, profile, initialized, loading, error,
    authModalOpen, authModalInitialTab,
    // Getters
    isLoggedIn, isPremium, username, avatarUrl,
    // Actions
    init, loginWithEmail, register, loginWithGoogle, logout, updateUsername,
    fetchProfile,
    // Modal
    openAuthModal, closeAuthModal,
  }
})
