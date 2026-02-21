import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Le client est null si les variables d'environnement ne sont pas définies.
// Toutes les fonctions d'auth vérifient cette condition avant d'appeler Supabase,
// ce qui permet à l'app de fonctionner sans configuration (mode anonyme uniquement).
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        // false : on gère l'échange du code OAuth manuellement dans
        // AuthCallbackView.vue via exchangeCodeForSession().
        // Laisser detectSessionInUrl à true ferait tenter l'échange deux
        // fois (une par le SDK au démarrage, une par AuthCallbackView),
        // la seconde trouvant le verifier PKCE déjà consommé → erreur 401.
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null

// ─── Schéma SQL à exécuter dans le dashboard Supabase ───────────────────────
//
// -- 1. Table profils (complète auth.users)
// CREATE TABLE public.profiles (
//   id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
//   username      TEXT UNIQUE,
//   avatar_url    TEXT,
//   is_premium    BOOLEAN DEFAULT FALSE,
//   premium_until TIMESTAMPTZ,
//   created_at    TIMESTAMPTZ DEFAULT NOW(),
//   updated_at    TIMESTAMPTZ DEFAULT NOW()
// );
//
// -- 2. Table résultats de parties
// CREATE TABLE public.game_results (
//   id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
//   game_type     TEXT CHECK (game_type IN ('hearts', 'lumizle')),
//   puzzle_date   TEXT,   -- 'YYYY-MM-DD' pour daily, 'practice_xxx' pour practice
//   completed     BOOLEAN DEFAULT FALSE,
//   time_seconds  INTEGER,
//   verify_count  INTEGER,
//   created_at    TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user_id, game_type, puzzle_date)
// );
//
// -- 3. Row Level Security
// ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
// ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "Lecture profil propre"   ON public.profiles    FOR SELECT USING (auth.uid() = id);
// CREATE POLICY "Mise à jour profil propre" ON public.profiles  FOR UPDATE USING (auth.uid() = id);
// CREATE POLICY "Insertion profil propre" ON public.profiles    FOR INSERT WITH CHECK (auth.uid() = id);
//
// CREATE POLICY "Lecture résultats propres" ON public.game_results FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Insertion résultats propres" ON public.game_results FOR INSERT WITH CHECK (auth.uid() = user_id);
// CREATE POLICY "Mise à jour résultats propres" ON public.game_results FOR UPDATE USING (auth.uid() = user_id);
//
// -- 4. Fonction de mise à jour du timestamp 'updated_at'
// CREATE OR REPLACE FUNCTION public.handle_updated_at()
// RETURNS TRIGGER AS $$
// BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
// $$ LANGUAGE plpgsql;
//
// CREATE TRIGGER on_profiles_updated
//   BEFORE UPDATE ON public.profiles
//   FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
