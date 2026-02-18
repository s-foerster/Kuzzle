/**
 * Composable pour la logique du jeu
 */

import { ref, computed, watch, onUnmounted } from 'vue';
import { getTodaySeed } from '../utils/seededRandom.js';

const GRID_SIZE = 10;
const CELL_EMPTY = 0;
const CELL_X = 1;
const CELL_HEART = 2;

// URL de l'API (utilise variable d'environnement en production)
// En dev, pointer sur localhost:3000 ; en prod (même hôte), utiliser une URL relative
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export function useGame() {
  // État du jeu
  const gameState = ref(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CELL_EMPTY)));
  const puzzle = ref(null);
  const isWon = ref(false);
  const currentDate = ref(getTodaySeed());
  const isLoading = ref(true);
  const error = ref(null);
  const checkResult = ref(null);
  // Compteur de vérifications
  const verifyCount = ref(0);
  
  // Historique pour undo (max 50 étapes)
  const undoHistory = ref([]);
  const MAX_UNDO = 50;

  function pushHistory() {
    const snapshot = gameState.value.map(row => [...row]);
    undoHistory.value.push(snapshot);
    if (undoHistory.value.length > MAX_UNDO) undoHistory.value.shift();
  }

  function undo() {
    if (undoHistory.value.length === 0 || isWon.value) return;
    gameState.value = undoHistory.value.pop();
    saveGameState();
  }

  // Timer
  const elapsedTime = ref(0); // Temps écoulé en secondes
  const isPaused = ref(false);
  const isTimerStarted = ref(false);
  let timerInterval = null;

  // Charger un puzzle pré-généré (practice) directement sans API
  function initPracticePuzzle(practiceData) {
    isLoading.value = true;
    error.value = null;
    stopTimer();
    isWon.value = false;

    puzzle.value = {
      zones: practiceData.zones,
      solution: practiceData.solution,
      metadata: practiceData.metadata || {},
    };

    // Si l'id est une date YYYY-MM-DD, stocker en YYYYMMDD pour formattedDate
    const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(practiceData.id);
    currentDate.value = isDateKey ? practiceData.id.replace(/-/g, '') : `practice_${practiceData.id}`;
    resetGameState();
    isLoading.value = false;
  }

  // Initialiser le puzzle depuis l'API
  async function initPuzzle(customDate = null) {
    isLoading.value = true;
    error.value = null;
    stopTimer();
    isWon.value = false;

    try {
      const url = customDate
        ? `${API_URL}/api/daily-puzzle?date=${customDate}`
        : `${API_URL}/api/daily-puzzle`;
      console.log('📥 Chargement du puzzle depuis l\'API...');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Échec de génération du puzzle');
      }

      console.log(`✅ Puzzle reçu (${data.cached ? 'depuis cache' : 'nouvellement généré'})`);
      if (!data.cached && data.metadata) {
        console.log(`   ├─ Tentatives: ${data.metadata.totalAttempts}`);
        console.log(`   ├─ Rejetés: ${data.metadata.rejectedNonUnique}`);
        console.log(`   └─ Temps: ${data.generationTime}ms`);
      }

      puzzle.value = {
        zones: data.puzzle.zones,
        solution: data.puzzle.solution,
        metadata: data.metadata || {}
      };
      
      currentDate.value = data.date.replace(/-/g, ''); // YYYYMMDD

      // Charger l'état sauvegardé ou réinitialiser
      loadGameState();
      
      isLoading.value = false;
    } catch (err) {
      console.error('❌ Erreur lors de l\'initialisation:', err);
      error.value = err.message;
      isLoading.value = false;
    }
  }

  // Charger l'état depuis localStorage
  function loadGameState() {
    try {
      const saved = localStorage.getItem('hearts-game-state');
      if (saved) {
        const data = JSON.parse(saved);
        // Vérifier que c'est bien le puzzle du même jour
        if (data.date === currentDate.value && data.state && Array.isArray(data.state)) {
          // Obtenir la taille réelle du puzzle
          const puzzleSize = puzzle.value?.zones?.length || GRID_SIZE;
          // Valider que le state est un tableau 2D valide avec la bonne taille
          if (data.state.length === puzzleSize && data.state.every(row => Array.isArray(row) && row.length === puzzleSize)) {
            gameState.value = data.state;
            // Restaurer le timer
            if (data.elapsedTime !== undefined) {
              elapsedTime.value = data.elapsedTime;
              isTimerStarted.value = data.isTimerStarted || false;
            }
            if (data.verifyCount !== undefined) {
              verifyCount.value = data.verifyCount;
            }
            checkWin();
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Erreur lors du chargement:', err);
    }

    // Réinitialiser si pas de sauvegarde valide
    resetGameState();
  }

  // Sauvegarder l'état dans localStorage
  function saveGameState() {
    try {
      const data = {
        date: currentDate.value,
        state: gameState.value,
        won: isWon.value,
        elapsedTime: elapsedTime.value,
        isTimerStarted: isTimerStarted.value,
        verifyCount: verifyCount.value
      };
      localStorage.setItem('hearts-game-state', JSON.stringify(data));
    } catch (err) {
      console.warn('Erreur lors de la sauvegarde:', err);
    }
  }

  // Réinitialiser l'état du jeu
  function resetGameState() {
    // Utiliser la taille réelle du puzzle
    const puzzleSize = puzzle.value?.zones?.length || GRID_SIZE;
    // Réinitialiser le timer
    stopTimer();
    elapsedTime.value = 0;
    isTimerStarted.value = false;
    isPaused.value = false;
    verifyCount.value = 0;
    gameState.value = Array(puzzleSize).fill(null).map(() => Array(puzzleSize).fill(CELL_EMPTY));
    undoHistory.value = [];
    isWon.value = false;
    saveGameState();
  }

  // Gérer le clic sur une cellule
  function handleCellClick(row, col) {
    if (isWon.value || isPaused.value) return;

    // Démarrer le timer au premier clic
    if (!isTimerStarted.value) {
      startTimer();
    }

    // Cycle: vide → X → cœur → vide
    pushHistory();
    const current = gameState.value[row][col];
    gameState.value[row][col] = (current + 1) % 3;

    checkWin();
    saveGameState();
  }

  // Gérer le drag pour placer des croix
  function handleCellDrag(row, col) {
    if (isWon.value || isPaused.value) return;

    // Démarrer le timer au premier drag
    if (!isTimerStarted.value) {
      startTimer();
    }

    // Placer une croix (X) seulement si la cellule est vide
    if (gameState.value[row][col] === CELL_EMPTY) {
      pushHistory();
      gameState.value[row][col] = CELL_X;
      checkWin();
      saveGameState();
    }
  }

  // Fonctions du timer
  function startTimer() {
    // Ne pas créer un nouveau timer si un est déjà actif
    if (timerInterval) return;
    
    isTimerStarted.value = true;
    isPaused.value = false;
    
    timerInterval = setInterval(() => {
      if (!isPaused.value && !isWon.value) {
        elapsedTime.value++;
        saveGameState();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function togglePause() {
    if (!isTimerStarted.value || isWon.value) return;
    
    isPaused.value = !isPaused.value;
    saveGameState();
  }

  // Format du temps pour affichage (MM:SS)
  const formattedTime = computed(() => {
    const minutes = Math.floor(elapsedTime.value / 60);
    const seconds = elapsedTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  // Vérifier si le joueur a gagné
  function checkWin() {
    if (!puzzle.value || !puzzle.value.solution) return;

    const puzzleSize = puzzle.value.solution.length;
    for (let row = 0; row < puzzleSize; row++) {
      for (let col = 0; col < puzzleSize; col++) {
        const playerHasHeart = gameState.value[row][col] === CELL_HEART;
        const solutionHasHeart = puzzle.value.solution[row][col];

        if (playerHasHeart !== solutionHasHeart) {
          isWon.value = false;
          return;
        }
      }
    }

    // Gagné ! Arrêter le timer
    const wasNotWon = !isWon.value;
    isWon.value = true;
    if (wasNotWon) {
      stopTimer();
      saveGameState();
    }
  }

  // Vérifier s'il y a des erreurs (réponse binaire : correct ou incorrect)
  function checkErrors() {
    if (!puzzle.value || !puzzle.value.solution) {
      checkResult.value = null;
      return;
    }

    verifyCount.value++;
    saveGameState();

    const puzzleSize = puzzle.value.solution.length;
    for (let row = 0; row < puzzleSize; row++) {
      for (let col = 0; col < puzzleSize; col++) {
        const cell = gameState.value[row][col];
        const solutionHasHeart = puzzle.value.solution[row][col];

        // Cœur placé à une mauvaise case → incorrect
        if (cell === CELL_HEART && !solutionHasHeart) {
          checkResult.value = { isCorrect: false };
          setTimeout(() => { checkResult.value = null; }, 3000);
          return;
        }
        // Croix posée sur une case qui doit avoir un cœur → incorrect
        if (cell === CELL_X && solutionHasHeart) {
          checkResult.value = { isCorrect: false };
          setTimeout(() => { checkResult.value = null; }, 3000);
          return;
        }
        // Case vide : ignorée (le joueur n'a pas encore décidé)
      }
    }

    checkResult.value = { isCorrect: true };
    setTimeout(() => { checkResult.value = null; }, 3000);
  }

  // Compter les cœurs par ligne, colonne et zone
  const constraints = computed(() => {
    if (!puzzle.value || !puzzle.value.zones) return { rows: [], cols: [], zones: [] };
    if (!gameState.value || !Array.isArray(gameState.value)) return { rows: [], cols: [], zones: [] };

    const puzzleSize = puzzle.value.zones.length;
    const rows = Array(puzzleSize).fill(0);
    const cols = Array(puzzleSize).fill(0);
    const zones = Array(puzzleSize).fill(0);

    for (let row = 0; row < puzzleSize; row++) {
      const stateRow = gameState.value[row];
      const zoneRow = puzzle.value.zones[row];
      if (!stateRow || !zoneRow) continue;

      for (let col = 0; col < puzzleSize; col++) {
        if (stateRow[col] === CELL_HEART) {
          rows[row]++;
          cols[col]++;
          const zoneId = zoneRow[col];
          if (zoneId !== undefined) {
            zones[zoneId]++;
          }
        }
      }
    }

    return { rows, cols, zones };
  });

  // Vérifier si une contrainte est violée (>2 cœurs)
  function isConstraintViolated(type, index) {
    if (!constraints.value) return false;
    
    const count = type === 'row' ? constraints.value.rows[index] :
                  type === 'col' ? constraints.value.cols[index] :
                  constraints.value.zones[index];
    
    return count > 2;
  }

  // Vérifier si une contrainte est complète (exactement 2 cœurs)
  function isConstraintComplete(type, index) {
    if (!constraints.value) return false;
    
    const count = type === 'row' ? constraints.value.rows[index] :
                  type === 'col' ? constraints.value.cols[index] :
                  constraints.value.zones[index];
    
    return count === 2;
  }

  // Obtenir le nom de la zone pour affichage
  function getZoneName(zoneId) {
    return `Zone ${zoneId + 1}`;
  }

  // Format de date pour affichage
  const formattedDate = computed(() => {
    if (!currentDate.value) return '';
    if (!/^\d{8}$/.test(currentDate.value)) return '';
    
    const year = currentDate.value.slice(0, 4);
    const month = currentDate.value.slice(4, 6);
    const day = currentDate.value.slice(6, 8);
    
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  // Sauvegarder automatiquement quand l'état change
  watch(gameState, () => {
    saveGameState();
  }, { deep: true });

  // Remplir la grille avec la solution complète (cœurs + croix)
  function fillWithSolution() {
    if (!puzzle.value || !puzzle.value.solution) return;
    const puzzleSize = puzzle.value.solution.length;
    gameState.value = Array(puzzleSize).fill(null).map((_, row) =>
      Array(puzzleSize).fill(null).map((_, col) =>
        puzzle.value.solution[row][col] ? CELL_HEART : CELL_X
      )
    );
    isWon.value = true;
    stopTimer();
    saveGameState();
  }

  // Nettoyer le timer quand le composable est démonté
  onUnmounted(() => {
    stopTimer();
  });

  return {
    // État
    gameState,
    puzzle,
    isWon,
    isLoading,
    error,
    currentDate,
    formattedDate,
    constraints,
    checkResult,
    
    // Timer
    elapsedTime,
    isPaused,
    isTimerStarted,
    formattedTime,
    verifyCount,

    // Actions
    initPuzzle,
    initPracticePuzzle,
    handleCellClick,
    handleCellDrag,
    resetGameState,
    undo,
    undoHistory,
    checkErrors,
    fillWithSolution,
    isConstraintViolated,
    isConstraintComplete,
    getZoneName,
    togglePause,

    // Constantes
    CELL_EMPTY,
    CELL_X,
    CELL_HEART
  };
}
