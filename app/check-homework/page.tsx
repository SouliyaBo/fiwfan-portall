"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, CheckCircle2, MoreHorizontal, X, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../lib/constants";
import { getAuthToken } from "../../lib/auth";
import { getImageUrl } from "../../lib/images";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";



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
    accuracyRating: number;
    serviceRating: number;
    valueRating: number;
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
                    className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-700 text-zinc-700"}`}
                />
            ))}
        </div>
    );
}

export default function CheckHomeworkPage() {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

    const [reportModal, setReportModal] = useState<{ isOpen: boolean, reviewId: string | null }>({ isOpen: false, reviewId: null });
    const [reportReason, setReportReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openReportModal = (reviewId: string) => {
        setReportModal({ isOpen: true, reviewId });
        setOpenMenuId(null);
    };

    const submitReport = async () => {
        if (!reportReason.trim() || !reportModal.reviewId) return;

        try {
            setIsSubmitting(true);
            const token = getAuthToken();
            if (!token) {
                toast.error("กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา");
                return;
            }

            const res = await fetch(`${API_BASE_URL}/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetType: "REVIEW",
                    targetId: reportModal.reviewId,
                    reason: reportReason
                })
            });

            if (res.ok) {
                toast.success("แจ้งลบรีวิวเรียบร้อยแล้ว แอดมินจะดำเนินการตรวจสอบโดยเร็วที่สุด");
                setReportModal({ isOpen: false, reviewId: null });
                setReportReason("");
            } else {
                const error = await res.json();
                toast.error(`เกิดข้อผิดพลาด: ${error.message || "ไม่สามารถแจ้งปัญหาได้"}`);
            }

        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] pb-20 pt-8 px-4" onClick={() => setOpenMenuId(null)}>
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-[#F84E6E] rounded-full"></div>
                    <h1 className="text-2xl font-bold text-white">
                        {t('reviews.title')}
                    </h1>
                </div>

                {/* Feed List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">{t('common.loading')}</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">{t('reviews.empty')}</div>
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
                                <div key={post._id} className="bg-[#1e1b4b]/50 rounded-2xl shadow-sm border border-white/5 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">

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
                                                <span className="bg-[#008000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                    {t('reviews.verified')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <div className="font-bold text-lg">{post.creator?.displayName}</div>
                                            <Link href={post.creator?._id ? `/sideline/${post.creator._id}` : "#"} className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#F84E6E] to-pink-600 text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/20 hover:scale-105 transition-all hover:shadow-pink-500/40 hover:from-pink-500 hover:to-[#F84E6E]">
                                                {t('reviews.view_profile')} <span className="text-lg leading-none">&rarr;</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Right: Review Content */}
                                    <div className="p-5 flex-1 flex flex-col">

                                        {/* User Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                                    <Image
                                                        src={userAvatar}
                                                        alt={post.user.username}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-sm text-white">{post.user.username}</span>
                                                    </div>
                                                    <div className="text-xs text-zinc-400">{new Date(post.createdAt).toLocaleDateString("th-TH")}</div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === post._id ? null : post._id);
                                                    }}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>

                                                {openMenuId === post._id && (
                                                    <div className="absolute right-0 top-full mt-1 bg-[#020617] border border-white/10 rounded-lg shadow-xl z-10 w-32 overflow-hidden">
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-900/20 cursor-pointer transition"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openReportModal(post._id);
                                                            }}
                                                        >
                                                            {t('reviews.report')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ratings Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-black/20 p-3 rounded-lg">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500 font-medium">{t('reviews.rating_accuracy')}</span>
                                                <StarRating rating={post.accuracyRating} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500 font-medium">{t('reviews.rating_service')}</span>
                                                <StarRating rating={post.serviceRating} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500 font-medium">{t('reviews.rating_value')}</span>
                                                <StarRating rating={post.valueRating} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                                {post.comment}
                                            </p>

                                            {/* Images Proof */}
                                            {reviewImages.length > 0 && (
                                                <div className="flex gap-2">
                                                    {reviewImages.map((img, i) => (
                                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 hover:opacity-80 transition cursor-pointer">
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
            {/* Report Modal */}
            {reportModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1e1b4b] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                <AlertTriangle className="text-red-500" /> {t('reviews.modal_title')}
                            </h3>
                            <button
                                onClick={() => setReportModal({ isOpen: false, reviewId: null })}
                                className="text-zinc-400 hover:text-zinc-200 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-zinc-300 text-sm mb-4">
                            {t('reviews.modal_desc')}
                        </p>

                        <textarea
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[120px] mb-6 resize-none"
                            placeholder={t('reviews.modal_placeholder')}
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setReportModal({ isOpen: false, reviewId: null })}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition"
                                disabled={isSubmitting}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={submitReport}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                                disabled={isSubmitting || !reportReason.trim()}
                            >
                                {isSubmitting ? t('reviews.modal_sending') : t('reviews.modal_submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

