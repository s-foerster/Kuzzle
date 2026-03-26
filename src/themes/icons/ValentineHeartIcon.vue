<!-- Cœurs de Saint-Valentin 100% Rose avec effet 3D glossy (style bonbon) -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Dégradé radial pour le cœur en arrière-plan (Rose poudré / Pastel) -->
      <radialGradient id="backHeartGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#FFE4E1" />
        <stop offset="40%" stop-color="#FFB6C1" />
        <stop offset="100%" stop-color="#D81B60" />
      </radialGradient>

      <!-- Dégradé radial pour le cœur au premier plan (Rose vibrant / Fuchsia) -->
      <radialGradient id="frontHeartGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#FF99CC" />
        <stop offset="40%" stop-color="#FF3385" />
        <stop offset="100%" stop-color="#99004D" />
      </radialGradient>

      <!-- Ombre portée teintée en rose foncé pour plus de douceur -->
      <filter id="valShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="1.5"
          flood-color="#4D0026"
          flood-opacity="0.35"
        />
      </filter>
    </defs>

    <!-- CŒUR EN ARRIÈRE-PLAN (Rose doux) -->
    <g filter="url(#valShadow)">
      <path
        d="M 16 15 C 11.5 12, 9 9, 9 5.5 C 9 3, 11 1, 13.5 1 C 15 1, 15.5 2, 16 3 C 16.5 2, 17 1, 18.5 1 C 21 1, 23 3, 23 5.5 C 23 9, 20.5 12, 16 15 Z"
        fill="url(#backHeartGrad)"
      />
    </g>
    <!-- Reflet glossy du cœur en arrière-plan -->
    <path
      d="M 10 5.5 C 10 3.5, 11.5 2, 13.5 2"
      fill="none"
      stroke="#FFFFFF"
      stroke-width="1"
      stroke-linecap="round"
      opacity="0.8"
    />

    <!-- CŒUR AU PREMIER PLAN (Rose vibrant) -->
    <g filter="url(#valShadow)">
      <path
        d="M 10 22 C 4.5 18, 1 14, 1 9.5 C 1 6, 3.5 3.5, 7 3.5 C 9 3.5, 9.5 4.5, 10 5.5 C 10.5 4.5, 11 3.5, 13 3.5 C 16.5 3.5, 19 6, 19 9.5 C 19 14, 15.5 18, 10 22 Z"
        fill="url(#frontHeartGrad)"
      />
    </g>

    <!-- REFLETS ET DÉTAILS DU CŒUR PRINCIPAL -->
    <g>
      <!-- Grand reflet glossy sur le lobe gauche -->
      <path
        d="M 2 9.5 C 2 6.5, 4 4.5, 7 4.5 C 8 4.5, 9 5, 9.5 5.5"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.6"
      />

      <!-- Petit reflet sur le lobe droit -->
      <path
        d="M 18 9.5 C 18 7, 16 4.5, 13 4.5"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="0.8"
        stroke-linecap="round"
        opacity="0.4"
      />

      <!-- Lumière de contour (rim light) en bas (Rose clair) -->
      <path
        d="M 3 12.5 C 5.5 16, 8 19.5, 10 20.5 C 12 19.5, 14.5 16, 17 12.5"
        fill="none"
        stroke="#FFB3D9"
        stroke-width="0.8"
        stroke-linecap="round"
        opacity="0.7"
      />

      <!-- Étoile scintillante (Sparkle) sur le lobe gauche -->
      <path
        d="M 7 2.5 Q 7.3 4.2 9 4.5 Q 7.3 4.8 7 6.5 Q 6.7 4.8 5 4.5 Q 6.7 4.2 7 2.5 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <!-- Cœur du scintillement -->
      <circle cx="7" cy="4.5" r="0.8" fill="#FFFFFF" />
    </g>
  </svg>
</template>
