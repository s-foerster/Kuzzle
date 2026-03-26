<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradé Aubergine (Violet riche) -->
      <linearGradient id="eggplantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#AB47BC" />
        <stop offset="40%" stop-color="#8E24AA" />
        <stop offset="100%" stop-color="#4A148C" />
      </linearGradient>

      <!-- Tige/Chapeau vert -->
      <linearGradient id="eggplantStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8BC34A" />
        <stop offset="100%" stop-color="#33691E" />
      </linearGradient>

      <!-- Ombre -->
      <filter id="eggplantShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#311B92" flood-opacity="0.4" />
      </filter>
    </defs>

    <g filter="url(#eggplantShadow)">
      <!-- Corps de l'aubergine -->
      <path 
        d="M 7 4 C 1 10, 3 18, 9 21 C 15 24, 21 19, 21 13 C 21 7, 16 3, 11 3 C 10 3, 8 3.5, 7 4 Z" 
        fill="url(#eggplantGrad)" 
      />

      <!-- Chapeau vert étoilé -->
      <path d="M 10 1 C 12 1, 14 3, 14 3 L 13 4 L 15 5 L 13 6 L 14 8 L 11 6.5 L 9 8 L 9 6 L 7 5 L 9 4 M 10 1 Z" fill="url(#eggplantStemGrad)" stroke="#1B5E20" stroke-width="0.5" stroke-linejoin="round" />
      
      <!-- Tige recourbée -->
      <path d="M 11 3 C 10 1, 11 0, 13 0 C 13.5 0.5, 12 1, 12 2 Z" fill="url(#eggplantStemGrad)" />

      <!-- Reflet violet clair pour la forme rebondie -->
      <path d="M 14 6 C 17 9, 18 13.5, 15 18" fill="none" stroke="#CE93D8" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
      <path d="M 8.5 7.5 C 7 11, 7.5 15, 9.5 18" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" opacity="0.3" /> <!-- Ombre propre -->
      
      <!-- Petit éclat blanc spéculaire -->
      <path d="M 13 5 Q 16 8 16 11" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.6" />
    </g>
  </svg>
</template>
