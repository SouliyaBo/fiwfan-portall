import { PolicyPage } from "../../components/PolicyPage";

export default function GDPRPage() {
    return (
        <PolicyPage title="GDPR Compliance">
            <p>We are committed to protecting your data and privacy in accordance with the General Data Protection Regulation (GDPR).</p>

            <h3>Your Rights</h3>
            <ul>
                <li>The right to be informed</li>
                <li>The right of access</li>
                <li>The right to rectification</li>
                <li>The right to erasure</li>
                <li>The right to restrict processing</li>
                <li>The right to data portability</li>
                <li>The right to object</li>
            </ul>

            <p>If you wish to exercise any of these rights, please contact our support team.</p>
        </PolicyPage>
    );
}
