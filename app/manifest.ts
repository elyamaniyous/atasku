import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Atasku',
    short_name: 'Atasku',
    description: "La GMAO intelligente pour l'industrie",
    start_url: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#F59E0B',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
