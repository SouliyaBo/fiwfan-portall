"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle, Star, MapPin, Share2, ArrowLeft, ChevronLeft, ChevronRight, Check, Flag, Heart, Instagram, Phone, Car, Train } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/constants";
import { getImageUrl } from "../../../lib/images";
import { uploadS3File } from "../../../lib/upload";
import { toast } from 'react-toastify';
import { User, X, Image as ImageIcon } from "lucide-react";



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
    images?: string[];
    activeSubscription?: {
        planType: string;
        status: string;
    };
}

export default function SidelineDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [creator, setCreator] = useState<CreatorDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Review State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        title: "",
        rating: 5,
        accuracyRating: 5,
        serviceRating: 5,
        valueRating: 5,
        comment: "",
        images: [] as string[]
    });
    const [reviewImages, setReviewImages] = useState<File[]>([]);
    const [submittingReview, setSubmittingReview] = useState(false);

    const handleReviewSubmit = async () => {
        try {
            setSubmittingReview(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("กรุณาเข้าสู่ระบบก่อนรีวิว");
                router.push("/auth");
                return;
            }

            // Upload images
            const imageUrls: string[] = [];
            for (const file of reviewImages) {
                const url = await uploadS3File(file);
                imageUrls.push(url);
            }

            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    creatorId: creator?.id || params.id,
                    ...reviewForm,
                    images: imageUrls
                })
            });

            if (res.ok) {
                toast.success("ส่งรีวิวเรียบร้อยแล้ว");
                setIsReviewOpen(false);
                setReviewForm({ title: "", rating: 5, accuracyRating: 5, serviceRating: 5, valueRating: 5, comment: "", images: [] });
                setReviewImages([]);
                fetchCreator(params.id as string); // Refresh to see new review
            } else {
                toast.error("ส่งรีวิวไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error submitting review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const getBadgeStyle = (planType?: string) => {
        switch (planType) {
            case 'SUPER_STAR':
                return "bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-yellow-500/50";
            case 'STAR':
                return "bg-gradient-to-r from-blue-400 to-indigo-600 text-white shadow-blue-500/50";
            case 'POPULAR':
                return "bg-gradient-to-r from-teal-400 to-emerald-600 text-white shadow-teal-500/50";
            default:
                return null;
        }
    };

    const getBadgeLabel = (planType?: string) => {
        switch (planType) {
            case 'SUPER_STAR': return 'SUPER STAR';
            case 'STAR': return 'STAR';
            case 'POPULAR': return 'POPULAR';
            default: return null;
        }
    };

    const badgeStyle = getBadgeStyle(creator?.activeSubscription?.planType);
    const badgeLabel = getBadgeLabel(creator?.activeSubscription?.planType);

    const mockImages = ["1.png", "2.png", "3.png", "4.png"];

    // Priority: Gallery Images -> Post Images -> Mock
    const galleryImages = creator?.images?.map(img => getImageUrl(img)) || [];
    const postImages = creator?.posts?.flatMap(p => p.media.map((m: any) => getImageUrl(m.url))) || [];
    const availableImages = [...galleryImages, ...postImages];

    const displayImages = availableImages.length > 0
        ? availableImages
        : mockImages.map(img => `/mock/creators/${img}`);

    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchCreator(params.id as string);
            recordView(params.id as string);
            checkIfFavorited(params.id as string);
        }
    }, [params.id]);

    const recordView = async (id: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            await fetch(`${API_BASE_URL}/users/views`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ creatorId: id })
            });
        } catch (error) {
            console.error("Failed to record view", error);
        }
    };

    const checkIfFavorited = async (id: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        // Ideally we should have an endpoint to check this specific status or return it in getCreator
        // For now, let's fetch user profile to check favorites list
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                if (user.favorites && user.favorites.includes(id)) {
                    setIsFavorited(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFavorite = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("กรุณาเข้าสู่ระบบ");
            router.push("/auth");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ creatorId: creator?.id || params.id })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorited(data.isFavorited);
                toast.success(data.isFavorited ? "เพิ่มในรายการโปรดแล้ว" : "นำออกจากรายการโปรดแล้ว");
            }
        } catch (error) {
            toast.error("Error toggling favorite");
        }
    };

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
                                        {badgeLabel && (
                                            <div className={`${badgeStyle} text-xs font-bold px-2 py-1 rounded shadow-lg`}>
                                                {badgeLabel}
                                            </div>
                                        )}
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
                                    <button
                                        onClick={toggleFavorite}
                                        className={`flex-1 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${isFavorited ? 'text-[#F84E6E] border-[#F84E6E]/30 bg-[#F84E6E]/5' : ''}`}
                                    >
                                        <Heart size={18} fill={isFavorited ? "currentColor" : "none"} /> {isFavorited ? "Favourite" : "Add to favourite"}
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

            {/* REVIEWS SECTION */}
            <div className="container mx-auto max-w-4xl px-4 mt-12 mb-20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        รีวิวจากเพื่อนๆ ({creator?.reviews?.length || 0})
                    </h2>
                    <button
                        onClick={() => setIsReviewOpen(true)}
                        className="bg-[#F84E6E] hover:bg-[#d43f5b] text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-pink-500/20 transition hover:scale-105 active:scale-95"
                    >
                        + เพิ่มความคิดเห็น
                    </button>
                </div>

                <div className="space-y-6">
                    {creator?.reviews?.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-50 dark:bg-white/5 rounded-2xl text-zinc-400 border border-zinc-200 dark:border-white/5">
                            ยังไม่มีรีวิว เป็นคนแรกที่รีวิวน้องเลย!
                        </div>
                    ) : (
                        creator?.reviews?.map((review: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-[#1e1b4b]/50 backdrop-blur border border-zinc-200 dark:border-white/5 p-6 rounded-2xl shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden relative">
                                            {review.user?.avatarUrl ? (
                                                <Image src={getImageUrl(review.user.avatarUrl)} fill className="object-cover" alt="User" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-zinc-400"><User size={20} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-zinc-900 dark:text-white">{review.user?.displayName || "Anonymous"}</div>
                                            <div className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-lg">
                                        <Star size={14} className="fill-current" />
                                        <span className="font-bold">{review.rating}</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2 text-zinc-800 dark:text-zinc-200">{review.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">{review.comment}</p>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {review.images.map((img: string, idx: number) => (
                                            <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                                                <Image src={getImageUrl(img)} fill className="object-cover" alt="Review img" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Detailed Ratings (Optional display) */}
                                <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1">ตรงปก: <b className="text-zinc-700 dark:text-zinc-300">{review.accuracyRating}</b></span>
                                    <span className="flex items-center gap-1">บริการ: <b className="text-zinc-700 dark:text-zinc-300">{review.serviceRating}</b></span>
                                    <span className="flex items-center gap-1">คุ้มค่า: <b className="text-zinc-700 dark:text-zinc-300">{review.valueRating}</b></span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* REVIEW MODAL */}
            {isReviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsReviewOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-white/10 rounded-full hover:bg-zinc-200 dark:hover:bg-white/20 transition"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-6 text-center">เขียนรีวิวให้น้อง</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-zinc-300">หัวข้อรีวิว</label>
                                <input
                                    value={reviewForm.title}
                                    onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E]"
                                    placeholder="เช่น น้องน่ารักมากครับ..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "ตรงปก", key: "accuracyRating" },
                                    { label: "บริการ", key: "serviceRating" },
                                    { label: "คุ้มค่า", key: "valueRating" },
                                ].map((field) => (
                                    <div key={field.key} className="bg-zinc-50 dark:bg-white/5 p-3 rounded-xl text-center">
                                        <div className="text-xs text-zinc-500 mb-1">{field.label}</div>
                                        <div className="flex justify-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewForm({ ...reviewForm, [field.key]: star, rating: (reviewForm.rating + star) / 2 /* Approximate logic */ })}
                                                    className={`${(reviewForm as any)[field.key] >= star ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                                                >
                                                    <Star size={16} className="fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-zinc-300">ความประทับใจ</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl p-3 h-32 focus:outline-none focus:ring-2 focus:ring-[#F84E6E]"
                                    placeholder="เล่าประสบการณ์..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-zinc-300">รูปประกอบ (ถ้ามี)</label>
                                <div className="flex gap-2">
                                    <label className="w-20 h-20 flex flex-col items-center justify-center bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-300 dark:border-white/20 rounded-xl cursor-pointer hover:bg-zinc-100 transition">
                                        <ImageIcon size={20} className="text-zinc-400" />
                                        <span className="text-[10px] text-zinc-400 mt-1">Add</span>
                                        <input type="file" multiple hidden onChange={(e) => {
                                            if (e.target.files) setReviewImages(Array.from(e.target.files));
                                        }} />
                                    </label>
                                    {reviewImages.map((file, i) => (
                                        <div key={i} className="w-20 h-20 relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                                            <Image src={URL.createObjectURL(file)} fill className="object-cover" alt="prev" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleReviewSubmit}
                                disabled={submittingReview}
                                className="w-full bg-[#F84E6E] hover:bg-[#d43f5b] text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/20 mt-4 disabled:opacity-50"
                            >
                                {submittingReview ? "กำลังส่งรีวิว..." : "โพสต์รีวิว"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
