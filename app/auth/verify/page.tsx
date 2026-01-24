"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../../lib/constants";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("กำลังตรวจสอบข้อมูล...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("ไม่พบรหัสยืนยันตัวตน (Token)");
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const result = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว");
                } else {
                    setStatus("error");
                    setMessage(result.message || "การยืนยันตัวตนล้มเหลว");
                }
            } catch (error) {
                setStatus("error");
                setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="bg-[#1e1b4b]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 text-center space-y-6">
            <div className="flex justify-center">
                {status === "loading" && (
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                        <Loader2 size={40} className="text-white animate-spin" />
                    </div>
                )}
                {status === "success" && (
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                )}
                {status === "error" && (
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        <XCircle size={40} className="text-red-500" />
                    </div>
                )}
            </div>

            <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {status === "loading" && "กำลังยืนยันตัวตน"}
                    {status === "success" && "ยืนยันอีเมลสำเร็จ"}
                    {status === "error" && "ยืนยันไม่สำเร็จ"}
                </h1>
                <p className="text-gray-300">{message}</p>
            </div>

            <div className="pt-4">
                {status === "success" ? (
                    <Link
                        href="/auth?mode=login"
                        className="block w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold transition shadow-lg shadow-pink-500/20"
                    >
                        เข้าสู่ระบบ
                    </Link>
                ) : (
                    <Link
                        href="/"
                        className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition"
                    >
                        กลับหน้าหลัก
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="z-10 w-full max-w-md">
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <VerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
