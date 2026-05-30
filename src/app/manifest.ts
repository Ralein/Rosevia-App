import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rosevia — AI Skincare Companion',
    short_name: 'Rosevia',
    description: 'Intelligent routine scheduling, facial analysis, shelf management, and lifestyle skin intelligence.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#688A7D',
    icons: [
      {
        src: '/Logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
