<template>
  <div class="lumizle-rules">
    <h3 class="rules-title">Règles</h3>
    <div class="rules-list">
      <div
        v-for="ruleConfig in resolvedRules"
        :key="ruleConfig.id"
        class="rule-item"
      >
        <!-- Mini-grille d'exemple -->
        <div class="rule-preview" aria-hidden="true">
          <div
            class="preview-grid"
            :style="{ gridTemplateColumns: `repeat(${ruleConfig.preview[0].length}, 1fr)` }"
          >
            <div
              v-for="(val, idx) in ruleConfig.preview.flat()"
              :key="idx"
              class="preview-cell"
              :class="val === 1 ? 'preview-cell--dark' : 'preview-cell--light'"
            />
          </div>
        </div>

        <!-- Texte de la règle -->
        <div class="rule-text">
          <span class="rule-icon">{{ ruleConfig.icon }}</span>
          <span class="rule-description">{{ ruleConfig.label }}</span>
        </div>
      </div>
    </div>

    <!-- Légende -->
    <div class="rules-legend">
      <div class="legend-item">
        <div class="legend-swatch legend-swatch--dark" />
        <span>Sombre (fixe)</span>
      </div>
      <div class="legend-item">
        <div class="legend-swatch legend-swatch--light" />
        <span>Clair (fixe)</span>
      </div>
      <div class="legend-item">
        <div class="legend-swatch legend-swatch--unknown" />
        <span>À compléter</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getRuleById } from '../../algorithms/lumizle/rules.js';

const props = defineProps({
  /** Tableau de configs de règles actives : [{id, params?}] */
  rules: { type: Array, required: true },
});

// Libellés complets (remplace {n} dans la description si besoin)
function formatDescription(rule, params) {
  if (!params) return rule.description;
  return rule.description.replace('{n}', params.n ?? '?');
}

const resolvedRules = computed(() =>
  props.rules
    .map(({ id, params }) => {
      const rule = getRuleById(id);
      if (!rule) return null;
      return {
        id,
        icon:    rule.icon,
        label:   formatDescription(rule, params),
        preview: rule.previewSolution,
      };
    })
    .filter(Boolean)
);
</script>

<style scoped>
.lumizle-rules {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  min-width: 180px;
  max-width: 240px;
}

.rules-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #a0a0c0;
  margin: 0 0 0.9rem;
}

/* ── Règles ──────────────────────────────────────────────────────────────── */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Mini-grille 3×3 */
.rule-preview {
  flex-shrink: 0;
}

.preview-grid {
  display: grid;
  gap: 1px;
  width: 42px;
  height: 42px;
  border: 1.5px solid rgba(180,180,200,0.35);
  border-radius: 3px;
  overflow: hidden;
  background: rgba(100,100,120,0.25);
}

.preview-cell {
  width: 100%;
  height: 100%;
}

.preview-cell--dark  { background: #1c1c2e; }
.preview-cell--light { background: #f0f0f8; }

/* Texte */
.rule-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.rule-icon {
  font-size: 1rem;
  line-height: 1;
}

.rule-description {
  font-size: 0.78rem;
  color: #d0d0e8;
  line-height: 1.3;
}

/* ── Légende ─────────────────────────────────────────────────────────────── */
.rules-legend {
  margin-top: 1.2rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255,255,255,0.09);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: #9090b0;
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid rgba(180,180,200,0.3);
  flex-shrink: 0;
}

.legend-swatch--dark    { background: #1c1c2e; }
.legend-swatch--light   { background: #f0f0f8; }
.legend-swatch--unknown { background: #c5c5d0; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .lumizle-rules {
    max-width: 100%;
    padding: 0.75rem 1rem;
  }
  .rules-list { flex-direction: row; flex-wrap: wrap; }
  .rule-item  { flex: 1 1 auto; }
  .rules-legend { display: none; }
}
</style>
