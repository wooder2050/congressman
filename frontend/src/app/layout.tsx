import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "@/lib/providers";
import Header from "@/components/layout/Header";
import TermSelector from "@/components/layout/TermSelector";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import JsonLd from "@/components/seo/JsonLd";

const GTM_ID = "GTM-5BXVCW6Z";

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
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "국회의원 의정활동 정보",
            url: "https://www.lawmake.kr",
            logo: "https://www.lawmake.kr/icon.svg",
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "국회의원 의정활동 정보",
            url: "https://www.lawmake.kr",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.lawmake.kr/members?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </head>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6439388251426570"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
      <Script id="gtm" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-(--color-primary) focus:px-4 focus:py-2 focus:text-(--color-text-inverse)"
        >
          본문으로 건너뛰기
        </a>
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
          <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-4 lg:py-6">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
