"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle, Star, MapPin, Share2, ArrowLeft, ChevronLeft, ChevronRight, Check, Flag, Heart, Instagram, Phone, Car, Train, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import { API_BASE_URL } from "../../../lib/constants";
import { getImageUrl } from "../../../lib/images";
import { uploadS3File } from "../../../lib/upload";
import { toast } from 'react-toastify';
import { User, X, Image as ImageIcon } from "lucide-react";
import { getAuthToken } from "../../../lib/auth";



export interface CreatorDetail {
    id: string;
    userId: string;
    displayName: string;
    bio?: string;
    user: {
        username: string;
        avatarUrl?: string;
        lineId?: string;
    };
    lineId?: string; // Top level lineId
    location?: string;
    province?: string;
    country?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    chest?: number;
    waist?: number;
    hips?: number;
    proportions?: string;
    price: number;
    priceTime?: string;
    packages?: { price: number; time: string; details: string; }[];
    services?: string[];
    interests?: string[];
    languages?: string[];
    availability?: string;
    whatsapp?: string;
    instagram?: string;
    phone?: string;
    transport?: string;
    parking?: boolean;
    rules?: string;
    isVerified: boolean;
    reviews: any[];
    posts: any[];
    images?: string[];
    views?: number;
    createdAt?: string;
    activeSubscription?: {
        planType: string;
        status: string;
    };
    isAcceptingWork?: boolean;
}

interface SidelineClientProps {
    initialCreatorData: CreatorDetail | null;
}

export default function SidelineClient({ initialCreatorData }: SidelineClientProps) {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const [creator, setCreator] = useState<CreatorDetail | null>(initialCreatorData);
    const [loading, setLoading] = useState(!initialCreatorData);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [recommendedCreators, setRecommendedCreators] = useState<any[]>([]);

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
            const token = getAuthToken();
            if (!token) {
                toast.error(t('sideline.toast_login_review'));
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
                toast.success(t('sideline.toast_review_success'));
                setIsReviewOpen(false);
                setReviewForm({ title: "", rating: 5, accuracyRating: 5, serviceRating: 5, valueRating: 5, comment: "", images: [] });
                setReviewImages([]);
                fetchCreator(params.id as string); // Refresh to see new review
            } else {
                toast.error(t('sideline.toast_review_failed'));
            }
        } catch (error) {
            console.error(error);
            toast.error("Error submitting review");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Report State
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isReporting, setIsReporting] = useState(false);

    const handleReport = async () => {
        try {
            setIsReporting(true);
            const token = getAuthToken();
            if (!token) {
                toast.error(t('sideline.toast_login_report'));
                router.push("/auth");
                return;
            }

            const res = await fetch(`${API_BASE_URL}/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    targetType: "CREATOR",
                    targetId: creator?.id || params.id,
                    reason: reportReason,
                    description: reportDescription
                })
            });

            if (res.ok) {
                toast.success(t('sideline.toast_report_success'));
                setIsReportOpen(false);
                setReportReason("");
                setReportDescription("");
            } else {
                toast.error(t('sideline.toast_report_failed'));
            }
        } catch (error) {
            toast.error("Error submitting report");
        } finally {
            setIsReporting(false);
        }
    };

    const getBadgeStyle = (planType?: string) => {
        switch (planType) {
            case 'THE_ANGEL':
                return "bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-yellow-500/50";
            case 'POPULAR':
                return "bg-gradient-to-r from-teal-400 to-emerald-600 text-white shadow-teal-500/50";
            case 'RISING_STAR':
                return "bg-gradient-to-r from-blue-400 to-indigo-600 text-white shadow-blue-500/50";
            default:
                return null;
        }
    };

    const getBadgeLabel = (planType?: string) => {
        switch (planType) {
            case 'THE_ANGEL': return t('plan_names.THE_ANGEL');
            case 'POPULAR': return t('plan_names.POPULAR');
            case 'RISING_STAR': return t('plan_names.RISING_STAR');
            default: return null;
        }
    };

    const badgeStyle = getBadgeStyle(creator?.activeSubscription?.planType);
    const badgeLabel = getBadgeLabel(creator?.activeSubscription?.planType);


    // Priority: Avatar -> Gallery Images -> Post Images
    const avatarImage = creator?.user?.avatarUrl ? [getImageUrl(creator.user.avatarUrl)] : [];
    const galleryImages = creator?.images?.map(img => getImageUrl(img)) || [];
    const postImages = creator?.posts?.flatMap(p => p.media.map((m: any) => getImageUrl(m.url))) || [];
    const availableImages = [...avatarImage, ...galleryImages, ...postImages];

    const displayImages = availableImages.length > 0
        ? availableImages
        : ['/default-avatar.png'];

    const [isFavorited, setIsFavorited] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [zones, setZones] = useState<any[]>([]);

    useEffect(() => {
        if (params?.id) {
            if (!creator || creator.id !== params.id) {
                fetchCreator(params.id as string);
            } else {
                // Even if we have creator data, we should fetch recommended as it's not passed in yet
                // Or we can opt to fetch everything if we really want to be fresh. 
                // But for simplicity let's just fetch recommended if we already have creator.
                fetchRecommended(params.id as string);
                recordView(params.id as string);
                checkIfFavorited(params.id as string);
            }
        }
        fetchZones();
    }, [params?.id]); // Note: depending on navigation logic, initialCreatorData might not change if layout segment stays same. But params.id will.

    const fetchZones = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/creators/zones`);
            if (res.ok) {
                const data = await res.json();
                // Group by country
                const grouped: any = {};
                data.forEach((z: any) => {
                    const c = z.country || "Thailand";
                    if (!grouped[c]) grouped[c] = [];
                    grouped[c].push(z);
                });
                setZones(Object.entries(grouped).map(([country, items]) => ({ country, items })));
            }
        } catch (error) {
            console.error("Failed to fetch zones", error);
        }
    };

    const recordView = async (id: string) => {
        const token = getAuthToken();
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
        const token = getAuthToken();
        if (!token) return;
        // Ideally we should have an endpoint to check this specific status or return it in getCreator
        // For now, let's fetch user profile to check favorites list
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                setCurrentUser(user);
                if (user.favorites && user.favorites.includes(id)) {
                    setIsFavorited(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFavorite = async () => {
        const token = getAuthToken();
        if (!token) {
            toast.error(t('sideline.toast_login_favorite'));
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
                toast.success(data.isFavorited ? t('sideline.toast_favorite_added') : t('sideline.toast_favorite_removed'));
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
                // Also fetch recommended
                fetchRecommended(id);
                // Also record view and check favorite when fully fetching
                recordView(id);
                checkIfFavorited(id);
            } else {
                console.log("Creator not found");
            }
        } catch (error) {
            console.error("Failed to fetch creator:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommended = async (excludeId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/creators/recommended?excludeId=${excludeId}`);
            if (res.ok) {
                const data = await res.json();
                // Filter out creators who don't have an active plan/subscription
                const activeCreators = data.filter((c: any) =>
                    c.activeSubscription?.status === 'ACTIVE' ||
                    (c.isVerified && c.activeSubscription) // Fallback: if verified and has sub object
                );
                setRecommendedCreators(activeCreators);
            }
        } catch (error) {
            console.error("Error fetching recommended creators:", error);
        }
    };

    const handleShare = async () => {
        if (!creator) return;
        const shareData = {
            title: `Phusao - ${creator.displayName}`,
            text: t('sideline.share_title').replace('{name}', creator.displayName),
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success(t('sideline.toast_link_copied'));
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };
    console.log("creator: ", creator)

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#020617] text-zinc-500">{t('sideline.loading')}</div>;
    if (!creator) return <div className="min-h-screen flex items-center justify-center text-red-500">{t('sideline.creator_not_found')}</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-[#1e1b4b] text-white p-4 flex justify-between items-center shadow-md">
                <button onClick={() => router.back()} className="cursor-pointer"><ArrowLeft size={24} /></button>
                <div className="font-bold">{creator.displayName}</div>
                <button onClick={handleShare} className="cursor-pointer"><Share2 size={24} /></button>
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
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full hover:bg-white/20 transition backdrop-blur-md cursor-pointer"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setCurrentImageIndex(prev => (prev + 1) % displayImages.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full hover:bg-white/20 transition backdrop-blur-md cursor-pointer"
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
                                    className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition cursor-pointer ${currentImageIndex === i ? 'border-[#F84E6E]' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
                                        <div className="flex flex-col">
                                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                                {creator.displayName}
                                                {creator.isAcceptingWork !== false ? (
                                                    <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1 font-bold tracking-wider uppercase">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                        Open
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1 font-bold tracking-wider uppercase">
                                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                        Busy
                                                    </span>
                                                )}
                                            </h1>
                                        </div>
                                        {badgeLabel && (
                                            <div className={`${badgeStyle} text-xs font-bold px-2 py-1 rounded shadow-lg`}>
                                                {badgeLabel}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                                        {creator.whatsapp && <div className="flex items-center gap-2">{t('sideline.whatsapp_label')} <span className="text-zinc-900 dark:text-white font-medium">{creator.whatsapp}</span></div>}
                                        {creator.instagram && <div className="flex items-center gap-2"><Instagram size={14} /> {t('sideline.instagram_label')} <a href={`https://instagram.com/${creator.instagram.replace('@', '')}`} target="_blank" className="text-blue-500 hover:underline">{creator.instagram}</a></div>}
                                        {creator.phone && <div className="flex items-center gap-2"><Phone size={14} /> {t('sideline.phone_label')} <span className="text-zinc-900 dark:text-white font-medium">{creator.phone}</span></div>}
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <MapPin size={16} className="text-red-500" />
                                        {creator.location === "" ? creator.province || "ไม่ระบุ" : creator.location}, {creator.province}, {creator.country || "Thailand"}
                                    </div>
                                    {creator.transport && (
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-300 ml-6">
                                            <Train size={14} /> {creator.transport}
                                        </div>
                                    )}
                                    {creator.parking && (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 ml-6">
                                            <Car size={14} /> {t('sideline.parking_available')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio & Details */}
                            <div className="space-y-4">
                                <div className="text-sm leading-relaxed whitespace-pre-line text-white">
                                    {creator.bio ? creator.bio : t('sideline.default_bio')}
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm text-[#F84E6E]">
                                    {creator.services?.map((s, i) => (
                                        <span key={i} className="flex items-center gap-1">💙 {s}</span>
                                    ))}
                                </div>

                                {/* Physical Stats */}
                                {(creator.height || creator.weight || creator.chest || creator.waist || creator.hips) && (
                                    <div className="bg-white/5 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm border border-white/5">
                                        {creator.height && (
                                            <div className="flex justify-between items-center text-zinc-400">
                                                <span>{t('sideline.height')}</span>
                                                <span className="text-white font-bold">{creator.height} cm</span>
                                            </div>
                                        )}
                                        {creator.weight && (
                                            <div className="flex justify-between items-center text-zinc-400">
                                                <span>{t('sideline.weight')}</span>
                                                <span className="text-white font-bold">{creator.weight} kg</span>
                                            </div>
                                        )}
                                        {creator.chest && (
                                            <div className="flex justify-between items-center text-zinc-400">
                                                <span>{t('sideline.chest')}</span>
                                                <span className="text-white font-bold">{creator.chest}"</span>
                                            </div>
                                        )}
                                        {creator.waist && (
                                            <div className="flex justify-between items-center text-zinc-400">
                                                <span>{t('sideline.waist')}</span>
                                                <span className="text-white font-bold">{creator.waist}"</span>
                                            </div>
                                        )}
                                        {creator.hips && (
                                            <div className="flex justify-between items-center text-zinc-400">
                                                <span>{t('sideline.hips')}</span>
                                                <span className="text-white font-bold">{creator.hips}"</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="text-xl font-bold text-white">
                                    {creator.price}.- <span className="text-sm font-normal text-zinc-400">/ {creator.priceTime || '1 ชม.'} ({t('sideline.start_price')})</span>
                                </div>

                                {/* Service Packages */}
                                {creator.packages && creator.packages.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-white/10 mt-2">
                                        <h4 className="text-xs font-bold text-zinc-400 uppercase">{t('sideline.recommended_package')}</h4>
                                        <div className="space-y-3">
                                            {creator.packages.map((pkg, idx) => (
                                                <div key={idx} className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                                                    {/* Checkmark Circle */}
                                                    <div className="w-10 h-10 rounded-full bg-[#F84E6E]/20 flex items-center justify-center text-[#F84E6E] flex-shrink-0">
                                                        <Check size={20} strokeWidth={3} />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-white flex flex-wrap items-center gap-2 align-middle">
                                                            <span className="text-[#F84E6E]">{pkg.price}</span>
                                                            <span className="text-zinc-400 text-base">/</span>
                                                            {pkg.details && (
                                                                <>
                                                                    <span>{pkg.details}</span>
                                                                    <span className="text-zinc-400 text-base">/</span>
                                                                </>
                                                            )}
                                                            <span>{pkg.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Promo Banner */}
                            {/* <div className="bg-gradient-to-r from-[#F84E6E] to-[#ff758f] text-white p-3 rounded-xl text-center text-sm font-medium shadow-lg shadow-pink-500/20 card-hover">
                                使用โค้ด: <span className="font-bold bg-white/20 px-2 py-0.5 rounded">Phusao</span> เพื่อบริการที่ดีขึ้นขณะเชื่อมต่อบน LINE
                            </div> */}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <a
                                    href={`https://wa.me/${(creator.whatsapp || "").replace(/[^0-9]/g, '').replace(/^0/, '856')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/20 cursor-pointer"
                                >
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    {creator.whatsapp ? `${t('sideline.whatsapp_label')} ${creator.whatsapp}` : "WhatsApp"}
                                </a>

                                {creator.lineId && (
                                    <a
                                        href={`https://line.me/ti/p/~${creator.lineId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#06C755] hover:bg-[#05b54d] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/20 cursor-pointer"
                                    >
                                        <MessageCircle size={24} className="text-white" />
                                        Line: {creator.lineId}
                                    </a>
                                )}
                                <div className="flex gap-3">
                                    {currentUser?.role !== 'CREATOR' && (
                                        <button
                                            onClick={toggleFavorite}
                                            className={`flex-1 border border-white/10 hover:bg-white/5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer ${isFavorited ? 'text-[#F84E6E] border-[#F84E6E]/30 bg-[#F84E6E]/5' : ''}`}
                                        >
                                            <Heart size={18} fill={isFavorited ? "currentColor" : "none"} /> {isFavorited ? t('sideline.favourite') : t('sideline.add_favorite')}
                                        </button>
                                    )}
                                    {/* <button className="px-4 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-center transition cursor-pointer">
                                        <Share2 size={18} />
                                    </button> */}
                                </div>
                            </div>

                            {/* Meta & Report */}
                            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-white/10 text-xs text-zinc-400">
                                <div className="flex items-center gap-4">
                                    <span>{t('sideline.views')}: {creator.views || 0}</span>
                                    <span>{t('sideline.joined')}: {creator.createdAt ? new Date(creator.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US') : '-'}</span>
                                </div>
                                <button onClick={() => setIsReportOpen(true)} className="flex items-center gap-1 hover:text-red-500 transition cursor-pointer">
                                    <Flag size={12} /> {t('sideline.report_profile')}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="container mx-auto max-w-4xl px-4 mt-12 mb-20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                        <Star className="text-yellow-400 fill-yellow-400 w-5 h-5 md:w-6 md:h-6" />
                        {t('sideline.reviews_title')} ({creator?.reviews?.length || 0})
                    </h2>
                    <button
                        onClick={() => setIsReviewOpen(true)}
                        className="bg-[#F84E6E] hover:bg-[#d43f5b] text-white px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base rounded-full font-bold shadow-lg shadow-pink-500/20 transition hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                        {t('sideline.add_review')}
                    </button>
                </div>

                <div className="space-y-6">
                    {creator?.reviews?.length === 0 ? (
                        <div className="text-center py-10 bg-white/5 rounded-2xl text-zinc-400 border border-white/5">
                            {t('sideline.no_reviews')}
                        </div>
                    ) : (
                        creator?.reviews?.map((review: any, i: number) => (
                            <div key={i} className="bg-[#1e1b4b]/50 backdrop-blur border border-white/5 p-6 rounded-2xl shadow-sm">
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
                                            <div className="font-bold text-sm text-white">{review.user?.displayName || t('sideline.review_anonymous')}</div>
                                            <div className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-lg">
                                        <Star size={14} className="fill-current" />
                                        <span className="font-bold">{review.rating}</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2 text-white">{review.title}</h3>
                                <p className="text-zinc-300 text-sm leading-relaxed mb-4">{review.comment}</p>

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
                                    <span className="flex items-center gap-1">{t('sideline.review_rating_accuracy')}: <b className="text-zinc-700 dark:text-zinc-300">{review.accuracyRating}</b></span>
                                    <span className="flex items-center gap-1">{t('sideline.review_rating_service')}: <b className="text-zinc-700 dark:text-zinc-300">{review.serviceRating}</b></span>
                                    <span className="flex items-center gap-1">{t('sideline.review_rating_value')}: <b className="text-zinc-700 dark:text-zinc-300">{review.valueRating}</b></span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recommended Section */}
                {recommendedCreators.length > 0 && (
                    <div className="mt-20 mb-10">
                        <div className="flex items-center gap-2 mb-8 border-l-4 border-[#F84E6E] pl-4">
                            <h2 className="text-2xl font-bold dark:text-white">{t('sideline.discover_more')}</h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {recommendedCreators.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => {
                                        router.push(`/sideline/${item._id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="group bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-[#F84E6E]/50 transition duration-300 cursor-pointer shadow-sm hover:shadow-xl"
                                >
                                    <div className="aspect-[3/4] relative bg-white/5">
                                        {(item.images?.[0] || item.user?.avatarUrl) ? (
                                            <Image
                                                src={getImageUrl(item.images?.[0] || item.user?.avatarUrl)}
                                                fill
                                                className="object-cover group-hover:scale-110 transition duration-500"
                                                alt={item.displayName}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={40} className="text-zinc-300" />
                                            </div>
                                        )}

                                        {/* Status Badges Overlay */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                                <Zap size={14} fill="currentColor" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-3 left-3">
                                            <div className="bg-green-500 rounded-full p-1 border-2 border-white shadow-lg">
                                                <Check size={12} className="text-white" strokeWidth={4} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-white truncate group-hover:text-[#F84E6E] transition">{item.displayName}</h3>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                            <MapPin size={10} />
                                            {item.province || t('sideline.bangkok')}, {item.country || "Thailand"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* REVIEW MODAL */}
            {
                isReviewOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f172a] w-full max-w-lg rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setIsReviewOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-white/10 rounded-full hover:bg-zinc-200 dark:hover:bg-white/20 transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-bold mb-6 text-center">{t('sideline.modal_review_title')}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-300">{t('sideline.review_topic')}</label>
                                    <input
                                        value={reviewForm.title}
                                        onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-white"
                                        placeholder={t('sideline.review_topic_placeholder')}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: t('sideline.review_rating_accuracy'), key: "accuracyRating" },
                                        { label: t('sideline.review_rating_service'), key: "serviceRating" },
                                        { label: t('sideline.review_rating_value'), key: "valueRating" },
                                    ].map((field) => (
                                        <div key={field.key} className="bg-zinc-50 dark:bg-white/5 p-3 rounded-xl text-center">
                                            <div className="text-xs text-zinc-500 mb-1">{field.label}</div>
                                            <div className="flex justify-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setReviewForm({ ...reviewForm, [field.key]: star, rating: (reviewForm.rating + star) / 2 /* Approximate logic */ })}
                                                        className={`cursor-pointer ${(reviewForm as any)[field.key] >= star ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                                                    >
                                                        <Star size={16} className="fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-300">{t('sideline.review_impression')}</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 h-32 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-white"
                                        placeholder={t('sideline.review_impression_placeholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-zinc-300">{t('sideline.review_images')}</label>
                                    <div className="flex gap-2">
                                        <label className="w-20 h-20 flex flex-col items-center justify-center bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-300 dark:border-white/20 rounded-xl cursor-pointer hover:bg-zinc-100 transition">
                                            <ImageIcon size={20} className="text-zinc-400" />
                                            <span className="text-[10px] text-zinc-400 mt-1">{t('sideline.review_add_image')}</span>
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
                                    className="w-full bg-[#F84E6E] hover:bg-[#d43f5b] text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/20 mt-4 disabled:opacity-50 cursor-pointer"
                                >
                                    {submittingReview ? t('sideline.review_submitting') : t('sideline.review_submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* REPORT MODAL */}
            {
                isReportOpen && (
                    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e1b4b] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Flag className="text-[#F84E6E]" /> {t('sideline.modal_report_title')}
                                </h3>
                                <button onClick={() => setIsReportOpen(false)} className="text-zinc-400 hover:text-white transition">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">{t('sideline.report_topic')}</label>
                                    <select
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-[#F84E6E]"
                                    >
                                        <option value="">{t('sideline.report_select_topic')}</option>
                                        <option value="Inappropriate Content">{t('sideline.report_reason_inappropriate')}</option>
                                        <option value="Fake Profile">{t('sideline.report_reason_fake')}</option>
                                        <option value="Harassment">{t('sideline.report_reason_harassment')}</option>
                                        <option value="Spam">{t('sideline.report_reason_spam')}</option>
                                        <option value="Other">{t('sideline.report_reason_other')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">{t('sideline.report_details')}</label>
                                    <textarea
                                        value={reportDescription}
                                        onChange={(e) => setReportDescription(e.target.value)}
                                        rows={4}
                                        placeholder={t('sideline.report_details_placeholder')}
                                        className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-[#F84E6E] min-h-[100px]"
                                    />
                                </div>

                                <button
                                    onClick={handleReport}
                                    disabled={!reportReason || isReporting}
                                    className="w-full bg-[#F84E6E] hover:bg-[#d43f5b] text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {isReporting ? t('sideline.report_submitting') : t('sideline.report_submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Zone Stats */}
            <div className="mt-8 border-t border-white/10 pt-8 px-4">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <span className="w-1 h-8 bg-[#F84E6E] rounded-full"></span>
                    {t('home.zone_title')}
                </h2>

                {zones.length > 0 && (
                    <div className="space-y-4">
                        {zones.map((group: any) => (
                            <div key={group.country} className="space-y-2">
                                <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider text-center">{group.country}</h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {group.items.map((zone: any, i: number) => (
                                        <Link
                                            href={`/location/${zone.name}`}
                                            key={i}
                                            className="flex items-center gap-2 bg-[#1e1b4b] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition group border border-white/10"
                                        >
                                            <span className="group-hover:text-[#F84E6E] transition">{zone.name}</span>
                                            <span className="bg-[#1e1b4b] text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold min-w-[20px] text-center group-hover:bg-[#F84E6E] transition">
                                                {zone.count}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

