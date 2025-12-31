"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL } from "../../../lib/constants";
import { getImageUrl } from "../../../lib/images";

export default function LocationPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const locationName = slug ? decodeURIComponent(slug) : "";
    const [creators, setCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!locationName) return;
        const fetchCreators = async () => {
            setLoading(true);
            try {
                // Encode mostly handles spaces, but locationName comes from decodeURIComponent so it's clean text.
                // We pass it to query param. URLSearchParams handles encoding automatically or we just use template literal with care?
                // Template literal is fine, fetch handles basic encoding, but better safe.
                const res = await fetch(`${API_BASE_URL}/creators?location=${encodeURIComponent(locationName)}`);
                if (res.ok) {
                    const data = await res.json();
                    setCreators(data);
                }
            } catch (error) {
                console.error("Failed to fetch creators", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCreators();
    }, [locationName]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6 border-l-4 border-[#F84E6E] pl-3">
                น้องๆ ในโซน {locationName} ({creators.length})
            </h1>

            {loading ? (
                <div className="text-center py-20 text-white/50">Loading...</div>
            ) : creators.length === 0 ? (
                <div className="text-center py-20 text-white/50 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    ไม่พบน้องๆ ในโซนนี้
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {creators.map((creator) => (
                        <CreatorCard key={creator._id} creator={creator} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CreatorCard({ creator }: { creator: any }) {
    const imageSrc = creator.user?.avatarUrl
        ? getImageUrl(creator.user.avatarUrl)
        : `/mock/creators/${(parseInt((creator._id || "0").slice(-1), 16) % 8) + 1}.png`;

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
                    <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/10">{creator.province || creator.location || "Bangkok"}</span>
                    <span>Age {creator.age || "??"}</span>
                </div>
                <div className="mt-2 flex gap-1">
                    <span className="text-[10px] bg-[#F84E6E] px-1.5 py-0.5 rounded text-white font-bold">{creator.price || "N/A"}.00.-</span>
                </div>
            </div>
            {/* Status Icons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
                {creator.isHot && (
                    <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white"><span className="text-xs">🔥</span></div>
                )}
                {creator.isVerified && (
                    <div className="w-7 h-7 rounded-full bg-blue-500/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-white"><span className="text-[8px] font-bold">VER</span></div>
                )}
            </div>
        </Link>
    );
}
