<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="duckBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF59D" />
        <stop offset="40%" stop-color="#FFEB3B" />
        <stop offset="100%" stop-color="#FBC02D" />
      </linearGradient>

      <linearGradient id="duckBeak" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFCC80" />
        <stop offset="100%" stop-color="#EF6C00" />
      </linearGradient>

      <!-- Ombre et reflet 3D -->
      <filter id="duckShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-color="#000" flood-opacity="0.3" />
      </filter>
      
      <linearGradient id="duckWave" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4FC3F7" />
        <stop offset="50%" stop-color="#03A9F4" />
        <stop offset="100%" stop-color="#0288D1" />
      </linearGradient>
    </defs>

    <g filter="url(#duckShadow)">
      <!-- Corps du canard -->
      <path 
        d="M 5 15 C 3 15, 2 17, 3 19 C 3 19.5, 3.5 20, 4 20 C 6 20, 10 21, 14 21 C 18 21, 21 19, 21 15 C 21 11, 19 12, 17 12 C 15 12, 11 11, 9 15 Z" 
        fill="url(#duckBody)" 
      />
      <!-- Queue du canard (surélévation) -->
      <path d="M 5 15 C 4 12, 6 12, 7 13 Z" fill="url(#duckBody)" />

      <!-- Tête du canard -->
      <circle cx="16" cy="8" r="4.5" fill="url(#duckBody)" />

      <!-- Bec du canard -->
      <path d="M 19 8 C 22 8, 23 9.5, 23 10 C 23 10.5, 21 11, 18 11 C 18 10, 18 9, 19 8 Z" fill="url(#duckBeak)" />
      
      <!-- Oeil du canard -->
      <circle cx="16" cy="7.5" r="1" fill="#424242" />
      <circle cx="16.3" cy="7.2" r="0.3" fill="#FFF" />

      <!-- Aile -->
      <path d="M 10 16 C 11 15, 13 14, 15 15 C 16 15.5, 16 17, 14 18 C 11 19, 9 17, 10 16 Z" fill="#FBC02D" stroke="#F9A825" stroke-width="0.5" />

      <!-- Reflet brillant (plastique) -->
      <path d="M 13.5 5.5 C 15 4, 17 4.5, 18 6" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.6" />
      <path d="M 5 18 C 7 17, 10 17, 12 18" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.6" />

      <!-- Vagues bleues sous le canard -->
      <path d="M 2 20 Q 5 18, 8 20 T 14 20 T 20 20 T 23 20" fill="none" stroke="url(#duckWave)" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 4 22 Q 7 20, 10 22 T 16 22 T 21 22" fill="none" stroke="#81D4FA" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    </g>
  </svg>
</template>
