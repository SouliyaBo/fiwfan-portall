"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "../../lib/images";
import { uploadS3File } from "../../lib/upload";
import { API_BASE_URL } from "../../lib/constants";
import { toast } from 'react-toastify';

import { LogOut, Plus, Image as ImageIcon, Send, Edit, Save, Upload, MapPin, Ruler, DollarSign, User as UserIcon, Phone, Instagram, Hash, Car, Train, Check, MoreHorizontal, Heart, MessageCircle, Share2, Camera, Trash2, Users, Building, ShieldCheck, Zap } from "lucide-react";

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

// --- USER DASHBOARD COMPONENT ---
const UserDashboard = ({ user, onLogout }: any) => {
    const [form, setForm] = useState({
        displayName: user.displayName || "",
        age: user.age || "",
        gender: user.gender || "Male",
        province: user.province || "กรุงเทพมหานคร",
        location: user.location || ""
    });
    const [loading, setLoading] = useState(false);

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
                // Update local storage user to reflect changes
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, ...updated }));
            } else {
                toast.error("บันทึกไม่สำเร็จ");
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

                // Update local storage
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, avatarUrl: url }));

                // Reload to reflect changes
                window.location.reload();
            } else {
                toast.error("อัปเดตไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] pb-24">
            <div className="bg-[#1e1b4b] text-white p-6 pb-8 rounded-b-[40px] shadow-2xl mb-8 relative overflow-hidden h-[250px]">
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold flex items-center gap-2"><UserIcon size={20} /> User Profile</h1>
                        <button onClick={onLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
                            <LogOut size={20} />
                        </button>
                    </div>
                    <div className="flex items-end gap-6 pb-4">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 relative group cursor-pointer shadow-lg">
                            <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden relative">
                                {user?.avatarUrl ? (
                                    <Image src={getImageUrl(user.avatarUrl)} fill className="object-cover" alt="Avatar" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400"><UserIcon /></div>
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs cursor-pointer">
                                    เปลี่ยนรูป
                                    <input type="file" hidden onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">{user.displayName || "นักท่องเที่ยว"}</h2>
                            <p className="text-white/70">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4">
                <div className="bg-white dark:bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Edit className="text-[#F84E6E]" /> แก้ไขข้อมูลส่วนตัว</h3>
                    <div className="space-y-4">
                        <InputField label="ชื่อที่ใช้แสดง" value={form.displayName} onChange={(e: any) => setForm({ ...form, displayName: e.target.value })} icon={UserIcon} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="อายุ" type="number" value={form.age} onChange={(e: any) => setForm({ ...form, age: Number(e.target.value) })} />
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/70 ml-1">เพศ</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                >
                                    <option value="Male">ชาย (Male)</option>
                                    <option value="Female">หญิง (Female)</option>
                                    <option value="LGBTQ">LGBTQ+</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="จังหวัด" value={form.province} onChange={(e: any) => setForm({ ...form, province: e.target.value })} icon={MapPin} />
                            <InputField label="สถานที่ (ระบุโซน)" value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value })} icon={MapPin} />
                        </div>

                        <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4">
                            {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                        </button>
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
    const [hasSubscription, setHasSubscription] = useState<boolean>(false);

    useEffect(() => {
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

        // If Agency, we don't need to fetch creator profile strictly, but let's keep it safe
        if (parsedUser.role === "CREATOR") {
            fetchCreatorProfile(token);
            checkSubscription(token);
        } else {
            setLoading(false); // For agency, we are ready
        }

        // fetchAgencies is for joining agency, mostly for Creator. But no harm calling it.
        fetchAgencies();
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
                const storageUser = JSON.parse(localStorage.getItem("user") || "{}");
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
                                <InputField label="จังหวัด / โซน" value={editForm.location} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} icon={MapPin} />
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
