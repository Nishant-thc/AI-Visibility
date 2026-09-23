import Link from 'next/link';
import Footer from '../components/Footer';
import AuditInputBlock from '../components/AuditInputBlock';

export const metadata = {
  title: 'AI Visibility for DTC Brands & Shopify Stores | AI Shopping Audit | The Hub Content',
  description: 'DTC and Shopify brands rely on AI discovery as search shifts to ChatGPT and Perplexity. Audit your DTC store\'s robots.txt, Product JSON-LD schema, and AI crawler accessibility.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: { canonical: '/dtc' },
  openGraph: {
    title: 'AI Visibility for DTC Brands & Shopify Stores | The Hub Content',
    description: 'See if ChatGPT, Perplexity, and Google AI Overviews can index and cite your Shopify or custom DTC product catalog.',
    url: 'https://ai-visibility.thehubcontent.com/dtc',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'Why do Shopify stores often fail AI crawler indexing checks?',
    a: `Shopify stores frequently experience AI visibility issues due to three factors: (1) default robots.txt setups that restrict crawling of specific collections or search paths; (2) product catalog apps that inject product descriptions via client-side JavaScript, rendering text invisible to AI crawlers; and (3) missing or incomplete JSON-LD Offer and AggregateRating schema on customized theme templates. Running an AI Visibility audit identifies these Shopify-specific bottlenecks immediately.`,
  },
  {
    q: 'How do direct-to-consumer (DTC) brands appear in ChatGPT recommendations?',
    a: `ChatGPT relies on OAI-SearchBot to fetch live product specs, pricing, and availability. For your DTC products to appear in ChatGPT shopping comparisons, your product pages must: (1) explicitly allow OAI-SearchBot in robots.txt; (2) serve product titles, descriptions, and prices in raw HTML; (3) contain valid Schema.org Product and Offer JSON-LD markup; and (4) respond with TTFB under 400ms.`,
  },
  {
    q: 'What is the role of /llms.txt for DTC store brand positioning?',
    a: `An /llms.txt file allows DTC brands to control their narrative in AI answer engines. By providing a clean Markdown index of your brand story, core ingredient/material sourcing, sustainability credentials, and top product categories, you give LLMs authoritative, token-efficient context. When consumers ask AI engines about your brand values or product origins, the LLM quotes directly from your /llms.txt file.`,
  },
  {
    q: 'How does Perplexity AI handle Shopify product variants?',
    a: `PerplexityBot parses product variants by inspecting Schema.org Product markup containing multiple Offer nodes or HasVariant properties. If your store relies entirely on JavaScript dropdowns without updating raw HTML canonicals or JSON-LD arrays, Perplexity will only index the default variant. Providing structured variant data ensures all SKU variations are indexable by AI shopping engines.`,
  },
  {
    q: 'Does blocking AI bots protect DTC product designs from image scraping?',
    a: `Blocking GPTBot or ClaudeBot prevents AI model creators from training on your web text and assets. However, blocking OAI-SearchBot or PerplexityBot will completely erase your DTC store from live conversational search results. To protect IP while maintaining sales channels, block model training bots (GPTBot, ClaudeBot) but explicitly permit live search bots (OAI-SearchBot, PerplexityBot).`,
  },
  {
    q: 'How can DTC brands measure their Generative Engine Optimization (GEO) score?',
    a: `DTC brands measure GEO using an 80-metric audit evaluating crawler access, Product & Offer JSON-LD completeness, server response speed, Flesch reading ease, and entity linking (sameAs). The THC AI Visibility Auditor scores your store from 0–100 and generates actionable fixes tailored to ecommerce platforms like Shopify, WooCommerce, and BigCommerce.`,
  },
];

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function DtcLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div style={{ minHeight: '100vh', background: '#F3F4F7', color: '#14171C', fontFamily: 'var(--font-sans, system-ui)' }}>

        {/* ── NAV ─────────────────────────────────────────────────── */}
        <nav style={{ borderBottom: '1px solid #DEE1E7', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(243,244,247,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo_processed.png" alt="AI Visibility Checker" width={28} height={28} style={{ borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, color: '#14171C', fontSize: '15px' }}>AI Visibility Checker</span>
          </Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: '13px', color: '#565E6D', textDecoration: 'none', border: '1px solid #DEE1E7', padding: '7px 16px', borderRadius: '6px', background: '#FFFFFF' }}>
              Home
            </Link>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <header style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, color: '#D97706', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', marginBottom: '20px' }}>
            DTC &amp; SHOPIFY BRANDS · AEO AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.25rem)', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, lineHeight: 1.15, marginBottom: '18px', color: '#14171C', letterSpacing: '-0.02em' }}>
            AI Visibility for<br />
            <span style={{ color: '#D97706' }}>DTC Stores &amp; Shopify Brands</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#4B5563', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 36px' }}>
            As customer acquisition costs rise, conversational AI search offers a high-intent organic channel. Audit your DTC store to make sure AI shopping assistants recommend your products.
          </p>

          {/* Embedded Interactive Audit Form */}
          <AuditInputBlock
            pageType="DTC"
            buttonText="Audit DTC Store Free →"
            placeholder="https://your-dtc-store.com"
            quickPicks={['bombas.com', 'awaytravel.com', 'glossier.com', 'liquidiv.com']}
            accentGradient="linear-gradient(135deg, #D97706 0%, #B45309 100%)"
            badgeText="DTC AEO AUDIT PROBE"
          />
        </header>

        {/* ── SIGNALS GRID ────────────────────────────────────────── */}
        <section style={{ maxWidth: '920px', margin: '0 auto', padding: '20px 24px 60px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '36px', fontWeight: 600, color: '#14171C' }}>
            Shopify &amp; DTC AI Visibility Essentials
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🛍️', title: 'Shopify Product Schema', body: 'Ensures Product, Offer, price, and availability JSON-LD nodes exist in initial server response.' },
              { icon: '🤖', title: 'AI Retrieval Bot Access', body: 'Verifies OAI-SearchBot and PerplexityBot are not accidentally blocked in Shopify robots.txt.' },
              { icon: '📄', title: 'HTML vs JS Description', body: 'Confirms product descriptions render in server HTML without requiring client JavaScript hydration.' },
              { icon: '⚡', title: 'Shopify CDN & TTFB', body: 'Measures server response time on Shopify CDN edge servers to prevent bot timeout drop-offs.' },
              { icon: '📖', title: 'Brand Story Readability', body: 'Evaluates your brand about page and product copy for LLM RAG vector chunking.' },
              { icon: '🗺️', title: 'Shopify /llms.txt Setup', body: 'Creates a clean Markdown navigation map for LLMs to index product lines without web bloat.' },
            ].map((card) => (
              <div key={card.title} style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: '#14171C' }}>{card.title}</h3>
                <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ SECTION ─────────────────────────────────────────── */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '36px', fontWeight: 600, textAlign: 'center', color: '#14171C' }}>
            DTC &amp; Shopify AI Visibility: Questions &amp; Answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '12px', padding: '24px', borderLeft: '4px solid #D97706', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#14171C', lineHeight: 1.45 }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────── */}
        <section style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '16px', maxWidth: '800px', margin: '0 auto 80px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px', color: '#14171C' }}>
            Is Your DTC Store AI-Ready?
          </h2>
          <p style={{ color: '#4B5563', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto 28px' }}>
            Run a free 80-metric AI Visibility audit on any Shopify or DTC store URL in under 60 seconds.
          </p>

          <AuditInputBlock
            pageType="DTC"
            buttonText="Free DTC Store Audit →"
            placeholder="https://your-dtc-store.com"
            quickPicks={[]}
            accentGradient="linear-gradient(135deg, #D97706 0%, #B45309 100%)"
            badgeText="INSTANT DTC AUDIT PROBE"
          />
        </section>

        <Footer />
      </div>
    </>
  );
}
