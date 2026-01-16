import { PolicyPage } from "../../components/PolicyPage";
import { Download } from "lucide-react";

export default function AssetsPage() {
    return (
        <PolicyPage title="Brand Assets">
            <p className="mb-8">Download official Phusao brand assets, logos, and guidelines.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F84E6E] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            P
                        </div>
                        <div>
                            <div className="font-bold text-white">Phusao Logo Pack</div>
                            <div className="text-xs text-white/50">PNG, SVG, AI • 12MB</div>
                        </div>
                    </div>
                    <Download className="text-white/30 group-hover:text-white transition" />
                </div>
            </div>
        </PolicyPage>
    );
}
