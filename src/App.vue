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
          <!-- Bouton thème (membres premium uniquement) -->
          <div
            v-if="authStore.isPremium"
            class="theme-picker-wrapper"
            ref="themePickerRef"
          >
            <button
              class="btn-theme"
              @click="themePickerOpen = !themePickerOpen"
              :title="`Thème : ${themeComposable.activeTheme.value.name}`"
              aria-label="Changer de thème"
            >
              {{ themeComposable.activeTheme.value.emoji }}
            </button>
            <Transition name="dropdown-fade">
              <div v-if="themePickerOpen" class="theme-dropdown">
                <p class="theme-dropdown-title">Thème d'icône</p>
                <button
                  v-for="theme in themeComposable.allThemes"
                  :key="theme.id"
                  class="theme-option"
                  :class="{
                    'theme-option--active':
                      themeComposable.activeTheme.value.id === theme.id,
                  }"
                  :disabled="theme.premium && !authStore.isPremium"
                  @click="selectTheme(theme.id)"
                >
                  <span class="theme-option-emoji">{{ theme.emoji }}</span>
                  <span class="theme-option-name">{{ theme.name }}</span>
                  <span
                    v-if="themeComposable.activeTheme.value.id === theme.id"
                    class="theme-option-check"
                    >✓</span
                  >
                </button>
              </div>
            </Transition>
          </div>
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

    <!-- ===== BANNER THÈME SAISONNIER ===== -->
    <Transition name="slide-up">
      <div
        v-if="showSeasonalBanner"
        class="seasonal-banner"
        role="status"
        aria-live="polite"
      >
        <span class="seasonal-banner-emoji">{{
          themeComposable.suggestedTheme.value?.emoji
        }}</span>
        <span class="seasonal-banner-text">
          Thème
          <strong>{{ themeComposable.suggestedTheme.value?.name }}</strong>
          disponible !
        </span>
        <button class="seasonal-banner-apply" @click="applySeasonalTheme">
          Appliquer
        </button>
        <button
          class="seasonal-banner-close"
          @click="dismissSeasonalBanner"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </Transition>

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
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth.js";
import { useTheme } from "./composables/useTheme.js";
import UserAvatar from "./components/UserAvatar.vue";
import TutorialModal from "./components/TutorialModal.vue";
import AuthModal from "./components/Auth/AuthModal.vue";
import CookieBanner from "./components/CookieBanner.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeComposable = useTheme();
const isTutorialOpen = ref(false);
const currentYear = new Date().getFullYear();
const themePickerOpen = ref(false);
const themePickerRef = ref(null);
const seasonalBannerDismissed = ref(false);

/** Afficher le banner saisonnier si applicable et non encore vu cette session */
const showSeasonalBanner = computed(
  () =>
    themeComposable.shouldSuggestSeasonal.value &&
    !seasonalBannerDismissed.value,
);

// Afficher le bouton "retour" uniquement sur les pages de jeu
const showBackButton = computed(() =>
  ["/game", "/lumizle"].includes(route.path),
);

function selectTheme(id) {
  themeComposable.setTheme(id);
  themePickerOpen.value = false;
}

function applySeasonalTheme() {
  if (themeComposable.suggestedTheme.value) {
    themeComposable.setTheme(themeComposable.suggestedTheme.value.id);
  }
  seasonalBannerDismissed.value = true;
}

function dismissSeasonalBanner() {
  seasonalBannerDismissed.value = true;
}

// Fermer le dropdown en cliquant à l'extérieur
function handleOutsideClick(e) {
  if (themePickerRef.value && !themePickerRef.value.contains(e.target)) {
    themePickerOpen.value = false;
  }
}
onMounted(() => document.addEventListener("mousedown", handleOutsideClick));
onUnmounted(() =>
  document.removeEventListener("mousedown", handleOutsideClick),
);

// Sync thème depuis Supabase après chargement du profil
watch(
  () => authStore.preferredTheme,
  (serverTheme) => {
    if (serverTheme) themeComposable.syncFromServer(serverTheme);
  },
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

/* ===== THEME PICKER ===== */
.theme-picker-wrapper {
  position: relative;
}

.btn-theme {
  background: transparent;
  border: 1.5px solid var(--color-border);
  border-radius: 50%;
  width: 2.1rem;
  height: 2.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  padding: 0;
  line-height: 1;
}
.btn-theme:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.13);
  min-width: 180px;
  z-index: 200;
  padding: 0.5rem 0.4rem;
}

.theme-dropdown-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem 0.4rem;
  margin: 0;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.55rem;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.9rem;
  color: var(--color-text);
  text-align: left;
  transition: background 0.15s;
}
.theme-option:hover:not(:disabled) {
  background: var(--color-bg-muted);
}
.theme-option--active {
  background: var(--color-primary-bg);
  font-weight: 700;
}
.theme-option:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.theme-option-emoji {
  font-size: 1.15rem;
  flex-shrink: 0;
}
.theme-option-name {
  flex: 1;
}
.theme-option-check {
  color: var(--color-primary);
  font-weight: 800;
  font-size: 0.85rem;
}

/* Dropdown animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ===== BANNER THÈME SAISONNIER ===== */
.seasonal-banner {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  border: 1.5px solid #f59e0b;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  z-index: 300;
  white-space: nowrap;
  max-width: calc(100vw - 2rem);
}

.seasonal-banner-emoji {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.seasonal-banner-text {
  font-size: 0.9rem;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.seasonal-banner-apply {
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.8rem;
  font-family: var(--font-family);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.seasonal-banner-apply:hover {
  background: #d97706;
}
.seasonal-banner-close {
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem 0.3rem;
  flex-shrink: 0;
  transition: color 0.2s;
}
.seasonal-banner-close:hover {
  color: var(--color-text);
}

/* Banner animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
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
