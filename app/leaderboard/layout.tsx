import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ตารางจัดอันดับ (Leaderboard)",
    description: "ตารางจัดอันดับสมาชิก Phusao.com ส่งการบ้านลุ้นรับรางวัลและสิทธิพิเศษ",
    alternates: {
        canonical: "/leaderboard",
    },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
