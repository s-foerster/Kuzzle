<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradé marron doux et brillant -->
      <linearGradient id="poopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A1887F" />
        <stop offset="40%" stop-color="#795548" />
        <stop offset="100%" stop-color="#4E342E" />
      </linearGradient>

      <!-- Ombre portée pour le troll -->
      <filter id="poopShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#3E2723" flood-opacity="0.5" />
      </filter>
    </defs>

    <g filter="url(#poopShadow)">
      <!-- Base (étage 3 / bas) -->
      <path 
        d="M 3 17 C 3 20.5, 7 22, 12 22 C 17 22, 21 20.5, 21 17 C 21 14.5, 18 14.5, 17 14 C 18 14.5, 20.5 16, 20.5 17.5 C 20.5 19.5, 16.5 21, 12 21 C 7.5 21, 3.5 19.5, 3.5 17.5 C 3.5 16, 6 14.5, 7 14 C 6 14.5, 3 14.5, 3 17 Z" 
        fill="url(#poopGrad)" 
      />
      <path 
        d="M 2.5 17 C 2.5 14, 21.5 14, 21.5 17 C 21.5 20.5, 16 22, 12 22 C 8 22, 2.5 20.5, 2.5 17 Z" 
        fill="url(#poopGrad)" 
      />

      <!-- Etage 2 / milieu -->
      <path 
        d="M 4.5 13 C 4.5 10.5, 19.5 10.5, 19.5 13 C 19.5 16, 17 17.5, 12 17.5 C 7 17.5, 4.5 16, 4.5 13 Z" 
        fill="url(#poopGrad)" 
      />
      
      <!-- Lignes de séparation / ombre entre étages -->
      <path d="M 4.5 13 Q 12 15 19.5 13" fill="none" stroke="#3E2723" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 2.5 17 Q 12 18.5 21.5 17" fill="none" stroke="#3E2723" stroke-width="1.5" stroke-linecap="round" />

      <!-- Etage 1 / haut -->
      <path 
        d="M 7.5 9 C 7.5 5, 12 2, 14 3 C 12 4, 13 8, 16.5 9 C 16.5 11.5, 15 12.5, 12 12.5 C 9 12.5, 7.5 11.5, 7.5 9 Z" 
        fill="url(#poopGrad)" 
      />
      <path d="M 7.5 9 Q 12 11 16.5 9" fill="none" stroke="#3E2723" stroke-width="1.5" stroke-linecap="round" />

      <!-- Pointe effilée mignonne -->
      <path d="M 12 4 C 11.5 2, 13 2, 14 3 C 13.5 5, 11.5 5, 12 4 Z" fill="url(#poopGrad)" />

      <!-- Visage souriant Kawaii -->
      <!-- Yeux -->
      <ellipse cx="9" cy="14.5" rx="1.2" ry="2" fill="#212121" />
      <ellipse cx="15" cy="14.5" rx="1.2" ry="2" fill="#212121" />
      <!-- Reflets dans les yeux -->
      <circle cx="8.6" cy="13.5" r="0.6" fill="#FFFFFF" />
      <circle cx="14.6" cy="13.5" r="0.6" fill="#FFFFFF" />
      <!-- Joues -->
      <ellipse cx="7" cy="16" rx="1.5" ry="1" fill="#FF8A80" opacity="0.8" />
      <ellipse cx="17" cy="16" rx="1.5" ry="1" fill="#FF8A80" opacity="0.8" />
      <!-- Bouche -->
      <path d="M 10 16.5 Q 12 19.5, 14 16.5 Z" fill="#EF9A9A" />
      <!-- Ligne de la bouche au dessus -->
      <path d="M 9.5 16.5 Q 12 17.5, 14.5 16.5" fill="none" stroke="#212121" stroke-width="0.8" stroke-linecap="round" />

      <!-- Reflets brillants "texture" -->
      <path d="M 4 17 Q 6 15 8 16" fill="none" stroke="#D7CCC8" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
      <path d="M 6 13 Q 8 12 10 12" fill="none" stroke="#D7CCC8" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
      <path d="M 9 9 Q 10 8 11 8" fill="none" stroke="#D7CCC8" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
    </g>
  </svg>
</template>
