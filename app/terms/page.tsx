"use client";

import { PolicyPage } from "../../components/PolicyPage";
import { useLanguage } from "../../contexts/LanguageContext";
import Link from "next/link";

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <PolicyPage title={t('terms.title')}>
            <h1 className="text-2xl font-bold mb-4">{t('terms.h1')}</h1>

            <p className="mb-4">{t('terms.intro_1')}</p>
            <p className="mb-4">
                {t('terms.intro_2')} <Link href="/contact" className="text-pink-500 hover:text-pink-600 font-medium">{t('terms.intro_2_link')}</Link>.
            </p>
            <p className="mb-4">{t('terms.intro_3')}</p>
            <p className="mb-4">{t('terms.intro_4')}</p>
            <p className="mb-6">{t('terms.intro_5')}</p>

            <div className="space-y-6">
                <section>
                    <h3 className="text-xl font-bold mb-2">1. {t('terms.eligibility_title')}</h3>
                    <p>{t('terms.eligibility_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">2. {t('terms.term_fees_title')}</h3>
                    <p>{t('terms.term_fees_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">3. {t('terms.non_commercial_title')}</h3>
                    <p>{t('terms.non_commercial_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">4. {t('terms.proprietary_rights_title')}</h3>
                    <p>{t('terms.proprietary_rights_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">5. {t('terms.content_posted_title')}</h3>
                    <p className="mb-2">a. {t('terms.content_posted_a')}</p>
                    <p className="mb-2">b. {t('terms.content_posted_b')}</p>
                    <div className="mb-2">
                        <p>c. {t('terms.content_posted_c')}</p>
                        <p className="font-bold mt-1">{t('terms.content_posted_c_bold')}</p>
                    </div>
                    <div className="mb-2 pl-4">
                        <p className="mb-2">d. {t('terms.content_posted_d_intro')}</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{t('terms.content_posted_d_i')}</li>
                            <li>{t('terms.content_posted_d_ii')}</li>
                            <li>{t('terms.content_posted_d_iii')}</li>
                            <li>{t('terms.content_posted_d_iv')}</li>
                            <li>{t('terms.content_posted_d_v')}</li>
                            <li>{t('terms.content_posted_d_vi')}</li>
                            <li>{t('terms.content_posted_d_vii')}</li>
                            <li>{t('terms.content_posted_d_viii')}</li>
                            <li>{t('terms.content_posted_d_ix')}</li>
                            <li>{t('terms.content_posted_d_x')}</li>
                            <li>{t('terms.content_posted_d_xi')}</li>
                            <li>{t('terms.content_posted_d_xii')}</li>
                        </ul>
                    </div>
                    <p className="mb-2">e. {t('terms.content_posted_e')}</p>
                    <p className="mb-2">f. {t('terms.content_posted_f')}</p>
                    <div className="mb-2">
                        <p>g. {t('terms.content_posted_g')}</p>
                        <p className="font-bold mt-1">{t('terms.content_posted_g_bold')}</p>
                        <p className="mt-1">{t('terms.content_posted_g_final')}</p>
                    </div>
                    <p className="mb-2">h. {t('terms.content_posted_h')}</p>
                    <p className="mb-2">i. {t('terms.content_posted_i')}</p>
                    <p className="mb-2">j. {t('terms.content_posted_j')}</p>
                    <p className="mb-2">k. {t('terms.content_posted_k')}</p>
                    <p className="mb-2">l. {t('terms.content_posted_l')}</p>
                    <p className="mb-2">m. {t('terms.content_posted_m')}</p>
                    <p className="mb-2">n. {t('terms.content_posted_n')}</p>
                </section>

                <section>
                    <p className="mb-2">{t('terms.advertising_effectiveness')}</p>
                    <p>{t('terms.advertiser_responsibility')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">6. {t('terms.copyright_title')}</h3>
                    <p>
                        {t('terms.copyright_content')} <Link href="/contact" className="text-pink-500 hover:text-pink-600 font-medium">{t('terms.copyright_link')}</Link>.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">7. {t('terms.anti_cheating_title')}</h3>
                    <p>{t('terms.anti_cheating_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">8. {t('terms.refund_title')}</h3>
                    <p className="mb-2">{t('terms.refund_intro')}</p>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>{t('terms.refund_list_1')}</li>
                        <li>{t('terms.refund_list_2')}</li>
                        <li>{t('terms.refund_list_3')}</li>
                        <li>{t('terms.refund_list_4')}</li>
                        <li>{t('terms.refund_list_5')}</li>
                        <li>{t('terms.refund_list_6')}</li>
                        <li>{t('terms.refund_list_7')}</li>
                        <li>{t('terms.refund_list_8')}</li>
                        <li>{t('terms.refund_list_9')}</li>
                        <li>{t('terms.refund_list_10')}</li>
                    </ol>
                    <p className="mt-4 mb-2">
                        {t('terms.refund_request_intro')} <Link href="/contact" className="text-pink-500 hover:text-pink-600 font-medium">{t('terms.refund_request_link')}</Link>.
                    </p>
                    <p className="mb-2">{t('terms.refund_request_details_intro')}</p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>{t('terms.refund_request_details_1')}</li>
                        <li>{t('terms.refund_request_details_2')}</li>
                        <li>{t('terms.refund_request_details_3')}</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">9. {t('terms.disputes_title')}</h3>
                    <p>{t('terms.disputes_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">10. {t('terms.privacy_title')}</h3>
                    <p>
                        {t('terms.privacy_content')} <Link href="/privacy" className="text-pink-500 hover:text-pink-600 font-medium">{t('terms.privacy_link')}</Link>.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">11. {t('terms.disclaimers_title')}</h3>
                    <p className="uppercase">{t('terms.disclaimers_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">12. {t('terms.limitation_title')}</h3>
                    <p>{t('terms.limitation_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">13. {t('terms.indemnity_title')}</h3>
                    <p>{t('terms.indemnity_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">14. {t('terms.other_title')}</h3>
                    <p className="uppercase">{t('terms.other_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">{t('terms.credit_cards_title')}</h3>
                    <p>{t('terms.credit_cards_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">{t('terms.compliance_title')}</h3>
                    <p>{t('terms.compliance_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">{t('terms.governing_law_title')}</h3>
                    <p>{t('terms.governing_law_content')}</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-2">{t('terms.service_provider_title')}</h3>
                    <p>
                        {t('terms.service_provider_content')} <Link href="/contact" className="text-pink-500 hover:text-pink-600 font-medium">{t('terms.service_provider_link')}</Link>.
                    </p>
                </section>

                <p className="text-sm text-gray-500 mt-8">{t('terms.last_updated')}</p>
            </div>
        </PolicyPage>
    );
}
