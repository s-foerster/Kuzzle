import HeartIcon from './icons/HeartIcon.vue'
import EasterEggIcon from './icons/EasterEggIcon.vue'
import SantaHatIcon from './icons/SantaHatIcon.vue'
import PumpkinIcon from './icons/PumpkinIcon.vue'
import ValentineHeartIcon from './icons/ValentineHeartIcon.vue'

/**
 * Registre des thèmes.
 * dateRange : période de suggestion automatique (mois en 0-indexed).
 * zonePalette : tableau de 10 couleurs CSS pour --cell-bg des zones 0-9.
 */
export const THEMES = [
  {
    id: 'default',
    name: 'Classique',
    emoji: '❤️',
    icon: HeartIcon,
    premium: false,
    dateRange: null,
    zonePalette: [
      '#fff0f2', // zone-0
      '#fff8f0', // zone-1
      '#fff5fa', // zone-2
      '#f7f0ff', // zone-3
      '#f0f8ff', // zone-4
      '#f0fff5', // zone-5
      '#fffbf0', // zone-6
      '#fef0f0', // zone-7
      '#f5f0ff', // zone-8
      '#f0fafa', // zone-9
    ],
  },
  {
    id: 'valentine',
    name: 'Saint-Valentin',
    emoji: '💖',
    icon: ValentineHeartIcon,
    premium: true,
    // Début : 1er février → fin : 16 février
    dateRange: { monthStart: 1, dayStart: 1, monthEnd: 1, dayEnd: 16 },
    zonePalette: [
      '#fff0f5', // zone-0  rose très clair
      '#ffe4ed', // zone-1  rose bonbon
      '#fff0f8', // zone-2
      '#fdeaf3', // zone-3
      '#fdf0fb', // zone-4
      '#ffe8f4', // zone-5
      '#fce4ef', // zone-6
      '#fff5f9', // zone-7
      '#fde8f2', // zone-8
      '#ffeef6', // zone-9
    ],
  },
  {
    id: 'easter',
    name: 'Pâques',
    emoji: '🥚',
    icon: EasterEggIcon,
    premium: true,
    // Début : 15 mars → fin : 15 avril
    dateRange: { monthStart: 2, dayStart: 15, monthEnd: 3, dayEnd: 15 },
    zonePalette: [
      '#fef9e7', // zone-0  jaune pâle
      '#f0fbef', // zone-1  vert menthe
      '#eef6fb', // zone-2  bleu ciel
      '#fef3fb', // zone-3  lilas
      '#fefaee', // zone-4  jaune doux
      '#f2fdf2', // zone-5  vert tendre
      '#edf5fe', // zone-6  bleu pastel
      '#fdf0f9', // zone-7  rose pastel
      '#fdf8e8', // zone-8
      '#eafaff', // zone-9  cyan léger
    ],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    icon: PumpkinIcon,
    premium: true,
    // Début : 15 octobre → fin : 1er novembre
    dateRange: { monthStart: 9, dayStart: 15, monthEnd: 10, dayEnd: 1 },
    zonePalette: [
      '#fff3e0', // zone-0  orange très clair
      '#f3e5f5', // zone-1  violet très clair
      '#fff8e1', // zone-2  ambre clair
      '#ede7f6', // zone-3  indigo clair
      '#fbe9e7', // zone-4  orange rosé
      '#f9f0ff', // zone-5  violet doux
      '#fff0d0', // zone-6  doré
      '#f0ebff', // zone-7
      '#fff4e0', // zone-8
      '#ede8ff', // zone-9
    ],
  },
  {
    id: 'christmas',
    name: 'Noël',
    emoji: '🎅',
    icon: SantaHatIcon,
    premium: true,
    // Début : 1er décembre → fin : 26 décembre
    dateRange: { monthStart: 11, dayStart: 1, monthEnd: 11, dayEnd: 26 },
    zonePalette: [
      '#fff0f0', // zone-0  rouge très clair
      '#f0fff4', // zone-1  vert très clair
      '#fffdf0', // zone-2  or pâle
      '#fff5f5', // zone-3
      '#f0fcf0', // zone-4
      '#fffef0', // zone-5
      '#fdf0f0', // zone-6
      '#f2fdf2', // zone-7
      '#fff2e8', // zone-8
      '#f0f8ff', // zone-9
    ],
  },
]

/** Retourne le thème par défaut (id='default'). */
export const DEFAULT_THEME = THEMES[0]

/**
 * Retourne le thème correspondant à un id, ou le thème par défaut si non trouvé.
 * @param {string} id
 * @returns {object}
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME
}

/**
 * Retourne le thème saisonnier pour une date donnée (ou null si hors saison).
 * @param {Date} date
 * @returns {object|null}
 */
export function getSeasonalTheme(date = new Date()) {
  const month = date.getMonth()  // 0-indexed
  const day = date.getDate()

  for (const theme of THEMES) {
    if (!theme.dateRange || !theme.premium) continue
    const { monthStart, dayStart, monthEnd, dayEnd } = theme.dateRange

    // Cas simple : même mois ou plage sur deux mois
    const afterStart =
      month > monthStart || (month === monthStart && day >= dayStart)
    const beforeEnd =
      month < monthEnd || (month === monthEnd && day <= dayEnd)

    if (monthStart <= monthEnd) {
      if (afterStart && beforeEnd) return theme
    } else {
      // Plage à cheval sur fin d'année (ex: nov→jan)
      if (afterStart || beforeEnd) return theme
    }
  }
  return null
}
