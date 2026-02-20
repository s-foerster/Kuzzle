import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../views/LandingView.vue'),
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('../views/GameView.vue'),
  },
  {
    path: '/lumizle',
    name: 'lumizle',
    component: () => import('../views/LumizleView.vue'),
  },
  {
    path: '/profil',
    name: 'profil',
    component: () => import('../views/ProfilView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('../views/AuthCallbackView.vue'),
  },
  // Redirect any unknown route to landing
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation guard : /profil requiert une session active
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const authStore = useAuthStore()

  // Attendre que l'initialisation de la session soit terminée
  if (!authStore.initialized) {
    await authStore.init()
  }

  if (!authStore.user) {
    // Ouvrir la modale d'auth et rediriger vers l'accueil
    authStore.openAuthModal()
    return { name: 'landing' }
  }

  return true
})
