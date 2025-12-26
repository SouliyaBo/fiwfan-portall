"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/constants";



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

export default function Home() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async (search = "") => {
    try {
      setLoading(true);
      const query = search ? `?location=${search}` : "";
      const res = await fetch(`${API_BASE_URL}/creators${query}`);
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

  const handleSearch = () => {
    fetchCreators(searchTerm);
  };

  return (
    <div className="pb-20">

      {/* Search Hero */}
      <section className="text-center py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          <span className="text-white">FIF</span>
          <span className="text-pink-500">❤️</span>
          <span className="text-white">FAN</span>
        </h1>

        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="พิมพ์โซน, จังหวัด"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-4 pr-24 rounded-full bg-white text-black outline-none border-2 border-transparent focus:border-pink-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-1 top-1 h-10 px-6 bg-[#1e1b4b] text-white rounded-full font-bold hover:bg-blue-900 transition flex items-center gap-2"
          >
            <Search size={16} /> ค้นหา
          </button>
        </div>
      </section>

      {/* Stories Section (Mock) */}
      <section className="mb-8 pt-4">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-800 border-2 border-black overflow-hidden relative">
                  <Image
                    src={`/mock/creators/${i % 2 === 0 ? '2' : '1'}.png`}
                    alt={`Story ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-white/60">User {i}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Agencies (Mock) */}
      <section className="mb-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Top Agencies Fiwfan</h2>
          <Link href="/agency" className="text-xs text-pink-500 flex items-center">
            ดูทั้งหมด <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 h-24 bg-[#1e1b4b]/50 rounded-xl border border-white/5 flex items-center p-4 gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-6 h-6 bg-yellow-500 rounded-tl-xl rounded-br-xl text-black font-bold flex items-center justify-center text-xs z-10">
                {i}
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl z-10">
                {['A', 'B', 'C'][i - 1]}
              </div>
              <div className="z-10">
                <div className="font-bold">Agency {i}</div>
                <div className="text-xs text-white/40">50+ Creators</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator Feed Grid */}
      <section className="px-4">
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

    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  // Use mock image if none (server returns generic avatar if not set, but let's be safe)
  const imageSrc = creator.user.avatarUrl || `/mock/creators/${(parseInt(creator._id.slice(-1), 16) % 8) + 1}.png`;

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
