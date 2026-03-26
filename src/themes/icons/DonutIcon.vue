<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="donutDough" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFCC80" />
        <stop offset="50%" stop-color="#FFB74D" />
        <stop offset="100%" stop-color="#F57C00" />
      </linearGradient>

      <linearGradient id="donutFrosting" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F8BBD0" />
        <stop offset="50%" stop-color="#F06292" />
        <stop offset="100%" stop-color="#E91E63" />
      </linearGradient>

      <!-- Ombre du donut complet -->
      <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#4E342E" flood-opacity="0.3" />
      </filter>

      <!-- Ombre du glaçage sur la pâte -->
      <filter id="frostingShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="0.5" flood-color="#880E4F" flood-opacity="0.4" />
      </filter>
    </defs>

    <g filter="url(#donutShadow)">
      <!-- Pâte cuite (Anneau principal) -->
      <path 
        d="M 12 2 C 17.5 2, 22 6.5, 22 12 C 22 17.5, 17.5 22, 12 22 C 6.5 22, 2 17.5, 2 12 C 2 6.5, 6.5 2, 12 2 Z M 12 8 C 9.8 8, 8 9.8, 8 12 C 8 14.2, 9.8 16, 12 16 C 14.2 16, 16 14.2, 16 12 C 16 9.8, 14.2 8, 12 8 Z" 
        fill="url(#donutDough)" 
        fill-rule="evenodd" 
      />

      <!-- Glaçage rose baveux -->
      <path 
        d="M 12 2.5 C 17 2.5, 21.5 7, 21.5 12 C 21.5 13, 21 14.5, 20 15 
           C 18.5 15.5, 18 13.5, 16.5 13.5 
           C 15 13.5, 15 15, 13.5 15 
           C 12.5 15, 12 14, 11 14 
           C 10 14, 9.5 15, 8.5 15 
           C 7 15, 7 13.5, 5.5 13.5 
           C 4 13.5, 3.5 15.5, 2.5 14.5 
           C 2.5 13.5, 2.5 12, 2.5 12 
           C 2.5 7, 7 2.5, 12 2.5 Z 
           
           M 12 7.5 C 14.5 7.5, 16.5 9.5, 16.5 12 
           C 16.5 12.5, 16 13, 15.5 12.5 
           C 15 12, 14 12, 13.5 12.5 
           C 13 13, 12 13, 11.5 12.5 
           C 11 12, 10 12.5, 9.5 12 
           C 9 11.5, 8.5 12, 8 11.5 
           C 7.5 11, 7.5 9.5, 12 7.5 Z" 
        fill="url(#donutFrosting)" 
        fill-rule="evenodd" 
        filter="url(#frostingShadow)" 
      />

      <!-- Vermicelles colorés (Sprinkles) -->
      <!-- Bleu -->
      <rect x="15" y="4.5" width="2" height="1" rx="0.5" transform="rotate(30 16 5)" fill="#00E5FF" />
      <rect x="6" y="6" width="2" height="1" rx="0.5" transform="rotate(-45 7 6.5)" fill="#00E5FF" />
      <!-- Jaune -->
      <rect x="9" y="3.5" width="2.5" height="1" rx="0.5" transform="rotate(-15 10.25 4)" fill="#FFEB3B" />
      <rect x="18" y="11" width="2.5" height="1" rx="0.5" transform="rotate(75 19.25 11.5)" fill="#FFEB3B" />
      <!-- Vert -->
      <rect x="19" y="8" width="2" height="1" rx="0.5" transform="rotate(-30 20 8.5)" fill="#76FF03" />
      <rect x="4" y="9" width="2.5" height="1" rx="0.5" transform="rotate(45 5.25 9.5)" fill="#76FF03" />
      <!-- Blanc -->
      <rect x="13.5" y="4" width="1.5" height="1" rx="0.5" transform="rotate(10 14.25 4.5)" fill="#FFF" />
      <rect x="5.5" y="11" width="2" height="1" rx="0.5" transform="rotate(-60 6.5 11.5)" fill="#FFF" />
      <rect x="15.5" y="13.5" width="2" height="1" rx="0.5" transform="rotate(-15 16.5 14)" fill="#FFF" />

      <!-- Reflets bombés -->
      <path d="M 5 6 C 7 3.5, 12 2.5, 16 4" fill="none" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" opacity="0.4" />
      <path d="M 8.5 9.5 C 10 8.5, 12 8.5, 13.5 9.5" fill="none" stroke="#FFF" stroke-width="1" stroke-linecap="round" opacity="0.4" />
    </g>
  </svg>
</template>
