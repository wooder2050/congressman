import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/lib/providers";
import Header from "@/components/layout/Header";
import TermSelector from "@/components/layout/TermSelector";
import BottomNav from "@/components/layout/BottomNav";
import ScrollToTop from "@/components/layout/ScrollToTop";

const GTM_ID = "GTM-5BXVCW6Z";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lawmake.kr"),
  title: {
    default: "국회의원 의정활동 정보",
    template: "%s | 국회의원 의정활동 정보",
  },
  description: "대한민국 국회의원의 출석, 법안 발의, 표결 등 의정활동 정보를 한눈에 확인하세요.",
  openGraph: {
    siteName: "국회의원 의정활동 정보",
    type: "website",
    locale: "ko_KR",
    url: "https://www.lawmake.kr",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "2KjeaOSHUpzm77ROYe1YNAMPbVf2ijuBftTdZMJjBfc",
    other: {
      "naver-site-verification": "3c816e4ea277d58ebd42911a077be604cb3e1625",
    },
  },
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
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <body className="font-sans antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          <ScrollToTop />
          <Header />
          <TermSelector />
          <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 lg:py-6">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
