"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/constants";
import { getImageUrl } from "../../../lib/images";
import { MapPin, Phone, MessageCircle, Globe, ShieldCheck, ChevronLeft, Building2, Sparkles } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

interface AgencyClientProps {
    initialAgency: any;
    initialZones: any[];
}

export default function AgencyClient({ initialAgency, initialZones }: AgencyClientProps) {
    const { t } = useLanguage();
    const [agency, setAgency] = useState<any>(initialAgency);
    const [zones, setZones] = useState<any[]>(initialZones || []);
    console.log(agency);
    // If for some reason initial data is missing, we could fetch it here, 
    // but for SEO pages we expect server to provide it.

    if (!agency) return <div className="min-h-screen flex items-center justify-center text-white bg-[#020617]">{t('agency.not_found')}</div>;

    return (
        <div className="min-h-screen bg-[#020617] pb-24">

            {/* Header / Banner */}
            <div className="relative h-[250px] md:h-[350px]">
                {agency.bannerUrl ? (
                    <Image src={getImageUrl(agency.bannerUrl)} alt="Banner" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/30" />

                <Link href="/" className="absolute top-6 left-6 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition z-20">
                    <ChevronLeft size={24} />
                </Link>
            </div>

            <div className="container mx-auto max-w-5xl px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white p-1 shadow-2xl flex-shrink-0">
                        <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200">
                            {agency.logoUrl ? (
                                <Image src={getImageUrl(agency.logoUrl)} alt="Logo" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"><Building2 size={40} /></div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-white pb-2">
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                            {agency.name}
                            {agency.isVerified && <ShieldCheck className="text-blue-400" size={28} />}
                        </h1>
                        <p className="text-white/70 max-w-2xl mt-2">{agency.description || t('agency.no_description')}</p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            {agency.location && (
                                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <MapPin size={14} className="text-[#F84E6E]" />
                                    {agency.province}
                                </div>
                            )}
                            {agency.phone && (
                                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <Phone size={14} className="text-green-400" />
                                    {agency.phone}
                                </div>
                            )}
                            {agency.lineId && (
                                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <MessageCircle size={14} className="text-green-400" />
                                    Line: {agency.lineId}
                                </div>
                            )}
                            {agency.website && (
                                <a href={agency.website} target="_blank" className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-white/20 transition">
                                    <Globe size={14} className="text-blue-400" />
                                    {t('agency.website')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Creators Section */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold border-l-4 border-[#F84E6E] pl-3 mb-6 flex items-center gap-2 text-white">
                        {t('agency.models_title')} <span className="text-[#F84E6E]">({agency.creators?.length || 0})</span>
                    </h2>

                    {agency.creators && agency.creators.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {agency.creators.map((creator: any) => (
                                <CreatorCard key={creator._id} creator={creator} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
                            <p className="text-white/40">{t('agency.no_models')}</p>
                        </div>
                    )}
                </div>

                {/* Zone Stats */}
                <div className="mt-8 border-t border-white/10 pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-white flex">
                        <span className="w-1 h-8 bg-[#F84E6E] rounded-full"></span>
                        {t('agency.zone_title')}
                    </h2>

                    {zones.length > 0 && (
                        <div className="space-y-4">
                            {zones.map((group: any) => (
                                <div key={group.country} className="space-y-2">
                                    <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider text-center">{group.country}</h3>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {group.items.map((zone: any, i: number) => (
                                            <Link
                                                href={`/?location=${zone.name}`}
                                                key={i}
                                                className="flex items-center gap-2 bg-white text-zinc-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition group"
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
        </div>
    );
}

function CreatorCard({ creator }: { creator: any }) {
    const { t } = useLanguage();
    // Safety check for user object
    const avatarUrl = creator.user?.avatarUrl || creator.images?.[0];
    const imageSrc = avatarUrl
        ? getImageUrl(avatarUrl)
        : `/mock/creators/${(parseInt(creator._id.slice(-1), 16) % 8) + 1}.png`;

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
        // Fire/Red Gradient
        containerClasses += " p-[3px] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 shadow-red-500/30";
        innerClasses += " rounded-[11px]";
    } else if (isPopular) {
        // Teal/Green Gradient for POPULAR
        containerClasses += " p-[3px] bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 shadow-teal-500/30";
        innerClasses += " rounded-[11px]";
    } else if (isRisingStar) {
        // Blue/Indigo Gradient for RISING_STAR
        containerClasses += " p-[3px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-blue-500/30";
        innerClasses += " rounded-[11px]";
    } else {
        // Default
        containerClasses += " border border-white/5 bg-zinc-900";
        innerClasses += " rounded-[11px]";
    }

    return (
        <Link href={`/sideline/${creator._id}`} className={containerClasses}>
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
                        {(() => {
                            if (isAngel) {
                                return (
                                    <div className="w-7 h-7 rounded-full bg-red-600/90 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-lg shadow-red-500/40">
                                        <span className="text-xs">🔥</span>
                                    </div>
                                );
                            } else if (isPopular) {
                                return (
                                    <div className="w-7 h-7 rounded-full bg-emerald-600/90 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-lg shadow-teal-500/40">
                                        <span className="text-xs">⭐</span>
                                    </div>
                                );
                            } else if (isRisingStar) {
                                return (
                                    <div className="w-7 h-7 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-lg shadow-blue-500/40">
                                        <span className="text-xs">✨</span>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {creator.isVerified && (
                            <div className="w-7 h-7 rounded-full bg-green-600/90 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                                <span className="text-[8px] font-bold">VER</span>
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
                            {creator?.country === "Thailand" ? "TH" : creator?.country} {creator.zones && creator.zones.length > 0 ? creator.zones[0] : "Bangkok"}
                        </span>
                    </div>

                    {/* Review Bar */}
                    <div className="bg-gradient-to-r from-[#be123c] to-[#e11d48] px-3 py-1.5 flex items-center justify-between text-white shadow-inner relative z-10">
                        <div className="flex items-center gap-1">
                            <div className="flex bg-white/20 rounded px-1 py-0.5 gap-0.5">
                                {[1, 2, 3].map(i => <Sparkles key={i} size={8} className="text-yellow-200 fill-yellow-200" />)}
                            </div>
                        </div>
                        <span className="font-bold text-[11px] uppercase tracking-wide opacity-90">{creator.reviewCount || 0} : Reviews</span>
                    </div>

                    {/* Footer: Age & Plan */}
                    <div className="bg-[#0f172a] px-3 py-2 flex items-center justify-between text-white border-t border-white/5 pb-3">
                        <div className="text-xs text-zinc-400 font-medium">
                            อายุ <span className="text-white text-sm font-bold">{creator.age || "??"}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${isAngel ? 'text-red-300 border-red-500/30 bg-red-500/10' : isPopular ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : isRisingStar ? 'text-blue-300 border-blue-500/30 bg-blue-500/10' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
                            {displayPlanName || "MEMBER"}
                        </span>
                    </div>
                </div>
            </div>
        </Link >
    )
}
