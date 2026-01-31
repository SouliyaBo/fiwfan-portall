"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Clock, DollarSign, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from "../../../contexts/LanguageContext";
import { API_BASE_URL } from '../../../lib/constants';
import { getAuthToken } from "../../../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateJobPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [form, setForm] = useState({
        content: '',
        budget: '',
        location: '',
        lineId: '',
        whatsapp: '',
        images: [] as string[]
    });
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [checkingPlan, setCheckingPlan] = useState(true);

    useEffect(() => {
        checkPlan();
    }, []);

    const checkPlan = async () => {
        const token = getAuthToken();
        if (!token) return router.push('/auth?mode=login&callbackUrl=/jobs/create');

        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                // Check if user has tourist plan
                if (user.planId && user.planId.startsWith('TOURIST_')) {
                    setPlan(user);
                    setCheckingPlan(false);
                } else {
                    // Redirect to buy plan
                    return router.push('/plans/tourist');
                }
            } else {
                router.push('/plans/tourist');
            }
        } catch (error) {
            console.error(error);
            router.push('/plans/tourist');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedImages(prev => [...prev, ...files]);

            const previews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...previews]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = getAuthToken();

        try {
            // Upload images first
            const imageUrls = [];
            if (uploadedImages.length > 0) {
                const formData = new FormData();
                uploadedImages.forEach(file => formData.append('images', file));

                const uploadRes = await fetch(`${API_BASE_URL}/upload/multiple`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    imageUrls.push(...data.urls);
                }
            }

            // Create Job
            const res = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    budget: Number(form.budget),
                    images: imageUrls,
                    planId: plan?.planId
                })
            });

            if (res.ok) {
                toast.success(t('tourist.success_msg'));
                router.push('/');
            } else {
                const errorData = await res.json();
                if (errorData.code === 'JOB_LIMIT_REACHED') {
                    toast.error(t('tourist.job_limit_reached'));
                } else {
                    toast.error(t('tourist.create_failed'));
                }
            }

        } catch (error) {
            console.error(error);
            toast.error(t('tourist.create_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    if (checkingPlan) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden py-8 px-4 flex items-center justify-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
            </div>

            <div className="container mx-auto max-w-2xl relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-8 group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">{t('common.cancel')}</span>
                </button>

                <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-10 shadow-2xl border border-white/10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-6 shadow-lg shadow-pink-500/30">
                            <span className="text-3xl">✨</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{t('tourist.post_request')}</h1>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-md mx-auto">{t('tourist.find_entertainment_desc')}</p>
                    </div>

                    {plan && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-6 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                    <Clock size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Current Plan</span>
                                    <span className="font-bold text-white text-lg">{t(`plan_names.${plan.planId}`)}</span>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Content */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_content_label')}</label>
                            <div className="relative group">
                                <textarea
                                    required
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    rows={5}
                                    className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition resize-none outline-none"
                                    placeholder={t('tourist.form_content_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Budget */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_budget_label')}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-focus-within:bg-pink-500 group-focus-within:text-white transition">
                                        <DollarSign size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={form.budget}
                                        onChange={e => setForm({ ...form, budget: e.target.value })}
                                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition outline-none"
                                        placeholder="3000"
                                    />
                                </div>
                            </div>

                            {/* Line ID */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_line_label')}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-focus-within:bg-green-500 group-focus-within:text-white transition">
                                        <MessageCircle size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.lineId}
                                        onChange={e => setForm({ ...form, lineId: e.target.value })}
                                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition outline-none"
                                        placeholder="Line ID"
                                    />
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_whatsapp_label')}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-focus-within:bg-green-500 group-focus-within:text-white transition">
                                        <MessageCircle size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={form.whatsapp}
                                        onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition outline-none"
                                        placeholder="WhatsApp"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_location_label')}</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-focus-within:bg-purple-500 group-focus-within:text-white transition">
                                    <MapPin size={16} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition outline-none"
                                    placeholder={t('tourist.form_location_placeholder')}
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_images_label')}</label>
                            <div className="grid grid-cols-4 gap-3 bg-black/20 border border-white/10 rounded-2xl p-4">
                                {previewImages.map((src, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-zinc-900 relative group border border-white/10">
                                        <img src={src} className="w-full h-full object-cover transition transform group-hover:scale-110" />
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/5 transition group">
                                    <Upload size={24} className="mb-1 group-hover:scale-110 transition" />
                                    <span className="text-xs font-medium">Add</span>
                                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-pink-600/20 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span>{t('tourist.submit_btn')}</span>
                                    <span className="group-hover:translate-x-1 transition">🚀</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
