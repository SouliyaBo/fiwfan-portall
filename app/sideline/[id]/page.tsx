import { Metadata } from 'next';
import SidelineClient, { CreatorDetail } from './SidelineClient';
import { API_BASE_URL } from '../../../lib/constants';

async function fetchCreator(id: string): Promise<CreatorDetail | null> {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        // Force localhost in dev mode to ensure we hit the local backend
        const baseUrl = isDev ? 'http://localhost:8000' : API_BASE_URL;
        const url = `${baseUrl}/creators/${id}`;

        console.log(`[SEO Debug] Fetching creator from: ${url} (Env: ${process.env.NODE_ENV})`);

        const res = await fetch(url, { cache: 'no-store' }); // Ensure fresh data
        console.log(`[SEO Debug] Response status: ${res.status}`);

        if (!res.ok) {
            console.error(`[SEO Debug] Fetch failed: ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        console.log(`[SEO Debug] Data fetched successfully:`, data?.displayName);
        return data;
    } catch (error) {
        console.error("[SEO Debug] Start Failed to fetch creator for metadata:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const creator = await fetchCreator(params.id);

    if (!creator) {
        return {
            title: 'Creator Not Found | LaoAngel',
            description: 'The requested creator profile could not be found.',
        };
    }

    const { displayName, gender, location, proportions } = creator;
    const title = `${displayName} ${gender || ''} ${location || ''} | LaoAngel`.replace(/\s+/g, ' ').trim();
    const description = `${displayName} ${gender || ''} ${location || ''} ${proportions || ''}`.replace(/\s+/g, ' ').trim();

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: creator.images && creator.images.length > 0 ? [creator.images[0]] : [],
        },
    };
}

export default async function Page({ params }: { params: { id: string } }) {
    const creator = await fetchCreator(params.id);
    return <SidelineClient initialCreatorData={creator} />;
}
