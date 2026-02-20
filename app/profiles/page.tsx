import { Metadata } from 'next';
import Link from 'next/link';
import { API_BASE_URL } from '../../lib/constants';
import { Users, MapPin, Search } from 'lucide-react';

export const metadata: Metadata = {
    title: 'โปรไฟล์ทั้งหมด | Phusao',
    description: 'รวมโปรไฟล์สาวไซด์ไลน์ทั้งหมดบน Phusao.com ค้นหาน้องๆ ที่คุณสนใจ แบ่งตามพื้นที่ กรุงเทพ เชียงใหม่ พัทยา และอื่นๆ',
    alternates: {
        canonical: 'https://phusao.com/profiles',
    },
    robots: {
        index: true,
        follow: true,
    },
};

interface SitemapCreator {
    _id: string;
    displayName: string;
    location?: string;
    province?: string;
    zones?: string[];
    updatedAt: string;
}

async function fetchAllCreators(): Promise<SitemapCreator[]> {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = isDev ? 'http://127.0.0.1:8000' : API_BASE_URL;
        const res = await fetch(`${baseUrl}/creators/sitemap`, { cache: 'no-store' });
        if (res.ok) return res.json();
        return [];
    } catch (error) {
        console.error('Failed to fetch creators for profiles page', error);
        return [];
    }
}

export default async function ProfilesPage() {
    const creators = await fetchAllCreators();

    // Group by province/location
    const grouped: Record<string, SitemapCreator[]> = {};
    creators.forEach((c) => {
        const area = c.province || c.location || 'อื่นๆ';
        if (!grouped[area]) grouped[area] = [];
        grouped[area].push(c);
    });

    // Sort groups by count (descending)
    const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

    return (
        <div className="min-h-screen bg-[#020617] text-white py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-6 shadow-lg shadow-pink-500/30">
                        <Users size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-rose-400 text-transparent bg-clip-text">
                        โปรไฟล์ทั้งหมด
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        รวมน้องๆ ทั้งหมด {creators.length} โปรไฟล์บน Phusao.com
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-pink-400">{creators.length}</div>
                        <div className="text-xs text-zinc-500">โปรไฟล์ทั้งหมด</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{sortedGroups.length}</div>
                        <div className="text-xs text-zinc-500">พื้นที่ให้บริการ</div>
                    </div>
                </div>

                {/* Grouped Profiles */}
                <div className="space-y-10">
                    {sortedGroups.map(([area, areaCreators]) => (
                        <section key={area} id={area.replace(/\s+/g, '-')}>
                            <div className="flex items-center gap-2 mb-4 border-l-4 border-pink-500 pl-4">
                                <MapPin size={18} className="text-pink-400" />
                                <h2 className="text-xl font-bold text-white">{area}</h2>
                                <span className="text-sm text-zinc-500">({areaCreators.length})</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {areaCreators.map((creator) => (
                                    <Link
                                        key={creator._id}
                                        href={`/sideline/${creator._id}`}
                                        className="block bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/30 rounded-xl px-3 py-2.5 transition group"
                                    >
                                        <span className="text-sm font-medium text-white group-hover:text-pink-400 transition line-clamp-1">
                                            {creator.displayName || 'Unknown'}
                                        </span>
                                        {creator.location && creator.location !== area && (
                                            <span className="text-[10px] text-zinc-500 block mt-0.5 line-clamp-1">
                                                {creator.location}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Back to Home */}
                <div className="text-center mt-16">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-zinc-400 hover:text-white transition"
                    >
                        <Search size={16} />
                        กลับหน้าหลัก ค้นหาน้องๆ
                    </Link>
                </div>
            </div>
        </div>
    );
}
