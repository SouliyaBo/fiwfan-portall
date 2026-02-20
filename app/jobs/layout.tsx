import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ประกาศหาเพื่อนเที่ยว | Tourist Jobs",
    description: "ประกาศหาเพื่อนเที่ยว หาคู่เดท จ้างแฟนเช่า บน Phusao.com ครอบคลุมทุกพื้นที่ในไทยและลาว",
    alternates: {
        canonical: "/jobs",
    },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
