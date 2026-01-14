import { MetadataRoute } from 'next';
import { API_BASE_URL } from '../lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URLs
    const routes = [
        '',
        '/agency',
        '/auth',
        '/plans',
    ].map((route) => ({
        url: `https://phusao.com${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Fetch Creators
    let creatorUrls: MetadataRoute.Sitemap = [];
    try {
        // In build time or server run, fetch full list. 
        // WARNING: If list is huge (10k+), this should be paginated or split. 
        // For now assuming reasonable size.
        const res = await fetch(`${API_BASE_URL}/creators`);
        if (res.ok) {
            const creators = await res.json();
            creatorUrls = creators.map((creator: any) => ({
                url: `https://phusao.com/sideline/${creator._id}`,
                lastModified: new Date(creator.updatedAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error("Sitemap fetch creators failed", error);
    }

    // Fetch Agencies
    let agencyUrls: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${API_BASE_URL}/agencies`);
        if (res.ok) {
            const agencies = await res.json();
            agencyUrls = agencies.map((agency: any) => ({
                url: `https://phusao.com/agency/${agency._id}`,
                lastModified: new Date(agency.updatedAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error("Sitemap fetch agencies failed", error);
    }

    // Fetch Locations (Zones)
    let locationUrls: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${API_BASE_URL}/creators/zones`);
        if (res.ok) {
            const zones = await res.json();
            locationUrls = zones.map((zone: any) => ({
                url: `https://phusao.com/location/${zone.name}`,
                lastModified: new Date(),
                changeFrequency: 'daily' as const,
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error("Sitemap fetch zones failed", error);
    }

    return [...routes, ...creatorUrls, ...agencyUrls, ...locationUrls];
}
