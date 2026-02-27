<template>
  <!--
    PremiumGate.vue — Composant de verrouillage des features premium

    Usage :
      <PremiumGate>
        <!-- Contenu accessible uniquement aux utilisateurs Premium -->
        <FeaturePremium />

        <!-- Slot "locked" : affiché si l'utilisateur n'est pas premium -->
        <template #locked>
          <p>Cette fonctionnalité est réservée aux membres Premium.</p>
        </template>
      </PremiumGate>

    Si aucun slot "locked" n'est fourni, un message par défaut est affiché.
  -->
  <template v-if="authStore.isPremium">
    <slot />
  </template>
  <template v-else>
    <slot name="locked">
      <!-- Fallback si aucun slot "locked" fourni -->
      <div class="premium-gate-default">
        <span class="premium-gate-icon">⭐</span>
        <p class="premium-gate-text">Fonctionnalité réservée au <strong>Pass Premium</strong>.</p>
      </div>
    </slot>
  </template>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
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
.premium-gate-icon { font-size: 1.1rem; flex-shrink: 0; }
.premium-gate-text { margin: 0; }
</style>
