<!-- Citrouille d'Halloween (Jack-o'-lantern) avec effet 3D et visage lumineux -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradés pour donner du volume aux différents quartiers de la citrouille -->
      <linearGradient id="pumpSide" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F57C00" />
        <stop offset="100%" stop-color="#BF360C" />
      </linearGradient>
      <linearGradient id="pumpMid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FF9800" />
        <stop offset="100%" stop-color="#E65100" />
      </linearGradient>
      <linearGradient id="pumpCenter" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFB74D" />
        <stop offset="100%" stop-color="#F57C00" />
      </linearGradient>

      <!-- Dégradé de la tige -->
      <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8BC34A" />
        <stop offset="100%" stop-color="#33691E" />
      </linearGradient>

      <!-- Filtre pour faire briller le visage (effet bougie à l'intérieur) -->
      <filter id="faceGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.8" result="blur" />
        <feComponentTransfer in="blur" result="glow">
          <feFuncA type="linear" slope="1.5" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Ombre portée globale pour détacher l'icône de la grille -->
      <filter id="pumpShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="1.5"
          flood-color="#000000"
          flood-opacity="0.4"
        />
      </filter>
    </defs>

    <!-- Groupe principal avec l'ombre -->
    <g filter="url(#pumpShadow)">
      <!-- Petite vrille (liane) décorative -->
      <path
        d="M 13 6 C 16 3, 19 5, 17 8 C 16 9.5, 14.5 8.5, 15 7.5"
        fill="none"
        stroke="#7CB342"
        stroke-width="1.2"
        stroke-linecap="round"
      />

      <!-- Tige principale -->
      <path
        d="M 10.5 6.5 C 10 3, 12 1, 14 1 C 13 2.5, 13 4.5, 13.5 6.5 C 14 7, 12 7.5, 10.5 6.5 Z"
        fill="url(#stemGrad)"
      />

      <!-- Quartiers de la citrouille (Dessinés de l'arrière vers l'avant) -->
      <!-- Quartiers extérieurs (gauche et droite) -->
      <ellipse
        cx="6.5"
        cy="14"
        rx="3.5"
        ry="7.5"
        fill="url(#pumpSide)"
        stroke="#9E2A0B"
        stroke-width="0.5"
      />
      <ellipse
        cx="17.5"
        cy="14"
        rx="3.5"
        ry="7.5"
        fill="url(#pumpSide)"
        stroke="#9E2A0B"
        stroke-width="0.5"
      />

      <!-- Quartiers intermédiaires -->
      <ellipse
        cx="9"
        cy="14.5"
        rx="4"
        ry="8"
        fill="url(#pumpMid)"
        stroke="#BF360C"
        stroke-width="0.5"
      />
      <ellipse
        cx="15"
        cy="14.5"
        rx="4"
        ry="8"
        fill="url(#pumpMid)"
        stroke="#BF360C"
        stroke-width="0.5"
      />

      <!-- Quartier central (le plus clair/proche) -->
      <ellipse
        cx="12"
        cy="15"
        rx="4.5"
        ry="8.5"
        fill="url(#pumpCenter)"
        stroke="#E65100"
        stroke-width="0.5"
      />

      <!-- Reflet blanc subtil sur le haut pour accentuer l'arrondi -->
      <path
        d="M 8.5 9.5 C 10.5 7.5, 13.5 7.5, 15.5 9.5 C 13.5 8.5, 10.5 8.5, 8.5 9.5 Z"
        fill="#FFFFFF"
        opacity="0.5"
      />
    </g>

    <!-- Visage sculpté avec effet de lueur interne -->
    <g fill="#FFF176" filter="url(#faceGlow)">
      <!-- Œil Gauche -->
      <polygon points="8,11 10.5,13 7,13" />
      <!-- Œil Droit -->
      <polygon points="16,11 17,13 13.5,13" />
      <!-- Nez -->
      <polygon points="12,13.5 13,15 11,15" />
      <!-- Bouche en zigzag -->
      <path
        d="M 7 16.5 Q 12 21 17 16.5 L 15 18 L 14 16.5 L 12 18.5 L 10 16.5 L 9 18 Z"
      />
    </g>
  </svg>
</template>
