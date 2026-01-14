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

    const title = `น้องๆ ไซด์ไลน์ ${locationName} | LaoAngel`;
    const description = `รวมน้องๆ ไซด์ไลน์ พริตตี้ โซน${locationName} รับงาน${locationName} การันตีตรงปก คัดเน้นๆ`;

    return {
        title: title,
        description: description,
        keywords: [`ไซด์ไลน์ ${locationName}`, `รับงาน ${locationName}`, `หาเพื่อนเที่ยว ${locationName}`, `LaoAngel`],
        openGraph: {
            title: title,
            description: description,
            type: 'website',
        },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locationName = decodeURIComponent(slug);
    console.log("locationName: ", locationName)
    const creators = await fetchCreators(locationName);

    return (
        <LocationClient creators={creators} locationName={locationName} />
    );
}
