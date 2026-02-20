import { Metadata } from "next";

export const metadata: Metadata = {
    title: "นโยบายความเป็นส่วนตัว (Privacy Policy)",
    description: "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของ Phusao.com เว็บไซต์หาเพื่อนเที่ยวและไซด์ไลน์",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
