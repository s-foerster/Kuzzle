import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Store de navigation — permet de passer des données entre vues
 * sans les sérialiser dans l'URL (ex: niveau practice, date d'archive).
 */
export const useNavigationStore = defineStore('navigation', () => {
  const pendingPuzzle = ref(null)
  // Structure : { type: 'practice' | 'archive', data: { id, zones, solution, ... } }

  function setPendingPuzzle(type, data) {
    pendingPuzzle.value = { type, data }
  }

  /** Retourne et consomme le puzzle en attente (null si rien en attente). */
  function consumePendingPuzzle() {
    const p = pendingPuzzle.value
    pendingPuzzle.value = null
    return p
  }

  return { pendingPuzzle, setPendingPuzzle, consumePendingPuzzle }
})
