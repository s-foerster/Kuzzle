<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Différents dégradés pour les facettes du joyau -->
      <linearGradient id="gemTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#E0F7FA" />
        <stop offset="100%" stop-color="#80DEEA" />
      </linearGradient>
      
      <linearGradient id="gemMidLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4DD0E1" />
        <stop offset="100%" stop-color="#00BCD4" />
      </linearGradient>
      
      <linearGradient id="gemMidRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#26C6DA" />
        <stop offset="100%" stop-color="#0097A7" />
      </linearGradient>

      <linearGradient id="gemBotLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00ACC1" />
        <stop offset="100%" stop-color="#006064" />
      </linearGradient>

      <linearGradient id="gemBotRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#00838F" />
        <stop offset="100%" stop-color="#004D40" />
      </linearGradient>

      <filter id="gemShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#004D40" flood-opacity="0.4" />
      </filter>
    </defs>

    <g filter="url(#gemShadow)" stroke="#FFFFFF" stroke-width="0.4" stroke-linejoin="round">
      <!-- Facette supérieure centrale -->
      <polygon points="7,6 17,6 14,10 10,10" fill="url(#gemTop)" />
      
      <!-- Facettes supérieures latérales -->
      <polygon points="3,10 7,6 10,10" fill="url(#gemMidLeft)" />
      <polygon points="21,10 17,6 14,10" fill="url(#gemMidRight)" />

      <!-- Facettes latérales basses -->
      <polygon points="3,10 10,10 12,21" fill="url(#gemBotLeft)" />
      <polygon points="21,10 14,10 12,21" fill="url(#gemBotRight)" />

      <!-- Facette centrale basse -->
      <polygon points="10,10 14,10 12,21" fill="#00BCD4" opacity="0.9"/>
    </g>

    <!-- Éclats de lumière étoiles -->
    <path d="M 5 4 L 5.5 5.5 L 7 6 L 5.5 6.5 L 5 8 L 4.5 6.5 L 3 6 L 4.5 5.5 Z" fill="#FFFFFF" />
    <path d="M 18 3 L 18.3 4.2 L 19.5 4.5 L 18.3 4.8 L 18 6 L 17.7 4.8 L 16.5 4.5 L 17.7 4.2 Z" fill="#FFFFFF" opacity="0.8" />
  </svg>
</template>
