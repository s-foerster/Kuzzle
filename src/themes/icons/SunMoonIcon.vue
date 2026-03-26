<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradés du Soleil -->
      <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFEE58" />
        <stop offset="100%" stop-color="#F57C00" />
      </linearGradient>

      <!-- Lueur du soleil -->
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFF59D" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#FFB300" stop-opacity="0" />
      </radialGradient>

      <!-- Dégradés de la Lune -->
      <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E3F2FD" />
        <stop offset="50%" stop-color="#90CAF9" />
        <stop offset="100%" stop-color="#1565C0" />
      </linearGradient>

      <!-- Ombres -->
      <filter id="smShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#smShadow)">
      <!-- Lueur du soleil en arrière-plan -->
      <circle cx="8" cy="8" r="8" fill="url(#sunGlow)" />
      
      <!-- Rayons du Soleil -->
      <g stroke="url(#sunGrad)" stroke-width="1.8" stroke-linecap="round">
        <line x1="8" y1="1" x2="8" y2="3" />
        <line x1="8" y1="13" x2="8" y2="15" />
        <line x1="1" y1="8" x2="3" y2="8" />
        <line x1="13" y1="8" x2="15" y2="8" />
        <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" />
        <line x1="11.54" y1="11.54" x2="12.95" y2="12.95" />
        <line x1="3.05" y1="12.95" x2="4.46" y2="11.54" />
        <line x1="11.54" y1="4.46" x2="12.95" y2="3.05" />
      </g>

      <!-- Corps du Soleil -->
      <circle cx="8" cy="8" r="4" fill="url(#sunGrad)" />

      <!-- Lune (croissant à l'avant-plan, se superposant au soleil) -->
      <path 
        d="M 12.5 10 C 12.5 15, 16 19, 21 19 C 19 21.5, 16 23, 13 23 C 8 23, 4 19, 4 14 C 4 11, 5 8.5, 7 7 C 9 9, 11 10, 12.5 10 Z" 
        fill="url(#moonGrad)" 
      />

      <!-- Reflets sur la lune -->
      <path d="M 6.5 14 C 6.5 17 8.5 20 12 21.5" stroke="#FFFFFF" stroke-width="0.8" fill="none" opacity="0.5" stroke-linecap="round" />
      
      <!-- Cratères stylisés sur la lune -->
      <circle cx="12" cy="18" r="1.2" fill="#1565C0" opacity="0.3" />
      <circle cx="9" cy="15" r="0.8" fill="#1565C0" opacity="0.3" />
      <circle cx="15" cy="21" r="0.6" fill="#1565C0" opacity="0.3" />
      
      <!-- Petites étoiles autour de la lune -->
      <path d="M 19 6 L 19.5 7.5 L 21 8 L 19.5 8.5 L 19 10 L 18.5 8.5 L 17 8 L 18.5 7.5 Z" fill="#FFF" />
      <path d="M 22 12 L 22.3 12.8 L 23 13 L 22.3 13.2 L 22 14 L 21.7 13.2 L 21 13 L 21.7 12.8 Z" fill="#FFF" opacity="0.8" />
    </g>
  </svg>
</template>
