<template>
  <div class="game-grid-wrapper">
    <div
      class="game-grid"
      :style="gridStyle"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <ZoneOverlay :zones="zones" :grid-size="gridSize" />
      <Cell
        v-for="cell in allCells"
        :key="`cell-${cell.row}-${cell.col}`"
        :state="gameState?.[cell.row]?.[cell.col] ?? 0"
        :zone-id="zones?.[cell.row]?.[cell.col] ?? 0"
        :row="cell.row"
        :col="cell.col"
        :is-won="isWon"
        :has-solution-heart="showSolution && !!solution?.[cell.row]?.[cell.col]"
        @mousedown="handleCellMouseDown(cell.row, cell.col)"
        @mouseenter="handleCellMouseEnter(cell.row, cell.col)"
        @click="handleCellClick(cell.row, cell.col)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Cell from "./Cell.vue";
import ZoneOverlay from "./ZoneOverlay.vue";

const props = defineProps({
  gameState: {
    type: Array,
    required: true,
  },
  zones: {
    type: Array,
    required: true,
  },
  solution: {
    type: Array,
    default: null,
  },
  showSolution: {
    type: Boolean,
    default: false,
  },
  gridSize: {
    type: Number,
    default: 10,
  },
  isWon: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["cell-click", "cell-drag"]);

// Flag pour ignorer les événements souris synthétiques générés après un touch
let lastTouchEnd = 0;
const TOUCH_MOUSE_IGNORE_DELAY = 500; // ms

function isSyntheticMouseEvent() {
  return Date.now() - lastTouchEnd < TOUCH_MOUSE_IGNORE_DELAY;
}

// ===== Mouse drag =====
const isMouseDown = ref(false);
const startCell = ref(null);
const hasDragged = ref(false);

function handleMouseDown() {
  if (isSyntheticMouseEvent()) return;
  isMouseDown.value = true;
}

function handleMouseUp() {
  isMouseDown.value = false;
  startCell.value = null;
  // Ne pas reset hasDragged ici : handleCellClick en a besoin juste après (mouseup → click)
  // Il sera reset dans handleCellClick ou au prochain mousedown
}

function handleCellMouseDown(row, col) {
  if (isSyntheticMouseEvent()) return;
  isMouseDown.value = true;
  startCell.value = { row, col };
  hasDragged.value = false; // reset au début de chaque interaction
}

function handleCellMouseEnter(row, col) {
  if (isSyntheticMouseEvent()) return;
  if (isMouseDown.value) {
    if (!hasDragged.value && startCell.value) {
      emit("cell-drag", startCell.value.row, startCell.value.col);
      hasDragged.value = true;
    }
    emit("cell-drag", row, col);
  }
}

function handleCellClick(row, col) {
  // Ignoré sur mobile : les clics sont gérés par handleTouchEnd
  if (isSyntheticMouseEvent()) return;
  // Sur desktop : ne pas émettre cell-click si c'était un drag
  const wasDrag = hasDragged.value;
  hasDragged.value = false; // reset pour la prochaine interaction
  if (!wasDrag) {
    emit("cell-click", row, col);
  }
}

// ===== Touch drag =====
const isTouching = ref(false);
const touchStartCell = ref(null);
const touchHasDragged = ref(false);

function getCellFromPoint(x, y) {
  // Trouve la cellule Vue sous le point (x, y)
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const cellEl = el.closest("[data-row]");
  if (!cellEl) return null;
  return {
    row: parseInt(cellEl.dataset.row),
    col: parseInt(cellEl.dataset.col),
  };
}

function handleTouchStart(e) {
  if (props.isWon) return;
  isTouching.value = true;
  touchHasDragged.value = false;
  const touch = e.touches[0];
  const cell = getCellFromPoint(touch.clientX, touch.clientY);
  touchStartCell.value = cell;
}

function handleTouchMove(e) {
  if (!isTouching.value || props.isWon) return;
  const touch = e.touches[0];
  const cell = getCellFromPoint(touch.clientX, touch.clientY);
  if (!cell) return;

  if (!touchHasDragged.value && touchStartCell.value) {
    emit("cell-drag", touchStartCell.value.row, touchStartCell.value.col);
    touchHasDragged.value = true;
  }
  emit("cell-drag", cell.row, cell.col);
}

function handleTouchEnd(e) {
  // Mémoriser le timestamp pour ignorer les événements souris synthétiques
  // que le navigateur génère ~300ms après un touch
  lastTouchEnd = Date.now();
  // Si pas de mouvement → traiter comme un clic
  if (!touchHasDragged.value && touchStartCell.value) {
    emit("cell-click", touchStartCell.value.row, touchStartCell.value.col);
  }
  isTouching.value = false;
  touchStartCell.value = null;
  touchHasDragged.value = false;
}

// Créer un tableau plat de toutes les cellules
const allCells = computed(() => {
  const cells = [];
  for (let row = 0; row < props.gridSize; row++) {
    for (let col = 0; col < props.gridSize; col++) {
      cells.push({ row, col });
    }
  }
  return cells;
});

const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${props.gridSize}, 1fr)`,
  gridTemplateRows: `repeat(${props.gridSize}, 1fr)`,
  gap: "0",
  width: "100%",
  maxWidth: "480px",
  aspectRatio: "1 / 1",
  margin: "0 auto",
  borderRadius: "10px",
  overflow: "hidden",
  border: "3px solid #2c2c3a",
}));
</script>

<style scoped>
.game-grid-wrapper {
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.game-grid {
  box-shadow: 0 4px 20px rgba(44, 44, 58, 0.12);
  background-color: #fff;
  position: relative;
}

@media (max-width: 768px) {
  .game-grid-wrapper {
    padding: 0.25rem;
  }
}

@media (max-width: 480px) {
  .game-grid-wrapper {
    padding: 0;
  }
}
</style>
