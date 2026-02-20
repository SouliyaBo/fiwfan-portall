import { Metadata } from "next";

export const metadata: Metadata = {
    title: "คำถามที่พบบ่อย (FAQ)",
    description: "คำถามที่พบบ่อยเกี่ยวกับ Phusao.com วิธีสมัครสมาชิก ยืนยันตัวตน และใช้งานแพลตฟอร์ม",
    alternates: {
        canonical: "/faq",
    },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return children;
}
