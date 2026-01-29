"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from "../../../lib/auth";
import { API_BASE_URL } from '../../../lib/constants';
import { Check, Star, PartyPopper, Zap, ArrowLeft, Loader, Upload, Copy } from 'lucide-react';
import { useLanguage } from "../../../contexts/LanguageContext";

export default function TouristPlansPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slip, setSlip] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [slipUrl, setSlipUrl] = useState<string | null>(null);
    const [uploadingSlip, setUploadingSlip] = useState(false);

    const [pendingSubscription, setPendingSubscription] = useState<any>(null);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/payments/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.pending) {
                    setPendingSubscription(data.pending);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    interface UIPlan {
        id: string;
        name: string;
        price: number;
        duration: string;
        days: number;
        features: string[];
        recommended?: boolean;
        color: string;
        icon?: any;
    }

    const [plans, setPlans] = useState<UIPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const res = await fetch(`${API_BASE_URL}/plans`);
            const data = await res.json();

            const mapThemeToColor = (theme: string) => {
                switch (theme) {
                    case 'pink': return 'bg-pink-500';
                    case 'yellow': return 'bg-yellow-500';
                    case 'blue': return 'bg-blue-500';
                    default: return 'bg-zinc-800';
                }
            };

            const mapIdToIcon = (id: string) => {
                if (id.includes('VVIP') || id.includes('STAR')) return <Star size={24} />;
                if (id.includes('WEEKEND') || id.includes('PARTY')) return <PartyPopper size={24} />;
                return <Zap size={24} />;
            };

            const touristPlans = data
                .filter((p: any) => p.id.startsWith('TOURIST_') || p.type === 'TOURIST')
                .map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.prices?.[0]?.price || 0,
                    duration: p.prices?.[0]?.duration || '',
                    days: p.prices?.[0]?.days || 0,
                    features: p.features || [],
                    recommended: p.id.includes('WEEKEND'),
                    color: mapThemeToColor(p.theme),
                    icon: mapIdToIcon(p.id)
                }))
                .sort((a: any, b: any) => a.price - b.price);

            setPlans(touristPlans);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleSelectPlan = (planId: string) => {
        const token = getAuthToken();
        if (!token) {
            router.push(`/auth?mode=login&callbackUrl=/plans/tourist`);
            return;
        }
        setSelectedPlan(planId);
        setSlipUrl(null);
        setIsModalOpen(true);
    };

    const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setUploadingSlip(true);
        const token = getAuthToken();

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSlipUrl(data.url);
            } else {
                alert(t('common.upload_failed'));
            }
        } catch (error) {
            console.error(error);
            alert(t('common.upload_failed'));
        } finally {
            setUploadingSlip(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedPlan) return;

        const plan = plans.find(p => p.id === selectedPlan);
        if (!plan) return;

        if (!slipUrl) {
            alert(t('plans.upload_error'));
            return;
        }

        setSubmitting(true);

        try {
            const token = getAuthToken();

            const res = await fetch(`${API_BASE_URL}/payments/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: selectedPlan,
                    price: plan.price,
                    durationDays: plan.days,
                    slipUrl: slipUrl
                })
            });

            if (res.ok) {
                // If auto-approve for tourists (or if pending but we allow posting immediately? No, job controller checks activeSub)
                // If payment is pending, we can't post yet.
                // But for demo/development let's assume admin approves or we can just proceed?
                // The current flow requires Admin Approval.
                alert(t('plans.payment_success_desc'));
                router.push('/dashboard');
            } else {
                const err = await res.json();
                alert(err.message || t('common.error'));
            }
        } catch (error) {
            console.error(error);
            alert("Error processing payment");
        } finally {
            setSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>{t('common.cancel')}</span>
                </button>

                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 text-transparent bg-clip-text mb-4">
                        {t('tourist.plans_title')}
                    </h1>
                    <p className="text-lg text-white/60">
                        {t('tourist.plans_subtitle')}
                    </p>
                </div>

                {pendingSubscription && (
                    <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-200 p-4 rounded-xl mb-8 flex items-center justify-between">
                        <div>
                            <p className="font-bold">{t('plans.payment_pending_title')}</p>
                            <p className="text-sm opacity-80">{t('plans.payment_pending_desc')}</p>
                        </div>
                        <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {t('plans.payment_pending_badge')}
                        </span>
                    </div>
                )}

                {loadingPlans ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="animate-spin text-pink-500" size={48} />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div key={plan.id} className={`relative bg-zinc-900 border-2 rounded-2xl p-6 flex flex-col ${plan.recommended ? 'border-pink-500 shadow-xl shadow-pink-500/20' : 'border-zinc-800'}`}>
                                {plan.recommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                        {t('plans.recommended')}
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center mb-4`}>
                                    {plan.icon}
                                </div>

                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-xl text-white/60">฿</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-white/80">
                                            <Check size={18} className="text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={!!pendingSubscription}
                                    className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${plan.recommended
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    {pendingSubscription ? t('plans.payment_pending_badge') : t('tourist.buy_plan_btn')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{t('tourist.pay_scan')}</h2>

                        <div className="bg-white p-4 rounded-xl mb-6 flex justify-center">
                            {/* Mock QR */}
                            <div className="w-48 h-48 bg-zinc-200 flex items-center justify-center text-zinc-400">
                                QR Code
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">{t('plans.plan_label')}</span>
                                <span className="font-bold text-white">{plans.find(p => p.id === selectedPlan)?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">{t('plans.price_label')}</span>
                                <span className="font-bold text-green-500">{plans.find(p => p.id === selectedPlan)?.price} ฿</span>
                            </div>
                        </div>

                        {/* Slip Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">{t('plans.upload_slip_label')}</label>

                            {!slipUrl ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-zinc-800 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-zinc-500" />
                                        <p className="text-sm text-zinc-500">{uploadingSlip ? t('common.uploading') : t('plans.upload_slip_placeholder')}</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleSlipUpload} disabled={uploadingSlip} />
                                </label>
                            ) : (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                                    <img src={slipUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => setSlipUrl(null)}
                                            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={submitting || !slipUrl || uploadingSlip}
                            className="w-full bg-[#06C755] hover:bg-[#05b54d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Processing...
                                </>
                            ) : (
                                t('tourist.confirm_btn')
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
