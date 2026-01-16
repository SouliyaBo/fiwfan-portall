import { PolicyPage } from "../../components/PolicyPage";

export default function FAQPage() {
    return (
        <PolicyPage title="Frequently Asked Questions">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">What is Phusao?</h3>
                    <p>Phusao is a platform that connects creators with agencies and provides a space for adults to advertise their time and companionship.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Is it free to use?</h3>
                    <p>Browsing the website is free. Some features requires subscription.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">How do I verify my account?</h3>
                    <p>You can verify your account by submitting the required documents in your dashboard.</p>
                </div>
            </div>
        </PolicyPage>
    );
}
