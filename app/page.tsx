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
import { API_BASE_URL } from '../lib/constants';

async function getData() {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? 'http://127.0.0.1:8080' : API_BASE_URL;

    // Parallel data fetching
    const [creatorsRes, agenciesRes, storiesRes, zonesRes, telegramRes, jobsRes] = await Promise.all([
      fetch(`${baseUrl}/creators`, { cache: 'no-store' }).catch(e => ({ ok: false })),
      fetch(`${baseUrl}/agencies`, { next: { revalidate: 3600 } }).catch(e => ({ ok: false })),
      fetch(`${baseUrl}/stories/feed`, { cache: 'no-store' }).catch(e => ({ ok: false })),
      fetch(`${baseUrl}/creators/zones`, { next: { revalidate: 3600 } }).catch(e => ({ ok: false })),
      fetch(`${baseUrl}/settings?key=telegram_url`, { next: { revalidate: 3600 } }).catch(e => ({ ok: false })),
      fetch(`${baseUrl}/jobs?limit=10`, { cache: 'no-store' }).catch(e => ({ ok: false }))
    ]);

    // Process Creators
    const creators = (creatorsRes as Response).ok ? await (creatorsRes as Response).json() : [];

    // Process Agencies
    const agencies = (agenciesRes as Response).ok ? await (agenciesRes as Response).json() : [];

    // Process Stories (Group by Creator)
    const rawStories = (storiesRes as Response).ok ? await (storiesRes as Response).json() : [];
    const groupedStories: any = {};
    if (Array.isArray(rawStories)) {
      rawStories.forEach((s: any) => {
        if (!s.creator) return;
        const cid = s.creator._id;
        if (!groupedStories[cid]) {
          groupedStories[cid] = { ...s.creator, stories: [] };
        }
        groupedStories[cid].stories.push(s);
      });
    }
    const stories = Object.values(groupedStories);

    // Process Zones (Group by Country)
    const rawZones = (zonesRes as Response).ok ? await (zonesRes as Response).json() : [];
    const groupedZones: any = {};
    if (Array.isArray(rawZones)) {
      rawZones.forEach((z: any) => {
        const c = z.country || "Thailand";
        if (!groupedZones[c]) groupedZones[c] = [];
        groupedZones[c].push(z);
      });
    }
    const zones = Object.entries(groupedZones).map(([country, items]) => ({ country, items }));

    // Process Telegram URL
    const telegramData = (telegramRes as Response).ok ? await (telegramRes as Response).json() : {};
    const telegramUrl = telegramData.value || "";

    // Process Job Count
    const jobsData = (jobsRes as Response).ok ? await (jobsRes as Response).json() : [];
    const jobCount = Array.isArray(jobsData) ? jobsData.length : 0;

    return { creators, agencies, stories, zones, telegramUrl, jobCount };

  } catch (error) {
    console.error("SSR Data Fetching Error:", error);
    return { creators: [], agencies: [], stories: [], zones: [], telegramUrl: "", jobCount: 0 };
  }
}

export default async function Home() {
  const data = await getData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Phusao',
    url: 'https://phusao.com',
    description: 'ค้นหาสาวไซด์ไลน์ เด็กเอน สาวพีอาร์ ตรงปก 100% รีวิวจริง มีคลิปยืนยัน ครอบคลุมไทยและลาว',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://phusao.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>}>
        <HomeClient
          initialCreators={data.creators}
          initialAgencies={data.agencies}
          initialStories={data.stories}
          initialZones={data.zones}
          initialTelegramUrl={data.telegramUrl}
          initialJobCount={data.jobCount}
        />
      </Suspense>
    </>
  );
}



