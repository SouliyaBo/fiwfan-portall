"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "../../lib/images";
import { uploadS3File } from "../../lib/upload";
import { API_BASE_URL } from "../../lib/constants";

import { LogOut, Plus, Image as ImageIcon, Send, Edit, Save, Upload, MapPin, Ruler, DollarSign, User as UserIcon, Phone, Instagram, Hash, Car, Train, Check, MoreHorizontal, Heart, MessageCircle, Share2, Camera, Trash2, Users, Building, ShieldCheck } from "lucide-react";

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
    });

    useEffect(() => {
        fetchMyAgency();
    }, []);

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
                alert("บันทึกข้อมูลสำเร็จ");
            }
        } catch (error) {
            alert("บันทึกไม่สำเร็จ");
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
            alert("Upload failed");
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
            alert("Upload failed");
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
                alert("ส่งเรื่องตรวจสอบแล้ว รอแอดมินอนุมัติ");
            }
        } catch (e) { alert("Error"); }
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="จังหวัด / โซน" value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value })} icon={MapPin} />
                                        <InputField label="Line ID" value={form.lineId} onChange={(e: any) => setForm({ ...form, lineId: e.target.value })} icon={Hash} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="เบอร์โทรศัพท์" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} icon={Phone} />
                                        <InputField label="เว็บไซต์" value={form.website} onChange={(e: any) => setForm({ ...form, website: e.target.value })} icon={Share2} />
                                    </div>

                                    <button onClick={handleUpdate} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4">
                                        บันทึกการเปลี่ยนแปลง
                                    </button>
                                </div>
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
                                                                    } catch (e) { alert("Error"); }
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
                                                                    } catch (e) { alert("Error"); }
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

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });
    const [agencies, setAgencies] = useState<any[]>([]); // List of available agencies
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New Post State
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        displayName: string;
        bio: string;
        price: number;
        age: number;
        location: string;
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
        location: "",
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "CREATOR" && parsedUser.role !== "AGENCY") {
            alert("หน้านี้สำหรับ Creator และ Agency เท่านั้น");
            router.push("/");
            return;
        }

        setUser(parsedUser);

        // If Agency, we don't need to fetch creator profile strictly, but let's keep it safe
        if (parsedUser.role === "CREATOR") {
            fetchCreatorProfile(token);
        } else {
            setLoading(false); // For agency, we are ready
        }

        // fetchAgencies is for joining agency, mostly for Creator. But no harm calling it.
        fetchAgencies();
    }, [router]);

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

    const fetchCreatorProfile = async (token: string) => {
        try {
            const userId = localStorage.getItem("user");
            const parsedUser = JSON.parse(userId || "{}");
            const res = await fetch(`${API_BASE_URL}/creators/${parsedUser.id}`);

            if (res.ok) {
                const data = await res.json();
                setCreator(data);
                setEditForm({
                    displayName: data.displayName || "",
                    bio: data.bio || "",
                    age: data.age || 0,
                    price: data.price || 0,
                    location: data.location || "",
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
        if (!selectedFile && !previewUrl) return alert("กรุณาเลือกรูปภาพ");

        setIsPosting(true);
        try {
            const token = localStorage.getItem("token");
            let imageUrl = previewUrl;

            if (selectedFile) {
                try {
                    imageUrl = await uploadS3File(selectedFile);
                } catch (err: any) {
                    alert(err.message || "Upload failed");
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
                alert("โพสต์เรียบร้อยแล้ว!");
            } else {
                alert("เกิดข้อผิดพลาดในการโพสต์");
            }
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาด");
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
                const storageUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...storageUser, avatarUrl: url }));
                alert("อัปเดตรูปโปรไฟล์สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert("อัปโหลดไม่สำเร็จ");
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
                alert("อัปเดตปกสำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert("อัปโหลดไม่สำเร็จ");
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        try {
            alert(`กำลังอัปโหลด ${files.length} รูป... กรุณารอสักครู่`);
            const uploadPromises = files.map(file => uploadS3File(file));
            const distinctUrls = await Promise.all(uploadPromises);

            const token = localStorage.getItem("token");
            // Fetch current to append or just send new array? logic implies append usually for gallery
            // But API updateCreatorProfile is $set. Let's append client side and set.
            const currentImages = creator?.images || [];
            const newImages = [...currentImages, ...distinctUrls];

            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                setCreator({ ...creator, images: newImages });
                alert("อัปโหลดรูปผลงานสำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert("อัปโหลดบางรูปไม่สำเร็จ");
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
                // alert("ลบรูปภาพสำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...editForm,
                // languages is already an array
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
                alert("บันทึกข้อมูลแล้ว");
            } else {
                alert("บันทึกไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black text-white">Loading...</div>;

    // --- RENDER AGENCY VIEW ---
    if (user?.role === "AGENCY") {
        return <AgencyDashboard user={user} onLogout={handleLogout} />;
    }

    // --- RENDER CREATOR VIEW (Original Logic) ---
    // Make sure we have a user before rendering anything else, though loading checks handle most of it
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
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 -mt-16 relative z-20">
                {/* Profile Editor Card */}
                {isEditing ? (
                    <div className="bg-[#1e1b4b]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl mb-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h2 className="font-bold text-xl text-white flex items-center gap-2"><Edit size={20} className="text-[#F84E6E]" /> แก้ไขโปรไฟล์</h2>
                            <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white text-sm">ยกเลิก</button>
                        </div>

                        <div className="space-y-8">
                            {/* 0. Banner & Gallery Header */}
                            <section className="space-y-4">
                                <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14} /> รูปปก (Banner)</h3>
                                <div className="relative w-full aspect-[3/1] bg-black/20 rounded-xl overflow-hidden border border-white/10 group">
                                    {user?.avatarUrl ? (
                                        <Image src={getImageUrl(user?.avatarUrl)} alt="Banner" fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/30 text-sm">ยังไม่มีรูปปก</div>
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm font-bold hover:bg-white/20 border border-white/10">
                                            <Camera size={16} /> เปลี่ยนรูปปก
                                        </div>
                                        <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                                    </label>
                                </div>
                            </section>

                            <div className="h-px bg-white/10" />

                            {/* 1. Identity */}
                            <section className="space-y-4">
                                <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><UserIcon size={14} /> ข้อมูลส่วนตัว</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="ชื่อที่แสดง (Display Name)"
                                        value={editForm.displayName}
                                        onChange={(e: any) => setEditForm({ ...editForm, displayName: e.target.value })}
                                        placeholder="ชื่อของคุณ..."
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/70 ml-1">เพศ</label>
                                        <select
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent transition text-sm appearance-none"
                                        >
                                            <option value="" className="bg-[#1e1b4b] text-white/50">เลือกเพศ...</option>
                                            <option value="ผู้หญิง" className="bg-[#1e1b4b]">ผู้หญิง (Female)</option>
                                            <option value="ผู้ชาย" className="bg-[#1e1b4b]">ผู้ชาย (Male)</option>
                                            <option value="สาวสอง" className="bg-[#1e1b4b]">สาวสอง (Ladyboy)</option>
                                            <option value="ทอม" className="bg-[#1e1b4b]">ทอม (Tom)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-xs font-medium text-white/70 ml-1 flex items-center gap-1"><UserIcon size={12} /> สังกัด (Agency)</label>
                                        <div className="space-y-2">
                                            {/* Status Badge */}
                                            {creator?.agencyJoinStatus === 'PENDING' && (
                                                <div className="bg-yellow-500/20 text-yellow-500 text-xs px-3 py-2 rounded-lg border border-yellow-500/30 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                                    รอการอนุมัติจากสังกัด... (คุณยังไม่ถูกแสดงในหน้าสังกัด)
                                                </div>
                                            )}

                                            <select
                                                value={editForm.agency}
                                                onChange={(e) => setEditForm({ ...editForm, agency: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent transition text-sm appearance-none"
                                            >
                                                <option value="" className="bg-[#1e1b4b] text-white/50">อิสระ (Freelance)</option>
                                                {agencies.map((agency: any) => (
                                                    <option key={agency._id} value={agency._id} className="bg-[#1e1b4b]">
                                                        {agency.name}
                                                        {creator?.agency === agency._id && creator?.agencyJoinStatus === 'PENDING' ? ' (รออนุมัติ)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <InputField label="อายุ" type="number" value={editForm.age} onChange={(e: any) => setEditForm({ ...editForm, age: e.target.value })} />
                                    <InputField label="สูง (ซม.)" value={editForm.height} onChange={(e: any) => setEditForm({ ...editForm, height: e.target.value })} />
                                    <InputField label="น้ำหนัก (กก.)" value={editForm.weight} onChange={(e: any) => setEditForm({ ...editForm, weight: e.target.value })} />
                                </div>
                                <InputField label="สัดส่วน (อก-เอว-สะโพก)" value={editForm.proportions} onChange={(e: any) => setEditForm({ ...editForm, proportions: e.target.value })} placeholder="34-24-35" icon={Ruler} />
                            </section>

                            <div className="h-px bg-white/10" />

                            {/* 2. Contact & Location */}
                            <section className="space-y-4">
                                <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><MapPin size={14} /> การติดต่อ Google Maps & Location</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Line ID" value={editForm.lineId} onChange={(e: any) => setEditForm({ ...editForm, lineId: e.target.value })} icon={Hash} />
                                    <InputField label="เบอร์โทรศัพท์" value={editForm.phone} onChange={(e: any) => setEditForm({ ...editForm, phone: e.target.value })} icon={Phone} />
                                </div>
                                <InputField label="Instagram" value={editForm.instagram} onChange={(e: any) => setEditForm({ ...editForm, instagram: e.target.value })} icon={Instagram} placeholder="@username" />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="โซน / ย่าน" value={editForm.location} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} placeholder="เช่น รัชดา, ห้วยขวาง" icon={MapPin} />
                                    <InputField label="การเดินทาง (BTS/MRT)" value={editForm.transport} onChange={(e: any) => setEditForm({ ...editForm, transport: e.target.value })} placeholder="BTS อโศก..." icon={Train} />
                                </div>
                                <CheckboxField label="มีที่จอดรถพร้อมบริการ" checked={editForm.parking} onChange={(val: boolean) => setEditForm({ ...editForm, parking: val })} icon={Car} />
                            </section>

                            <div className="h-px bg-white/10" />

                            {/* 3. Services & Price */}
                            <section className="space-y-4">
                                <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><DollarSign size={14} /> งานและราคา</h3>
                                <InputField label="เรทราคาเริ่มต้น (บาท)" type="number" value={editForm.price} onChange={(e: any) => setEditForm({ ...editForm, price: Number(e.target.value) })} icon={DollarSign} />

                                <div>
                                    <label className="text-xs font-medium text-white/70 ml-1 mb-2 block">ภาษาที่สื่อสารได้</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["ไทย", "อังกฤษ", "จีน", "ญี่ปุ่น", "เกาหลี"].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => {
                                                    const current = editForm.languages || [];
                                                    const newLangs = current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang];
                                                    setEditForm({ ...editForm, languages: newLangs });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${editForm.languages?.includes(lang) ? "bg-[#F84E6E] border-[#F84E6E] text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-white/70 ml-1">บริการของคุณ (คั่นด้วยจุลภาค)</label>
                                        <textarea
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent transition text-sm min-h-[80px]"
                                            placeholder="ฟิลแฟน, ทานข้าว, ดูหนัง..."
                                            value={editForm.services}
                                            onChange={e => setEditForm({ ...editForm, services: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-white/70 ml-1">เกี่ยวกับฉัน (Bio)</label>
                                        <textarea
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent transition text-sm min-h-[100px]"
                                            placeholder="เขียนแนะนำตัวให้น่าสนใจ..."
                                            value={editForm.bio}
                                            onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                        />
                                    </div>
                                    <InputField
                                        label="เวลาสะดวก (Availability)"
                                        value={editForm.availability}
                                        onChange={(e: any) => setEditForm({ ...editForm, availability: e.target.value })}
                                        placeholder="10:00 - 22:00 น."
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-white/10" />

                            {/* 4. Gallery */}
                            <section className="space-y-4">
                                <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14} /> แกลเลอรี่ผลงาน (Gallery)</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {creator?.images?.map((img: string, i: number) => (
                                        <div key={i} className="aspect-square relative rounded-lg overflow-hidden bg-white/5 group">
                                            <Image src={getImageUrl(img)} fill className="object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                <button
                                                    onClick={() => handleGalleryDelete(i)}
                                                    className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <label className="aspect-square bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer gap-2">
                                        <Plus size={24} />
                                        <span className="text-xs">เพิ่มรูป</span>
                                        <input type="file" hidden multiple accept="image/*" onChange={handleGalleryUpload} />
                                    </label>
                                </div>
                            </section>

                            <div className="pt-4 flex gap-3 sticky bottom-4 z-20">
                                <button onClick={handleProfileUpdate} className="flex-1 bg-[#F84E6E] text-white py-4 rounded-xl text-sm font-bold hover:brightness-110 transition shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2">
                                    <Save size={18} /> บันทึกโปรไฟล์
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // VIEW MODE UI (Simplified for brevity as user focuses on Input experience)
                    <div className="bg-white dark:bg-[#1e1b4b]/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/5 mb-8 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[3px] shadow-xl flex-shrink-0 relative group cursor-pointer">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                <Image
                                    src={getImageUrl(creator?.user?.avatarUrl)}
                                    alt="Profile"
                                    fill
                                    className="object-cover group-hover:scale-110 transition duration-500"
                                />
                                <label className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                                    <Camera className="text-white drop-shadow-md" size={32} />
                                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-2xl text-white">{creator?.displayName || "Your Name"}</h2>
                            <p className="text-white/60 text-sm">@{user?.username}</p>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => setIsEditing(true)} className="bg-[#F84E6E] text-white px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-pink-500/20 transition flex items-center gap-2">
                                    <Edit size={16} /> แก้ไขโปรไฟล์
                                </button>
                                <button onClick={() => router.push(`/sideline/${creator?.user}`)} className="bg-white/10 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition">
                                    ดูหน้าโปรไฟล์จริง
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Post Section */}
                {!isEditing && (
                    <div className="bg-[#1e1b4b]/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/5 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/10 relative">
                                <Image
                                    src={getImageUrl(creator?.user?.avatarUrl)}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="วันนี้ทำอะไรอยู่? บอกผู้ติดตามของคุณสิ..."
                                    className="w-full bg-transparent text-white placeholder-white/40 text-base resize-none focus:outline-none min-h-[80px]"
                                />

                                {previewUrl && (
                                    <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/10 group">
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="object-contain"
                                        />
                                        <button
                                            onClick={() => {
                                                setPreviewUrl("");
                                                setSelectedFile(null);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
                                        >
                                            <LogOut size={16} className="rotate-45" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-[#F84E6E] hover:bg-[#F84E6E]/10 rounded-full transition flex items-center gap-2"
                                        >
                                            <ImageIcon size={20} />
                                            <span className="text-sm font-medium">รูปภาพ</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={handlePostSubmit}
                                        disabled={isPosting || (!caption.trim() && !selectedFile)}
                                        className="bg-[#F84E6E] text-white px-6 py-2 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-pink-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isPosting ? "กำลังโพสต์..." : <>โพสต์ <Send size={16} /></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Posts Feed */}
            <div className="mt-8 space-y-6">
                {myPosts.length > 0 ? (
                    myPosts.map((post: any) => (
                        <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                        <Image
                                            src={getImageUrl(creator?.user?.avatarUrl)}
                                            alt={creator?.displayName || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                                            {creator?.displayName}
                                            {creator?.isVerified && <Check className="text-blue-500" size={14} />}
                                        </div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {new Date(post.createdAt).toLocaleDateString("th-TH", {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-4 pb-2">
                                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{post.caption}</p>
                            </div>

                            {/* Media */}
                            {post.media && post.media.length > 0 && (
                                <div className="relative w-full aspect-video bg-black mt-2">
                                    <Image
                                        src={getImageUrl(post.media[0].url)}
                                        alt="Post content"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="p-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2">
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition">
                                        <Heart size={20} />
                                        <span className="text-sm font-medium">Coming Soon</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition">
                                        <MessageCircle size={20} />
                                        <span className="text-sm font-medium">Comment</span>
                                    </button>
                                </div>
                                <button className="text-zinc-600 dark:text-zinc-400 hover:text-green-500 transition">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon size={32} className="text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">ยังไม่มีโพสต์</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">เริ่มแบ่งปันเรื่องราวของคุณกับแฟนคลับเลย!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
