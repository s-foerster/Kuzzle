import { ref, computed } from "vue";

// Cache in-memory : évite les requêtes répétées si le composant est monté deux fois
// (ex : LeaderboardPanel visible avant victoire ET dans la victory card)
// Clé : `${puzzleDate}_${gameType}`, valeur : { entries, total, timestamp }
const _cache = new Map();
const CACHE_TTL_MS = 60_000; // 60 secondes

/**
 * Composable leaderboard pour un puzzle donné.
 *
 * Usage :
 *   const lb = useLeaderboard()
 *   await lb.fetchLeaderboard('2026-03-24', 'hearts')
 *
 * Une instance par composant suffit. Le cache évite les doubles requêtes
 * lorsque le même puzzleDate est affiché dans deux endroits (avant/après victoire).
 */
export function useLeaderboard() {
  const entries = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Clé du puzzle actuellement chargé (pour loadMore)
  let _currentDate = null;
  let _currentType = null;

  // Top 3 entrées pour l'affichage initial condensé
  const topEntries = computed(() => entries.value.slice(0, 3));

  // Entrée de l'utilisateur connecté (is_current_user = true)
  const currentUserEntry = computed(() =>
    entries.value.find((e) => e.is_current_user) ?? null,
  );

  // Rang de l'utilisateur connecté
  const currentUserRank = computed(
    () => currentUserEntry.value?.rank ?? null,
  );

  function reset() {
    entries.value = [];
    total.value = 0;
    error.value = null;
    loading.value = false;
    _currentDate = null;
    _currentType = null;
  }

  async function fetchLeaderboard(puzzleDate, gameType = "hearts", limit = 10, offset = 0) {
    if (!puzzleDate) return;

    const cacheKey = `${puzzleDate}_${gameType}`;
    const cached = _cache.get(cacheKey);
    const now = Date.now();

    // Utiliser le cache si encore frais ET offset = 0 (premier chargement)
    if (offset === 0 && cached && now - cached.timestamp < CACHE_TTL_MS) {
      entries.value = cached.entries;
      total.value = cached.total;
      _currentDate = puzzleDate;
      _currentType = gameType;
      return;
    }

    loading.value = true;
    error.value = null;
    _currentDate = puzzleDate;
    _currentType = gameType;

    try {
      const { supabase } = await import("../lib/supabase.js");
      if (!supabase) throw new Error("Supabase non disponible");

      const { data, error: rpcError } = await supabase.rpc("get_leaderboard", {
        p_puzzle_date: puzzleDate,
        p_game_type: gameType,
        p_limit: limit,
        p_offset: offset,
      });

      if (rpcError) {
        // Utilisateur non connecté : erreur de permission attendue
        if (rpcError.code === "42501" || rpcError.message?.includes("permission")) {
          error.value = "auth_required";
        } else {
          error.value = rpcError.message;
          console.error("[useLeaderboard] RPC error:", rpcError);
        }
        return;
      }

      const rows = data || [];

      if (offset === 0) {
        entries.value = rows;
      } else {
        // Fusion sans doublons lors du loadMore
        const existingRanks = new Set(entries.value.map((e) => e.rank));
        for (const row of rows) {
          if (!existingRanks.has(row.rank)) entries.value.push(row);
        }
      }

      total.value = rows.length > 0 ? Number(rows[0].total_count) : total.value;

      // Mettre en cache uniquement le premier chargement (offset = 0)
      if (offset === 0) {
        _cache.set(cacheKey, {
          entries: entries.value,
          total: total.value,
          timestamp: now,
        });
      }
    } catch (e) {
      error.value = e.message ?? "Erreur inconnue";
      console.error("[useLeaderboard] Exception:", e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Charge les entrées suivantes (au-delà des 10 premières).
   * Les nouvelles entrées sont concaténées au tableau existant.
   */
  async function loadMore() {
    if (!_currentDate || loading.value) return;
    await fetchLeaderboard(
      _currentDate,
      _currentType ?? "hearts",
      10,
      entries.value.length,
    );
  }

  /**
   * Invalide le cache pour forcer un rechargement (appelé après victoire,
   * pour que le nouveau score s'affiche immédiatement).
   */
  function invalidateCache(puzzleDate, gameType = "hearts") {
    _cache.delete(`${puzzleDate}_${gameType}`);
  }

  return {
    entries,
    total,
    loading,
    error,
    topEntries,
    currentUserEntry,
    currentUserRank,
    fetchLeaderboard,
    loadMore,
    invalidateCache,
    reset,
  };
}
