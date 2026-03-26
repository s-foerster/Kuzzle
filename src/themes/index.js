import HeartIcon from './icons/HeartIcon.vue'
import EasterEggIcon from './icons/EasterEggIcon.vue'
import SantaHatIcon from './icons/SantaHatIcon.vue'
import PumpkinIcon from './icons/PumpkinIcon.vue'
import ValentineHeartIcon from './icons/ValentineHeartIcon.vue'
// Grands Classiques
import StarIcon from './icons/StarIcon.vue'
import GemIcon from './icons/GemIcon.vue'
import CoinIcon from './icons/CoinIcon.vue'
import CrownIcon from './icons/CrownIcon.vue'
import SunMoonIcon from './icons/SunMoonIcon.vue'
// Mignons
import PawIcon from './icons/PawIcon.vue'
import RubberDuckIcon from './icons/RubberDuckIcon.vue'
import FrogIcon from './icons/FrogIcon.vue'
import DinoIcon from './icons/DinoIcon.vue'
// Nourriture
import DonutIcon from './icons/DonutIcon.vue'
import PizzaIcon from './icons/PizzaIcon.vue'
import SushiIcon from './icons/SushiIcon.vue'
import CoffeeIcon from './icons/CoffeeIcon.vue'
// Humour & Troll
import PoopIcon from './icons/PoopIcon.vue'
import EggplantIcon from './icons/EggplantIcon.vue'
import AlienIcon from './icons/AlienIcon.vue'
import GhostIcon from './icons/GhostIcon.vue'
import ClownIcon from './icons/ClownIcon.vue'

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

  // ── Grands Classiques ──────────────────────────────────────────────────────
  {
    id: 'star',
    name: 'Étoile',
    emoji: '⭐',
    icon: StarIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fffde7', // zone-0  jaune pâle
      '#fff9c4', // zone-1  jaune doux
      '#fff8e1', // zone-2  ambre très clair
      '#fffde0', // zone-3
      '#fef9d9', // zone-4
      '#fffacc', // zone-5
      '#fff3cd', // zone-6  or pâle
      '#fdf6d3', // zone-7
      '#fefce8', // zone-8
      '#fdfad1', // zone-9
    ],
  },
  {
    id: 'gem',
    name: 'Diamant',
    emoji: '💎',
    icon: GemIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#e8f4fd', // zone-0  bleu glacier
      '#e3f2fd', // zone-1  bleu ciel
      '#ede7f6', // zone-2  lavande
      '#e0f7fa', // zone-3  cyan clair
      '#e8eaf6', // zone-4  indigo pâle
      '#e1f5fe', // zone-5  bleu piscine
      '#f3e5f5', // zone-6  violet rosé
      '#e0f2f1', // zone-7  teal léger
      '#eff6ff', // zone-8  bleu blanc
      '#f0f4ff', // zone-9  bleu pervenche
    ],
  },
  {
    id: 'coin',
    name: 'Pièce d\'or',
    emoji: '🪙',
    icon: CoinIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fff8e1', // zone-0  or pâle
      '#fff3e0', // zone-1  orange très clair
      '#fdf6e3', // zone-2  crème
      '#fffbf0', // zone-3  ivoire
      '#fff9e6', // zone-4
      '#fef9e5', // zone-5
      '#fdf3d0', // zone-6  ambre doux
      '#fef5d7', // zone-7
      '#fffce8', // zone-8
      '#fdf0c8', // zone-9  miel pâle
    ],
  },
  {
    id: 'crown',
    name: 'Couronne',
    emoji: '👑',
    icon: CrownIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fffde7', // zone-0  or pâle
      '#f3e5f5', // zone-1  violet royal clair
      '#fff9c4', // zone-2  jaune doré
      '#ede7f6', // zone-3  lavande royale
      '#fff8e1', // zone-4
      '#f8ebff', // zone-5  mauve clair
      '#fef9d9', // zone-6
      '#f0e6ff', // zone-7  violet doux
      '#fffde0', // zone-8
      '#efe0ff', // zone-9
    ],
  },
  {
    id: 'sunmoon',
    name: 'Soleil & Lune',
    emoji: '🌓',
    icon: SunMoonIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fff8e1', // zone-0  soleil doré
      '#e8eaf6', // zone-1  nuit indigo
      '#fffde7', // zone-2  aube
      '#e3e8f5', // zone-3  crépuscule
      '#fff3cd', // zone-4  lumière solaire
      '#ece8f8', // zone-5  violet noctune
      '#fef9e7', // zone-6
      '#eaecf8', // zone-7
      '#fff5cc', // zone-8
      '#e8ecf7', // zone-9
    ],
  },

  // ── Mignons ───────────────────────────────────────────────────────────────
  {
    id: 'paw',
    name: 'Patte',
    emoji: '🐾',
    icon: PawIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fdf6ef', // zone-0  beige chaud
      '#faf0e6', // zone-1  lin
      '#fdf3e7', // zone-2  pêche crème
      '#fef9f2', // zone-3
      '#fdf4ea', // zone-4  amande
      '#faf5ec', // zone-5
      '#fdf1e5', // zone-6
      '#fef7ef', // zone-7
      '#fdf2e8', // zone-8
      '#fef5ee', // zone-9
    ],
  },
  {
    id: 'rubberduck',
    name: 'Canard',
    emoji: '🦆',
    icon: RubberDuckIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fffde7', // zone-0  jaune canari pâle
      '#fffbcc', // zone-1  jaune doux
      '#fff9c4', // zone-2
      '#fff8e1', // zone-3  jaune orangé doux
      '#fffde0', // zone-4
      '#fff3cd', // zone-5  ambre léger
      '#fefce0', // zone-6
      '#fdf9cc', // zone-7
      '#fffbdb', // zone-8
      '#fdfad2', // zone-9
    ],
  },
  {
    id: 'frog',
    name: 'Grenouille',
    emoji: '🐸',
    icon: FrogIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#f1f8e9', // zone-0  vert lime pâle
      '#e8f5e9', // zone-1  vert doux
      '#f0fbe8', // zone-2
      '#edfaee', // zone-3  vert menthe
      '#e9f7e8', // zone-4
      '#f2faf0', // zone-5
      '#e6f4ea', // zone-6
      '#effaf0', // zone-7
      '#f0f9ec', // zone-8
      '#e8f8e9', // zone-9
    ],
  },
  {
    id: 'dino',
    name: 'Dinosaure',
    emoji: '🦕',
    icon: DinoIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#e0f2f1', // zone-0  teal très clair
      '#e8f5e9', // zone-1  vert doux
      '#e0f4f1', // zone-2  teal menthe
      '#ebf8ee', // zone-3
      '#e2f3ef', // zone-4
      '#ecf9ed', // zone-5  vert lime
      '#dff0ee', // zone-6
      '#eaf8f0', // zone-7
      '#e1f4f0', // zone-8
      '#e8f9ec', // zone-9
    ],
  },

  // ── Nourriture ────────────────────────────────────────────────────────────
  {
    id: 'donut',
    name: 'Donut',
    emoji: '🍩',
    icon: DonutIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fce4ec', // zone-0  rose bonbon
      '#fff0f5', // zone-1  rose clair
      '#fde8f0', // zone-2
      '#fff5f8', // zone-3  rose poudré
      '#fce8f2', // zone-4
      '#fef0f8', // zone-5
      '#ffdde8', // zone-6  rose framboise doux
      '#fff3f8', // zone-7
      '#fde0ec', // zone-8
      '#fff7fb', // zone-9
    ],
  },
  {
    id: 'pizza',
    name: 'Pizza',
    emoji: '🍕',
    icon: PizzaIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fff3e0', // zone-0  orange fromageux
      '#fff8e1', // zone-1  jaune pâle
      '#fce8e4', // zone-2  rouge tomate très clair
      '#fff9e8', // zone-3
      '#fff0d8', // zone-4  ambre pâle
      '#fbe8e0', // zone-5
      '#fff5e0', // zone-6
      '#fdeae4', // zone-7
      '#fff2d0', // zone-8
      '#fde9dc', // zone-9
    ],
  },
  {
    id: 'sushi',
    name: 'Sushi',
    emoji: '🍣',
    icon: SushiIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fce8e2', // zone-0  saumon pâle
      '#e0f5f5', // zone-1  teal clair (nori)
      '#fdf3f0', // zone-2  rose saumon très doux
      '#e8f8f8', // zone-3
      '#fcece7', // zone-4
      '#e4f7f7', // zone-5
      '#fdf0ec', // zone-6  riz crème rosé
      '#e0f4f4', // zone-7
      '#fde8e2', // zone-8
      '#e6f9f9', // zone-9
    ],
  },
  {
    id: 'coffee',
    name: 'Café',
    emoji: '☕',
    icon: CoffeeIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fdf6f0', // zone-0  crème latte
      '#f9ede4', // zone-1  café au lait
      '#fdf3eb', // zone-2  cappuccino clair
      '#fef8f3', // zone-3
      '#fdf0e6', // zone-4  caramel pâle
      '#fef5ee', // zone-5
      '#fdf2e8', // zone-6
      '#fef7f2', // zone-7
      '#fdeee4', // zone-8
      '#fef9f5', // zone-9
    ],
  },

  // ── Humour & Troll ────────────────────────────────────────────────────────
  {
    id: 'poop',
    name: 'Caca',
    emoji: '💩',
    icon: PoopIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fdf1e7', // zone-0  brun très clair
      '#fef5ec', // zone-1  crème boisé
      '#fdf3e8', // zone-2
      '#fef8f2', // zone-3
      '#fdeee0', // zone-4  ambre chaud
      '#fef6ed', // zone-5
      '#fdf0e5', // zone-6
      '#fef9f4', // zone-7
      '#fdece0', // zone-8
      '#fef7ef', // zone-9
    ],
  },
  {
    id: 'eggplant',
    name: 'Aubergine',
    emoji: '🍆',
    icon: EggplantIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#f3e5f5', // zone-0  violet très clair
      '#ede7f6', // zone-1  lavande
      '#f5eafb', // zone-2  mauve doux
      '#f0e8fa', // zone-3
      '#f4e3f7', // zone-4
      '#ece5f4', // zone-5
      '#f6ecfc', // zone-6
      '#eee6f8', // zone-7
      '#f5e7fb', // zone-8
      '#ede4f6', // zone-9
    ],
  },
  {
    id: 'alien',
    name: 'Alien',
    emoji: '👽',
    icon: AlienIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#e8fdf5', // zone-0  vert alien pâle
      '#e0f9f0', // zone-1
      '#edfdf8', // zone-2  menthe cosmique
      '#e4fbf4', // zone-3
      '#e0f4ee', // zone-4  teal spatial
      '#eafaf6', // zone-5
      '#e2f8f2', // zone-6
      '#ebfdf9', // zone-7
      '#dff3ee', // zone-8
      '#e8fcf8', // zone-9
    ],
  },
  {
    id: 'ghost',
    name: 'Fantôme',
    emoji: '👻',
    icon: GhostIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#f5f0ff', // zone-0  lavande fantôme
      '#f8f5ff', // zone-1  blanc spectral
      '#f2eeff', // zone-2
      '#f7f3ff', // zone-3
      '#f3efff', // zone-4  lilas doux
      '#f9f6ff', // zone-5
      '#f1eeff', // zone-6
      '#f8f4ff', // zone-7
      '#f4f0ff', // zone-8
      '#f6f2ff', // zone-9
    ],
  },
  {
    id: 'clown',
    name: 'Clown',
    emoji: '🤡',
    icon: ClownIcon,
    premium: true,
    dateRange: null,
    zonePalette: [
      '#fff0f0', // zone-0  rouge nez de clown
      '#fffde7', // zone-1  jaune costume
      '#e8f4fd', // zone-2  bleu pom-pom
      '#fff3e0', // zone-3  orange tigé
      '#fce4ec', // zone-4  rose bonbon
      '#f3e5f5', // zone-5  violet chapeau
      '#f1f8e9', // zone-6  vert fleur
      '#fff8e1', // zone-7  or clair
      '#fce8e8', // zone-8  rouge pastel
      '#fffacd', // zone-9  jaune citron
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
