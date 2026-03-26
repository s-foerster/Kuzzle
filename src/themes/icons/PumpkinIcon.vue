<!-- Citrouille Halloween — placeholder: remplacez le contenu du <svg> par votre SVG final -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-theme">
    <defs>
      <linearGradient id="pumpkinBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #ff9800; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #e65100; stop-opacity: 1" />
      </linearGradient>
      <linearGradient id="pumpkinStem" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color: #8bc34a; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #33691e; stop-opacity: 1" />
      </linearGradient>
      <filter id="pumpkinShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(230, 81, 0, 0.4)" />
      </filter>
    </defs>
    <path fill="url(#pumpkinStem)" d="M11 6C11 4 10 2 14 2C13 4 13 5 13 6Z" />
    <ellipse cx="7" cy="13" rx="4" ry="8" fill="url(#pumpkinBase)" filter="url(#pumpkinShadow)" />
    <ellipse cx="17" cy="13" rx="4" ry="8" fill="url(#pumpkinBase)" filter="url(#pumpkinShadow)" />
    <ellipse cx="12" cy="14" rx="5" ry="8" fill="url(#pumpkinBase)" filter="url(#pumpkinShadow)" />
    <polygon points="9,12 11,14 8,15" fill="#4e1c00" />
    <polygon points="15,12 13,14 16,15" fill="#4e1c00" />
    <path d="M7 17 Q12 20 17 17 L15 18 L12 17 L9 18 Z" fill="#4e1c00" />
    <path fill="rgba(255,255,255,0.2)" d="M12 7C14 7 15.5 8.5 16.5 10.5C16.2 9 14.8 7.5 12 7.5C9.2 7.5 7.8 9 7.5 10.5C8.5 8.5 10 7 12 7Z" />
  </svg>
</template>
