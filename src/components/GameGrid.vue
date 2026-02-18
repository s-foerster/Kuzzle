<template>
  <div class="game-grid-wrapper">
    <div
      class="game-grid"
      :style="gridStyle"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
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
        @click="$emit('cell-click', cell.row, cell.col)"
        @mousedown="handleCellMouseDown(cell.row, cell.col)"
        @mouseenter="handleCellMouseEnter(cell.row, cell.col)"
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

// État pour le drag
const isMouseDown = ref(false);
const startCell = ref(null);
const hasDragged = ref(false);

function handleMouseDown() {
  isMouseDown.value = true;
}

function handleMouseUp() {
  isMouseDown.value = false;
  startCell.value = null;
  hasDragged.value = false;
}

function handleCellMouseDown(row, col) {
  isMouseDown.value = true;
  startCell.value = { row, col };
  hasDragged.value = false;
}

function handleCellMouseEnter(row, col) {
  if (isMouseDown.value) {
    // Si c'est le premier mouvement, émettre cell-drag pour la cellule de départ d'abord
    if (!hasDragged.value && startCell.value) {
      emit("cell-drag", startCell.value.row, startCell.value.col);
      hasDragged.value = true;
    }
    // Émettre cell-drag pour la cellule actuelle
    emit("cell-drag", row, col);
  }
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
