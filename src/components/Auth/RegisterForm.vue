<template>
  <form class="auth-form" @submit.prevent="submit" novalidate>
    <!-- Nom d'utilisateur -->
    <div class="field-group" :class="{ 'field-error': errors.username }">
      <label class="field-label" for="reg-username">Nom d'utilisateur</label>
      <input
        id="reg-username"
        v-model="username"
        type="text"
        class="field-input"
        placeholder="mon_pseudo"
        autocomplete="username"
        :disabled="loading"
        @blur="validateUsername"
      />
      <span v-if="errors.username" class="field-error-msg">{{ errors.username }}</span>
      <span v-else class="field-hint">3–20 caractères, lettres, chiffres et _ uniquement.</span>
    </div>

    <!-- Email -->
    <div class="field-group" :class="{ 'field-error': errors.email }">
      <label class="field-label" for="reg-email">Email</label>
      <input
        id="reg-email"
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
      <label class="field-label" for="reg-password">Mot de passe</label>
      <div class="input-wrapper">
        <input
          id="reg-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="field-input"
          placeholder="••••••••"
          autocomplete="new-password"
          :disabled="loading"
          @input="updateStrength"
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
      <div v-if="password" class="strength-bar" aria-label="Force du mot de passe">
        <div
          class="strength-fill"
          :class="`strength-${strengthLevel}`"
          :style="{ width: strengthWidth }"
        ></div>
      </div>
      <span v-if="errors.password" class="field-error-msg">{{ errors.password }}</span>
    </div>

    <!-- Confirmation mot de passe -->
    <div class="field-group" :class="{ 'field-error': errors.confirm }">
      <label class="field-label" for="reg-confirm">Confirmer le mot de passe</label>
      <div class="input-wrapper">
        <input
          id="reg-confirm"
          v-model="confirm"
          :type="showConfirm ? 'text' : 'password'"
          class="field-input"
          placeholder="••••••••"
          autocomplete="new-password"
          :disabled="loading"
          @blur="validateConfirm"
        />
        <button
          type="button"
          class="input-toggle"
          @click="showConfirm = !showConfirm"
          tabindex="-1"
          :aria-label="showConfirm ? 'Masquer' : 'Afficher'"
        >
          {{ showConfirm ? '🙈' : '👁' }}
        </button>
      </div>
      <span v-if="errors.confirm" class="field-error-msg">{{ errors.confirm }}</span>
    </div>

    <!-- Erreur globale -->
    <Transition name="err-slide">
      <div v-if="globalError" class="global-error">
        {{ globalError }}
      </div>
    </Transition>

    <!-- Succès -->
    <Transition name="err-slide">
      <div v-if="successMsg" class="global-success">
        {{ successMsg }}
      </div>
    </Transition>

    <!-- Bouton submit -->
    <button type="submit" class="btn-submit" :disabled="loading || !!successMsg">
      <span v-if="loading" class="btn-spinner"></span>
      <span v-else>Créer mon compte</span>
    </button>
  </form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

const emit = defineEmits(['success'])
const authStore = useAuthStore()

const username     = ref('')
const email        = ref('')
const password     = ref('')
const confirm      = ref('')
const showPassword = ref(false)
const showConfirm  = ref(false)
const loading      = ref(false)
const globalError  = ref('')
const successMsg   = ref('')
const errors = reactive({ username: '', email: '', password: '', confirm: '' })

// ── Validation ──────────────────────────────────────────────────────────────

function validateUsername() {
  const v = username.value.trim()
  if (!v) {
    errors.username = 'Le nom d\'utilisateur est requis.'
  } else if (v.length < 3) {
    errors.username = 'Minimum 3 caractères.'
  } else if (v.length > 20) {
    errors.username = 'Maximum 20 caractères.'
  } else if (!/^[a-zA-Z0-9_]+$/.test(v)) {
    errors.username = 'Lettres, chiffres et _ uniquement.'
  } else {
    errors.username = ''
  }
}

function validateEmail() {
  if (!email.value) {
    errors.email = 'L\'email est requis.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Email invalide.'
  } else {
    errors.email = ''
  }
}

function validatePassword() {
  if (!password.value) {
    errors.password = 'Le mot de passe est requis.'
  } else if (password.value.length < 6) {
    errors.password = 'Minimum 6 caractères.'
  } else {
    errors.password = ''
  }
}

function validateConfirm() {
  if (!confirm.value) {
    errors.confirm = 'Veuillez confirmer votre mot de passe.'
  } else if (confirm.value !== password.value) {
    errors.confirm = 'Les mots de passe ne correspondent pas.'
  } else {
    errors.confirm = ''
  }
}

function validate() {
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirm()
  return !errors.username && !errors.email && !errors.password && !errors.confirm
}

// ── Force du mot de passe ───────────────────────────────────────────────────

const strengthScore = ref(0)

function updateStrength() {
  const p = password.value
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  strengthScore.value = score
}

const strengthLevel = computed(() => {
  const s = strengthScore.value
  if (s <= 1) return 'weak'
  if (s <= 3) return 'medium'
  return 'strong'
})

const strengthWidth = computed(() => {
  const s = strengthScore.value
  return `${Math.min(100, (s / 5) * 100)}%`
})

// ── Submit ──────────────────────────────────────────────────────────────────

async function submit() {
  globalError.value = ''
  successMsg.value  = ''
  if (!validate()) return

  loading.value = true
  const result = await authStore.register(
    email.value.trim(),
    password.value,
    username.value.trim().toLowerCase()
  )
  loading.value = false

  if (result?.error) {
    const msg = result.error
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      globalError.value = 'Cet email est déjà utilisé.'
    } else if (msg.includes('déjà pris') || msg.includes('already taken')) {
      globalError.value = 'Ce nom d\'utilisateur est déjà pris.'
    } else if (msg.includes('Password should be')) {
      globalError.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    } else {
      globalError.value = msg
    }
  } else {
    successMsg.value = 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.'
    setTimeout(() => emit('success'), 2500)
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
.field-hint { font-size: 0.76rem; color: var(--color-text-soft); opacity: 0.7; }

.input-wrapper { position: relative; }
.field-input {
  width: 100%; padding: 0.7rem 1rem;
  border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: 0.95rem;
  background: var(--color-bg); color: var(--color-text);
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
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

/* Barre de force */
.strength-bar {
  height: 4px; background: var(--color-border);
  border-radius: 99px; overflow: hidden; margin-top: 0.25rem;
}
.strength-fill {
  height: 100%; border-radius: 99px;
  transition: width 0.35s ease, background-color 0.35s ease;
}
.strength-weak   { background: var(--color-error); }
.strength-medium { background: #f0a500; }
.strength-strong { background: #2e9e5b; }

/* Erreur / succès global */
.global-error {
  padding: 0.65rem 1rem; border-radius: var(--radius-sm);
  background: var(--color-error-light); color: var(--color-error);
  border: 1px solid var(--color-error); font-size: 0.88rem; font-weight: 600;
}
.global-success {
  padding: 0.65rem 1rem; border-radius: var(--radius-sm);
  background: rgba(46, 158, 91, 0.1); color: #2e9e5b;
  border: 1px solid rgba(46, 158, 91, 0.4); font-size: 0.88rem; font-weight: 600;
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
