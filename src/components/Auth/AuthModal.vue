<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="authStore.authModalOpen"
        class="modal-backdrop"
        @click.self="authStore.closeAuthModal()"
        role="dialog"
        aria-modal="true"
        aria-label="Connexion / Inscription"
      >
        <Transition name="modal-scale">
          <div v-if="authStore.authModalOpen" class="modal-card">

            <!-- Bouton fermer -->
            <button
              class="modal-close"
              @click="authStore.closeAuthModal()"
              aria-label="Fermer"
            >
              ✕
            </button>

            <!-- Entête de marque -->
            <div class="modal-brand">
              <img src="../../assets/kuzzle_logo.png" alt="Kuzzle" class="modal-logo" />
              <span class="modal-brand-name">Kuzzle</span>
              <p class="modal-tagline">Sauvegardez vos scores et suivez vos progrès</p>
            </div>

            <!-- Bouton Google -->
            <GoogleAuthButton
              :loading="googleLoading"
              @click="handleGoogle"
            />

            <!-- Séparateur -->
            <div class="modal-divider">
              <span class="modal-divider-line"></span>
              <span class="modal-divider-text">ou</span>
              <span class="modal-divider-line"></span>
            </div>

            <!-- Onglets Connexion / Inscription -->
            <div class="modal-tabs" role="tablist">
              <button
                class="modal-tab"
                :class="{ 'modal-tab--active': activeTab === 'login' }"
                role="tab"
                :aria-selected="activeTab === 'login'"
                @click="activeTab = 'login'"
              >
                Connexion
              </button>
              <button
                class="modal-tab"
                :class="{ 'modal-tab--active': activeTab === 'register' }"
                role="tab"
                :aria-selected="activeTab === 'register'"
                @click="activeTab = 'register'"
              >
                Inscription
              </button>
              <!-- Indicateur glissant -->
              <div
                class="modal-tab-indicator"
                :style="{ left: activeTab === 'login' ? '4px' : '50%' }"
              ></div>
            </div>

            <!-- Formulaires -->
            <div class="modal-form-area">
              <Transition name="form-slide" mode="out-in">
                <LoginForm
                  v-if="activeTab === 'login'"
                  key="login"
                  @success="authStore.closeAuthModal()"
                />
                <RegisterForm
                  v-else
                  key="register"
                  @success="authStore.closeAuthModal()"
                />
              </Transition>
            </div>

            <!-- Lien pour basculer -->
            <p class="modal-switch">
              <template v-if="activeTab === 'login'">
                Pas encore de compte ?
                <button class="modal-switch-link" @click="activeTab = 'register'">
                  S'inscrire
                </button>
              </template>
              <template v-else>
                Déjà un compte ?
                <button class="modal-switch-link" @click="activeTab = 'login'">
                  Se connecter
                </button>
              </template>
            </p>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import GoogleAuthButton from './GoogleAuthButton.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const authStore     = useAuthStore()
const googleLoading = ref(false)
const activeTab     = ref('login')

// Sync activeTab when modal opens
watch(() => authStore.authModalOpen, (open) => {
  if (open) {
    activeTab.value    = authStore.authModalInitialTab ?? 'login'
    googleLoading.value = false
  }
})

async function handleGoogle() {
  googleLoading.value = true
  await authStore.loginWithGoogle()
  // After OAuth redirect, page navigates away — no need to reset loading
}
</script>

<style scoped>
/* ── Backdrop ───────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ── Carte ──────────────────────────────────────────────────────────────────── */
.modal-card {
  position: relative;
  width: 100%; max-width: 420px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.08) inset;
  padding: 2rem 2rem 1.75rem;
  display: flex; flex-direction: column; gap: 1.25rem;
  max-height: 90vh; overflow-y: auto;
}

/* ── Fermer ─────────────────────────────────────────────────────────────────── */
.modal-close {
  position: absolute; top: 1rem; right: 1rem;
  background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: 50%; width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; color: var(--color-text-soft);
  cursor: pointer; transition: all 0.2s ease;
  line-height: 1;
}
.modal-close:hover {
  background: var(--color-error-light); color: var(--color-error);
  border-color: var(--color-error);
}

/* ── Brand ──────────────────────────────────────────────────────────────────── */
.modal-brand {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.25rem; text-align: center;
}
.modal-logo {
  width: 48px; height: 48px; object-fit: contain;
  border-radius: var(--radius-sm);
}
.modal-brand-name {
  font-size: 1.4rem; font-weight: 900; color: var(--color-primary);
  letter-spacing: -0.02em;
}
.modal-tagline {
  font-size: 0.82rem; color: var(--color-text-soft);
  margin: 0; opacity: 0.8;
}

/* ── Séparateur ─────────────────────────────────────────────────────────────── */
.modal-divider {
  display: flex; align-items: center; gap: 0.75rem;
}
.modal-divider-line {
  flex: 1; height: 1px; background: var(--color-border);
}
.modal-divider-text {
  font-size: 0.78rem; font-weight: 700;
  color: var(--color-text-soft); text-transform: uppercase; letter-spacing: 0.06em;
}

/* ── Onglets ────────────────────────────────────────────────────────────────── */
.modal-tabs {
  position: relative;
  display: flex;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 4px;
  gap: 0;
}
.modal-tab {
  flex: 1; padding: 0.55rem 0;
  background: none; border: none;
  font-family: var(--font-family); font-size: 0.9rem; font-weight: 700;
  color: var(--color-text-soft);
  cursor: pointer; position: relative; z-index: 1;
  transition: color 0.2s;
}
.modal-tab--active { color: var(--color-primary); }

.modal-tab-indicator {
  position: absolute; top: 4px; bottom: 4px;
  width: calc(50% - 4px);
  background: var(--color-surface);
  border-radius: calc(var(--radius-md) - 2px);
  box-shadow: var(--shadow-sm);
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

/* ── Zone formulaire ────────────────────────────────────────────────────────── */
.modal-form-area {
  /* reserve space to avoid layout jump */
  min-height: 180px;
}

/* ── Lien switch ────────────────────────────────────────────────────────────── */
.modal-switch {
  text-align: center; font-size: 0.83rem;
  color: var(--color-text-soft); margin: 0;
}
.modal-switch-link {
  background: none; border: none;
  color: var(--color-primary); font-weight: 700; font-size: 0.83rem;
  cursor: pointer; padding: 0; margin-left: 0.25rem;
  text-decoration: underline; text-underline-offset: 2px;
  transition: opacity 0.2s;
}
.modal-switch-link:hover { opacity: 0.75; }

/* ── Transitions ────────────────────────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }

.modal-scale-enter-active { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-scale-leave-active { animation: scaleOut 0.2s ease forwards; }
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes scaleOut {
  from { opacity: 1; transform: scale(1);    }
  to   { opacity: 0; transform: scale(0.94); }
}

.form-slide-enter-active,
.form-slide-leave-active { transition: all 0.2s ease; }
.form-slide-enter-from   { opacity: 0; transform: translateX(12px); }
.form-slide-leave-to     { opacity: 0; transform: translateX(-12px); }
</style>
