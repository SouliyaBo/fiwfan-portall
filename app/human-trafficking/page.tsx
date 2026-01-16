import { PolicyPage } from "../../components/PolicyPage";
import { ShieldAlert } from "lucide-react";

export default function HumanTraffickingPage() {
    return (
        <PolicyPage title="Stop Human Trafficking">
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
                <ShieldAlert className="text-red-500 flex-shrink-0" size={32} />
                <div className="text-sm text-red-200">
                    Phusao has a zero-tolerance policy towards human trafficking and exploitation. We vigorously cooperate with law enforcement agencies to identify and prosecute offenders.
                </div>
            </div>

            <h3>Our Commitment</h3>
            <p>We are dedicated to maintaining a safe and consensual environment for all users. We employ strict verification processes to ensure all creators are adults and consenting to their participation.</p>

            <h3>Report Suspicious Activity</h3>
            <p>If you suspect any case of human trafficking or exploitation, please report it immediately.</p>

            <div className="mt-8">
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition">
                    Report Issue
                </button>
            </div>
        </PolicyPage>
    );
}
