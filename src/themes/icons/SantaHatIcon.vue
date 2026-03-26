<!-- Chapeau de Père Noël — placeholder: remplacez le contenu du <svg> par votre SVG final -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-theme">
    <defs>
      <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #ff5252; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #d50000; stop-opacity: 1" />
      </linearGradient>
      <filter id="hatShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(213, 0, 0, 0.4)" />
      </filter>
    </defs>
    <path fill="url(#hatGradient)" filter="url(#hatShadow)" d="M6 16 C6 10 11 3 17 3 C17 3 18 7 18 10 C18 15 20 17 20 17 L6 16 Z" />
    <path fill="url(#hatGradient)" d="M17 3 C13 3 8 7 7 12 C7 12 4 14 3 15 C3 15 2 12 4 9 C6 5 11 3 17 3 Z" />
    <rect x="4" y="15" width="16" height="5" rx="2.5" fill="#ffffff" filter="url(#hatShadow)" />
    <circle cx="3" cy="15" r="3" fill="#ffffff" filter="url(#hatShadow)" />
    <path fill="rgba(255,255,255,0.2)" d="M14 4.5 C11 5 8 10 7.5 12.5 C7.5 12.5 8 10 12 6 C13 5 14 4.5 14 4.5 Z" />
  </svg>
</template>
