/** The logo mark as an SVG string (same artwork as app/icon.svg; keep them in sync). Used for generated PNG and OG images. */
export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop stop-color="#312E81"/>
      <stop offset="1" stop-color="#1E2A78"/>
    </linearGradient>
    <linearGradient id="ar" x1="8" y1="36" x2="40" y2="10" gradientUnits="userSpaceOnUse">
      <stop stop-color="#22D3EE"/>
      <stop offset="1" stop-color="#A78BFA"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="12" fill="url(#bg)"/>
  <rect x="10" y="28" width="6" height="10" rx="2" fill="#FFFFFF" fill-opacity="0.35"/>
  <rect x="21" y="22" width="6" height="16" rx="2" fill="#FFFFFF" fill-opacity="0.55"/>
  <rect x="32" y="16" width="6" height="22" rx="2" fill="#FFFFFF" fill-opacity="0.8"/>
  <path d="M9 26 L19 18 L26 22 L38 11" stroke="url(#ar)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M31.5 10.5 H38.5 V17.5" stroke="#22D3EE" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const iconDataUri = () => `data:image/svg+xml;base64,${Buffer.from(ICON_SVG).toString('base64')}`;
