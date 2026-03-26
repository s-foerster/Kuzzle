<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="dinoBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4DB6AC" />
        <stop offset="50%" stop-color="#00897B" />
        <stop offset="100%" stop-color="#004D40" />
      </linearGradient>

      <!-- Écailles dorsales -->
      <linearGradient id="dinoSpike" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFCA28" />
        <stop offset="100%" stop-color="#FF8F00" />
      </linearGradient>

      <filter id="dinoShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#004D40" flood-opacity="0.4" />
      </filter>
      
      <!-- Taches du dino -->
      <radialGradient id="dinoSpot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#80CBC4" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#26A69A" stop-opacity="0.2"/>
      </radialGradient>
    </defs>

    <g filter="url(#dinoShadow)">
      <!-- Épines dorsales -->
      <path d="M 6.5 12 L 5 10 L 8 11 Z" fill="url(#dinoSpike)" stroke="#F57F17" stroke-width="0.3" stroke-linejoin="round" />
      <path d="M 8.5 9 L 8 6 L 11.5 8 Z" fill="url(#dinoSpike)" stroke="#F57F17" stroke-width="0.3" stroke-linejoin="round" />
      <path d="M 12 7 L 13 4 L 15.5 6 Z" fill="url(#dinoSpike)" stroke="#F57F17" stroke-width="0.3" stroke-linejoin="round" />
      <path d="M 16.5 7 L 19 5 L 19 8 Z" fill="url(#dinoSpike)" stroke="#F57F17" stroke-width="0.3" stroke-linejoin="round" />

      <!-- Corps du Dinosaure (de la queue à la tête) -->
      <path 
        d="M 2 18 C 3 18, 5 17, 6 15 C 6 13, 7 10, 10 8 C 12 7, 15 6, 17 6 C 22 6, 23 8, 21 11 C 19 11, 18 10.5, 17 10.5 C 16 10.5, 15 13, 16 15 C 17 18, 16 22, 13 22 C 11 22, 10 20, 10 18 C 10 17, 8 16, 7 18 C 6 20, 4 21, 3 20 C 2.5 19.5, 2 18.5, 2 18 Z" 
        fill="url(#dinoBody)" 
      />

      <!-- Bras (petit T-rex) -->
      <path d="M 15 13 Q 17 14 18 14 Q 18 15 17 15" fill="none" stroke="#00897B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Oeil -->
      <circle cx="18" cy="8.5" r="1.2" fill="#FFF" />
      <circle cx="18.5" cy="8.5" r="0.6" fill="#212121" />
      <circle cx="18.3" cy="8.3" r="0.2" fill="#FFF" /> <!-- Reflet dans l'oeil -->

      <!-- Joue rose (style Kawaii) -->
      <circle cx="16" cy="9.5" r="1" fill="#FF8A80" opacity="0.7" />

      <!-- Sourire -->
      <path d="M 20 10 Q 21 10.5 21.5 10" fill="none" stroke="#212121" stroke-width="0.5" stroke-linecap="round" />

      <!-- Taches décoratives sur le corps -->
      <circle cx="12" cy="11" r="1.5" fill="url(#dinoSpot)" />
      <circle cx="9" cy="13" r="1" fill="url(#dinoSpot)" />
      <circle cx="13" cy="15" r="1.2" fill="url(#dinoSpot)" />
      <circle cx="10" cy="18" r="0.8" fill="url(#dinoSpot)" />
      <circle cx="6" cy="15" r="0.8" fill="url(#dinoSpot)" />

      <!-- Ligne de reflet pour volume -->
      <path d="M 10 8.5 C 13 7.5, 16 7.5, 18 8" fill="none" stroke="#FFF" stroke-width="1" stroke-linecap="round" opacity="0.4" />
      <path d="M 10.5 20 Q 12 21.5 13.5 20" fill="none" stroke="#004D40" stroke-width="1" stroke-linecap="round" opacity="0.3" /> <!-- Pli de la patte -->
    </g>
  </svg>
</template>
