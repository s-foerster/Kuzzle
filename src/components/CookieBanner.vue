<template>
  <Transition name="cookie-slide">
    <div
      v-if="visible"
      class="cookie-banner"
      role="dialog"
      aria-label="Consentement aux cookies"
    >
      <div class="cookie-inner">
        <div class="cookie-text">
          <span class="cookie-icon">🍪</span>
          <p>
            Ce site utilise uniquement des
            <strong>cookies techniques nécessaires</strong>
            à son fonctionnement (authentification, préférences de jeu). Aucun
            cookie publicitaire ni de tracking.
            <RouterLink to="/politique-confidentialite"
              >En savoir plus</RouterLink
            >
          </p>
        </div>
        <div class="cookie-actions">
          <button class="btn-accept" @click="accept">J'accepte</button>
          <button class="btn-refuse" @click="refuse">Refuser</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const STORAGE_KEY = "rubihgames-cookie-consent";
const visible = ref(false);

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    visible.value = true;
  }
});

function accept() {
  localStorage.setItem(STORAGE_KEY, "accepted");
  visible.value = false;
}

function refuse() {
  // Seuls les cookies nécessaires sont utilisés de toute façon,
  // mais on respecte le choix de l'utilisateur en le mémorisant.
  localStorage.setItem(STORAGE_KEY, "essential");
  visible.value = false;
}
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--color-bg-card);
  border-top: 2px solid var(--color-border);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
}

.cookie-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cookie-text {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 260px;
}

.cookie-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 0.05rem;
}

.cookie-text p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-text-soft);
  line-height: 1.55;
}

.cookie-text p strong {
  color: var(--color-text);
}

.cookie-text a {
  color: var(--color-primary);
  text-decoration: underline;
  white-space: nowrap;
}

.cookie-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-accept {
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-family: var(--font-family);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-accept:hover {
  opacity: 0.85;
}

.btn-refuse {
  background: transparent;
  color: var(--color-text-soft);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-family: var(--font-family);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refuse:hover {
  border-color: var(--color-text-soft);
  color: var(--color-text);
}

/* Animation */
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}

.cookie-slide-enter-from,
.cookie-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 560px) {
  .cookie-inner {
    flex-direction: column;
    gap: 0.85rem;
  }
  .cookie-actions {
    width: 100%;
  }
  .btn-accept,
  .btn-refuse {
    flex: 1;
    text-align: center;
  }
}
</style>
