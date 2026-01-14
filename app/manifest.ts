import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Phusao - Creator Portal',
        short_name: 'Phusao',
        description: 'Discover the best creators and agencies in Laos',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#020617',
        icons: [
            {
                src: '/file.svg', // Placeholder, ideally should be a proper icon
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/file.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    };
}
