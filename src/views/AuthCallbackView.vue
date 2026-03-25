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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase.js";

const router = useRouter();

const isError = ref(false);
const errorMsg = ref("");

function fail(msg) {
  isError.value = true;
  errorMsg.value = msg;
  setTimeout(() => router.replace("/"), 3000);
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get("error");
  const oauthDesc = params.get("error_description");
  if (oauthError) {
    fail(
      oauthDesc
        ? decodeURIComponent(oauthDesc.replace(/\+/g, " "))
        : "La connexion a été annulée.",
    );
    return;
  }
  if (!supabase) {
    router.replace("/");
    return;
  }
  const code = params.get("code");
  if (!code) {
    router.replace("/");
    return;
  }

  try {
    // Attendre la fin de l'initialisation interne du SDK Supabase avant
    // d'échanger le code OAuth (les deux opérations utilisent le même verrou
    // Web Locks, géré sans timeout via noTimeoutLock dans supabase.js).
    await supabase.auth.initialize();

    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Le serveur met trop de temps à répondre.")),
        30000,
      ),
    );

    const { error: exchError } = await Promise.race([
      supabase.auth.exchangeCodeForSession(code),
      timeout,
    ]);

    if (exchError) {
      if (
        exchError.message?.includes("code verifier") ||
        exchError.message?.includes("verifier")
      )
        fail("Session expirée ou déjà utilisée. Relancez la connexion.");
      else if (exchError.message?.includes("redirect"))
        fail(
          "URL de redirection non autorisée. Vérifiez la configuration Supabase.",
        );
      else fail("Erreur de connexion : " + exchError.message);
      return;
    }

    // Succès → retour à l'accueil
    router.replace("/");
  } catch (err) {
    console.error("[AuthCallback] Exception catchée:", err);
    fail(err.message || "Erreur inattendue.");
  }
});
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
  width: 44px;
  height: 44px;
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

.callback-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-error-light);
  color: var(--color-error);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  flex-shrink: 0;
}

.callback-msg {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-soft);
  margin: 0;
  max-width: 320px;
}
.callback-msg--error {
  color: var(--color-error);
}

.callback-sub {
  font-size: 0.82rem;
  color: var(--color-text-soft);
  opacity: 0.7;
  margin: 0;
}
</style>
