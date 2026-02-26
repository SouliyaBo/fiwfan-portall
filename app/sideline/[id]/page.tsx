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

        const res = await fetch(url, { next: { revalidate: 3600 } }); // Use ISR to speed up TTFB for SEO
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

    const { displayName, gender, location, weight, height, chest, waist, hips, bio, age, province, services } = creator;

    // SEO Optimized Title — clean, no empty segments
    const titleParts = [displayName];
    if (gender) titleParts.push(gender);
    if (province || location) titleParts.push(province || location || '');
    const title = titleParts.filter(Boolean).join(' ');

    // SEO Optimized Description — only include data that exists (no more "?-?-?")
    let description = '';

    if (bio && bio.length > 30) {
        // Use bio as primary description (most unique content for SEO)
        description = `น้อง${displayName} - ${bio.slice(0, 120)}`;
    } else {
        // Build smart description from available fields only
        const descParts: string[] = [`น้อง${displayName}`];
        if (gender) descParts.push(gender);
        descParts.push('รับงานไซด์ไลน์');
        if (province || location) descParts.push(province || location || '');
        if (chest && waist && hips) descParts.push(`สัดส่วน ${chest}-${waist}-${hips}`);
        if (height) descParts.push(`สูง ${height}`);
        if (weight) descParts.push(`หนัก ${weight}`);
        if (age) descParts.push(`อายุ ${age}`);
        if (services && services.length > 0) descParts.push(services.slice(0, 3).join(' '));
        descParts.push('การันตีตรงปก เป็นกันเอง');
        description = descParts.join(' ');
    }

    description = description.replace(/\s+/g, ' ').trim();

    return {
        title: title,
        description: description,
        keywords: ['ไซด์ไลน์', 'รับงาน', 'หาเพื่อนเที่ยว', 'Phusao', province || location || '', displayName, gender || ''].filter(Boolean),
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
        url: `https://phusao.com/sideline/${id}`,
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
