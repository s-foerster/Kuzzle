<template>
  <ul :class="listClass">
    <li>🎁 7 jours d'essai gratuit — aucun débit avant la fin</li>
    <li>✨ Débloquez l'accès à plus de 1000 puzzles de logique en illimité</li>
    <li>📊 Accédez à vos statistiques détaillées</li>
    <li>🏆 Comparez-vous aux autres joueurs via le classement</li>
    <li>🎨 Débloquez l'accès à plus de 20 thèmes exclusifs</li>
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
