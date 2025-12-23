"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ChevronRight, Search, Menu, Send, Flame } from "lucide-react";
import { useState } from "react";

// Mock Data
const agencies = [
    { name: "Alitta Sigtongla", models: [1, 2, 3, 4, 5], location: "NA" },
    { name: "joyza14", models: [6, 7, 8, 1, 2], location: "NA" },
    { name: "รับงานเอง (Moneys)", models: [3, 4, 5, 6, 7], location: "NA" },
    { name: "Nana898911", models: [8, 1, 2, 3, 4], location: "NA" },
    { name: "boox1660", models: [5, 6, 7, 8, 1], location: "NA" },
    { name: "Nobrand👑", models: [2, 3, 4, 5, 6], location: "NA" }
];

export default function AgencyPage() {
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
                {agencies.map((agency, idx) => (
                    <div key={idx} className="flex flex-col gap-6">
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
                                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 overflow-hidden relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-slate-400">
                                        {agency.name.charAt(0)}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{agency.name}</h3>
                                <p className="text-zinc-500 text-sm">Location - {agency.location}</p>
                            </div>

                            {/* Models Horizontal Scroll */}
                            <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                                <div className="flex gap-4">
                                    {agency.models.map((modelId, i) => (
                                        <ModelCard key={i} id={modelId} index={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

function ModelCard({ id, index }: { id: number, index: number }) {
    return (
        <div className="relative w-48 h-72 rounded-xl overflow-hidden shadow-md shrink-0 group cursor-pointer bg-zinc-900">
            <Image
                src={`/mock/creators/${id % 2 === 0 ? '2' : '1'}.png`}
                alt={`Model ${id}`}
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
                    <span className="text-white font-bold truncate">น้อง{['โบว์', 'พิม', 'มายด์', 'แนน'][index % 4]}</span>
                    <span className="text-xs bg-green-600/90 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">เมืองนนทบุรี</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/80">
                    <span>อายุ {20 + (index % 5)}</span>
                    <span className="text-yellow-400 font-bold">Super Star</span>
                </div>
            </div>
        </div>
    )
}
