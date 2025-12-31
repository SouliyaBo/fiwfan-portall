"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, CheckCircle2, MoreHorizontal } from "lucide-react";
import { API_BASE_URL } from "../../lib/constants";
import { getImageUrl } from "../../lib/images";



interface Review {
    _id: string;
    creator: {
        _id?: string;
        displayName?: string;
        isVerified: boolean;
        user: {
            avatarUrl?: string;
        }
    };
    user: {
        username: string;
        avatarUrl?: string;
    };
    ratingAppearance: number;
    ratingService: number;
    ratingValue: number;
    comment: string;
    images?: string | string[];
    createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"}`}
                />
            ))}
        </div>
    );
}

export default function CheckHomeworkPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#020617] pb-20 pt-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-[#F84E6E] rounded-full"></div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-400">
                        สรุปการบ้าน
                    </h1>
                </div>

                {/* Feed List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">ยังไม่มีการบ้าน (รีวิว) ในขณะนี้</div>
                    ) : (
                        reviews.map((post) => {
                            // Parse images safely
                            let reviewImages: string[] = [];
                            if (post.images) {
                                if (Array.isArray(post.images)) {
                                    reviewImages = post.images;
                                } else {
                                    try {
                                        reviewImages = JSON.parse(post.images);
                                    } catch (e) { }
                                }
                            }

                            // Safe fallback for avatars
                            const creatorAvatar = getImageUrl(post.creator?.user?.avatarUrl);
                            const userAvatar = getImageUrl(post.user?.avatarUrl);

                            return (
                                <div key={post._id} className="bg-white dark:bg-[#1e1b4b]/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">

                                    {/* Left: Creator Info (Mobile: Top, Desktop: Left) */}
                                    <div className="relative w-full md:w-64 h-64 md:h-auto group shrink-0">
                                        <Image
                                            src={creatorAvatar}
                                            alt={post.creator?.displayName || "Creator"}
                                            fill
                                            className="object-cover transition duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                            {post.creator?.isVerified && (
                                                <span className="bg-[#F84E6E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                    VERIFIED
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <div className="font-bold text-lg">{post.creator?.displayName}</div>
                                            <Link href={post.creator?._id ? `/sideline/${post.creator._id}` : "#"} className="text-xs text-pink-300 hover:text-pink-200 hover:underline flex items-center gap-1">
                                                ดูโปรไฟล์ทั้งหมด &rarr;
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Right: Review Content */}
                                    <div className="p-5 flex-1 flex flex-col">

                                        {/* User Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                    <Image
                                                        src={userAvatar}
                                                        alt={post.user.username}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-sm dark:text-white">{post.user.username}</span>
                                                    </div>
                                                    <div className="text-xs text-zinc-400">{new Date(post.createdAt).toLocaleDateString("th-TH")}</div>
                                                </div>
                                            </div>
                                            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </div>

                                        {/* Ratings Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-zinc-50 dark:bg-black/20 p-3 rounded-lg">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500 font-medium">ตามที่แสดงในภาพ</span>
                                                <StarRating rating={post.ratingAppearance} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500 font-medium">บริการ</span>
                                                <StarRating rating={post.ratingService} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500 font-medium">คุ้มค่าเงิน</span>
                                                <StarRating rating={post.ratingValue} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                                                {post.comment}
                                            </p>

                                            {/* Images Proof */}
                                            {reviewImages.length > 0 && (
                                                <div className="flex gap-2">
                                                    {reviewImages.map((img, i) => (
                                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:opacity-80 transition cursor-pointer">
                                                            <Image
                                                                src={getImageUrl(img)}
                                                                alt="Proof"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

            </div>
        </div>
    );
}

