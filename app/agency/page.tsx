"use client";

import Image from "next/image";
import Link from "next/link";
import { Send, Flame, Sparkles, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../lib/constants";
import { getImageUrl } from "../../lib/images";
import { useLanguage } from "../../contexts/LanguageContext";

interface Creator {
    _id: string;
    displayName: string;
    province?: string;
    location?: string;
    age?: number;
    images?: string[];
    user: {
        avatarUrl?: string;
    }
}

interface Agency {
    _id: string;
    name: string;
    location?: string;
    logoUrl?: string;
    creators: Creator[];
}

export default function AgencyPage() {
    const { t } = useLanguage();
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [telegramUrl, setTelegramUrl] = useState("");

    useEffect(() => {
        const fetchSystemSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/settings?key=telegram_url`);
                if (res.ok) {
                    const data = await res.json();
                    setTelegramUrl(data.value || "");
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSystemSettings();
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/agencies`);
            if (res.ok) {
                const data = await res.json();
                setAgencies(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-rose-600 via-pink-600 to-blue-800 text-white py-12 px-4 shadow-lg">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-4 gap-4">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                            <span className="text-white">Phusao</span>
                        </Link>
                        <div className="flex gap-3 md:gap-4 w-full md:w-auto justify-center">
                            <a
                                href={telegramUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full flex items-center gap-2 backdrop-blur-sm transition cursor-pointer whitespace-nowrap"
                            >
                                <Send size={16} className="md:w-[18px] md:h-[18px]" /> {t('home.agency_join_telegram')}
                            </a>
                            <Link href="/auth?mode=register" className="bg-[#d94459] hover:brightness-110 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md font-bold shadow-md transition whitespace-nowrap">
                                {t('nav.register')}
                            </Link>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
                        {t('home.agency_hero_title')}
                    </h1>
                    <p className="text-xl opacity-90 mb-4">{t('home.agency_hero_subtitle')}</p>
                    <p className="text-sm opacity-80 max-w-4xl">
                        {t('home.agency_hero_desc')}
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-12">
                {loading ? (
                    <div className="text-center py-20 text-zinc-500">{t('common.loading')}</div>
                ) : agencies.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">{t('home.agency_empty')}</div>
                ) : (
                    agencies.map((agency) => (
                        <div key={agency._id} className="flex flex-col gap-6">
                            {/* Agency Header Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 bg-[#d94459] rounded-sm" />
                                    <h2 className="text-3xl font-bold text-white">{agency.name}</h2>
                                </div>
                                <Link href={`/agency/${agency._id}`}>
                                    <button className="bg-[#0f391b] hover:bg-[#1a5c2b] text-white px-6 py-2 rounded font-medium transition shadow-sm cursor-pointer">
                                        {t('home.agency_view_all_models')}
                                    </button>
                                </Link>
                            </div>

                            {/* Content Row */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Agency Profile Card */}
                                <div className="w-full md:w-64 bg-[#1e1b4b]/20 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                                    <div className="w-32 h-32 rounded-full bg-slate-700 mb-4 overflow-hidden relative border-4 border-white/10 shadow-lg">
                                        {agency.logoUrl ? (
                                            <Image src={getImageUrl(agency.logoUrl)} alt={agency.name} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-slate-400">
                                                {agency.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{agency.name}</h3>
                                    <p className="text-zinc-400 text-sm">{agency.location || "Thailand"}</p>
                                </div>

                                {/* Models Horizontal Scroll */}
                                <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                                    <div className="flex gap-4">
                                        {agency.creators && agency.creators.length > 0 ? (
                                            agency.creators.map((creator, i) => (
                                                <ModelCard key={creator._id} creator={creator} index={i} />
                                            ))
                                        ) : (
                                            <div className="w-full h-72 flex items-center justify-center text-zinc-400 border-2 border-dashed border-white/10 rounded-xl">
                                                {t('home.agency_no_models')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}



function ModelCard({ creator, index }: { creator: any, index: number }) {
    const { t } = useLanguage();
    // Determine image logic: Gallery -> Avatar -> Mock
    const avatarUrl = creator.user?.avatarUrl || creator.images?.[0];
    const imageSrc = avatarUrl
        ? getImageUrl(avatarUrl)
        : `/mock/creators/${(parseInt(creator._id.slice(-1), 16) % 8) + 1}.png`;

    const activeSub = creator.activeSubscription;
    const planKey = (activeSub?.planType || creator.planId || creator.planName || "").toUpperCase().replace(/ /g, '_');

    // Safety for Agency page where extra creator fields might be missing initially
    const isAngel = planKey === 'THE_ANGEL' || creator.isHot;
    const isPopular = planKey === 'POPULAR';
    const isRisingStar = planKey === 'RISING_STAR';

    const displayPlanName = planKey && ['THE_ANGEL', 'POPULAR', 'RISING_STAR'].includes(planKey)
        ? t(`plan_names.${planKey}`)
        : creator.planName || "";

    // Dynamic card styling with gradients
    // Using w-48 h-72 specifically for the horizontal scrolling cards in Agency list
    let containerClasses = "block relative rounded-[14px] overflow-hidden group transition shadow-lg hover:shadow-xl hover:-translate-y-1 w-48 h-72 shrink-0 flex flex-col";
    let innerClasses = "relative w-full h-full bg-[#0a101f] overflow-hidden flex flex-col";

    if (isAngel) {
        // Premium Angel Gradient (Gold/Red/Grand)
        containerClasses += " p-[3px] bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#EF4444] shadow-xl shadow-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/70 rounded-2xl";
        innerClasses += " rounded-[13px]";
    } else if (isPopular) {
        // Purple/Fuchsia Gradient for POPULAR
        containerClasses += " p-[3px] bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 shadow-purple-500/30 rounded-2xl";
        innerClasses += " rounded-[13px]";
    } else if (isRisingStar) {
        // Blue/Indigo Gradient for RISING_STAR
        containerClasses += " p-[3px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-blue-500/30 rounded-2xl";
        innerClasses += " rounded-[13px]";
    } else {
        // Default
        containerClasses += " border border-white/5 bg-zinc-900 rounded-2xl";
        innerClasses += " rounded-[15px]";
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
                            {creator?.country === "Thailand" ? <Image src="/Thai.gif" alt="Flag" width={26} height={26} /> : creator?.country === "Laos" ? <Image src="/Laos.gif" alt="Flag" width={26} height={26} /> : "🇹🇭"}
                        </div>

                        {(() => {
                            if (isAngel) {
                                return (
                                    <div className="relative group/angel w-7 h-7 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-amber-500 rounded-full opacity-60 animate-pulse group-hover/angel:animate-ping duration-1000"></div>
                                        <div className="relative w-full h-full rounded-full flex items-center justify-center text-white bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border-2 border-white shadow-md transform hover:scale-110 transition-all duration-300 z-10">
                                            <span style={{ transform: "scaleX(-1)" }} className="inline-block -mr-1 text-lg leading-none filter drop-shadow-md">🪽</span>
                                            <span className="text-lg leading-none filter drop-shadow-md">🪽</span>
                                        </div>
                                    </div>
                                );
                            } else if (isPopular) {
                                return (
                                    <div className="relative group/popular w-7 h-7 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-purple-500 rounded-full opacity-60 animate-pulse group-hover/popular:animate-ping duration-1000"></div>
                                        <div className="relative w-full h-full rounded-full flex items-center justify-center text-white bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 border-2 border-white shadow-md transform hover:scale-110 transition-all duration-300 z-10">
                                            <span className="text-lg leading-none filter drop-shadow-md">🔥</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {creator.isVerified && (
                            <div className="relative group/verify w-7 h-7 flex items-center justify-center">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-60 animate-pulse group-hover/verify:animate-ping duration-1000"></div>
                                <div className="relative w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 border-2 border-white shadow-md z-10">
                                    <Check className="w-4 h-4 text-white font-bold drop-shadow-md" strokeWidth={4} />
                                </div>
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
                <div className="flex flex-col mt-auto">
                    {/* Name & Zone */}
                    <div className="bg-[#111827] px-2 py-1.5 flex items-center justify-between border-t border-white/5">
                        <h2 className="font-bold text-white text-xs truncate pr-1 max-w-[65%]">
                            {creator.displayName}
                        </h2>
                        <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium truncate max-w-[35%] shadow-sm shadow-green-900/20">
                            {creator.zones && creator.zones.length > 0 ? creator.zones[0] : (creator.province || "Bangkok")}
                        </span>
                    </div>

                    {/* Review Bar */}
                    <div className="bg-gradient-to-r from-[#be123c]/90 to-transparent px-2 py-1 flex items-center justify-between text-white shadow-inner relative z-10">
                        <div className="flex items-center gap-0.5">
                            <div className="flex bg-white/20 rounded px-1 py-0.5 gap-0.5">
                                {[1, 2, 3].map(i => <Sparkles key={i} size={6} className="text-yellow-200 fill-yellow-200" />)}
                            </div>
                        </div>
                        <span className="font-bold text-[9px] tracking-wide opacity-90">{creator.reviewCount || 0} : รีวิว</span>
                    </div>

                    {/* Footer: Age & Plan (Condensed for small card) */}
                    <div className="bg-[#0f172a] px-2 py-1.5 flex items-center justify-between text-white border-t border-white/5 pb-2">
                        <div className="text-[10px] text-zinc-400 font-medium">
                            อายุ <span className="text-white text-xs font-bold">{creator.age || "??"}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isAngel ? 'text-red-300 border-red-500/30 bg-red-500/10' : isPopular ? 'text-purple-300 border-purple-500/30 bg-purple-500/10' : isRisingStar ? 'text-blue-300 border-blue-500/30 bg-blue-500/10' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
                            {displayPlanName || "MEMBER"}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
