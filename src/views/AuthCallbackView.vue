<template>
  <main class="callback-main">
    <template v-if="!isError">
      <div class="spinner"></div>
      <p class="callback-msg">Connexion en cours…</p>
    </template>
    <template v-else>
      <div class="callback-icon">✕</div>
      <p class="callback-msg callback-msg--error">{{ errorMsg }}</p>
      <p class="callback-sub">Redirection dans un instant…</p>
    </template>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const router = useRouter()

const isError  = ref(false)
const errorMsg = ref('')

function fail(msg) {
  isError.value  = true
  errorMsg.value = msg
  setTimeout(() => router.replace('/'), 3000)
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)

  // ── Erreur renvoyée par Google / Supabase (accès refusé, etc.) ──────────
  const oauthError = params.get('error')
  const oauthDesc  = params.get('error_description')
  if (oauthError) {
    fail(oauthDesc
      ? decodeURIComponent(oauthDesc.replace(/\+/g, ' '))
      : 'La connexion a été annulée.')
    return
  }

  if (!supabase) {
    router.replace('/')
    return
  }

  const code = params.get('code')

  if (!code) {
    // Pas de code dans l'URL → probablement un accès direct à /auth/callback
    router.replace('/')
    return
  }

  // ── Échange PKCE : code d'autorisation → session ────────────────────────
  // detectSessionInUrl est à false dans supabase.js pour éviter que le SDK
  // tente cet échange automatiquement (et consomme le verifier avant nous).
  const { error: exchError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchError) {
    console.error('[auth/callback]', exchError.message)

    // Messages en français selon le type d'erreur
    if (exchError.message.includes('code verifier')) {
      fail('Session expirée ou déjà utilisée. Relancez la connexion.')
    } else if (exchError.message.includes('redirect')) {
      fail('URL de redirection non autorisée. Vérifiez la configuration Supabase.')
    } else {
      fail('Erreur de connexion. Veuillez réessayer.')
    }
    return
  }

  // L'échange a réussi. onAuthStateChange dans auth.js a déjà mis à jour
  // le store (user, initialized) de façon synchrone avant tout await.
  // Pas besoin d'appeler init() ici — cela causerait un double getSession()
  // pendant que le SDK finalise encore l'échange PKCE, ce qui peut bloquer.
  router.replace('/')
})
</script>

<style scoped>
.callback-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  min-height: 60vh;
}

.spinner {
  width: 44px; height: 44px;
  border: 4px solid var(--color-primary-bg);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.callback-icon {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--color-error-light);
  color: var(--color-error);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 900;
  flex-shrink: 0;
}

.callback-msg {
  font-size: 1rem; font-weight: 600;
  color: var(--color-text-soft);
  margin: 0; max-width: 320px;
}
.callback-msg--error { color: var(--color-error); }

.callback-sub {
  font-size: 0.82rem;
  color: var(--color-text-soft);
  opacity: 0.7; margin: 0;
}
</style>
