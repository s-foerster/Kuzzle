<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="frogSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C5E1A5" />
        <stop offset="50%" stop-color="#8BC34A" />
        <stop offset="100%" stop-color="#33691E" />
      </linearGradient>

      <!-- Ventre ou intérieur clair de la bouche/reflets -->
      <radialGradient id="frogCheek" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFCDD2" />
        <stop offset="100%" stop-color="#E57373" stop-opacity="0" />
      </radialGradient>

      <filter id="frogShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#1B5E20" flood-opacity="0.4" />
      </filter>
    </defs>

    <g filter="url(#frogShadow)">
      <!-- Fond de la tête / visage -->
      <ellipse cx="12" cy="14" rx="9" ry="7" fill="url(#frogSkin)" />
      
      <!-- Oeil gauche (globe saillant) -->
      <circle cx="7" cy="8" r="4" fill="url(#frogSkin)" />
      
      <!-- Oeil droit (globe saillant) -->
      <circle cx="17" cy="8" r="4" fill="url(#frogSkin)" />

      <!-- Blanc des yeux -->
      <circle cx="7" cy="8" r="2.8" fill="#FFF" />
      <circle cx="17" cy="8" r="2.8" fill="#FFF" />

      <!-- Pupilles -->
      <circle cx="7" cy="8" r="1.5" fill="#212121" />
      <circle cx="17" cy="8" r="1.5" fill="#212121" />

      <!-- Reflets dans les yeux (mignon) -->
      <circle cx="6.5" cy="7.5" r="0.5" fill="#FFF" />
      <circle cx="16.5" cy="7.5" r="0.5" fill="#FFF" />
      <circle cx="7.5" cy="8.5" r="0.2" fill="#FFF" />
      <circle cx="17.5" cy="8.5" r="0.2" fill="#FFF" />

      <!-- Joues roses -->
      <circle cx="6" cy="14" r="2" fill="url(#frogCheek)" />
      <circle cx="18" cy="14" r="2" fill="url(#frogCheek)" />

      <!-- Bouche souriante ou ouverte/mignonne -->
      <path d="M 9 15 Q 12 18, 15 15" fill="none" stroke="#212121" stroke-width="1.2" stroke-linecap="round" />
      <!-- Petite langue mignonne -->
      <path d="M 11 16.5 Q 12 19.5, 13 16.5 Z" fill="#EF9A9A" />

      <!-- Narines -->
      <circle cx="10.5" cy="13" r="0.4" fill="#33691E" />
      <circle cx="13.5" cy="13" r="0.4" fill="#33691E" />

      <!-- Reflet sur le crâne / front -->
      <path d="M 9 11 Q 12 10 15 11" fill="none" stroke="#FFF" stroke-width="1.2" opacity="0.4" stroke-linecap="round"/>
    </g>
  </svg>
</template>
