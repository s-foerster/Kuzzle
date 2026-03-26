<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="coinBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF176" />
        <stop offset="50%" stop-color="#FFB300" />
        <stop offset="100%" stop-color="#F57F17" />
      </linearGradient>

      <linearGradient id="coinRim" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFF9C4" />
        <stop offset="100%" stop-color="#F57F17" />
      </linearGradient>

      <linearGradient id="coinInner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFCA28" />
        <stop offset="100%" stop-color="#FF8F00" />
      </linearGradient>

      <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#coinShadow)">
      <!-- Tranche de la pièce (3D) -->
      <circle cx="12" cy="13" r="10" fill="#E65100" />
      
      <!-- Bordure de la face principale -->
      <circle cx="12" cy="11" r="10" fill="url(#coinRim)" />

      <!-- Intérieur de la pièce -->
      <circle cx="12" cy="11" r="8" fill="url(#coinInner)" stroke="#FF6F00" stroke-width="0.5" />

      <!-- Motif central (Symbole $) avec un effet gravé -->
      <path d="M 12 5.5 L 12 16.5" stroke="#FF6F00" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 14.5 8 C 14.5 6.5 13 6.5 12 6.5 C 10.5 6.5 9.5 7 9.5 8.5 C 9.5 10 11 10.5 12 11 C 13.5 11.5 14.5 12 14.5 13.5 C 14.5 15 13.5 15.5 12 15.5 C 10 15.5 9 14.5 9 13" 
            fill="none" stroke="#FF6F00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            
      <!-- Reflet brillant principal -->
      <path d="M 5 6 C 8 3 13 3 17 6" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
      
      <!-- Petits éclats -->
      <circle cx="6" cy="7" r="1" fill="#FFFFFF" opacity="0.8" />
      <circle cx="17.5" cy="8.5" r="0.6" fill="#FFFFFF" opacity="0.6" />
    </g>
  </svg>
</template>
