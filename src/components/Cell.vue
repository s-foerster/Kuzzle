<template>
  <div
    class="cell"
    :class="cellClasses"
    :data-row="row"
    :data-col="col"
    @click="$emit('click')"
    :aria-label="ariaLabel"
    role="button"
    tabindex="0"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <Transition name="icon-pop">
      <div class="cell-content" v-if="state !== 0" :key="state">
        <component :is="activeTheme.icon" v-if="state === 2" class="icon" />
        <svg
          v-if="state === 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-cross"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </Transition>
    <span
      v-if="hasSolutionHeart"
      class="solution-indicator"
      title="Solution: ❤️ ici"
      >•</span
    >
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "../composables/useTheme.js";

const props = defineProps({
  state: {
    type: Number,
    required: true,
    validator: (value) => [0, 1, 2].includes(value),
  },
  zoneId: {
    type: Number,
    required: true,
  },
  row: {
    type: Number,
    required: true,
  },
  col: {
    type: Number,
    required: true,
  },
  isWon: {
    type: Boolean,
    default: false,
  },
  hasSolutionHeart: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);

const { activeTheme } = useTheme();

const cellClasses = computed(() => {
  return {
    [`zone-${props.zoneId}`]: true,
    "cell-empty": props.state === 0,
    "cell-x": props.state === 1,
    "cell-heart": props.state === 2,
    "cell-won": props.isWon,
    "cell-has-solution": props.hasSolutionHeart,
  };
});

const ariaLabel = computed(() => {
  const stateName =
    props.state === 0 ? "vide" : props.state === 1 ? "croix" : "cœur";
  return `Cellule ligne ${props.row + 1}, colonne ${props.col + 1}, ${stateName}`;
});
</script>

<style scoped>
.cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  background-color: var(--cell-bg, #ffffff);
  /* Lignes de grille plus subtiles, à l'intérieur */
  box-shadow: inset 0 0 0 1px #e0e0e0;
  position: relative;
  /* border-radius handling comes from parent style binding */
}

.cell:hover {
  background-color: #f5f5f5;
  z-index: 5; /* Lower than zone borders (20) */
}

.cell:active {
  transform: scale(0.95);
}

.cell:focus {
  outline: 2px solid #4caf50;
  outline-offset: -2px;
  z-index: 10;
}

.cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.icon {
  width: 60%;
  height: 60%;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1));
}

.icon-heart {
  /* color managed by svg defs */
}

.icon-cross {
  color: #bdbdbd; /* Lighter Grey 400 */
  stroke-width: 2px;
  stroke-linecap: round;
  opacity: 0.6; /* More discreet */
  transition: opacity 0.2s ease;
}

.cell:hover .icon-cross {
  opacity: 0.9;
}

/* Vue Transitions */
.icon-pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative; /* Ensure entering element stays in flow or stacks correctly */
  z-index: 2;
}

.icon-pop-leave-active {
  animation: pop-out 0.2s ease-in;
  position: absolute; /* Remove from flow so it overlaps */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.solution-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  font-size: 0;
  box-shadow: 0 0 4px rgba(255, 68, 68, 0.6);
  pointer-events: none;
  animation: pulse-solution 2s ease-in-out infinite;
}

@keyframes pulse-solution {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.cell-has-solution {
  background-color: rgba(255, 68, 68, 0.05) !important;
}

.cell-won {
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Couleurs des zones — utilisent des variables CSS injectées par useTheme via GameGrid */
.zone-0 {
  --cell-bg: var(--zone-color-0, #fff0f2);
}
.zone-1 {
  --cell-bg: var(--zone-color-1, #fff8f0);
}
.zone-2 {
  --cell-bg: var(--zone-color-2, #fff5fa);
}
.zone-3 {
  --cell-bg: var(--zone-color-3, #f7f0ff);
}
.zone-4 {
  --cell-bg: var(--zone-color-4, #f0f8ff);
}
.zone-5 {
  --cell-bg: var(--zone-color-5, #f0fff5);
}
.zone-6 {
  --cell-bg: var(--zone-color-6, #fffbf0);
}
.zone-7 {
  --cell-bg: var(--zone-color-7, #fef0f0);
}
.zone-8 {
  --cell-bg: var(--zone-color-8, #f5f0ff);
}
.zone-9 {
  --cell-bg: var(--zone-color-9, #f0fafa);
}
</style>
