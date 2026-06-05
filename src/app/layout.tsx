import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import TabBar from "@/components/layout/TabBar";
import AuthGuard from "@/components/AuthGuard";
import { ToastProvider } from "@/components/ui/Toast";
import ProfileThemeSync from "@/components/ProfileThemeSync";
import ThemeSync from "@/components/ThemeSync";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Loom - AI 개인 아카이브",
  description: "저장하고, AI가 정리하고, 자연어로 찾는다",
  applicationName: "Loom",
  icons: { icon: "/logo-192.webp", apple: "/logo-192.webp" },
  appleWebApp: { capable: true, title: "Loom", statusBarStyle: "default" },
  openGraph: {
    title: "Loom - AI 개인 아카이브",
    description: "저장하고, AI가 정리하고, 자연어로 찾는다",
    siteName: "Loom",
    type: "website",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1721" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-surface md:bg-surface-soft">
        <ToastProvider>
          <ThemeSync />
          <ProfileThemeSync />
          <AuthGuard>
            <div className="min-h-dvh md:flex md:items-center md:justify-center md:p-6">
              <div className="phone-frame relative w-full max-w-[430px] md:h-[min(860px,calc(100dvh-48px))] md:rounded-[46px] md:bg-surface-section md:p-3 md:shadow-[0_28px_80px_rgba(35,28,52,0.24)]">
                <div className="hidden md:block absolute left-1/2 top-4 z-[60] h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/18" />
                <div className="phone-screen relative w-full min-h-dvh overflow-hidden bg-surface md:h-full md:min-h-0 md:rounded-[36px]">
                  <main className="h-full max-w-[430px] mx-auto overflow-y-auto pb-20 scrollbar-hide">
                    {children}
                  </main>
                  <TabBar />
                </div>
              </div>
            </div>
          </AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
