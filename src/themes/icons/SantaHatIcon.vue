<!-- Chapeau de Père Noël avec effet pelucheux, volume 3D et pli naturel -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradé du tissu rouge (lumineux vers sombre) -->
      <linearGradient id="hatRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF3B30" />
        <stop offset="100%" stop-color="#990000" />
      </linearGradient>

      <!-- Dégradé linéaire pour la bande de fourrure (effet cylindrique) -->
      <linearGradient id="fluffBand" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#CFD8DC" />
      </linearGradient>

      <!-- Dégradé radial pour le pompon (effet sphérique) -->
      <radialGradient id="fluffPom" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#B0BEC5" />
      </radialGradient>

      <!-- Ombre portée globale pour détacher l'icône de la grille -->
      <filter id="hatShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="1.5"
          flood-color="#000000"
          flood-opacity="0.35"
        />
      </filter>
    </defs>

    <!-- Groupe principal avec l'ombre portée -->
    <g filter="url(#hatShadow)">
      <!-- Corps principal du chapeau rouge avec le pli -->
      <path
        d="M 6 15 C 6 6, 10 1, 15 1 C 19 1, 22 4, 22 8 C 22 11, 20 13.5, 20 13.5 C 18 11, 16 9, 14 9 C 15 12, 16 15, 16 15 Z"
        fill="url(#hatRed)"
      />

      <!-- Ombre profonde sous le pli pour accentuer l'effet de superposition -->
      <path
        d="M 14 9 C 15 12, 16 15, 16 15 L 19 15 C 19 15, 21 12, 20 13.5 C 18 11, 16 9, 14 9 Z"
        fill="#500000"
        opacity="0.5"
      />

      <!-- Bande de fourrure blanche (base) -->
      <rect x="4" y="14" width="14" height="6" rx="3" fill="url(#fluffBand)" />

      <!-- Pompon blanc -->
      <circle cx="20" cy="14" r="3.5" fill="url(#fluffPom)" />
    </g>

    <!-- Détails, reflets et textures (sans ombre portée pour rester nets) -->
    <g>
      <!-- Reflet brillant sur le côté gauche du tissu rouge -->
      <path
        d="M 7.5 13 C 7.5 7, 10.5 3, 14 2.5"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.4"
      />

      <!-- Lignes de texture pour simuler les poils de la fourrure sur la bande -->
      <path
        d="M 7 15.5 Q 8 17 7 18.5"
        stroke="#90A4AE"
        stroke-width="1.2"
        stroke-linecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 11 15.5 Q 12 17 11 18.5"
        stroke="#90A4AE"
        stroke-width="1.2"
        stroke-linecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 15 15.5 Q 16 17 15 18.5"
        stroke="#90A4AE"
        stroke-width="1.2"
        stroke-linecap="round"
        fill="none"
        opacity="0.5"
      />

      <!-- Petit éclat de lumière sur le pompon pour le rendre plus "fluffy" -->
      <circle cx="19" cy="12.5" r="1" fill="#FFFFFF" opacity="0.9" />
    </g>
  </svg>
</template>
