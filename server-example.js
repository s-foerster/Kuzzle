/**
 * EXEMPLE : Serveur Express pour le jeu de cœurs
 * Avec génération de puzzle quotidien et cache
 * 
 * Installation :
 * npm install express node-cache
 */

import express from 'express';
import NodeCache from 'node-cache';
import { generateDailyPuzzle } from './src/algorithms/puzzleGenerator.js';
import { getTodaySeed } from './src/utils/seededRandom.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Cache avec TTL de 24 heures (86400 secondes)
const puzzleCache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static('dist'));

/**
 * API : Récupérer le puzzle du jour
 * GET /api/daily-puzzle
 */
app.get('/api/daily-puzzle', async (req, res) => {
  try {
    const seed = getTodaySeed();
    console.log(`[${new Date().toISOString()}] Requête puzzle : ${seed}`);

    // Vérifier si le puzzle est déjà en cache
    let puzzle = puzzleCache.get(seed);

    if (puzzle) {
      console.log(`✅ Puzzle trouvé en cache`);
      return res.json({
        ...puzzle,
        fromCache: true
      });
    }

    // Si pas en cache, générer le puzzle (peut prendre 30s-2min)
    console.log(`⏳ Génération du puzzle ${seed}...`);
    const startTime = Date.now();

    puzzle = generateDailyPuzzle();

    const generationDuration = Date.now() - startTime;
    console.log(`✅ Puzzle généré en ${generationDuration}ms`);
    console.log(`   - Tentatives : ${puzzle.metadata.totalAttempts}`);
    console.log(`   - Rejetés : ${puzzle.metadata.rejectedNonUnique}`);
    console.log(`   - Validation : ${puzzle.metadata.validationTime}ms`);

    // Mettre en cache
    puzzleCache.set(seed, puzzle);

    res.json({
      ...puzzle,
      fromCache: false,
      serverGenerationTime: generationDuration
    });

  } catch (error) {
    console.error('❌ Erreur génération puzzle:', error);
    res.status(500).json({
      error: 'Échec de génération du puzzle',
      message: error.message
    });
  }
});

/**
 * API : Récupérer un puzzle pour une date spécifique (pour testing)
 * GET /api/puzzle/:date (format YYYYMMDD)
 */
app.get('/api/puzzle/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Valider le format
    if (!/^\d{8}$/.test(date)) {
      return res.status(400).json({
        error: 'Format de date invalide. Utilisez YYYYMMDD'
      });
    }

    const year = parseInt(date.substring(0, 4));
    const month = parseInt(date.substring(4, 6)) - 1;
    const day = parseInt(date.substring(6, 8));
    const targetDate = new Date(year, month, day);

    console.log(`[${new Date().toISOString()}] Requête puzzle : ${date}`);

    // Vérifier cache
    let puzzle = puzzleCache.get(date);

    if (puzzle) {
      console.log(`✅ Puzzle trouvé en cache`);
      return res.json({ ...puzzle, fromCache: true });
    }

    // Générer
    console.log(`⏳ Génération du puzzle ${date}...`);
    const startTime = Date.now();

    puzzle = generateDailyPuzzle(targetDate);

    const generationDuration = Date.now() - startTime;
    console.log(`✅ Puzzle généré en ${generationDuration}ms`);

    // Cacher
    puzzleCache.set(date, puzzle);

    res.json({
      ...puzzle,
      fromCache: false,
      serverGenerationTime: generationDuration
    });

  } catch (error) {
    console.error('❌ Erreur génération puzzle:', error);
    res.status(500).json({
      error: 'Échec de génération du puzzle',
      message: error.message
    });
  }
});

/**
 * API : Statistiques du cache
 * GET /api/stats
 */
app.get('/api/stats', (req, res) => {
  const stats = puzzleCache.getStats();
  res.json({
    cache: {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * Pré-générer le puzzle du lendemain (optionnel)
 * Peut être appelé par un cron job ou manuellement
 * POST /api/pregenerate-tomorrow
 */
app.post('/api/pregenerate-tomorrow', async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const seed = `${year}${month}${day}`;

    console.log(`[${new Date().toISOString()}] Pré-génération : ${seed}`);

    // Vérifier si déjà en cache
    if (puzzleCache.has(seed)) {
      return res.json({
        message: 'Puzzle déjà en cache',
        seed
      });
    }

    // Générer
    const startTime = Date.now();
    const puzzle = generateDailyPuzzle(tomorrow);
    const generationDuration = Date.now() - startTime;

    // Cacher
    puzzleCache.set(seed, puzzle);

    console.log(`✅ Puzzle de demain pré-généré en ${generationDuration}ms`);

    res.json({
      message: 'Puzzle pré-généré avec succès',
      seed,
      generationTime: generationDuration,
      metadata: puzzle.metadata
    });

  } catch (error) {
    console.error('❌ Erreur pré-génération:', error);
    res.status(500).json({
      error: 'Échec de pré-génération',
      message: error.message
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🎮 Serveur Hearts Game démarré sur le port ${PORT}`);
  console.log(`📅 Seed du jour : ${getTodaySeed()}`);
  console.log(`\n🔗 Endpoints disponibles :`);
  console.log(`   GET  /api/daily-puzzle`);
  console.log(`   GET  /api/puzzle/:date`);
  console.log(`   GET  /api/stats`);
  console.log(`   POST /api/pregenerate-tomorrow`);
  console.log(`\n💡 Conseil : Appelez /api/pregenerate-tomorrow chaque jour à minuit`);
  console.log(`   avec un cron job pour éviter le délai de génération.\n`);
});

/**
 * CRON JOB (optionnel)
 * 
 * Pour pré-générer automatiquement chaque jour à minuit :
 * 
 * 1. Installer node-cron : npm install node-cron
 * 
 * 2. Ajouter :
 * 
 *    import cron from 'node-cron';
 * 
 *    cron.schedule('1 0 * * *', async () => {
 *      console.log('[CRON] Pré-génération du puzzle de demain...');
 *      try {
 *        const tomorrow = new Date();
 *        tomorrow.setDate(tomorrow.getDate() + 1);
 *        const puzzle = generateDailyPuzzle(tomorrow);
 *        const seed = puzzle.metadata.seed;
 *        puzzleCache.set(seed, puzzle);
 *        console.log(`[CRON] ✅ Puzzle ${seed} prêt !`);
 *      } catch (error) {
 *        console.error('[CRON] ❌ Erreur:', error);
 *      }
 *    });
 */
