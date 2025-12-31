"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "../../lib/images";
import { uploadS3File } from "../../lib/upload";
import { API_BASE_URL } from "../../lib/constants";
import { toast } from 'react-toastify';

import { LogOut, Plus, Image as ImageIcon, Send, Edit, Save, Upload, MapPin, Ruler, DollarSign, User as UserIcon, Phone, Instagram, Hash, Car, Train, Check, MoreHorizontal, Heart, MessageCircle, Share2, Camera, Trash2, Users, Building, ShieldCheck, Zap, Star, Eye, ChevronRight, ChevronLeft, Settings, Scissors } from "lucide-react";

// Checkbox Component for easy selection
const CheckboxField = ({ label, checked, onChange, icon: Icon }: any) => (
    <div
        onClick={() => onChange(!checked)}
        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${checked ? 'bg-[#F84E6E]/10 border-[#F84E6E] text-[#F84E6E]' : 'bg-black/20 border-white/10 text-white/70 hover:bg-white/5'}`}
    >
        <div className={`w-5 h-5 rounded flex items-center justify-center border ${checked ? 'bg-[#F84E6E] border-[#F84E6E]' : 'border-white/30'}`}>
            {checked && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
            {Icon && <Icon size={16} />}
            {label}
        </div>
    </div>
);

// Input Component
const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/70 ml-1 flex items-center gap-1">
            {Icon && <Icon size={12} />} {label}
        </label>
        <div className="relative">
            {Icon && <Icon size={16} className="absolute left-3 top-3 text-white/50" />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 ${Icon ? 'pl-10' : ''} text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent transition text-sm`}
            />
        </div>
    </div>
);

// --- AGENCY DASHBOARD COMPONENT ---
const AgencyDashboard = ({ user, onLogout }: any) => {
    const [agency, setAgency] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: "",
        description: "",
        location: "",
        lineId: "",
        phone: "",
        website: "",
        province: "",
        zones: [] as string[]
    });
    const [availableLocations, setAvailableLocations] = useState<any[]>([]);
    const [availableZones, setAvailableZones] = useState<string[]>([]);

    useEffect(() => {
        fetchLocations();
        fetchMyAgency();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/settings/locations`);
            if (res.ok) {
                const data = await res.json();
                setAvailableLocations(data);
            }
        } catch (error) {
            console.error("Failed to fetch locations");
        }
    };

    const fetchMyAgency = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/agencies/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAgency(data);
                setForm({
                    name: data.name || "",
                    description: data.description || "",
                    location: data.location || "",
                    lineId: data.lineId || "",
                    phone: data.phone || "",
                    website: data.website || "",
                    province: data.province || "",
                    zones: data.zones || []
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/agencies/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                setAgency(updated);
                setIsEditing(false);
                toast.success("บันทึกข้อมูลสำเร็จ");
            }
        } catch (error) {
            toast.error("บันทึกไม่สำเร็จ");
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        try {
            const url = await uploadS3File(e.target.files[0]);
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE_URL}/agencies/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ bannerUrl: url })
            });
            setAgency({ ...agency, bannerUrl: url });
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        try {
            const url = await uploadS3File(e.target.files[0]);
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE_URL}/agencies/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ logoUrl: url })
            });
            setAgency({ ...agency, logoUrl: url });
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    const submitKYC = async () => {
        if (!confirm("ยืนยันการส่งเอกสารตรวจสอบตัวตน (จำลอง)?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/agencies/me/kyc`, {
                method: "POST", headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const updated = await res.json();
                setAgency(updated);
                toast.info("ส่งเรื่องตรวจสอบแล้ว รอแอดมินอนุมัติ");
            }
        } catch (e) { toast.error("Error"); }
    };

    if (loading) return <div>Loading Agency...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] pb-24">
            {/* Header / Banner */}
            <div className="bg-[#1e1b4b] text-white p-6 pb-8 rounded-b-[40px] shadow-2xl mb-8 relative overflow-hidden h-[300px]">
                {agency?.bannerUrl ? (
                    <div className="absolute inset-0 w-full h-full z-0">
                        <Image src={getImageUrl(agency.bannerUrl)} alt="Banner" fill className="object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-50" />
                )}

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold flex items-center gap-2"><Building size={20} /> Agency Manager</h1>
                        <button onClick={onLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="flex items-end gap-6 pb-4">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 relative group cursor-pointer shadow-lg">
                            <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden relative">
                                {agency?.logoUrl ? (
                                    <Image src={getImageUrl(agency.logoUrl)} fill className="object-cover" alt="Logo" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs cursor-pointer">
                                    เปลี่ยนโลโก้
                                    <input type="file" hidden onChange={handleLogoUpload} />
                                </label>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                {agency?.name || "ตั้งชื่อสังกัดของคุณ"}
                                {agency?.isVerified && <ShieldCheck className="text-blue-400" size={24} />}
                            </h2>
                            <p className="text-white/80 max-w-lg truncate">{agency?.description || "ใส่คำอธิบายสังกัด..."}</p>
                        </div>
                        {/* Edit Cover Trigger */}
                        <label className="absolute top-6 right-16 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs cursor-pointer backdrop-blur transition">
                            เปลี่ยนปก
                            <input type="file" hidden onChange={handleBannerUpload} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-4">สถิติสังกัด</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-white"><Users size={16} /> เด็กในสังกัด</span>
                                    <span className="font-bold text-2xl text-[#F84E6E]">{agency?.creators?.length || 0}</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} /> แก้ไขข้อมูลร้าน
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {isEditing ? (
                            <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Edit className="text-[#F84E6E]" /> แก้ไขข้อมูลสังกัด</h3>
                                <div className="space-y-4">
                                    <InputField label="ชื่อสังกัด" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-white/70 ml-1">คำอธิบาย</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] min-h-[100px]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/70 ml-1">จังหวัด</label>
                                        <select
                                            value={form.province}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                setForm({ ...form, province: prov, zones: [] });
                                                const selectedLoc = availableLocations.find((l: any) => l.name === prov);
                                                setAvailableZones(selectedLoc ? selectedLoc.zones : []);
                                            }}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                        >
                                            <option value="">เลือกจังหวัด</option>
                                            {availableLocations.map((loc: any) => (
                                                <option key={loc.id} value={loc.name}>{loc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField label="Line ID" value={form.lineId} onChange={(e: any) => setForm({ ...form, lineId: e.target.value })} icon={Hash} />
                                </div>

                                {/* Zone Selection (Multi-select) */}
                                {form.province && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-white/70 ml-1">โซนที่คุณรับงาน (เลือกได้หลายโซน)</label>
                                        <div className="p-4 bg-black/20 rounded-xl border border-white/10 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {availableZones.length > 0 ? availableZones.map((zone) => (
                                                <div
                                                    key={zone}
                                                    onClick={() => {
                                                        const currentZones = form.zones || [];
                                                        if (currentZones.includes(zone)) {
                                                            setForm({ ...form, zones: currentZones.filter(z => z !== zone) });
                                                        } else {
                                                            setForm({ ...form, zones: [...currentZones, zone] });
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition text-center border ${form.zones?.includes(zone) ? 'bg-[#F84E6E] border-[#F84E6E] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                                                >
                                                    {zone}
                                                </div>
                                            )) : (
                                                <div className="col-span-3 text-center text-white/40 py-2">ไม่มีข้อมูลโซนสำหรับจังหวัดนี้</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="เบอร์โทรศัพท์" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} icon={Phone} />
                                    <InputField label="เว็บไซต์" value={form.website} onChange={(e: any) => setForm({ ...form, website: e.target.value })} icon={Share2} />
                                </div>

                                <button onClick={handleUpdate} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4">
                                    บันทึกการเปลี่ยนแปลง
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Users className="text-[#F84E6E]" /> รายชื่อเด็กในสังกัด</h3>

                                {/* Tabs or Sections */}
                                <div className="space-y-6">
                                    {/* KYC ALERT */}
                                    {!agency?.isVerified && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                            <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2"><ShieldCheck size={18} /> สังกัดยังไม่ได้รับการยืนยัน (Unverified)</h4>
                                            <p className="text-white/70 text-sm mb-4">คุณยังไม่สามารถรับสมาชิกเข้าสังกัดได้ จนกว่าจะผ่านการตรวจสอบตัวตน</p>

                                            {agency?.kycStatus === 'PENDING' ? (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-bold animate-pulse">
                                                    ⏳ กำลังรอการตรวจสอบจากแอดมิน...
                                                </div>
                                            ) : agency?.kycStatus === 'REJECTED' ? (
                                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-3">
                                                    <h5 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2">
                                                        <ShieldCheck size={16} className="rotate-180" /> คำขอถูกปฏิเสธ (Rejected)
                                                    </h5>
                                                    <p className="text-white/80 text-sm mb-3">
                                                        เหตุผล: <span className="text-white font-medium">{agency.rejectionReason || "ไม่ระบุเหตุผล"}</span>
                                                    </p>
                                                    <button
                                                        onClick={submitKYC}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg transition"
                                                    >
                                                        ส่งเอกสารยืนยันตัวตนใหม่ (Resubmit KYC)
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={submitKYC}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-lg"
                                                >
                                                    ส่งเอกสารยืนยันตัวตน (KYC)
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* PENDING REQUESTS */}
                                    {agency?.creators?.filter((c: any) => c.agencyJoinStatus === 'PENDING').length > 0 && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                            <h4 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">⚠️ รอการอนุมัติเข้าร่วม ({agency.creators.filter((c: any) => c.agencyJoinStatus === 'PENDING').length})</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {agency.creators.filter((c: any) => c.agencyJoinStatus === 'PENDING').map((model: any) => (
                                                    <div key={model._id} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden relative">
                                                                {(model.images?.[0] || model.user?.avatarUrl) && (
                                                                    <Image src={getImageUrl(model.images?.[0] || model.user?.avatarUrl)} fill className="object-cover" alt="" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-sm">{model.displayName}</h4>
                                                                <p className="text-xs text-white/50">ขอเข้าร่วมเมื่อ: {new Date(model.updatedAt || Date.now()).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                disabled={!agency.isVerified}
                                                                onClick={async () => {
                                                                    if (!confirm("ยืนยันรับน้องเข้าสังกัด?")) return;
                                                                    try {
                                                                        const token = localStorage.getItem("token");
                                                                        await fetch(`${API_BASE_URL}/agencies/requests/${model._id}/approve`, {
                                                                            method: "POST", headers: { "Authorization": `Bearer ${token}` }
                                                                        });
                                                                        fetchMyAgency(); // Refresh
                                                                    } catch (e) { toast.error("Error"); }
                                                                }}
                                                                className={`p-2 rounded-lg text-white ${!agency.isVerified ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-500 hover:bg-green-600'}`}
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm("ปฏิเสธคำขอ?")) return;
                                                                    try {
                                                                        const token = localStorage.getItem("token");
                                                                        await fetch(`${API_BASE_URL}/agencies/requests/${model._id}/reject`, {
                                                                            method: "POST", headers: { "Authorization": `Bearer ${token}` }
                                                                        });
                                                                        fetchMyAgency(); // Refresh
                                                                    } catch (e) { toast.error("Error"); }
                                                                }}
                                                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                                                            >
                                                                <LogOut size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* APPROVED LIST */}
                                    <div>
                                        <h4 className="text-white/70 font-bold mb-3 text-sm uppercase">สมาชิกในสังกัด ({agency?.creators?.filter((c: any) => c.agencyJoinStatus === 'APPROVED').length || 0})</h4>
                                        {agency?.creators?.filter((c: any) => c.agencyJoinStatus === 'APPROVED').length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {agency.creators.filter((c: any) => c.agencyJoinStatus === 'APPROVED').map((model: any) => (
                                                    <div key={model._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                                                        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative">
                                                            {(model.images?.[0] || model.user?.avatarUrl) && (
                                                                <Image src={getImageUrl(model.images?.[0] || model.user?.avatarUrl)} fill className="object-cover" alt="" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm">{model.displayName}</h4>
                                                            <p className="text-xs text-white/50">สมาชิก</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-white/30 border border-dashed border-white/10 rounded-xl">ไม่มีสมาชิกที่อนุมัติแล้ว</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GENDER_OPTIONS = ["Male", "Female", "LGBTQ+", "Other"];
const SERVICE_TYPES = [
    "Sideline", "N-Kid", "Tour Guide", "Travel", "Rental Girlfriend",
    "Virtual Exciting Call", "Massage", "Naked Maid", "Dinner Date", "Long Term"
];
const SERVICE_TAGS = [
    "Smooching", "BDSM", "Blowjob", "Cum in mouth", "Swallow", "Rimming",
    "Foot Fetish", "Striptease", "Overnight", "Loli", "Outcall", "Roleplay Cosplay"
];

const UserDashboard = ({ user, onLogout }: any) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, info, reviews, favorites
    const [stats, setStats] = useState({ profilesSeen: 0, myReviews: 0, myFavorites: 0 });
    const [reviews, setReviews] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [telegramUrl, setTelegramUrl] = useState("");

    // Locations
    const [availableLocations, setAvailableLocations] = useState<any[]>([]);
    const [availableZones, setAvailableZones] = useState<string[]>([]);

    // Profile Form
    const [form, setForm] = useState({
        displayName: user.displayName || "",
        age: user.age || "",
        gender: user.gender || "Male",
        province: user.province || "",
        location: user.location || "",
        zones: user.zones || [] as string[]
    });

    const [preferences, setPreferences] = useState(user.preferences || {
        genders: [],
        provinces: [],
        ageRange: { min: 20, max: 60 },
        heightRange: { min: 140, max: 200 },
        weightRange: { min: 35, max: 120 },
        chestRange: { min: 30, max: 50 },
        waistRange: { min: 20, max: 40 },
        buttsRange: { min: 30, max: 50 },
        serviceTypes: [],
        serviceTags: []
    });

    useEffect(() => {
        const initData = async () => {
            // 1. Locations
            try {
                const res = await fetch(`${API_BASE_URL}/settings/locations`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableLocations(data);
                    if (user.province) {
                        const loc = data.find((l: any) => l.name === user.province);
                        if (loc) setAvailableZones(loc.zones);
                    }
                }
            } catch (e) { console.error(e); }

            // 2. Telegram URL
            try {
                // Determine API URL based on environment or hardcoded if simple
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
                const res = await fetch(`${API_URL}/settings?key=telegram_url`);
                if (res.ok) {
                    const data = await res.json();
                    setTelegramUrl(data.value || "");
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        initData();
    }, []);

    useEffect(() => {
        fetchDashboardStats();
        if (activeTab === 'reviews') fetchMyReviews();
        if (activeTab === 'favorites') fetchMyFavorites();
        if (activeTab === 'history') fetchMyHistory();
    }, [activeTab]);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/me/dashboard`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/reviews/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/history`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyFavorites = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/favorites`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                toast.success("บันทึกข้อมูลสำเร็จ");
                const storedUser = JSON.parse(localStorage.getItem("user") || "{ }");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, ...updated }));
            }
        } catch (e) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        try {
            const url = await uploadS3File(e.target.files[0]);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ avatarUrl: url })
            });

            if (res.ok) {
                const updated = await res.json();
                toast.success("อัปเดตรูปโปรไฟล์สำเร็จ");
                const storedUser = JSON.parse(localStorage.getItem("user") || "{ }");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, avatarUrl: url }));
                window.location.reload();
            }
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    const handleSavePreferences = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/me/preferences`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ preferences })
            });
            if (res.ok) {
                const updated = await res.json();
                toast.success("บันทึกการตั้งค่าสำเร็จ");
                const storedUser = JSON.parse(localStorage.getItem("user") || "{ }");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, ...updated }));
            }
        } catch (e) {
            toast.error("Error saving preferences");
        } finally {
            setLoading(false);
        }
    };

    const SidebarItem = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === id ? 'bg-[#F84E6E]/10 text-[#F84E6E]' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#020617]">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#1e1b4b]/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gray-100 relative mb-4 group cursor-pointer overflow-hidden border-4 border-white shadow-lg">
                                    {user.avatarUrl ? (
                                        <Image src={getImageUrl(user.avatarUrl)} fill className="object-cover" alt="Avatar" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><UserIcon size={40} /></div>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-medium cursor-pointer">
                                        Change
                                        <input type="file" hidden onChange={handleAvatarUpload} />
                                    </label>
                                </div>
                                <h2 className="font-bold text-lg dark:text-white">{user.displayName}</h2>
                                <p className="text-sm text-gray-500">{user.role || "User"}</p>
                            </div>

                            <nav className="space-y-1">
                                <SidebarItem id="dashboard" label="แดชบอร์ด" icon={Zap} />
                                <SidebarItem id="info" label="ข้อมูลส่วนตัว" icon={UserIcon} />
                                <SidebarItem id="reviews" label="รีวิวของฉัน" icon={Star} />
                                <SidebarItem id="favorites" label="รายการโปรด" icon={Heart} />
                                <SidebarItem id="preferences" label="ตั้งค่าฟิลเตอร์" icon={Settings} />
                                <button onClick={() => window.open(telegramUrl, '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 transition">
                                    <Send size={18} /> เข้าร่วมบน Telegram
                                </button>
                                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition mt-4">
                                    <LogOut size={18} /> ออกจากระบบ
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white dark:bg-[#1e1b4b]/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                                    <h2 className="font-bold text-xl mb-2 dark:text-white">My Dashboard</h2>
                                    <p className="text-gray-500 text-sm">Welcome back! Here&apos;s your Fiwfan activity overview</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        onClick={() => setActiveTab('history')}
                                        className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between h-[140px] cursor-pointer hover:bg-white/5 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profiles Seen</span>
                                            <Eye size={18} className="text-[#F84E6E]" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-bold dark:text-white">{stats.profilesSeen}</span>
                                            <MoreHorizontal size={18} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setActiveTab('reviews')}
                                        className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between h-[140px] cursor-pointer hover:bg-white/5 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Reviews</span>
                                            <Star size={18} className="text-orange-400" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-bold dark:text-white">{stats.myReviews}</span>
                                            <MoreHorizontal size={18} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setActiveTab('favorites')}
                                        className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between h-[140px] cursor-pointer hover:bg-white/5 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Favorites</span>
                                            <Heart size={18} className="text-pink-500" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-bold dark:text-white">{stats.myFavorites}</span>
                                            <MoreHorizontal size={18} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div onClick={() => setActiveTab('preferences')} className="flex flex-col md:flex-row items-center justify-between bg-[#1e1b4b] rounded-3xl p-8 text-white relative overflow-hidden cursor-pointer">
                                    <div className="relative z-10 max-w-lg">
                                        <h2 className="text-3xl font-bold mb-4">Get quick search as per preference</h2>
                                        <h3 className="text-xl font-bold mb-4 opacity-90">Get notified for recent added profiles.</h3>
                                        <p className="text-yellow-400 text-sm mb-6">Set your preferences to get the notification and customized updates.</p>
                                        <button className="bg-white text-[#1e1b4b] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                                            Activate Now
                                        </button>
                                    </div>
                                    <div className="hidden md:block relative z-10">
                                        {/* Illustration placeholder */}
                                        <div className="w-64 h-48 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <Zap size={64} className="text-white/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><Edit className="text-[#F84E6E]" /> แก้ไขข้อมูลส่วนตัว</h3>
                                <div className="space-y-4">
                                    <InputField label="ชื่อที่ใช้แสดง" value={form.displayName} onChange={(e: any) => setForm({ ...form, displayName: e.target.value })} icon={UserIcon} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="อายุ" type="number" value={form.age} onChange={(e: any) => setForm({ ...form, age: Number(e.target.value) })} />
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-500 dark:text-white/70 ml-1">เพศ</label>
                                            <select
                                                value={form.gender}
                                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                            >
                                                <option value="Male">ชาย (Male)</option>
                                                <option value="Female">หญิง (Female)</option>
                                                <option value="LGBTQ">LGBTQ+</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-gray-500 dark:text-white/70 ml-1">จังหวัด</label>
                                            <select
                                                value={form.province}
                                                onChange={(e) => {
                                                    const prov = e.target.value;
                                                    setForm({ ...form, province: prov, zones: [] });
                                                    const selectedLoc = availableLocations.find((l: any) => l.name === prov);
                                                    setAvailableZones(selectedLoc ? selectedLoc.zones : []);
                                                }}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                            >
                                                <option value="">เลือกจังหวัด</option>
                                                {availableLocations.map((loc: any) => (
                                                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputField label="รายละเอียดที่ตั้ง (เช่น ถนน, ซอย)" value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value })} icon={MapPin} />
                                    </div>

                                    {/* Zone Selection */}
                                    {form.province && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-white/70 ml-1">โซนที่คุณรับงาน (เลือกได้หลายโซน)</label>
                                            <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {availableZones.length > 0 ? availableZones.map((zone) => (
                                                    <div
                                                        key={zone}
                                                        onClick={() => {
                                                            const currentZones = form.zones || [];
                                                            if (currentZones.includes(zone)) {
                                                                setForm({ ...form, zones: currentZones.filter((z: string) => z !== zone) });
                                                            } else {
                                                                setForm({ ...form, zones: [...currentZones, zone] });
                                                            }
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition text-center border ${form.zones?.includes(zone) ? 'bg-[#F84E6E] border-[#F84E6E] text-white' : 'bg-white border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                                    >
                                                        {zone}
                                                    </div>
                                                )) : (
                                                    <div className="col-span-3 text-center text-gray-400 py-2">ไม่มีข้อมูลโซนสำหรับจังหวัดนี้</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4">
                                        {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="font-bold text-xl dark:text-white">รีวิวของฉัน ({reviews.length})</h2>
                                {reviews.length > 0 ? (
                                    <div className="grid gap-4">
                                        {reviews.map((review: any) => (
                                            <div key={review._id} className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                                <div className="flex justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-white">To: {review.creator?.displayName}</h4>
                                                        <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                                                            <Star size={14} fill="currentColor" /> {review.rating?.toFixed(1)}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">&quot;{review.comment}&quot;</p>
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex gap-2 mt-2">
                                                        {review.images.map((img: string, i: number) => (
                                                            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden relative">
                                                                <Image src={getImageUrl(img)} fill className="object-cover" alt="" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        ยังไม่มีรีวิว
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="font-bold text-xl dark:text-white">รายการโปรด ({favorites.length})</h2>
                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.map((creator: any) => (
                                            <div key={creator._id} onClick={() => router.push(`/sideline/${creator._id}`)} className="bg-white dark:bg-[#1e1b4b]/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-white/5 transition flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden relative border border-white/10">
                                                    {(creator.images?.[0] || creator.user?.avatarUrl) && (
                                                        <Image src={getImageUrl(creator.images?.[0] || creator.user?.avatarUrl)} fill className="object-cover" alt="" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-white">{creator.displayName}</h4>
                                                    <p className="text-xs text-[#F84E6E]">Favorite</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        ไม่มีรายการโปรด
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="font-bold text-xl dark:text-white">ประวัติการเข้าชม ({history.length})</h2>
                                {history.length > 0 ? (
                                    <div className="space-y-4">
                                        {history.map((item: any, i: number) => {
                                            // Item might be null if creator deleted, handle gracefully
                                            const creator = item.creator;
                                            if (!creator) return null;

                                            return (
                                                <div key={i} onClick={() => router.push(`/sideline/${creator._id}`)} className="bg-white dark:bg-[#1e1b4b]/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-white/5 transition flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden relative">
                                                            {(creator.images?.[0] || creator.user?.avatarUrl) && (
                                                                <Image src={getImageUrl(creator.images?.[0] || creator.user?.avatarUrl)} fill className="object-cover" alt="" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 dark:text-white">{creator.displayName}</h4>
                                                            <p className="text-xs text-gray-500">Viewed {new Date(item.viewedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-gray-400" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        ไม่พบประวัติการเข้าชม
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-bold text-xl dark:text-white underline-offset-8 underline decoration-[#F84E6E]">ตั้งค่าฟิลเตอร์ที่ต้องการ</h2>
                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={loading}
                                        className="bg-[#F84E6E] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#d43f5b] transition shadow-lg shadow-pink-500/20 disabled:opacity-50"
                                    >
                                        <Save size={18} /> {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Basics & Ranges */}
                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Users size={16} /> เพศที่สนใจ
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {GENDER_OPTIONS.map(g => (
                                                    <CheckboxField
                                                        key={g}
                                                        label={g}
                                                        checked={preferences.genders.includes(g)}
                                                        onChange={(checked: boolean) => {
                                                            const newGenders = checked
                                                                ? [...preferences.genders, g]
                                                                : preferences.genders.filter((x: string) => x !== g);
                                                            setPreferences({ ...preferences, genders: newGenders });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Scissors size={16} /> ช่วงสัดส่วนและอายุ
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: "อายุ", key: "ageRange" },
                                                    { label: "ส่วนสูง", key: "heightRange" },
                                                    { label: "น้ำหนัก", key: "weightRange" },
                                                    { label: "หน้าอก", key: "chestRange" },
                                                    { label: "เอว", key: "waistRange" },
                                                    { label: "สะโพก", key: "buttsRange" },
                                                ].map((item: any) => (
                                                    <div key={item.key} className="grid grid-cols-2 gap-4">
                                                        <InputField
                                                            label={`${item.label} (Min)`}
                                                            type="number"
                                                            value={preferences[item.key].min}
                                                            onChange={(e: any) => setPreferences({
                                                                ...preferences,
                                                                [item.key]: { ...preferences[item.key], min: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                        <InputField
                                                            label={`${item.label} (Max)`}
                                                            type="number"
                                                            value={preferences[item.key].max}
                                                            onChange={(e: any) => setPreferences({
                                                                ...preferences,
                                                                [item.key]: { ...preferences[item.key], max: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Service Types & Tags */}
                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Zap size={16} /> ประเภทงาน
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {SERVICE_TYPES.map(s => (
                                                    <CheckboxField
                                                        key={s}
                                                        label={s}
                                                        checked={preferences.serviceTypes.includes(s)}
                                                        onChange={(checked: boolean) => {
                                                            const newTypes = checked
                                                                ? [...preferences.serviceTypes, s]
                                                                : preferences.serviceTypes.filter((x: string) => x !== s);
                                                            setPreferences({ ...preferences, serviceTypes: newTypes });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-[#1e1b4b]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Hash size={16} /> แท็กความต้องการพิเศษ
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {SERVICE_TAGS.map(t => (
                                                    <CheckboxField
                                                        key={t}
                                                        label={t}
                                                        checked={preferences.serviceTags.includes(t)}
                                                        onChange={(checked: boolean) => {
                                                            const newTags = checked
                                                                ? [...preferences.serviceTags, t]
                                                                : preferences.serviceTags.filter((x: string) => x !== t);
                                                            setPreferences({ ...preferences, serviceTags: newTags });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });
    const [agencies, setAgencies] = useState<any[]>([]); // List of available agencies
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stories State
    const [stories, setStories] = useState<any[]>([]);
    const [isStoryUploading, setIsStoryUploading] = useState(false);

    // New Post State
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const [availableLocations, setAvailableLocations] = useState<any[]>([]);
    const [availableZones, setAvailableZones] = useState<string[]>([]);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        displayName: string;
        bio: string;
        price: number;
        age: number;
        province: string;
        location: string;
        zones: string[];
        height: string;
        weight: string;
        proportions: string;
        gender: string;
        languages: string[];
        services: string;
        interests: string;
        availability: string;
        // New Fields
        lineId: string;
        instagram: string;
        phone: string;
        transport: string;
        parking: boolean;
        agency: string; // Agency ID
    }>({
        displayName: "",
        bio: "",
        price: 0,
        age: 0,
        province: "",
        location: "",
        zones: [],
        height: "",
        weight: "",
        proportions: "",
        gender: "",
        languages: [],
        services: "",
        interests: "",
        availability: "",
        lineId: "",
        instagram: "",
        phone: "",
        transport: "",
        parking: false,
        agency: ""
    });

    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [hasSubscription, setHasSubscription] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!token || !storedUser) {
                router.push("/auth");
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "CREATOR" && parsedUser.role !== "AGENCY" && parsedUser.role !== "USER") {
                toast.warn("Unknown Role");
                router.push("/");
                return;
            }

            setUser(parsedUser);

            // Fetch Locations
            try {
                const res = await fetch(`${API_BASE_URL}/settings/locations`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableLocations(data);
                }
            } catch (e) {
                console.error(e);
            }

            // If Agency, we don't need to fetch creator profile strictly, but let's keep it safe
            if (parsedUser.role === "CREATOR") {
                fetchCreatorProfile(token);
                checkSubscription(token);
                fetchMyStories();
            } else {
                setLoading(false); // For agency, we are ready
            }

            // fetchAgencies is for joining agency, mostly for Creator. But no harm calling it.
            fetchAgencies();
        };
        init();
    }, [router]);

    const checkSubscription = async (token: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/payments/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const sub = await res.json();
                if (sub && sub.status === 'ACTIVE') {
                    setHasSubscription(true);
                } else {
                    setHasSubscription(false);
                }
            }
        } catch (error) {
            console.error("Failed to check subscription");
        }
    };

    const fetchAgencies = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/agencies`);
            if (res.ok) {
                const data = await res.json();
                setAgencies(data);
            }
        } catch (error) {
            console.error("Failed to fetch agencies", error);
        }
    };

    const fetchMyStories = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/stories/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStories(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setIsStoryUploading(true);
        try {
            const file = e.target.files[0];
            const url = await uploadS3File(file);
            const token = localStorage.getItem("token");

            const mediaType = file.type.startsWith('video') ? 'video' : 'image';

            const res = await fetch(`${API_BASE_URL}/stories`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ mediaUrl: url, mediaType })
            });

            if (res.ok) {
                toast.success("อัปโหลดสตอรี่เรียบร้อย");
                fetchMyStories();
            }
        } catch (error) {
            toast.error("Upload failed");
            console.error(error);
        } finally {
            setIsStoryUploading(false);
        }
    };

    const handleStoryDelete = async (id: string) => {
        if (!confirm("ต้องการลบสตอรี่นี้?")) return;
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE_URL}/stories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchMyStories();
            toast.success("Deleted");
        } catch (e) { toast.error("Error"); }
    };

    const fetchCreatorProfile = async (token: string) => {
        try {
            const userId = localStorage.getItem("user");
            const parsedUser = JSON.parse(userId || "{ }");
            const res = await fetch(`${API_BASE_URL}/creators/${parsedUser.id}`);

            if (res.ok) {
                const data = await res.json();
                setCreator(data);

                // If province exists, load zones
                let zonesForProvince: string[] = [];
                if (data.province) {
                    // We need to access availableLocations but it might not be set yet due to closure.
                    // Better to rely on fetching it or just wait. 
                    // Actually, we can fetch locations inside here or just rely on state update cycle?
                    // Safe way: fetch again or iterate if we had it. Use API call is safer to be sure.
                    try {
                        const locRes = await fetch(`${API_BASE_URL}/settings/locations`);
                        if (locRes.ok) {
                            const locData = await locRes.json();
                            // Update available locations just in case
                            setAvailableLocations(locData);
                            const found = locData.find((l: any) => l.name === data.province);
                            if (found) zonesForProvince = found.zones;
                        }
                    } catch (e) { }
                }
                setAvailableZones(zonesForProvince);

                setEditForm({
                    displayName: data.displayName || "",
                    bio: data.bio || "",
                    age: data.age || 0,
                    price: data.price || 0,
                    province: data.province || "",
                    location: data.location || "",
                    zones: data.zones || [],
                    height: data.height || "",
                    weight: data.weight || "",
                    proportions: data.proportions || "",
                    gender: data.gender || "",
                    languages: data.languages || [],
                    services: data.services ? data.services.join(", ") : "",
                    interests: data.interests ? data.interests.join(", ") : "",
                    availability: data.availability || "",
                    lineId: data.lineId || "",
                    instagram: data.instagram || "",
                    phone: data.phone || "",
                    transport: data.transport || "",
                    parking: data.parking || false,
                    agency: data.agency || ""
                });
                setMyPosts(data.posts || []);
                setStats({
                    posts: data.posts?.length || 0,
                    likes: 0, // Mock
                    views: data.views || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile && !previewUrl) return toast.warn("กรุณาเลือกรูปภาพ");

        setIsPosting(true);
        try {
            const token = localStorage.getItem("token");
            let imageUrl = previewUrl;

            if (selectedFile) {
                try {
                    imageUrl = await uploadS3File(selectedFile);
                } catch (err: any) {
                    toast.error(err.message || "Upload failed");
                    setIsPosting(false);
                    return;
                }
            }

            const res = await fetch(`${API_BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    caption,
                    media: [{ url: imageUrl, type: "IMAGE" }]
                })
            });

            if (res.ok) {
                const newPost = await res.json();
                setMyPosts([newPost, ...myPosts]);
                setCaption("");
                setSelectedFile(null);
                setPreviewUrl("");
                toast.success("โพสต์เรียบร้อยแล้ว!");
            } else {
                const err = await res.json();
                if (err.code === 'SUBSCRIPTION_REQUIRED') {
                    toast.error("กรุณาซื้อแพ็กเกจก่อนทำการโพสต์");
                    router.push('/plans');
                } else {
                    toast.error("เกิดข้อผิดพลาดในการโพสต์");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setIsPosting(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            const url = await uploadS3File(file);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ avatarUrl: url })
            });

            if (res.ok) {
                const updated = await res.json();
                setUser({ ...user, avatarUrl: url });
                const storageUser = JSON.parse(localStorage.getItem("user") || "{ }");
                localStorage.setItem("user", JSON.stringify({ ...storageUser, avatarUrl: url }));
                toast.success("อัปเดตรูปโปรไฟล์สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("อัปโหลดไม่สำเร็จ");
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            const url = await uploadS3File(file);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ bannerUrl: url })
            });

            if (res.ok) {
                setCreator({ ...creator, bannerUrl: url });
                toast.success("อัปเดตปกสำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("อัปโหลดไม่สำเร็จ");
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        try {
            toast.info(`กำลังอัปโหลด ${files.length} รูป... กรุณารอสักครู่`);
            const uploadPromises = files.map(file => uploadS3File(file));
            const distinctUrls = await Promise.all(uploadPromises);

            const token = localStorage.getItem("token");
            const currentImages = creator?.images || [];
            const newImages = [...currentImages, ...distinctUrls];

            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                setCreator({ ...creator, images: newImages });
                toast.success("อัปโหลดรูปผลงานสำเร็จ");
            } else {
                const err = await res.json();
                if (err.code === 'SUBSCRIPTION_REQUIRED') {
                    toast.error("กรุณาซื้อแพ็กเกจก่อนอัปโหลดรูปผลงาน");
                } else {
                    toast.error("อัปโหลดไม่สำเร็จ");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("อัปโหลดบางรูปไม่สำเร็จ");
        }
    };

    const handleGalleryDelete = async (indexToDelete: number) => {
        if (!confirm("ต้องการลบรูปภาพนี้ใช่ไหม?")) return;

        try {
            const currentImages = creator?.images || [];
            const newImages = currentImages.filter((_: any, i: number) => i !== indexToDelete);

            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                setCreator({ ...creator, images: newImages });
                toast.success("ลบรูปภาพสำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการลบรูปภาพ");
        }
    };



    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...editForm,
                services: editForm.services.split(",").map((s: string) => s.trim()).filter((s: string) => s),
                interests: editForm.interests.split(",").map((s: string) => s.trim()).filter((s: string) => s),
            };

            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updated = await res.json();
                setCreator(updated);
                setIsEditing(false);
                toast.success("บันทึกข้อมูลแล้ว");
            } else {
                toast.error("บันทึกไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black text-white">Loading...</div>;

    // --- RENDER AGENCY VIEW ---
    if (user?.role === "AGENCY") {
        return <AgencyDashboard user={user} onLogout={handleLogout} />;
    }

    // --- RENDER USER VIEW ---
    if (user?.role === "USER") {
        return <UserDashboard user={user} onLogout={handleLogout} />;
    }

    // --- RENDER CREATOR VIEW ---
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] pb-24">
            {/* Header */}
            <div className="bg-[#1e1b4b] text-white p-6 pb-8 rounded-b-[40px] shadow-2xl mb-8 relative overflow-hidden">
                {/* Decorative bg or Banner */}
                {creator?.bannerUrl ? (
                    <div className="absolute inset-0 w-full h-full z-0">
                        <Image
                            src={getImageUrl(creator.bannerUrl)}
                            alt="Banner"
                            fill
                            className="object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] to-transparent" />
                    </div>
                ) : (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F84E6E] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                )}

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
                            <p className="text-white/60 text-sm">จัดการข้อมูลและผลงานของคุณ</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white p-1 relative group cursor-pointer shadow-lg animate-in zoom-in-50 duration-500">
                            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                                {(creator?.images?.[0] || user?.avatarUrl) ? (
                                    <Image
                                        src={getImageUrl(creator?.images?.[0] || user?.avatarUrl)}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {user?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs cursor-pointer rounded-full">
                                    เปลี่ยนรูป
                                    <input type="file" hidden onChange={handleAvatarUpload} />
                                </label>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-[#1e1b4b] flex items-center justify-center">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold">{creator?.displayName || user?.username}</h2>
                            <p className="text-white/70 text-sm max-w-xs truncate">{creator?.bio || "ยังไม่มีคำอธิบายตัวตน"}</p>

                            {/* Tags or Badges */}
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-1 bg-white/10 rounded text-[10px] backdrop-blur font-medium">AGE: {creator?.age || "-"}</span>
                                <span className="px-2 py-1 bg-white/10 rounded text-[10px] backdrop-blur font-medium flex items-center gap-1"><MapPin size={10} /> {creator?.location || "-"}</span>
                                {creator?.isVerified && <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] backdrop-blur font-medium flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>}
                            </div>
                        </div>

                        {/* Banner Edit Trigger (Absolute) */}
                        <label className="absolute bottom-0 right-0 mb-8 mr-0 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs cursor-pointer backdrop-blur transition flex items-center gap-2">
                            <Camera size={14} /> เปลี่ยนปก
                            <input type="file" hidden onChange={handleBannerUpload} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 -mt-10 relative z-20">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/5 text-center">
                        <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Posts</h3>
                        <p className="text-2xl font-bold text-white">{stats.posts}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/5 text-center">
                        <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Likes</h3>
                        <p className="text-2xl font-bold text-white">{stats.likes}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/5 text-center">
                        <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Views</h3>
                        <p className="text-2xl font-bold text-white">{stats.views}</p>
                    </div>
                </div>

                {isEditing ? (
                    <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-3xl p-6 shadow-xl border border-white/5 animate-in fade-in slide-in-from-bottom-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Edit className="text-[#F84E6E]" /> แก้ไขโปรไฟล์</h3>
                            <button onClick={() => setIsEditing(false)} className="text-sm text-gray-400 hover:text-white">ยกเลิก</button>
                        </div>

                        <div className="space-y-5">
                            <InputField label="ชื่อที่ใช้แสดง (Display Name)" value={editForm.displayName} onChange={(e: any) => setEditForm({ ...editForm, displayName: e.target.value })} />

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/70 ml-1">คำอธิบายตัวเอง (Bio)</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] min-h-[100px] text-sm"
                                    placeholder="แนะนำตัวเองสั้นๆ..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="อายุ" type="number" value={editForm.age} onChange={(e: any) => setEditForm({ ...editForm, age: parseInt(e.target.value) })} />
                                <InputField label="เรทราคา (เริ่มต้น)" type="number" value={editForm.price} onChange={(e: any) => setEditForm({ ...editForm, price: parseInt(e.target.value) })} icon={DollarSign} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/70 ml-1">จังหวัด</label>
                                        <select
                                            value={editForm.province}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                setEditForm({ ...editForm, province: prov, zones: [] });
                                                const selectedLoc = availableLocations.find((l: any) => l.name === prov);
                                                setAvailableZones(selectedLoc ? selectedLoc.zones : []);
                                            }}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                        >
                                            <option value="" className="bg-slate-900">เลือกจังหวัด</option>
                                            {availableLocations.map((loc: any) => (
                                                <option key={loc.id} value={loc.name} className="bg-slate-900">{loc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField label="สถานที่ (ระบุโซน/ถนน)" value={editForm.location} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} icon={MapPin} />
                                </div>

                                {/* Zones Selection */}
                                {editForm.province && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-white/70 ml-1">โซนที่รับงาน (เลือกได้หลายโซน)</label>
                                        <div className="p-4 bg-black/20 rounded-xl border border-white/10 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {availableZones.length > 0 ? availableZones.map((zone) => (
                                                <div
                                                    key={zone}
                                                    onClick={() => {
                                                        const currentZones = editForm.zones || [];
                                                        if (currentZones.includes(zone)) {
                                                            setEditForm({ ...editForm, zones: currentZones.filter(z => z !== zone) });
                                                        } else {
                                                            setEditForm({ ...editForm, zones: [...currentZones, zone] });
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition text-center border ${editForm.zones?.includes(zone) ? 'bg-[#F84E6E] border-[#F84E6E] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                                                >
                                                    {zone}
                                                </div>
                                            )) : (
                                                <div className="col-span-3 text-center text-white/40 py-2">ไม่มีข้อมูลโซนสำหรับจังหวัดนี้</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <InputField label="สัดส่วน (อก-เอว-สะโพก)" value={editForm.proportions} onChange={(e: any) => setEditForm({ ...editForm, proportions: e.target.value })} icon={Ruler} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="ส่วนสูง (cm)" value={editForm.height} onChange={(e: any) => setEditForm({ ...editForm, height: e.target.value })} />
                                <InputField label="น้ำหนัก (kg)" value={editForm.weight} onChange={(e: any) => setEditForm({ ...editForm, weight: e.target.value })} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/70 ml-1">งานที่รับ (Services)</label>
                                <input
                                    value={editForm.services}
                                    onChange={(e) => setEditForm({ ...editForm, services: e.target.value })}
                                    placeholder="เช่น ทานข้าว, ถ่ายแบบ, งานเอ็น..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm"
                                />
                                <p className="text-[10px] text-white/40 ml-1">คั่นด้วยเครื่องหมายจุลภาค (,)</p>
                            </div>

                            {/* Agency Integration */}
                            <div className="space-y-1.5 pt-2 border-t border-white/5 mt-4">
                                <label className="text-xs font-medium text-white/70 ml-1 flex items-center gap-1"><Building size={12} /> สังกัด (Agency)</label>
                                <select
                                    value={editForm.agency}
                                    onChange={(e) => setEditForm({ ...editForm, agency: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                >
                                    <option value="" className="bg-slate-900 text-white">-- ไม่มีสังกัด / อิสระ --</option>
                                    {agencies.map((agency) => (
                                        <option key={agency._id} value={agency._id} className="bg-slate-900 text-white">
                                            {agency.name} {agency.isVerified ? '✅' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-yellow-500/80 ml-1">การเปลี่ยนสังกัดจะต้องรอการอนุมัติจากหัวหน้าสังกัดใหม่</p>
                            </div>

                            <button onClick={handleProfileUpdate} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4 text-sm">
                                บันทึกการเปลี่ยนแปลง
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white dark:bg-[#1e1b4b]/50 backdrop-blur border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Edit size={18} className="text-[#F84E6E]" /> แก้ไขข้อมูล
                            </button>
                            <button className="bg-white dark:bg-[#1e1b4b]/50 backdrop-blur border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg">
                                <Share2 size={18} className="text-blue-400" /> แชร์โปรไฟล์
                            </button>
                        </div>

                        {/* Subscription Status - Only show if hasSubscription is true or false logic needed? */}
                        {/* Actually we blocked posting, so maybe show a badge if active */}
                        {hasSubscription && (
                            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="text-yellow-400 font-bold text-sm">Active Subscription</h4>
                                        <p className="text-yellow-200/60 text-xs">คุณสามารถโพสต์งานได้ปกติ</p>
                                    </div>
                                </div>
                                {/* <button className="text-xs bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-lg">View Plan</button> */}
                            </div>
                        )}

                        {/* New Post Input */}
                        <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-4 shadow-xl border border-white/5">
                            {/* Subscription Barrier */}
                            {!hasSubscription && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center animate-pulse mb-4">
                                    <h3 className="text-yellow-500 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                        <Zap /> กรุณาเลือกแพ็กเกจเพื่อเปิดใช้งานโปรไฟล์
                                    </h3>
                                    <p className="text-white/70 mb-4">คุณต้องมีแพ็กเกจที่ใช้งานอยู่เพื่อโพสต์รูปและแสดงผลในหน้าค้นหา</p>
                                    <button
                                        onClick={() => router.push('/plans')}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-full shadow-lg transition"
                                    >
                                        เลือกแพ็กเกจ (Start Now)
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 relative">
                                    {(creator?.images?.[0] || user?.avatarUrl) ? (
                                        <Image src={getImageUrl(creator?.images?.[0] || user?.avatarUrl)} fill className="object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <form onSubmit={handlePostSubmit}>
                                        <input
                                            type="text"
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="วันนี้ทำอะไรอยู่? บอกแฟนคลับหน่อย..."
                                            className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none mb-3 py-2"
                                            disabled={!hasSubscription}
                                        />

                                        {/* Image Preview */}
                                        {previewUrl && (
                                            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
                                                <Image src={previewUrl} fill className="object-cover" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                                                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70"
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center border-t border-white/10 pt-3">
                                            <label className={`flex items-center gap-2 text-sm text-[#F84E6E] font-medium hover:text-pink-400 cursor-pointer ${!hasSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <ImageIcon size={18} />
                                                เพิ่มรูปภาพ
                                                <input type="file" accept="image/*" hidden onChange={handleFileSelect} disabled={!hasSubscription} />
                                            </label>
                                            <button
                                                type="submit"
                                                disabled={(!caption && !selectedFile) || isPosting || !hasSubscription}
                                                className="bg-[#F84E6E] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition flex items-center gap-2"
                                            >
                                                {isPosting ? 'Posting...' : <><Send size={16} /> โพสต์เลย</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Stories Section */}
                        <div className="space-y-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">Stories (24h)</span>
                            </h3>

                            {/* Subscription Barrier */}
                            {!hasSubscription ? (
                                <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-center">
                                    <p className="text-yellow-500 text-sm">คุณต้องมีแพ็กเกจ active เพื่อใช้งานฟีเจอร์ Story</p>
                                </div>
                            ) : (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {/* Add Story Button */}
                                    <div className="flex-shrink-0 w-24 h-40 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition group relative overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-[#F84E6E] flex items-center justify-center text-white group-hover:scale-110 transition">
                                            {isStoryUploading ? <div className="animate-spin text-xl">C</div> : <Plus size={24} />}
                                        </div>
                                        <span className="text-xs text-white/70 font-medium">Add Story</span>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            onChange={handleStoryUpload}
                                            disabled={isStoryUploading}
                                        />
                                    </div>

                                    {/* Story List */}
                                    {stories.map((story) => (
                                        <div key={story._id} className="flex-shrink-0 w-24 h-40 rounded-xl bg-gray-900 border border-white/10 relative group overflow-hidden">
                                            {story.mediaType === 'video' ? (
                                                <video src={getImageUrl(story.mediaUrl)} className="w-full h-full object-cover" controls playsInline />
                                            ) : (
                                                <Image src={getImageUrl(story.mediaUrl)} fill className="object-cover" alt="Story" />
                                            )}

                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 pointer-events-none">
                                                <span className="text-[10px] text-white">
                                                    {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <button
                                                    onClick={() => handleStoryDelete(story._id)}
                                                    className="p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-500 pointer-events-auto"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            {story.mediaType === 'video' && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Posts Feed */}
                        <div className="space-y-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2"><ImageIcon size={20} className="text-[#F84E6E]" /> โพสต์ล่าสุดของคุณ</h3>

                            {myPosts.length > 0 ? (
                                myPosts.map((post) => (
                                    <div key={post._id} className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-white/5">
                                        <div className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative">
                                                <Image
                                                    src={getImageUrl(creator?.images?.[0] || user?.avatarUrl)}
                                                    fill className="object-cover" alt=""
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{creator?.displayName}</h4>
                                                <p className="text-xs text-white/40">{new Date(post.createdAt).toLocaleString()}</p>
                                            </div>
                                            <button className="ml-auto text-white/30 hover:text-white"><MoreHorizontal size={20} /></button>
                                        </div>

                                        {post.media && post.media.length > 0 && (
                                            <div className="relative aspect-[4/5] w-full bg-black">
                                                <Image src={getImageUrl(post.media[0].url)} fill className="object-contain" alt="Post content" />
                                            </div>
                                        )}

                                        <div className="p-4">
                                            <div className="flex items-center gap-4 mb-3">
                                                <button className="text-white hover:text-[#F84E6E] transition"><Heart size={24} /></button>
                                                <button className="text-white hover:text-blue-400 transition"><MessageCircle size={24} /></button>
                                                <button className="text-white hover:text-green-400 transition ml-auto"><Share2 size={24} /></button>
                                            </div>
                                            <p className="text-white text-sm">
                                                <span className="font-bold mr-2">{creator?.displayName}</span>
                                                {post.caption}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <p className="text-white/30">ยังไม่มีโพสต์ เริ่มต้นโพสต์แรกของคุณเลย!</p>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-white/10" />

                        {/* 1. Identity */}
                        <section className="space-y-4">
                            <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><UserIcon size={14} /> ข้อมูลส่วนตัว</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs block mb-1">อายุ</span>
                                    <span className="text-white font-medium">{creator?.age || "-"} ปี</span>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs block mb-1">ส่วนสูง / น้ำหนัก</span>
                                    <span className="text-white font-medium">{creator?.height || "-"} cm / {creator?.weight || "-"} kg</span>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2">
                                    <span className="text-white/40 text-xs block mb-1">สัดส่วน</span>
                                    <span className="text-white font-medium">{creator?.proportions || "-"}</span>
                                </div>
                            </div>
                        </section>

                        {/* 2. Gallery */}
                        <section className="space-y-4">
                            <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14} /> รูปผลงาน (Gallery)</h3>
                            {/* Subscription Barrier for Gallery */}
                            {!hasSubscription && (
                                <div className="text-center py-4 px-2 border border-yellow-500/30 bg-yellow-500/10 rounded-xl mb-2">
                                    <p className="text-yellow-500 text-xs">คุณต้องมีแพ็กเกจจึงจะสามารถอัปโหลดรูปผลงานได้</p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                {creator?.images?.map((img: string, idx: number) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group">
                                        <Image src={getImageUrl(img)} fill className="object-cover" alt={`Gallery ${idx}`} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <button
                                                onClick={() => handleGalleryDelete(idx)}
                                                className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <label className={`aspect-square rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition ${!hasSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Plus className="text-white/30" />
                                    <span className="text-[10px] text-white/30 font-medium">เพิ่มรูป</span>
                                    <input type="file" multiple accept="image/*" hidden onChange={handleGalleryUpload} disabled={!hasSubscription} />
                                </label>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
