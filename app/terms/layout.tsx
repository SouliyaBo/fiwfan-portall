import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ข้อกำหนดการใช้งาน (Terms of Service)",
    description: "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ Phusao.com แพลตฟอร์มหาเพื่อนเที่ยว คู่เดท และไซด์ไลน์",
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
