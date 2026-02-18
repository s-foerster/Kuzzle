<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Comment jouer</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <HowToPlayRules />
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="$emit('close')">
            J'ai compris !
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import HowToPlayRules from "./HowToPlayRules.vue";

defineProps({ isOpen: Boolean });
defineEmits(["close"]);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(44, 44, 58, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 92%;
  max-width: 600px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 0.9rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(
    --gradient-header,
    linear-gradient(135deg, #e05a6e 0%, #b03050 100%)
  );
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #fff;
  font-family: var(--font-family, "Nunito"), sans-serif;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.modal-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #eee;
  text-align: center;
  flex-shrink: 0;
}

.btn-primary {
  background: var(
    --gradient-header,
    linear-gradient(135deg, #e05a6e 0%, #b03050 100%)
  );
  color: white;
  border: none;
  padding: 0.65rem 2rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-family: var(--font-family, "Nunito"), sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.1s;
  box-shadow: 0 4px 12px rgba(224, 90, 110, 0.3);
}
.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
