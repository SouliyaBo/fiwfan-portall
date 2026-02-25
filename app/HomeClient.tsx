"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, Building2, Send, Sparkles, Megaphone, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/constants";
import { getImageUrl } from "../lib/images";
import StoryViewer from "../components/StoryViewer";
import SearchModal from "@/app/components/SearchModal";
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
    country?: string;
    age?: number;
    price?: number;
    zones?: string[];
    planName?: string;
    isVerified: boolean;
    isHot: boolean;
    isSuperStar: boolean;
    planId?: string;
    reviewCount?: number;
    isAcceptingWork?: boolean;
}

interface Agency {
    _id: string;
    name: string;
    logoUrl?: string;
    creators?: any[];
    country?: string;
}

interface HomeClientProps {
    initialCreators?: Creator[];
    initialAgencies?: Agency[];
    initialStories?: any[];
    initialZones?: any[];
    initialTelegramUrl?: string;
    initialJobCount?: number;
}

function HomeContent({
    initialCreators = [],
    initialAgencies = [],
    initialStories = [],
    initialZones = [],
    initialTelegramUrl = "",
    initialJobCount = 0
}: HomeClientProps) {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const [creators, setCreators] = useState<Creator[]>(initialCreators);
    const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
    const [stories, setStories] = useState<any[]>(initialStories);
    const [loading, setLoading] = useState(initialCreators.length === 0);
    const [searchTerm, setSearchTerm] = useState("");
    const [usePreferences, setUsePreferences] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedStoryCreatorIndex, setSelectedStoryCreatorIndex] = useState<number | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<any>({});
    const [zones, setZones] = useState<any[]>(initialZones);
    const [telegramUrl, setTelegramUrl] = useState(initialTelegramUrl);
    const [jobCount, setJobCount] = useState(initialJobCount);
    const [selectedCountry, setSelectedCountry] = useState("Thailand");

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
        const gender = searchParams.get('gender');

        if (country) filters.country = country;
        if (province) filters.province = province;
        if (location) filters.location = location;
        if (name) filters.name = name;
        if (gender) filters.gender = gender;

        // If we have initial data and no filters are active (or initial data matches filters - simplified here), 
        // we might skip fetching. But typically searchParams changing means we should refetch.
        // For simple SSR -> CSR transition:
        // If it's the first mount and we have initialCreators, we might want to skip.
        // But simpler logic: just fetch only if we don't have data OR if params changed?
        // Actually, easiest is: always fetch on param change, but if initial mount matches params, use initial.

        // Use a ref or simple check? 
        // Let's just fetch if searchParams are present OR if it's a client-side navigation.
        // For now, let's keep the fetch logic but maybe optimize later. 
        // Or if we want to rely on SSR data for initial load:

        if (Object.keys(filters).length > 0 || initialCreators.length === 0) {
            fetchCreators(filters, false);
        }

        if (initialAgencies.length === 0) fetchAgencies();
        if (initialStories.length === 0) fetchStories();
        if (initialZones.length === 0) fetchZones();
        if (!initialTelegramUrl) fetchTelegramUrl();
        if (initialJobCount === 0) fetchJobCount();
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

    const fetchJobCount = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/jobs?limit=10`);
            if (res.ok) {
                const data = await res.json();
                setJobCount(data.length);
            }
        } catch (error) {
            console.error("Failed to fetch jobs");
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

            // Update URL without triggering a full Next.js App Router navigation loop
            const newUrl = query !== '?' ? query : window.location.pathname;
            window.history.replaceState({ path: newUrl }, '', newUrl);

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
                        {agencies
                            .filter(a => !selectedCountry || a.country === selectedCountry || (selectedCountry === 'Thailand' && !a.country))
                            .map((agency, i) => (
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
                    {/* Country Filter Switcher (Left) */}
                    <div className="bg-[#1e1b4b]/80 p-0.5 rounded-full border border-white/10 flex relative backdrop-blur-sm shadow-md">
                        {/* Sliding Background */}
                        <div
                            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-[#F84E6E] rounded-full transition-all duration-300 ease-in-out shadow-sm ${selectedCountry === 'Thailand' ? 'left-0.5' : 'left-[50%]'
                                }`}
                        />

                        <button
                            onClick={() => setSelectedCountry("Thailand")}
                            className={`relative z-10 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all duration-300 ${selectedCountry === 'Thailand' ? 'text-white' : 'text-white/50 hover:text-white/80'
                                }`}
                        >
                            <span className="text-base">🇹🇭</span> Thailand
                        </button>
                        <button
                            onClick={() => setSelectedCountry("Laos")}
                            className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${selectedCountry === 'Laos' ? 'text-white' : 'text-white/50 hover:text-white/80'
                                }`}
                        >
                            <span className="text-base">🇱🇦</span> Laos
                        </button>
                    </div>

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
                        {/* The Angel Section */}
                        {creators
                            .filter(c => !selectedCountry || c.country === selectedCountry || (selectedCountry === 'Thailand' && !c.country))
                            .some(c => (c.planId === 'THE_ANGEL' || c.planName === 'The_Angel' || c.planName === 'THE_ANGEL' || c.isHot)) && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="text-2xl flex items-center">
                                            <span style={{ transform: "scaleX(-1)" }} className="inline-block -mr-1">🪽</span>
                                            <span>🪽</span>
                                        </span> The Angel Phusao
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        {creators
                                            .filter(c => !selectedCountry || c.country === selectedCountry || (selectedCountry === 'Thailand' && !c.country))
                                            .filter(c => (c.planId === 'THE_ANGEL' || c.planName === 'The_Angel' || c.planName === 'THE_ANGEL' || c.isHot))
                                            .map((creator) => (
                                                <CreatorCard key={creator._id} creator={creator} />
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Popular Section (Mid Tier) */}
                        {creators
                            .filter(c => !selectedCountry || c.country === selectedCountry || (selectedCountry === 'Thailand' && !c.country))
                            .some(c => (c.planId === 'POPULAR' || c.planName === 'Popular' || c.planName === 'POPULAR')) && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="text-2xl">🔥</span> Popular Phusao
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        {creators
                                            .filter(c => !selectedCountry || c.country === selectedCountry || (selectedCountry === 'Thailand' && !c.country))
                                            .filter(c => (c.planId === 'POPULAR' || c.planName === 'Popular' || c.planName === 'POPULAR'))
                                            .map((creator) => (
                                                <CreatorCard key={creator._id} creator={creator} />
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Rising Star Section (Entry Tier) */}
                        {creators
                            .filter(c => !selectedCountry || c.country === selectedCountry || (selectedCountry === 'Thailand' && !c.country))
                            .some(c => (c.planId === 'RISING_STAR' || c.planName === 'Rising Star' || c.planName === 'RISING_STAR' || c.planName === 'Free Mode')) && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="text-2xl">✨</span> Rising Star Phusao
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        {creators
                                            .filter(c => !selectedCountry || c.country === selectedCountry || (selectedCountry === 'Thailand' && !c.country))
                                            .filter(c => (c.planId === 'RISING_STAR' || c.planName === 'Rising Star' || c.planName === 'RISING_STAR' || c.planName === 'Free Mode'))
                                            .map((creator) => (
                                                <CreatorCard key={creator._id} creator={creator} />
                                            ))}
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </section>

            {/* Floating Job Widget (Left Bottom) */}
            {jobCount > 0 && (
                <Link
                    href="/jobs"
                    className="fixed bottom-6 left-6 z-40 bg-white dark:bg-zinc-800 rounded-full shadow-xl border border-pink-200 dark:border-pink-900 pr-5 pl-2 py-2 flex items-center gap-3 animate-bounce hover:scale-105 transition cursor-pointer"
                >
                    <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-md">
                        <Megaphone size={20} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">{t('tourist.new_requests_widget')}</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                            {t('tourist.tourists_waiting_widget').replace('{count}', jobCount.toString())}
                        </span>
                    </div>
                </Link>
            )}

            {/* Admin Contact Floating Button (Line) */}
            <a
                href="https://lin.ee/J5qWrGq"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-24 right-6 w-14 h-14 bg-[#06C755] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-40 animate-bounce"
            >
                <span className="text-white font-bold text-sm">LINE</span>
            </a>

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
            </div>
        </div >
    );
}

function CreatorCard({ creator }: { creator: Creator }) {
    const { t } = useLanguage();
    const imageSrc = creator.user.avatarUrl
        ? getImageUrl(creator.user.avatarUrl)
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
        innerClasses += " rounded-[15px]"; // Slightly smaller to fit border? standard usually 1px diff, but with padding 3px, r_in = r_out - padding roughly. 16 - 3 = 13.
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
                                        <div className="relative w-full h-full rounded-full flex items-center justify-center text-white bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border border-white shadow-md transform hover:scale-110 transition-all duration-300 z-10">
                                            <span style={{ transform: "scaleX(-1)" }} className="inline-block -mr-1 text-lg leading-none filter drop-shadow-md">🪽</span>
                                            <span className="text-lg leading-none filter drop-shadow-md">🪽</span>
                                        </div>
                                    </div>
                                );
                            } else if (isPopular) {
                                return (
                                    <div className="relative group/popular w-7 h-7 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-purple-500 rounded-full opacity-60 animate-pulse group-hover/popular:animate-ping duration-1000"></div>
                                        <div className="relative w-full h-full rounded-full flex items-center justify-center text-white bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 border border-white shadow-md transform hover:scale-110 transition-all duration-300 z-10">
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
                                <div className="relative w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 border border-white shadow-md z-10">
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
    )
}

export default HomeContent;
