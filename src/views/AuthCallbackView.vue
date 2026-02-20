<template>
  <main class="callback-main">
    <div class="spinner"></div>
    <p>Connexion en cours…</p>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router    = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // Supabase gère automatiquement l'échange du code OAuth via getSession().
  // On attend que l'init soit complète, puis on redirige.
  if (!authStore.initialized) {
    await authStore.init()
  }
  router.replace(authStore.isLoggedIn ? '/profil' : '/')
})
</script>

<style scoped>
.callback-main {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1rem; color: var(--color-text-soft);
}
.spinner {
  width: 44px; height: 44px;
  border: 4px solid var(--color-primary-bg); border-top: 4px solid var(--color-primary);
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
