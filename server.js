import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
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
  { gridSize: 9, minSmallZones: 4, smallZoneSize: 4 },
  { gridSize: 9, minSmallZones: 5, smallZoneSize: 4 },
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

// ── Middleware ────────────────────────────────────────────────────────────────
// IMPORTANT : express.raw() DOIT être déclaré AVANT express.json().
// La route webhook Stripe nécessite le body brut (Buffer) pour valider la
// signature HMAC. Si express.json() passe en premier, le body est parsé et
// la validation de signature échoue systématiquement.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
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
        solution: puzzle.solution,
        rules: puzzle.rules,
        metadata: puzzle.metadata,
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

// ════════════════════════════════════════════════════════════════════════════
// ── STRIPE PAYMENT ROUTES ────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

// Initialisation Stripe (lazy : uniquement si STRIPE_SECRET_KEY est configurée)
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2024-12-18.acacia' });
}

// Initialisation des clients Supabase réutilisables pour les routes Stripe
function getSupabaseAdminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getSupabaseAnonClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

/**
 * Middleware interne : vérifie le JWT Supabase.
 * Ajoute req.userId si valide, sinon répond 401.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token manquant' });
  }
  const anonClient = getSupabaseAnonClient();
  if (!anonClient) {
    return res.status(503).json({ success: false, error: 'Supabase non configuré' });
  }
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
  }
  req.userId = user.id;
  next();
}

// ── POST /api/stripe/create-checkout-session ─────────────────────────────────
// Crée une session Stripe Checkout pour le Pass Premium.
// Sécurité : JWT requis, stripe_customer_id persisté pour lier Stripe ↔ Supabase.
app.post('/api/stripe/create-checkout-session', requireAuth, async (req, res) => {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !priceId) {
    return res.status(503).json({ success: false, error: 'Stripe non configuré' });
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    return res.status(503).json({ success: false, error: 'Supabase non configuré' });
  }

  try {
    // Récupérer le profil pour voir s'il a déjà un stripe_customer_id
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('stripe_customer_id, is_premium')
      .eq('id', req.userId)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Stripe checkout - lecture profil:', profileError);
      return res.status(500).json({ success: false, error: 'Erreur lecture profil' });
    }

    // Si déjà premium, inutile de repayer
    if (profile?.is_premium) {
      return res.status(409).json({ success: false, error: 'Déjà premium' });
    }

    // Paramètres de la session Checkout
    const sessionParams = {
      mode: 'subscription',                     // Abonnement récurrent (mensuel/annuel)
      line_items: [{ price: priceId, quantity: 1 }],
      // Retour après paiement réussi → profil avec indicateur de succès
      success_url: `${req.headers.origin || process.env.APP_URL || ''}/profil?success=true`,
      cancel_url: `${req.headers.origin || process.env.APP_URL || ''}/profil`,
      // CRITIQUE : mettre supabase_user_id dans metadata de la SESSION (pas seulement
      // dans subscription_data.metadata). Dans le webhook checkout.session.completed,
      // Stripe ne développe pas subscription_data → session.metadata est la seule
      // façon fiable de récupérer cet identifiant.
      metadata: { supabase_user_id: req.userId },
      subscription_data: { metadata: { supabase_user_id: req.userId } },
    };

    // Réutiliser le customer Stripe existant si disponible
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Persister le stripe_customer_id dès la création de la session
    // (avant même le paiement, pour pouvoir retrouver le customer plus tard)
    if (session.customer && !profile?.stripe_customer_id) {
      await adminClient
        .from('profiles')
        .update({ stripe_customer_id: String(session.customer) })
        .eq('id', req.userId);
    }

    console.log(`✅ Stripe Checkout session créée pour user ${req.userId}`);
    return res.json({ success: true, url: session.url });

  } catch (err) {
    console.error('❌ Stripe create-checkout-session:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/stripe/webhook ──────────────────────────────────────────────────
// Point d'entrée des événements Stripe (paiement, remboursement, etc.).
//
// SÉCURITÉ CRITIQUE :
//   - express.raw() doit avoir traité ce body AVANT express.json() (voir middleware)
//   - stripe.webhooks.constructEvent() valide la signature HMAC-SHA256
//   - Sans signature valide → 400 immédiat (aucune action en DB)
//   - La mise à jour de is_premium ne survient QUE depuis cette route
app.post('/api/stripe/webhook', async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.error('❌ Webhook Stripe : STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquant');
    return res.status(503).send('Stripe non configuré');
  }

  // Valider la signature Stripe (HMAC-SHA256)
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // req.body est un Buffer grâce au middleware express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.warn(`⚠️ Webhook Stripe : signature invalide — ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    console.error('❌ Webhook Stripe : Supabase admin non configuré');
    // Retourner 200 pour éviter que Stripe re-essaie inutilement
    return res.status(200).json({ received: true, warning: 'Supabase non configuré' });
  }

  try {
    switch (event.type) {

      // ── Abonnement créé (checkout réussi) ──────────────────────────────────
      // Stripe envoie cet événement après que l'utilisateur a payé avec succès.
      // Pour les abonnements, payment_status peut être 'no_payment_required'
      // à la création donc on ne filtre PAS dessus.
      case 'checkout.session.completed': {
        const session = event.data.object;
        // On ne traite que les sessions en mode abonnement
        if (session.mode !== 'subscription') break;

        // Pour les abonnements, la metadata est dans subscription_data.metadata
        // (accessible via session.metadata après expansion, ou dans subscription directement).
        // On lit les deux en fallback pour être robuste.
        const supabaseUserId = session.metadata?.supabase_user_id
          ?? session.subscription_data?.metadata?.supabase_user_id;
        const stripeCustomerId = session.customer ? String(session.customer) : null;

        if (!supabaseUserId) {
          console.error('❌ Webhook checkout.session.completed : supabase_user_id manquant dans metadata');
          break;
        }

        const updatePayload = { is_premium: true };
        if (stripeCustomerId) updatePayload.stripe_customer_id = stripeCustomerId;

        const { error } = await adminClient
          .from('profiles')
          .update(updatePayload)
          .eq('id', supabaseUserId);

        if (error) {
          console.error(`❌ Webhook : mise à jour is_premium échouée pour ${supabaseUserId}:`, error);
        } else {
          console.log(`✅ Webhook : is_premium=true pour user ${supabaseUserId}`);
        }
        break;
      }

      // ── Abonnement annulé ou expiré ─────────────────────────────────────
      // Déclenché quand l'utilisateur annule ou quand le renouvellement échoue.
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer ? String(subscription.customer) : null;
        if (!stripeCustomerId) break;

        const { error } = await adminClient
          .from('profiles')
          .update({ is_premium: false })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error(`❌ Webhook : révocation premium échouée pour customer ${stripeCustomerId}:`, error);
        } else {
          console.log(`✅ Webhook : is_premium=false (abonnement annulé) pour customer ${stripeCustomerId}`);
        }
        break;
      }

      // ── Statut abonnement mis à jour (ex: paiement échoué → unpaid) ────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer ? String(subscription.customer) : null;
        if (!stripeCustomerId) break;

        // Révoquer si l'abonnement n'est plus actif (past_due, unpaid, canceled)
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        const { error } = await adminClient
          .from('profiles')
          .update({ is_premium: isActive })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error(`❌ Webhook : mise à jour statut premium échouée pour customer ${stripeCustomerId}:`, error);
        } else {
          console.log(`✅ Webhook customer.subscription.updated : is_premium=${isActive} pour customer ${stripeCustomerId}`);
        }
        break;
      }

      default:
        // Ignorer silencieusement les autres événements
        break;
    }
  } catch (err) {
    console.error('❌ Webhook Stripe : erreur traitement événement:', err);
    // Retourner 200 quand même pour éviter les retries Stripe infinis
  }

  // Toujours retourner 200 rapidement (Stripe considère tout autre code comme une erreur)
  return res.status(200).json({ received: true });
});

// ── POST /api/stripe/portal ───────────────────────────────────────────────────
// Crée une session Customer Portal Stripe pour gérer le paiement/historique.
// Sécurité : JWT requis, on vérifie que l'utilisateur a bien un customer Stripe.
app.post('/api/stripe/portal', requireAuth, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe non configuré' });
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    return res.status(503).json({ success: false, error: 'Supabase non configuré' });
  }

  try {
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.userId)
      .maybeSingle();

    if (profileError || !profile?.stripe_customer_id) {
      return res.status(404).json({ success: false, error: 'Aucun compte Stripe associé' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.origin || process.env.APP_URL || ''}/profil`,
    });

    console.log(`✅ Stripe Portal session créée pour user ${req.userId}`);
    return res.json({ success: true, url: portalSession.url });

  } catch (err) {
    console.error('❌ Stripe create-portal-session:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ── FIN STRIPE PAYMENT ROUTES ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

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
