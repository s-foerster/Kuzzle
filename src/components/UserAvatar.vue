<template>
  <div class="user-avatar-wrapper">
    <!-- Non connecté : bouton "Se connecter" -->
    <button
      v-if="!authStore.isLoggedIn"
      class="btn-connect"
      @click="authStore.openAuthModal('login')"
    >
      Se connecter
    </button>

    <!-- Connecté : avatar cliquable -->
    <div v-else class="avatar-menu" ref="menuRef">
      <button class="avatar-btn" @click="toggleMenu" :aria-label="authStore.username ?? 'Mon profil'">
        <!-- Photo Google -->
        <img
          v-if="authStore.avatarUrl"
          :src="authStore.avatarUrl"
          :alt="authStore.username ?? ''"
          class="avatar-img"
          referrerpolicy="no-referrer"
        />
        <!-- Initiales en fallback -->
        <span v-else class="avatar-initials" :style="{ background: initialsColor }">
          {{ initials }}
        </span>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown-fade">
        <div v-if="menuOpen" class="avatar-dropdown" role="menu">
          <div class="dropdown-info">
            <span class="dropdown-username">{{ authStore.username }}</span>
            <span class="dropdown-email">{{ authStore.user?.email }}</span>
          </div>
          <hr class="dropdown-divider" />
          <button class="dropdown-item" role="menuitem" @click="goToProfil">
            Mon profil
          </button>
          <button class="dropdown-item dropdown-item--danger" role="menuitem" @click="handleLogout">
            Se déconnecter
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router    = useRouter()
const menuOpen  = ref(false)
const menuRef   = ref(null)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function goToProfil() {
  closeMenu()
  router.push('/profil')
}

async function handleLogout() {
  closeMenu()
  await authStore.logout()
  router.push('/')
}

// Fermer le menu si clic extérieur
function onClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    closeMenu()
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))

// Initiales (1 ou 2 lettres)
const initials = computed(() => {
  const name = authStore.username ?? authStore.user?.email ?? '?'
  const parts = name.split(/[\s_\-@]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

// Couleur déterministe basée sur le nom
const PALETTE = [
  '#e05a6e', '#d45f8f', '#9b59b6', '#3498db',
  '#2ecc71', '#f39c12', '#e74c3c', '#1abc9c',
]
const initialsColor = computed(() => {
  const name = authStore.username ?? 'user'
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return PALETTE[Math.abs(hash) % PALETTE.length]
})
</script>

<style scoped>
.user-avatar-wrapper { display: flex; align-items: center; }

/* ── Bouton connexion ──────────────────────────────────────────────────────── */
.btn-connect {
  padding: 0.45rem 1.1rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
}
.btn-connect:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* ── Avatar bouton ─────────────────────────────────────────────────────────── */
.avatar-menu { position: relative; }

.avatar-btn {
  background: none; border: none; padding: 0;
  cursor: pointer; border-radius: 50%;
  transition: box-shadow 0.2s, transform 0.2s;
}
.avatar-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(224, 90, 110, 0.25);
}

.avatar-img {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
  display: block;
}

.avatar-initials {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.82rem; font-weight: 800; color: white;
  letter-spacing: 0.03em;
  border: 2px solid rgba(255,255,255,0.2);
  user-select: none;
}

/* ── Dropdown ──────────────────────────────────────────────────────────────── */
.avatar-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  min-width: 200px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 500;
}

.dropdown-info {
  padding: 0.75rem 1rem;
  display: flex; flex-direction: column; gap: 0.15rem;
}
.dropdown-username {
  font-size: 0.9rem; font-weight: 800; color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dropdown-email {
  font-size: 0.74rem; color: var(--color-text-soft);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.dropdown-divider {
  border: none; border-top: 1px solid var(--color-border);
  margin: 0;
}

.dropdown-item {
  width: 100%; text-align: left;
  background: none; border: none;
  padding: 0.65rem 1rem;
  font-family: var(--font-family); font-size: 0.88rem; font-weight: 600;
  color: var(--color-text);
  cursor: pointer; transition: background 0.15s;
  display: block;
}
.dropdown-item:hover { background: var(--color-bg); }
.dropdown-item--danger { color: var(--color-error); }
.dropdown-item--danger:hover { background: var(--color-error-light); }

/* ── Transition dropdown ───────────────────────────────────────────────────── */
.dropdown-fade-enter-active { animation: dropIn 0.18s ease; }
.dropdown-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-fade-leave-to     { opacity: 0; transform: translateY(-6px) scale(0.97); }
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
</style>
