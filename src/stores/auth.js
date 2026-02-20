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
  const authModalOpen     = ref(false)
  const authModalInitialTab = ref('login') // 'login' | 'register'

  // ── Getters ─────────────────────────────────────────────────────────────
  const isLoggedIn  = computed(() => !!user.value)
  const isPremium   = computed(() => profile.value?.is_premium ?? false)
  const username    = computed(() =>
    profile.value?.username
    ?? user.value?.user_metadata?.full_name
    ?? user.value?.email?.split('@')[0]
    ?? null
  )
  const avatarUrl   = computed(() =>
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
      .single()
    if (data) profile.value = data
  }

  async function createProfile(userId, usernameValue, avatarUrl = null) {
    if (!supabase) return
    const { error: err } = await supabase
      .from('profiles')
      .insert({ id: userId, username: usernameValue, avatar_url: avatarUrl })
    if (err) console.warn('[auth] createProfile error:', err.message)
  }

  // ── Initialisation (appelée une fois au démarrage) ──────────────────────
  async function init() {
    if (!supabase) {
      initialized.value = true
      return
    }

    // Récupérer la session actuelle (gère aussi le callback OAuth via URL)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
    initialized.value = true

    // Écouter les changements de session (refresh, logout, OAuth callback)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)

        // Créer le profil si c'est la première connexion Google
        if (event === 'SIGNED_IN' && !profile.value) {
          const googleName = session.user.user_metadata?.full_name
          const googleAvatar = session.user.user_metadata?.avatar_url
          const defaultUsername = (googleName || session.user.email?.split('@')[0] || 'joueur')
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 20)
          await createProfile(session.user.id, defaultUsername, googleAvatar)
          await fetchProfile(session.user.id)
        }
      } else {
        user.value = null
        profile.value = null
      }
    })
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  async function loginWithEmail(email, password) {
    if (!supabase) return { error: 'Supabase non configuré' }
    clearError()
    loading.value = true
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { error.value = err.message; return { error: err.message } }
      return { data }
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, usernameValue) {
    if (!supabase) return { error: 'Supabase non configuré' }
    clearError()
    loading.value = true
    try {
      // Vérifier l'unicité du username avant de créer le compte
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', usernameValue)
        .single()
      if (existing) {
        error.value = 'Ce nom d\'utilisateur est déjà pris.'
        return { error: error.value }
      }

      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) { error.value = err.message; return { error: err.message } }

      // Créer le profil immédiatement (l'utilisateur est connecté après signUp)
      if (data.user) {
        await createProfile(data.user.id, usernameValue)
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
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (err) { error.value = err.message; return { error: err.message } }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    if (!supabase) return
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function updateUsername(newUsername) {
    if (!supabase || !user.value) return { error: 'Non connecté' }
    clearError()
    loading.value = true
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.value.id)
      if (err) { error.value = err.message; return { error: err.message } }
      if (profile.value) profile.value.username = newUsername
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
