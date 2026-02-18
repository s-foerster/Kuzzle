# 🚀 Démarrage Rapide du Serveur

## Installation

```bash
npm install
```

## Modes de Démarrage

### Option 1 : Développement complet (Frontend + Backend)

```bash
npm run full
```

Cela démarre :
- **Frontend Vite** sur http://localhost:5173
- **Backend Express** sur http://localhost:3000

### Option 2 : Backend seul

```bash
npm run server
```

OU avec auto-reload :

```bash
npm run server:dev
```

### Option 3 : Frontend seul

```bash
npm run dev
```

⚠️ Le frontend DOIT communiquer avec le backend pour récupérer le puzzle.

## Fonctionnement du Cache

### Au démarrage du serveur

Le serveur charge automatiquement `puzzle-cache.json` s'il existe.

**Exemple de logs :**
```
✅ Cache chargé : 3 puzzles
🚀 Serveur Hearts Puzzle démarré
   ├─ Port: 3000
   ├─ Cache: 3 puzzles
   └─ API: http://localhost:3000/api/daily-puzzle
```

### Première requête du jour

Si le puzzle du jour n'est PAS en cache :
```
📥 Requête puzzle pour 2026-02-16
⚙️ Génération puzzle unique pour 2026-02-16...
✅ Puzzle unique généré pour 2026-02-16
   ├─ Temps: 45320ms
   ├─ Tentatives: 23
   ├─ Rejetés: 22
   └─ Validation: 1847ms
💾 Cache sauvegardé sur disque
```

Le puzzle est :
1. Généré avec validation d'unicité (peut prendre 30s-2min)
2. Sauvegardé en mémoire
3. Sauvegardé sur disque (`puzzle-cache.json`)

### Requêtes suivantes

Le puzzle est servi depuis le cache (< 50ms) :
```
📥 Requête puzzle pour 2026-02-16
✅ Puzzle trouvé en cache (2026-02-16)
```

### Après redémarrage du serveur

Le cache est rechargé depuis `puzzle-cache.json` :
- ✅ Le puzzle du jour est IMMÉDIATEMENT disponible
- ✅ Aucune régénération nécessaire
- ✅ Temps de réponse : < 50ms

## APIs Disponibles

### GET /api/daily-puzzle

Récupère le puzzle du jour.

**Réponse (depuis cache) :**
```json
{
  "success": true,
  "date": "2026-02-16",
  "puzzle": {
    "zones": [[0,0,1,1,...], ...],
    "solution": [[false,true,...], ...]
  },
  "cached": true,
  "generatedAt": "2026-02-16T08:15:23.456Z"
}
```

**Réponse (nouvellement généré) :**
```json
{
  "success": true,
  "date": "2026-02-16",
  "puzzle": { ... },
  "cached": false,
  "generatedAt": "2026-02-16T08:15:23.456Z",
  "generationTime": 45320,
  "metadata": {
    "isUnique": true,
    "totalAttempts": 23,
    "rejectedNonUnique": 22,
    "validationTime": 1847
  }
}
```

### GET /api/cache-stats

Affiche les statistiques du cache.

```json
{
  "success": true,
  "totalPuzzles": 4,
  "dates": ["2026-02-14", "2026-02-15", "2026-02-16", "2026-02-17"],
  "cacheSize": 125643,
  "oldestPuzzle": "2026-02-14",
  "newestPuzzle": "2026-02-17"
}
```

### POST /api/pregenerate-tomorrow

Pré-génère le puzzle de demain (pour cron job).

```bash
curl -X POST http://localhost:3000/api/pregenerate-tomorrow
```

**Réponse :**
```json
{
  "success": true,
  "message": "Puzzle pré-généré avec succès",
  "date": "2026-02-17",
  "generationTime": 38421,
  "metadata": { ... }
}
```

## Cron Job (Optionnel)

Pour éviter que le premier utilisateur attende la génération, vous pouvez pré-générer le puzzle à minuit :

### Linux/macOS

```bash
crontab -e
```

Ajoutez :
```
0 1 * * * curl -X POST http://localhost:3000/api/pregenerate-tomorrow
```

### Windows (Task Scheduler)

PowerShell :
```powershell
$action = New-ScheduledTaskAction -Execute "curl" -Argument "-X POST http://localhost:3000/api/pregenerate-tomorrow"
$trigger = New-ScheduledTaskTrigger -Daily -At "01:00"
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "HeartsPuzzlePregen"
```

### Node-Cron (dans le serveur)

Ajoutez dans `server.js` :

```javascript
import cron from 'node-cron';

// Pré-générer à 1h du matin tous les jours
cron.schedule('0 1 * * *', async () => {
  console.log('🔮 Pré-génération automatique du puzzle de demain...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split('T')[0];
  
  if (!puzzleCache[tomorrowKey]) {
    const puzzle = generateDailyPuzzle(tomorrow);
    if (puzzle?.metadata?.isUnique) {
      puzzleCache[tomorrowKey] = {
        puzzle: { zones: puzzle.zones, solution: puzzle.solution },
        generatedAt: new Date().toISOString(),
        metadata: puzzle.metadata
      };
      saveCache();
      console.log(`✅ Puzzle de demain (${tomorrowKey}) pré-généré`);
    }
  }
});
```

## Nettoyage Automatique

Le serveur nettoie automatiquement les puzzles de plus de 7 jours :
- Au démarrage
- Toutes les 24h

```
🧹 Nettoyé 3 vieux puzzles
💾 Cache sauvegardé sur disque
```

## Production

### Build du frontend

```bash
npm run build
```

Cela crée le dossier `dist/` qui sera servi par Express.

### Démarrage en production

```bash
PORT=3000 node server.js
```

Le serveur sert automatiquement :
- Les fichiers statiques depuis `/dist`
- L'API sur `/api/*`

## Fichiers Importants

- `server.js` - Serveur Express avec cache
- `puzzle-cache.json` - Cache persistant (généré automatiquement)
- `.env` - Configuration des variables d'environnement
- `src/composables/useGame.js` - Frontend qui appelle l'API

## Avantages de cette Architecture

✅ **Cache en mémoire** : Réponses < 50ms
✅ **Cache sur disque** : Persistance après redémarrage
✅ **Validation côté serveur** : Garantie d'unicité à 100%
✅ **Pas de délai utilisateur** : Le puzzle est pré-généré
✅ **Nettoyage automatique** : Pas de croissance infinie du cache
✅ **Stats disponibles** : Monitoring via `/api/cache-stats`
