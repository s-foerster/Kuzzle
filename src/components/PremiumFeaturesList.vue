<template>
  <ul :class="listClass">
    <li>
      ✨ Débloquez l'historique de plus de 1000 puzzles de logique en illimité
    </li>
    <li>📊 Accédez à vos statistiques détaillées</li>
    <li>🏆 Comparez-vous aux autres joueurs via le classement</li>
    <li>🎨 Débloquez l'accès aux thèmes exclusifs</li>
    <li>💛 Soutenez le développement de Rubih Games</li>
  </ul>
</template>

<script setup>
defineProps({
  listClass: {
    type: String,
    default: "",
  },
});
</script>
