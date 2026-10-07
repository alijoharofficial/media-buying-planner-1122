import type { MetadataRoute } from 'next';
import { BRAND_NAME, BRAND_SHORT } from '@/lib/brand';
import common from '@/messages/en/common.json';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_SHORT,
    description: common.meta.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#060a1f',
    theme_color: '#1e2a78',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-icon/512-maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
