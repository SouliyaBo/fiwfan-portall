"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Clock, DollarSign, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from "../../../contexts/LanguageContext";
import { API_BASE_URL } from '../../../lib/constants';
import { getAuthToken } from "../../../lib/auth";

export default function CreateJobPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [form, setForm] = useState({
        content: '',
        budget: '',
        location: '',
        lineId: '',
        images: [] as string[]
    });
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [remainingTime, setRemainingTime] = useState("");
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
                alert(t('tourist.success_msg'));
                router.push('/');
            } else {
                alert(t('common.error'));
            }

        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (checkingPlan) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition mb-6"
                >
                    <ArrowLeft size={20} />
                    <span>{t('common.cancel')}</span>
                </button>

                <div className="bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-xl border border-white/5">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">{t('tourist.post_request')}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">{t('tourist.find_entertainment_desc')}</p>
                    </div>

                    {plan && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl mb-6 flex items-center justify-between text-sm">
                            <span className="font-bold">{t('tourist.active_plan')} {t(`plan_names.${plan.planId}`)}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('tourist.form_content_label')}</label>
                            <textarea
                                required
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                rows={4}
                                className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                                placeholder={t('tourist.form_content_placeholder')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('tourist.form_budget_label')}</label>
                                <div className="relative">
                                    <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="number"
                                        required
                                        value={form.budget}
                                        onChange={e => setForm({ ...form, budget: e.target.value })}
                                        className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                                        placeholder="3000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('tourist.form_line_label')}</label>
                                <div className="relative">
                                    <MessageCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        required
                                        value={form.lineId}
                                        onChange={e => setForm({ ...form, lineId: e.target.value })}
                                        className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                                        placeholder="Line ID"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('tourist.form_location_label')}</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    required
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                                    placeholder={t('tourist.form_location_placeholder')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('tourist.form_images_label')}</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                                {previewImages.map((src, i) => (
                                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                                        <img src={src} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:border-pink-500 hover:text-pink-500 transition flex-shrink-0">
                                    <Upload size={20} />
                                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? t('tourist.submitting') : t('tourist.submit_btn')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
