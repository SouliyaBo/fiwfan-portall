import { Metadata } from "next";

export const metadata: Metadata = {
    title: "GDPR - การคุ้มครองข้อมูลส่วนบุคคล",
    description: "รายละเอียดการปฏิบัติตาม GDPR และการคุ้มครองข้อมูลส่วนบุคคลของ Phusao.com",
    alternates: {
        canonical: "/gdpr",
    },
};

export default function GDPRLayout({ children }: { children: React.ReactNode }) {
    return children;
}
