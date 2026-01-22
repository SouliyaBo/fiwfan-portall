"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ChevronRight, Search, Building2, Send, Sparkles } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/constants";
import { getImageUrl } from "../lib/images";
import StoryViewer from "../components/StoryViewer";
import SearchModal from "@/app/components/SearchModal";
import { Loader2 } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { getAuthToken } from "../lib/auth";
import { useLanguage } from "../contexts/LanguageContext";

interface Creator {
    _id: string;
    user: {
        username: string;
        avatarUrl?: string;
    };
    displayName?: string;
    location?: string;
    age?: number;
    price?: number;
    planName?: string;
    isVerified: boolean;
    isHot: boolean;
    isSuperStar: boolean;
    planId?: string; // Added planId
    reviewCount?: number;
}

interface Agency {
    _id: string;
    name: string;
    logoUrl?: string;
    creators?: any[];
}

function HomeContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [usePreferences, setUsePreferences] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedStoryCreatorIndex, setSelectedStoryCreatorIndex] = useState<number | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<any>({});
    const [zones, setZones] = useState<any[]>([]);
    const [telegramUrl, setTelegramUrl] = useState("");

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setIsLoggedIn(true);
        }

        // Parse query params
        const filters: any = {};
        const country = searchParams.get('country');
        const province = searchParams.get('province');
        const location = searchParams.get('location'); // Zone
        const name = searchParams.get('name');

        if (country) filters.country = country;
        if (province) filters.province = province;
        if (location) filters.location = location;
        if (name) filters.name = name;

        fetchCreators(filters, false);

        fetchAgencies();
        fetchStories();
        fetchZones();
        fetchTelegramUrl();
    }, [searchParams]);

    const fetchTelegramUrl = async () => {
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

    const fetchStories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/stories/feed`);
            if (res.ok) {
                const data = await res.json();
                const grouped: any = {};
                data.forEach((s: any) => {
                    if (!s.creator) return;
                    const cid = s.creator._id;
                    if (!grouped[cid]) {
                        grouped[cid] = { ...s.creator, stories: [] };
                    }
                    grouped[cid].stories.push(s);
                });
                setStories(Object.values(grouped));
            }
        } catch (e) {
            console.error("Failed to fetch stories", e);
        }
    };

    const fetchCreators = async (search: any = "", applyPrefs?: boolean) => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const prefsParam = applyPrefs ?? usePreferences ? "&usePreferences=true" : "";

            let searchParams = new URLSearchParams();
            if (typeof search === 'string') {
                if (search) searchParams.append("location", search);
            } else {
                if (search.name) searchParams.append("name", search.name);
                if (search.lineId) searchParams.append("lineId", search.lineId);
                if (search.gender) searchParams.append("gender", search.gender);
                if (search.country) searchParams.append("country", search.country);
                if (search.province) searchParams.append("province", search.province);
                if (search.location) searchParams.append("location", search.location);
            }

            const query = `?${searchParams.toString()}${prefsParam}`;

            const res = await fetch(`${API_BASE_URL}/creators${query}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setCreators(data);
            }
        } catch (error) {
            console.error("Failed to fetch creators:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgencies = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/agencies`);
            if (res.ok) {
                const data = await res.json();
                setAgencies(data);
            }
        } catch (error) {
            console.error("Failed to fetch agencies:", error);
        }
    };


    return (
        <div className="pb-20">
            {/* Search Hero */}
            <section className="text-center py-8">
                <p className="text-3xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-2 tracking-wide">
                    <Sparkles className="text-pink-400 animate-pulse" size={32} />
                    <span className="bg-gradient-to-r from-pink-300 via-pink-400 to-rose-400 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]">Phu</span>
                    <span className="text-white drop-shadow-md">sao</span>
                    <span className="text-pink-400">💕</span>
                </p>

                <div className="max-w-4xl mx-auto px-4 mb-8 space-y-4">
                    <h1 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                        {t('home.hero_title')}
                    </h1>
                    <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t('home.hero_desc') }}></p>

                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-2">
                        <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded text-[10px] md:text-xs">
                            <span className="bg-green-500 rounded-full p-0.5"><svg className="w-2 md:w-2.5 h-2 md:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>
                            {t('home.tag_verified')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] md:text-xs">
                            <span className="text-base md:text-lg">🎥</span> {t('home.tag_video')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] md:text-xs">
                            <span className="text-base md:text-lg">⭐</span> {t('home.tag_review')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-[10px] md:text-xs">
                            <span className="text-base md:text-lg">📲</span> {t('home.tag_contact')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 px-2 py-1 rounded text-[10px] md:text-xs">
                            <span className="text-base md:text-lg">📍</span> {t('home.tag_location')}
                        </span>
                    </div>
                </div>

                <div className="relative max-w-md mx-auto px-4">
                    <div
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full bg-[#1e1b4b]/80 h-14 rounded-full flex items-center px-6 cursor-pointer shadow-lg hover:scale-105 transition duration-300 border border-white/10 text-white"
                    >
                        <Search className="text-[#F84E6E] mr-3" />
                        <span className="text-zinc-400 font-medium">{t('home.search_placeholder')}</span>
                        <button className="ml-auto bg-[#F84E6E] text-white px-6 py-2 rounded-full font-bold text-sm cursor-pointer">
                            {t('home.search_btn')}
                        </button>
                    </div>
                </div>
            </section>


            {/* Stories Section (Mock) */} {" "}
            <section className="mb-8 pt-4">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4">
                    {stories.length === 0 ? (
                        <div className="text-white/40 text-xs w-full text-center py-4">{t('home.stories_empty')}</div>
                    ) : stories.map((creator: any, index: number) => (
                        <div key={creator._id} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSelectedStoryCreatorIndex(index)}>
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-800 border-2 border-black overflow-hidden relative">
                                    <Image
                                        src={creator.user?.avatarUrl ? getImageUrl(creator.user.avatarUrl) : '/mock/avatar.png'}
                                        alt={creator.displayName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-xs text-white/60 truncate w-16 text-center">{creator.displayName}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Top Agencies */}
            <section className="mb-8 px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold border-l-4 border-[#F84E6E] pl-3">{t('home.agencies_title')}</h2>
                    <Link href="/agency" className="text-xs text-pink-500 flex items-center">
                        {t('common.view_all')} <ChevronRight size={14} />
                    </Link>
                </div>

                {agencies.length === 0 ? (
                    <div className="text-white/40 text-sm text-center py-4 bg-white/5 rounded-xl border border-white/5">
                        {t('home.agencies_empty')}
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {agencies.map((agency, i) => (
                            <Link href={`/agency/${agency._id}`} key={agency._id} className="flex-shrink-0 w-64 h-24 bg-[#1e1b4b]/50 hover:bg-[#1e1b4b] transition rounded-xl border border-white/5 flex items-center p-4 gap-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-6 h-6 bg-yellow-500 rounded-tl-xl rounded-br-xl text-black font-bold flex items-center justify-center text-xs z-10 shadow-lg">
                                    {i + 1}
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-xl z-10 overflow-hidden relative border-2 border-white/10 group-hover:border-[#F84E6E] transition">
                                    {agency.logoUrl ? (
                                        <Image src={getImageUrl(agency.logoUrl)} fill className="object-cover" alt={agency.name} />
                                    ) : (
                                        <Building2 size={24} className="text-white/50" />
                                    )}
                                </div>
                                <div className="z-10 overflow-hidden">
                                    <div className="font-bold truncate text-white group-hover:text-[#F84E6E] transition">{agency.name}</div>
                                    <div className="text-xs text-white/40">{agency.creators ? agency.creators.length : 0} Creators</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Creator Feed Grid */}
            <section className="px-4 space-y-8">
                {/* Header with Filter */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold border-l-4 border-[#F84E6E] pl-3"></h2>

                    {isLoggedIn && (
                        <button
                            onClick={() => {
                                const newVal = !usePreferences;
                                setUsePreferences(newVal);
                                fetchCreators(searchTerm, newVal);
                            }}
                            className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border cursor-pointer ${usePreferences ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-white/5 border-white/10 text-white/50'}`}
                        >
                            <Search size={12} />
                            {usePreferences ? t('home.filter_active') : t('home.filter_inactive')}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-white/50">{t('common.loading')}</div>
                ) : creators.length === 0 ? (
                    <div className="text-center py-20 text-white/50">{t('home.creators_empty')}</div>
                ) : (
                    <>
                        {/* Super Star Section */}
                        {creators.some(c => (c.planId === 'SUPER_STAR' || c.planName === 'SUPER_STAR' || c.isHot)) && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🔥</span> {t('home.super_star_title')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {creators
                                        .filter(c => (c.planId === 'SUPER_STAR' || c.planName === 'SUPER_STAR' || c.isHot))
                                        .map((creator) => (
                                            <CreatorCard key={creator._id} creator={creator} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Star Section */}
                        {creators.some(c => (c.planId === 'STAR' || c.planName === 'STAR')) && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">⭐</span> {t('home.star_title')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {creators
                                        .filter(c => (c.planId === 'STAR' || c.planName === 'STAR'))
                                        .map((creator) => (
                                            <CreatorCard key={creator._id} creator={creator} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Section (Rest) */}
                        {creators.some(c => !(c.planId === 'SUPER_STAR' || c.planName === 'SUPER_STAR' || c.isHot) && !(c.planId === 'STAR' || c.planName === 'STAR')) && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">✨</span> {t('home.popular_title')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {creators
                                        .filter(c => !(c.planId === 'SUPER_STAR' || c.planName === 'SUPER_STAR' || c.isHot) && !(c.planId === 'STAR' || c.planName === 'STAR'))
                                        .map((creator) => (
                                            <CreatorCard key={creator._id} creator={creator} />
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Floating Telegram Button */}
            {
                telegramUrl && (
                    <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 w-14 h-14 bg-[#229ED9] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-40 animate-bounce">
                        <Send size={28} className="text-white fill-white ml-1 mt-1" />
                    </a>
                )
            }

            {/* Story Viewer Modal */}
            {
                selectedStoryCreatorIndex !== null && (
                    <StoryViewer
                        creators={stories as any}
                        initialCreatorIndex={selectedStoryCreatorIndex}
                        onClose={() => setSelectedStoryCreatorIndex(null)}
                    />
                )
            }

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearch={(filters) => {
                    setActiveFilters(filters);
                    fetchCreators(filters);
                }}
            />

            {/* Zone Stats */}
            <div className="mt-8 border-t border-white/10 pt-8 px-4">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <span className="w-1 h-8 bg-[#F84E6E] rounded-full"></span>
                    {t('home.zone_title')}
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
            </div>    </div >
    );
}

function CreatorCard({ creator }: { creator: Creator }) {
    const { t } = useLanguage();
    const imageSrc = creator.user.avatarUrl
        ? getImageUrl(creator.user.avatarUrl)
        : `/mock/creators/${(parseInt(creator._id.slice(-1), 16) % 8) + 1}.png`;

    const planKey = (creator.planId || creator.planName || "").toUpperCase();
    // Default to displaying nothing for Popular if desired, or just show translated
    const displayPlanName = planKey && ['SUPER_STAR', 'STAR', 'POPULAR'].includes(planKey)
        ? t(`plan_names.${planKey}`)
        : creator.planName || "";

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
            <div className="absolute bottom-3 left-3 right-3">
                <div className="flex justify-between items-end">
                    <div className="text-white overflow-hidden w-full">
                        <div className="flex items-center gap-1 mb-1">
                            <h2 className="font-bold text-sm truncate">{creator.displayName}</h2>
                            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/80">
                            <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/10 truncate">{creator.location || "Bangkok"}</span>
                            <span>Age {creator.age || "??"}</span>
                        </div>
                        <div className="mt-2 flex justify-between gap-1">
                            <div className="text-[10px] bg-[#F84E6E] px-1.5 py-0.5 rounded text-white font-bold">{creator.reviewCount || 0} รีวิว</div>
                            {displayPlanName && <div className="text-[10px] px-1.5 py-0.5 rounded text-white font-bold bg-white/10 backdrop-blur-md">{displayPlanName}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Icons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
                {/* Plan Status Icon */}
                {(() => {
                    const plan = creator.planId || creator.planName; // Fallback to planName if planId is missing temporarily
                    if (plan === 'SUPER_STAR' || creator.isHot) {
                        return (
                            <div className="w-7 h-7 rounded-full bg-red-600 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-lg shadow-red-500/40">
                                <span className="text-xs">🔥</span>
                            </div>
                        );
                    } else if (plan === 'STAR') {
                        return (
                            <div className="w-7 h-7 rounded-full bg-blue-600 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-lg shadow-blue-500/40">
                                <span className="text-xs">⭐</span>
                            </div>
                        );
                    }
                    return null;
                })()}
                {creator.isVerified && (
                    <div className="w-7 h-7 rounded-full bg-green-600 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                        <span className="text-[8px] font-bold">VER</span>
                    </div>
                )}
            </div>
        </Link >
    )
}

export default HomeContent;
