import { Metadata } from 'next';
import SidelineClient, { CreatorDetail } from './SidelineClient';
import { API_BASE_URL } from '../../../lib/constants';

async function fetchCreator(id: string): Promise<CreatorDetail | null> {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        // Use 127.0.0.1 instead of localhost to avoid IPv6 resolution issues
        const baseUrl = isDev ? 'http://127.0.0.1:8000' : API_BASE_URL;
        const url = `${baseUrl}/creators/${id}`;

        console.log(`[SEO Debug] Fetching creator from: ${url} (Env: ${process.env.NODE_ENV})`);

        const res = await fetch(url, { cache: 'no-store' }); // Ensure fresh data
        console.log(`[SEO Debug] Response status: ${res.status}`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[SEO Debug] Fetch failed: ${res.statusText}`);
            console.error(`[SEO Debug] Error Body: ${errorText}`);
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

// Next.js 15+ requires params to be awaited
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const creator = await fetchCreator(id);

    if (!creator) {
        return {
            title: 'Creator Not Found | Phusao',
            description: 'The requested creator profile could not be found.',
        };
    }

    const { displayName, gender, location, weight, height, chest, waist, hips } = creator;

    // SEO Optimized Title & Description
    // Include keywords: ไซด์ไลน์ (Sideline), รับงาน (Available), สัดส่วน (Stats)
    const title = `${displayName} ${gender || ''} ${location || ''} | Phusao`.replace(/\s+/g, ' ').trim();

    const stats = `${chest || '?'}-${waist || '?'}-${hips || '?'} สูง ${height || '?'} หนัก ${weight || '?'}`;
    const description = `น้อง${displayName} ${gender || ''} รับงานไซด์ไลน์ ${location || ''} สัดส่วน ${stats} การันตีความน่ารัก เป็นกันเอง | Phusao`.replace(/\s+/g, ' ').trim();

    return {
        title: title,
        description: description,
        keywords: [`ไซด์ไลน์`, `รับงาน`, `หาเพื่อนเที่ยว`, `Phusao`, location || '', displayName, gender || ''].filter(Boolean),
        openGraph: {
            title: title,
            description: description,
            images: creator.images && creator.images.length > 0 ? [creator.images[0]] : [],
            type: 'profile',
        },
        alternates: {
            canonical: `https://phusao.com/sideline/${id}`,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const creator = await fetchCreator(id);

    // JSON-LD Structured Data for Google
    const jsonLd = creator ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: creator.displayName,
        image: creator.images?.[0],
        description: `Sideline profile of ${creator.displayName}`,
        jobTitle: 'Content Creator',
        url: `https://phusao.com/sideline/${id}`, // Assuming domain
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <SidelineClient initialCreatorData={creator} />
        </>
    );
}
