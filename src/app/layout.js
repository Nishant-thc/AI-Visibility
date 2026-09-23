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
  },
  icons: {
    icon: '/logo_processed.png',
    shortcut: '/logo_processed.png',
    apple: '/logo_processed.png',
  },
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
        <Script id="schema-faq" type="application/ld+json" strategy="afterInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is AI Visibility and why does it matter for my website?",
                  "acceptedAnswer": { "@type": "Answer", "text": "AI Visibility is the measurable degree to which a website can be discovered, accessed, parsed, and cited by AI-powered answer engines and large language models (LLMs). It determines whether your brand appears in AI-generated answers from ChatGPT Search, Perplexity AI, Google AI Overviews, and Claude." }
                },
                {
                  "@type": "Question",
                  "name": "What is Answer Engine Optimization (AEO) and how is it different from SEO?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Answer Engine Optimization (AEO) is the practice of structuring website content so that AI answer engines can extract, understand, and cite it. Unlike traditional SEO which targets keyword rankings, AEO targets LLM retrieval systems that evaluate semantic clarity, structured data, AI-bot crawlability, and entity disambiguation." }
                },
                {
                  "@type": "Question",
                  "name": "How do I check if ChatGPT can crawl and index my website?",
                  "acceptedAnswer": { "@type": "Answer", "text": "ChatGPT live web search uses a crawler called OAI-SearchBot. To verify access: check that robots.txt does not disallow OAI-SearchBot, ensure there is no noai meta tag, and confirm your page returns a 200 HTTP status without requiring authentication. GPTBot (training crawler) is separate from OAI-SearchBot (live citation crawler)." }
                },
                {
                  "@type": "Question",
                  "name": "What is llms.txt and should my website have one?",
                  "acceptedAnswer": { "@type": "Answer", "text": "The llms.txt file is an emerging standard (analogous to robots.txt) that provides a structured Markdown document at /llms.txt to guide LLMs in understanding your website structure, purpose, and key content. It can reduce LLM token consumption by up to 80% and improve AI citation accuracy." }
                },
                {
                  "@type": "Question",
                  "name": "Why does my site rank on Google but not appear in Perplexity or ChatGPT answers?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Google and AI answer engines use different signals. AI engines prioritize: content clarity (Flesch score 60-80), structured data (JSON-LD Schema.org), raw HTML availability (JavaScript-rendered content is invisible to most AI crawlers), and direct question-answer content format." }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between GPTBot, OAI-SearchBot, and ChatGPT-User?",
                  "acceptedAnswer": { "@type": "Answer", "text": "GPTBot is OpenAI's model training crawler. OAI-SearchBot is OpenAI's live search indexing crawler that powers ChatGPT web search citations. ChatGPT-User is triggered on-demand when a user pastes a URL into ChatGPT. Blocking GPTBot does not affect ChatGPT citations; blocking OAI-SearchBot removes your site from ChatGPT search entirely." }
                },
                {
                  "@type": "Question",
                  "name": "How does structured data (Schema.org JSON-LD) improve AI visibility?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Schema.org JSON-LD provides machine-readable facts that AI systems extract with high confidence. Key types: Organization (brand identity), FAQPage (Q&A pairs), Article (content authority), Product (ecommerce/SaaS), HowTo (procedural guides). The @id property anchors your entity in the knowledge graph." }
                },
                {
                  "@type": "Question",
                  "name": "How can I optimize my website for Google AI Overviews?",
                  "acceptedAnswer": { "@type": "Answer", "text": "To optimize for Google AI Overviews: maintain strong traditional SEO signals, use declarative sentence structures that directly answer questions in the first 1-2 sentences, implement Article schema with dateModified, manage Google-Extended bot access, and build E-E-A-T signals through author biographies and expert attributions." }
                }
              ]
            }
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
