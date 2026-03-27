import { ref, computed, watch } from 'vue'
import { THEMES, DEFAULT_THEME, getThemeById, getSeasonalTheme } from '../themes/index.js'
import { useAuthStore } from '../stores/auth.js'

const STORAGE_KEY = 'hearts-preferred-theme'

// Singleton partagé entre tous les composants
const _themeId = ref(localStorage.getItem(STORAGE_KEY) ?? 'default')
// Flag : l'utilisateur a explicitement changé le thème dans cette session.
// Empêche un rechargement de profil Supabase (potentiellement périmé) d'écraser le choix.
let _userSetTheme = false

export function useTheme() {
  const authStore = useAuthStore()

  /** Thème actif : forcé à 'default' pour les non-premium */
  const activeTheme = computed(() => {
    // Si non connecté ou non premium, toujours le thème classique
    if (!authStore.isPremium) return DEFAULT_THEME
    return getThemeById(_themeId.value)
  })

  /** Thème saisonnier pour la date du jour (null si hors saison) */
  const suggestedTheme = computed(() => getSeasonalTheme(new Date()))

  /**
   * Vrai si on devrait suggérer le thème saisonnier à l'utilisateur
   * (premium + saison active + thème courant différent)
   */
  const shouldSuggestSeasonal = computed(() =>
    authStore.isPremium &&
    suggestedTheme.value !== null &&
    activeTheme.value.id !== suggestedTheme.value.id
  )

  /**
   * Style CSS à injecter sur le container de la grille.
   * Définit les variables --zone-color-N pour chaque zone.
   */
  const zoneStyle = computed(() => {
    const palette = activeTheme.value.zonePalette
    const style = {}
    palette.forEach((color, i) => {
      style[`--zone-color-${i}`] = color
    })
    return style
  })

  /**
   * Tous les thèmes disponibles.
   * Les thèmes premium sont marqués, mais restent affichables pour la prévisualisation.
   */
  const allThemes = THEMES

  /**
   * Sélectionne un thème. Les thèmes premium ne sont applicables que si isPremium.
   * @param {string} id
   */
  function setTheme(id) {
    const theme = getThemeById(id)
    // Non-premium : impossible de choisir un thème premium
    if (theme.premium && !authStore.isPremium) return

    _userSetTheme = true
    _themeId.value = id
    localStorage.setItem(STORAGE_KEY, id)

    // Sync Supabase si setPreferredTheme est disponible
    if (authStore.setPreferredTheme) {
      authStore.setPreferredTheme(id)
    }
  }

  /**
   * Synchronise la préférence stockée dans Supabase vers le state local.
   * Appelé après login pour écraser le localStorage avec la valeur serveur.
   * @param {string|null} serverThemeId
   */
  function syncFromServer(serverThemeId) {
    // Ne pas écraser si l'utilisateur a explicitement changé le thème cette session
    if (_userSetTheme) return
    if (serverThemeId && serverThemeId !== _themeId.value) {
      _themeId.value = serverThemeId
      localStorage.setItem(STORAGE_KEY, serverThemeId)
    }
  }

  // Quand l'utilisateur perd le premium, retomber sur le thème par défaut
  watch(
    () => authStore.isPremium,
    (isPremium) => {
      if (!isPremium && getThemeById(_themeId.value).premium) {
        _themeId.value = 'default'
        localStorage.setItem(STORAGE_KEY, 'default')
      }
    }
  )

  return {
    activeTheme,
    suggestedTheme,
    shouldSuggestSeasonal,
    zoneStyle,
    allThemes,
    setTheme,
    syncFromServer,
  }
}
