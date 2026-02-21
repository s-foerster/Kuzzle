import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { generateDailyPuzzle, generatePuzzleHeartsFirst } from './src/algorithms/puzzleGenerator.js';
import { generateDailyLumizle } from './src/algorithms/lumizle/puzzleFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Cache persistant sur disque
const CACHE_FILE = path.join(__dirname, 'puzzle-cache.json');

// Cache Lumizle persistant sur disque
const LUMIZLE_CACHE_FILE = path.join(__dirname, 'lumizle-cache.json');

// Cache en mémoire : { "YYYY-MM-DD": { puzzle, generatedAt, metadata } }
let puzzleCache = {};

// Cache Lumizle en mémoire
let lumizleCache = {};

// Charger le cache depuis le disque au démarrage
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      puzzleCache = JSON.parse(data);
      console.log(`✅ Cache chargé : ${Object.keys(puzzleCache).length} puzzles`);
    } else {
      console.log('ℹ️ Aucun cache existant, démarrage à vide');
    }
  } catch (err) {
    console.error('❌ Erreur chargement cache:', err);
    puzzleCache = {};
  }
}

// Charger le cache Lumizle depuis le disque
function loadLumizleCache() {
  try {
    if (fs.existsSync(LUMIZLE_CACHE_FILE)) {
      const data = fs.readFileSync(LUMIZLE_CACHE_FILE, 'utf8');
      lumizleCache = JSON.parse(data);
      console.log(`✅ Cache Lumizle chargé : ${Object.keys(lumizleCache).length} puzzles`);
    } else {
      console.log('ℹ️ Aucun cache Lumizle existant, démarrage à vide');
    }
  } catch (err) {
    console.error('❌ Erreur chargement cache Lumizle:', err);
    lumizleCache = {};
  }
}

// Sauvegarder le cache sur disque
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(puzzleCache, null, 2));
    console.log('💾 Cache sauvegardé sur disque');
  } catch (err) {
    console.error('❌ Erreur sauvegarde cache:', err);
  }
}

// Sauvegarder le cache Lumizle sur disque
function saveLumizleCache() {
  try {
    fs.writeFileSync(LUMIZLE_CACHE_FILE, JSON.stringify(lumizleCache, null, 2));
    console.log('💾 Cache Lumizle sauvegardé sur disque');
  } catch (err) {
    console.error('❌ Erreur sauvegarde cache Lumizle:', err);
  }
}

// Configurations disponibles pour la génération des puzzles
const PUZZLE_CONFIGS = [
  { gridSize: 10, minSmallZones: 5, smallZoneSize: 4 },
  { gridSize: 9,  minSmallZones: 4, smallZoneSize: 4 },
  { gridSize: 9,  minSmallZones: 5, smallZoneSize: 4 },
  { gridSize: 10, minSmallZones: 4, smallZoneSize: 5 },
  { gridSize: 10, minSmallZones: 4, smallZoneSize: 4 },
];

// Choisit une config de façon déterministe à partir de la clé de date
// (même date → même config, mais distribué de façon indépendante du seed du puzzle)
function pickConfigForDate(dateKey) {
  // Simple hash de la date pour choisir la config
  let h = 0x811c9dc5;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
    h = h >>> 0;
  }
  const idx = h % PUZZLE_CONFIGS.length;
  return PUZZLE_CONFIGS[idx];
}

// Nettoyer les vieux puzzles (garde seulement les 30 derniers jours)
function cleanOldPuzzles() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let cleaned = 0;
  for (const dateKey in puzzleCache) {
    const puzzleDate = new Date(dateKey);
    if (puzzleDate < thirtyDaysAgo) {
      delete puzzleCache[dateKey];
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Nettoyé ${cleaned} vieux puzzles (> 30j)`);
    saveCache();
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Assets hachés (JS, CSS, images) → cache 1 an
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y',
  immutable: true,
}));

// Tout le reste de dist (dont index.html) → jamais en cache
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// Obtenir la date du jour au format YYYY-MM-DD
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// API : Obtenir le puzzle du jour
app.get('/api/daily-puzzle', async (req, res) => {
  const requestedDate = req.query.date; // YYYY-MM-DD optionnel
  const todayKey = requestedDate || getTodayKey();
  
  console.log(`📥 Requête puzzle pour ${todayKey}`);
  
  // Vérifier le cache
  if (puzzleCache[todayKey]) {
    console.log(`✅ Puzzle trouvé en cache (${todayKey})`);
    return res.json({
      success: true,
      date: todayKey,
      puzzle: puzzleCache[todayKey].puzzle,
      cached: true,
      generatedAt: puzzleCache[todayKey].generatedAt
    });
  }
  
  // Générer un nouveau puzzle avec validation d'unicité
  console.log(`⚙️ Génération puzzle unique pour ${todayKey}...`);
  const startTime = Date.now();
  
  try {
    // Générer avec la date spécifique comme seed
    const seedFromDate = todayKey.replace(/-/g, '');
    const config = pickConfigForDate(todayKey);
    console.log(`   └─ Config choisie: gridSize=${config.gridSize}, minSmallZones=${config.minSmallZones}, smallZoneSize=${config.smallZoneSize}`);
    const puzzle = generatePuzzleHeartsFirst(seedFromDate, {
      ...config,
      checkUniqueness: true,
      maxTotalAttempts: 1000000
    });
    const generationTime = Date.now() - startTime;
    
    if (!puzzle) {
      console.error(`❌ Échec génération pour ${todayKey}`);
      return res.status(500).json({
        success: false,
        error: 'Échec génération puzzle unique'
      });
    }
    
    // Vérifier que le puzzle est bien unique
    if (!puzzle.metadata?.isUnique) {
      console.warn(`⚠️ Puzzle généré n'est pas unique pour ${todayKey}`);
      return res.status(500).json({
        success: false,
        error: 'Puzzle généré n\'est pas unique'
      });
    }
    
    // Sauvegarder en cache
    puzzleCache[todayKey] = {
      puzzle: {
        zones: puzzle.zones,
        solution: puzzle.solution
      },
      generatedAt: new Date().toISOString(),
      metadata: puzzle.metadata
    };
    
    saveCache();
    
    console.log(`✅ Puzzle unique généré pour ${todayKey}`);
    console.log(`   ├─ Temps: ${generationTime}ms`);
    console.log(`   ├─ Tentatives: ${puzzle.metadata.totalAttempts}`);
    console.log(`   ├─ Rejetés: ${puzzle.metadata.rejectedNonUnique}`);
    console.log(`   └─ Validation: ${puzzle.metadata.validationTime}ms`);
    
    return res.json({
      success: true,
      date: todayKey,
      puzzle: puzzleCache[todayKey].puzzle,
      cached: false,
      generatedAt: puzzleCache[todayKey].generatedAt,
      generationTime,
      metadata: puzzle.metadata
    });
    
  } catch (err) {
    console.error(`❌ Erreur génération puzzle:`, err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API : Puzzle Lumizle quotidien
app.get('/api/lumizle-daily', async (req, res) => {
  const requestedDate = req.query.date; // YYYY-MM-DD optionnel
  const todayKey = requestedDate || getTodayKey();

  console.log(`📥 Requête Lumizle pour ${todayKey}`);

  // Vérifier le cache
  if (lumizleCache[todayKey]) {
    console.log(`✅ Puzzle Lumizle trouvé en cache (${todayKey})`);
    return res.json({
      success: true,
      date: todayKey,
      puzzle: lumizleCache[todayKey].puzzle,
      cached: true,
      generatedAt: lumizleCache[todayKey].generatedAt
    });
  }

  // Générer un nouveau puzzle
  console.log(`⚙️ Génération puzzle Lumizle pour ${todayKey}...`);
  const startTime = Date.now();

  try {
    const puzzle = generateDailyLumizle(todayKey);
    const generationTime = Date.now() - startTime;

    if (!puzzle) {
      console.error(`❌ Échec génération Lumizle pour ${todayKey}`);
      return res.status(500).json({
        success: false,
        error: 'Échec génération puzzle Lumizle'
      });
    }

    // Sauvegarder en cache
    lumizleCache[todayKey] = {
      puzzle: {
        initialGrid: puzzle.initialGrid,
        solution:    puzzle.solution,
        rules:       puzzle.rules,
        metadata:    puzzle.metadata,
      },
      generatedAt: new Date().toISOString(),
    };

    saveLumizleCache();

    console.log(`✅ Puzzle Lumizle généré pour ${todayKey} (${generationTime}ms)`);

    return res.json({
      success: true,
      date: todayKey,
      puzzle: lumizleCache[todayKey].puzzle,
      cached: false,
      generatedAt: lumizleCache[todayKey].generatedAt,
      generationTime,
    });

  } catch (err) {
    console.error(`❌ Erreur génération Lumizle:`, err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API : Obtenir les stats du cache
app.get('/api/cache-stats', (req, res) => {
  const dates = Object.keys(puzzleCache).sort();
  
  res.json({
    success: true,
    totalPuzzles: dates.length,
    dates: dates,
    cacheSize: JSON.stringify(puzzleCache).length,
    oldestPuzzle: dates[0] || null,
    newestPuzzle: dates[dates.length - 1] || null
  });
});

// API : Pré-générer le puzzle de demain (pour cron job)
app.post('/api/pregenerate-tomorrow', async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split('T')[0];
  
  console.log(`🔮 Pré-génération puzzle pour demain (${tomorrowKey})...`);
  
  // Vérifier si déjà existant
  if (puzzleCache[tomorrowKey]) {
    console.log(`✅ Puzzle de demain déjà en cache`);
    return res.json({
      success: true,
      message: 'Puzzle déjà en cache',
      date: tomorrowKey,
      cached: true
    });
  }
  
  const startTime = Date.now();
  
  try {
    const tomorrowDateKey = tomorrowKey;
    const seedFromDate = tomorrowDateKey.replace(/-/g, '');
    const config = pickConfigForDate(tomorrowDateKey);
    console.log(`   └─ Config choisie: gridSize=${config.gridSize}, minSmallZones=${config.minSmallZones}, smallZoneSize=${config.smallZoneSize}`);
    const puzzle = generatePuzzleHeartsFirst(seedFromDate, {
      ...config,
      checkUniqueness: true,
      maxTotalAttempts: 1000000
    });
    const generationTime = Date.now() - startTime;
    
    if (!puzzle || !puzzle.metadata?.isUnique) {
      throw new Error('Puzzle non-unique généré');
    }
    
    puzzleCache[tomorrowKey] = {
      puzzle: {
        zones: puzzle.zones,
        solution: puzzle.solution
      },
      generatedAt: new Date().toISOString(),
      metadata: puzzle.metadata
    };
    
    saveCache();
    
    console.log(`✅ Puzzle de demain pré-généré (${tomorrowKey})`);
    console.log(`   └─ Temps: ${generationTime}ms`);
    
    return res.json({
      success: true,
      message: 'Puzzle pré-généré avec succès',
      date: tomorrowKey,
      generationTime,
      metadata: puzzle.metadata
    });
    
  } catch (err) {
    console.error(`❌ Erreur pré-génération:`, err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API : Supprimer le compte utilisateur
app.delete('/api/account', async (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token manquant' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return res.status(503).json({ success: false, error: 'Supabase non configuré côté serveur' });
  }

  // Vérifier le JWT avec le client anon
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
  }

  // Supprimer le compte avec le client service role
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('❌ Erreur suppression compte:', deleteError);
    return res.status(500).json({ success: false, error: 'Échec de la suppression du compte' });
  }

  console.log(`✅ Compte supprimé : ${user.id}`);
  return res.json({ success: true });
});

// Servir le frontend pour toutes les autres routes (SPA)
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrage du serveur
loadCache(); // Charger le cache au démarrage
loadLumizleCache(); // Charger le cache Lumizle
cleanOldPuzzles(); // Nettoyer les vieux puzzles

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Hearts Puzzle démarré`);
  console.log(`   ├─ Port: ${PORT}`);
  console.log(`   ├─ Cache Hearts: ${Object.keys(puzzleCache).length} puzzles`);
  console.log(`   ├─ Cache Lumizle: ${Object.keys(lumizleCache).length} puzzles`);
  console.log(`   ├─ API: http://localhost:${PORT}/api/daily-puzzle`);
  console.log(`   └─ API: http://localhost:${PORT}/api/lumizle-daily\n`);
});

// Nettoyer le cache toutes les 24h
setInterval(() => {
  cleanOldPuzzles();
}, 24 * 60 * 60 * 1000);

// Pré-génération automatique du puzzle du lendemain chaque nuit à minuit
function scheduleMidnightPregenerate() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 2, 0, 0); // 00h02 pour éviter les collisions de minuit exact
  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  console.log(`⏰ Pré-génération auto planifiée dans ${Math.round(msUntilMidnight / 60000)} minutes`);

  setTimeout(async () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const nextKey = nextDay.toISOString().split('T')[0];

    if (!puzzleCache[nextKey]) {
      console.log(`\n🌙 Pré-génération nocturne automatique pour ${nextKey}...`);
      const config = pickConfigForDate(nextKey);
      const seedFromDate = nextKey.replace(/-/g, '');
      console.log(`   └─ Config: gridSize=${config.gridSize}, minSmallZones=${config.minSmallZones}, smallZoneSize=${config.smallZoneSize}`);
      const startTime = Date.now();
      try {
        const puzzle = generatePuzzleHeartsFirst(seedFromDate, {
          ...config,
          checkUniqueness: true,
          maxTotalAttempts: 1000000
        });
        if (puzzle && puzzle.metadata?.isUnique) {
          puzzleCache[nextKey] = {
            puzzle: { zones: puzzle.zones, solution: puzzle.solution },
            generatedAt: new Date().toISOString(),
            metadata: puzzle.metadata
          };
          saveCache();
          cleanOldPuzzles();
          console.log(`✅ Pré-génération nocturne OK pour ${nextKey} (${Date.now() - startTime}ms)`);
        } else {
          console.error(`❌ Pré-génération nocturne FAILED pour ${nextKey}`);
        }
      } catch (err) {
        console.error(`❌ Erreur pré-génération nocturne:`, err);
      }
    } else {
      console.log(`ℹ️ Puzzle ${nextKey} déjà en cache, pré-génération inutile`);
    }

    // Planifier la prochaine nuit
    scheduleMidnightPregenerate();
  }, msUntilMidnight);
}

scheduleMidnightPregenerate();
