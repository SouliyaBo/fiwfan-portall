"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, MessageCircle, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../lib/constants";

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
    birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "วันที่ไม่ถูกต้อง" }),
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

// API Config



function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const initialMode = searchParams.get("mode") as "login" | "register" | "forgot-password" | "reset" || "login";
    const [mode, setMode] = useState<"login" | "register" | "forgot-password" | "reset">(initialMode);
    const [successMessage, setSuccessMessage] = useState("");

    // Watch role to conditionally show creatorType
    const [selectedRole, setSelectedRole] = useState<"USER" | "CREATOR">("USER");

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

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


    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // router.push("/feed"); // Commented out for dev
        }
    }, [router]);

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

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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
            if (!res.ok) throw new Error(result.error || "ไม่สามารถสมัครสมาชิกได้ โปรดลองใหม่อีกครั้ง");

            // Auto login logic
            if (result.token && result.user) {
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", JSON.stringify(result.user));
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

            if (result.browsingUrl) {
                // For demo purposes, we redirect directly since we can't send email
                window.location.href = result.browsingUrl;
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

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden text-zinc-800">
            {/* Tabs */}
            <div className="flex border-b">
                <button
                    onClick={() => { setMode("login"); setError(""); }}
                    className={`flex-1 py-4 text-center font-bold text-lg cursor-pointer transition ${mode === "login" ? "text-[#F84E6E] border-b-2 border-[#F84E6E]" : "text-gray-400 hover:text-gray-600"}`}
                >
                    เข้าสู่ระบบ
                </button>
                <button
                    onClick={() => { setMode("register"); setError(""); }}
                    className={`flex-1 py-4 text-center font-bold text-lg cursor-pointer transition ${mode === "register" ? "text-[#F84E6E] border-b-2 border-[#F84E6E]" : "text-gray-400 hover:text-gray-600"}`}
                >
                    ลงทะเบียน
                </button>
            </div>

            <div className="p-8">
                {/* Social Login */}
                <div className="space-y-3 mb-6">
                    <button className="w-full bg-[#06c755] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:brightness-105 transition cursor-pointer">
                        <MessageCircle size={24} className="fill-white" />
                        <span>เข้าสู่ระบบด้วย Line</span>
                    </button>
                    <button className="w-full bg-[#db4437] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:brightness-105 transition cursor-pointer">
                        <span className="font-serif font-black text-xl">G</span>
                        <span>เข้าสู่ระบบด้วย Gmail</span>
                    </button>
                </div>

                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">หรือ</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

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
                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                            <input {...loginForm.register("email")} type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                            <input {...loginForm.register("password")} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                                <input type="checkbox" className="rounded border-gray-300 text-pink-500 focus:ring-pink-500" />
                                จดจำฉัน
                            </label>
                            <button type="button" onClick={() => setMode("forgot-password")} className="text-pink-500 hover:underline cursor-pointer">ลืมรหัสผ่าน?</button>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2">
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">ประเภทผู้ใช้:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="USER"
                                        {...registerForm.register("role")}
                                        className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium">นักท่องเที่ยว</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="CREATOR"
                                        {...registerForm.register("role")}
                                        className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium">มาลงโพสต์งาน</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Account Type for Creator */}
                        {selectedRole === "CREATOR" && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                                <label className="block text-sm font-bold text-gray-700 mb-2">เลือกประเภทบัญชี:</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="INDIVIDUAL"
                                            {...registerForm.register("creatorType")}
                                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                                        />
                                        <span className="text-sm font-medium">รายบุคคล</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="AGENCY"
                                            {...registerForm.register("creatorType")}
                                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                                        />
                                        <span className="text-sm font-medium">เอเจนซี่</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                            <input {...registerForm.register("name")} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {registerForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                            <input {...registerForm.register("email")} type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {registerForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                            <input {...registerForm.register("birthDate")} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                            <input {...registerForm.register("password")} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {registerForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                            <input {...registerForm.register("confirmPassword")} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {registerForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-600">
                                <input type="checkbox" {...registerForm.register("ageConfirm")} className="mt-1 rounded border-gray-300 text-pink-500 focus:ring-pink-500" />
                                <span>ฉันยืนยันว่าอายุ 20 ปีบริบูรณ์ขึ้นไป</span>
                            </label>
                            {registerForm.formState.errors.ageConfirm && <p className="text-red-500 text-xs">{registerForm.formState.errors.ageConfirm.message}</p>}

                            <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-600">
                                <input type="checkbox" {...registerForm.register("acceptTerms")} className="mt-1 rounded border-gray-300 text-pink-500 focus:ring-pink-500" />
                                <span>ฉันยอมรับ <a href="#" className="text-pink-500 hover:underline">ข้อกำหนดและนโยบายความเป็นส่วนตัว</a></span>
                            </label>
                            {registerForm.formState.errors.acceptTerms && <p className="text-red-500 text-xs">{registerForm.formState.errors.acceptTerms.message}</p>}
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2">
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
                        <h3 className="text-xl font-bold text-gray-800">ลืมรหัสผ่าน?</h3>
                        <p className="text-sm text-gray-500 mt-2">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
                            <span className="font-bold">✓</span>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                            <input {...forgotPasswordForm.register("email")} type="email" placeholder="name@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {forgotPasswordForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{forgotPasswordForm.formState.errors.email.message}</p>}
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2">
                            {isLoading && <Loader2 className="animate-spin" size={20} />}
                            ส่งลิงก์รีเซ็ต
                        </button>

                        <button type="button" onClick={() => setMode("login")} className="w-full text-gray-500 text-sm hover:text-gray-700 transition">
                            กลับไปหน้าเข้าสู่ระบบ
                        </button>
                    </form>
                </div>
            )}

            {/* Reset Password Form */}
            {mode === "reset" && (
                <div className="p-8 pt-0">
                    <div className="mb-6 text-center">
                        <h3 className="text-xl font-bold text-gray-800">ตั้งรหัสผ่านใหม่</h3>
                        <p className="text-sm text-gray-500 mt-2">กรุณาตั้งรหัสผ่านใหม่ของคุณ</p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
                            <span className="font-bold">✓</span>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                            <input {...resetPasswordForm.register("password")} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {resetPasswordForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                            <input {...resetPasswordForm.register("confirmPassword")} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition" />
                            {resetPasswordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.confirmPassword.message}</p>}
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-[#1e1b4b] text-white font-bold py-3 rounded-lg hover:bg-[#2d2a6e] transition flex items-center justify-center gap-2">
                            {isLoading && <Loader2 className="animate-spin" size={20} />}
                            บันทึกรหัสผ่านใหม่
                        </button>

                        <button type="button" onClick={() => setMode("login")} className="w-full text-gray-500 text-sm hover:text-gray-700 transition">
                            ยกเลิก
                        </button>
                    </form>
                </div>
            )}

        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4 py-12">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    );
}
