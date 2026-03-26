<!-- Œuf de Pâques en chocolat — placeholder: remplacez le contenu du <svg> par votre SVG final -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-theme">
    <defs>
      <linearGradient id="eggGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #ff9a9e; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #fecfef; stop-opacity: 1" />
      </linearGradient>
      <filter id="eggShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(255, 154, 158, 0.4)" />
      </filter>
      <pattern id="zigzag" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 6 L4 2 L8 6 L12 2 L16 6 L20 2 L24 6" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M0 18 L4 14 L8 18 L12 14 L16 18 L20 14 L24 18" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="12" cy="10" r="1.5" fill="rgba(255,255,255,0.7)" />
        <circle cx="6" cy="10" r="1.5" fill="rgba(255,255,255,0.7)" />
        <circle cx="18" cy="10" r="1.5" fill="rgba(255,255,255,0.7)" />
      </pattern>
      <clipPath id="eggClip">
        <path d="M12 2C8.5 2 5 7 5 13C5 18 8 22 12 22C16 22 19 18 19 13C19 7 15.5 2 12 2Z" />
      </clipPath>
    </defs>
    <path fill="url(#eggGradient)" filter="url(#eggShadow)" d="M12 2C8.5 2 5 7 5 13C5 18 8 22 12 22C16 22 19 18 19 13C19 7 15.5 2 12 2Z" />
    <rect x="0" y="0" width="24" height="24" fill="url(#zigzag)" clip-path="url(#eggClip)" />
    <path fill="rgba(255,255,255,0.25)" d="M8.5 5.5C7.2 7 6 9.5 6 12C6 13 6.1 14 6.3 15C5.8 13.8 5.5 12.5 5.5 11.5C5.5 8 7.5 4.5 9.5 3C9 3.5 8.7 4.5 8.5 5.5Z" />
  </svg>
</template>
