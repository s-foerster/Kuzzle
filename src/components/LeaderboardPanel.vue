<template>
  <!-- Non connecté -->
  <div v-if="!authStore.isLoggedIn" class="lb-auth-hint">
    <span>🔒</span>
    <span>Connectez-vous pour voir le classement</span>
  </div>

  <!-- Connecté -->
  <div v-else class="lb-panel">
    <div class="lb-header">
      <span class="lb-title">🏆 Classement</span>
      <span v-if="total > 0 && !loading" class="lb-count"
        >{{ total }} joueur{{ total > 1 ? "s" : "" }}</span
      >
    </div>

    <!-- Skeleton chargement -->
    <div v-if="loading && entries.length === 0" class="lb-skeleton">
      <div v-for="n in 3" :key="n" class="lb-skeleton-row">
        <span class="lb-skeleton-rank"></span>
        <span class="lb-skeleton-name"></span>
        <span class="lb-skeleton-time"></span>
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error && error !== 'auth_required'" class="lb-error">
      Impossible de charger le classement.
    </div>

    <!-- Vide -->
    <div v-else-if="!loading && entries.length === 0" class="lb-empty">
      Soyez le premier ! 🎯
    </div>

    <!-- Entrées -->
    <template v-else>
      <div class="lb-list">
        <div
          v-for="entry in displayedEntries"
          :key="entry.rank"
          class="lb-row"
          :class="{
            'lb-row--me': entry.is_current_user,
            'lb-row--gold': entry.rank === 1,
            'lb-row--silver': entry.rank === 2,
            'lb-row--bronze': entry.rank === 3,
          }"
        >
          <!-- Rang -->
          <span class="lb-rank">
            <span v-if="entry.rank === 1">🥇</span>
            <span v-else-if="entry.rank === 2">🥈</span>
            <span v-else-if="entry.rank === 3">🥉</span>
            <span v-else class="lb-rank-num">#{{ entry.rank }}</span>
          </span>

          <!-- Avatar + Username -->
          <span class="lb-user">
            <img
              v-if="entry.avatar_url"
              :src="entry.avatar_url"
              :alt="entry.username"
              class="lb-avatar"
              referrerpolicy="no-referrer"
            />
            <span v-else class="lb-avatar lb-avatar--initials">
              {{ entry.username.charAt(0).toUpperCase() }}
            </span>
            <span
              class="lb-username"
              :class="{ 'lb-username--me': entry.is_current_user }"
            >
              {{ entry.username }}
              <span v-if="entry.is_current_user" class="lb-me-badge">toi</span>
            </span>
          </span>

          <!-- Métriques -->
          <span class="lb-metrics">
            <span class="lb-time">{{ formatTime(entry.time_seconds) }}</span>
            <span
              class="lb-verif"
              :class="{ 'lb-verif--perfect': entry.verify_count === 0 }"
              :title="`${entry.verify_count} vérification${entry.verify_count !== 1 ? 's' : ''}`"
            >
              {{ entry.verify_count === 0 ? "🏆" : `${entry.verify_count}✓` }}
            </span>
          </span>
        </div>
      </div>

      <!-- Ligne de l'utilisateur courant si hors top affiché -->
      <div
        v-if="currentUserEntry && !isCurrentUserVisible"
        class="lb-row lb-row--me lb-row--separated"
      >
        <span class="lb-rank">
          <span class="lb-rank-num">#{{ currentUserEntry.rank }}</span>
        </span>
        <span class="lb-user">
          <img
            v-if="currentUserEntry.avatar_url"
            :src="currentUserEntry.avatar_url"
            :alt="currentUserEntry.username"
            class="lb-avatar"
            referrerpolicy="no-referrer"
          />
          <span v-else class="lb-avatar lb-avatar--initials">
            {{ currentUserEntry.username.charAt(0).toUpperCase() }}
          </span>
          <span class="lb-username lb-username--me">
            {{ currentUserEntry.username }}
            <span class="lb-me-badge">toi</span>
          </span>
        </span>
        <span class="lb-metrics">
          <span class="lb-time">{{
            formatTime(currentUserEntry.time_seconds)
          }}</span>
          <span
            class="lb-verif"
            :class="{
              'lb-verif--perfect': currentUserEntry.verify_count === 0,
            }"
          >
            {{
              currentUserEntry.verify_count === 0
                ? "🏆"
                : `${currentUserEntry.verify_count}✓`
            }}
          </span>
        </span>
      </div>

      <!-- Bouton voir plus -->
      <button
        v-if="hasMore"
        class="lb-more-btn"
        :disabled="loading"
        @click="loadMore"
      >
        <span v-if="loading">…</span>
        <span v-else
          >Voir {{ Math.min(10, total - entries.length) }} autres</span
        >
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useLeaderboard } from "../composables/useLeaderboard.js";
import { useAuthStore } from "../stores/auth.js";

const props = defineProps({
  puzzleDate: { type: String, required: true },
  gameType: { type: String, default: "hearts" },
  refreshTrigger: { type: Number, default: 0 },
});

const authStore = useAuthStore();
const {
  entries,
  total,
  loading,
  error,
  topEntries,
  currentUserEntry,
  currentUserRank,
  fetchLeaderboard,
  loadMore,
  reset,
} = useLeaderboard();

// Affiche le top 3 par défaut, ou plus si loadMore a été utilisé
const displayedEntries = computed(() =>
  entries.value.length <= 3 ? entries.value : entries.value,
);

// true si le bouton "voir plus" a été utilisé → on affiche tout ce qu'on a déjà
const hasMore = computed(() => entries.value.length < total.value);

// L'utilisateur courant est-il visible dans la liste affichée ?
const isCurrentUserVisible = computed(() =>
  entries.value.some((e) => e.is_current_user),
);

function formatTime(seconds) {
  if (seconds == null) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Recharge automatiquement quand puzzleDate change
watch(
  () => [props.puzzleDate, props.gameType],
  ([date, type]) => {
    reset();
    if (date && authStore.isLoggedIn) fetchLeaderboard(date, type);
  },
  { immediate: true },
);

// Si l'utilisateur se connecte après le mount, charger le classement
watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn && props.puzzleDate) {
      reset();
      fetchLeaderboard(props.puzzleDate, props.gameType);
    }
  },
);

// Rechargement forcé après sauvegarde du score (refreshTrigger incrémenté par le parent)
watch(
  () => props.refreshTrigger,
  (val) => {
    if (val > 0 && props.puzzleDate && authStore.isLoggedIn) {
      reset();
      fetchLeaderboard(props.puzzleDate, props.gameType);
    }
  },
);
</script>

<style scoped>
/* ── Auth hint ─────────────────────────────────────────────────────────────── */
.lb-auth-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: var(--color-bg-muted, #f5f0f1);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  color: var(--color-text-soft);
  font-weight: 600;
}

/* ── Panel wrapper ─────────────────────────────────────────────────────────── */
.lb-panel {
  width: 100%;
  background: var(--color-bg-card, #fff);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.lb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem 0.5rem;
  border-bottom: 1.5px solid var(--color-border);
  background: var(--color-bg-muted, #f5f0f1);
}
.lb-title {
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-soft);
}
.lb-count {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  font-weight: 600;
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
.lb-skeleton {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0;
}
.lb-skeleton-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.85rem;
}
.lb-skeleton-rank,
.lb-skeleton-name,
.lb-skeleton-time {
  display: block;
  height: 0.85rem;
  background: linear-gradient(90deg, #ede8e9 25%, #f5f0f1 50%, #ede8e9 75%);
  background-size: 200% 100%;
  animation: lb-shimmer 1.4s ease infinite;
  border-radius: 999px;
}
.lb-skeleton-rank {
  width: 1.5rem;
  flex-shrink: 0;
}
.lb-skeleton-name {
  flex: 1;
}
.lb-skeleton-time {
  width: 3rem;
  flex-shrink: 0;
}
@keyframes lb-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Empty / Error ─────────────────────────────────────────────────────────── */
.lb-empty,
.lb-error {
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-soft);
}

/* ── List / Rows ───────────────────────────────────────────────────────────── */
.lb-list {
  display: flex;
  flex-direction: column;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.42rem 0.85rem;
  transition: background 0.12s;
  border-bottom: 1px solid var(--color-border);
}
.lb-row:last-child {
  border-bottom: none;
}
.lb-row--me {
  background: #fffbeb;
}
.lb-row--separated {
  border-top: 1.5px dashed var(--color-border);
  border-bottom: none;
  margin-top: 0.1rem;
}

/* ── Rang ──────────────────────────────────────────────────────────────────── */
.lb-rank {
  width: 1.8rem;
  flex-shrink: 0;
  text-align: center;
  font-size: 1rem;
  line-height: 1;
}
.lb-rank-num {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--color-text-soft);
}

/* ── User ──────────────────────────────────────────────────────────────────── */
.lb-user {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
  min-width: 0;
}
.lb-avatar {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid var(--color-border);
}
.lb-avatar--initials {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-username {
  font-size: 0.87rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.lb-username--me {
  color: var(--color-primary);
}
.lb-me-badge {
  font-size: 0.65rem;
  font-weight: 800;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  padding: 0.05rem 0.3rem;
  border-radius: 999px;
  border: 1px solid var(--color-primary-light);
  white-space: nowrap;
}

/* ── Métriques ─────────────────────────────────────────────────────────────── */
.lb-metrics {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}
.lb-time {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.lb-verif {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-soft);
  background: var(--color-bg-muted, #f5f0f1);
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  white-space: nowrap;
}
.lb-verif--perfect {
  background: #fef3c7;
  color: #92400e;
}

/* ── Voir plus ─────────────────────────────────────────────────────────────── */
.lb-more-btn {
  width: 100%;
  padding: 0.55rem;
  background: none;
  border: none;
  border-top: 1.5px solid var(--color-border);
  font-family: var(--font-family);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary);
  cursor: pointer;
  transition: background 0.15s;
}
.lb-more-btn:hover:not(:disabled) {
  background: var(--color-primary-bg);
}
.lb-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
