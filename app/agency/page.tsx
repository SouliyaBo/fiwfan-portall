"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ChevronRight, Search, Menu, Send, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../lib/constants";
import { getImageUrl } from "../../lib/images";

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
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] text-zinc-900 dark:text-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-rose-600 via-pink-600 to-blue-800 text-white py-12 px-4 shadow-lg">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                            <span className="text-white">FiwFan</span>
                        </Link>
                        <div className="flex gap-4">
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm transition">
                                <Send size={18} /> เข้าร่วมบนโทรเลข
                            </button>
                            <div className="relative">
                                <input type="text" placeholder="Search" className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full placeholder-white/70 outline-none focus:bg-white/30 transition w-32 md:w-48" />
                                <Search className="absolute right-3 top-2.5 text-white/70" size={16} />
                            </div>
                            <Link href="/auth?mode=register" className="bg-[#d94459] hover:brightness-110 px-4 py-2 rounded-md font-bold shadow-md transition">
                                สมัครสมาชิก
                            </Link>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
                        พบกับเอเจนซี่ชั้นนำของ fiwfan ที่มีสาวแฟนตาซีตัวจริง!
                    </h1>
                    <p className="text-xl opacity-90 mb-4">ผู้หญิงจริง. พูดจริง. ล่อ</p>
                    <p className="text-sm opacity-80 max-w-4xl">
                        สำรวจรายชื่อโปรไฟล์สุดพิเศษในประเทศไทยที่พร้อมจะพบกับคนพิเศษ...
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-12">
                {loading ? (
                    <div className="text-center py-20 text-zinc-500">Loading agencies...</div>
                ) : agencies.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">ไม่พบข้อมูลเอเจนซี่</div>
                ) : (
                    agencies.map((agency) => (
                        <div key={agency._id} className="flex flex-col gap-6">
                            {/* Agency Header Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 bg-[#d94459] rounded-sm" />
                                    <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">{agency.name}</h2>
                                </div>
                                <button className="bg-[#0f391b] hover:bg-[#1a5c2b] text-white px-6 py-2 rounded font-medium transition shadow-sm">
                                    View All Models
                                </button>
                            </div>

                            {/* Content Row */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Agency Profile Card */}
                                <div className="w-full md:w-64 bg-white dark:bg-[#1e1b4b]/20 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                                    <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 overflow-hidden relative border-4 border-white dark:border-white/10 shadow-lg">
                                        {agency.logoUrl ? (
                                            <Image src={getImageUrl(agency.logoUrl)} alt={agency.name} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-slate-400">
                                                {agency.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{agency.name}</h3>
                                    <p className="text-zinc-500 text-sm">{agency.location || "Thailand"}</p>
                                </div>

                                {/* Models Horizontal Scroll */}
                                <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                                    <div className="flex gap-4">
                                        {agency.creators && agency.creators.length > 0 ? (
                                            agency.creators.map((creator, i) => (
                                                <ModelCard key={creator._id} creator={creator} index={i} />
                                            ))
                                        ) : (
                                            <div className="w-full h-72 flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                                ยังไม่มีน้องๆ ในสังกัด
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

function ModelCard({ creator, index }: { creator: Creator, index: number }) {
    // Determine image logic: Gallery -> Avatar -> Mock
    const imageSrc = (creator.images && creator.images.length > 0)
        ? getImageUrl(creator.images[0])
        : creator.user.avatarUrl
            ? getImageUrl(creator.user.avatarUrl)
            : `/mock/creators/${(index % 4) + 1}.png`;

    return (
        <Link href={`/sideline/${creator._id}`} className="relative w-48 h-72 rounded-xl overflow-hidden shadow-md shrink-0 group cursor-pointer bg-zinc-900">
            <Image
                src={imageSrc}
                alt={creator.displayName}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
            />

            {/* Fire Icon Badge */}
            <div className="absolute top-2 left-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
                <Flame size={18} className="text-white fill-white" />
            </div>

            {/* Overlay Content */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#020617] to-transparent pt-12 pb-3 px-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold truncate">{creator.displayName}</span>
                    <span className="text-xs bg-green-600/90 text-white px-2 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[80px]">
                        {creator.province || creator.location || "BKK"}
                    </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/80">
                    <span>อายุ {creator.age || "??"}</span>
                    <span className="text-yellow-400 font-bold">Super Star</span>
                </div>
            </div>
        </Link>
    )
}
