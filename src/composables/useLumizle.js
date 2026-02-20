/**
 * useLumizle — Composable de gestion d'état pour le puzzle Lumizle.
 *
 * Cellule player :
 *   0 = CELL_UNKNOWN  (non décidée, gris)
 *   1 = CELL_DARK     (sombre, noir)
 *   2 = CELL_LIGHT    (clair, blanc)
 *
 * Les cellules fixes (indices du puzzle) sont non-modifiables par le joueur.
 */

import { ref, computed } from 'vue';
import { getAllViolatingCells, CELL_UNKNOWN, CELL_DARK, CELL_LIGHT } from '../algorithms/lumizle/rules.js';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

const LS_STATE_PREFIX   = 'lumizle-game-state';
const LS_COMPLETED_KEY  = 'lumizle-completed-levels';
const MAX_UNDO          = 50;

export function useLumizle() {
  // ── Core state ────────────────────────────────────────────────────────────
  const puzzle      = ref(null);   // { initialGrid, solution, rules, metadata }
  const gameState   = ref([]);     // Décisions joueur : NxN de 0/1/2
  const isLoading   = ref(false);
  const error       = ref(null);
  const currentDate = ref('');     // 'YYYY-MM-DD' pour daily, id court pour practice
  const isPractice  = ref(false);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undoHistory = ref([]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const elapsedSeconds  = ref(0);
  const isTimerStarted  = ref(false);
  const isPaused        = ref(false);
  let   timerInterval   = null;

  const formattedTime = computed(() => {
    const s = elapsedSeconds.value;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      if (!isPaused.value) elapsedSeconds.value++;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function resetTimer() {
    stopTimer();
    elapsedSeconds.value = 0;
    isTimerStarted.value = false;
    isPaused.value = false;
  }

  function togglePause() {
    isPaused.value = !isPaused.value;
  }

  // ── Helpers grille ───────────────────────────────────────────────────────

  function getSize() {
    return puzzle.value?.metadata?.gridSize ?? 0;
  }

  function makeEmptyGameState(size) {
    return Array.from({ length: size }, () => new Array(size).fill(CELL_UNKNOWN));
  }

  /**
   * Retourne la valeur effective d'une cellule : indice fixe si présent,
   * sinon décision du joueur.
   */
  function effectiveValue(r, c) {
    const fixed = puzzle.value?.initialGrid?.[r]?.[c];
    if (fixed) return fixed;
    return gameState.value?.[r]?.[c] ?? CELL_UNKNOWN;
  }

  /**
   * Construit la grille effective complète (NxN) combinant indices + joueur.
   */
  function buildEffectiveGrid() {
    const size = getSize();
    if (!size) return [];
    return Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => effectiveValue(r, c))
    );
  }

  // ── Cellules fixes ────────────────────────────────────────────────────────
  const fixedCells = computed(() => {
    const set = new Set();
    if (!puzzle.value) return set;
    const { initialGrid, metadata: { gridSize: size } } = puzzle.value;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (initialGrid[r][c] !== CELL_UNKNOWN) set.add(`${r},${c}`);
    return set;
  });

  // ── Violations en temps réel ───────────────────────────────────────────────
  const violatingCells = computed(() => {
    if (!puzzle.value) return new Set();
    const size = getSize();
    const eff  = buildEffectiveGrid();
    return getAllViolatingCells(eff, size, puzzle.value.rules);
  });

  // ── Victoire ──────────────────────────────────────────────────────────────
  const isWon = computed(() => {
    if (!puzzle.value) return false;
    if (violatingCells.value.size > 0) return false;

    const { initialGrid, solution, metadata: { gridSize: size } } = puzzle.value;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (initialGrid[r][c] !== CELL_UNKNOWN) continue; // cellule fixe, ok
        const playerVal = gameState.value[r]?.[c] ?? CELL_UNKNOWN;
        if (playerVal === CELL_UNKNOWN) return false;       // cellule non remplie
        if (playerVal !== solution[r][c]) return false;     // valeur incorrecte
      }
    }
    return true;
  });

  // ── Undo helpers ──────────────────────────────────────────────────────────
  function pushHistory() {
    const snap = gameState.value.map(row => [...row]);
    undoHistory.value.push(snap);
    if (undoHistory.value.length > MAX_UNDO) undoHistory.value.shift();
  }

  function undo() {
    if (undoHistory.value.length === 0) return;
    gameState.value = undoHistory.value.pop();
    saveGameState();
  }

  // ── Interactions cellule ──────────────────────────────────────────────────

  /**
   * Retourne la prochaine valeur dans le cycle : UNKNOWN → DARK → LIGHT → UNKNOWN.
   */
  function nextCellValue(current) {
    if (current === CELL_UNKNOWN) return CELL_DARK;
    if (current === CELL_DARK)    return CELL_LIGHT;
    return CELL_UNKNOWN;
  }

  /**
   * Clic simple : cycle UNKNOWN → DARK → LIGHT → UNKNOWN.
   * Lance le timer au premier clic.
   */
  function handleCellClick(r, c) {
    if (!puzzle.value) return;
    if (fixedCells.value.has(`${r},${c}`)) return; // cellule fixe

    if (!isTimerStarted.value) {
      isTimerStarted.value = true;
      startTimer();
    }

    pushHistory();
    const current = gameState.value[r][c];
    gameState.value[r][c] = nextCellValue(current);
    saveGameState();
  }

  /**
   * Drag : applique la même transition que la première cellule draguée.
   * dragTargetValue est la valeur cible déterminée au mousedown.
   */
  function handleCellDrag(r, c, dragTargetValue) {
    if (!puzzle.value) return;
    if (fixedCells.value.has(`${r},${c}`)) return;
    if (gameState.value[r][c] === dragTargetValue) return; // déjà à la valeur cible

    gameState.value[r][c] = dragTargetValue;
    saveGameState();
  }

  // ── Persistance localStorage ───────────────────────────────────────────────

  function lsKey() {
    return `${LS_STATE_PREFIX}-${currentDate.value}`;
  }

  function saveGameState() {
    if (!currentDate.value) return;
    try {
      localStorage.setItem(lsKey(), JSON.stringify(gameState.value));
    } catch (_) { /* quota */ }
  }

  function loadGameState() {
    if (!currentDate.value) return false;
    try {
      const raw = localStorage.getItem(lsKey());
      if (!raw) return false;
      const saved = JSON.parse(raw);
      // Vérifier que la taille correspond
      const size = getSize();
      if (!saved || saved.length !== size || saved[0]?.length !== size) return false;
      gameState.value = saved;
      return true;
    } catch (_) {
      return false;
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function resetGameState() {
    if (!puzzle.value) return;
    const size = getSize();
    gameState.value = makeEmptyGameState(size);
    undoHistory.value = [];
    resetTimer();
    saveGameState();
  }

  // ── Chargement de puzzle ───────────────────────────────────────────────────

  function _loadPuzzleData(puzzleData, dateKey, practice = false) {
    puzzle.value      = puzzleData;
    currentDate.value = dateKey;
    isPractice.value  = practice;
    undoHistory.value = [];

    const size = puzzleData.metadata.gridSize;
    gameState.value = makeEmptyGameState(size);

    // Restaurer sauvegarde si elle existe
    if (!loadGameState()) {
      // Pas de sauvegarde, démarrer vide
    }

    // Si la partie était déjà gagnée, remplir avec la solution
    if (isAlreadyCompleted(dateKey)) {
      fillWithSolution();
    }
  }

  /** Charge le puzzle quotidien depuis l'API. */
  async function initPuzzle(dateKey) {
    isLoading.value = true;
    error.value     = null;
    resetTimer();

    try {
      const res = await fetch(`${API_URL}/api/lumizle-daily?date=${dateKey}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _loadPuzzleData(data.puzzle, dateKey, false);
    } catch (err) {
      error.value = err.message || 'Erreur de chargement';
    } finally {
      isLoading.value = false;
    }
  }

  /** Charge directement un puzzle pré-généré (practice). */
  function initPracticePuzzle(puzzleData, id) {
    error.value     = null;
    isLoading.value = false;
    resetTimer();
    _loadPuzzleData(puzzleData, id, true);
  }

  /** Remplit la grille avec la solution (niveau déjà complété). */
  function fillWithSolution() {
    if (!puzzle.value) return;
    const { solution, initialGrid, metadata: { gridSize: size } } = puzzle.value;
    const newState = makeEmptyGameState(size);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (initialGrid[r][c] === CELL_UNKNOWN) {
          newState[r][c] = solution[r][c];
        }
      }
    }
    gameState.value = newState;
  }

  // ── Niveaux complétés ─────────────────────────────────────────────────────

  function getCompletedLevels() {
    try {
      return JSON.parse(localStorage.getItem(LS_COMPLETED_KEY) || '[]');
    } catch (_) { return []; }
  }

  function markCompleted(id) {
    const list = getCompletedLevels();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(LS_COMPLETED_KEY, JSON.stringify(list));
    }
  }

  function isAlreadyCompleted(id) {
    return getCompletedLevels().includes(id);
  }

  return {
    // State
    puzzle,
    gameState,
    isLoading,
    error,
    currentDate,
    isPractice,
    fixedCells,

    // Violations (real-time)
    violatingCells,

    // Win
    isWon,

    // Timer
    elapsedSeconds,
    formattedTime,
    isTimerStarted,
    isPaused,
    togglePause,
    resetTimer,

    // Undo
    undoHistory,
    undo,

    // Helpers
    effectiveValue,
    buildEffectiveGrid,
    nextCellValue,

    // Interactions
    handleCellClick,
    handleCellDrag,

    // Lifecycle
    initPuzzle,
    initPracticePuzzle,
    resetGameState,
    fillWithSolution,

    // Persistence
    saveGameState,

    // Completion tracking
    getCompletedLevels,
    markCompleted,
    isAlreadyCompleted,
  };
}
