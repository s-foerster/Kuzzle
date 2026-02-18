/**
 * Générateur de nombres pseudo-aléatoires avec seed pour reproductibilité
 * Utilise l'algorithme Mulberry32 qui est simple et efficace
 */
export class SeededRandom {
  constructor(seed) {
    // Convertir le seed en nombre si c'est une string
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed >>> 0; // Assurer que c'est un entier 32-bit non signé
    }
    this.state = this.seed;
  }

  /**
   * Convertit une string en nombre pour le seed (FNV-1a 32-bit)
   * Produit une distribution uniforme même pour des seeds proches
   */
  hashString(str) {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193); // FNV prime
      hash = hash >>> 0; // keep unsigned 32-bit
    }
    return hash === 0 ? 1 : hash;
  }

  /**
   * Génère un nombre aléatoire entre 0 (inclus) et 1 (exclus)
   * Algorithme Mulberry32
   */
  random() {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Génère un entier aléatoire entre min (inclus) et max (exclus)
   */
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Mélange un tableau en place (algorithme Fisher-Yates)
   * Retourne le tableau pour chaînage
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Choisit un élément aléatoire dans un tableau
   */
  choice(array) {
    return array[this.randomInt(0, array.length)];
  }

  /**
   * Réinitialise le générateur avec le seed original
   */
  reset() {
    this.state = this.seed;
  }
}

/**
 * Crée un seed basé sur la date du jour au format YYYYMMDD
 */
export function getTodaySeed() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Crée un seed pour une date spécifique (pour testing)
 */
export function getDateSeed(year, month, day) {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}${monthStr}${dayStr}`;
}
