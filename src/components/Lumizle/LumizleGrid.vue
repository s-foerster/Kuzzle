<template>
  <div class="lumizle-grid-wrapper">
    <div
      class="lumizle-grid"
      :style="gridStyle"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart.passive="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.passive="handleTouchEnd"
    >
      <LumizleCell
        v-for="cell in allCells"
        :key="`${cell.r}-${cell.c}`"
        :value="effectiveValue(cell.r, cell.c)"
        :is-fixed="fixedCells.has(`${cell.r},${cell.c}`)"
        :is-violating="violatingCells.has(`${cell.r},${cell.c}`)"
        :is-won="isWon"
        :row="cell.r"
        :col="cell.c"
        @click="handleCellClick(cell.r, cell.c)"
        @mousedown.stop="handleCellMouseDown(cell.r, cell.c)"
        @mouseenter="handleCellMouseEnter(cell.r, cell.c)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LumizleCell from './LumizleCell.vue';
import { CELL_UNKNOWN } from '../../algorithms/lumizle/rules.js';

const props = defineProps({
  gameState:      { type: Array,   required: true },
  initialGrid:    { type: Array,   required: true },
  fixedCells:     { type: Set,     required: true },
  violatingCells: { type: Set,     required: true },
  gridSize:       { type: Number,  default: 7 },
  isWon:          { type: Boolean, default: false },
});

const emit = defineEmits(['cell-click', 'cell-drag']);

// ── Helpers ───────────────────────────────────────────────────────────────

function effectiveValue(r, c) {
  const fixed = props.initialGrid?.[r]?.[c];
  if (fixed) return fixed;
  return props.gameState?.[r]?.[c] ?? CELL_UNKNOWN;
}

// ── Layout ────────────────────────────────────────────────────────────────

const allCells = computed(() => {
  const cells = [];
  for (let r = 0; r < props.gridSize; r++)
    for (let c = 0; c < props.gridSize; c++)
      cells.push({ r, c });
  return cells;
});

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.gridSize}, 1fr)`,
  gridTemplateRows:    `repeat(${props.gridSize}, 1fr)`,
  gap: '0',
  width: '100%',
  maxWidth: '480px',
  aspectRatio: '1 / 1',
  margin: '0 auto',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '3px solid #2c2c3a',
}));

// ── Suppression des faux événements souris après touch ──────────────────

let lastTouchEnd = 0;
const TOUCH_MOUSE_DELAY = 500;
function isSyntheticMouse() {
  return Date.now() - lastTouchEnd < TOUCH_MOUSE_DELAY;
}

// ── Drag souris ───────────────────────────────────────────────────────────

const isMouseDown    = ref(false);
const hasDragged     = ref(false);
const startCell      = ref(null);
/** Valeur cible lors du drag (déterminée par le cycle de la première cellule) */
const dragTarget     = ref(CELL_UNKNOWN);

function computeDragTarget(r, c) {
  // Même cycle que le clic : UNKNOWN→DARK→LIGHT→UNKNOWN
  const cur = effectiveValue(r, c);
  if (props.fixedCells.has(`${r},${c}`)) return cur; // fixe, pas de drag
  return cur === CELL_UNKNOWN ? 1 : cur === 1 ? 2 : CELL_UNKNOWN;
}

function handleMouseDown() {
  if (isSyntheticMouse()) return;
  isMouseDown.value = true;
}

function handleMouseUp() {
  isMouseDown.value = false;
  startCell.value   = null;
  // hasDragged réinitialisé dans handleCellClick
}

function handleCellMouseDown(r, c) {
  if (isSyntheticMouse()) return;
  isMouseDown.value = true;
  startCell.value   = { r, c };
  hasDragged.value  = false;
  dragTarget.value  = computeDragTarget(r, c);
}

function handleCellMouseEnter(r, c) {
  if (isSyntheticMouse()) return;
  if (!isMouseDown.value) return;

  if (!hasDragged.value && startCell.value) {
    // Émettre la 1ère cellule (la cellule de départ du drag)
    emit('cell-drag', startCell.value.r, startCell.value.c, dragTarget.value);
    hasDragged.value = true;
  }
  emit('cell-drag', r, c, dragTarget.value);
}

function handleCellClick(r, c) {
  if (isSyntheticMouse()) return;
  const wasDrag = hasDragged.value;
  hasDragged.value = false;
  if (!wasDrag) emit('cell-click', r, c);
}

// ── Drag tactile ──────────────────────────────────────────────────────────

const isTouching       = ref(false);
const touchStartCell   = ref(null);
const touchHasDragged  = ref(false);
const touchDragTarget  = ref(CELL_UNKNOWN);

function cellFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const cellEl = el.closest('[data-row]');
  if (!cellEl) return null;
  return {
    r: parseInt(cellEl.dataset.row, 10),
    c: parseInt(cellEl.dataset.col, 10),
  };
}

function handleTouchStart(e) {
  if (props.isWon) return;
  isTouching.value     = true;
  touchHasDragged.value = false;
  const t = e.touches[0];
  const cell = cellFromPoint(t.clientX, t.clientY);
  touchStartCell.value  = cell;
  if (cell) touchDragTarget.value = computeDragTarget(cell.r, cell.c);
}

function handleTouchMove(e) {
  if (!isTouching.value || props.isWon) return;
  const t    = e.touches[0];
  const cell = cellFromPoint(t.clientX, t.clientY);
  if (!cell) return;

  if (!touchHasDragged.value && touchStartCell.value) {
    emit('cell-drag', touchStartCell.value.r, touchStartCell.value.c, touchDragTarget.value);
    touchHasDragged.value = true;
  }
  emit('cell-drag', cell.r, cell.c, touchDragTarget.value);
}

function handleTouchEnd() {
  lastTouchEnd = Date.now();
  if (!touchHasDragged.value && touchStartCell.value) {
    emit('cell-click', touchStartCell.value.r, touchStartCell.value.c);
  }
  isTouching.value      = false;
  touchStartCell.value  = null;
  touchHasDragged.value = false;
}
</script>

<style scoped>
.lumizle-grid-wrapper {
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.lumizle-grid {
  box-shadow: 0 4px 24px rgba(28, 28, 46, 0.18);
  background-color: #c5c5d0; /* couleur "vide" des cellules, visible si gap > 0 */
  position: relative;
}

@media (max-width: 768px) {
  .lumizle-grid-wrapper { padding: 0.5rem; }
}
@media (max-width: 480px) {
  .lumizle-grid-wrapper { padding: 0.25rem; }
}
</style>
