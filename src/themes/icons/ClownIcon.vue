<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Visage blanc du clown -->
      <radialGradient id="clownFace" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#E0E0E0" />
      </radialGradient>

      <!-- Nez rouge de clown -->
      <radialGradient id="clownNose" cx="35%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#FF5252" />
        <stop offset="70%" stop-color="#D50000" />
        <stop offset="100%" stop-color="#b71c1c" />
      </radialGradient>

      <!-- Cheveux colorés (Troll) -->
      <linearGradient id="clownHairL" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#00BCD4" />
        <stop offset="100%" stop-color="#1E88E5" />
      </linearGradient>
      
      <linearGradient id="clownHairR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FF9800" />
        <stop offset="100%" stop-color="#E65100" />
      </linearGradient>

      <!-- Ombre de tête -->
      <filter id="clownShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#clownShadow)">
      <!-- Cheveux Gauche (Bleu) -->
      <circle cx="5" cy="10" r="3.5" fill="url(#clownHairL)" />
      <circle cx="3" cy="7" r="2.5" fill="url(#clownHairL)" />
      <circle cx="7" cy="6" r="3" fill="url(#clownHairL)" />
      
      <!-- Cheveux Droit (Orange) -->
      <circle cx="19" cy="10" r="3.5" fill="url(#clownHairR)" />
      <circle cx="21" cy="7" r="2.5" fill="url(#clownHairR)" />
      <circle cx="17" cy="6" r="3" fill="url(#clownHairR)" />

      <!-- Petits chapeau jaune minuscule -->
      <polygon points="10,6 14,6 12,2" fill="#FFEB3B" stroke="#F57F17" stroke-width="0.5" stroke-linejoin="round" />
      <circle cx="12" cy="1.5" r="1.2" fill="#E91E63" /> <!-- Pompon -->

      <!-- Visage du clown -->
      <ellipse cx="12" cy="14" rx="7" ry="8" fill="url(#clownFace)" />

      <!-- Yeux de clown stylisés (Etoile et croix, ou des couleurs) -->
      <path d="M 8.5 10 L 10.5 10 L 9.5 13 Z" fill="#00BCD4" /> <!-- Maquillage œil gauche -->
      <path d="M 13.5 10 L 15.5 10 L 14.5 13 Z" fill="#E91E63" /> <!-- Maquillage œil droit -->
      
      <!-- Globes oculaires et pupilles -->
      <circle cx="9.5" cy="11.5" r="1.5" fill="#FFF" />
      <circle cx="14.5" cy="11.5" r="1.5" fill="#FFF" />
      <circle cx="9.5" cy="11.5" r="0.8" fill="#212121" />
      <circle cx="14.5" cy="11.5" r="0.8" fill="#212121" />

      <!-- Grand sourire rouge de clown -->
      <path d="M 7 16 C 9 20, 15 20, 17 16 C 15 17, 9 17, 7 16 Z" fill="#D50000" />
      <!-- Dents -->
      <path d="M 8.5 16.5 L 15.5 16.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
      
      <!-- Maquillage commissures des lèvres -->
      <circle cx="7" cy="15.5" r="0.8" fill="#D50000" />
      <circle cx="17" cy="15.5" r="0.8" fill="#D50000" />

      <!-- Nez Rouge (Gros) -->
      <circle cx="12" cy="14" r="2.5" fill="url(#clownNose)" />
      <!-- Reflet sur le nez -->
      <circle cx="11.3" cy="13.3" r="0.8" fill="#FFFFFF" opacity="0.8" />
    </g>
  </svg>
</template>
