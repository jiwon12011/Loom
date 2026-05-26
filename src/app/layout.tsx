import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import TabBar from "@/components/layout/TabBar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Loom - AI 개인 아카이브",
  description: "저장하고, AI가 정리하고, 자연어로 찾는다",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white">
        <ToastProvider>
          <main className="pb-20">{children}</main>
          <TabBar />
        </ToastProvider>
      </body>
    </html>
  );
}
