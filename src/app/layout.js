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
  title: 'THC Ai Visibility Score — Diagnostic Instrument for SEO & Content Strategists',
  description: 'Verifiable, real-time diagnostic instrument measuring whether AI systems (LLM crawlers, answer engines, AI Overviews, Perplexity) can access, parse, understand, and cite your website.',
  robots: 'index, follow'
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
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
