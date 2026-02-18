/**
 * Appariement de cœurs en paires pour la génération de zones
 * Différentes stratégies selon la difficulté souhaitée
 */

/**
 * Apparie les cœurs en paires selon une stratégie
 * 
 * @param {Array<[number, number]>} hearts - Positions des cœurs
 * @param {SeededRandom} rng - Générateur aléatoire
 * @param {string} strategy - 'proximity' (facile) ou 'random' (moyen/difficile)
 * @returns {Array<[[number, number], [number, number]]>} Paires de cœurs
 */
export function pairHearts(hearts, rng, strategy = 'random') {
  if (hearts.length % 2 !== 0) {
    throw new Error(`Hearts count must be even, got ${hearts.length}`);
  }

  // TOUJOURS utiliser proximity pour garantir la contiguïté des zones
  // La difficulté sera contrôlée par les tailles de zones, pas le pairing
  return pairByProximity(hearts, rng);
}

/**
 * Stratégie 'proximity': Apparie les cœurs les plus proches
 * Résultat: Zones naturellement contiguës et faciles à former (mode facile)
 */
function pairByProximity(hearts, rng) {
  const pairs = [];
  const used = new Set();

  // Trier les cœurs par position (déterministe)
  const sortedHearts = [...hearts].sort((a, b) => {
    const posA = a[0] * 10 + a[1];
    const posB = b[0] * 10 + b[1];
    return posA - posB;
  });

  for (const heart of sortedHearts) {
    const key = `${heart[0]},${heart[1]}`;
    if (used.has(key)) continue;

    // Trouver le voisin le plus proche non utilisé
    const nearest = findNearestHeart(heart, sortedHearts, used);
    
    if (nearest) {
      pairs.push([heart, nearest]);
      used.add(key);
      used.add(`${nearest[0]},${nearest[1]}`);
    }
  }

  return pairs;
}

/**
 * Stratégie 'random': Appariement aléatoire
 * Résultat: Plus de variété, zones potentiellement plus contraintes (moyen/difficile)
 */
function pairRandomly(hearts, rng) {
  const shuffled = rng.shuffle([...hearts]);
  const pairs = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }

  return pairs;
}

/**
 * Trouve le cœur le plus proche qui n'a pas encore été utilisé
 */
function findNearestHeart(heart, allHearts, used) {
  let minDist = Infinity;
  let nearest = null;

  for (const other of allHearts) {
    const key = `${other[0]},${other[1]}`;
    if (used.has(key)) continue;
    if (other[0] === heart[0] && other[1] === heart[1]) continue;

    const dist = manhattanDistance(heart, other);
    if (dist < minDist) {
      minDist = dist;
      nearest = other;
    }
  }

  return nearest;
}

/**
 * Calcule la distance de Manhattan entre deux positions
 */
function manhattanDistance(pos1, pos2) {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

/**
 * Calcule la distance euclidienne (pas utilisée mais disponible)
 */
function euclideanDistance(pos1, pos2) {
  const dr = pos1[0] - pos2[0];
  const dc = pos1[1] - pos2[1];
  return Math.sqrt(dr * dr + dc * dc);
}
