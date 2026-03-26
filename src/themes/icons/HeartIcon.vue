<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon icon-heart"
  >
    <defs>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #ff5252; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #d50000; stop-opacity: 1" />
      </linearGradient>
      <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="2"
          flood-color="rgba(213, 0, 0, 0.3)"
        />
      </filter>
    </defs>
    <path
      fill="url(#heartGradient)"
      filter="url(#heartShadow)"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
    <path
      fill="rgba(255,255,255,0.2)"
      d="M7.5 4C5.1 4 3 6.05 3 8.5c0 1.9.9 3.6 2.3 5.4l-.8.5C3.3 12.5 2 10.6 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09.2.24.4.5.58.78-.6-1.12-1.9-1.87-3.08-1.87z"
    />
  </svg>
</template>
