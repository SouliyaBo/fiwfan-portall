import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PolicyPageProps {
    title: string;
    children: React.ReactNode;
}

export function PolicyPage({ title, children }: PolicyPageProps) {
    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-white/50 hover:text-white mb-6 transition">
                    <ChevronLeft size={20} />
                    Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#F84E6E]">{title}</h1>

                <div className="prose prose-invert prose-p:text-white/80 prose-headings:text-white max-w-none bg-white/5 p-8 rounded-2xl border border-white/5">
                    {children}
                </div>
            </div>
        </div>
    );
}
