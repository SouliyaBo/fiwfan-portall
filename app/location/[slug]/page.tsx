import { Metadata } from 'next';
import LocationClient from './LocationClient';
import { API_BASE_URL } from '../../../lib/constants';

async function fetchCreators(location: string) {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = isDev ? 'http://127.0.0.1:8000' : API_BASE_URL;
        // Search by location (zone/province)
        const res = await fetch(`${baseUrl}/creators?location=${encodeURIComponent(location)}`, { cache: 'no-store' });
        console.log("res: ", res)
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch creators for location:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    console.log("slug: ", slug)
    const locationName = decodeURIComponent(slug);

    const title = `PR สาวลาว PR เด็กเอ็น สาวพีอาร์ ไซด์ไลน์ ${locationName} | Phusao`;
    const description = `รวมน้องๆ เด็กเอ็น ไซด์ไลน์ พริตตี้ โซน${locationName} รับงาน${locationName} การันตีตรงปก คัดเน้นๆ`;

    return {
        title: title,
        description: description,
        keywords: [`ไซด์ไลน์ ${locationName}`, `รับงาน ${locationName}`, `หาเพื่อนเที่ยว ${locationName}`, `Phusao`],
        openGraph: {
            title: title,
            description: description,
            type: 'website',
        },
        alternates: {
            canonical: `/location/${encodeURIComponent(locationName)}`,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
            },
        },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locationName = decodeURIComponent(slug);
    console.log("locationName: ", locationName)
    const creators = await fetchCreators(locationName);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `ไซด์ไลน์ ${locationName}`,
        description: `รวมน้องๆ ไซด์ไลน์ โซน${locationName}`,
        url: `https://phusao.com/location/${encodeURIComponent(locationName)}`,
        numberOfItems: Array.isArray(creators) ? creators.length : 0,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <LocationClient creators={creators} locationName={locationName} />
        </>
    );
}
