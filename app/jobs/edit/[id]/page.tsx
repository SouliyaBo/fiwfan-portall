"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, DollarSign, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from "../../../../contexts/LanguageContext";
import { API_BASE_URL } from '../../../../lib/constants';
import { getAuthToken } from "../../../../lib/auth";
import { getImageUrl } from "../../../../lib/images";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditJobPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        content: '',
        budget: '',
        location: '',
        lineId: '',
        images: [] as string[]
    });
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    useEffect(() => {
        fetchJob();
    }, []);

    const fetchJob = async () => {
        const token = getAuthToken();
        if (!token) return router.push('/');

        try {
            // Fetch current user jobs to find this one (or specific endpoint if available)
            // For now, let's use getJobs and filter or if we had getJobById
            // But we actually need to verify ownership.
            // Let's assume we can fetch it via jobs list or specific endpoint.
            // Actually I don't have getJobById public, but getMyJobs exists.

            const res = await fetch(`${API_BASE_URL}/jobs/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const jobs = await res.json();
                const job = jobs.find((j: any) => j._id === params.id);

                if (job) {
                    setForm({
                        content: job.content,
                        budget: job.budget.toString(),
                        location: job.location,
                        lineId: job.lineId,
                        images: job.images
                    });
                    setExistingImages(job.images);
                } else {
                    toast.error(t('tourist.job_not_found'));
                    router.push('/jobs');
                }
            } else {
                router.push('/jobs');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removePreviewImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = getAuthToken();

        try {
            // Upload new images first
            let newImageUrls = [];
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
                    newImageUrls = data.urls;
                }
            }

            // Combine existing and new images
            const finalImages = [...existingImages, ...newImageUrls];

            // Update Job
            const res = await fetch(`${API_BASE_URL}/jobs/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    budget: Number(form.budget),
                    images: finalImages
                })
            });

            if (res.ok) {
                toast.success("Updated successfully!");
                router.push('/jobs');
            } else {
                toast.error(t('tourist.update_failed'));
            }

        } catch (error) {
            console.error(error);
            toast.error(t('tourist.update_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden py-4 md:py-8 px-3 md:px-4 flex items-center justify-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
            </div>

            <div className="container mx-auto max-w-2xl relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-4 md:mb-8 group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition">
                        <ArrowLeft size={18} className="md:w-5 md:h-5" />
                    </div>
                    <span className="font-medium text-sm md:text-base">{t('common.cancel')}</span>
                </button>

                <div className="backdrop-blur-xl bg-white/5 rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-2xl border border-white/10">
                    <div className="text-center mb-6 md:mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-4 md:mb-6 shadow-lg shadow-pink-500/30">
                            <span className="text-2xl md:text-3xl">✏️</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3 tracking-tight">{t('tourist.edit_request_title')}</h1>
                        <p className="text-zinc-400 text-sm md:text-lg leading-relaxed max-w-md mx-auto">{t('tourist.edit_request_subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
                        {/* Content */}
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-xs md:text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_content_label')}</label>
                            <div className="relative group">
                                <textarea
                                    required
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    rows={4}
                                    className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition resize-none outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Budget */}
                            <div className="space-y-2 md:space-y-3">
                                <label className="text-xs md:text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_budget_label')}</label>
                                <div className="relative group">
                                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-focus-within:bg-pink-500 group-focus-within:text-white transition">
                                        <DollarSign size={14} className="md:w-4 md:h-4" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={form.budget}
                                        onChange={e => setForm({ ...form, budget: e.target.value })}
                                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl md:rounded-2xl pl-12 md:pl-14 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition outline-none"
                                    />
                                </div>
                            </div>

                            {/* Line ID */}
                            <div className="space-y-2 md:space-y-3">
                                <label className="text-xs md:text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_line_label')}</label>
                                <div className="relative group">
                                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-focus-within:bg-green-500 group-focus-within:text-white transition">
                                        <MessageCircle size={14} className="md:w-4 md:h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.lineId}
                                        onChange={e => setForm({ ...form, lineId: e.target.value })}
                                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl md:rounded-2xl pl-12 md:pl-14 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-xs md:text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_location_label')}</label>
                            <div className="relative group">
                                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-focus-within:bg-purple-500 group-focus-within:text-white transition">
                                    <MapPin size={14} className="md:w-4 md:h-4" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl md:rounded-2xl pl-12 md:pl-14 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition outline-none"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-xs md:text-sm font-semibold text-zinc-300 ml-1 uppercase tracking-wide">{t('tourist.form_images_label')}</label>
                            <div className="grid grid-cols-4 gap-2 md:gap-3 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4">
                                {/* Existing Images */}
                                {existingImages.map((src, i) => (
                                    <div key={`existing-${i}`} className="aspect-square rounded-lg md:rounded-xl overflow-hidden bg-zinc-900 relative group border border-white/10">
                                        <img src={getImageUrl(src)} className="w-full h-full object-cover transition transform group-hover:scale-110" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(i)}
                                            className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white rounded-md md:rounded-lg p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition backdrop-blur-sm shadow-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-[14px] md:h-[14px]"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                ))}

                                {/* New Images */}
                                {previewImages.map((src, i) => (
                                    <div key={`new-${i}`} className="aspect-square rounded-lg md:rounded-xl overflow-hidden bg-zinc-900 relative group border border-white/10">
                                        <img src={src} className="w-full h-full object-cover transition transform group-hover:scale-110" />
                                        <button
                                            type="button"
                                            onClick={() => removePreviewImage(i)}
                                            className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white rounded-md md:rounded-lg p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition backdrop-blur-sm shadow-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-[14px] md:h-[14px]"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                ))}

                                <label className="aspect-square rounded-lg md:rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/5 transition group">
                                    <Upload size={20} className="mb-1 group-hover:scale-110 transition md:w-6 md:h-6" />
                                    <span className="text-[10px] md:text-xs font-medium">Add</span>
                                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-pink-600/20 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm md:text-base"
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span>{t('tourist.update_request_button')}</span>
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
