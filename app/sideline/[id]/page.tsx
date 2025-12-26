"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle, Star, MapPin, Share2, ArrowLeft, ChevronLeft, ChevronRight, Check, Flag, Heart, Instagram, Phone, Car, Train } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/constants";



interface CreatorDetail {
    id: string;
    userId: string;
    displayName: string;
    bio?: string;
    user: {
        username: string;
        avatarUrl?: string;
        lineId?: string;
    };
    location?: string;
    province?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    proportions?: string;
    price: number;
    services?: string[];
    interests?: string[];
    languages?: string[];
    availability?: string;
    lineId?: string;
    instagram?: string;
    phone?: string;
    transport?: string;
    parking?: boolean;
    rules?: string;
    isVerified: boolean;
    reviews: any[];
    posts: any[];
}

export default function SidelineDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [creator, setCreator] = useState<CreatorDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const mockImages = ["1.png", "2.png", "3.png", "4.png"];
    const displayImages = creator?.posts?.length
        ? creator.posts.flatMap(p => p.media.map((m: any) => m.url))
        : mockImages.map(img => `/mock/creators/${img}`);

    useEffect(() => {
        if (params.id) {
            fetchCreator(params.id as string);
        }
    }, [params.id]);

    const fetchCreator = async (id: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/creators/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCreator(data);
            } else {
                console.log("Creator not found");
            }
        } catch (error) {
            console.error("Failed to fetch creator:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#020617] text-zinc-500">Loading...</div>;
    if (!creator) return <div className="min-h-screen flex items-center justify-center text-red-500">Creator not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-zinc-900 dark:text-white pb-20">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-[#1e1b4b] text-white p-4 flex justify-between items-center shadow-md">
                <button onClick={() => router.back()}><ArrowLeft size={24} /></button>
                <div className="font-bold">{creator.displayName}</div>
                <button><Share2 size={24} /></button>
            </div>

            <div className="container mx-auto max-w-6xl p-0 md:p-6 md:pt-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: GALLERY */}
                    <div className="col-span-1 md:col-span-8 space-y-4">
                        {/* Main Image Stage */}
                        <div className="relative w-full aspect-[4/5] md:aspect-video bg-black md:rounded-3xl overflow-hidden shadow-2xl group">
                            <Image
                                src={displayImages[currentImageIndex]}
                                alt={creator.displayName}
                                fill
                                className="object-contain bg-black/50 backdrop-blur-xl"
                            />

                            {/* Nav Buttons */}
                            <button
                                onClick={() => setCurrentImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full hover:bg-white/20 transition backdrop-blur-md opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setCurrentImageIndex(prev => (prev + 1) % displayImages.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full hover:bg-white/20 transition backdrop-blur-md opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {displayImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${currentImageIndex === i ? 'border-[#F84E6E]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <Image src={img} alt="thumb" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INFO */}
                    <div className="col-span-1 md:col-span-4 px-4 md:px-0">
                        <div className="sticky top-6 space-y-6">

                            {/* Header Info */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h1 className="text-3xl font-bold">{creator.displayName}</h1>
                                        <div className="bg-[#F84E6E] text-white text-xs font-bold px-2 py-1 rounded shadow-lg shadow-pink-500/50">SUPER STAR</div>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                                        {creator.lineId && <div className="flex items-center gap-2">Line: <span className="text-zinc-900 dark:text-white font-medium">{creator.lineId}</span></div>}
                                        {creator.instagram && <div className="flex items-center gap-2"><Instagram size={14} /> Instagram: <a href={`https://instagram.com/${creator.instagram.replace('@', '')}`} target="_blank" className="text-blue-500 hover:underline">{creator.instagram}</a></div>}
                                        {creator.phone && <div className="flex items-center gap-2"><Phone size={14} /> Phone: <span className="text-zinc-900 dark:text-white font-medium">{creator.phone}</span></div>}
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="bg-zinc-100 dark:bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <MapPin size={16} className="text-red-500" />
                                        {creator.location || "โซนกรุงเทพ"}
                                    </div>
                                    {creator.transport && (
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-300 ml-6">
                                            <Train size={14} /> {creator.transport}
                                        </div>
                                    )}
                                    {creator.parking && (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 ml-6">
                                            <Car size={14} /> มีที่จอดรถพร้อมบริการ
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio & Details */}
                            <div className="space-y-4">
                                <div className="text-sm leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                                    {creator.bio ? creator.bio : "สวัสดีค่ะ ยินดีต้อนรับสู่โปรไฟล์ของฉัน 💖"}
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm text-[#F84E6E]">
                                    {creator.services?.map((s, i) => (
                                        <span key={i} className="flex items-center gap-1">💙 {s}</span>
                                    ))}
                                </div>

                                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {creator.price}.- <span className="text-sm font-normal text-zinc-400">/ 1ชม.</span>
                                </div>
                            </div>

                            {/* Promo Banner */}
                            <div className="bg-gradient-to-r from-[#F84E6E] to-[#ff758f] text-white p-3 rounded-xl text-center text-sm font-medium shadow-lg shadow-pink-500/20 card-hover">
                                ใช้โค้ด: <span className="font-bold bg-white/20 px-2 py-0.5 rounded">Fiwfan.app-25</span> เพื่อบริการที่ดีขึ้นขณะเชื่อมต่อบน LINE
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <a
                                    href={`https://line.me/ti/p/~${creator.lineId || creator.user.lineId}`}
                                    target="_blank"
                                    className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/20"
                                >
                                    <MessageCircle className="fill-white" /> {creator.lineId || creator.user.lineId || "Add Line"}
                                </a>
                                <div className="flex gap-3">
                                    <button className="flex-1 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition">
                                        <Heart size={18} /> Add to favourite
                                    </button>
                                    <button className="px-4 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-center transition">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Meta & Report */}
                            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-white/10 text-xs text-zinc-400">
                                <div className="flex items-center gap-4">
                                    <span>Views: {creator.user.lineId ? "34456" : "0"}</span>
                                    <span>Updated: Today</span>
                                </div>
                                <button className="flex items-center gap-1 hover:text-red-500 transition">
                                    <Flag size={12} /> Report Profile
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
