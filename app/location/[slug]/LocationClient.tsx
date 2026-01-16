"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "../../../lib/images";
import { useEffect, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { API_BASE_URL } from "../../../lib/constants";

interface LocationClientProps {
    creators: any[];
    locationName: string;
}

export default function LocationClient({ creators = [], locationName }: LocationClientProps) {
    const { t } = useLanguage();
    const [zones, setZones] = useState<any[]>([]);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/creators/zones`);
            if (res.ok) {
                const data = await res.json();
                const grouped: any = {};
                data.forEach((z: any) => {
                    const c = z.country || "Thailand";
                    if (!grouped[c]) grouped[c] = [];
                    grouped[c].push(z);
                });
                setZones(Object.entries(grouped).map(([country, items]) => ({ country, items })));
            }
        } catch (error) {
            console.error("Failed to fetch zones", error);
        }
    };

    if (creators.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-white mb-6 border-l-4 border-[#F84E6E] pl-3">
                    {t('location.title_zone').replace('{locationName}', locationName).replace('{count}', '0')}
                </h1>
                <div className="text-center py-20 text-white/50 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    {t('location.empty_state_title')}
                </div>

                {/* Zone Stats */}
                <div className="mt-8 border-t border-white/10 pt-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-3">
                        <span className="w-1 h-8 bg-[#F84E6E] rounded-full"></span>
                        {t('location.zone_stats_title')} {t('location.zone_stats_subtitle')}
                    </h2>

                    {zones.length > 0 && (
                        <div className="space-y-4">
                            {zones.map((group: any) => (
                                <div key={group.country} className="space-y-2">
                                    <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider text-center">{group.country}</h3>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {group.items.map((zone: any, i: number) => (
                                            <Link
                                                href={`/location/${zone.name}`}
                                                key={i}
                                                className="flex items-center gap-2 bg-[#1e1b4b] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition group border border-white/10"
                                            >
                                                <span className="group-hover:text-[#F84E6E] transition">{zone.name}</span>
                                                <span className="bg-[#1e1b4b] text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold min-w-[20px] text-center group-hover:bg-[#F84E6E] transition">
                                                    {zone.count}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6 border-l-4 border-[#F84E6E] pl-3">
                {t('location.title_zone').replace('{locationName}', locationName).replace('{count}', creators.length.toString())}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {creators.map((creator) => (
                    <CreatorCard key={creator._id} creator={creator} />
                ))}
            </div>

            {/* Zone Stats */}
            <div className="mt-8 border-t border-white/10 pt-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <span className="w-1 h-8 bg-[#F84E6E] rounded-full"></span>
                    {t('location.zone_stats_title')} {t('location.zone_stats_subtitle')}
                </h2>

                {zones.length > 0 && (
                    <div className="space-y-4">
                        {zones.map((group: any) => (
                            <div key={group.country} className="space-y-2">
                                <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider text-center">{group.country}</h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {group.items.map((zone: any, i: number) => (
                                        <Link
                                            href={`/location/${zone.name}`}
                                            key={i}
                                            className="flex items-center gap-2 bg-[#1e1b4b] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition group border border-white/10"
                                        >
                                            <span className="group-hover:text-[#F84E6E] transition">{zone.name}</span>
                                            <span className="bg-[#1e1b4b] text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold min-w-[20px] text-center group-hover:bg-[#F84E6E] transition">
                                                {zone.count}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CreatorCard({ creator }: { creator: any }) {
    const { t } = useLanguage();
    const imageSrc = creator.user?.avatarUrl
        ? getImageUrl(creator.user.avatarUrl)
        : `/mock/creators/${(parseInt((creator._id || "0").slice(-1), 16) % 8) + 1}.png`;

    return (
        <Link href={`/sideline/${creator._id}`} className="block relative aspect-[3/4] rounded-xl overflow-hidden group bg-zinc-900 shadow-lg hover:shadow-xl transition dark:border border-white/5">
            <Image
                src={imageSrc}
                alt={creator.displayName || "Creator"}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            {/* Content */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-sm truncate">{creator.displayName}</span>
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/80">
                    <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/10">{creator.province || creator.location || t('location.bangkok')}</span>
                    <span>{t('location.age')} {creator.age || "??"}</span>
                </div>
                <div className="mt-2 flex gap-1">
                    <span className="text-[10px] bg-[#F84E6E] px-1.5 py-0.5 rounded text-white font-bold">{creator.price || "N/A"}.00.-</span>
                </div>
            </div>
            {/* Status Icons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
                {creator.isHot && (
                    <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white"><span className="text-xs">🔥</span></div>
                )}
                {creator.isVerified && (
                    <div className="w-7 h-7 rounded-full bg-blue-500/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-white"><span className="text-[8px] font-bold">VER</span></div>
                )}
            </div>
        </Link>
    );
}
