import { Metadata } from "next";

export const metadata: Metadata = {
    title: "แพ็กเกจ & ราคา สมัครสมาชิก",
    description: "เลือกแพ็กเกจสมาชิก Phusao.com เพิ่มการมองเห็น อัปโหลดรูปและวิดีโอ ดันโปรไฟล์ให้เด่น",
    alternates: {
        canonical: "/plans",
    },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
    return children;
}
