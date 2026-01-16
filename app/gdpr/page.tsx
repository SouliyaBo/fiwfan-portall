"use client";

import Link from "next/link";
import { PolicyPage } from "../../components/PolicyPage";
import { useLanguage } from "../../contexts/LanguageContext";

export default function GDPRPage() {
    const { t } = useLanguage();

    return (
        <PolicyPage title={t("gdpr.title")}>
            <p>{t("gdpr.intro")}</p>

            <h3 className="mt-6">{t("gdpr.controller_title")}</h3>
            <p>{t("gdpr.controller_content")}</p>

            <h3 className="mt-6">{t("gdpr.contact_title")}</h3>
            <p>
                {t("gdpr.contact_content")} <Link href="/contact" className="text-[#F84E6E] hover:underline">{t("gdpr.contact_link")}</Link>
            </p>

            <h3 className="mt-6">{t("gdpr.security_title")}</h3>
            <p>
                {t("gdpr.security_content_1")}<br />
                {t("gdpr.security_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.form_contact_title")}</h3>
            <p>
                {t("gdpr.form_contact_content_1")}<br />
                {t("gdpr.form_contact_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.form_advertiser_title")}</h3>
            <p>
                {t("gdpr.form_advertiser_content_1")}<br />
                {t("gdpr.form_advertiser_content_2")}<br />
                {t("gdpr.form_advertiser_content_3")}
            </p>

            <h3 className="mt-6">{t("gdpr.form_member_title")}</h3>
            <p>
                {t("gdpr.form_member_content_1")}<br />
                {t("gdpr.form_member_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.form_advertiser_contact_title")}</h3>
            <p>
                {t("gdpr.form_advertiser_contact_content_1")}<br />
                {t("gdpr.form_advertiser_contact_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.email_corr_title")}</h3>
            <p>
                {t("gdpr.email_corr_content_1")}<br />
                {t("gdpr.email_corr_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.newsletter_title")}</h3>
            <p>
                {t("gdpr.newsletter_content_1")}<br />
                {t("gdpr.newsletter_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.stats_title")}</h3>
            <p>
                {t("gdpr.stats_content_1")}<br />
                {t("gdpr.stats_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.recipients_title")}</h3>
            <p>
                {t("gdpr.recipients_content_1")}<br />
                {t("gdpr.recipients_content_2")}
            </p>

            <h3 className="mt-6">{t("gdpr.transfer_title")}</h3>
            <p>
                {t("gdpr.transfer_content")}
            </p>
            <ul>
                <li>{t("gdpr.transfer_list_1")}</li>
                <li>{t("gdpr.transfer_list_2")}</li>
                <li>{t("gdpr.transfer_list_3")}</li>
            </ul>

            <h3 className="mt-6">{t("gdpr.retention_title")}</h3>
            <p>
                {t("gdpr.retention_content_1")}<br />
                {t("gdpr.retention_content_2")}<br />
                {t("gdpr.retention_content_3")}<br />
                {t("gdpr.retention_content_4")}
            </p>

            <h3 className="mt-6">{t("gdpr.rights_title")}</h3>
            <p>{t("gdpr.rights_intro")}</p>
            <ul>
                <li>{t("gdpr.rights_list_1")}</li>
                <li>{t("gdpr.rights_list_2")}</li>
                <li>{t("gdpr.rights_list_3")}</li>
                <li>{t("gdpr.rights_list_4")}</li>
                <li>{t("gdpr.rights_list_5")}</li>
                <li>{t("gdpr.rights_list_6")}</li>
                <li>{t("gdpr.rights_list_7")}</li>
                <li>{t("gdpr.rights_list_8")}</li>
                <li>{t("gdpr.rights_list_9")}</li>
                <li>{t("gdpr.rights_list_10")}</li>
            </ul>

            <h3 className="mt-6">{t("gdpr.filing_title")}</h3>
            <p>
                {t("gdpr.contact_content")} <Link href="/contact" className="text-[#F84E6E] hover:underline">{t("gdpr.contact_link")}</Link>
            </p>

            <h3 className="mt-6">{t("gdpr.changes_title")}</h3>
            <ul>
                <li>{t("gdpr.changes_list_1")}</li>
                <li>{t("gdpr.changes_list_2")}</li>
            </ul>

            <h3 className="mt-6">{t("gdpr.cookies_title")}</h3>
            <p>
                {t("gdpr.cookies_content_1")}
            </p>
            <p className="font-bold">{t("gdpr.cookies_purpose_title")}</p>
            <ul>
                <li>{t("gdpr.cookies_purpose_list_1")}</li>
                <li>{t("gdpr.cookies_purpose_list_2")}</li>
                <li>{t("gdpr.cookies_purpose_list_3")}</li>
                <li>{t("gdpr.cookies_purpose_list_4")}</li>
            </ul>
            <p>
                {t("gdpr.cookies_links_intro")}
            </p>
            <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#F84E6E] hover:underline">Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/products/firefox/protect-your-privacy/cookies" target="_blank" rel="noopener noreferrer" className="text-[#F84E6E] hover:underline">Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#F84E6E] hover:underline">Safari</a></li>
            </ul>
            <p>
                {t("gdpr.cookies_closing")}
            </p>
        </PolicyPage>
    );
}
