<template>
  <!-- Mode normal (pas de blur) -->
  <template v-if="!blur">
    <template v-if="authStore.isPremium">
      <slot />
    </template>
    <template v-else>
      <slot name="locked">
        <button class="premium-gate-default" @click="handleCta">
          <span class="premium-gate-icon">⭐</span>
          <span>Essai gratuit 7 jours - débloquer {{ label }}</span>
        </button>
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
        <button class="premium-blur-hint" @click="handleCta">
          <span class="premium-blur-icon">⭐</span>
          <span>Essai gratuit 7 jours - débloquer {{ label }}</span>
        </button>
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
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: var(--color-primary-bg, #fef3c7);
  border: 1.5px solid var(--color-primary-light, #fcd34d);
  border-radius: var(--radius-md, 8px);
  font-size: 0.82rem;
  font-family: var(--font-family);
  color: var(--color-text-soft, #666);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.premium-gate-default:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.premium-gate-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* ── Mode blur ──────────────────────────────────────────────────────────── */
.premium-blur-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg, 12px);
  min-height: 100px;
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

.premium-blur-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 1rem;
  background: var(--color-primary-bg, #fef3c7);
  border: 1.5px solid var(--color-primary-light, #fcd34d);
  border-radius: var(--radius-md, 8px);
  font-size: 0.82rem;
  font-family: var(--font-family);
  color: var(--color-text-soft, #666);
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: gate-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: all 0.2s ease;
}

.premium-blur-hint:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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
  font-size: 1.1rem;
}
</style>
