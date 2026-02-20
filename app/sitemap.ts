import { MetadataRoute } from 'next';
import { API_BASE_URL } from '../lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URLs - Main Pages
    const routes = [
        '',
        '/agency',
        '/auth',
        '/plans',
        '/jobs',
        '/profiles',
    ].map((route) => ({
        url: `https://phusao.com${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Static / Legal Pages
    const staticRoutes = [
        '/terms',
        '/privacy',
        '/faq',
        '/gdpr',
        '/contact',
        '/leaderboard',
    ].map((route) => ({
        url: `https://phusao.com${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
    }));

    // Fetch ALL Creators (unfiltered — for maximum indexing coverage)
    let creatorUrls: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${API_BASE_URL}/creators/sitemap`);
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

    return [...routes, ...staticRoutes, ...creatorUrls, ...agencyUrls, ...locationUrls];
}
