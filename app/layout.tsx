import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Lao } from "next/font/google"; // Import Noto_Sans_Lao
import "./globals.css";
import { AppShell } from "../components/AppShell";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleAnalytics from "../components/GoogleAnalytics";
import { LanguageProvider } from "../contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansLao = Noto_Sans_Lao({
  variable: "--font-noto-lao",
  subsets: ["lao"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://phusao.com'),
  title: {
    default: "Phusao - สาวลาว สาวพีอาร์ เด็กเอน ไซด์ไลน์ ตรงปก 100%",
    template: "%s | Phusao",
  },
  description: "ค้นหาสาวไซด์ไลน์ เด็กเอน สาวพีอาร์ ตรงปก 100% รีวิวจริง มีคลิปยืนยัน ครอบคลุมไทยและลาว | Phusao.com",
  keywords: ["ไซด์ไลน์", "เด็กเอน", "สาวพีอาร์", "sideline", "Phusao", "รับงาน", "หาคู่เดท", "ไซไล", "phusao"],
  openGraph: {
    type: "website",
    siteName: "Phusao",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "wpSSc1eQpNvWIejUDf9kJ6QV4O-DYkb6PKN1pFga-Jw",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansLao.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <LanguageProvider>
          <AppShell>
            {children}
          </AppShell>
        </LanguageProvider>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </body>
    </html>
  );
}
