<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Tasse (Céramique blanche) -->
      <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="60%" stop-color="#F5F5F5" />
        <stop offset="100%" stop-color="#E0E0E0" />
      </linearGradient>

      <!-- Intérieur de la tasse (Café) -->
      <radialGradient id="coffeeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#5D4037" />
        <stop offset="80%" stop-color="#3E2723" />
        <stop offset="100%" stop-color="#212121" />
      </radialGradient>

      <!-- Lait/Crème (Latte art) -->
      <linearGradient id="foamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D7CCC8" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.6"/>
      </linearGradient>

      <!-- Fumée -->
      <linearGradient id="smokeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </linearGradient>

      <!-- Ombres -->
      <filter id="cupShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.3" />
      </filter>
      <!-- Flou pour la fumée -->
      <filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.6" />
      </filter>
    </defs>

    <g filter="url(#cupShadow)">
      <!-- Soucoupe -->
      <ellipse cx="11" cy="20" rx="9" ry="3" fill="url(#cupGrad)" stroke="#BDBDBD" stroke-width="0.5" />
      <ellipse cx="11" cy="20" rx="6" ry="1.5" fill="#EEEEEE" stroke="#E0E0E0" stroke-width="0.5" />

      <!-- Anse de la tasse -->
      <path 
        d="M 16 11 C 21 11, 22 17, 16 18" 
        fill="none" 
        stroke="url(#cupGrad)" 
        stroke-width="2.5" 
        stroke-linecap="round" 
      />
      <!-- Ombre interne de l'anse -->
      <path 
        d="M 16.5 12 C 19.5 12, 20 16, 16.5 17" 
        fill="none" 
        stroke="#E0E0E0" 
        stroke-width="0.8" 
        stroke-linecap="round" 
      />

      <!-- Corps de la tasse -->
      <path 
        d="M 5 8 L 17 8 L 16 18 C 15.5 19.5, 14 20, 11 20 C 8 20, 6.5 19.5, 6 18 Z" 
        fill="url(#cupGrad)" 
      />

      <!-- Contour supérieur / lèvre de la tasse -->
      <ellipse cx="11" cy="8" rx="6" ry="2.5" fill="url(#cupGrad)" stroke="#E0E0E0" stroke-width="0.5" />

      <!-- Café à l'intérieur -->
      <ellipse cx="11" cy="8" rx="5" ry="1.8" fill="url(#coffeeGrad)" />

      <!-- Latte Art (Petit Cœur en crème) -->
      <path d="M 11 8.8 L 10 7.8 C 9.5 7.3 9.8 6.8 10.3 6.8 C 10.6 6.8 10.8 7 11 7.2 C 11.2 7 11.4 6.8 11.7 6.8 C 12.2 6.8 12.5 7.3 12 7.8 Z" fill="url(#foamGrad)" />

      <!-- Reflet sur la céramique -->
      <path d="M 6.5 10.5 L 7 16" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
      <path d="M 15.5 10 L 15.2 14" stroke="#BDBDBD" stroke-width="1" stroke-linecap="round" opacity="0.5" />
      <path d="M 7 7 L 15 7" stroke="#FFFFFF" stroke-width="0.5" stroke-linecap="round" />
    </g>

    <!-- Volutes de fumée (avec flou) -->
    <g filter="url(#smokeBlur)" opacity="0.7">
      <path d="M 10 6 Q 8 4, 11 2 T 12 -1" fill="none" stroke="url(#smokeGrad)" stroke-width="1.2" stroke-linecap="round" />
      <path d="M 12.5 5.5 Q 14 3.5, 12.5 1.5 T 14 -1" fill="none" stroke="url(#smokeGrad)" stroke-width="0.8" stroke-linecap="round" />
    </g>
  </svg>
</template>
