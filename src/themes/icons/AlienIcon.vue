<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Visage Alien (Vert ou Gris) -->
      <linearGradient id="alienGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#C6FF00" />
        <stop offset="50%" stop-color="#76FF03" />
        <stop offset="100%" stop-color="#33691E" />
      </linearGradient>

      <!-- Yeux Noirs Cosmo -->
      <linearGradient id="alienEye" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#212121" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>

      <!-- Lueur mystérieuse -->
      <filter id="alienGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#76FF03" flood-opacity="0.6" />
      </filter>
    </defs>

    <g filter="url(#alienGlow)">
      <!-- Tête d'Alien (Forme triangulaire arrondie) -->
      <path 
        d="M 12 2 C 18 2, 22 7, 20 15 C 19 19, 15 22, 12 22 C 9 22, 5 19, 4 15 C 2 7, 6 2, 12 2 Z" 
        fill="url(#alienGrad)" 
      />

      <!-- Oeil Gauche -->
      <ellipse 
        cx="7" 
        cy="12" 
        rx="3" 
        ry="5" 
        transform="rotate(-25 7 12)" 
        fill="url(#alienEye)" 
      />
      
      <!-- Oeil Droit -->
      <ellipse 
        cx="17" 
        cy="12" 
        rx="3" 
        ry="5" 
        transform="rotate(25 17 12)" 
        fill="url(#alienEye)" 
      />

      <!-- Reflets dans les yeux (Galactique) -->
      <circle cx="7" cy="9.5" r="0.8" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="6" cy="11" rx="0.5" ry="1.5" transform="rotate(-25 6 11)" fill="#FFFFFF" opacity="0.4" />
      
      <circle cx="15.5" cy="9.5" r="0.8" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="18" cy="11" rx="0.5" ry="1.5" transform="rotate(25 18 11)" fill="#FFFFFF" opacity="0.4" />

      <!-- Petite bouche fine -->
      <path d="M 10 18 Q 12 19, 14 18" fill="none" stroke="#212121" stroke-width="1" stroke-linecap="round" />
      
      <!-- Narines (Très fines) -->
      <circle cx="11" cy="16" r="0.4" fill="#33691E" />
      <circle cx="13" cy="16" r="0.4" fill="#33691E" />

      <!-- Ligne de reflet de volume -->
      <path d="M 8 4 Q 12 3 16 4" fill="none" stroke="#EEFF41" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
    </g>
  </svg>
</template>
