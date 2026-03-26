<template>
  <!-- Mode normal (pas de blur) -->
  <template v-if="!blur">
    <template v-if="authStore.isPremium">
      <slot />
    </template>
    <template v-else>
      <slot name="locked">
        <div class="premium-gate-default">
          <span class="premium-gate-icon">⭐</span>
          <p class="premium-gate-text">
            Fonctionnalité réservée au <strong>Pass Premium</strong>.
          </p>
        </div>
      </slot>
    </template>
  </template>

  <!-- Mode blur : contenu visible mais flouté pour les non-premium -->
  <template v-else>
    <div v-if="authStore.isPremium">
      <slot />
    </div>
    <div v-else class="premium-blur-wrapper">
      <div class="premium-blur-content" aria-hidden="true">
        <slot />
      </div>
      <div class="premium-blur-overlay">
        <div class="premium-blur-card">
          <span class="premium-blur-icon">⭐</span>
          <p class="premium-blur-title">Fonctionnalité Premium</p>
          <p class="premium-blur-desc">
            Accédez à {{ label }} en souscrivant au
            <strong>Pass Premium</strong>.
          </p>
          <button class="premium-blur-cta" @click="handleCta">
            Obtenir le Pass Premium
          </button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useSubscription } from "../composables/useSubscription.js";

const props = defineProps({
  blur: { type: Boolean, default: false },
  label: { type: String, default: "cette fonctionnalité" },
});

const authStore = useAuthStore();
const router = useRouter();
const { startCheckout } = useSubscription();

function handleCta() {
  if (authStore.isLoggedIn) {
    startCheckout();
  } else {
    router.push("/profil");
  }
}
</script>

<style scoped>
.premium-gate-default {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-primary-bg, #fef3c7);
  border: 1.5px solid var(--color-primary-light, #fcd34d);
  border-radius: var(--radius-md, 8px);
  font-size: 0.88rem;
  color: var(--color-text, #1a1a1a);
}
.premium-gate-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}
.premium-gate-text {
  margin: 0;
}

/* ── Mode blur ──────────────────────────────────────────────────────────── */
.premium-blur-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg, 12px);
  min-height: 250px;
}

.premium-blur-content {
  filter: blur(8px);
  pointer-events: none;
  user-select: none;
  opacity: 0.6;
  height: 100%;
}

.premium-blur-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(2px);
  z-index: 10;
}

.premium-blur-card {
  background: var(--color-bg-card, #fff);
  border: 1.5px solid #fcd34d;
  border-radius: var(--radius-xl, 16px);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 400px;
  width: 90%;
  animation: gate-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes gate-pop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.premium-blur-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.premium-blur-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 0.5rem;
}

.premium-blur-desc {
  font-size: 0.95rem;
  color: var(--color-text-soft, #666);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.premium-blur-cta {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.4);
  transition: all 0.2s ease;
}

.premium-blur-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(245, 158, 11, 0.5);
}
</style>
