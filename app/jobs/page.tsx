"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Clock, MessageCircle, Star, Edit } from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE_URL } from '../../lib/constants';
import { getAuthToken } from "../../lib/auth";
import { getImageUrl } from "../../lib/images";

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

    if (loading) return <div className="min-h-screen text-center py-20 bg-zinc-50 dark:bg-[#020617] text-white">{t('common.loading')}</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition mb-6 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span>{t('nav.home')}</span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{t('tourist.jobs_title')}</h1>
                    <p className="text-zinc-500">{t('tourist.jobs_subtitle')}</p>
                </div>

                <div className="grid gap-6">
                    {jobs.map((job) => (
                        <div
                            key={job._id}
                            className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 border-2 transition hover:shadow-lg ${job.isPinned ? 'border-yellow-400 shadow-yellow-500/10' : job.isHighlighted ? 'border-pink-300' : 'border-zinc-200 dark:border-zinc-800'}`}
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* User Info */}
                                <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:w-32">
                                    <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${job.isPinned ? 'border-yellow-400 p-0.5' : 'border-zinc-200'}`}>
                                        <img
                                            src={job.user?.avatarUrl ? getImageUrl(job.user.avatarUrl) : '/mock/avatar.png'}
                                            alt={job.user?.displayName}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-zinc-900 dark:text-white">{job.user?.displayName}</div>
                                        <div className="text-xs text-zinc-500">Tourist</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {job.isPinned && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Star size={12} fill="currentColor" /> {t('tourist.vip_badge')}
                                            </span>
                                        )}
                                        {job.isHighlighted && !job.isPinned && (
                                            <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {t('tourist.weekend_badge')}
                                            </span>
                                        )}
                                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Clock size={12} /> {t('tourist.expires_in')} {new Date(job.expiresAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-zinc-800 dark:text-white text-lg mb-4 whitespace-pre-wrap">{job.content}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} className="text-pink-500" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={16} className="text-green-500" />
                                            {t('tourist.budget_label')} <span className="font-bold text-green-600">{job.budget} ฿</span>
                                        </div>
                                    </div>

                                    {job.images && job.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                            {job.images.map((img, i) => (
                                                <div key={i} className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleContact(job.lineId)}
                                            className="bg-[#06C755] hover:bg-[#05b54d] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition transform hover:-translate-y-0.5"
                                        >
                                            <MessageCircle size={18} />
                                            {t('tourist.contact_line')}
                                        </button>

                                        {currentUser && currentUser.id === job.user?._id && (
                                            <button
                                                onClick={() => router.push(`/jobs/edit/${job._id}`)}
                                                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition"
                                            >
                                                <Edit size={18} />
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {jobs.length === 0 && !loading && (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-zinc-500">{t('home.creators_empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
