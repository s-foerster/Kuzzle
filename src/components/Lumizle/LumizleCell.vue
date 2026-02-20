<template>
  <div
    class="lumizle-cell"
    :class="cellClasses"
    :data-row="row"
    :data-col="col"
    :aria-label="ariaLabel"
    role="button"
    :tabindex="isFixed ? -1 : 0"
    @keydown.enter.prevent="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <!-- Indicateur de cellule fixe (coin doré) -->
    <span v-if="isFixed" class="fixed-marker" aria-hidden="true" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Valeur effective : 0=inconnu, 1=sombre, 2=clair */
  value:      { type: Number, required: true },
  /** La cellule est-elle un indice fixe ? */
  isFixed:    { type: Boolean, default: false },
  /** La cellule est-elle en violation de règle ? */
  isViolating:{ type: Boolean, default: false },
  /** La partie est-elle gagnée ? */
  isWon:      { type: Boolean, default: false },
  row:        { type: Number, required: true },
  col:        { type: Number, required: true },
});

defineEmits(['click']);

const cellClasses = computed(() => ({
  // État de la cellule
  'cell--unknown': props.value === 0,
  'cell--dark':    props.value === 1,
  'cell--light':   props.value === 2,

  // Origine
  'cell--fixed':  props.isFixed,
  'cell--player': !props.isFixed && props.value !== 0,

  // Violation : contour rouge
  'cell--violating': props.isViolating && !props.isWon,

  // Victoire
  'cell--won': props.isWon,
}));

const ariaLabel = computed(() => {
  const stateLabel = props.value === 0 ? 'vide'
    : props.value === 1 ? 'sombre'
    : 'clair';
  const fixedLabel = props.isFixed ? ' (indice fixe)' : '';
  return `Cellule ligne ${props.row + 1}, colonne ${props.col + 1} : ${stateLabel}${fixedLabel}`;
});
</script>

<style scoped>
.lumizle-cell {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.12s ease, box-shadow 0.12s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Grille : fine ligne de séparation via outline intérieur */
  outline: 1px solid rgba(100, 100, 120, 0.25);
  outline-offset: -0.5px;
}

/* ── États de valeur ─────────────────────────────────────────────────────── */
.cell--unknown {
  background-color: #c5c5d0;
}

/* Cellule sombre posée par le joueur */
.cell--dark.cell--player {
  background-color: #2e2e3e;
}

/* Cellule claire posée par le joueur */
.cell--light.cell--player {
  background-color: #f0f0f8;
}

/* Cellule sombre fixe (indice) : légèrement plus contrastée */
.cell--dark.cell--fixed {
  background-color: #111120;
  cursor: default;
}

/* Cellule claire fixe (indice) */
.cell--light.cell--fixed {
  background-color: #ffffff;
  cursor: default;
}

/* ── Marqueur coin doré pour les cellules fixes ─────────────────────────── */
.fixed-marker {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Coins dorés en pseudo-éléments pour distinguer les indices visuellement */
.cell--fixed .fixed-marker::before,
.cell--fixed .fixed-marker::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-color: #b8982a;
  border-style: solid;
}

.cell--dark.cell--fixed .fixed-marker::before {
  border-color: #c9a832;
}

.cell--dark.cell--fixed .fixed-marker::after {
  border-color: #c9a832;
}

/* Coin haut-gauche */
.cell--fixed .fixed-marker::before {
  top: 2px;
  left: 2px;
  border-width: 2px 0 0 2px;
}

/* Coin bas-droite */
.cell--fixed .fixed-marker::after {
  bottom: 2px;
  right: 2px;
  border-width: 0 2px 2px 0;
}

/* ── Violation : contour rouge ──────────────────────────────────────────── */
.cell--violating {
  box-shadow: inset 0 0 0 2.5px #ef4444, 0 0 6px rgba(239, 68, 68, 0.45);
  animation: violation-pulse 1.4s ease-in-out infinite;
  z-index: 1;
}

@keyframes violation-pulse {
  0%,  100% { box-shadow: inset 0 0 0 2.5px #ef4444, 0 0 6px rgba(239, 68, 68, 0.35); }
  50%        { box-shadow: inset 0 0 0 2.5px #f87171, 0 0 12px rgba(239, 68, 68, 0.60); }
}

/* ── Victoire ────────────────────────────────────────────────────────────── */
.cell--won.cell--dark  { background-color: #1a1a2e; }
.cell--won.cell--light { background-color: #f8f8ff; }

/* ── Hover / focus ───────────────────────────────────────────────────────── */
.lumizle-cell:not(.cell--fixed):hover {
  filter: brightness(1.12);
}

.lumizle-cell:not(.cell--fixed):focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: -2px;
  z-index: 2;
}

/* Clic : micro-scale pour le feedback tactile */
.lumizle-cell:not(.cell--fixed):active {
  transform: scale(0.94);
}
</style>
