<template>
  <Transition name="result-sync-fade">
    <div
      v-if="visible"
      class="result-sync"
      :class="`result-sync--${status}`"
      role="status"
      aria-live="polite"
    >
      <span class="result-sync-dot" aria-hidden="true"></span>
      <span class="result-sync-label">{{ label }}</span>
      <button
        v-if="status === 'pending'"
        type="button"
        class="result-sync-retry"
        @click="$emit('retry')"
      >
        Réessayer
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: { type: String, default: "idle" },
  message: { type: String, default: "" },
});

defineEmits(["retry"]);

const visible = computed(() =>
  ["syncing", "pending", "invalid"].includes(props.status),
);
const label = computed(() => {
  if (props.status === "syncing") return "Enregistrement du score…";
  if (props.status === "pending") {
    return props.message || "Score en attente de synchronisation";
  }
  return "Score non classé : statistiques incomplètes";
});
</script>

<style scoped>
.result-sync {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 1.75rem;
  color: var(--color-text-muted, #6b6470);
  font-size: 0.78rem;
  line-height: 1.25;
}

.result-sync-dot {
  width: 0.45rem;
  height: 0.45rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
}

.result-sync--syncing .result-sync-dot {
  animation: result-sync-pulse 900ms ease-in-out infinite alternate;
}

.result-sync--pending {
  color: var(--color-warning, #a16207);
}

.result-sync--invalid {
  color: var(--color-text-muted, #6b6470);
}

.result-sync-retry {
  border: 0;
  padding: 0.2rem 0.35rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 0.16rem;
  cursor: pointer;
  transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
}

.result-sync-retry:active {
  transform: scale(0.97);
}

.result-sync-retry:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 0.2rem;
}

.result-sync-fade-enter-active,
.result-sync-fade-leave-active {
  transition: opacity 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.result-sync-fade-enter-from,
.result-sync-fade-leave-to {
  opacity: 0;
}

@keyframes result-sync-pulse {
  from {
    opacity: 0.35;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-sync--syncing .result-sync-dot {
    animation: none;
  }
}
</style>
