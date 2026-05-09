<template>
  <Transition name="rules-modal-fade">
    <div v-if="isOpen" class="rules-modal-backdrop">
      <div class="rules-modal-content" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title">
        <!-- En-tête -->
        <div class="rules-modal-header">
          <div class="rules-modal-title-row">
            <h2 id="rules-modal-title" class="rules-modal-title">Règles du niveau</h2>
            <span
              v-if="tierBadge"
              class="tier-badge"
              :class="`tier-badge--${tierBadge.key}`"
            >
              {{ tierBadge.label }}
            </span>
          </div>
          <p class="rules-modal-subtitle">Mémorisez les règles avant de commencer.</p>
        </div>

        <!-- Corps : liste des règles -->
        <div class="rules-modal-body">
          <LumizleRules :rules="rules" />
        </div>

        <!-- Pied : bouton Jouer -->
        <div class="rules-modal-footer">
          <button class="btn-play" @click="$emit('play')">
            Jouer !
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import LumizleRules from './LumizleRules.vue';

defineProps({
  isOpen:    { type: Boolean, default: false },
  rules:     { type: Array,   required: true },
  tierBadge: { type: Object,  default: null },
});

defineEmits(['play']);
</script>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────── */
.rules-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 44, 0.55);
  backdrop-filter: blur(3px);
  padding: 1rem;
}

/* ── Carte modale ──────────────────────────────────────────────────────── */
.rules-modal-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(30, 30, 44, 0.25);
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* ── En-tête ───────────────────────────────────────────────────────────── */
.rules-modal-header {
  padding: 1.5rem 1.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.rules-modal-title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
}

.rules-modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.rules-modal-subtitle {
  font-size: 0.83rem;
  color: var(--color-text-soft);
  margin: 0;
}

/* ── Corps ─────────────────────────────────────────────────────────────── */
.rules-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

/* Overrides pour que LumizleRules s'intègre bien dans le modal */
.rules-modal-body :deep(.lumizle-rules) {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  max-width: 100%;
  min-width: 0;
}

/* ── Pied ──────────────────────────────────────────────────────────────── */
.rules-modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
}

.btn-play {
  width: 100%;
  padding: 0.85rem 2rem;
  background: var(--gradient-primary);
  color: #fff;
  font-family: var(--font-family);
  font-size: 1.05rem;
  font-weight: 800;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-play:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-play:active {
  transform: translateY(0);
}

/* ── Tier badge ────────────────────────────────────────────────────────── */
.tier-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid transparent;
  user-select: none;
}
.tier-badge--facile    { background: rgba(52,199,89,0.14);  color: #2a9c4a; border-color: rgba(52,199,89,0.35); }
.tier-badge--moyen     { background: rgba(0,122,255,0.14);  color: #0b63c4; border-color: rgba(0,122,255,0.35); }
.tier-badge--difficile { background: rgba(255,149,0,0.14);  color: #c86a00; border-color: rgba(255,149,0,0.35); }
.tier-badge--expert    { background: rgba(255,59,48,0.14);  color: #c02a21; border-color: rgba(255,59,48,0.35); }

/* ── Transitions ───────────────────────────────────────────────────────── */
.rules-modal-fade-enter-active,
.rules-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.rules-modal-fade-enter-from,
.rules-modal-fade-leave-to {
  opacity: 0;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* ── Responsive ────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .rules-modal-content {
    max-height: 95vh;
    border-radius: var(--radius-lg);
  }
  .rules-modal-header,
  .rules-modal-body,
  .rules-modal-footer {
    padding-left: 1.1rem;
    padding-right: 1.1rem;
  }
}
</style>
