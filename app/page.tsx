import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "Phusao สาวลาว สาวพีอาร์ หาเด็กเอน หรือ pr อันดับ 1 | หาคู่เดท ไซด์ไลน์ตัวจริง ตรงปก มีคลิปให้ชม & รีวิวเต็มเว็บไซต์",
  description: "ค้นหา Phusao.com เว็บรวมสาวไซด์ไลน์ แหล่งยอดนิยมมีทั้งประเทศไทย และ ลาว รับงานกินข้าว สาวเดท งานเด็กเอน งานกินเหล้า และงานปาตี้ รวมสาวตรงปก 100% ไซไล มีคลิปวิดีโอ ยืนยันตัวตน ชัดเจน และ รีวิวจากลูกค้า ก่อนแอด whatsapp นัดง่าย ตรงเวลา ครอบคลุมทุกพื้นที่ 2 ประเทศ",
  keywords: ["งานเอน", "ไซไล", "สาวไซด์ไลน์", "ไซส์ line", "ไซลาย", "ไซด์ไลน์", "รับงานกินเหล้า", "sideline"],
  openGraph: {
    title: "Phusao สาวลาว สาวพีอาร์ หาเด็กเอน หรือ pr อันดับ 1 | หาคู่เดท ไซด์ไลน์ตัวจริง ตรงปก มีคลิปให้ชม & รีวิวเต็มเว็บไซต์",
    description: "ค้นหา Phusao.com เว็บรวมสาวไซด์ไลน์ แหล่งยอดนิยมมีทั้งประเทศไทย และ ลาว รับงานกินข้าว สาวเดท งานเด็กเอน งานกินเหล้า และงานปาตี้ รวมสาวตรงปก 100% ไซไล มีคลิปวิดีโอ ยืนยันตัวตน ชัดเจน และ รีวิวจากลูกค้า ก่อนแอด whatsapp นัดง่าย ตรงเวลา ครอบคลุมทุกพื้นที่ 2 ประเทศ",
    type: "website"
  },
};

import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}



