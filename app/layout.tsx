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
  title: "Phusao",
  description: "Creator & Agency Portal",
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
