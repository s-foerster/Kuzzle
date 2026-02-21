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
  const oauthError = params.get('error')
  const oauthDesc  = params.get('error_description')
  if (oauthError) {
    fail(oauthDesc ? decodeURIComponent(oauthDesc.replace(/\+/g, ' ')) : 'La connexion a été annulée.')
    return
  }
  if (!supabase) { router.replace('/'); return }
  const code = params.get('code')
  if (!code) { router.replace('/'); return }

  try {
    // Attendre la fin de l'initialisation interne du SDK Supabase.
    // Le SDK acquiert un verrou (Web Locks API) au démarrage pour
    // récupérer/rafraîchir la session existante. exchangeCodeForSession()
    // a besoin du même verrou : sans cette attente, les deux opérations
    // se disputent le verrou et l'échange expire après 10 s.
    await supabase.auth.initialize()

    // Timeout de 30 s (le verrou interne du SDK expire lui-même à 10 s,
    // il nous faut donc largement plus que 10 s pour couvrir init + échange).
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Le serveur met trop de temps à répondre.')), 30000)
    )

    const { error: exchError } = await Promise.race([
      supabase.auth.exchangeCodeForSession(code),
      timeout,
    ])

    if (exchError) {
      if (exchError.message?.includes('code verifier') || exchError.message?.includes('verifier'))
        fail('Session expirée ou déjà utilisée. Relancez la connexion.')
      else if (exchError.message?.includes('redirect'))
        fail('URL de redirection non autorisée. Vérifiez la configuration Supabase.')
      else if (exchError.isAcquireTimeout)
        fail('Le client Supabase est occupé. Réessayez dans un instant.')
      else
        fail('Erreur de connexion : ' + exchError.message)
      return
    }

    // Succès → retour à l'accueil
    router.replace('/')
  } catch (err) {
    console.error('[AuthCallback] Exception catchée:', err)
    if (err.isAcquireTimeout)
      fail('Le client Supabase est occupé. Réessayez dans un instant.')
    else
      fail(err.message || 'Erreur inattendue.')
  }
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
