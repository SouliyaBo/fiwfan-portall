import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ติดต่อเรา (Contact Us)",
    description: "ติดต่อทีมงาน Phusao.com สอบถามข้อมูล แจ้งปัญหา หรือร้องเรียน",
    alternates: {
        canonical: "/contact",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
