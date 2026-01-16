"use client";

import Link from "next/link";
import { ChevronLeft, Mail, MessageSquare, Send, User, Type } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLanguage } from "../contexts/LanguageContext";

export const runtime = "edge";

const WEB3FORMS_ACCESS_KEY = "ea73ce21-53c4-4ba6-a2db-e778e55f0a4a"; // TODO: Get this from web3forms.com for superiphonex88@gmail.com

export function ContactPage() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    ...formData,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(t("contact.success"));
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                toast.error(t("contact.error"));
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(t("contact.error_general"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#F84E6E]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#634CC9]/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Breadcrumb / Back Link */}
                <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
                    <Link href="/" className="hover:text-white transition flex items-center">
                        <ChevronLeft size={16} /> {t("nav.home")}
                    </Link>
                    <span>/</span>
                    <span className="text-white">{t("contact.breadcrumb")}</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold mb-2">{t("contact.title")}</h1>
                    <p className="text-white/60 mb-8">
                        {t("contact.description")}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">{t("contact.name")}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F84E6E] focus:ring-1 focus:ring-[#F84E6E] transition"
                                        placeholder={t("contact.name_placeholder")}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">{t("contact.email")}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F84E6E] focus:ring-1 focus:ring-[#F84E6E] transition"
                                        placeholder={t("contact.email_placeholder")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">{t("contact.subject")}</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                    <Type size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    name="subject"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F84E6E] focus:ring-1 focus:ring-[#F84E6E] transition"
                                    placeholder={t("contact.subject_placeholder")}
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">{t("contact.message")}</label>
                            <div className="relative">
                                <div className="absolute left-4 top-4 text-white/40">
                                    <MessageSquare size={18} />
                                </div>
                                <textarea
                                    required
                                    rows={5}
                                    name="message"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F84E6E] focus:ring-1 focus:ring-[#F84E6E] transition resize-none"
                                    placeholder={t("contact.message_placeholder")}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#F84E6E] hover:bg-[#d63d59] text-white font-medium py-3 px-8 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#F84E6E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>{t("contact.btn_sending")}</span>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {t("contact.btn_send")}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
