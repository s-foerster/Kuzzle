<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="starMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF59D" />
        <stop offset="40%" stop-color="#FFCA28" />
        <stop offset="100%" stop-color="#FF8F00" />
      </linearGradient>
      
      <linearGradient id="starEdgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#FF6F00" />
      </linearGradient>

      <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4" />
      </filter>

      <!-- Glow radial pour le centre -->
      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <g filter="url(#starShadow)">
      <!-- Fond principal de l'étoile -->
      <path
        d="M 12 2 
           L 15.09 8.26 
           L 22 9.27 
           L 17 14.14 
           L 18.18 21.02 
           L 12 17.77 
           L 5.82 21.02 
           L 7 14.14 
           L 2 9.27 
           L 8.91 8.26 Z"
        fill="url(#starMainGrad)"
        stroke="url(#starEdgeGrad)"
        stroke-width="0.8"
        stroke-linejoin="round"
      />

      <!-- Centre lumineux -->
      <circle cx="12" cy="12" r="5" fill="url(#starGlow)" />

      <!-- Lignes de biseaux 3D -->
      <g stroke="#FFFFFF" stroke-width="0.5" opacity="0.6" stroke-linecap="round">
        <line x1="12" y1="2" x2="12" y2="12" />
        <line x1="22" y1="9.27" x2="12" y2="12" />
        <line x1="5.82" y1="21.02" x2="12" y2="12" />
      </g>
      <g stroke="#D84315" stroke-width="0.5" opacity="0.4" stroke-linecap="round">
        <line x1="2" y1="9.27" x2="12" y2="12" />
        <line x1="18.18" y1="21.02" x2="12" y2="12" />
      </g>

      <!-- Reflets (petits éclats) -->
      <path d="M 12 4 L 13 7 L 16 8 L 13 9 L 12 12 L 11 9 L 8 8 L 11 7 Z" fill="#FFFFFF" opacity="0.8" />
    </g>
  </svg>
</template>
