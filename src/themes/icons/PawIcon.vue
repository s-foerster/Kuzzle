<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradés pour la patte -->
      <linearGradient id="pawPadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCE4EC" />
        <stop offset="50%" stop-color="#F48FB1" />
        <stop offset="100%" stop-color="#EC407A" />
      </linearGradient>

      <!-- Effet 3D doux/moelleux pour les coussinets -->
      <radialGradient id="pawPadHighlight" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#F8BBD0" stop-opacity="0" />
      </radialGradient>

      <!-- Ombre globale de la patte -->
      <filter id="pawShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#880E4F" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#pawShadow)">
      <!-- Coussinet principal (Palme) -->
      <path 
        d="M 12 11.5 C 16 11.5, 18 14, 18 17 C 18 20.5, 15 22, 12 22 C 9 22, 6 20.5, 6 17 C 6 14, 8 11.5, 12 11.5 Z" 
        fill="url(#pawPadGrad)" 
      />
      <!-- Surbrillance du coussinet principal -->
      <path 
        d="M 12 11.5 C 16 11.5, 18 14, 18 17 C 18 20.5, 15 22, 12 22 C 9 22, 6 20.5, 6 17 C 6 14, 8 11.5, 12 11.5 Z" 
        fill="url(#pawPadHighlight)" 
      />
      
      <!-- Coussinet supérieur gauche -->
      <ellipse cx="6" cy="9.5" rx="2" ry="3" transform="rotate(-30 6 9.5)" fill="url(#pawPadGrad)" />
      <ellipse cx="6" cy="9.5" rx="2" ry="3" transform="rotate(-30 6 9.5)" fill="url(#pawPadHighlight)" />

      <!-- Coussinet central gauche -->
      <ellipse cx="10" cy="5.5" rx="2" ry="3.5" transform="rotate(-15 10 5.5)" fill="url(#pawPadGrad)" />
      <ellipse cx="10" cy="5.5" rx="2" ry="3.5" transform="rotate(-15 10 5.5)" fill="url(#pawPadHighlight)" />

      <!-- Coussinet central droit -->
      <ellipse cx="14" cy="5.5" rx="2" ry="3.5" transform="rotate(15 14 5.5)" fill="url(#pawPadGrad)" />
      <ellipse cx="14" cy="5.5" rx="2" ry="3.5" transform="rotate(15 14 5.5)" fill="url(#pawPadHighlight)" />

      <!-- Coussinet supérieur droit -->
      <ellipse cx="18" cy="9.5" rx="2" ry="3" transform="rotate(30 18 9.5)" fill="url(#pawPadGrad)" />
      <ellipse cx="18" cy="9.5" rx="2" ry="3" transform="rotate(30 18 9.5)" fill="url(#pawPadHighlight)" />
      
      <!-- Petits reflets spéculaires -->
      <circle cx="9.5" cy="4" r="0.8" fill="#FFF" opacity="0.6"/>
      <circle cx="13.5" cy="4" r="0.8" fill="#FFF" opacity="0.6"/>
      <circle cx="5" cy="8.5" r="0.7" fill="#FFF" opacity="0.6"/>
      <circle cx="17.5" cy="8" r="0.7" fill="#FFF" opacity="0.6"/>
      
      <!-- Reflet sur le grand coussinet -->
      <path d="M 8 16 C 8 13.5 12 13 14 14.5" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.5" />
    </g>
  </svg>
</template>
