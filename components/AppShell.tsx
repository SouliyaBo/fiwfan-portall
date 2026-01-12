"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, MapPin, Users, Award, MessageCircle, Send, LogOut, ChevronRight, X, User } from "lucide-react";
import { API_BASE_URL } from "../lib/constants";
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken } from "../lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [telegramUrl, setTelegramUrl] = useState("");
    const [locations, setLocations] = useState<any[]>([]);
    const [zoneStats, setZoneStats] = useState<Record<string, number>>({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check path for auth page
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/auth');

    // Check login status on mount and when path changes
    useEffect(() => {
        const token = getAuthToken();
        setIsLoggedIn(!!token);
    }, [pathname]);

    // Fetch telegram link and locations
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Telegram
                try {
                    const res = await fetch(`${API_BASE_URL}/settings?key=telegram_url`);
                    const data = await res.json();
                    if (data && data.value) setTelegramUrl(data.value);
                } catch (e) { console.error(e); }

                // Locations
                try {
                    const res = await fetch(`${API_BASE_URL}/settings/locations`);
                    if (res.ok) {
                        const data = await res.json();
                        setLocations(data);
                    }
                } catch (e) { console.error(e); }

                // Zone Stats
                try {
                    const res = await fetch(`${API_BASE_URL}/creators/zones`);
                    if (res.ok) {
                        const data = await res.json();
                        // Convert array [{name, count}] to object {name: count}
                        const stats: Record<string, number> = {};
                        data.forEach((item: any) => {
                            stats[item.name] = item.count;
                        });
                        setZoneStats(stats);
                    }
                } catch (e) { console.error(e); }

            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const getLocationItems = () => {
        // Now locations are Countries -> Provinces -> Zones
        // We want Header = Country Name
        // List = Province Names
        // SubList = Zone Names
        return locations.map((country: any) => ({
            header: country.name,
            list: (country.provinces || []).map((p: any) => {
                // Calculate province count
                const provinceCount = (p.zones || []).reduce((acc: number, z: string) => acc + (zoneStats[z] || 0), 0);

                return {
                    name: p.name,
                    count: provinceCount,
                    // Map zones to objects
                    subList: (p.zones || []).map((z: string) => ({
                        name: z,
                        count: zoneStats[z] || 0
                    }))
                };
            })
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setIsSidebarOpen(false);
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-pink-500/30">

            {/* Navbar - Hide on Auth Page */}
            {!isAuthPage && (
                <nav className="fixed top-0 left-0 right-0 h-16 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-2">
                        {/* Logo */}
                        <Link href="/" className="text-2xl font-bold tracking-tight">
                            <span className="text-white">Lao</span>
                            <span className="text-[#F84E6E]">Angel</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {telegramUrl && (
                            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition">
                                <Send size={16} />
                                <span>เข้าร่วมบนโทรเลข</span>
                            </a>
                        )}
                        {!isLoggedIn && (
                            <Link href="/auth?mode=register" className="hidden md:block px-4 py-1.5 bg-[#F84E6E] hover:bg-[#d63d5b] text-white text-sm font-bold rounded-full transition shadow-[0_0_15px_rgba(248,78,110,0.3)]">
                                สมัครสมาชิก
                            </Link>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
                        >
                            <Menu size={20} className="text-white/90" />
                        </button>
                    </div>
                </nav>
            )}

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="fixed top-0 right-0 h-full w-[280px] bg-[#0f172a] z-[51] shadow-2xl p-4 flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-lg font-bold text-white/50">Menu</span>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <SidebarItemWithSubmenu
                                icon={<MapPin size={20} className="text-green-500" />}
                                label="สถานที่"
                                onNavigate={() => setIsSidebarOpen(false)}
                                items={getLocationItems()}
                            />
                            <Link href="/agency" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-lg transition">
                                <Users size={20} className="text-blue-400" />
                                <span className="font-medium">หน่วยงาน</span>
                            </Link>

                            <Link href="/leaderboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-lg transition">
                                <Award size={20} className="text-yellow-500" />
                                <span className="font-medium">ตารางจัดอันดับครับ</span>
                            </Link>

                            <Link href="/check-homework" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-lg transition">
                                <MessageCircle size={20} className="text-pink-400" />
                                <span className="font-medium">ตรวจการบ้าน</span>
                            </Link>
                            {isLoggedIn && (
                                <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-lg transition">
                                    <User size={20} className="text-[#F84E6E]" />
                                    <span className="font-medium">Profile</span>
                                </Link>
                            )}
                            {telegramUrl && (
                                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-lg transition">
                                    <Send size={20} className="text-blue-400" />
                                    <span>เข้าร่วมบนโทรเลข</span>
                                </a>
                            )}
                        </nav>

                        <div className="mt-auto border-t border-white/10 pt-6 flex flex-col gap-4">
                            {!isLoggedIn && (
                                <div className="flex gap-4">
                                    <Link href="/auth?mode=login" onClick={() => setIsSidebarOpen(false)} className="flex-1 py-2 rounded-lg border border-white/20 text-center text-sm font-medium hover:bg-white/5">
                                        Login
                                    </Link>
                                    <Link href="/auth?mode=register" onClick={() => setIsSidebarOpen(false)} className="flex-1 py-2 rounded-lg bg-white/10 text-center text-sm font-medium hover:bg-white/20">
                                        Register
                                    </Link>
                                </div>
                            )}
                            {isLoggedIn && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-white/40 text-sm hover:text-white/60 cursor-pointer"
                                >
                                    <LogOut size={16} />
                                    ออกจากระบบ
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Main Content Payload */}
            <div className={!isAuthPage ? "pt-16" : ""}>
                {children}
            </div>

        </div>
    );
}

// Updated interface to support nested zones
interface LocationItem {
    name: string;
    count: number;
    subList?: LocationItem[]; // Recursive structure for Zones
}

function SidebarItemWithSubmenu({ icon, label, items, onNavigate }: { icon: React.ReactNode, label: string, items: { header: string, list: LocationItem[] }[], onNavigate?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col">
            <button key="toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-3 text-white/80 hover:bg-white/5 rounded-lg transition w-full cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-medium">{label}</span>
                </div>
                <div className={`transition-transform md:text-white/60 ${isOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight size={16} />
                </div>
            </button>

            {isOpen && (
                <div className="pl-4 pr-2 pb-2 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                    {items.map((group, idx) => (
                        <CountryCollapsible
                            key={idx}
                            header={group.header}
                            list={group.list}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function CountryCollapsible({ header, list, onNavigate }: { header: string, list: LocationItem[], onNavigate?: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between py-2 px-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition w-full text-left cursor-pointer"
            >
                <span className="text-sm font-bold uppercase tracking-wider text-[#F84E6E]">{header}</span>
                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight size={14} className="text-white/40" />
                </div>
            </button>

            {isExpanded && (
                <div className="flex flex-col gap-1 border-l border-white/10 pl-3 ml-3 mt-1 animate-in slide-in-from-top-1 duration-150">
                    {list.map((province, i) => (
                        // If province has zones, use another collapsible, otherwise just link
                        province.subList && province.subList.length > 0 ? (
                            <ProvinceCollapsible
                                key={i}
                                province={province}
                                onNavigate={onNavigate}
                            />
                        ) : (
                            <Link key={i} href={`/?province=${province.name}`} onClick={onNavigate} className="flex items-center justify-between text-sm text-white/60 hover:text-white py-1.5 px-2 rounded hover:bg-white/5 group transition">
                                <span>{province.name}</span>
                                {province.count > 0 && (
                                    <span className="bg-white/10 text-white group-hover:bg-[#F84E6E] group-hover:text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition">
                                        {province.count}
                                    </span>
                                )}
                            </Link>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

function ProvinceCollapsible({ province, onNavigate }: { province: LocationItem, onNavigate?: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between text-sm text-white/60 hover:text-white py-1.5 px-2 rounded hover:bg-white/5 group transition w-full cursor-pointer"
            >
                <span className="">{province.name}</span>
                <div className="flex items-center gap-2">
                    {province.count > 0 && (
                        <span className="bg-white/10 text-white group-hover:bg-[#F84E6E] group-hover:text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition">
                            {province.count}
                        </span>
                    )}
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight size={12} className="text-white/40" />
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="flex flex-col gap-1 border-l border-white/10 pl-3 ml-2 mt-1 animate-in slide-in-from-top-1 duration-150">
                    {/* Link to All in Province */}
                    <Link href={`/?province=${province.name}`} onClick={onNavigate} className="text-xs text-[#F84E6E] hover:text-[#ff7590] py-1 px-2 mb-1">
                        ทั้งหมดใน {province.name}
                    </Link>

                    {province.subList?.map((zone, i) => (
                        <Link
                            key={i}
                            href={`/?province=${province.name}&location=${zone.name}`}
                            onClick={onNavigate}
                            className="flex items-center justify-between text-xs text-white/50 hover:text-white py-1 px-2 rounded hover:bg-white/5 group transition"
                        >
                            <span>{zone.name}</span>
                            {zone.count > 0 && (
                                <span className="text-[9px] text-white/30 group-hover:text-white transition">
                                    {zone.count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
