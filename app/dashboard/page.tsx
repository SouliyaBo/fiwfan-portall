"use client";

import { useLanguage } from "../../contexts/LanguageContext";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "../../lib/images";
import { uploadS3File } from "../../lib/upload";
import { API_BASE_URL } from "../../lib/constants";
import { toast } from 'react-toastify';
import StoryViewer from "../../components/StoryViewer";

import { LogOut, Plus, Image as ImageIcon, Send, Edit, Save, X, MapPin, Ruler, DollarSign, User as UserIcon, Phone, Instagram, Hash, Car, Train, Check, MoreHorizontal, Heart, MessageCircle, Share2, Camera, Trash2, Users, Building, ShieldCheck, Zap, Star, Eye, ChevronRight, ChevronLeft, Settings, Scissors } from "lucide-react";

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
    const { t } = useLanguage();
    const router = useRouter();
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
        country: "",
        province: "",
        zones: [] as string[]
    });
    const [availableCountries, setAvailableCountries] = useState<any[]>([]);
    const [availableLocations, setAvailableLocations] = useState<any[]>([]);
    const [availableZones, setAvailableZones] = useState<string[]>([]);
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null); // null = loading check, false = no sub, true = has sub
    const [isFreeMode, setIsFreeMode] = useState(false);

    useEffect(() => {
        fetchLocations();
        fetchMyAgency();
        checkSubscription();
        checkFreeMode();
    }, []);

    const checkFreeMode = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/settings?key=isFreeMode`);
            const data = await res.json();
            if (data && data.value === 'true') {
                setIsFreeMode(true);
            }
        } catch (error) {
            console.error("Failed to check free mode");
        }
    };

    // Update available provinces when country changes or countries are loaded
    useEffect(() => {
        if (form.country && availableCountries.length > 0) {
            const selectedCountry = availableCountries.find((c: any) => c.name === form.country);
            if (selectedCountry) {
                setAvailableLocations(selectedCountry.provinces);

                // Also update zones if province is selected
                if (form.province) {
                    const selectedProvince = selectedCountry.provinces.find((p: any) => p.name === form.province);
                    if (selectedProvince) {
                        setAvailableZones(selectedProvince.zones);
                    }
                }
            }
        }
    }, [form.country, form.province, availableCountries]);

    const checkSubscription = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/payments/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.active) {
                    setHasSubscription(true);
                } else {
                    setHasSubscription(false);
                }
            } else {
                setHasSubscription(false);
            }
        } catch (error) {
            console.error("Failed to check subscription");
            setHasSubscription(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/settings/locations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Data is now array of countries with provinces
                setAvailableCountries(data);
            }
        } catch (error) {
            console.error("Failed to fetch locations");
        }
    };

    const fetchMyAgency = async () => {
        try {
            const token = getAuthToken();
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
                    country: data.country || "Thailand",
                    province: data.province || "",
                    zones: data.zones || []
                });
                // Initialize dependent dropdowns
                if (data.country) {
                    // We need availableCountries to be set, but it might not be ready. 
                    // Ideally we wait for both. But for now let's rely on user interaction or effect.
                    // A better way is to trigger a province update if we have the data.
                    // Since fetchLocations is called effectively in parallel, we might need a useEffect dependence.
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/agencies/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                setAgency(updated);
                setIsEditing(false);
                toast.success(t('common.saved_success'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        try {
            const url = await uploadS3File(e.target.files[0]);
            const token = getAuthToken();
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
            const token = getAuthToken();
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

    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const handleRequestVerification = () => {
        setIsVerificationModalOpen(true);
    };

    const confirmVerification = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/agencies/me/kyc`, {
                method: "POST", headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const updated = await res.json();
                setAgency(updated);
                toast.info(t('common.agency_verify_pending'));
                setIsVerificationModalOpen(false);
            }
        } catch (e) { toast.error("Error"); }
    };

    if (loading) return <div>Loading Agency...</div>;

    return (
        <div className="min-h-screen bg-[#020617] pb-24">
            {/* Subscription Check Blocking - Allow basic view but block editing? Or block entire dashboard? 
               User requested: "Agency must buy plan before using". So we block the main edit interface. 
               We should probably show a nice "Welcome Agency" header then the block. 
            */}

            {(hasSubscription === false && !isFreeMode) && (
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-[#1e1b4b] text-white p-6 pb-8 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-2xl font-bold mb-2">Agency Dashboard</h1>
                            <p className="text-white/60 text-sm">จัดการข้อมูลเอเจนซี่และทีมงานของคุณ</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] border border-white/10 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl">
                        <div className="w-24 h-24 bg-[#F84E6E]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Star size={40} className="text-[#F84E6E] fill-[#F84E6E]" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">{t('dashboard.kyc_required_title')}</h2>
                        <p className="text-white/70 mb-8 leading-relaxed max-w-md mx-auto">
                            {t('dashboard.kyc_required_desc')}
                            <br />
                            <span className="text-sm opacity-60 mt-2 block">(Agency account requires subscription to manage profile)</span>
                        </p>
                        <button
                            onClick={() => router.push('/plans')}
                            className="bg-[#F84E6E] hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-500/30 transition transform hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                            <Zap size={20} className="fill-white" />
                            {t('dashboard.kyc_required_btn')}
                        </button>
                    </div>
                </div>
            )}

            {(hasSubscription === true || hasSubscription === null || isFreeMode) && (
                <>
                    {/* Original Dashboard Content */}
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
                                <h1 className="text-xl font-bold flex items-center gap-2"><Building size={20} /> {t('dashboard.agency_manager')}</h1>
                                <button onClick={onLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
                                    <LogOut size={20} />
                                </button>
                            </div>

                            <div className="flex items-end gap-6 pb-4">
                                <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur p-1 relative group cursor-pointer shadow-lg">
                                    <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden relative">
                                        {agency?.logoUrl ? (
                                            <Image src={getImageUrl(agency.logoUrl)} fill className="object-cover" alt="Logo" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
                                        )}
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs cursor-pointer">
                                            {t('dashboard.agency_change_logo')}
                                            <input type="file" hidden onChange={handleLogoUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold flex items-center gap-2">
                                        {agency?.name || t('dashboard.agency_name')}
                                        {agency?.isVerified && <ShieldCheck className="text-blue-400" size={24} />}
                                    </h2>
                                    <p className="text-white/80 max-w-lg truncate">{agency?.description || t('dashboard.agency_desc')}</p>
                                </div>
                                {/* Edit Cover Trigger */}
                                <label className="absolute top-6 right-16 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs cursor-pointer backdrop-blur transition">
                                    {t('dashboard.agency_change_cover')}
                                    <input type="file" hidden onChange={handleBannerUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sidebar / Stats */}
                            <div className="space-y-6">
                                <div className="bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5">
                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-4">{t('dashboard.agency_stats')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-white"><Users size={16} /> {t('dashboard.agency_members')}</span>
                                            <span className="font-bold text-2xl text-[#F84E6E]">{agency?.creators?.length || 0}</span>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition flex items-center justify-center gap-2"
                                        >
                                            <Edit size={16} /> {t('dashboard.agency_edit')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-2 space-y-6">
                                {isEditing ? (
                                    <div className="bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Edit className="text-[#F84E6E]" /> {t('dashboard.agency_edit')}</h3>
                                        <div className="space-y-4">
                                            <InputField label={t('dashboard.agency_name')} value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.agency_desc')}</label>
                                                <textarea
                                                    value={form.description}
                                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] min-h-[100px]"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.agency_country')}</label>
                                                <select
                                                    value={form.country}
                                                    onChange={(e) => {
                                                        const country = e.target.value;
                                                        setForm({ ...form, country, province: "", zones: [] });
                                                        const selectedCountry = availableCountries.find((c: any) => c.name === country);
                                                        setAvailableLocations(selectedCountry ? selectedCountry.provinces : []);
                                                    }}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                                >
                                                    <option value="">{t('dashboard.select_country')}</option>
                                                    {availableCountries.map((c: any) => (
                                                        <option key={c.code} value={c.name} className="bg-slate-900">{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.agency_province')}</label>
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
                                                    <option value="">{t('dashboard.select_province')}</option>
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
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.agency_zone')}</label>
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
                                                        <div className="col-span-3 text-center text-white/40 py-2">{t('dashboard.no_zone_data')}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label={t('dashboard.agency_phone')} value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} icon={Phone} />
                                            <InputField label={t('dashboard.agency_website')} value={form.website} onChange={(e: any) => setForm({ ...form, website: e.target.value })} icon={Share2} />
                                        </div>

                                        <button onClick={handleUpdate} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4">
                                            {t('dashboard.agency_save')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Users className="text-[#F84E6E]" /> {t('dashboard.agency_member_list')}</h3>

                                        {/* Tabs or Sections */}
                                        <div className="space-y-6">
                                            {/* KYC ALERT */}
                                            {!agency?.isVerified && (
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                                    <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2"><ShieldCheck size={18} /> {t('dashboard.agency_unverified_title')}</h4>
                                                    <p className="text-white/70 text-sm mb-4">{t('dashboard.agency_unverified_desc')}</p>

                                                    {agency?.kycStatus === 'PENDING' ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-bold animate-pulse">
                                                            {t('dashboard.agency_verification_pending')}
                                                        </div>
                                                    ) : agency?.kycStatus === 'REJECTED' ? (
                                                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-3">
                                                            <h5 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2">
                                                                <ShieldCheck size={16} className="rotate-180" /> {t('dashboard.agency_verification_rejected')}
                                                            </h5>
                                                            <p className="text-white/80 text-sm mb-3">
                                                                {t('dashboard.agency_rejection_reason')} <span className="text-white font-medium">{agency.rejectionReason || t('dashboard.agency_no_reason')}</span>
                                                            </p>
                                                            <button
                                                                onClick={handleRequestVerification}
                                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg transition"
                                                            >
                                                                {t('dashboard.agency_resubmit_kyc')}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={handleRequestVerification}
                                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-lg"
                                                        >
                                                            {t('dashboard.agency_submit_kyc')}
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* PENDING REQUESTS */}
                                            {agency?.creators?.filter((c: any) => c.agencyJoinStatus === 'PENDING').length > 0 && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                                    <h4 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">{t('dashboard.agency_pending_requests')} ({agency.creators.filter((c: any) => c.agencyJoinStatus === 'PENDING').length})</h4>
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
                                                                        <p className="text-xs text-white/50">{t('dashboard.agency_request_date')} {new Date(model.updatedAt || Date.now()).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        disabled={!agency.isVerified}
                                                                        onClick={async () => {
                                                                            if (!confirm(t('dashboard.agency_confirm_approve'))) return;
                                                                            try {
                                                                                const token = getAuthToken();
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
                                                                            if (!confirm(t('dashboard.agency_confirm_reject'))) return;
                                                                            try {
                                                                                const token = getAuthToken();
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
                                                <h4 className="text-white/70 font-bold mb-3 text-sm uppercase">{t('dashboard.agency_approved_members')} ({agency?.creators?.filter((c: any) => c.agencyJoinStatus === 'APPROVED').length || 0})</h4>
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
                                                                    <p className="text-xs text-white/50">{t('dashboard.agency_member_status')}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 text-white/30 border border-dashed border-white/10 rounded-xl">{t('dashboard.agency_no_members')}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* KYC Modal */}
                    {isVerificationModalOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                            <div className="bg-[#1e1b4b] w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                        <ShieldCheck className="text-[#F84E6E]" /> {t('dashboard.kyc_title')}
                                    </h3>
                                    <button
                                        onClick={() => setIsVerificationModalOpen(false)}
                                        className="text-white/50 hover:text-white transition"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-[#F84E6E]/10 border border-[#F84E6E]/20 rounded-xl p-4 flex gap-3">
                                        <div className="min-w-[40px] h-10 rounded-full bg-[#F84E6E]/20 flex items-center justify-center text-[#F84E6E]">
                                            <Building size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#F84E6E] text-sm">{t('dashboard.agency_verify_title')}</h4>
                                            <p className="text-xs text-white/70 mt-1">
                                                {t('dashboard.agency_verify_desc')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-center py-4">
                                        <p className="text-white/80 text-sm">
                                            {t('dashboard.kyc_confirm_question')}
                                            <br />
                                            <span className="font-bold text-white">{t('dashboard.kyc_simulate_text')}</span> {t('dashboard.kyc_yes_no')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsVerificationModalOpen(false)}
                                        className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        onClick={confirmVerification}
                                        className="py-3 rounded-xl bg-gradient-to-r from-[#F84E6E] to-[#e11d48] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
                                    >
                                        {t('confirm')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const GENDER_OPTIONS = ["ผู้หญิง", "ผู้ชาย", "LGBTQ+", "Other"];
const SERVICE_TYPES = [
    "Sideline", "N-Kid", "Tour Guide", "Travel", "Rental Girlfriend",
    "Virtual Exciting Call", "Massage", "Naked Maid", "Dinner Date", "Long Term"
];
const SERVICE_TAGS = [
    "Smooching", "BDSM", "Blowjob", "Cum in mouth", "Swallow", "Rimming",
    "Foot Fetish", "Striptease", "Overnight", "Loli", "Outcall", "Roleplay Cosplay"
];

const OPTION_KEYS: Record<string, string> = {
    "ผู้หญิง": "gender_female", "ผู้ชาย": "gender_male", "LGBTQ+": "gender_lgbtq", "Other": "gender_other",
    "Sideline": "service_sideline", "N-Kid": "service_nkid", "Tour Guide": "service_tourguide", "Travel": "service_travel",
    "Rental Girlfriend": "service_girlfriend", "Virtual Exciting Call": "service_vcall", "Massage": "service_massage",
    "Naked Maid": "service_maid", "Dinner Date": "service_dinner", "Long Term": "service_longterm",
    "Smooching": "tag_smooching", "BDSM": "tag_bdsm", "Blowjob": "tag_blowjob", "Cum in mouth": "tag_cim",
    "Swallow": "tag_swallow", "Rimming": "tag_rimming", "Foot Fetish": "tag_foot", "Striptease": "tag_strip",
    "Overnight": "tag_overnight", "Loli": "tag_loli", "Outcall": "tag_outcall", "Roleplay Cosplay": "tag_cosplay"
};

const UserDashboard = ({ user, onLogout }: any) => {
    const { t } = useLanguage();
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
    const [availableCountries, setAvailableCountries] = useState<any[]>([]);

    // Profile Form
    // Profile Form
    const [form, setForm] = useState({
        displayName: user.displayName || "",
        age: user.age || "",
        gender: user.gender || "ผู้หญิง",
        country: user.country || "Thailand",
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
                    const countries = await res.json();
                    setAvailableCountries(countries);

                    // Set initial provinces based on user's country
                    const userCountryName = user.country || "Thailand";
                    const countryData = countries.find((c: any) => c.name === userCountryName);

                    if (countryData) {
                        setAvailableLocations(countryData.provinces);
                        if (user.province) {
                            const loc = countryData.provinces.find((l: any) => l.name === user.province);
                            if (loc) setAvailableZones(loc.zones);
                        }
                    }
                }
            } catch (e) { }

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
            const token = getAuthToken();
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
            const token = getAuthToken();
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
            const token = getAuthToken();
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
            const token = getAuthToken();
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
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                toast.success(t('common.saved_success'));
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
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ avatarUrl: url })
            });

            if (res.ok) {
                const updated = await res.json();
                toast.success(t('common.profile_updated'));
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
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/users/me/preferences`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ preferences })
            });
            if (res.ok) {
                const updated = await res.json();
                toast.success(t('common.saved_success'));
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
        <div className="min-h-screen bg-[#020617]">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1e1b4b]/50 rounded-2xl p-6 shadow-sm border border-white/5">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gray-100 relative mb-4 group cursor-pointer overflow-hidden border-4 border-white shadow-lg">
                                    {user.avatarUrl ? (
                                        <Image src={getImageUrl(user.avatarUrl)} fill className="object-cover" alt="Avatar" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><UserIcon size={40} /></div>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-medium cursor-pointer">
                                        {t('dashboard.change_avatar')}
                                        <input type="file" hidden onChange={handleAvatarUpload} />
                                    </label>
                                </div>
                                <h2 className="font-bold text-lg dark:text-white">{user.displayName}</h2>
                                <p className="text-sm text-gray-500">{user.role || t('common.user')}</p>
                            </div>

                            <nav className="space-y-1">
                                <SidebarItem id="dashboard" label={t('dashboard.tab_dashboard')} icon={Zap} />
                                <SidebarItem id="info" label={t('dashboard.tab_info')} icon={UserIcon} />
                                <SidebarItem id="reviews" label={t('dashboard.tab_reviews')} icon={Star} />
                                <SidebarItem id="favorites" label={t('dashboard.tab_favorites')} icon={Heart} />
                                <SidebarItem id="preferences" label={t('dashboard.filter_settings')} icon={Settings} />
                                {/* <button onClick={() => window.open(telegramUrl, '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 transition">
                                    <Send size={18} /> เข้าร่วมบน Telegram
                                </button> */}
                                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition mt-4">
                                    <LogOut size={18} /> {t('dashboard.logout')}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-[#1e1b4b]/50 rounded-2xl p-6 shadow-sm border border-white/5">
                                    <h2 className="font-bold text-xl mb-2 dark:text-white">{t('dashboard.title')}</h2>
                                    <p className="text-gray-500 text-sm">{t('dashboard.welcome_back')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        onClick={() => setActiveTab('history')}
                                        className="bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-white/5 flex flex-col justify-between h-[140px] cursor-pointer hover:bg-white/5 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-3xl font-bold dark:text-white">{stats.profilesSeen}</span>
                                            <MoreHorizontal size={18} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setActiveTab('reviews')}
                                        className="bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-white/5 flex flex-col justify-between h-[140px] cursor-pointer hover:bg-white/5 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-3xl font-bold dark:text-white">{stats.myReviews}</span>
                                            <MoreHorizontal size={18} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setActiveTab('favorites')}
                                        className="bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-white/5 flex flex-col justify-between h-[140px] cursor-pointer hover:bg-white/5 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-3xl font-bold dark:text-white">{stats.myFavorites}</span>
                                            <MoreHorizontal size={18} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div onClick={() => setActiveTab('preferences')} className="flex flex-col md:flex-row items-center justify-between bg-[#1e1b4b] rounded-3xl p-8 text-white relative overflow-hidden cursor-pointer">
                                    <div className="relative z-10 max-w-lg">
                                        <h2 className="text-3xl font-bold mb-4">{t('dashboard.pref_banner_title')}</h2>
                                        <h3 className="text-xl font-bold mb-4 opacity-90">{t('dashboard.pref_banner_subtitle')}</h3>
                                        <p className="text-yellow-400 text-sm mb-6">{t('dashboard.pref_banner_desc')}</p>
                                        <button className="bg-white text-[#1e1b4b] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                                            {t('dashboard.pref_banner_btn')}
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
                            <div className="bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Edit className="text-[#F84E6E]" /> {t('dashboard.tab_info')}</h3>
                                <div className="space-y-4">
                                    <InputField label={t('dashboard.profile_display_name')} value={form.displayName} onChange={(e: any) => setForm({ ...form, displayName: e.target.value })} icon={UserIcon} />
                                    <div className="grid grid-cols-3 gap-4">
                                        <InputField label={t('dashboard.profile_age')} type="number" value={form.age} onChange={(e: any) => setForm({ ...form, age: Number(e.target.value) })} />
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.profile_gender')}</label>
                                            <select
                                                value={form.gender}
                                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                            >
                                                <option value="Male">{t('dashboard.gender_male_label')}</option>
                                                <option value="Female">{t('dashboard.gender_female_label')}</option>
                                                <option value="LGBTQ">{t('dashboard.gender_lgbtq_label')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.profile_country')}</label>
                                            <select
                                                value={form.country}
                                                onChange={(e) => {
                                                    const country = e.target.value;
                                                    setForm({ ...form, country, province: "", zones: [] });
                                                    const selectedCountry = availableCountries.find((c: any) => c.name === country);
                                                    setAvailableLocations(selectedCountry ? selectedCountry.provinces : []);
                                                    setAvailableZones([]);
                                                }}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                            >
                                                <option value="">{t('dashboard.select_country')}</option>
                                                {availableCountries.map((c: any) => (
                                                    <option key={c.code} value={c.name} className="bg-slate-900">{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.profile_province')}</label>
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
                                                <option value="">{t('dashboard.select_province')}</option>
                                                {availableLocations.map((loc: any) => (
                                                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <InputField label={t('dashboard.profile_location_placeholder')} value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value })} icon={MapPin} />
                                    </div>

                                    {/* Zone Selection */}
                                    {form.province && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.profile_zone')}</label>
                                            <div className="p-4 bg-black/20 rounded-xl border border-white/10 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                                        className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition text-center border ${form.zones?.includes(zone) ? 'bg-[#F84E6E] border-[#F84E6E] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                                                    >
                                                        {zone}
                                                    </div>
                                                )) : (
                                                    <div className="col-span-3 text-center text-gray-400 py-2">{t('dashboard.no_zone_data')}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4">
                                        {loading ? t('common.loading') : t('dashboard.agency_save')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="font-bold text-xl dark:text-white">{t('dashboard.tab_reviews')} ({reviews.length})</h2>
                                {reviews.length > 0 ? (
                                    <div className="grid gap-4">
                                        {reviews.map((review: any) => (
                                            <div key={review._id} className="bg-[#1e1b4b]/50 p-6 rounded-2xl shadow-sm border border-white/5">
                                                <div className="flex justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-white">{t('dashboard.review_to')} {review.creator?.displayName}</h4>
                                                        <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                                                            <Star size={14} fill="currentColor" /> {review.rating?.toFixed(1)}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-300 text-sm mb-4">&quot;{review.comment}&quot;</p>
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
                                        {t('dashboard.no_reviews')}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="font-bold text-xl dark:text-white">{t('dashboard.tab_favorites')} ({favorites.length})</h2>
                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.map((creator: any) => (
                                            <div key={creator._id} onClick={() => router.push(`/sideline/${creator._id}`)} className="bg-[#1e1b4b]/50 p-4 rounded-xl shadow-sm border border-white/5 cursor-pointer hover:bg-white/5 transition flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden relative border border-white/10">
                                                    {(creator.images?.[0] || creator.user?.avatarUrl) && (
                                                        <Image src={getImageUrl(creator.images?.[0] || creator.user?.avatarUrl)} fill className="object-cover" alt="" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{creator.displayName}</h4>
                                                    <p className="text-xs text-[#F84E6E]">{t('dashboard.favorite_label')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        {t('dashboard.no_favorites')}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="font-bold text-xl dark:text-white">{t('dashboard.tab_history')} ({history.length})</h2>
                                {history.length > 0 ? (
                                    <div className="space-y-4">
                                        {history.map((item: any, i: number) => {
                                            // Item might be null if creator deleted, handle gracefully
                                            const creator = item.creator;
                                            if (!creator) return null;

                                            return (
                                                <div key={i} onClick={() => router.push(`/sideline/${creator._id}`)} className="bg-[#1e1b4b]/50 p-4 rounded-xl shadow-sm border border-white/5 cursor-pointer hover:bg-white/5 transition flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden relative">
                                                            {(creator.images?.[0] || creator.user?.avatarUrl) && (
                                                                <Image src={getImageUrl(creator.images?.[0] || creator.user?.avatarUrl)} fill className="object-cover" alt="" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white">{creator.displayName}</h4>
                                                            <p className="text-xs text-gray-500">{t('dashboard.history_viewed')} {new Date(item.viewedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-gray-400" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        {t('dashboard.history_empty')}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-bold text-xl dark:text-white underline-offset-8 underline decoration-[#F84E6E]">{t('dashboard.pref_title')}</h2>
                                    <button
                                        onClick={handleSavePreferences}
                                        disabled={loading}
                                        className="bg-[#F84E6E] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#d43f5b] transition shadow-lg shadow-pink-500/20 disabled:opacity-50"
                                    >
                                        <Save size={18} /> {loading ? t('common.loading') : t('dashboard.pref_save_settings')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Basics & Ranges */}
                                    <div className="space-y-8">
                                        <div className="bg-[#1e1b4b]/50 p-6 rounded-2xl border border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Users size={16} /> {t('dashboard.pref_gender_interest')}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {GENDER_OPTIONS.map(g => (
                                                    <CheckboxField
                                                        key={g}
                                                        label={t(`dashboard.${OPTION_KEYS[g]}`) || g}
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

                                        <div className="bg-[#1e1b4b]/50 p-6 rounded-2xl border border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Scissors size={16} /> {t('dashboard.pref_stats_age')}
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: t('dashboard.profile_age'), key: "ageRange" },
                                                    { label: t('dashboard.pref_height'), key: "heightRange" },
                                                    { label: t('dashboard.pref_weight'), key: "weightRange" },
                                                    { label: t('dashboard.pref_chest'), key: "chestRange" },
                                                    { label: t('dashboard.pref_waist'), key: "waistRange" },
                                                    { label: t('dashboard.pref_hips'), key: "buttsRange" },
                                                ].map((item: any) => (
                                                    <div key={item.key} className="grid grid-cols-2 gap-4">
                                                        <InputField
                                                            label={`${item.label} (${t('dashboard.min')})`}
                                                            type="number"
                                                            value={preferences[item.key].min}
                                                            onChange={(e: any) => setPreferences({
                                                                ...preferences,
                                                                [item.key]: { ...preferences[item.key], min: parseInt(e.target.value) || 0 }
                                                            })}
                                                        />
                                                        <InputField
                                                            label={`${item.label} (${t('dashboard.max')})`}
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
                                        <div className="bg-[#1e1b4b]/50 p-6 rounded-2xl border border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Zap size={16} /> {t('dashboard.pref_service_types')}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {SERVICE_TYPES.map(s => (
                                                    <CheckboxField
                                                        key={s}
                                                        label={t(`dashboard.${OPTION_KEYS[s]}`) || s}
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

                                        <div className="bg-[#1e1b4b]/50 p-6 rounded-2xl border border-white/5 space-y-6">
                                            <h3 className="font-bold text-sm text-[#F84E6E] flex items-center gap-2">
                                                <Hash size={16} /> {t('dashboard.pref_service_tags')}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {SERVICE_TAGS.map(tOption => (
                                                    <CheckboxField
                                                        key={tOption}
                                                        label={t(`dashboard.${OPTION_KEYS[tOption]}`) || tOption}
                                                        checked={preferences.serviceTags.includes(tOption)}
                                                        onChange={(checked: boolean) => {
                                                            const newTags = checked
                                                                ? [...preferences.serviceTags, tOption]
                                                                : preferences.serviceTags.filter((x: string) => x !== tOption);
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

import { getAuthToken } from "../../lib/auth";

export default function Dashboard() {
    const router = useRouter();
    const { t } = useLanguage();
    const [user, setUser] = useState<any>(null);
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });
    const [agencies, setAgencies] = useState<any[]>([]); // List of available agencies
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stories State
    const [stories, setStories] = useState<any[]>([]);
    const [isStoryUploading, setIsStoryUploading] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    // New Post State
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    // Location Data
    const [availableLocations, setAvailableLocations] = useState<any[]>([]);
    const [availableZones, setAvailableZones] = useState<string[]>([]);
    const [availableCountries, setAvailableCountries] = useState<any[]>([]);

    // KYC State
    const [creatorTab, setCreatorTab] = useState<'home' | 'verification'>('home');
    const [kycStatus, setKycStatus] = useState<string>('NONE'); // NONE, PENDING, APPROVED, REJECTED
    const [kycData, setKycData] = useState<any>(null);
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [kycFiles, setKycFiles] = useState<{ code: File | null; body: File | null }>({ code: null, body: null });
    const [kycPreviews, setKycPreviews] = useState<{ code: string; body: string }>({ code: "", body: "" });
    const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

    // Main editForm state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        displayName: string;
        bio: string;
        price: number;
        priceTime: string;
        age: number;
        country: string;
        province: string;
        location: string;
        zones: string[];
        height: string;
        weight: string;
        chest: number;
        waist: number;
        hips: number;
        proportions: string;
        gender: string;
        languages: string[];
        services: string;
        interests: string;
        availability: string;
        isAcceptingWork: boolean;
        lineId: string;
        whatsapp?: string;
        instagram: string;
        phone: string;
        transport: string;
        parking: boolean;
        agency: string;
        packages: { price: number; time: string; details: string; }[];
    }>({
        displayName: "",
        bio: "",
        price: 0,
        priceTime: "",
        age: 0,
        country: "Thailand",
        province: "",
        location: "",
        zones: [],
        height: "",
        weight: "",
        chest: 0,
        waist: 0,
        hips: 0,
        proportions: "",
        gender: "ผู้หญิง",
        languages: [],
        services: "",
        interests: "",
        availability: "",
        isAcceptingWork: true,
        lineId: "",
        whatsapp: "",
        instagram: "",
        phone: "",
        transport: "",
        parking: false,
        agency: "",
        packages: []
    });

    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [hasSubscription, setHasSubscription] = useState<boolean>(false);
    const [isFreeMode, setIsFreeMode] = useState(false);

    useEffect(() => {
        const checkFreeMode = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/settings?key=isFreeMode`);
                const data = await res.json();
                if (data && data.value === 'true') {
                    setIsFreeMode(true);
                }
            } catch (error) {
                console.error("Failed to check free mode");
            }
        };
        checkFreeMode();
    }, []);

    useEffect(() => {
        const init = async () => {
            const token = getAuthToken();
            const storedUser = localStorage.getItem("user");

            if (!token || !storedUser) {
                router.push("/auth");
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "CREATOR" && parsedUser.role !== "AGENCY" && parsedUser.role !== "USER") {
                toast.warn(t('common.unknown_role'));
                router.push("/");
                return;
            }

            setUser(parsedUser);

            // Fetch Locations
            try {
                const res = await fetch(`${API_BASE_URL}/settings/locations`);
                if (res.ok) {
                    const countries = await res.json();
                    setAvailableCountries(countries);

                    // Set initial provinces based on user's country
                    const userCountryName = parsedUser.country || "Thailand";
                    const countryData = countries.find((c: any) => c.name === userCountryName);

                    if (countryData) {
                        setAvailableLocations(countryData.provinces);
                        // Also set zones if user has province
                        if (parsedUser.province) {
                            const loc = countryData.provinces.find((l: any) => l.name === parsedUser.province);
                            if (loc) setAvailableZones(loc.zones);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }

            // If Agency, we don't need to fetch creator profile strictly, but let's keep it safe
            if (parsedUser.role === "CREATOR") {
                fetchCreatorProfile(token);
                checkSubscription(token);
                fetchMyStories();
                fetchKycStatus(token);
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
                const data = await res.json();
                // data is {active, pending}
                if (data && data.active) {
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
            const token = getAuthToken();
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
            const url = await uploadS3File(file, "stories");
            const token = getAuthToken();

            const mediaType = file.type.startsWith('video') ? 'video' : 'image';

            const res = await fetch(`${API_BASE_URL}/stories`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ mediaUrl: url, mediaType })
            });

            if (res.ok) {
                toast.success(t('common.story_uploaded'));
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
        if (!confirm(t('common.confirm_delete_story'))) return;
        try {
            const token = getAuthToken();
            await fetch(`${API_BASE_URL}/stories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchMyStories();
            toast.success(t('common.deleted'));
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
                            // Update available countries
                            setAvailableCountries(locData);

                            // Set available locations based on user country
                            const userCountry = data.country || "Thailand";
                            const countryData = locData.find((c: any) => c.name === userCountry);

                            if (countryData) {
                                setAvailableLocations(countryData.provinces);
                                const found = countryData.provinces.find((l: any) => l.name === data.province);
                                if (found) zonesForProvince = found.zones;
                            }
                        }
                    } catch (e) { }
                }
                setAvailableZones(zonesForProvince);

                setEditForm({
                    displayName: data.displayName || parsedUser.displayName || "",
                    bio: data.bio || "",
                    age: data.age || parsedUser.age || 0,
                    price: data.price || 0,
                    priceTime: data.priceTime || "",
                    country: data.country || "Thailand",
                    province: data.province || "",
                    location: data.location || "",
                    zones: data.zones || [],
                    height: data.height || "",
                    weight: data.weight || "",
                    chest: data.chest || 0,
                    waist: data.waist || 0,
                    hips: data.hips || 0,
                    proportions: data.proportions || "",
                    gender: data.gender || "ผู้หญิง",
                    languages: data.languages || [],
                    services: data.services ? data.services.join(", ") : "",
                    interests: data.interests ? data.interests.join(", ") : "",
                    availability: data.availability || "",
                    isAcceptingWork: data.isAcceptingWork ?? true,
                    lineId: data.lineId || "",
                    whatsapp: data.whatsapp || "",
                    instagram: data.instagram || "",
                    phone: data.phone || "",
                    transport: data.transport || "",
                    parking: data.parking || false,

                    agency: data.agency || "",
                    packages: data.packages || []
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

    const fetchKycStatus = async (token: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/creators/me/kyc`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setKycStatus(data.verificationStatus);
                setKycData(data.verificationData);
                setVerificationCode(data.verificationCode);
            }
        } catch (error) {
            console.error("Failed to fetch KYC status", error);
        }
    };

    const handleKycFileChange = (type: 'code' | 'body', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setKycFiles(prev => ({ ...prev, [type]: file }));
            setKycPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
        }
    };

    const handleKycSubmit = async () => {
        if (!kycFiles.code || !kycFiles.body) return toast.warn(t('common.select_image'));
        setIsSubmittingKyc(true);
        try {
            const token = getAuthToken();
            const photoWithCodeUrl = await uploadS3File(kycFiles.code, "kyc");
            const fullBodyPhotoUrl = await uploadS3File(kycFiles.body, "kyc");

            const res = await fetch(`${API_BASE_URL}/creators/me/kyc`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ photoWithCodeUrl, fullBodyPhotoUrl })
            });

            if (res.ok) {
                const data = await res.json();
                setKycStatus(data.verificationStatus);
                toast.success(t('common.save_success'));
                fetchKycStatus(token || "");
            } else {
                toast.error("Submission failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setIsSubmittingKyc(false);
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
        if (!selectedFile && !previewUrl) return toast.warn(t('common.select_image'));

        setIsPosting(true);
        try {
            const token = getAuthToken();
            let imageUrl = previewUrl;

            if (selectedFile) {
                try {
                    imageUrl = await uploadS3File(selectedFile);
                } catch (err: any) {
                    toast.error(err.message || t('common.upload_failed'));
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
                toast.success(t('common.post_success'));
            } else {
                const err = await res.json();
                if (err.code === 'SUBSCRIPTION_REQUIRED') {
                    toast.error(t('common.subscription_required'));
                    router.push('/plans');
                } else {
                    toast.error(t('common.post_failed'));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setIsPosting(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            const url = await uploadS3File(file);
            const token = getAuthToken();
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
                toast.success(t('common.profile_updated'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.upload_failed'));
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            const url = await uploadS3File(file);
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ bannerUrl: url })
            });

            if (res.ok) {
                setCreator({ ...creator, bannerUrl: url });
                toast.success(t('common.cover_updated'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.upload_failed'));
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        try {
            toast.info(t('common.uploading'));
            const uploadPromises = files.map(file => uploadS3File(file));
            const distinctUrls = await Promise.all(uploadPromises);

            const token = getAuthToken();
            const currentImages = creator?.images || [];
            const newImages = [...currentImages, ...distinctUrls];

            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                setCreator({ ...creator, images: newImages });
                toast.success(t('common.gallery_uploaded'));
            } else {
                const err = await res.json();
                if (err.code === 'SUBSCRIPTION_REQUIRED') {
                    toast.error(t('common.subscription_required'));
                } else {
                    toast.error(t('common.upload_failed'));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.upload_some_failed'));
        }
    };

    const handleGalleryDelete = async (indexToDelete: number) => {
        if (!confirm(t('common.confirm_delete_image'))) return;

        try {
            const currentImages = creator?.images || [];
            const newImages = currentImages.filter((_: any, i: number) => i !== indexToDelete);

            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/creators/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ images: newImages })
            });

            if (res.ok) {
                setCreator({ ...creator, images: newImages });
                toast.success(t('common.delete_image_success'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.delete_image_failed'));
        }
    };



    const handleProfileUpdate = async () => {
        if (kycStatus !== 'APPROVED') {
            toast.error(t('dashboard.kyc_required_desc'));
            return;
        }

        if (editForm.age < 20) {
            toast.error(t('auth.age_restriction') || "ต้องมีอายุ 20 ปีขึ้นไป");
            return;
        }

        try {
            const token = getAuthToken();
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
                toast.success(t('common.save_success'));
            } else {
                toast.error(t('common.save_failed'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        }
    };

    const handleToggleAvailability = async () => {
        try {
            const token = getAuthToken();
            const newStatus = creator?.isAcceptingWork === false; // Toggle logic: if false -> true, if true/undefined -> false (wait, undefined means true usually, so we want to toggle to FALSE if currently true/undefined)
            // Correction: if creator.isAcceptingWork !== false (meaning it is true or undefined) -> we want to set it to FALSE.
            // If creator.isAcceptingWork === false -> we want to set it to TRUE.

            const isCurrentlyAccepting = creator?.isAcceptingWork !== false;
            const payload = { isAcceptingWork: !isCurrentlyAccepting };

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
                setCreator({ ...creator, isAcceptingWork: updated.isAcceptingWork });
                // Also update editForm to reflect the change if user opens edit mode
                setEditForm(prev => ({ ...prev, isAcceptingWork: updated.isAcceptingWork }));
                toast.success(updated.isAcceptingWork ? t('dashboard.creator_now_accepting') : t('dashboard.creator_stopped_accepting'));
            } else {
                toast.error(t('common.error'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        }
    };

    const handleShareProfile = async () => {
        if (!creator?._id) return;

        const shareUrl = `${window.location.origin}/sideline/${creator._id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${creator.displayName}'s profile on Phusao`,
                    text: `Visit ${creator.displayName} on Phusao!`,
                    url: shareUrl
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success(t('dashboard.copy_link_success'));
            } catch (err) {
                toast.error(t('dashboard.copy_link_failed'));
            }
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
        <div className="min-h-screen bg-[#020617] pb-24">
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
                            <h1 className="text-2xl font-bold">{t('dashboard.creator_title')}</h1>
                            <p className="text-white/60 text-sm">{t('dashboard.creator_subtitle')}</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md cursor-pointer">
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 shrink-0 rounded-full bg-white/10 backdrop-blur p-1 relative group cursor-pointer shadow-lg animate-in zoom-in-50 duration-500">
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
                                    {t('dashboard.creator_change_photo')}
                                    <input type="file" hidden onChange={handleAvatarUpload} />
                                </label>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-[#1e1b4b] flex items-center justify-center">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-3xl font-bold">{creator?.displayName || user?.username}</h2>
                            <p className="text-white/70 text-sm max-w-xs truncate">{creator?.bio || t('dashboard.creator_no_bio')}</p>

                            {/* Tags or Badges */}
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-1 bg-white/10 rounded text-[10px] backdrop-blur font-medium">AGE: {creator?.age || "-"}</span>
                                <span className="px-2 py-1 bg-white/10 rounded text-[10px] backdrop-blur font-medium flex items-center gap-1"><MapPin size={10} /> {creator?.location || "-"}</span>
                                {creator?.isVerified && <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] backdrop-blur font-medium flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>}
                                {creator?.isAcceptingWork !== false ? (
                                    <button onClick={handleToggleAvailability} className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-[10px] backdrop-blur font-medium flex items-center gap-1 hover:bg-green-500/30 transition cursor-pointer">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {t('dashboard.creator_accepting_work')}
                                    </button>
                                ) : (
                                    <button onClick={handleToggleAvailability} className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[10px] backdrop-blur font-medium flex items-center gap-1 hover:bg-red-500/30 transition cursor-pointer">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {t('dashboard.creator_not_accepting_work')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Banner Edit Trigger (Absolute) */}
                        <label className="absolute bottom-0 right-0 mb-8 mr-0 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs cursor-pointer backdrop-blur transition flex items-center gap-2">
                            <Camera size={14} /> {t('dashboard.creator_change_cover')}
                            <input type="file" hidden onChange={handleBannerUpload} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 -mt-10 relative z-20">
                {/* Tab Navigation */}
                <div className="flex p-1 bg-[#1e1b4b]/80 backdrop-blur rounded-xl border border-white/10 mb-6 shadow-lg">
                    <button
                        onClick={() => setCreatorTab('home')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${creatorTab === 'home' ? 'bg-[#F84E6E] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                    >
                        {t('nav.profile')}
                    </button>
                    <button
                        onClick={() => setCreatorTab('verification')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${creatorTab === 'verification' ? 'bg-[#F84E6E] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                    >
                        <ShieldCheck size={16} />
                        {t('dashboard.kyc_title')}
                        {kycStatus === 'PENDING' && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                    </button>
                </div>

                {creatorTab === 'verification' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-[#1e1b4b]/80 backdrop-blur p-6 rounded-2xl border border-white/5 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-2">{t('dashboard.kyc_title')}</h2>
                            <p className="text-sm text-white/60 mb-6">{t('dashboard.kyc_intro')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-[#F84E6E] text-sm mb-1">01</h4>
                                    <p className="text-xs text-white/70">{t('dashboard.kyc_benefit_1')}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-[#F84E6E] text-sm mb-1">02</h4>
                                    <p className="text-xs text-white/70">{t('dashboard.kyc_benefit_2')}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-[#F84E6E] text-sm mb-1">03</h4>
                                    <p className="text-xs text-white/70">{t('dashboard.kyc_benefit_3')}</p>
                                </div>
                            </div>

                            {kycStatus === 'APPROVED' ? (
                                <div className="bg-green-500/20 border border-green-500/30 p-8 rounded-2xl text-center">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                                        <Check size={40} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{t('dashboard.agency_verification_approved')}</h3>
                                    <p className="text-green-200">{t('dashboard.kyc_approved_desc')}</p>
                                </div>
                            ) : kycStatus === 'PENDING' ? (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-2xl text-center">
                                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <ShieldCheck size={40} className="text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t('dashboard.agency_verification_pending')}</h3>
                                    <p className="text-white/60">{t('dashboard.kyc_pending_desc')}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {kycStatus === 'REJECTED' && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                            <LogOut size={24} className="text-red-500" />
                                            <div>
                                                <h4 className="font-bold text-red-500">{t('dashboard.agency_verification_rejected')}</h4>
                                                <p className="text-xs text-white/70">{t('dashboard.kyc_rejected_desc')}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Card 1: Code */}
                                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-white">{t('dashboard.kyc_step_1_title')}</h3>
                                                <span className="bg-[#F84E6E] text-white text-xs px-2 py-1 rounded font-bold whitespace-nowrap">{t('dashboard.kyc_step_1_label')}</span>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-xl text-center mb-4">
                                                <p className="text-xs text-white/50 mb-2">{t('dashboard.kyc_code_instruct')}</p>
                                                {verificationCode ? (
                                                    <div className="text-2xl font-mono font-bold text-[#F84E6E] tracking-widest">{verificationCode}</div>
                                                ) : (
                                                    <div className="h-8 bg-white/10 rounded animate-pulse w-32 mx-auto"></div>
                                                )}
                                            </div>

                                            <p className="text-xs text-white/50 mb-4">{t('dashboard.kyc_guideline_1')}</p>

                                            <div className="aspect-[3/4] bg-black/40 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                                {kycPreviews.code ? (
                                                    <Image src={kycPreviews.code} fill className="object-cover" alt="Preview" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <Camera size={32} className="text-white/20 mx-auto mb-2" />
                                                        <span className="text-xs text-white/30">{t('dashboard.kyc_upload_btn')}</span>
                                                    </div>
                                                )}
                                                <input type="file" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => handleKycFileChange('code', e)} accept="image/*" />
                                            </div>
                                        </div>

                                        {/* Card 2: Body */}
                                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-white">{t('dashboard.kyc_step_2_title')}</h3>
                                                <span className="bg-[#F84E6E] text-white text-xs px-2 py-1 rounded font-bold whitespace-nowrap">{t('dashboard.kyc_step_2_label')}</span>
                                            </div>

                                            <p className="text-xs text-white/50 mb-7">{t('dashboard.kyc_guideline_3')}</p>

                                            <div className="aspect-[3/4] bg-black/40 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                                {kycPreviews.body ? (
                                                    <Image src={kycPreviews.body} fill className="object-cover" alt="Preview" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <UserIcon size={32} className="text-white/20 mx-auto mb-2" />
                                                        <span className="text-xs text-white/30">{t('dashboard.kyc_upload_btn')}</span>
                                                    </div>
                                                )}
                                                <input type="file" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => handleKycFileChange('body', e)} accept="image/*" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-white/40 max-w-xs">{t('dashboard.kyc_confirm_question')}</p>
                                            <button
                                                onClick={handleKycSubmit}
                                                disabled={isSubmittingKyc || !kycFiles.code || !kycFiles.body}
                                                className="bg-[#F84E6E] hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                            >
                                                {isSubmittingKyc ? t('common.loading') : t('dashboard.kyc_submit')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {creatorTab === 'home' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-[#1e1b4b]/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/5 text-center">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">{t('dashboard.creator_stats_posts')}</h3>
                                <p className="text-2xl font-bold text-white">{stats.posts}</p>
                            </div>
                            <div className="bg-[#1e1b4b]/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/5 text-center">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">{t('dashboard.creator_stats_likes')}</h3>
                                <p className="text-2xl font-bold text-white">{stats.likes}</p>
                            </div>
                            <div className="bg-[#1e1b4b]/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/5 text-center">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">{t('dashboard.creator_stats_views')}</h3>
                                <p className="text-2xl font-bold text-white">{stats.views}</p>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="bg-[#1e1b4b]/80 backdrop-blur rounded-3xl p-6 shadow-xl border border-white/5 animate-in fade-in slide-in-from-bottom-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Edit className="text-[#F84E6E]" /> {t('dashboard.creator_edit_profile')}</h3>
                                    <button onClick={() => setIsEditing(false)} className="text-sm text-gray-400 hover:text-white cursor-pointer">{t('dashboard.creator_cancel')}</button>
                                </div>

                                <div className="space-y-5">
                                    <InputField label={t('dashboard.creator_display_name')} value={editForm.displayName} onChange={(e: any) => setEditForm({ ...editForm, displayName: e.target.value })} />

                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-white mb-1">{t('dashboard.creator_accepting_work')}?</h4>
                                            <p className="text-xs text-white/50">{editForm.isAcceptingWork ? t('dashboard.creator_accepting_work') : t('dashboard.creator_not_accepting_work')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={editForm.isAcceptingWork}
                                                onChange={(e) => setEditForm({ ...editForm, isAcceptingWork: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F84E6E]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F84E6E]"></div>
                                        </label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.creator_bio')}</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] min-h-[100px] text-sm"
                                            placeholder={t('dashboard.creator_bio_placeholder')}
                                        />
                                        <p className="text-red-500 text-xs ml-1">{t('dashboard.creator_bio_warning')}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <InputField label={t('dashboard.creator_age')} type="number" min={20} value={editForm.age} onChange={(e: any) => setEditForm({ ...editForm, age: parseInt(e.target.value) })} />
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.creator_gender')}</label>
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                            >
                                                {GENDER_OPTIONS.map(g => (
                                                    <option key={g} value={g} className="bg-slate-900">{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputField label={t('dashboard.creator_price_start')} type="number" value={editForm.price} onChange={(e: any) => setEditForm({ ...editForm, price: parseInt(e.target.value) })} icon={DollarSign} />
                                        <InputField label={t('dashboard.creator_duration')} value={editForm.priceTime || ''} onChange={(e: any) => setEditForm({ ...editForm, priceTime: e.target.value })} placeholder={t('dashboard.creator_duration_placeholder')} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.profile_country')}</label>
                                                <select
                                                    value={editForm.country}
                                                    onChange={(e) => {
                                                        const country = e.target.value;
                                                        setEditForm({ ...editForm, country, province: "", zones: [] });
                                                        const selectedCountry = availableCountries.find((c: any) => c.name === country);
                                                        setAvailableLocations(selectedCountry ? selectedCountry.provinces : []);
                                                        setAvailableZones([]);
                                                    }}
                                                    disabled={!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')}
                                                    className={`w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none ${(!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value="" className="bg-slate-900">{t('dashboard.profile_country')}</option>
                                                    {availableCountries.map((c: any) => (
                                                        <option key={c.code} value={c.name} className="bg-slate-900">{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.profile_province')}</label>
                                                <select
                                                    value={editForm.province}
                                                    onChange={(e) => {
                                                        const prov = e.target.value;
                                                        setEditForm({ ...editForm, province: prov, zones: [] });
                                                        const selectedLoc = availableLocations.find((l: any) => l.name === prov);
                                                        setAvailableZones(selectedLoc ? selectedLoc.zones : []);
                                                    }}
                                                    disabled={!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')}
                                                    className={`w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none ${(!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value="" className="bg-slate-900">{t('dashboard.profile_province')}</option>
                                                    {availableLocations.map((loc: any) => (
                                                        <option key={loc.id} value={loc.name} className="bg-slate-900">{loc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <InputField label={t('dashboard.creator_location')} value={editForm.location} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} icon={MapPin} />
                                        </div>

                                        {/* Zones Selection */}
                                        {editForm.province && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.agency_zone')}</label>

                                                {!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED') ? (
                                                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                                                        <p className="text-yellow-500 text-xs flex items-center justify-center gap-2">
                                                            <Zap size={14} />
                                                            {isFreeMode ? t('dashboard.kyc_required') : t('dashboard.creator_zone_required')}
                                                        </p>
                                                    </div>
                                                ) : (
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
                                                            <div className="col-span-3 text-center text-white/40 py-2">{t('dashboard.no_zone_data')}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="col-span-2">
                                            <label className="text-xs font-medium text-white/70 ml-1 mb-1 block">{t('dashboard.creator_proportions')}</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <InputField label={t('dashboard.creator_chest')} type="number" value={editForm.chest} onChange={(e: any) => setEditForm({ ...editForm, chest: parseInt(e.target.value) })} />
                                                <InputField label={t('dashboard.creator_waist')} type="number" value={editForm.waist} onChange={(e: any) => setEditForm({ ...editForm, waist: parseInt(e.target.value) })} />
                                                <InputField label={t('dashboard.creator_hips')} type="number" value={editForm.hips} onChange={(e: any) => setEditForm({ ...editForm, hips: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label={t('dashboard.creator_height')} value={editForm.height} onChange={(e: any) => setEditForm({ ...editForm, height: e.target.value })} />
                                        <InputField label={t('dashboard.creator_weight')} value={editForm.weight} onChange={(e: any) => setEditForm({ ...editForm, weight: e.target.value })} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.creator_services')}</label>
                                        <input
                                            value={editForm.services}
                                            onChange={(e) => setEditForm({ ...editForm, services: e.target.value })}
                                            placeholder={t('dashboard.creator_services_placeholder')}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm"
                                        />
                                        <p className="text-[10px] text-white/40 ml-1">{t('dashboard.creator_services_hint')}</p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <label className="text-xs font-medium text-white/70 ml-1">{t('dashboard.creator_contact_info')}</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputField
                                                label={t('dashboard.contact_line_id')}
                                                value={editForm.lineId}
                                                onChange={(e: any) => setEditForm({ ...editForm, lineId: e.target.value })}
                                                placeholder={t('dashboard.contact_line_id_placeholder')}
                                            />
                                            <InputField
                                                label={t('dashboard.contact_whatsapp')}
                                                value={editForm.whatsapp || ''}
                                                onChange={(e: any) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                                                placeholder={t('dashboard.contact_whatsapp_placeholder')}
                                            />
                                            <InputField
                                                label={t('dashboard.contact_instagram')}
                                                value={editForm.instagram}
                                                onChange={(e: any) => setEditForm({ ...editForm, instagram: e.target.value })}
                                                placeholder={t('dashboard.contact_instagram_placeholder')}
                                            />
                                            <InputField
                                                label={t('dashboard.creator_phone')}
                                                value={editForm.phone}
                                                onChange={(e: any) => setEditForm({ ...editForm, phone: e.target.value })}
                                                placeholder={t('dashboard.creator_phone_placeholder')}
                                            />
                                        </div>
                                    </div>

                                    {/* Package Management */}
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <label className="text-xs font-medium text-white/70 ml-1 flex items-center gap-1">
                                            <Zap size={12} /> {t('dashboard.creator_packages')}
                                        </label>

                                        <div className="space-y-3">
                                            {editForm.packages.map((pkg, idx) => (
                                                <div key={idx} className="bg-black/20 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                                        <div className="col-span-1">
                                                            <span className="text-[10px] text-white/40 block">{t('dashboard.creator_package_price')}</span>
                                                            <input
                                                                type="number"
                                                                value={pkg.price}
                                                                onChange={(e) => {
                                                                    const newPackages = [...editForm.packages];
                                                                    newPackages[idx].price = Number(e.target.value);
                                                                    setEditForm({ ...editForm, packages: newPackages });
                                                                }}
                                                                className="w-full bg-transparent border-b border-white/10 text-white text-sm focus:outline-none focus:border-[#F84E6E]"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <span className="text-[10px] text-white/40 block">{t('dashboard.creator_package_time')}</span>
                                                            <input
                                                                type="text"
                                                                value={pkg.time}
                                                                onChange={(e) => {
                                                                    const newPackages = [...editForm.packages];
                                                                    newPackages[idx].time = e.target.value;
                                                                    setEditForm({ ...editForm, packages: newPackages });
                                                                }}
                                                                placeholder={t('dashboard.creator_package_time_placeholder')}
                                                                className="w-full bg-transparent border-b border-white/10 text-white text-sm focus:outline-none focus:border-[#F84E6E]"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <span className="text-[10px] text-white/40 block">{t('dashboard.creator_package_details')}</span>
                                                            <input
                                                                type="text"
                                                                value={pkg.details}
                                                                onChange={(e) => {
                                                                    const newPackages = [...editForm.packages];
                                                                    newPackages[idx].details = e.target.value;
                                                                    setEditForm({ ...editForm, packages: newPackages });
                                                                }}
                                                                placeholder={t('dashboard.creator_package_details_placeholder')}
                                                                className="w-full bg-transparent border-b border-white/10 text-white text-sm focus:outline-none focus:border-[#F84E6E]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newPackages = editForm.packages.filter((_, i) => i !== idx);
                                                            setEditForm({ ...editForm, packages: newPackages });
                                                        }}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => setEditForm({
                                                    ...editForm,
                                                    packages: [...editForm.packages, { price: 0, time: "", details: "" }]
                                                })}
                                                className="w-full py-2 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 transition text-xs font-bold flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> {t('dashboard.creator_add_package')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Agency Integration */}
                                    <div className="space-y-1.5 pt-2 border-t border-white/5 mt-4">
                                        <label className="text-xs font-medium text-white/70 ml-1 flex items-center gap-1"><Building size={12} /> {t('dashboard.creator_agency')}</label>
                                        <select
                                            value={editForm.agency}
                                            onChange={(e) => setEditForm({ ...editForm, agency: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F84E6E] text-sm appearance-none"
                                        >
                                            <option value="" className="bg-slate-900 text-white">{t('dashboard.creator_no_agency')}</option>
                                            {agencies.map((agency) => (
                                                <option key={agency._id} value={agency._id} className="bg-slate-900 text-white">
                                                    {agency.name} {agency.isVerified ? '✅' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-yellow-500/80 ml-1">{t('dashboard.creator_agency_hint')}</p>
                                    </div>
                                    {/* 2. Gallery */}
                                    <section className="space-y-4">
                                        <h3 className="text-[#F84E6E] font-bold text-sm uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14} /> {t('dashboard.creator_gallery')}</h3>
                                        <p className="text-red-500 text-xs">{t('dashboard.creator_gallery_warning')}</p>
                                        {/* Subscription Barrier for Gallery */}
                                        {!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED') && (
                                            <div className="text-center py-4 px-2 border border-yellow-500/30 bg-yellow-500/10 rounded-xl mb-2">
                                                <p className="text-yellow-500 text-xs">{isFreeMode ? t('dashboard.kyc_required') : t('dashboard.creator_gallery_required')}</p>
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
                                            <label className={`aspect-square rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition ${(!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Plus className="text-white/30" />
                                                <span className="text-[10px] text-white/30 font-medium">{t('dashboard.creator_add_image')}</span>
                                                <input type="file" multiple accept="image/*" hidden onChange={handleGalleryUpload} disabled={!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')} />
                                            </label>
                                        </div>
                                    </section>

                                    <button onClick={handleProfileUpdate} className="w-full bg-[#F84E6E] text-white py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-pink-500/20 mt-4 text-sm">
                                        {t('dashboard.creator_save_changes')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 gap-4">
                                    {kycStatus === 'APPROVED' ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-[#1e1b4b]/50 backdrop-blur border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                        >
                                            <Edit size={18} className="text-[#F84E6E]" /> {t('dashboard.creator_edit_profile')}
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3">
                                                <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-500">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white text-sm">{t('dashboard.kyc_required_title')}</h4>
                                                    <p className="text-xs text-white/60">{t('dashboard.kyc_required_desc')}</p>
                                                </div>
                                                <button
                                                    onClick={() => setCreatorTab('verification')}
                                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg transition"
                                                >
                                                    {t('dashboard.kyc_required_btn')}
                                                </button>
                                            </div>

                                            <button
                                                disabled
                                                className="w-full bg-[#1e1b4b]/30 border border-white/5 text-white/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                                            >
                                                <Edit size={18} /> {t('dashboard.creator_edit_profile')}
                                            </button>
                                        </div>
                                    )}

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
                                                <h4 className="text-yellow-400 font-bold text-sm">{t('dashboard.creator_active_subscription')}</h4>
                                                <p className="text-yellow-200/60 text-xs">{t('dashboard.creator_subscription_desc')}</p>
                                            </div>
                                        </div>
                                        {/* <button className="text-xs bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-lg">View Plan</button> */}
                                    </div>
                                )}

                                {/* Free Mode Upsell Banner */}
                                {(!hasSubscription && isFreeMode && kycStatus === 'APPROVED') && (
                                    <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#F84E6E]/50 transition cursor-pointer mb-6" onClick={() => router.push('/plans')}>
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-500">
                                            <Star size={100} className="fill-white" />
                                        </div>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-[#F84E6E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t('dashboard.boost_rank')}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{t('dashboard.want_to_be_superstar')}</h3>
                                                <p className="text-white/70 text-sm max-w-md">{t('dashboard.superstar_benefits')}</p>
                                            </div>
                                            <div className="bg-white text-black rounded-full p-3 shadow-lg group-hover:scale-110 transition transform">
                                                <Zap size={24} className="fill-[#F84E6E] text-[#F84E6E]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* New Post Input */}
                                <div className="bg-[#1e1b4b]/80 backdrop-blur rounded-2xl p-4 shadow-xl border border-white/5">
                                    {/* Subscription Barrier */}
                                    {!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED') && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center animate-pulse mb-4">
                                            {kycStatus === 'APPROVED' ? (
                                                <>
                                                    <h3 className="text-yellow-500 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                                        <Zap /> {t('dashboard.creator_select_package_title')}
                                                    </h3>
                                                    <p className="text-white/70 mb-4">{t('dashboard.creator_select_package_desc')}</p>
                                                    <button
                                                        onClick={() => router.push('/plans')}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-full shadow-lg transition"
                                                    >
                                                        {t('dashboard.creator_select_package_btn')}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="text-yellow-500 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                                        <ShieldCheck /> {t('dashboard.kyc_required_title')}
                                                    </h3>
                                                    <p className="text-white/70 mb-4">{t('dashboard.kyc_required_desc')}</p>
                                                    <button
                                                        onClick={() => setCreatorTab('verification')}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-full shadow-lg transition"
                                                    >
                                                        {t('dashboard.kyc_required_btn')}
                                                    </button>
                                                </>
                                            )}
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
                                                    placeholder={t('dashboard.creator_post_placeholder')}
                                                    className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none mb-3 py-2"
                                                    disabled={!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')}
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
                                                    <label className={`flex items-center gap-2 text-sm text-[#F84E6E] font-medium hover:text-pink-400 cursor-pointer ${(!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <ImageIcon size={18} />
                                                        {t('dashboard.creator_add_image_btn')}
                                                        <input type="file" accept="image/*" hidden onChange={handleFileSelect} disabled={!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED')} />
                                                    </label>
                                                    <button
                                                        type="submit"
                                                        disabled={(!caption && !selectedFile) || isPosting || (!hasSubscription && (!isFreeMode || kycStatus !== 'APPROVED'))}
                                                        className="bg-[#F84E6E] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition flex items-center gap-2"
                                                    >
                                                        {isPosting ? t('dashboard.creator_post_btn_loading') : <><Send size={16} /> {t('dashboard.creator_post_btn')}</>}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Stories Section */}
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">{t('dashboard.creator_stories_title')}</span>
                                    </h3>

                                    {/* Subscription Barrier */}
                                    {!hasSubscription && !isFreeMode ? (
                                        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-center">
                                            <p className="text-yellow-500 text-sm">{t('dashboard.creator_story_required')}</p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                            {/* Add Story Button */}
                                            <div className="flex-shrink-0 w-24 h-40 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition group relative overflow-hidden">
                                                <div className="w-10 h-10 rounded-full bg-[#F84E6E] flex items-center justify-center text-white group-hover:scale-110 transition">
                                                    {isStoryUploading ? <div className="animate-spin text-xl">C</div> : <Plus size={24} />}
                                                </div>
                                                <span className="text-xs text-white/70 font-medium">{t('dashboard.creator_add_story')}</span>
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
                                                <div
                                                    key={story._id}
                                                    className="flex-shrink-0 w-24 h-40 rounded-xl bg-gray-900 border border-white/10 relative group overflow-hidden cursor-pointer"
                                                    onClick={() => {
                                                        const myStoryIndex = stories.findIndex(s => s._id === story._id);
                                                        setSelectedStoryIndex(myStoryIndex);
                                                    }}
                                                >
                                                    {story.mediaType === 'video' ? (
                                                        <video src={getImageUrl(story.mediaUrl)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Image src={getImageUrl(story.mediaUrl)} fill className="object-cover" alt="Story" />
                                                    )}

                                                    {/* Time Label */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                        <span className="text-[10px] text-white/90 font-medium">
                                                            {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Delete Button (Top Right) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStoryDelete(story._id);
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-black/40 hover:bg-red-500 backdrop-blur-md rounded-full text-white/70 hover:text-white transition opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Posts Feed */}
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2"><ImageIcon size={20} className="text-[#F84E6E]" /> {t('dashboard.creator_stats_posts')}</h3>

                                    {myPosts.length > 0 ? (
                                        myPosts.map((post) => (
                                            <div key={post._id} className="bg-[#1e1b4b]/80 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-white/5">
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
                                            <p className="text-white/30">{t('dashboard.no_posts_yet')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Story Viewer in Dashboard */}
            {selectedStoryIndex !== null && (
                <StoryViewer
                    creators={[{
                        _id: creator?._id || "me",
                        displayName: creator?.displayName || user?.username || t('dashboard.me'),
                        user: { avatarUrl: user?.avatarUrl, username: user?.username || t('dashboard.me') },
                        stories: stories
                    }]}
                    initialCreatorIndex={0}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </div>
    );
}
