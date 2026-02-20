<template>
  <form class="auth-form" @submit.prevent="submit" novalidate>
    <!-- Email -->
    <div class="field-group" :class="{ 'field-error': errors.email }">
      <label class="field-label" for="login-email">Email</label>
      <input
        id="login-email"
        v-model="email"
        type="email"
        class="field-input"
        placeholder="votre@email.com"
        autocomplete="email"
        :disabled="loading"
        @blur="validateEmail"
      />
      <span v-if="errors.email" class="field-error-msg">{{ errors.email }}</span>
    </div>

    <!-- Mot de passe -->
    <div class="field-group" :class="{ 'field-error': errors.password }">
      <label class="field-label" for="login-password">Mot de passe</label>
      <div class="input-wrapper">
        <input
          id="login-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="field-input"
          placeholder="••••••••"
          autocomplete="current-password"
          :disabled="loading"
        />
        <button
          type="button"
          class="input-toggle"
          @click="showPassword = !showPassword"
          tabindex="-1"
          :aria-label="showPassword ? 'Masquer' : 'Afficher'"
        >
          {{ showPassword ? '🙈' : '👁' }}
        </button>
      </div>
      <span v-if="errors.password" class="field-error-msg">{{ errors.password }}</span>
    </div>

    <!-- Erreur globale -->
    <Transition name="err-slide">
      <div v-if="globalError" class="global-error">
        {{ globalError }}
      </div>
    </Transition>

    <!-- Bouton submit -->
    <button type="submit" class="btn-submit" :disabled="loading">
      <span v-if="loading" class="btn-spinner"></span>
      <span v-else>Se connecter</span>
    </button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

const emit = defineEmits(['success'])
const authStore = useAuthStore()

const email        = ref('')
const password     = ref('')
const showPassword = ref(false)
const loading      = ref(false)
const globalError  = ref('')
const errors = reactive({ email: '', password: '' })

function validateEmail() {
  if (!email.value) {
    errors.email = 'L\'email est requis.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Email invalide.'
  } else {
    errors.email = ''
  }
}

function validate() {
  validateEmail()
  errors.password = password.value.length < 6
    ? 'Le mot de passe doit contenir au moins 6 caractères.'
    : ''
  return !errors.email && !errors.password
}

async function submit() {
  globalError.value = ''
  if (!validate()) return

  loading.value = true
  const result = await authStore.loginWithEmail(email.value.trim(), password.value)
  loading.value = false

  if (result?.error) {
    // Traduire les messages Supabase courants
    const msg = result.error
    if (msg.includes('Invalid login credentials')) {
      globalError.value = 'Email ou mot de passe incorrect.'
    } else if (msg.includes('Email not confirmed')) {
      globalError.value = 'Confirmez votre email avant de vous connecter.'
    } else {
      globalError.value = msg
    }
  } else {
    emit('success')
  }
}
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: 1rem; }

.field-group { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label {
  font-size: 0.82rem; font-weight: 700;
  color: var(--color-text-soft); text-transform: uppercase; letter-spacing: 0.04em;
}
.input-wrapper { position: relative; }
.field-input {
  width: 100%; padding: 0.7rem 1rem;
  border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.95rem;
  background: var(--color-bg); color: var(--color-text);
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(224, 90, 110, 0.12);
}
.field-input:disabled { opacity: 0.6; cursor: not-allowed; }
.field-error .field-input { border-color: var(--color-error); }
.field-error-msg { font-size: 0.78rem; color: var(--color-error); }

.input-toggle {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0;
  line-height: 1; opacity: 0.6; transition: opacity 0.2s;
}
.input-toggle:hover { opacity: 1; }

/* Erreur globale */
.global-error {
  padding: 0.65rem 1rem; border-radius: var(--radius-sm);
  background: var(--color-error-light); color: var(--color-error);
  border: 1px solid var(--color-error); font-size: 0.88rem; font-weight: 600;
}
.err-slide-enter-active { animation: errIn 0.3s ease; }
.err-slide-leave-active { transition: opacity 0.2s; }
.err-slide-leave-to     { opacity: 0; }
@keyframes errIn {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

/* Bouton submit */
.btn-submit {
  width: 100%; padding: 0.85rem 1rem;
  background: var(--gradient-primary); color: white;
  border: none; border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 1rem; font-weight: 800;
  cursor: pointer; transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
