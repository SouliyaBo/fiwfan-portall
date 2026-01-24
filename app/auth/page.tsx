"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, MessageCircle, AlertCircle, ChevronLeft } from "lucide-react";
import { API_BASE_URL } from "../../lib/constants";
import TelegramLoginButton from "../components/TelegramLoginButton";
import TermsModal from "@/components/TermsModal";
import { setAuthSession, getAuthToken } from "../../lib/auth";

// Schemas
const loginSchema = z.object({
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
    password: z.string().min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

const registerSchema = z.object({
    name: z.string().min(2, { message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" }),
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
    password: z.string().min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
    confirmPassword: z.string(),
    birthDate: z.string().refine((val) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }

        return age >= 20;
    }, { message: "คุณต้องมีอายุ 20 ปีบริบูรณ์ขึ้นไป" }),
    role: z.enum(["USER", "CREATOR"]), // USER = Tourist, CREATOR = Provider
    creatorType: z.enum(["INDIVIDUAL", "AGENCY"]).optional(),
    acceptTerms: z.boolean().refine(val => val === true, { message: "คุณต้องยอมรับข้อกำหนด" }),
    ageConfirm: z.boolean().refine(val => val === true, { message: "คุณต้องมีอายุ 20 ปีขึ้นไป" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
});

const resetPasswordSchema = z.object({
    password: z.string().min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const initialMode = searchParams.get("mode") as "login" | "register" | "forgot-password" | "reset" || "login";
    const [mode, setMode] = useState<"login" | "register" | "forgot-password" | "reset" | "telegram-register">(initialMode);
    const [successMessage, setSuccessMessage] = useState("");

    // Watch role to conditionally show creatorType
    const [selectedRole, setSelectedRole] = useState<"USER" | "CREATOR">("USER");

    // Telegram Reg Data
    const [telegramRegData, setTelegramRegData] = useState<any>(null);
    const [tgRole, setTgRole] = useState<"USER" | "CREATOR">("USER");
    const [tgCreatorType, setTgCreatorType] = useState<"INDIVIDUAL" | "AGENCY">("INDIVIDUAL");

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    // Development Simulation State
    const [resetLink, setResetLink] = useState<string | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);

    // Calculate max date for 20 years age restriction
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate()).toISOString().split('T')[0];

    // Forms
    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "USER",
            creatorType: "INDIVIDUAL",
        }
    });

    const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Update local state when form value changes
    const roleWatch = registerForm.watch("role");
    useEffect(() => {
        if (roleWatch) setSelectedRole(roleWatch);
    }, [roleWatch]);

    // Check if user is already logged in or returning from Telegram auth
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            router.push("/dashboard");
        }

        // Handle Telegram Redirect Login
        const tgId = searchParams.get("id");
        const tgHash = searchParams.get("hash");
        if (tgId && tgHash) {
            const rawParams = {
                id: searchParams.get("id"),
                first_name: searchParams.get("first_name"),
                last_name: searchParams.get("last_name"),
                username: searchParams.get("username"),
                photo_url: searchParams.get("photo_url"),
                auth_date: searchParams.get("auth_date"),
                hash: searchParams.get("hash"),
            };

            // Filter out null values to ensure hash calculation matches
            const telegramUser = Object.fromEntries(
                Object.entries(rawParams).filter(([_, v]) => v !== null)
            );

            handleTelegramAuth(telegramUser);
        }
    }, [router, searchParams]);

    const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");

            setAuthSession(result.token, result.user, rememberMe);

            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Verification Modal
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        setError("");

        // Transform data for backend if needed
        const payload = {
            ...data,
            isCreator: data.role === "CREATOR"
        };

        try {
            // Simulate API call for now or use real one
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "ไม่สามารถสมัครสมาชิกได้ โปรดลองใหม่อีกครั้ง");

            if (result.verifyRequired) {
                setUserEmail(result.email || data.email);
                setShowVerifyModal(true);
                return;
            }

            // Auto login logic (Legacy support if verifyRequired is false)
            if (result.token && result.user) {
                setAuthSession(result.token, result.user, true);
                router.push("/dashboard");
            } else {
                router.push("/auth?mode=login");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onForgotPasswordSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgotpassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "ไม่สามารถดำเนินการได้");

            // Check if we got a resetLink (Dev/Simulation Mode)
            if (result.resetLink) {
                setSuccessMessage("ระบบจำลองการส่งอีเมล (Development Mode)");
                // Hacky way to show the link for now since we want it "usable"
                // Ideally, we'd add a proper UI state for this, but using successMessage or a new state is fine.
                // Let's create a temporary persistent message or just alert
                setError(`[DEV ONLY] Click to Reset: ${result.resetLink}`);
                // Actually, let's make it better. I'll stick to a success message but weirdly.
                // Better plan: keep success message as "Email sent", and if result.resetLink exists,
                // rendering a special clickable alert below.

                // Reuse error state for visibility or add a new one?
                // Let's reuse error for "Action Required" style if possible, or just append to success?
                // I'll make a custom state for `devResetLink` but I didn't add it yet.
                // For now, I'll alert() it or redirect if user wants "usage". 
                // The prompt said "usable" -> redirect is arguably "usable".

                // Wait, the plan said "Display the reset link".
                // I need to add state for it. Since I cannot update state definitions easily in this replace block effectively
                // without replacing the whole component top, I will use `setSuccessMessage` 
                // and maybe render HTML? No, React safely escapes.

                // I'll use window.prompt to let them copy it, or confirm to redirect.
                // Replaced window.confirm with Custom Modal as requested
                setResetLink(result.resetLink);
                setShowResetModal(true);
            } else {
                setSuccessMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onResetPasswordSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
        if (!token) {
            setError("ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/resetpassword/${token}`, {
                method: "PUT", // Matches backend route
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: data.password }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");

            setSuccessMessage("รีเซ็ตรหัสผ่านสำเร็จ! กำลังพาคุณไปหน้าเข้าสู่ระบบ...");

            // Wait a sec then redirect to login
            setTimeout(() => {
                setMode("login");
                setSuccessMessage("");
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTelegramAuth = async (user: any) => {
        setIsLoading(true);
        setError("");
        try {
            // Check if we are in "Forgot Password" mode
            if (mode === "forgot-password") {
                const res = await fetch(`${API_BASE_URL}/auth/telegram/reset-request`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้\n(บัญชี Telegram นี้อาจยังไม่เชื่อมต่อกับระบบ)");

                if (result.success && result.resetToken) {
                    setSuccessMessage("ยืนยันตัวตนสำเร็จ! กรุณาตั้งรหัสผ่านใหม่");
                    // Manually redirect to reset mode with token
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("token", result.resetToken);
                    params.set("mode", "reset");
                    router.push(`/auth?${params.toString()}`);
                    // Force update local state if router push doesn't trigger reload instantly
                    setMode("reset");
                }
                setIsLoading(false);
                return;
            }

            // Normal Login / Register Flow
            const res = await fetch(`${API_BASE_URL}/auth/telegram`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            const result = await res.json();

            if (res.status === 202 && result.isNewUser) {
                // New User -> Show Role Selection
                setTelegramRegData(result.telegramData);
                setMode("telegram-register");
                setIsLoading(false);
                return;
            }

            if (!res.ok) throw new Error(result.message || "การเข้าสู่ระบบด้วย Telegram ล้มเหลว");

            setAuthSession(result.token, result.user, true);

            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const onTelegramRegisterConfirm = async () => {
        if (!telegramRegData) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/telegram/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    telegramData: telegramRegData,
                    role: tgRole,
                    creatorType: tgCreatorType
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "การลงทะเบียนล้มเหลว");

            setAuthSession(result.token, result.user, true); // Auto login defaults to persistent
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="w-full max-w-md bg-[#1e1b4b]/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden text-white border border-white/20">
                {/* Tabs */}
                {mode !== 'telegram-register' && (
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => { setMode("login"); setError(""); }}
                            className={`flex-1 py-4 text-center font-bold text-lg cursor-pointer transition relative ${mode === "login" ? "text-white" : "text-white/40 hover:text-white/80"}`}
                        >
                            เข้าสู่ระบบ
                            {mode === "login" && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-600"></div>}
                        </button>
                        <button
                            onClick={() => { setMode("register"); setError(""); }}
                            className={`flex-1 py-4 text-center font-bold text-lg cursor-pointer transition relative ${mode === "register" ? "text-white" : "text-white/40 hover:text-white/80"}`}
                        >
                            ลงทะเบียน
                            {mode === "register" && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-violet-600"></div>}
                        </button>
                    </div>
                )}
                {mode === 'telegram-register' && (
                    <div className="flex border-b">
                        <div className="flex-1 py-4 text-center font-bold text-lg text-[#F84E6E] border-b-2 border-[#F84E6E]">
                            ยืนยันข้อมูลการสมัคร
                        </div>
                    </div>
                )}

                <div className="p-8">

                    {mode === "telegram-register" ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-center">
                                <h3 className="text-xl font-bold">สวัสดี, {telegramRegData?.first_name}</h3>
                                <p className="text-sm text-gray-500">กรุณาเลือกประเภทบัญชีของคุณเพื่อดำเนินการต่อ</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white mb-3">ประเภทผู้ใช้:</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setTgRole("USER")}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${tgRole === "USER" ? "border-[#F84E6E] bg-[#F84E6E]/10 text-[#F84E6E]" : "border-white/10 hover:border-white/30 text-white"}`}
                                    >
                                        <span className="text-lg">🏕️</span>
                                        <span className="font-bold">นักท่องเที่ยว</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTgRole("CREATOR")}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${tgRole === "CREATOR" ? "border-[#F84E6E] bg-[#F84E6E]/10 text-[#F84E6E]" : "border-white/10 hover:border-white/30 text-white"}`}
                                    >
                                        <span className="text-lg">💃</span>
                                        <span className="font-bold">ครีเอเตอร์/โม</span>
                                    </button>
                                </div>
                            </div>

                            {tgRole === "CREATOR" && (
                                <div className="bg-white/5 p-4 rounded-lg border border-white/10 animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-white mb-2">รูปแบบการรับงาน:</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-black/20 p-2 px-3 rounded border border-white/10 hover:bg-white/5 transition shadow-sm w-full justify-center">
                                            <input
                                                type="radio"
                                                name="tgCreatorType"
                                                checked={tgCreatorType === "INDIVIDUAL"}
                                                onChange={() => setTgCreatorType("INDIVIDUAL")}
                                                className="w-4 h-4 text-pink-600 focus:ring-pink-500 bg-transparent border-white/30"
                                            />
                                            <span className="text-sm font-medium text-white">รับงานเอง (รายบุคคล)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-black/20 p-2 px-3 rounded border border-white/10 hover:bg-white/5 transition shadow-sm w-full justify-center">
                                            <input
                                                type="radio"
                                                name="tgCreatorType"
                                                checked={tgCreatorType === "AGENCY"}
                                                onChange={() => setTgCreatorType("AGENCY")}
                                                className="w-4 h-4 text-pink-600 focus:ring-pink-500 bg-transparent border-white/30"
                                            />
                                            <span className="text-sm font-medium text-white">สังกัดโมเดลลิ่ง</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={onTelegramRegisterConfirm}
                                disabled={isLoading}
                                className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2 mt-4 border border-white/10"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={20} />}
                                ยืนยันการสมัคร
                            </button>

                            <button
                                onClick={() => { setMode("login"); setTelegramRegData(null); }}
                                className="w-full text-gray-400 text-sm hover:text-white transition mt-2"
                            >
                                ยกเลิก
                            </button>

                        </div>
                    ) : (
                        <>
                            {/* Social Login */}
                            <div className="space-y-3 mb-6">
                                <div className="flex flex-col items-center w-full gap-2">
                                    <div className="flex justify-center w-full min-h-[40px]">
                                        <TelegramLoginButton
                                            botName="lao_angel_bot"
                                            onAuth={handleTelegramAuth}
                                            buttonSize="large"
                                        />
                                    </div>
                                    {/* Dev Bypass Button */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            type="button"
                                            onClick={() => handleTelegramAuth({
                                                id: 123456789,
                                                first_name: "Test User",
                                                username: "test_user",
                                                photo_url: "",
                                                auth_date: Math.floor(Date.now() / 1000),
                                                hash: "mock_hash_for_dev"
                                            })}
                                            className="text-xs text-gray-400 hover:text-pink-500 underline cursor-pointer"
                                        >
                                            [Dev Only] Simulate Telegram Login (Bypass Widget)
                                        </button>
                                    )}
                                </div>

                            </div>

                            <div className="relative flex py-2 items-center mb-6">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">หรือ</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    {mode === "login" && (
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">อีเมล</label>
                                <input {...loginForm.register("email")} type="email" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" placeholder="อีเมลของคุณ" />
                                {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">รหัสผ่าน</label>
                                <input {...loginForm.register("password")} type="password" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" placeholder="รหัสผ่าน" />
                                {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                    />
                                    จดจำฉัน
                                </label>
                                <button type="button" onClick={() => setMode("forgot-password")} className="text-pink-500 hover:underline cursor-pointer">ลืมรหัสผ่าน?</button>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#1e1b4b] to-[#4c1d95] hover:from-[#2d2a6e] hover:to-[#5b21b6] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] cursor-pointer">
                                {isLoading && <Loader2 className="animate-spin" size={20} />}
                                เข้าสู่ระบบ
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === "register" && (
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            {/* User Type Selection */}
                            <div>
                                <label className="block text-sm font-bold text-white/80 mb-2">ประเภทผู้ใช้:</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="USER"
                                            {...registerForm.register("role")}
                                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-white/30 bg-transparent"
                                        />
                                        <span className="text-sm font-medium text-white">นักท่องเที่ยว</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="CREATOR"
                                            {...registerForm.register("role")}
                                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-white/30 bg-transparent"
                                        />
                                        <span className="text-sm font-medium text-white">มาลงโพสต์งาน</span>
                                    </label>
                                </div>
                            </div>

                            {/* Conditional Account Type for Creator */}
                            {selectedRole === "CREATOR" && (
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                                    <label className="block text-sm font-bold text-white/80 mb-2">เลือกประเภทบัญชี:</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="INDIVIDUAL"
                                                {...registerForm.register("creatorType")}
                                                className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-white/30 bg-transparent"
                                            />
                                            <span className="text-sm font-medium text-white">รายบุคคล</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="AGENCY"
                                                {...registerForm.register("creatorType")}
                                                className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-white/30 bg-transparent"
                                            />
                                            <span className="text-sm font-medium text-white">เอเจนซี่</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อ</label>
                                <input {...registerForm.register("name")} type="text" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {registerForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">อีเมล</label>
                                <input {...registerForm.register("email")} type="email" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {registerForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    วันเกิด <span className="text-white/50 text-xs font-normal">(ต้องมีอายุ 20 ปีขึ้นไป)</span>
                                </label>
                                <input
                                    {...registerForm.register("birthDate")}
                                    type="date"
                                    max={maxDate}
                                    className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white [color-scheme:dark]"
                                />
                                {registerForm.formState.errors.birthDate && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.birthDate.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">รหัสผ่าน</label>
                                <input {...registerForm.register("password")} type="password" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {registerForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">ยืนยันรหัสผ่าน</label>
                                <input {...registerForm.register("confirmPassword")} type="password" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {registerForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-300">
                                    <input type="checkbox" {...registerForm.register("ageConfirm")} className="mt-1 rounded border-white/30 bg-black/20 text-pink-500 focus:ring-pink-500" />
                                    <span>ฉันยืนยันว่าอายุ 20 ปีบริบูรณ์ขึ้นไป</span>
                                </label>
                                {registerForm.formState.errors.ageConfirm && <p className="text-red-500 text-xs">{registerForm.formState.errors.ageConfirm.message}</p>}

                                <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-300">
                                    <input type="checkbox" {...registerForm.register("acceptTerms")} className="mt-1 rounded border-white/30 bg-black/20 text-pink-500 focus:ring-pink-500" />
                                    <span>ฉันยอมรับ <button type="button" onClick={() => setShowTerms(true)} className="text-pink-500 hover:underline">ข้อกำหนดและนโยบายความเป็นส่วนตัว</button></span>
                                </label>
                                {registerForm.formState.errors.acceptTerms && <p className="text-red-500 text-xs">{registerForm.formState.errors.acceptTerms.message}</p>}
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#be185d] to-[#db2777] hover:from-[#9d174d] hover:to-[#be185d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] cursor-pointer">
                                {isLoading && <Loader2 className="animate-spin" size={20} />}
                                สมัครสมาชิก
                            </button>
                        </form>
                    )}
                </div>

                {/* Forgot Password Form */}
                {mode === "forgot-password" && (
                    <div className="p-8 pt-0">
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-bold text-white">ลืมรหัสผ่าน?</h3>
                            <p className="text-sm text-gray-400 mt-2">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                        </div>

                        {successMessage && (
                            <div className="bg-green-500/10 text-green-400 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm border border-green-500/20">
                                <span className="font-bold">✓</span>
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">อีเมล</label>
                                <input {...forgotPasswordForm.register("email")} type="email" placeholder="name@example.com" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {forgotPasswordForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{forgotPasswordForm.formState.errors.email.message}</p>}
                            </div>

                            {/* Telegram Reset Button */}
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <div className="relative flex w-full py-2 items-center">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">หรือ รีเซ็ตรหัสผ่านด้วย Telegram</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>
                                <TelegramLoginButton
                                    botName="lao_angel_bot"
                                    onAuth={handleTelegramAuth}
                                    buttonSize="large"
                                />
                                {process.env.NODE_ENV === 'development' && (
                                    <button
                                        type="button"
                                        onClick={() => handleTelegramAuth({
                                            id: 123456789,
                                            first_name: "Test User",
                                            username: "test_user",
                                            photo_url: "",
                                            auth_date: Math.floor(Date.now() / 1000),
                                            hash: "mock_hash_for_dev"
                                        })}
                                        className="text-xs text-gray-400 hover:text-pink-500 underline cursor-pointer"
                                    >
                                        [Dev Only] Simulate Reset (Bypass Widget)
                                    </button>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2 border border-white/10">
                                {isLoading && <Loader2 className="animate-spin" size={20} />}
                                ส่งลิงก์รีเซ็ต
                            </button>

                            <button type="button" onClick={() => setMode("login")} className="w-full text-gray-400 text-sm hover:text-white transition">
                                กลับไปหน้าเข้าสู่ระบบ
                            </button>
                        </form>
                    </div>
                )}

                {/* Reset Password Form */}
                {mode === "reset" && (
                    <div className="p-8 pt-0">
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-bold text-white">ตั้งรหัสผ่านใหม่</h3>
                            <p className="text-sm text-gray-400 mt-2">กรุณาตั้งรหัสผ่านใหม่ของคุณ</p>
                        </div>

                        {successMessage && (
                            <div className="bg-green-500/10 text-green-400 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm border border-green-500/20">
                                <span className="font-bold">✓</span>
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">รหัสผ่านใหม่</label>
                                <input {...resetPasswordForm.register("password")} type="password" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {resetPasswordForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">ยืนยันรหัสผ่านใหม่</label>
                                <input {...resetPasswordForm.register("confirmPassword")} type="password" className="w-full px-5 py-3 border border-white/10 bg-black/20 rounded-xl focus:bg-black/40 focus:ring-2 focus:ring-[#F84E6E] focus:border-transparent outline-none transition-all placeholder:text-white/30 text-white" />
                                {resetPasswordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.confirmPassword.message}</p>}
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2 border border-white/10">
                                {isLoading && <Loader2 className="animate-spin" size={20} />}
                                บันทึกรหัสผ่านใหม่
                            </button>

                            <button type="button" onClick={() => setMode("login")} className="w-full text-gray-400 text-sm hover:text-white transition">
                                ยกเลิก
                            </button>
                        </form>
                    </div>
                )}

            </div>
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

            {/* Simulation/Dev Mode Modal */}
            {showResetModal && resetLink && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e1b4b] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle size={32} className="text-pink-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">ระบบจำลองการส่งอีเมล</h3>
                            <p className="text-gray-300 text-sm">
                                ในระบบทดสอบ (Development Mode) เราจะไม่ส่งอีเมลจริง<br />
                                กรุณาคลิกปุ่มด้านล่างเพื่อดำเนินการรีเซ็ตรหัสผ่าน
                            </p>

                            <div className="p-3 bg-black/40 rounded-lg border border-white/10 break-all text-xs font-mono text-gray-400 mt-2 select-all">
                                {resetLink}
                            </div>
                        </div>
                        <div className="p-4 bg-black/20 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 py-2.5 text-gray-400 hover:text-white transition font-medium"
                            >
                                ปิด
                            </button>
                            <button
                                onClick={() => {
                                    window.location.href = resetLink;
                                    setShowResetModal(false);
                                }}
                                className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hovered:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold transition shadow-lg shadow-pink-500/20"
                            >
                                ไปยังหน้าตั้งรหัสใหม่
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e1b4b] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">สมัครสมาชิกสำเร็จ!</h3>
                            <p className="text-gray-300 text-sm">
                                เราได้ส่งอีเมลยืนยันตัวตนไปที่<br />
                                <span className="font-bold text-white">{userEmail}</span><br />
                                กรุณาตรวจสอบกล่องจดหมาย (หรือ Junk mail) เพื่อยืนยันตัวตน
                            </p>
                        </div>
                        <div className="p-4 bg-black/20 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowVerifyModal(false);
                                    setMode("login");
                                }}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition shadow-lg shadow-green-500/20"
                            >
                                เข้าใจแล้ว
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const AuthPage = () => {
    return (
        <div className="flex min-h-screen items-start md:items-center justify-center bg-[#0f0c29] bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 pt-24 md:pt-0 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <Link
                href="/"
                className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 font-medium z-10"
            >
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 group-hover:border-white/40 transition-all">
                    <ChevronLeft size={20} />
                </div>
                <span className="hidden md:inline">กลับไปหน้าแรก</span>
            </Link>

            <div className="z-10 w-full max-w-md">
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <AuthForm />
                </Suspense>
            </div>
        </div>
    );
};

export default AuthPage;
