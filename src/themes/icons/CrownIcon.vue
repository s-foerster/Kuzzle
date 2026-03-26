<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-theme"
  >
    <defs>
      <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE082" />
        <stop offset="50%" stop-color="#FFCA28" />
        <stop offset="100%" stop-color="#FF8F00" />
      </linearGradient>
      
      <linearGradient id="crownDark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFB300" />
        <stop offset="100%" stop-color="#F57F17" />
      </linearGradient>

      <!-- Joyaux -->
      <radialGradient id="ruby" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#FF5252" />
        <stop offset="100%" stop-color="#b71c1c" />
      </radialGradient>
      <radialGradient id="sapphire" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#40C4FF" />
        <stop offset="100%" stop-color="#01579B" />
      </radialGradient>
      <radialGradient id="emerald" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#69F0AE" />
        <stop offset="100%" stop-color="#1B5E20" />
      </radialGradient>

      <filter id="crownShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#crownShadow)">
      <!-- Corps de la couronne -->
      <path 
        d="M 3 18 L 1 7 L 7 11 L 12 3 L 17 11 L 23 7 L 21 18 Z" 
        fill="url(#crownGold)" 
        stroke="#F57F17" 
        stroke-width="0.5" 
        stroke-linejoin="round"
      />
      
      <!-- Bande inférieure de la couronne -->
      <rect x="2.5" y="18" width="19" height="3" rx="1.5" fill="url(#crownDark)" stroke="#E65100" stroke-width="0.5" />
      <rect x="3" y="21" width="18" height="1" rx="0.5" fill="#E65100" />

      <!-- Lignes de volume/pli -->
      <path d="M 7 11 L 8.5 18" stroke="#FF8F00" stroke-width="0.5" stroke-linecap="round" />
      <path d="M 17 11 L 15.5 18" stroke="#FF8F00" stroke-width="0.5" stroke-linecap="round" />
      <path d="M 12 3 L 12 18" stroke="#FFE082" stroke-width="0.5" stroke-linecap="round" opacity="0.6" />

      <!-- Bijoux de la pointe -->
      <circle cx="1" cy="6" r="1.5" fill="url(#ruby)" />
      <circle cx="7" cy="10" r="1.5" fill="url(#sapphire)" />
      <circle cx="12" cy="2" r="2" fill="url(#emerald)" />
      <circle cx="17" cy="10" r="1.5" fill="url(#sapphire)" />
      <circle cx="23" cy="6" r="1.5" fill="url(#ruby)" />

      <!-- Bijoux de la bande -->
      <ellipse cx="6" cy="19.5" rx="1.5" ry="1" fill="url(#ruby)" />
      <ellipse cx="12" cy="19.5" rx="2" ry="1.2" fill="url(#ruby)" />
      <ellipse cx="18" cy="19.5" rx="1.5" ry="1" fill="url(#ruby)" />
      
      <!-- Éclats sur les bijoux -->
      <circle cx="11.5" cy="1.3" r="0.6" fill="#FFF" opacity="0.8" />
      <circle cx="11.6" cy="19.2" r="0.4" fill="#FFF" opacity="0.8" />
    </g>
  </svg>
</template>
