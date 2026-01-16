import { PolicyPage } from "../../components/PolicyPage";
import { Smartphone, Apple } from "lucide-react";

export default function DownloadPage() {
    return (
        <PolicyPage title="Download App">
            <p className="mb-8 text-center text-lg">Experience Phusao on your mobile device. Faster, smoother, and better.</p>

            <div className="flex flex-col md:flex-row justify-center gap-4 py-8">
                <button className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                    <Apple size={24} />
                    <div className="text-left">
                        <div className="text-[10px] font-medium leading-none">Download on the</div>
                        <div className="text-base">App Store</div>
                    </div>
                </button>
                <button className="flex items-center gap-3 bg-[#020617] border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                    <Smartphone size={24} />
                    <div className="text-left">
                        <div className="text-[10px] font-medium leading-none">GET IT ON</div>
                        <div className="text-base">Google Play</div>
                    </div>
                </button>
            </div>
        </PolicyPage>
    );
}
