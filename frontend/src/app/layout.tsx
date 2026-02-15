import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import TermSelector from "@/components/layout/TermSelector";
import BottomNav from "@/components/layout/BottomNav";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: {
    default: "국회의원 의정활동 정보",
    template: "%s | 국회의원 의정활동 정보",
  },
  description: "대한민국 국회의원의 출석, 법안 발의, 표결 등 의정활동 정보를 한눈에 확인하세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans antialiased">
        <Header />
        <TermSelector />
        <main className="min-h-screen px-4 py-4">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
