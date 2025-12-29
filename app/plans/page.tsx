"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, ShieldCheck, Zap, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../lib/constants';

interface PlanPrice {
    duration: string;
    price: number;
    days: number;
}

interface Plan {
    id: string;
    name: string;
    description: string;
    features: string[];
    prices: PlanPrice[];
    theme: string;
}

export default function PlansPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('SUPER_STAR');
    const [selectedDurationIndex, setSelectedDurationIndex] = useState<{ [key: string]: number }>({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/payments/plans`);
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
                // Initialize duration selection
                const initialDurations: any = {};
                data.forEach((p: Plan) => initialDurations[p.id] = 0);
                setSelectedDurationIndex(initialDurations);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch plans", error);
            setLoading(false);
        }
    };

    const handleSelectDuration = (planId: string, index: number) => {
        setSelectedDurationIndex({ ...selectedDurationIndex, [planId]: index });
        setSelectedPlanId(planId);
    };

    const handlePayment = async () => {
        const plan = plans.find(p => p.id === selectedPlanId);
        if (!plan) return;

        const priceIndex = selectedDurationIndex[selectedPlanId] || 0;
        const priceOption = plan.prices[priceIndex];

        if (!confirm(`ยืนยันการสมัครแพ็กเกจ ${plan.name} (${priceOption.duration}) ราคา ${priceOption.price} บาท?`)) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/payments/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: plan.id,
                    durationDays: priceOption.days,
                    price: priceOption.price
                })
            });

            if (res.ok) {
                toast.success("สมัครสมาชิกสำเร็จ! (Mock Payment)");
                router.push("/dashboard");
            } else {
                const err = await res.json();
                toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setProcessing(false);
        }
    };

    const getThemeColors = (theme: string) => {
        switch (theme) {
            case 'gold': return { border: 'border-yellow-400', bg: 'bg-yellow-50', header: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-400' };
            case 'blue': return { border: 'border-blue-300', bg: 'bg-blue-50', header: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-400' };
            case 'teal': return { border: 'border-teal-300', bg: 'bg-teal-50', header: 'bg-teal-100', text: 'text-teal-800', badge: 'bg-teal-400' };
            default: return { border: 'border-gray-300', bg: 'bg-gray-50', header: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-400' };
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#020617] text-white">กำลังโหลดข้อมูล...</div>;

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const selectedPrice = selectedPlan ? selectedPlan.prices[selectedDurationIndex[selectedPlan.id] || 0] : null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020617] py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">เลือกแพ็กเกจที่ใช่ เพื่อดันยอดแฟนคลับของคุณ!</h1>
                    <p className="text-red-500 font-medium">คุณเข้าใกล้การมีรายได้ไปอีกขั้น โปรไฟล์ของคุณจะยังไม่แสดงผลจนกว่าจะเปิดใช้งาน เลือกแพ็กเกจและเปิดโปรไฟล์ของคุณให้เป็นสาธารณะได้เลย!</p>
                </div>

                <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-6 uppercase tracking-wider">แพ็กเกจแนะนำ</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {plans.map((plan) => {
                        const colors = getThemeColors(plan.theme);
                        const isSelected = selectedPlanId === plan.id;

                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col ${isSelected ? `${colors.border} shadow-xl transform scale-105 z-10` : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 opacity-80 hover:opacity-100'}`}
                            >
                                <div className={`p-6 ${isSelected ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-900/50'}`}>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 uppercase">{plan.name}</h3>

                                    <ul className="space-y-3 mb-6 min-h-[160px]">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                        {/* Mock negative features for non-top plans if needed based on description */}
                                        {plan.id === 'STAR' && (
                                            <>
                                                <li className="flex items-start gap-2 text-sm text-zinc-400">
                                                    <X size={16} className="text-red-400 mt-0.5 shrink-0" /> ไม่มีวิดีโอ / รีล
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-zinc-400">
                                                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" /> การมองเห็นเพิ่มขึ้น 100%
                                                </li>
                                            </>
                                        )}
                                        {plan.id === 'POPULAR' && (
                                            <>
                                                <li className="flex items-start gap-2 text-sm text-zinc-400">
                                                    <X size={16} className="text-red-400 mt-0.5 shrink-0" /> ไม่มีวิดีโอ / รีล
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-zinc-400">
                                                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" /> การมองเห็นปกติ
                                                </li>
                                            </>
                                        )}
                                    </ul>

                                    <div className={`space-y-3 p-4 rounded-xl ${colors.bg}`}>
                                        {plan.prices.map((price, idx) => {
                                            const isPriceSelected = isSelected && (selectedDurationIndex[plan.id] || 0) === idx;
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectDuration(plan.id, idx);
                                                    }}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${isPriceSelected ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isPriceSelected ? 'border-blue-500' : 'border-zinc-400'}`}>
                                                        {isPriceSelected && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-zinc-700">
                                                        {price.duration} <span className="text-zinc-900 font-bold ml-1">{price.price} บาท</span>
                                                    </span>
                                                    {isPriceSelected && idx > 0 && (
                                                        <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded ml-auto">
                                                            ประหยัด {Math.round((plan.prices[0].price * (price.days / 7)) - price.price)} บาท
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Payment Summary Footer */}
                {selectedPrice && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between sticky bottom-6 shadow-2xl animate-in slide-in-from-bottom-6">
                        <div className="mb-4 md:mb-0">
                            <h4 className="text-sm text-zinc-500 font-bold uppercase mb-1">รายละเอียดแพ็กเกจ</h4>
                            <div className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                {selectedPlan?.name} <span className="text-zinc-400 font-normal text-sm">{selectedPrice.duration}</span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                                ใช้งานได้จนถึง {new Date(Date.now() + selectedPrice.days * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <span className="text-zinc-500 text-sm font-bold mr-2">รวมทั้งหมด</span>
                                <span className="text-2xl font-bold text-blue-600">{selectedPrice.price.toFixed(2)} บาท</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'กำลังดำเนินการ...' : (
                                    <>
                                        <ShieldCheck size={20} /> ชำระเงินด้วยบัตรเครดิต/เดบิต
                                    </>
                                )}
                            </button>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 transition transform hover:-translate-y-0.5 hidden sm:flex">
                                <Zap size={20} /> ชำระเงินด้วยคริปโต
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
