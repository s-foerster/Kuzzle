<!-- Cœur stylisé Saint-Valentin — placeholder: remplacez le contenu du <svg> par votre SVG final -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-theme">
    <defs>
      <linearGradient id="valGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #ff80ab; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #c51162; stop-opacity: 1" />
      </linearGradient>
      <linearGradient id="valGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #ff4081; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #880e4f; stop-opacity: 1" />
      </linearGradient>
      <filter id="valShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(197, 17, 98, 0.4)" />
      </filter>
    </defs>
    <path fill="url(#valGradient2)" opacity="0.8" d="M14.5 22l-1.45-1.32C6.4 15.36 3 12.28 3 8.5 3 5.42 5.42 3 8.5 3c1.74 0 3.41.81 4.5 2.09C14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5c0 3.78-3.4 6.86-8.55 11.54L14.5 22z" />
    <path fill="url(#valGradient)" filter="url(#valShadow)" d="M10 20l-1.45-1.32C3.4 14.36 0 11.28 0 7.5 0 4.42 2.42 2 5.5 2c1.74 0 3.41.81 4.5 2.09C11.09 2.81 12.76 2 14.5 2 17.58 2 20 4.42 20 7.5c0 3.78-3.4 6.86-8.55 11.54L10 20z" />
    <path fill="#ffffff" d="M15 5 L15.5 6.5 L17 7 L15.5 7.5 L15 9 L14.5 7.5 L13 7 L14.5 6.5 Z" />
    <path fill="rgba(255,255,255,0.3)" d="M5.5 3C3.1 3 1 4.95 1 7.5c0 1.9.9 3.6 2.3 5.4l-.8.5C1.3 11.5 0 9.6 0 7.5 0 4.42 2.42 2 5.5 2c1.74 0 3.41.81 4.5 2.09.2.24.4.5.58.78-.6-1.12-1.9-1.87-3.08-1.87z" />
  </svg>
</template>
