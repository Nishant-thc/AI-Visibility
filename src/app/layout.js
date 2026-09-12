import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
  weights: ['400', '500', '600']
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-sans',
  display: 'swap',
  weight: ['400', '500', '600']
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  display: 'swap',
  weight: ['400', '500']
});

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata = {
  title: 'Free AI Visibility Checker 2026 | Audit 80+ Metrics | The Hub Content',
  description: 'Run real-time diagnostic audits across 80+ metrics with the AI Visibility Checker by The Hub Content. See if LLMs can crawl and cite your website.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: {
    canonical: '/'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-6N606L7Z6K`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6N606L7Z6K', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <Script id="schema-org" type="application/ld+json" strategy="afterInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AI Visibility Checker",
              "url": "https://ai-visibility.thehubcontent.com",
              "description": "The ultimate AI Visibility Checker by The Hub Content. Run real-time diagnostic audits across 80+ metrics.",
              "applicationCategory": "SEO Tool",
              "operatingSystem": "All",
              "publisher": {
                "@type": "Organization",
                "name": "The Hub Content",
                "url": "https://thehubcontent.com"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
