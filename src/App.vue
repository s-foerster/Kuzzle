<template>
  <div id="app">
    <!-- ===== HEADER ===== -->
    <header class="app-header">
      <div class="header-inner">
        <!-- Bouton retour (visible sur les pages jeu) -->
        <button
          v-if="showBackButton"
          class="btn-back"
          @click="router.push('/')"
          title="Retour à l'accueil"
        >
          ← Retour
        </button>
        <div v-else class="header-left-spacer"></div>

        <!-- Marque -->
        <RouterLink to="/" class="header-brand">
          <img
            src="./assets/rubihgames_mascotte_logo-removebg.png"
            alt="Rubihgames"
            class="header-logo"
          />
          <img
            src="./assets/rubihgames_text_logo-removebg-preview.png"
            alt="Rubihgames"
            class="header-text-logo"
          />
        </RouterLink>

        <!-- Actions droite -->
        <div class="header-actions">
          <UserAvatar />
        </div>
      </div>
    </header>

    <!-- ===== CONTENU ===== -->
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" @openTutorial="isTutorialOpen = true" />
      </Transition>
    </RouterView>

    <!-- ===== MODALES GLOBALES ===== -->
    <TutorialModal :isOpen="isTutorialOpen" @close="isTutorialOpen = false" />
    <AuthModal />

    <!-- ===== BANNIÈRE COOKIES ===== -->
    <CookieBanner />

    <!-- ===== FOOTER ===== -->
    <footer class="app-footer">
      <div class="footer-inner">
        <span class="footer-copy">© {{ currentYear }} Rubihgames</span>
        <nav class="footer-links">
          <RouterLink to="/mentions-legales">Mentions légales</RouterLink>
          <RouterLink to="/cgv">CGV</RouterLink>
          <RouterLink to="/politique-confidentialite"
            >Confidentialité</RouterLink
          >
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth.js";
import UserAvatar from "./components/UserAvatar.vue";
import TutorialModal from "./components/TutorialModal.vue";
import AuthModal from "./components/Auth/AuthModal.vue";
import CookieBanner from "./components/CookieBanner.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isTutorialOpen = ref(false);
const currentYear = new Date().getFullYear();

// Afficher le bouton "retour" uniquement sur les pages de jeu
const showBackButton = computed(() =>
  ["/game", "/lumizle"].includes(route.path),
);

onMounted(async () => {
  // Initialise la session Supabase (silencieux si Supabase non configuré)
  await authStore.init();
});
</script>

<style scoped>
/* ===== HEADER ===== */
.app-header {
  background: #fff;
  color: var(--color-text);
  padding: 0.9rem 1.5rem;
  box-shadow: 0 1px 0 var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-left-spacer {
  /* Espace réservé pour que la marque reste centrée */
  min-width: 2.5rem;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.header-logo {
  height: 2.5rem;
  width: auto;
  display: block;
}

.header-text-logo {
  height: 1.6rem;
  width: auto;
  display: block;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 2.5rem;
  justify-content: flex-end;
}

/* ===== BOUTON RETOUR ===== */
.btn-back {
  background: transparent;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-soft);
  font-family: var(--font-family);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-back:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ===== TRANSITION ENTRE PAGES ===== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .app-header {
    padding: 0.6rem 1rem;
  }
}

@media (max-width: 380px) {
  .header-logo {
    height: 2rem;
  }
  .header-text-logo {
    height: 1.25rem;
  }
}

/* ===== FOOTER ===== */
.app-footer {
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
  margin-top: auto;
}

.footer-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-copy {
  font-size: 0.82rem;
  color: var(--color-text-soft);
}

.footer-links {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.footer-links a {
  font-size: 0.82rem;
  color: var(--color-text-soft);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--color-primary);
}

@media (max-width: 480px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
