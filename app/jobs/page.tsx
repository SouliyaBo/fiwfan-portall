"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Clock, MessageCircle, Star, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE_URL } from '../../lib/constants';
import { getAuthToken } from "../../lib/auth";
import { getImageUrl } from "../../lib/images";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Job {
    _id: string;
    user: {
        _id: string;
        displayName: string;
        username: string;
        avatarUrl?: string;
    };
    content: string;
    budget: number;
    location: string;
    lineId: string;
    images: string[];
    createdAt: string;
    expiresAt: string;
    isHighlighted: boolean;
    isPinned: boolean;
    planType: string;
}

export default function JobsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchJobs();
        checkUser();
    }, []);

    const checkUser = async () => {
        const token = getAuthToken();
        if (token) {
            try {
                const res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser({ id: data._id, ...data });
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/jobs`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = (lineId: string) => {
        window.open(`https://line.me/ti/p/~${lineId}`, '_blank');
    };

    const handleDelete = (jobId: string) => {
        const confirmToast = ({ closeToast }: { closeToast: () => void }) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-white">{t('tourist.confirm_delete_request')}</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={closeToast}
                        className="px-3 py-1.5 text-sm bg-zinc-200 text-zinc-700 rounded-md hover:bg-zinc-300 transition"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={async () => {
                            closeToast();
                            await executeDelete(jobId);
                        }}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        {t('tourist.delete_request_button')}
                    </button>
                </div>
            </div>
        );

        toast(confirmToast, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            className: "bg-[#020617] text-white",
        });
    };

    const executeDelete = async (jobId: string) => {
        const token = getAuthToken();
        try {
            const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success(t('tourist.delete_success'));
                setJobs(prev => prev.filter(j => j._id !== jobId));
            } else {
                toast.error(t('tourist.delete_failed'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('tourist.delete_failed'));
        }
    };

    if (loading) return <div className="min-h-screen text-center py-20 bg-[#020617] text-white">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden py-6 px-4">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-700" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-8 group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-medium text-sm">{t('nav.home')}</span>
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-4 shadow-lg shadow-pink-500/20">
                        <span className="text-2xl">🌴</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{t('tourist.jobs_title')}</h1>
                    <p className="text-zinc-400 text-base">{t('tourist.jobs_subtitle')}</p>
                </div>


                {/* My Active Request */}
                {currentUser && jobs.some(job => job.user?._id === currentUser.id) && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-pink-500">✨</span> {t('tourist.active_plan')}
                        </h2>
                        {jobs.filter(job => job.user?._id === currentUser.id).map(job => (
                            <div
                                key={job._id}
                                className={`relative group backdrop-blur-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl p-5 border border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10`}
                            >
                                <div className="absolute -top-3 left-4">
                                    <span className="bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                                        YOU
                                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 mt-2">
                                    {/* Content */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="bg-white/5 text-zinc-400 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/5">
                                                <Clock size={10} /> {t('tourist.expires_in')} <span className="text-zinc-300 font-medium">{new Date(job.expiresAt).toLocaleDateString()}</span>
                                            </span>
                                        </div>

                                        <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/5">
                                            <p className="text-zinc-200 text-base whitespace-pre-wrap leading-relaxed break-words">{job.content}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-lg bg-pink-500/10 text-pink-500">
                                                    <MapPin size={14} />
                                                </div>
                                                <span className="text-xs">{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-lg bg-green-500/10 text-green-500">
                                                    <DollarSign size={14} />
                                                </div>
                                                <span className="text-xs">
                                                    {t('tourist.budget_label')} <span className="font-bold text-green-400 ml-1">{job.budget} ฿</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-3 border-t border-white/5">
                                            <button
                                                onClick={() => router.push(`/jobs/edit/${job._id}`)}
                                                className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                            >
                                                <Edit size={16} />
                                                {t('tourist.edit_request_title')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                            >
                                                <Trash2 size={16} />
                                                {t('tourist.delete_request_button')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }

                <div className="grid gap-5">
                    {jobs.filter(job => job.user?._id !== currentUser?.id).map((job) => (
                        <div
                            key={job._id}
                            className={`relative group backdrop-blur-xl bg-white/5 rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/[0.07] ${job.isPinned
                                ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                                : job.isHighlighted
                                    ? 'border-pink-500/30'
                                    : 'border-white/10'
                                }`}
                        >
                            {/* Badge Overlays */}
                            {job.isPinned && (
                                <div className="absolute -top-2.5 -right-2.5">
                                    <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                                        <Star size={10} fill="currentColor" /> {t('tourist.vip_badge')}
                                    </span>
                                </div>
                            )}
                            {job.isHighlighted && !job.isPinned && (
                                <div className="absolute -top-2.5 -right-2.5">
                                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-pink-500/20">
                                        {t('tourist.weekend_badge')}
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* User Info */}
                                <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:w-28">
                                    <div className={`relative w-16 h-16 rounded-full p-1 ${job.isPinned ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-gradient-to-br from-zinc-700 to-zinc-800'}`}>
                                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#0f172a]">
                                            <img
                                                src={job.user?.avatarUrl ? getImageUrl(job.user.avatarUrl) : '/default-avatar.png'}
                                                alt={job.user?.displayName}
                                                className="w-full h-full object-cover transition transform group-hover:scale-110 duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-white text-base max-w-[120px] truncate">{job.user?.displayName}</div>
                                        <div className="text-[10px] font-medium text-zinc-400 bg-white/5 py-0.5 px-2 rounded-full mt-1">Tourist</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="bg-white/5 text-zinc-400 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/5">
                                            <Clock size={10} /> {t('tourist.expires_in')} <span className="text-zinc-300 font-medium">{new Date(job.expiresAt).toLocaleDateString()}</span>
                                        </span>
                                    </div>

                                    <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/5">
                                        <p className="text-zinc-200 text-base whitespace-pre-wrap leading-relaxed break-words">{job.content}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-4">
                                        <div className="flex items-center gap-2 group/icon">
                                            <div className="p-1 rounded-lg bg-pink-500/10 text-pink-500 group-hover/icon:bg-pink-500 group-hover/icon:text-white transition">
                                                <MapPin size={14} />
                                            </div>
                                            <span className="group-hover/icon:text-zinc-200 transition text-xs">{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 group/icon">
                                            <div className="p-1 rounded-lg bg-green-500/10 text-green-500 group-hover/icon:bg-green-500 group-hover/icon:text-white transition">
                                                <DollarSign size={14} />
                                            </div>
                                            <span className="group-hover/icon:text-zinc-200 transition text-xs">
                                                {t('tourist.budget_label')} <span className="font-bold text-green-400 ml-1">{job.budget} ฿</span>
                                            </span>
                                        </div>
                                    </div>

                                    {job.images && job.images.length > 0 && (
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                                            {job.images.map((img, i) => (
                                                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10 group/img cursor-pointer">
                                                    <img src={getImageUrl(img)} className="w-full h-full object-cover transition transform group-hover/img:scale-110 duration-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => handleContact(job.lineId)}
                                            className="flex-1 bg-[#06C755] hover:bg-[#05b54d] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
                                        >
                                            <MessageCircle size={18} />
                                            <span>{t('tourist.contact_line')}</span>
                                        </button>

                                        {currentUser && currentUser.id === job.user?._id && (
                                            <button
                                                onClick={() => router.push(`/jobs/edit/${job._id}`)}
                                                className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-lg font-bold flex items-center gap-2 transition text-sm"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {jobs.length === 0 && !loading && (
                        <div className="text-center py-16 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                                <Star size={24} />
                            </div>
                            <p className="text-zinc-400 text-base">{t('home.creators_empty')}</p>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
