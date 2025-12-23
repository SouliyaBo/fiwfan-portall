"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Plus, Image as ImageIcon, Send, Edit, Save, Upload, MapPin, Ruler, DollarSign, User as UserIcon, Phone, Instagram, Hash, Car, Train } from "lucide-react";

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

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });
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
        parking: false
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
        if (parsedUser.role !== "CREATOR") {
            alert("หน้านี้สำหรับ Creator เท่านั้น");
            router.push("/");
            return;
        }

        setUser(parsedUser);
        fetchCreatorProfile(token);
    }, [router]);

    const fetchCreatorProfile = async (token: string) => {
        try {
            const userId = localStorage.getItem("user");
            const parsedUser = JSON.parse(userId || "{}");
            const res = await fetch(`http://localhost:3001/creators/${parsedUser.id}`);

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
                    parking: data.parking || false
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
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes = await fetch("http://localhost:3001/upload", {
                    method: "POST",
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Upload failed");
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const res = await fetch("http://localhost:3001/posts", {
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

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...editForm,
                // languages is already an array
                services: editForm.services.split(",").map((s: string) => s.trim()).filter((s: string) => s),
                interests: editForm.interests.split(",").map((s: string) => s.trim()).filter((s: string) => s),
            };

            const res = await fetch("http://localhost:3001/creators/me", {
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] pb-24">
            {/* Header */}
            <div className="bg-[#1e1b4b] text-white p-6 pb-8 rounded-b-[40px] shadow-2xl mb-8 relative overflow-hidden">
                {/* Decorative bg */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F84E6E] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>

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
                                    src={user?.avatarUrl || "/mock/creators/1.png"}
                                    alt="Profile"
                                    fill
                                    className="object-cover group-hover:scale-110 transition duration-500"
                                />
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
            </div>
        </div>
    );
}
