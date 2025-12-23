"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle, Star, MapPin, Share2, ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://localhost:3001";

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
    proportions?: string;
    price: number;
    services?: string;
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

    // Mock images fallback if no posts
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
            const res = await fetch(`${API_URL}/creators/${id}`);
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

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!creator) return <div className="min-h-screen flex items-center justify-center text-white">Creator not found (Mock data recommended if DB is empty)</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] pb-24">
            {/* Navbar */}
            <div className="sticky top-0 z-50 bg-[#1e1b4b] text-white p-4 shadow-md flex items-center justify-between">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
                    <ArrowLeft size={24} />
                </button>
                <span className="font-bold text-lg">{creator.displayName || creator.user.username}</span>
                <button className="p-2 hover:bg-white/10 rounded-full transition">
                    <Share2 size={24} />
                </button>
            </div>

            {/* Image Gallery */}
            <div className="relative w-full aspect-[3/4] max-h-[600px] bg-black">
                <Image
                    src={displayImages[currentImageIndex]}
                    alt={creator.displayName || "Creator"}
                    fill
                    className="object-contain"
                />

                {/* Navigation Arrows */}
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
                    <ChevronRight size={24} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition ${i === currentImageIndex ? "bg-white scale-125" : "bg-white/50"}`}
                        />
                    ))}
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 py-6">
                {/* Header Info */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{creator.displayName}</h1>
                            <span className="bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-[#020617]"></span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} /> {creator.location || creator.province || "Thailand"}
                            </span>
                            <span>•</span>
                            <span>อายุ {creator.age || "??"}</span>
                            <span>•</span>
                            <span>{creator.proportions || "N/A"}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-[#F84E6E]">{creator.price || "N/A"}.-</div>
                        <div className="text-xs text-zinc-400">เริ่มต้น</div>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {["ยืนยันตัวตนแล้ว", "ฉีดวัคซีนแล้ว", "ตรวจสุขภาพแล้ว"].map((text, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
                            <Check size={12} /> {text}
                        </div>
                    ))}
                </div>

                {/* Description */}
                <div className="bg-zinc-50 dark:bg-[#1e1b4b]/30 rounded-2xl p-6 mb-8 border border-zinc-100 dark:border-white/5">
                    <h3 className="font-bold mb-4 text-zinc-900 dark:text-white">เกี่ยวกับฉัน</h3>
                    <div className="prose dark:prose-invert text-sm whitespace-pre-line text-zinc-600 dark:text-zinc-300">
                        {creator.bio || creator.services || "No description provided."}
                        {creator.rules && (
                            <>
                                <br /><br />
                                <strong>❌ ข้อห้าม</strong><br />
                                {creator.rules}
                            </>
                        )}
                    </div>
                </div>

                {/* Reviews Preview */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg dark:text-white">รีวิวล่าสุด ({creator.reviews?.length || 0})</h3>
                        <Link href="#" className="text-[#F84E6E] text-sm hover:underline">ดูทั้งหมด</Link>
                    </div>
                    {creator.reviews?.length > 0 ? (
                        <div className="space-y-4">
                            {creator.reviews?.map((review: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-[#1e1b4b]/50 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm dark:text-white">{review.user.username}</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} size={12} className={j < (review.ratingValue || 5) ? "fill-current" : "text-zinc-300 dark:text-zinc-600"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">ยังไม่มีรีวิว</p>
                    )}

                    <button className="w-full mt-4 py-3 bg-[#1e1b4b] text-white rounded-xl font-bold text-sm hover:bg-[#2d2a6e] transition">
                        เขียนรีวิวให้น้อง {creator.displayName}
                    </button>
                </div>

                {/* Recommendations (Static for now) */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">ค้นพบคู่ที่ยอดเยี่ยมครั้งต่อไปของคุณ 🔥</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Mock Recommendations */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-200">
                                <Image
                                    src={`/mock/creators/${(i % 8) + 1}.png`}
                                    alt="Rec"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white">
                                    <div className="font-bold">Model {i}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#020617] border-t border-zinc-200 dark:border-white/10 flex items-center gap-3 z-50">
                <button className="flex-1 bg-[#06c755] text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-105 transition shadow-lg shadow-green-500/20">
                    <MessageCircle className="fill-white" />
                    Line: {creator.user.lineId || "N/A"}
                </button>
                <button className="flex-1 bg-gradient-to-r from-[#F84E6E] to-[#d94459] text-white py-3 rounded-full font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 transition">
                    จองคิวทันที
                </button>
            </div>
        </div>
    );
}
