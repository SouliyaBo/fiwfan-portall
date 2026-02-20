import { Metadata } from 'next';
import AgencyClient from './AgencyClient';
import { API_BASE_URL } from '../../../lib/constants';

async function fetchAgency(id: string) {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = isDev ? 'http://127.0.0.1:8000' : API_BASE_URL;
        const res = await fetch(`${baseUrl}/agencies/${id}`, { cache: 'no-store' });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch agency:", error);
        return null;
    }
}

async function fetchZones() {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = isDev ? 'http://127.0.0.1:8000' : API_BASE_URL;
        const res = await fetch(`${baseUrl}/creators/zones`, { next: { revalidate: 3600 } }); // Cache zones for 1 hour

        if (!res.ok) return [];

        const data = await res.json();
        const grouped: any = {};
        data.forEach((z: any) => {
            const c = z.country || "Thailand";
            if (!grouped[c]) grouped[c] = [];
            grouped[c].push(z);
        });
        return Object.entries(grouped).map(([country, items]) => ({ country, items }));
    } catch (error) {
        console.error("Failed to fetch zones:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const agency = await fetchAgency(id);

    if (!agency) {
        return {
            title: 'Agency Not Found | Phusao',
            description: 'The requested agency could not be found.',
        };
    }

    const title = `${agency.name} | Phusao Agency`;
    const description = agency.description || `Explore models from ${agency.name} at Phusao.`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: agency.bannerUrl ? [agency.bannerUrl] : (agency.logoUrl ? [agency.logoUrl] : []),
            type: 'website',
        },
        alternates: {
            canonical: `/agency/${id}`,
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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch data in parallel
    const [agency, zones] = await Promise.all([
        fetchAgency(id),
        fetchZones()
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: agency?.name,
                        url: `https://phusao.com/agency/${id}`,
                        logo: agency?.logoUrl,
                        description: agency?.description
                    })
                }}
            />
            <AgencyClient initialAgency={agency} initialZones={zones} />
        </>
    );
}
