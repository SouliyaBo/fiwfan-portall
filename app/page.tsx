"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ChevronRight, Search, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/constants";
import { getImageUrl } from "../lib/images";
import StoryViewer from "../components/StoryViewer";
import SearchModal from "@/app/components/SearchModal";

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
  isVerified: boolean;
  isHot: boolean;
  isSuperStar: boolean;
}

interface Agency {
  _id: string;
  name: string;
  logoUrl?: string;
  creators?: any[];
}

export default function Home() {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // setUsePreferences(true); // Don't auto-filter
    }
    fetchCreators("", false);
    fetchAgencies();
    fetchStories();
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/creators/zones`);
      if (res.ok) {
        const data = await res.json();
        setZones(data);
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
        // Group stories by creator
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
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const prefsParam = applyPrefs ?? usePreferences ? "&usePreferences=true" : "";

      // Build query string
      let searchParams = new URLSearchParams();
      if (typeof search === 'string') {
        if (search) searchParams.append("location", search);
      } else {
        // It's a filter object
        if (search.name) searchParams.append("name", search.name);
        if (search.lineId) searchParams.append("lineId", search.lineId);
        if (search.gender) searchParams.append("gender", search.gender);
        if (search.province) searchParams.append("province", search.province);
        if (search.location) searchParams.append("location", search.location);
        if (search.ageMin) searchParams.append("ageMin", search.ageMin.toString());
        if (search.ageMax) searchParams.append("ageMax", search.ageMax.toString());

        if (search.heightMin) searchParams.append("heightMin", search.heightMin.toString());
        if (search.heightMax) searchParams.append("heightMax", search.heightMax.toString());
        if (search.weightMin) searchParams.append("weightMin", search.weightMin.toString());
        if (search.weightMax) searchParams.append("weightMax", search.weightMax.toString());

        if (search.chestMin) searchParams.append("chestMin", search.chestMin.toString());
        if (search.chestMax) searchParams.append("chestMax", search.chestMax.toString());
        if (search.waistMin) searchParams.append("waistMin", search.waistMin.toString());
        if (search.waistMax) searchParams.append("waistMax", search.waistMax.toString());
        if (search.hipsMin) searchParams.append("hipsMin", search.hipsMin.toString());
        if (search.hipsMax) searchParams.append("hipsMax", search.hipsMax.toString());
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
        <h1 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          <span className="text-white">LAO</span>
          <span className="text-pink-500">❤️</span>
          <span className="text-white">ANGEL</span>
        </h1>

        <div className="relative max-w-md mx-auto px-4">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-white h-14 rounded-full flex items-center px-6 cursor-pointer shadow-lg hover:scale-105 transition duration-300"
          >
            <Search className="text-[#F84E6E] mr-3" />
            <span className="text-zinc-400 font-medium">ค้นหา ชื่อ, จังหวัด, โซน, อายุ...</span>
            <button className="ml-auto bg-[#1e1b4b] text-white px-6 py-2 rounded-full font-bold text-sm">
              ค้นหา
            </button>
          </div>
        </div>
      </section>


      {/* Stories Section (Mock) */}{" "}
      <section className="mb-8 pt-4">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4">
          {stories.length === 0 ? (
            <div className="text-white/40 text-xs w-full text-center py-4">ยังไม่มีสตอรี่</div>
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
          <h2 className="text-lg font-bold border-l-4 border-[#F84E6E] pl-3">Top Agencies Lao Angel</h2>
          <Link href="/agency" className="text-xs text-pink-500 flex items-center">
            ดูทั้งหมด <ChevronRight size={14} />
          </Link>
        </div>

        {agencies.length === 0 ? (
          <div className="text-white/40 text-sm text-center py-4 bg-white/5 rounded-xl border border-white/5">
            ยังไม่มีข้อมูลสังกัด
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
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold border-l-4 border-[#F84E6E] pl-3">Superstar Lao Angel</h2>

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
              {usePreferences ? "กรองตามความชอบแล้ว" : "กรองตามความชอบ"}
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center py-20 text-white/50">Loading...</div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20 text-white/50">ยังไม่มีข้อมูลน้องๆ ในขณะนี้</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creators.map((creator) => (
              <CreatorCard key={creator._id} creator={creator} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Line Button */}
      <a href="#" className="fixed bottom-6 right-6 w-14 h-14 bg-[#06c755] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-40">
        <MessageCircle size={32} className="text-white fill-white" />
      </a>

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
          พบกับความงดงามที่น่าทึ่งในคืนนี้ได้ที่ laoangel.app
        </h2>

        {zones.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {zones.map((zone: any, i: number) => (
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
        )}
      </div>    </div >
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  // Use mock image if none (server returns generic avatar if not set, but let's be safe)
  const imageSrc = creator.user.avatarUrl
    ? getImageUrl(creator.user.avatarUrl)
    : `/mock/creators/${(parseInt(creator._id.slice(-1), 16) % 8) + 1}.png`;

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
          <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/10">{creator.location || "Bangkok"}</span>
          <span>Age {creator.age || "??"}</span>
        </div>
        <div className="mt-2 flex gap-1">
          <span className="text-[10px] bg-[#F84E6E] px-1.5 py-0.5 rounded text-white font-bold">{creator.price || "N/A"}.00.-</span>
        </div>
      </div>

      {/* Status Icons */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {creator.isHot && (
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
            <span className="text-xs">🔥</span>
          </div>
        )}
        {creator.isVerified && (
          <div className="w-7 h-7 rounded-full bg-blue-500/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
            <span className="text-[8px] font-bold">VER</span>
          </div>
        )}
      </div>
    </Link>
  )
}
