<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <!-- Croûte -->
      <linearGradient id="pizzaCrust" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFB300" />
        <stop offset="50%" stop-color="#FFCA28" />
        <stop offset="100%" stop-color="#F57F17" />
      </linearGradient>

      <!-- Croûte grillée (bord externe) -->
      <linearGradient id="pizzaCrustDark" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E65100" />
        <stop offset="50%" stop-color="#EF6C00" />
        <stop offset="100%" stop-color="#E65100" />
      </linearGradient>

      <!-- Fromage fondant -->
      <linearGradient id="pizzaCheese" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="#FFF176" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>

      <!-- Pepperoni -->
      <radialGradient id="pepperoni" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#EF5350" />
        <stop offset="100%" stop-color="#C62828" />
      </radialGradient>

      <!-- Ombre -->
      <filter id="pizzaShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#pizzaShadow)" transform="rotate(15 12 12)">
      <!-- Texture de pâte à l'arrière -->
      <path d="M 12 21 L 2 5 L 22 5 Z" fill="#FFE082" />

      <!-- Fromage -->
      <path 
        d="M 2 5 L 22 5 L 12 21 Z" 
        fill="url(#pizzaCheese)" 
      />
      <!-- Coulure de fromage 1 -->
      <path d="M 10 18 Q 11 20.5 12 22 Q 13 20.5 14 18 Z" fill="url(#pizzaCheese)" />
      <!-- Coulure de fromage 2 -->
      <path d="M 5 10 Q 5.5 12 6.5 11 Q 7.5 10 8 11.5 Z" fill="#FFD54F" />

      <!-- Croûte du haut (3D) -->
      <path d="M 1 5 C 8 2, 16 2, 23 5 C 22 7, 2 7, 1 5 Z" fill="url(#pizzaCrustDark)" />
      <path d="M 2 5 C 8 3.5, 16 3.5, 22 5 C 21 6.5, 3 6.5, 2 5 Z" fill="url(#pizzaCrust)" />

      <!-- Ombre de la croûte sur le fromage -->
      <path d="M 2 5 C 8 6.5, 16 6.5, 22 5 L 21 6 C 16 7.5, 8 7.5, 3 6 Z" fill="#FFB300" opacity="0.6" />

      <!-- Tranches de Pepperoni -->
      <g filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.2))">
        <!-- Grand centre -->
        <circle cx="12" cy="11.5" r="2.5" fill="url(#pepperoni)" />
        <circle cx="11.5" cy="11" r="0.4" fill="#E53935" />
        <circle cx="13" cy="12" r="0.4" fill="#E53935" />
        <circle cx="11.4" cy="12.4" r="0.3" fill="#E53935" />
        <path d="M 10.5 10.5 C 11.5 10, 12.5 10, 13.5 10.5" fill="none" stroke="#FF8A80" stroke-width="0.3" stroke-linecap="round" opacity="0.6" />
        
        <!-- Haut gauche -->
        <circle cx="7.5" cy="8.5" r="2" fill="url(#pepperoni)" />
        <circle cx="7" cy="8" r="0.3" fill="#E53935" />
        <circle cx="8" cy="9" r="0.3" fill="#E53935" />
        <path d="M 6.5 7.5 C 7 7, 8 7, 8.5 7.5" fill="none" stroke="#FF8A80" stroke-width="0.3" stroke-linecap="round" opacity="0.6" />

        <!-- Haut droite (moitié cachée par la croûte) -->
        <path d="M 18.5 6.5 A 2 2 0 1 1 15.5 6.5 L 18.5 6.5 Z" fill="url(#pepperoni)" transform="rotate(-30 17 6.5)" />

        <!-- Bas milieu -->
        <circle cx="11" cy="16.5" r="1.5" fill="url(#pepperoni)" />
        <circle cx="10.8" cy="16.2" r="0.2" fill="#E53935" />
      </g>

      <!-- Morceaux de poivron vert (pour la couleur) -->
      <path d="M 6 12 C 5.5 12, 5 13.5, 6 14" fill="none" stroke="#4CAF50" stroke-width="1.2" stroke-linecap="round" />
      <path d="M 17 11.5 C 18 11.5, 18.5 13, 17.5 13.5" fill="none" stroke="#4CAF50" stroke-width="1.2" stroke-linecap="round" />
      <path d="M 14 16 C 14.5 15, 15.5 15, 16 16" fill="none" stroke="#4CAF50" stroke-width="1.2" stroke-linecap="round" />

      <!-- Petits reflets brillants sur la croûte -->
      <path d="M 5 4 C 10 3, 14 3, 19 4" fill="none" stroke="#FFF" stroke-width="0.8" stroke-linecap="round" opacity="0.5" />
    </g>
  </svg>
</template>
