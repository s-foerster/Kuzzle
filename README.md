# Jeu de Cœurs - Puzzle Quotidien

Un jeu de puzzle logique quotidien où vous devez placer des cœurs sur une grille 10×10 en respectant des contraintes.

## Règles du jeu

- Placez exactement **2 cœurs** dans chaque ligne
- Placez exactement **2 cœurs** dans chaque colonne
- Placez exactement **2 cœurs** dans chaque zone colorée
- Les cœurs ne peuvent **pas être adjacents** (même en diagonale)

## Comment jouer

Cliquez sur une case pour faire défiler les états :
1. Case vide
2. X (marque une case où il n'y a pas de cœur)
3. ❤️ (cœur)
4. Retour à case vide (cycle)

## Développement

### 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Option 1 : Frontend + Backend en même temps (RECOMMANDÉ)
npm run full

# Option 2 : Backend seul (avec auto-reload)
npm run server:dev

# Option 3 : Frontend seul
npm run dev
```

**URLs** :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000/api/daily-puzzle

### 📦 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre Vite (frontend uniquement) |
| `npm run server` | Démarre le serveur Express |
| `npm run server:dev` | Serveur avec auto-reload |
| `npm run full` | Frontend + Backend simultanément |
| `npm run build` | Build production |
| `npm run deploy` | Déploie sur GitHub Pages |

### 🔧 Configuration

Créez un fichier `.env` :

```env
VITE_API_URL=http://localhost:3000
```

## Architecture

- **Frontend** : Vue.js 3 avec Composition API
- **Backend** : Express.js avec cache en mémoire + persistance disque
- **Génération déterministe** : même date = même puzzle pour tous
- **Cache intelligent** : 
  - En mémoire pour performance (< 50ms)
  - Sur disque (`puzzle-cache.json`) pour persistance après redémarrage
  - Nettoyage automatique des puzzles de +7 jours
- **Validation côté serveur** : garantit l'unicité à 100%

## Algorithmes

1. **Générateur aléatoire avec seed** (seededRandom.js) : assure reproductibilité
2. **Générateur de zones** (zoneGenerator.js) : flood-fill pour créer 10 zones contiguës
3. **Placement de cœurs** (heartPlacer.js) : backtracking avec contraintes + heuristique most-constrained-first
4. **Validateur d'unicité** (validator.js) : vérifie que chaque puzzle n'a qu'UNE SEULE solution
5. **Pipeline de génération** (puzzleGenerator.js) : rejette automatiquement les puzzles non-uniques

## ✅ Garantie d'Unicité

**Tous les puzzles générés ont une solution unique à 100%**

- Le validateur vérifie exhaustivement qu'il n'existe qu'une seule façon de placer les cœurs
- Les puzzles avec plusieurs solutions sont automatiquement rejetés
- **Validation côté serveur** : pas de délai pour l'utilisateur
- **Cache persistant** : le puzzle du jour est généré une seule fois

### 💾 Comment ça marche ?

1. **Premier utilisateur du jour** :
   - Le serveur génère le puzzle avec validation (30s-2min)
   - Le puzzle est mis en cache (mémoire + disque)
   - L'utilisateur reçoit le puzzle validé

2. **Utilisateurs suivants** :
   - Le puzzle est servi depuis le cache (< 50ms)
   - Aucune régénération

3. **Redémarrage du serveur** :
   - Le cache est rechargé depuis `puzzle-cache.json`
   - Le puzzle du jour est immédiatement disponible
   - Aucune perte de données

Voir [SERVER_GUIDE.md](SERVER_GUIDE.md) pour les détails de configuration.

## 📚 Documentation

- [SERVER_GUIDE.md](SERVER_GUIDE.md) - Guide complet du serveur et du cache
- [UNIQUENESS_IMPLEMENTATION.md](UNIQUENESS_IMPLEMENTATION.md) - Détails techniques de la validation
- [PROJECT_INSTRUCTIONS.md](PROJECT_INSTRUCTIONS.md) - Instructions pour développeurs futurs
