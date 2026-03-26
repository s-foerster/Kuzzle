<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Algue Nori (extérieure) -->
      <linearGradient id="nori" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#263238" />
        <stop offset="50%" stop-color="#1B262C" />
        <stop offset="100%" stop-color="#0F171A" />
      </linearGradient>

      <!-- Riz -->
      <radialGradient id="rice" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="80%" stop-color="#F5F5F5" />
        <stop offset="100%" stop-color="#E0E0E0" />
      </radialGradient>

      <!-- Saumon (intérieur) -->
      <linearGradient id="salmon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF8A65" />
        <stop offset="100%" stop-color="#F4511E" />
      </linearGradient>

      <!-- Ombre -->
      <filter id="sushiShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#sushiShadow)">
      <!-- Cylindre de l'algue Nori (Base) -->
      <path d="M 4 10 L 4 15 C 4 18, 12 21, 20 18 L 20 10 Z" fill="url(#nori)" />
      
      <!-- Lignes de texture sur la Nori -->
      <path d="M 6 13 L 6 16.5" stroke="#37474F" stroke-width="0.5" stroke-linecap="round" />
      <path d="M 12 14.5 L 12 19" stroke="#37474F" stroke-width="0.5" stroke-linecap="round" />
      <path d="M 18 12 L 18 16.5" stroke="#37474F" stroke-width="0.5" stroke-linecap="round" />

      <!-- Riz (Cercle supérieur perspéctive isométrique) -->
      <ellipse cx="12" cy="10" rx="8" ry="5" fill="url(#rice)" stroke="#E0E0E0" stroke-width="0.5" />
      
      <!-- Grains de riz individuels (texture) -->
      <g fill="#FFFFFF" stroke="#EEEEEE" stroke-width="0.3">
        <ellipse cx="12" cy="7" rx="1.5" ry="0.8" transform="rotate(15 12 7)" />
        <ellipse cx="15" cy="8" rx="1.5" ry="0.8" transform="rotate(-30 15 8)" />
        <ellipse cx="16" cy="11" rx="1.5" ry="0.8" transform="rotate(45 16 11)" />
        <ellipse cx="13" cy="13" rx="1.5" ry="0.8" transform="rotate(-10 13 13)" />
        <ellipse cx="9" cy="12.5" rx="1.5" ry="0.8" transform="rotate(60 9 12.5)" />
        <ellipse cx="8" cy="9" rx="1.5" ry="0.8" transform="rotate(-40 8 9)" />
        <ellipse cx="10" cy="8" rx="1.5" ry="0.8" transform="rotate(20 10 8)" />
        <ellipse cx="14" cy="12" rx="1.5" ry="0.8" transform="rotate(-20 14 12)" />
        <!-- Autres petits grains -->
        <path d="M 5 10 Q 6 9 7 10" fill="none" stroke="#E0E0E0" stroke-width="0.5" />
        <path d="M 17 9 Q 18 10 19 10" fill="none" stroke="#E0E0E0" stroke-width="0.5" />
      </g>

      <!-- Coeur du Sushi (Saumon et concombre) -->
      <!-- Saumon -->
      <path d="M 11 8.5 C 13 8, 14 9, 13.5 10.5 C 13 12, 11 12.5, 10.5 11 C 10 9.5, 10 9, 11 8.5 Z" fill="url(#salmon)" />
      <!-- Stries du saumon -->
      <path d="M 11.5 8.7 L 12.5 10 M 11 9.7 L 11.8 11.2 M 10.6 10.3 L 11 11.5" stroke="#FFCCBC" stroke-width="0.4" stroke-linecap="round" />

      <!-- Concombre -->
      <path d="M 14 9 C 15 9, 15.5 10, 14.5 11 C 13.5 11.5, 13 10.5, 14 9 Z" fill="#81C784" />
      <circle cx="14.3" cy="10" r="0.8" fill="#C8E6C9" /> <!-- Centre du concombre -->
      
      <!-- Omelette japonaise (Tamago) -->
      <path d="M 9.5 8 C 10.5 7.5, 11 8, 10 9.5 C 9 10.5, 8.5 10, 8.5 9 C 8 8, 8.5 8.5, 9.5 8 Z" fill="#FFE082" />
      
      <!-- Avocat -->
      <path d="M 10.5 12.5 C 12 12.5, 12 11, 13 12 C 14 13, 11 13.5, 10.5 12.5 Z" fill="#AED581" />
      <path d="M 11 12.6 C 11.5 12.8, 12 12.5, 12 12.2" stroke="#558B2F" stroke-width="0.3" fill="none" />

      <!-- Reflet sur l'algue (aspect brillant / mouillé) -->
      <path d="M 5.5 11 L 5.5 15.5" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.3" />
      <path d="M 4 8.5 C 8 6, 16 6, 20 8.5" fill="none" stroke="#263238" stroke-width="1.5" />
      <path d="M 4.5 9 C 8 6.5, 16 6.5, 19.5 9" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.4" />
    </g>
  </svg>
</template>
