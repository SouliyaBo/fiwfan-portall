"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "../../../lib/images";
import { useEffect, useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { API_BASE_URL } from "../../../lib/constants";
import { Sparkles } from "lucide-react";

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
    // Safety check for user object
    const avatarUrl = creator.user?.avatarUrl || creator.images?.[0];
    const imageSrc = avatarUrl
        ? getImageUrl(avatarUrl)
        : `/mock/creators/${(parseInt((creator._id || "0").slice(-1), 16) % 8) + 1}.png`;

    const planKey = (creator.planId || creator.planName || "").toUpperCase().replace(/ /g, '_');
    const isAngel = planKey === 'THE_ANGEL' || creator.isHot;
    const isPopular = planKey === 'POPULAR';
    const isRisingStar = planKey === 'RISING_STAR';

    const displayPlanName = planKey && ['THE_ANGEL', 'POPULAR', 'RISING_STAR'].includes(planKey)
        ? t(`plan_names.${planKey}`)
        : creator.planName || "";

    // Dynamic card styling with gradients
    let containerClasses = "block relative rounded-[14px] overflow-hidden group transition shadow-lg hover:shadow-xl hover:-translate-y-1 h-full flex flex-col";
    let innerClasses = "relative w-full h-full bg-[#0a101f] overflow-hidden flex flex-col";

    if (isAngel) {
        // Premium Angel Gradient (Gold/Red/Grand)
        containerClasses += " p-[3px] bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#EF4444] shadow-xl shadow-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/70 rounded-2xl";
        innerClasses += " rounded-[13px]";
    } else if (isPopular) {
        // Purple/Fuchsia Gradient for POPULAR (Requested: Purple, less prominent than Angel)
        containerClasses += " p-[3px] bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 shadow-purple-500/30 rounded-2xl";
        innerClasses += " rounded-[13px]";
    } else if (isRisingStar) {
        // Blue/Indigo Gradient for RISING_STAR
        containerClasses += " p-[3px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-blue-500/30 rounded-2xl";
        innerClasses += " rounded-[13px]";
    } else {
        // Default
        containerClasses += " border border-white/5 bg-zinc-900 rounded-2xl";
        innerClasses += " rounded-[15px]"; // Slightly smaller to fit border
    }

    return (
        <Link href={`/sideline/${creator._id}`} className={containerClasses}>
            {isAngel && (
                <>
                    {/* Continuous Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-20 pointer-events-none mix-blend-overlay" />
                    {/* Moving Glint on Hover */}
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine z-20" />
                </>
            )}
            <div className={innerClasses}>
                {/* Image Section */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                        src={imageSrc}
                        alt={creator.displayName || "Creator"}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-700"
                    />

                    {/* Status Icons (Top Right) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">

                        <div className="w-7 h-7 rounded-full  flex items-center justify-center text-white">
                            {creator?.country === "Thailand" ? <Image src="/Thai.gif" alt="Flag" width={20} height={20} /> : creator?.country === "Laos" ? <Image src="/Laos.gif" alt="Flag" width={20} height={20} /> : "🇹🇭"}
                        </div>

                        {(() => {
                            if (isAngel) {
                                return (
                                    <div className="w-7 h-7 rounded-full  flex items-center justify-center text-white">
                                        <Image src="/recommend.gif" alt="angel" width={20} height={20} />
                                    </div>
                                );
                            } else if (isPopular) {
                                return (
                                    <div className="w-7 h-7 rounded-full  flex items-center justify-center text-white">
                                        <Image src="/Fire.gif" alt="Fire" width={20} height={20} />
                                    </div>
                                );
                            } else if (isRisingStar) {
                                return (
                                    <div className="w-7 h-7 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-lg shadow-blue-500/40">
                                        <Image src="/Star.gif" alt="rising" width={20} height={20} />
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {creator.isVerified && (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center">
                                <Image src="/verification.gif" alt="Flag" width={25} height={25} />
                            </div>
                        )}
                        {creator.isAcceptingWork === false && (
                            <div className="w-7 h-7 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                                <span className="text-[8px] font-bold text-red-500">OFF</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col">
                    {/* Name & Zone */}
                    <div className="bg-[#111827] px-3 py-2 flex items-center justify-between border-t border-white/5">
                        <h2 className="font-bold text-white text-sm truncate pr-2 max-w-[65%]">
                            {creator.displayName}
                        </h2>
                        <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium truncate max-w-[35%] shadow-sm shadow-green-900/20">
                            {creator.zones && creator.zones.length > 0 ? creator.zones[0] : "Bangkok"}
                        </span>
                    </div>

                    {/* Review Bar */}
                    <div className="bg-gradient-to-r from-[#be123c]/90 to-transparent px-3 py-1.5 flex items-center justify-between text-white shadow-inner relative z-10">
                        <div className="flex items-center gap-1">
                            <div className="flex bg-white/20 rounded px-1 py-0.5 gap-0.5">
                                {[1, 2, 3].map(i => <Sparkles key={i} size={8} className="text-yellow-200 fill-yellow-200" />)}
                            </div>
                        </div>
                        <span className="font-bold text-[11px] tracking-wide opacity-90">{creator.reviewCount || 0} : รีวิว</span>
                    </div>

                    {/* Footer: Age & Plan */}
                    <div className="bg-[#0f172a] px-3 py-2 flex items-center justify-between text-white border-t border-white/5 pb-3">
                        <div className="text-xs text-zinc-400 font-medium">
                            อายุ <span className="text-white text-sm font-bold">{creator.age || "??"}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${isAngel ? 'text-red-300 border-red-500/30 bg-red-500/10' : isPopular ? 'text-purple-300 border-purple-500/30 bg-purple-500/10' : isRisingStar ? 'text-blue-300 border-blue-500/30 bg-blue-500/10' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
                            {displayPlanName || "MEMBER"}
                        </span>
                    </div>
                </div>
            </div>
        </Link >
    );
}
