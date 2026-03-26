<!-- Œuf de Pâques en chocolat brillant avec glaçage coloré -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradé radial pour donner un effet 3D sphérique au chocolat -->
      <radialGradient id="choc3D" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#9E6A55" />
        <stop offset="40%" stop-color="#6B4231" />
        <stop offset="100%" stop-color="#3A2015" />
      </radialGradient>

      <!-- Ombre portée douce pour détacher l'œuf de la grille du puzzle -->
      <filter id="eggShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="1.5"
          stdDeviation="1.5"
          flood-color="#000000"
          flood-opacity="0.3"
        />
      </filter>

      <!-- Forme parfaite de l'œuf utilisée comme masque pour que les décorations ne débordent pas -->
      <clipPath id="eggClip">
        <path
          d="M12 2 C 7 2 4 8 4 14 C 4 19 7.5 22 12 22 C 16.5 22 20 19 20 14 C 20 8 17 2 12 2 Z"
        />
      </clipPath>
    </defs>

    <!-- Ombre de l'œuf -->
    <path
      d="M12 2 C 7 2 4 8 4 14 C 4 19 7.5 22 12 22 C 16.5 22 20 19 20 14 C 20 8 17 2 12 2 Z"
      fill="none"
      filter="url(#eggShadow)"
    />

    <!-- Base en chocolat -->
    <path
      d="M12 2 C 7 2 4 8 4 14 C 4 19 7.5 22 12 22 C 16.5 22 20 19 20 14 C 20 8 17 2 12 2 Z"
      fill="url(#choc3D)"
    />

    <!-- Groupe des décorations (Glaçage) contraint à l'intérieur de l'œuf -->
    <g clip-path="url(#eggClip)">
      <!-- Glaçage Zigzag Rose (Haut) -->
      <path
        d="M -2 9 L 4 4 L 10 9 L 16 4 L 22 9 L 28 4"
        fill="none"
        stroke="#FF6B8B"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Bande Dorée (Milieu) -->
      <rect x="0" y="11" width="24" height="4.5" fill="#FFD700" />

      <!-- Pépites de chocolat incrustées dans la bande dorée -->
      <circle cx="6" cy="13.25" r="1.25" fill="#3A2015" />
      <circle cx="12" cy="13.25" r="1.25" fill="#3A2015" />
      <circle cx="18" cy="13.25" r="1.25" fill="#3A2015" />

      <!-- Glaçage Vague Cyan (Bas) -->
      <path
        d="M -2 18.5 Q 4 16 10 18.5 T 22 18.5 T 34 18.5"
        fill="none"
        stroke="#00E5FF"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </g>

    <!-- Reflets brillants pour l'aspect lisse/plastique/chocolat tempéré -->
    <path
      d="M 7.5 5.5 Q 5 9 6 13"
      fill="none"
      stroke="#FFFFFF"
      stroke-width="1.2"
      stroke-linecap="round"
      opacity="0.4"
    />
    <circle cx="9" cy="4" r="0.8" fill="#FFFFFF" opacity="0.5" />
  </svg>
</template>
