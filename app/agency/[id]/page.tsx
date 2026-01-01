"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../../lib/constants";
import { getImageUrl } from "../../../lib/images";
import { MapPin, Phone, MessageCircle, Globe, ShieldCheck, ChevronLeft, Building2 } from "lucide-react";

export default function AgencyDetailPage() {
    const params = useParams();
    const [agency, setAgency] = useState<any>(null);
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            Promise.all([
                fetchAgency(params.id as string),
                fetchZones()
            ]).finally(() => setLoading(false));
        }
    }, [params.id]);

    const fetchAgency = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/agencies/${id}`);
            if (res.ok) {
                const data = await res.json();
                setAgency(data);
            }
        } catch (error) {
            console.error("Failed to fetch agency", error);
        }
    };

    const fetchZones = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/creators/zones`);
            if (res.ok) {
                const data = await res.json();
                setZones(data);
            }
        } catch (error) {
            console.error("Failed to fetch zones", error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!agency) return <div className="min-h-screen flex items-center justify-center text-white">Agency not found</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] pb-24">

            {/* Header / Banner */}
            <div className="relative h-[250px] md:h-[350px]">
                {agency.bannerUrl ? (
                    <Image src={getImageUrl(agency.bannerUrl)} alt="Banner" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/30" />

                <Link href="/" className="absolute top-6 left-6 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition z-20">
                    <ChevronLeft size={24} />
                </Link>
            </div>

            <div className="container mx-auto max-w-5xl px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white p-1 shadow-2xl flex-shrink-0">
                        <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200">
                            {agency.logoUrl ? (
                                <Image src={getImageUrl(agency.logoUrl)} alt="Logo" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"><Building2 size={40} /></div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-white pb-2">
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                            {agency.name}
                            {agency.isVerified && <ShieldCheck className="text-blue-400" size={28} />}
                        </h1>
                        <p className="text-white/70 max-w-2xl mt-2">{agency.description || "No description provided."}</p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            {agency.location && (
                                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <MapPin size={14} className="text-[#F84E6E]" />
                                    {agency.location}
                                </div>
                            )}
                            {agency.phone && (
                                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <Phone size={14} className="text-green-400" />
                                    {agency.phone}
                                </div>
                            )}
                            {agency.lineId && (
                                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <MessageCircle size={14} className="text-green-400" />
                                    Line: {agency.lineId}
                                </div>
                            )}
                            {agency.website && (
                                <a href={agency.website} target="_blank" className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-white/20 transition">
                                    <Globe size={14} className="text-blue-400" />
                                    Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Creators Section */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold border-l-4 border-[#F84E6E] pl-3 mb-6 flex items-center gap-2 text-white">
                        โมเดลในสังกัด <span className="text-[#F84E6E]">({agency.creators?.length || 0})</span>
                    </h2>

                    {agency.creators && agency.creators.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {agency.creators.map((creator: any) => (
                                <CreatorCard key={creator._id} creator={creator} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
                            <p className="text-white/40">ยังไม่มีน้องๆ ในสังกัดนี้</p>
                        </div>
                    )}
                </div>

                {/* Zone Stats */}
                <div className="mt-8 border-t border-white/10 pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-white flex">
                        <span className="w-1 h-8 bg-[#F84E6E] rounded-full"></span>
                        พบกับความงดงามที่น่าทึ่งในคืนนี้ได้ที่ fiwfan.app
                    </h2>

                    {zones.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {zones.map((zone, i) => (
                                <Link
                                    href={`/?location=${zone.name}`}
                                    key={i}
                                    className="flex items-center gap-2 bg-white text-zinc-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition group"
                                >
                                    <span className="group-hover:text-[#F84E6E] transition">{zone.name}</span>
                                    <span className="bg-[#1e1b4b] text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold min-w-[20px] text-center group-hover:bg-[#F84E6E] transition">
                                        {zone.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CreatorCard({ creator }: { creator: any }) {
    // Logic handles populated creator object which might have nested user or direct fields depending on aggregation
    // Adjusting based on standard Creator interface used in page.tsx but robust for populated data

    // Check if image is in `images` array (from Creator schema) or `user.avatarUrl`
    // The agency population likely returns the full creator document.
    // Let's assume standard Creator structure.

    const avatar = creator.user?.avatarUrl || creator.images?.[0]; // Fallback to first gallery image if avatar missing
    const imageSrc = avatar
        ? getImageUrl(avatar)
        : `/mock/creators/${(parseInt(creator._id.slice(-1), 16) % 8) + 1}.png`;

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
                    <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/10">{creator.location || "Bangkok"}</span>
                    <span>Age {creator.age || "??"}</span>
                </div>
                <div className="mt-2 flex gap-1">
                    <span className="text-[10px] bg-[#F84E6E] px-1.5 py-0.5 rounded text-white font-bold">{creator.price || "N/A"}.00.-</span>
                </div>
            </div>
        </Link>
    )
}
