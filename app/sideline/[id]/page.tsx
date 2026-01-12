import { Metadata } from 'next';
import SidelineClient, { CreatorDetail } from './SidelineClient';
import { API_BASE_URL } from '../../../lib/constants';

async function fetchCreator(id: string): Promise<CreatorDetail | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/creators/${id}`, { cache: 'no-store' }); // Ensure fresh data
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch creator for metadata:", error);
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
