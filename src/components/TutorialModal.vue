<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="tuto-backdrop" @click.self="handleClose">
      <div class="tuto-modal" :class="{ 'tuto-modal--wide': showIntro }">
        <!-- Header -->
        <div class="tuto-header">
          <span class="tuto-header-icon">📖</span>
          <h2 class="tuto-header-title">Leçon interactive</h2>
          <button class="tuto-close" @click="handleClose" title="Passer">
            ×
          </button>
        </div>

        <!-- ══ INTRO: How to play ══ -->
        <template v-if="showIntro">
          <div class="tuto-intro-body">
            <HowToPlayRules />
          </div>
          <div class="tuto-footer">
            <span class="tuto-step-count"
              >Lisez les règles, puis commencez !</span
            >
            <button class="tuto-btn tuto-btn--start" @click="showIntro = false">
              🎓 Commencer la leçon →
            </button>
          </div>
        </template>

        <template v-else>
          <!-- Phase dots -->
          <div class="tuto-progress">
            <span
              v-for="(ph, i) in PHASES"
              :key="i"
              class="tuto-dot"
              :class="{
                'tuto-dot--done': i < phaseIndex,
                'tuto-dot--active': i === phaseIndex,
              }"
            />
          </div>

          <!-- Victory screen -->
          <div v-if="isVictory" class="tuto-victory">
            <div class="tuto-victory-icon">🎉</div>
            <h3>Puzzle résolu !</h3>
            <p>
              Vous avez maîtrisé toutes les techniques pour résoudre un niveau
              Coeurzzle.
            </p>
            <button class="tuto-btn tuto-btn--start" @click="handleClose">
              ❤️ Jouer maintenant !
            </button>
          </div>

          <!-- Normal phase -->
          <template v-else>
            <div class="tuto-body">
              <!-- Instruction panel -->
              <Transition name="step-fade" mode="out-in">
                <div :key="phaseIndex" class="tuto-instruction">
                  <div class="tuto-phase-tag" :class="`tag--${phase.tag}`">
                    {{
                      phase.tag === "info" ? "💡 Observation" : "👆 À vous !"
                    }}
                  </div>
                  <h3 class="tuto-inst-title">{{ phase.title }}</h3>
                  <p class="tuto-inst-text">{{ phase.text }}</p>
                  <div
                    v-if="phase.tag === 'action' && pendingCount > 0"
                    class="tuto-pending-hint"
                  >
                    {{ pendingCount }} case{{ pendingCount > 1 ? "s" : "" }} à
                    cliquer ↓
                  </div>
                </div>
              </Transition>

              <!-- Grid -->
              <div class="tuto-grid-area">
                <div class="tuto-grid-wrapper">
                  <!-- Real SVG zone borders -->
                  <ZoneOverlay :zones="ZONES" :grid-size="GRID" />
                  <!-- Cells -->
                  <div class="tuto-grid" :style="gridStyle">
                    <div
                      v-for="cell in allCells"
                      :key="`tc-${cell.r}-${cell.c}`"
                      class="tuto-cell"
                      :class="[
                        `tzo-${ZONES[cell.r][cell.c]}`,
                        {
                          'cell--pending-h': isPendingHeart(cell.r, cell.c),
                          'cell--pending-x': isPendingCross(cell.r, cell.c),
                          'cell--intermediate-heart': isIntermediateHeart(
                            cell.r,
                            cell.c,
                          ),
                          'cell--focus-context': isContextFocus(cell.r, cell.c),
                          'cell--focus-heart': isFocusHeart(cell.r, cell.c),
                          'cell--wrong': isWrong(cell.r, cell.c),
                        },
                      ]"
                      @click="handleCellClick(cell.r, cell.c)"
                    >
                      <!-- Heart -->
                      <svg
                        v-if="tutState[cell.r][cell.c] === 2"
                        class="tuto-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <defs>
                          <linearGradient
                            id="tut-hg"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              style="stop-color: #ff5252; stop-opacity: 1"
                            />
                            <stop
                              offset="100%"
                              style="stop-color: #d50000; stop-opacity: 1"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          fill="url(#tut-hg)"
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        />
                      </svg>
                      <!-- X -->
                      <svg
                        v-else-if="tutState[cell.r][cell.c] === 1"
                        class="tuto-icon tuto-icon-x"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="tuto-footer">
              <span class="tuto-step-count"
                >Étape {{ phaseIndex + 1 }} / {{ PHASES.length }}</span
              >
              <div class="tuto-footer-actions">
                <button
                  v-if="phase.tag === 'info'"
                  class="tuto-btn tuto-btn--primary"
                  @click="advancePhase"
                >
                  Compris →
                </button>
                <button
                  v-else
                  class="tuto-btn tuto-btn--ghost"
                  @click="skipPhase"
                >
                  Passer cette étape
                </button>
              </div>
            </div>
          </template>
        </template>
        <!-- end v-else (lesson) -->
      </div>
    </div>
  </Transition>
</template>

<!-- ═══════════════════ SCRIPT ═══════════════════ -->
<script setup>
import { ref, computed, watch } from "vue";
import ZoneOverlay from "./ZoneOverlay.vue";
import HowToPlayRules from "./HowToPlay/HowToPlayRules.vue";

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close"]);

// ── easy_1 puzzle (8×8) ────────────────────────────────────────────────────
const GRID = 8;
const ZONES = [
  [0, 1, 1, 1, 2, 2, 2, 3],
  [0, 0, 0, 1, 2, 4, 3, 3],
  [1, 1, 1, 1, 4, 4, 4, 3],
  [1, 1, 1, 1, 5, 3, 3, 3],
  [1, 5, 5, 5, 5, 3, 3, 3],
  [1, 5, 5, 5, 5, 3, 6, 3],
  [7, 7, 5, 7, 6, 6, 6, 6],
  [7, 7, 7, 7, 6, 6, 6, 6],
];

// ── Phases ─────────────────────────────────────────────────────────────────
// tag 'info'   → explanation only, Next button
// tag 'action' → user must click pendingHearts (green pulsing cells)
// focusZone    → zone highlighted in background to guide the eye
const PHASES = [
  {
    tag: "action",
    title: "Étape 1",
    text: "Marquez la case surlignée avec un X. Elle ne peut pas contenir un cœur, sinon deux cœurs se toucheraient.",
    focusZone: 0,
    pendingHearts: [],
    pendingCrosses: [[1, 1]],
  },
  {
    tag: "action",
    title: "Étape 2",
    text: "Cette case doit être un cœur, sinon deux cœurs se toucheraient.",
    focusZone: 0,
    pendingHearts: [[1, 2]],
    pendingCrosses: [],
  },
  {
    tag: "action",
    title: "Étape 3",
    text: "Marquez les cases surlignées avec un X car elles sont adjacentes à un cœur.",
    focusZone: null,
    focusHearts: [[1, 2]],
    pendingHearts: [],
    pendingCrosses: [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 3],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
  },
  {
    tag: "action",
    title: "Étape 4",
    text: "Ces cases doivent être des X. Sinon, deux cœurs seraient forcés de se toucher.",
    focusZone: 4,
    pendingHearts: [],
    pendingCrosses: [
      [1, 5],
      [2, 5],
    ],
  },
  {
    tag: "action",
    title: "Étape 5",
    text: "Placez des cœurs dans les cases surlignées car ce sont les seules positions valides restantes dans la zone.",
    focusZone: 4,
    pendingHearts: [
      [2, 4],
      [2, 6],
    ],
    pendingCrosses: [],
  },
  {
    tag: "action",
    title: "Étape 6",
    text: "Marquez les cases surlignées avec un X car elles sont adjacentes à un cœur.",
    focusZone: null,
    focusHearts: [
      [2, 4],
      [2, 6],
    ],
    pendingHearts: [],
    pendingCrosses: [
      [1, 4],
      [1, 6],
      [1, 7],
      [2, 7],
      [3, 3],
      [3, 4],
      [3, 5],
      [3, 6],
      [3, 7],
    ],
  },
  {
    tag: "action",
    title: "Étape 7",
    text: "Marquez les cases restantes avec un X car cette ligne a déjà 2 cœurs.",
    focusZone: null,
    focusRows: [2],
    pendingHearts: [],
    pendingCrosses: [[2, 0]],
  },
  {
    tag: "action",
    title: "Étape 8",
    text: "Cette case doit être un X. Sinon, deux cœurs seraient forcés de se toucher dans la zone.",
    focusZone: 2,
    pendingHearts: [],
    pendingCrosses: [[0, 5]],
  },
  {
    tag: "action",
    title: "Étape 9",
    text: "Placez des cœurs dans les cases surlignées car ce sont les seules positions valides restantes dans la zone.",
    focusZone: 2,
    pendingHearts: [
      [0, 4],
      [0, 6],
    ],
    pendingCrosses: [],
  },
  {
    tag: "action",
    title: "Étape 10",
    text: "Marquez les cases surlignées avec un X car elles sont adjacentes à un cœur.",
    focusZone: null,
    focusHearts: [
      [0, 4],
      [0, 6],
    ],
    pendingHearts: [],
    pendingCrosses: [[0, 7]],
  },
  {
    tag: "action",
    title: "Étape 11",
    text: "Marquez les cases restantes avec un X car cette ligne a déjà 2 cœurs.",
    focusZone: null,
    focusRows: [0],
    pendingHearts: [],
    pendingCrosses: [[0, 0]],
  },
  {
    tag: "action",
    title: "Étape 12",
    text: "Marquez les cases restantes de ces colonnes avec un X car elles ont déjà 2 cœurs.",
    focusZone: null,
    focusCols: [4, 6],
    pendingHearts: [],
    pendingCrosses: [
      [4, 4],
      [4, 6],
      [5, 4],
      [5, 6],
      [6, 4],
      [6, 6],
      [7, 4],
      [7, 6],
    ],
  },
  {
    tag: "action",
    title: "Étape 13",
    text: "Placez un cœur dans la case surlignée car c'est la seule position valide restante dans la zone.",
    focusZone: 0,
    pendingHearts: [[1, 0]],
    pendingCrosses: [],
  },
  {
    tag: "action",
    title: "Étape 14",
    text: "Placez des cœurs dans les cases surlignées car ce sont les seules positions valides restantes dans cette ligne.",
    focusZone: null,
    focusRows: [3],
    pendingHearts: [
      [3, 0],
      [3, 2],
    ],
    pendingCrosses: [],
  },
  {
    tag: "action",
    title: "Étape 15",
    text: "Marquez les cases surlignées avec un X car elles sont adjacentes à un cœur.",
    focusZone: null,
    focusHearts: [
      [3, 0],
      [3, 2],
    ],
    pendingHearts: [],
    pendingCrosses: [
      [3, 1],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
    ],
  },
  {
    tag: "action",
    title: "Étape 16",
    text: "Marquez les cases restantes de cette colonne avec un X car elle a déjà 2 cœurs.",
    focusZone: null,
    focusCols: [0],
    pendingHearts: [],
    pendingCrosses: [
      [5, 0],
      [6, 0],
      [7, 0],
    ],
  },
  {
    tag: "action",
    title: "Étape 17",
    text: "Placez des cœurs dans les cases surlignées car ce sont les seules positions valides restantes dans ces colonnes.",
    focusZone: null,
    focusCols: [1, 3],
    pendingHearts: [
      [5, 1],
      [5, 3],
      [7, 1],
      [7, 3],
    ],
    pendingCrosses: [],
  },
  {
    tag: "action",
    title: "Étape 18",
    text: "Marquez les cases surlignées avec un X car elles sont adjacentes à un cœur.",
    focusZone: null,
    focusHearts: [
      [5, 1],
      [5, 3],
      [7, 1],
      [7, 3],
    ],
    pendingHearts: [],
    pendingCrosses: [
      [5, 2],
      [6, 1],
      [6, 2],
      [6, 3],
      [7, 2],
    ],
  },
  {
    tag: "action",
    title: "Étape 19",
    text: "Marquez les cases restantes de ces lignes avec un X car elles ont déjà 2 cœurs.",
    focusZone: null,
    focusRows: [5, 7],
    pendingHearts: [],
    pendingCrosses: [
      [5, 5],
      [5, 7],
      [7, 5],
      [7, 7],
    ],
  },
  {
    tag: "action",
    title: "Étape 20",
    text: "Placez des cœurs dans les cases surlignées car ce sont les seules positions valides restantes.",
    focusZone: null,
    pendingHearts: [
      [4, 5],
      [4, 7],
      [6, 5],
      [6, 7],
    ],
    pendingCrosses: [],
  },
];

// ── Reactive state ─────────────────────────────────────────────────────────
const phaseIndex = ref(0);
const tutState = ref(emptyGrid());
const pendingSet = ref(new Set()); // "r,c" keys
const showIntro = ref(true); // show rules screen before the lesson
const wrongCells = ref(new Set()); // brief red flash
const intermediateHearts = ref(new Set()); // cells clicked once (showing X), waiting 2nd click for ❤️
const isVictory = ref(false);

function emptyGrid() {
  return Array.from({ length: GRID }, () => Array(GRID).fill(0));
}

const phase = computed(() => PHASES[phaseIndex.value]);
const pendingCount = computed(() => pendingSet.value.size);

const allCells = computed(() => {
  const cells = [];
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) cells.push({ r, c });
  return cells;
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${GRID}, 1fr)`,
  gridTemplateRows: `repeat(${GRID}, 1fr)`,
}));

// ── Helpers ────────────────────────────────────────────────────────────────
// Pending heart = in pendingSet AND not yet first-clicked
function isPendingHeart(r, c) {
  return (
    pendingSet.value.has(`h,${r},${c}`) &&
    !intermediateHearts.value.has(`${r},${c}`)
  );
}
function isIntermediateHeart(r, c) {
  return intermediateHearts.value.has(`${r},${c}`);
}
function isPendingCross(r, c) {
  return pendingSet.value.has(`x,${r},${c}`);
}
function isPending(r, c) {
  return isPendingHeart(r, c) || isPendingCross(r, c);
}
function isContextFocus(r, c) {
  const p = phase.value;
  // Check Zone
  if (
    p.focusZone !== null &&
    p.focusZone !== undefined &&
    ZONES[r][c] === p.focusZone
  )
    return true;
  // Check Rows
  if (Array.isArray(p.focusRows) && p.focusRows.includes(r)) return true;
  // Check Cols
  if (Array.isArray(p.focusCols) && p.focusCols.includes(c)) return true;
  return false;
}
function isFocusHeart(r, c) {
  const fh = phase.value.focusHearts;
  return Array.isArray(fh) && fh.some(([fr, fc]) => fr === r && fc === c);
}
function isWrong(r, c) {
  return wrongCells.value.has(`${r},${c}`);
}

// ── Phase management ───────────────────────────────────────────────────────
function loadPhase(idx) {
  phaseIndex.value = idx;
  const p = PHASES[idx];
  const newPending = new Set();
  if (p.pendingHearts) {
    p.pendingHearts.forEach(([r, c]) => newPending.add(`h,${r},${c}`));
  }
  if (p.pendingCrosses) {
    p.pendingCrosses.forEach(([r, c]) => newPending.add(`x,${r},${c}`));
  }
  pendingSet.value = newPending;
  intermediateHearts.value = new Set(); // clear intermediates on each new phase
}

function advancePhase() {
  const next = phaseIndex.value + 1;
  if (next >= PHASES.length) {
    isVictory.value = true;
  } else {
    loadPhase(next);
  }
}

function skipPhase() {
  if (phase.value.tag === "info") {
    advancePhase();
    return;
  }
  const state = tutState.value.map((row) => [...row]);
  for (const key of pendingSet.value) {
    const [type, rStr, cStr] = key.split(",");
    const r = Number(rStr);
    const c = Number(cStr);
    state[r][c] = type === "h" ? 2 : 1;
  }
  tutState.value = state;
  pendingSet.value = new Set();
  intermediateHearts.value = new Set();
  setTimeout(advancePhase, 350);
}

// ── Cell click ─────────────────────────────────────────────────────────────
function handleCellClick(r, c) {
  if (isVictory.value || phase.value.tag === "info") return;

  const hKey = `h,${r},${c}`;
  const xKey = `x,${r},${c}`;
  const cellKey = `${r},${c}`;

  // ── Pending CROSS: single click ──────────────────────────────────────────
  if (pendingSet.value.has(xKey)) {
    const state = tutState.value.map((row) => [...row]);
    state[r][c] = 1;
    tutState.value = state;
    const newSet = new Set(pendingSet.value);
    newSet.delete(xKey);
    pendingSet.value = newSet;
    if (newSet.size === 0) setTimeout(advancePhase, 650);
    return;
  }

  // ── Pending HEART: two-click cycle (like the real game) ──────────────────
  if (pendingSet.value.has(hKey)) {
    if (!intermediateHearts.value.has(cellKey)) {
      // 1st click: place an X (intermediate state)
      const state = tutState.value.map((row) => [...row]);
      state[r][c] = 1;
      tutState.value = state;
      const ih = new Set(intermediateHearts.value);
      ih.add(cellKey);
      intermediateHearts.value = ih;
    } else {
      // 2nd click: turn X into ❤️
      const state = tutState.value.map((row) => [...row]);
      state[r][c] = 2;
      tutState.value = state;
      const ih = new Set(intermediateHearts.value);
      ih.delete(cellKey);
      intermediateHearts.value = ih;
      const newSet = new Set(pendingSet.value);
      newSet.delete(hKey);
      pendingSet.value = newSet;
      if (newSet.size === 0) setTimeout(advancePhase, 650);
    }
    return;
  }

  // ── Wrong cell: flash ─────────────────────────────────────────────────────
  if (tutState.value[r][c] === 0) {
    const ws = new Set(wrongCells.value);
    ws.add(cellKey);
    wrongCells.value = ws;
    setTimeout(() => {
      const s = new Set(wrongCells.value);
      s.delete(cellKey);
      wrongCells.value = s;
    }, 600);
  }
}

// ── Reset on open ──────────────────────────────────────────────────────────
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      showIntro.value = true;
      tutState.value = emptyGrid();
      isVictory.value = false;
      wrongCells.value = new Set();
      intermediateHearts.value = new Set();
      loadPhase(0);
    }
  },
);

function handleClose() {
  emit("close");
}
</script>

<!-- ═══════════════════ STYLE ═══════════════════ -->
<style scoped>
/* Backdrop */
.tuto-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(15, 8, 28, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
}
.tuto-modal {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 500px;
  max-height: 96vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
  transition: max-width 0.3s ease;
}
.tuto-modal--wide {
  max-width: 620px;
}

/* Header */
.tuto-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.72rem 1rem;
  background: linear-gradient(135deg, #e05a6e 0%, #b03050 100%);
  flex-shrink: 0;
}
.tuto-header-icon {
  font-size: 0.95rem;
}
.tuto-header-title {
  flex: 1;
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #fff;
  font-family: "Nunito", sans-serif;
}
.tuto-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.tuto-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

/* Progress dots */
.tuto-progress {
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 8px 0 4px;
  flex-shrink: 0;
}
.tuto-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
  transition:
    background 0.2s,
    transform 0.2s;
}
.tuto-dot--done {
  background: #f59e0b55;
}
.tuto-dot--active {
  background: #f59e0b;
  transform: scale(1.4);
}

/* Body */
.tuto-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.55rem 0.85rem 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-height: 0;
}

/* Instruction */
.tuto-instruction {
  background: #fafafa;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  flex-shrink: 0;
}
.tuto-phase-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 20px;
  padding: 0.12rem 0.5rem;
  margin-bottom: 0.35rem;
  font-family: "Nunito", sans-serif;
}
.tag--info {
  background: #fff3cd;
  color: #856404;
}
.tag--action {
  background: #d1fae5;
  color: #065f46;
}

.tuto-inst-title {
  margin: 0 0 0.28rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #b03050;
  font-family: "Nunito", sans-serif;
}
.tuto-inst-text {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #444;
}
.tuto-pending-hint {
  margin-top: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #16a34a;
  background: #f0fdf4;
  border-radius: 6px;
  padding: 0.18rem 0.5rem;
  display: inline-block;
}

/* Step-fade */
.step-fade-enter-active,
.step-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Grid area */
.tuto-grid-area {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.tuto-grid-wrapper {
  position: relative;
  width: min(288px, 80vw);
  height: min(288px, 80vw);
}

.tuto-grid {
  display: grid;
  width: 100%;
  height: 100%;
  border: 2px solid #bbb;
  border-radius: 3px;
  overflow: hidden;
}

/* Cells */
.tuto-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow: inset 0 0 0 0.5px #ddd;
  transition: box-shadow 0.12s;
}

/* Zone colours */
.tzo-0 {
  background: #fff0f2;
}
.tzo-1 {
  background: #fff8f0;
}
.tzo-2 {
  background: #fff5fa;
}
.tzo-3 {
  background: #f7f0ff;
}
.tzo-4 {
  background: #f0f8ff;
}
.tzo-5 {
  background: #f0fff5;
}
.tzo-6 {
  background: #fffbf0;
}
.tzo-7 {
  background: #fef0f0;
}

/* Pending heart click (SOLID green pulse) */
.cell--pending-h {
  z-index: 2; /* Bring above context highlight */
  animation: pending-pulse-h 0.85s ease-in-out infinite;
  box-shadow: inset 0 0 0 3px #16a34a; /* Solid border */
}
@keyframes pending-pulse-h {
  0%,
  100% {
    background-color: rgba(34, 197, 94, 0.6) !important;
  }
  50% {
    background-color: rgba(74, 222, 128, 0.85) !important;
  }
}

/* Pending cross click (SOLID red pulse) */
.cell--pending-x {
  z-index: 2;
  animation: pending-pulse-x 0.85s ease-in-out infinite;
  box-shadow: inset 0 0 0 3px #dc2626; /* Solid border */
}
@keyframes pending-pulse-x {
  0%,
  100% {
    background-color: rgba(239, 68, 68, 0.6) !important;
  }
  50% {
    background-color: rgba(248, 113, 113, 0.85) !important;
  }
}

/* Intermediate heart: 1st click placed an X, awaiting 2nd click → orange pulse */
.cell--intermediate-heart {
  z-index: 2;
  animation: intermediate-heart-pulse 0.7s ease-in-out infinite;
  box-shadow: inset 0 0 0 3px #ea580c !important;
}
@keyframes intermediate-heart-pulse {
  0%,
  100% {
    background-color: rgba(251, 146, 60, 0.65) !important;
  }
  50% {
    background-color: rgba(253, 186, 116, 0.9) !important;
  }
}

/* Context focus (Zone/Row/Col) - Strong Amber */
.cell--focus-context:not(.cell--pending-h):not(.cell--pending-x):not(
    .cell--intermediate-heart
  ):not(.cell--focus-heart) {
  z-index: 1;
  background-color: rgba(251, 191, 36, 0.5) !important; /* Stronger amber */
  box-shadow: inset 0 0 0 2px #d97706; /* Distinct border */
}

/* Source heart glow */
.cell--focus-heart {
  z-index: 3;
  animation: focus-heart-glow 1.1s ease-in-out infinite;
  background-color: rgba(255, 255, 255, 0.4);
}
@keyframes focus-heart-glow {
  0%,
  100% {
    box-shadow:
      inset 0 0 0 3px #f59e0b,
      0 0 8px #f59e0b88;
  }
  50% {
    box-shadow:
      inset 0 0 0 3px #d97706,
      0 0 18px #d9770699;
  }
}

/* Wrong click flash */
.cell--wrong {
  animation: wrong-flash 0.55s ease;
}
@keyframes wrong-flash {
  0%,
  100% {
    background-color: inherit;
    box-shadow: inset 0 0 0 0.5px #ddd;
  }
  35% {
    background-color: #fecaca !important;
    box-shadow: inset 0 0 0 2px #ef4444;
  }
}

/* Icons */
.tuto-icon {
  width: 58%;
  height: 58%;
  pointer-events: none;
}
.tuto-icon-x {
  color: #bbb;
  opacity: 0.65;
  stroke-width: 2.5px;
}

/* Intro screen (rules) */
.tuto-intro-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0.75rem 0.25rem;
}

/* Footer */
.tuto-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}
.tuto-step-count {
  font-size: 0.72rem;
  color: #bbb;
}
.tuto-footer-actions {
  display: flex;
  gap: 0.5rem;
}

.tuto-btn {
  border: none;
  cursor: pointer;
  border-radius: 20px;
  padding: 0.4rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: "Nunito", sans-serif;
  transition:
    opacity 0.2s,
    background 0.2s;
}
.tuto-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.tuto-btn--ghost {
  background: transparent;
  color: #888;
  border: 1.5px solid #ddd;
}
.tuto-btn--ghost:hover {
  background: #f5f5f5;
}
.tuto-btn--primary {
  background: linear-gradient(135deg, #e05a6e 0%, #b03050 100%);
  color: #fff;
}
.tuto-btn--primary:hover {
  opacity: 0.88;
}
.tuto-btn--start {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 0.85rem;
  padding: 0.52rem 1.3rem;
}
.tuto-btn--start:hover {
  opacity: 0.88;
}

/* Victory */
.tuto-victory {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
}
.tuto-victory-icon {
  font-size: 3rem;
}
.tuto-victory h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #b03050;
  font-family: "Nunito", sans-serif;
}
.tuto-victory p {
  margin: 0;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
}

/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-height: 680px) {
  .tuto-grid-wrapper {
    width: min(220px, 65vw);
    height: min(220px, 65vw);
  }
  .tuto-inst-text {
    font-size: 0.73rem;
  }
}
</style>
