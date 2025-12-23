"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Star, Trophy, Users } from "lucide-react";
import { useState } from "react";

// Mock Data for Leaderboard
const leaderboardData = [
    { rank: 1, name: "Alex", role: "Member", points: 205, avatar: 3 },
    { rank: 2, name: "Daddy", role: "Member", points: 180, avatar: 4 },
    { rank: 3, name: "Killer", role: "Member", points: 150, avatar: 5 },
    { rank: 4, name: "Master", role: "Member", points: 120, avatar: 6 },
    { rank: 5, name: "ProPlayer", role: "Member", points: 110, avatar: 7 },
    { rank: 6, name: "Noob", role: "Member", points: 90, avatar: 8 },
    { rank: 7, name: "Gamer", role: "Member", points: 85, avatar: 1 },
    { rank: 8, name: "Streamer", role: "Member", points: 80, avatar: 2 },
    { rank: 9, name: "Viewer", role: "Member", points: 75, avatar: 3 },
    { rank: 10, name: "Fan", role: "Member", points: 70, avatar: 4 },
];

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<"all" | "week" | "month">("all");

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#020617] pb-20">
            {/* Gradient Header */}
            <div className="bg-gradient-to-b from-[#1e1b4b] to-[#020617] text-white pt-8 pb-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                        <Trophy className="text-yellow-400" size={32} />
                        ตารางจัดอันดับครับ
                    </h1>
                    <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                        ส่งการบ้านเพื่อลุ้นรับรางวัลและสิทธิพิเศษมากมาย
                        ยิ่งส่งมาก ยิ่งมีสิทธิ์มาก!
                    </p>

                    <div className="flex justify-center gap-4">
                        <button className="flex items-center gap-2 bg-[#d94459] hover:bg-[#b03042] text-white px-6 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105">
                            <Download size={18} /> Logo 09:16
                        </button>
                        <button className="flex items-center gap-2 bg-[#d94459] hover:bg-[#b03042] text-white px-6 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105">
                            <Download size={18} /> Logo 16:09
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="bg-white dark:bg-[#1e1b4b]/50 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-white/10 p-6">

                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="flex bg-zinc-100 dark:bg-black/40 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === "all" ? "bg-[#F84E6E] text-white shadow-md" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
                            >
                                ทั้งหมด
                            </button>
                            <button
                                onClick={() => setActiveTab("week")}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === "week" ? "bg-[#F84E6E] text-white shadow-md" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
                            >
                                สัปดาห์นี้
                            </button>
                            <button
                                onClick={() => setActiveTab("month")}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === "month" ? "bg-[#F84E6E] text-white shadow-md" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
                            >
                                เดือนนี้
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {leaderboardData.map((user, index) => (
                            <div key={index} className="flex items-center gap-4 bg-zinc-50 dark:bg-[#0f172a] p-4 rounded-xl border border-zinc-200 dark:border-white/5 hover:border-pink-500/30 transition cursor-pointer group">
                                {/* Rank Badge */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md shrink-0
                                    ${user.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                                        user.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500" :
                                            user.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800" : "bg-zinc-300 dark:bg-zinc-700"
                                    }`}
                                >
                                    {user.rank}
                                </div>

                                {/* Avatar */}
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 shadow-sm shrink-0">
                                    <Image
                                        src={`/mock/creators/${user.avatar}.png`}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg truncate dark:text-white">{user.name}</span>
                                        {/* Achievement Badge */}
                                        <div className="bg-purple-600 text-[10px] text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Star size={8} className="fill-white" />
                                            {user.points * 2}
                                        </div>
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.role}</div>
                                </div>

                                {/* Score */}
                                <div className="flex items-center gap-2 bg-orange-500/10 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-500/20">
                                    <Star size={16} className="text-orange-500 fill-orange-500" />
                                    <span className="font-bold text-orange-600 dark:text-orange-400">{user.points}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Ranking Rules Section */}
                <div className="bg-white dark:bg-[#1e1b4b]/50 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-white/10 p-6 mt-8">
                    <h2 className="text-xl font-bold mb-6 text-zinc-800 dark:text-white">จะจัดอันดับ UP ได้อย่างไร?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {[
                            { name: "มือใหม่", range: "01-99 Point", color: "text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: 100 },
                            { name: "เด็กฝึกงาน", range: "100-199 Point", color: "text-pink-400", bg: "bg-pink-100 dark:bg-pink-900/30", icon: 200 },
                            { name: "มีทักษะ", range: "200-299 Point", color: "text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: 300 },
                            { name: "ผู้เชี่ยวชาญ", range: "300-399 Point", color: "text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", icon: 400 },
                            { name: "ผลงานชิ้นเอก", range: "400-499 Point", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: 500 },
                            { name: "อาจารย์", range: "500-599 Point", color: "text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/30", icon: 600 },
                            { name: "พระสังฆราช", range: "600-699 Point", color: "text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: 700 },
                            { name: "ตำนาน", range: "700-799 Point", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", icon: 800 },
                            { name: "กึ่งเทพ", range: "800-899 Point", color: "text-fuchsia-400", bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", icon: 900 },
                            { name: "พระเจ้าที่แท้จริง", range: "900-1000+ Point", color: "text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: 1000 },
                        ].map((tier, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-[#0f172a]">
                                <div className={`w-12 h-12 rounded-full ${tier.bg} flex items-center justify-center`}>
                                    <Trophy size={24} className={tier.color} />
                                </div>
                                <div>
                                    <div className={`font-bold text-lg ${tier.color}`}>{tier.name}</div>
                                    <div className="text-zinc-500 dark:text-zinc-400 text-sm">{tier.range}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-white/10 pt-6">
                        <p className="flex gap-2">
                            <span className="text-red-500 font-bold">*</span>
                            <span>ครั้งแรก 20 คนที่จะเข้าถึงความเป็นพระเจ้าที่แท้จริงจะได้รับรางวัลพิเศษ จากกิจกรรมของเว็บไซต์</span>
                        </p>
                        <p className="flex gap-2">
                            <span className="text-red-500 font-bold">*</span>
                            <span>บันทึก: เนื่องจากการส่งภาพการบ้านที่มีโลโก้ FIWFAN จะช่วยสนับสนุนเว็บไซต์ จึงจะเป็นเกณฑ์ในการแจกรางวัลจากเว็บไซต์ในอนาคต</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
