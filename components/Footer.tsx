import Link from "next/link";
import { Hand, Smartphone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#020617] border-t border-white/5 py-12 px-4 mt-auto">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Links Section */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/60">
                    <Link href="/faq" className="hover:text-white transition">FAQ's</Link>
                    <span className="text-white/20">|</span>
                    <Link href="/gdpr" className="hover:text-white transition">GDPR</Link>
                    <span className="text-white/20">|</span>
                    <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                    <span className="text-white/20">|</span>
                    <Link href="/terms" className="hover:text-white transition">terms of use</Link>
                    <span className="text-white/20">|</span>
                    <Link href="/assets" className="hover:text-white transition">Download Logo</Link>
                    <span className="text-white/20">|</span>
                    <Link href="/download" className="hover:text-white transition flex items-center gap-1">
                        <Smartphone size={14} />
                        Download App
                    </Link>
                    <span className="text-white/20">|</span>
                    <Link href="/human-trafficking" className="hover:text-white transition flex items-center gap-1 text-red-400 hover:text-red-300">
                        <Hand size={14} />
                        Stop Human Trafficking
                    </Link>
                    <span className="text-white/20">|</span>
                    <Link href="/contact" className="hover:text-white transition">
                        Contact Us
                    </Link>
                </div>

                {/* Disclaimer */}
                <div className="text-[10px] md:text-xs text-[#6d7588] text-center max-w-4xl mx-auto leading-relaxed">
                    This website allows only adults to advertise their time and companionship to other adults. We do not provide any booking or appointment management services. All prices listed relate to time only and are not associated with anything else. Any services that may be offered, or anything else that may occur, are decisions made by consenting adults and are private matters between them. In some countries, individuals may not have the legal right to make such decisions, and it is your own responsibility to comply with the local law.
                </div>

                {/* Copyright */}
                <div className="text-center text-xs text-white/40">
                    Copyright @ 2026 <span className="text-[#F84E6E]">phusao.com</span> all rights reserved.
                </div>
            </div>
        </footer>
    );
}
