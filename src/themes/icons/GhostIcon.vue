<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Corps de fantôme avec légère transparence/lueur -->
      <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="60%" stop-color="#E3F2FD" />
        <stop offset="100%" stop-color="#90CAF9" />
      </linearGradient>

      <!-- Effet de flotte pour le fantôme -->
      <filter id="ghostShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1565C0" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#ghostShadow)">
      <!-- Le Corps Drapé -->
      <path 
        d="M 12 3 C 7 3, 4 7, 4 12 L 4 21 C 4 22, 5 22, 5.5 21 C 6 20, 7 20, 7.5 21 C 8 22, 9 22, 9.5 21 C 10 20, 11 20, 11.5 21 C 12 22, 13 22, 13.5 21 C 14 20, 15 20, 15.5 21 C 16 22, 17 22, 17.5 21 C 18 20, 19 20, 19.5 21 C 20 22, 20 21.5, 20 21 L 20 12 C 20 7, 17 3, 12 3 Z" 
        fill="url(#ghostGrad)" 
      />

      <!-- Bras mignons qui flottent -->
      <path d="M 4.5 14 Q 2 13 3 11" fill="none" stroke="url(#ghostGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 19.5 14 Q 22 13 21 11" fill="none" stroke="url(#ghostGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Yeux rieurs / mignons -->
      <circle cx="9" cy="11" r="1.5" fill="#212121" />
      <circle cx="15" cy="11" r="1.5" fill="#212121" />
      
      <!-- Langue tirée (Troll/Mignon) -->
      <path d="M 10 14 L 14 14 Q 14 18 12 18 Q 10 18 10 14 Z" fill="#EF9A9A" />
      
      <!-- Ligne de la bouche au dessus -->
      <path d="M 9.5 14 Q 12 15, 14.5 14" fill="none" stroke="#212121" stroke-width="0.8" stroke-linecap="round" />

      <!-- Petites joues -->
      <ellipse cx="6.5" cy="12.5" rx="1.5" ry="1" fill="#FFCDD2" opacity="0.7" />
      <ellipse cx="17.5" cy="12.5" rx="1.5" ry="1" fill="#FFCDD2" opacity="0.7" />

      <!-- Reflet de drapé -->
      <path d="M 8 5 Q 12 4 16 5" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <path d="M 7 17 L 7 20 M 12 17 L 12 20 M 17 17 L 17 20" stroke="#BBDEFB" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    </g>
  </svg>
</template>
