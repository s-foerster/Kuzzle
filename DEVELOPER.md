# Guide du Développeur

## Architecture du projet

```
hearts_game/
├── src/
│   ├── algorithms/          # Algorithmes de génération
│   │   ├── zoneGenerator.js       # Génération des zones
│   │   ├── heartPlacer.js         # Placement des cœurs (backtracking)
│   │   ├── validator.js           # Validation d'unicité
│   │   └── puzzleGenerator.js     # Pipeline complet
│   ├── components/          # Composants Vue
│   │   ├── Cell.vue              # Cellule individuelle
│   │   └── GameGrid.vue          # Grille de jeu
│   ├── composables/         # Logique réutilisable
│   │   └── useGame.js            # Logique principale du jeu
│   ├── utils/              # Utilitaires
│   │   └── seededRandom.js       # Générateur aléatoire déterministe
│   ├── assets/             # Ressources statiques
│   │   └── styles.css            # Styles globaux
│   ├── App.vue             # Composant racine
│   └── main.js             # Point d'entrée
├── .github/workflows/
│   └── deploy.yml          # CI/CD pour GitHub Pages
├── index.html              # Template HTML
├── vite.config.js          # Configuration Vite
└── package.json            # Dépendances
```

## Algorithmes principaux

### 1. Génération de zones (Zone-First Approach)

L'approche choisie génère d'abord les zones, puis place les cœurs :

```
generateZones(rng, minZoneSize):
  1. Choisir 10 cellules seed bien espacées
  2. Faire croître chaque zone cellule par cellule
  3. Vérifier la contiguïté à chaque étape
  4. Retourner grid[10][10] avec zone_id
```

**Avantages** :
- Garantit des zones valides et contiguës
- Contrôle facile de la forme des zones
- Plus fiable que l'approche inverse

### 2. Placement des cœurs (Backtracking)

```
placeHearts(zoneGrid, rng):
  1. Pour chaque zone (ordre aléatoire)
  2. Essayer toutes les paires de cellules
  3. Vérifier contraintes (2/ligne, 2/col, pas adjacent)
  4. Placement récursif avec backtracking
  5. Retourner solution ou null
```

**Contraintes vérifiées** :
- Exactement 2 cœurs par ligne
- Exactement 2 cœurs par colonne
- Exactement 2 cœurs par zone
- Aucun cœur adjacent (8 directions)

### 3. Validation d'unicité

**Note** : Actuellement désactivée par défaut pour performance.

La validation complète utilise une recherche exhaustive qui peut être lente. Pour v1, on accepte les puzzles générés sans validation stricte d'unicité.

## Génération déterministe

Le seed est basé sur la date au format YYYYMMDD :

```js
const seed = getTodaySeed(); // "20260216" pour 16 février 2026
const rng = new SeededRandom(seed);
```

**Garantie** : Même seed → même séquence de nombres → même puzzle

## État du jeu

L'état est sauvegardé dans `localStorage` :

```js
{
  date: "20260216",          // Date du puzzle
  state: [[0,0,1,...], ...], // État des cellules (0=vide, 1=X, 2=cœur)
  won: false                 // Si gagné
}
```

Si la date change, l'état est réinitialisé automatiquement.

## Ajout de fonctionnalités

### Ajouter un niveau de difficulté

Modifier `minZoneSize` dans `puzzleGenerator.js` :

```js
// Facile : zones plus grandes (6 cellules min)
generatePuzzle(seed, { minZoneSize: 6 })

// Difficile : zones plus petites (2 cellules min)
generatePuzzle(seed, { minZoneSize: 2 })
```

### Ajouter des indices

Dans `useGame.js`, ajouter :

```js
function showHint() {
  // Trouver une cellule où placer un cœur de façon certaine
  // Par exemple : ligne avec 1 cœur et 1 seule position valide restante
}
```

### Ajouter un timer

```js
const startTime = ref(null);
const elapsedTime = computed(() => {
  if (!startTime.value) return 0;
  return Date.now() - startTime.value;
});
```

## Tests

### Tester la génération

```js
import { generateBatch } from './src/algorithms/puzzleGenerator.js';

const stats = generateBatch(100);
console.log(`Succès: ${stats.successes}/100`);
console.log(`Temps moyen: ${stats.avgTime}ms`);
```

### Tester le seed déterministe

```js
import { SeededRandom } from './src/utils/seededRandom.js';

const rng1 = new SeededRandom('test');
const rng2 = new SeededRandom('test');

console.log(rng1.random() === rng2.random()); // true
```

## Performance

- **Génération de zones** : ~5-50ms
- **Placement des cœurs** : ~10-200ms (selon complexité)
- **Total** : généralement < 300ms

Pour optimiser :
1. Réduire `maxHeartAttempts` si trop lent
2. Améliorer les heuristiques de backtracking
3. Pré-calculer les positions valides

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request
