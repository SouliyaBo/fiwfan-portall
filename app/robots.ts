import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/', '/check-homework/'],
        },
        sitemap: 'https://phusao.com/sitemap.xml', // Domain alias
    };
}
