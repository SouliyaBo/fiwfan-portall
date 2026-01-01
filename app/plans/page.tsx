"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, ShieldCheck, Zap, X, Upload, Loader2, Copy } from 'lucide-react';
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

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

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

        // Open modal instead of direct payment
        setShowPaymentModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSlipFile(e.target.files[0]);
        }
    };

    const confirmPayment = async () => {
        const plan = plans.find(p => p.id === selectedPlanId);
        if (!plan) return;

        const priceIndex = selectedDurationIndex[selectedPlanId] || 0;
        const priceOption = plan.prices[priceIndex];

        if (!slipFile) {
            toast.error("กรุณาอัพโหลดสลิปการโอนเงิน");
            return;
        }

        setUploading(true);
        try {
            const token = localStorage.getItem("token");

            // 1. Get Presigned URL
            const presignRes = await fetch(`${API_BASE_URL}/files/presign-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileName: slipFile.name,
                    fileType: slipFile.type
                })
            });

            if (!presignRes.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl, publicUrl } = await presignRes.json();

            // 2. Upload File
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": slipFile.type
                },
                body: slipFile
            });

            if (!uploadRes.ok) throw new Error("Failed to upload slip");

            // 3. Create Subscription
            const res = await fetch(`${API_BASE_URL}/payments/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: plan.id,
                    durationDays: priceOption.days,
                    price: priceOption.price,
                    slipUrl: publicUrl
                })
            });

            if (res.ok) {
                toast.success("ส่งหลักฐานการชำระเงินเรียบร้อย! กรุณารอแอดมินตรวจสอบ");
                setShowPaymentModal(false);
                router.push("/dashboard");
            } else {
                const err = await res.json();
                toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการทำรายการ");
        } finally {
            setUploading(false);
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
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? 'กำลังดำเนินการ...' : (
                                    <>
                                        <ShieldCheck size={20} /> ชำระเงินผ่าน Qr Code
                                    </>
                                )}
                            </button>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 transition transform hover:-translate-y-0.5 hidden sm:flex cursor-pointer">
                                <Zap size={20} /> ชำระเงินด้วยคริปโต
                            </button>
                        </div>
                    </div>
                )}

                {/* QR Payment Modal */}
                {showPaymentModal && selectedPlan && selectedPrice && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">ชำระเงินผ่าน QR Code</h3>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
                                >
                                    <X size={20} className="text-zinc-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="text-center">
                                    <p className="text-zinc-500 mb-2">ยอดชำระทั้งหมด</p>
                                    <div className="text-4xl font-bold text-blue-600 mb-4">{selectedPrice.price.toFixed(2)} บาท</div>
                                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl inline-block border-2 border-dashed border-zinc-200 dark:border-zinc-700 relative group">
                                        {/* Placeholder for QR Code */}
                                        <div className="w-64 h-64 bg-white flex items-center justify-center">
                                            <img
                                                src="/payment-qr-placeholder.png"
                                                alt="Payment QR Code"
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    // Fallback if image not found
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-zinc-400 text-sm">QR Code Placeholder</span>';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-2">สแกนเพื่อชำระเงิน</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        อัพโหลดหลักฐานการโอนเงิน (สลิป)
                                    </label>
                                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {slipFile ? (
                                            <div className="flex items-center justify-center gap-2 text-green-600">
                                                <Check size={20} />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{slipFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-zinc-500">
                                                <Upload size={24} />
                                                <span className="text-sm">คลิกเพื่ออัพโหลดสลิป</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={confirmPayment}
                                    disabled={uploading || !slipFile}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> กำลังตรวจสอบ...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={20} /> แจ้งชำระเงิน
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
