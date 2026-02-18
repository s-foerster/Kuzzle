<template>
  <div class="rules-body">
    <!-- SVG defs partagées -->
    <svg
      style="position: absolute; width: 0; height: 0; overflow: hidden"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hg-rules" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #ff5252; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #d50000; stop-opacity: 1" />
        </linearGradient>
        <filter id="hs-rules" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            flood-color="rgba(213,0,0,0.3)"
          />
        </filter>
      </defs>
    </svg>

    <!-- Règle 1 : Cliquer -->
    <div class="rule-col">
      <div class="rule-anim">
        <div class="click-demo-wrapper">
          <div class="demo-cell" :class="cellStateClass">
            <Transition name="icon-pop">
              <div class="cell-content" v-if="cellState !== 0" :key="cellState">
                <svg
                  v-if="cellState === 2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="icon"
                >
                  <path
                    fill="url(#hg-rules)"
                    filter="url(#hs-rules)"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                <svg
                  v-if="cellState === 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="icon icon-cross"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </Transition>
          </div>
          <div class="hand-cursor" :class="{ tapping: isTapping }">👆</div>
        </div>
      </div>
      <div class="rule-text">
        <h4>Cliquer</h4>
        <p>1× = croix &nbsp; 2× = cœur ❤️</p>
      </div>
    </div>

    <div class="rule-divider"></div>

    <!-- Règle 2 : 2 cœurs -->
    <div class="rule-col">
      <div class="rule-anim">
        <div class="demo-grid-wrapper">
          <!-- Cells -->
          <div class="demo-grid">
            <div
              v-for="cell in demoGridCells"
              :key="`${cell.row}-${cell.col}`"
              class="demo-grid-cell"
              :class="`demo-zone-${cell.zone}`"
            >
              <svg
                v-if="cell.heart"
                class="demo-heart-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="url(#hg-rules)"
                  filter="url(#hs-rules)"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </div>
          </div>
          <!-- SVG overlay: highlights + zone borders -->
          <svg
            class="demo-overlay-svg"
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              v-for="(rect, i) in demoHighlightRects"
              :key="`hl-${i}`"
              :x="rect.x" :y="rect.y" :width="rect.w" :height="rect.h"
              :fill="demoHighlightColor"
              opacity="0.3"
              style="transition: opacity 0.3s"
            />
            <path
              v-for="(d, i) in demoZonePaths"
              :key="`zp-${i}`"
              :d="d"
              fill="none"
              stroke="#1a1a2e"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.7"
            />
          </svg>
          <!-- Label -->
          <div class="demo-hl-label" :class="{ visible: demoLabelVisible }">
            {{ demoHighlightLabel }}
          </div>
        </div>
      </div>
      <div class="rule-text">
        <h4>Règle des 2</h4>
        <p>Exactement <strong>2 cœurs</strong> par ligne, colonne et zone</p>
      </div>
    </div>

    <div class="rule-divider"></div>

    <!-- Règle 3 : Pas de contact -->
    <div class="rule-col">
      <div class="rule-anim">
        <div class="neighbor-grid">
          <div class="neighbor-cell center-cell">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="icon"
            >
              <path
                fill="url(#hg-rules)"
                filter="url(#hs-rules)"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
          <div
            v-for="i in 8"
            :key="i"
            class="neighbor-cell adj-cell"
            :class="`adj-${i}`"
          >
            <span class="forbidden-overlay">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                class="icon icon-cross"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div class="rule-text">
        <h4>Pas de contact</h4>
        <p>Les cœurs ne se touchent pas, même en diagonale</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// ===== Animation 1 : Click demo =====
const cellState = ref(0);
const isTapping = ref(false);
let clickTimeout;

const cellStateClass = computed(() => ({
  "cell-empty": cellState.value === 0,
  "cell-cross": cellState.value === 1,
  "cell-heart": cellState.value === 2,
}));

const triggerTap = () => {
  isTapping.value = true;
  setTimeout(() => {
    isTapping.value = false;
  }, 300);
};

const runClickSequence = async () => {
  cellState.value = 0;
  await new Promise((r) => setTimeout(r, 800));
  triggerTap();
  await new Promise((r) => setTimeout(r, 150));
  cellState.value = 1;
  await new Promise((r) => setTimeout(r, 350));
  await new Promise((r) => setTimeout(r, 800));
  triggerTap();
  await new Promise((r) => setTimeout(r, 150));
  cellState.value = 2;
  await new Promise((r) => setTimeout(r, 350));
  await new Promise((r) => setTimeout(r, 1500));
  triggerTap();
  await new Promise((r) => setTimeout(r, 150));
  cellState.value = 0;
  await new Promise((r) => setTimeout(r, 350));
  clickTimeout = setTimeout(runClickSequence, 500);
};

// ===== Animation 2 : Real puzzle demo =====
const DEMO_N = 8;
const DEMO_S = 16; // px per cell

const demoZones = [
  [1, 3, 3, 3, 0, 0, 0, 4],
  [1, 1, 1, 3, 0, 2, 4, 4],
  [3, 3, 3, 3, 2, 2, 2, 4],
  [3, 3, 3, 3, 5, 4, 4, 4],
  [3, 5, 5, 5, 5, 4, 4, 4],
  [3, 5, 5, 5, 5, 4, 6, 4],
  [7, 7, 5, 7, 6, 6, 6, 6],
  [7, 7, 7, 7, 6, 6, 6, 6],
];

const demoSolution = [
  [false, false, false, false, true,  false, true,  false],
  [true,  false, true,  false, false, false, false, false],
  [false, false, false, false, true,  false, true,  false],
  [true,  false, true,  false, false, false, false, false],
  [false, false, false, false, false, true,  false, true ],
  [false, true,  false, true,  false, false, false, false],
  [false, false, false, false, false, true,  false, true ],
  [false, true,  false, true,  false, false, false, false],
];

const demoGridCells = [];
for (let r = 0; r < DEMO_N; r++) {
  for (let c = 0; c < DEMO_N; c++) {
    demoGridCells.push({ row: r, col: c, zone: demoZones[r][c], heart: demoSolution[r][c] });
  }
}

function buildDemoZonePaths() {
  const zoneMap = {};
  for (let r = 0; r < DEMO_N; r++) {
    for (let c = 0; c < DEMO_N; c++) {
      const z = demoZones[r][c];
      if (!zoneMap[z]) zoneMap[z] = [];
      zoneMap[z].push({ r, c });
    }
  }
  return Object.values(zoneMap).map((cells) => {
    const set = new Set(cells.map(({ r, c }) => `${r},${c}`));
    let d = "";
    cells.forEach(({ r, c }) => {
      const x = c * DEMO_S, y = r * DEMO_S, s = DEMO_S;
      if (!set.has(`${r - 1},${c}`)) d += `M${x},${y} L${x + s},${y} `;
      if (!set.has(`${r + 1},${c}`)) d += `M${x},${y + s} L${x + s},${y + s} `;
      if (!set.has(`${r},${c - 1}`)) d += `M${x},${y} L${x},${y + s} `;
      if (!set.has(`${r},${c + 1}`)) d += `M${x + s},${y} L${x + s},${y + s} `;
    });
    return d;
  });
}
const demoZonePaths = buildDemoZonePaths();

const demoHighlightSteps = [
  { type: "row", idx: 2,  color: "#2196F3", label: "Ligne : 2 ❤️" },
  { type: "col", idx: 0,  color: "#E91E63", label: "Colonne : 2 ❤️" },
  { type: "zone", idx: 0, color: "#4CAF50", label: "Zone : 2 ❤️" },
];

const highlightState = ref(0);
const demoLabelVisible = ref(true);

const demoHighlightRects = computed(() => {
  const step = demoHighlightSteps[highlightState.value];
  const s = DEMO_S, total = DEMO_N * s;
  if (step.type === "row") return [{ x: 0, y: step.idx * s, w: total, h: s }];
  if (step.type === "col") return [{ x: step.idx * s, y: 0, w: s, h: total }];
  const rects = [];
  for (let r = 0; r < DEMO_N; r++)
    for (let c = 0; c < DEMO_N; c++)
      if (demoZones[r][c] === step.idx) rects.push({ x: c * s, y: r * s, w: s, h: s });
  return rects;
});

const demoHighlightColor = computed(() => demoHighlightSteps[highlightState.value].color);
const demoHighlightLabel = computed(() => demoHighlightSteps[highlightState.value].label);

let gridInterval;
const updateGridDemo = () => {
  demoLabelVisible.value = false;
  setTimeout(() => {
    highlightState.value = (highlightState.value + 1) % demoHighlightSteps.length;
    demoLabelVisible.value = true;
  }, 300);
};

onMounted(() => {
  runClickSequence();
  updateGridDemo();
  gridInterval = setInterval(updateGridDemo, 3000);
});

onUnmounted(() => {
  clearTimeout(clickTimeout);
  clearInterval(gridInterval);
});
</script>

<style scoped>
.rules-body {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
}

/* ===== COLUMNS ===== */
.rule-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.5rem;
}

.rule-divider {
  width: 1px;
  background: var(--color-border, #e8dde0);
  margin: 0.5rem 0;
  flex-shrink: 0;
}

.rule-anim {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 80px;
}

.rule-text {
  text-align: center;
}
.rule-text h4 {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--color-text, #2c2c3a);
  margin-bottom: 0.2rem;
  font-family: var(--font-family, "Nunito"), sans-serif;
}
.rule-text p {
  font-size: 0.75rem;
  color: var(--color-text-soft, #6e6e82);
  line-height: 1.35;
  margin: 0;
}

/* ===== DEMO 1 ===== */
.click-demo-wrapper {
  position: relative;
  width: 52px;
  height: 52px;
}

.demo-cell {
  width: 52px;
  height: 52px;
  border: 1.5px solid #ccc;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hand-cursor {
  position: absolute;
  font-size: 1.6rem;
  top: 55%;
  left: 55%;
  transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
  z-index: 10;
}
.hand-cursor.tapping {
  transform: scale(0.8) translate(-3px, 3px);
}

.cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  width: 60%;
  height: 60%;
}
.icon-cross {
  color: #bdbdbd;
  opacity: 0.7;
}

/* ===== DEMO 2 ===== */
.demo-grid-wrapper {
  width: 128px;
  height: 128px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.demo-grid {
  width: 128px;
  height: 128px;
  display: grid;
  grid-template-columns: repeat(8, 16px);
  grid-template-rows: repeat(8, 16px);
  gap: 0;
}

.demo-grid-cell {
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.demo-zone-0 { background-color: #fff0f2; }
.demo-zone-1 { background-color: #fff8f0; }
.demo-zone-2 { background-color: #fff5fa; }
.demo-zone-3 { background-color: #f7f0ff; }
.demo-zone-4 { background-color: #f0f8ff; }
.demo-zone-5 { background-color: #f0fff5; }
.demo-zone-6 { background-color: #fffbf0; }
.demo-zone-7 { background-color: #fef0f0; }

.demo-heart-icon {
  width: 68%;
  height: 68%;
  display: block;
}

.demo-overlay-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.demo-hl-label {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 0.62rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.demo-hl-label.visible {
  opacity: 1;
}

/* ===== DEMO 3 ===== */
.neighbor-grid {
  display: grid;
  grid-template-columns: repeat(3, 26px);
  gap: 2px;
}

.neighbor-cell {
  width: 26px;
  height: 26px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.center-cell {
  grid-column: 2;
  grid-row: 2;
  background: #fff0f0;
  border: 2px solid #e05a6e;
  z-index: 2;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(224, 90, 110, 0.25);
}

.adj-cell .forbidden-overlay {
  animation: fade-in-out 2s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.forbidden-overlay .icon-cross {
  color: #ff5252;
  opacity: 1;
  width: 70%;
  height: 70%;
}

.adj-1 {
  grid-column: 1;
  grid-row: 1;
  animation-delay: 0.1s;
}
.adj-2 {
  grid-column: 2;
  grid-row: 1;
  animation-delay: 0.2s;
}
.adj-3 {
  grid-column: 3;
  grid-row: 1;
  animation-delay: 0.3s;
}
.adj-4 {
  grid-column: 1;
  grid-row: 2;
  animation-delay: 0.8s;
}
.adj-5 {
  grid-column: 3;
  grid-row: 2;
  animation-delay: 0.4s;
}
.adj-6 {
  grid-column: 1;
  grid-row: 3;
  animation-delay: 0.7s;
}
.adj-7 {
  grid-column: 2;
  grid-row: 3;
  animation-delay: 0.6s;
}
.adj-8 {
  grid-column: 3;
  grid-row: 3;
  animation-delay: 0.5s;
}

@keyframes fade-in-out {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* ===== TRANSITIONS ===== */
.icon-pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 2;
}
.icon-pop-leave-active {
  animation: pop-out 0.2s ease-in;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
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

/* ===== MOBILE ===== */
@media (max-width: 480px) {
  .rules-body {
    flex-direction: column;
  }
  .rule-divider {
    width: 100%;
    height: 1px;
    margin: 0.5rem 0;
  }
  .rule-col {
    flex-direction: row;
    gap: 1rem;
    padding: 0.25rem 0;
  }
  .rule-anim {
    flex: 0 0 70px;
    min-height: unset;
  }
  .rule-text {
    text-align: left;
  }
}
</style>
