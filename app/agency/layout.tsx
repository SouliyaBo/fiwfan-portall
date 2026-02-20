import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agency สังกัด | รวมสังกัดสาวไซด์ไลน์",
    description: "รวมสังกัด Agency สาวไซด์ไลน์ สาวพีอาร์ บน Phusao.com เลือกสังกัดที่ใช่ ดูน้องๆ ในสังกัด",
    alternates: {
        canonical: "/agency",
    },
};

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
