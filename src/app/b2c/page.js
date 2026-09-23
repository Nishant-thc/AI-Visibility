import Link from 'next/link';
import Footer from '../components/Footer';
import AuditInputBlock from '../components/AuditInputBlock';

export const metadata = {
  title: 'AI Visibility for B2C & Consumer Brands | Will AI Recommend Your Brand to Consumers? | The Hub Content',
  description: 'Consumers use ChatGPT, Perplexity, and Google AI Overviews to make purchasing, travel, and lifestyle decisions. Audit your B2C brand\'s AI Visibility and ensure AI search bots cite your website.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: { canonical: '/b2c' },
  openGraph: {
    title: 'AI Visibility for B2C & Consumer Brands | The Hub Content',
    description: 'Find out if AI search engines cite your B2C brand when consumers ask for lifestyle, travel, service, and product recommendations.',
    url: 'https://ai-visibility.thehubcontent.com/b2c',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'How are consumers using conversational AI to discover consumer brands?',
    a: `Millions of consumers now ask ChatGPT, Perplexity, and Google AI Overviews questions like "What are the best sustainable clothing brands?", "Top rated local wellness centers", or "Which subscription box is worth it?". AI answer engines synthesize web content in real time to provide direct brand recommendations with inline citations. If your consumer website lacks crawler access or entity signals, AI assistants will cite your competitors instead.`,
  },
  {
    q: 'What structured data helps B2C brands get cited in AI answer engines?',
    a: `B2C websites benefit from a rich combination of Schema.org markup: (1) Brand and Organization schema establishing official entity identity; (2) LocalBusiness or Store schema for brick-and-mortar locations; (3) AggregateRating and Review schema to signal trust and consumer social proof; and (4) FAQPage schema for direct Q&A extraction by RAG models. Structured JSON-LD signals increase the likelihood of AI systems featuring your brand in recommendation lists.`,
  },
  {
    q: 'Why does mobile performance matter for B2C AI visibility?',
    a: `Over 80% of consumer AI queries originate on mobile devices, and AI search engines prioritize mobile-first indexed pages. High mobile TTFB (>800ms) or heavy render-blocking assets cause headless AI crawlers to time out before retrieving page copy. Ensuring fast TTFB (<400ms) and clean mobile viewport HTML guarantees AI crawlers successfully index consumer-facing pages.`,
  },
  {
    q: 'How can B2C brands optimize content for conversational AI queries?',
    a: `Conversational AI models extract answers from content written in natural, high-readability prose (Flesch Reading Ease score of 60–80). B2C brands should structure landing pages with direct H2/H3 question headers matching consumer intent (e.g., "How does [Brand] compare to [Competitor]?"), followed by concise 2-3 sentence answer summaries. Avoid embedding key brand claims inside complex images or client-side JavaScript tabs that crawlers cannot read.`,
  },
  {
    q: 'What is the impact of third-party reviews on B2C AI recommendations?',
    a: `AI answer engines cross-verify brand claims against third-party review sites (Trustpilot, Google Reviews, Yelp, Reddit). Including Organization sameAs entity links to your official profiles on these platforms anchors your brand within global knowledge graphs, boosting overall model confidence when recommending your consumer services.`,
  },
  {
    q: 'How does blocking AI crawlers affect consumer brand perception?',
    a: `If a B2C website blocks retrieval crawlers (like OAI-SearchBot or PerplexityBot), AI assistants cannot fetch live page data when users ask about the brand. Instead of providing up-to-date pricing or service details, the AI assistant may inform the user that information is unavailable or display outdated third-party summaries, negatively impacting brand perception.`,
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

export default function B2cLandingPage() {
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
          <div style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, color: '#E11D48', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', marginBottom: '20px' }}>
            B2C &amp; CONSUMER BRANDS · AEO AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.25rem)', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, lineHeight: 1.15, marginBottom: '18px', color: '#14171C', letterSpacing: '-0.02em' }}>
            AI Visibility for<br />
            <span style={{ color: '#E11D48' }}>B2C &amp; Consumer Brands</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#4B5563', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 36px' }}>
            Every day, consumers ask ChatGPT and Perplexity for lifestyle, travel, service, and product recommendations. Ensure AI answer engines cite your consumer brand first.
          </p>

          {/* Embedded Interactive Audit Form */}
          <AuditInputBlock
            pageType="B2C"
            buttonText="Audit B2C Brand Free →"
            placeholder="https://your-consumer-brand.com"
            quickPicks={['airbnb.com', 'duolingo.com', 'headspace.com', 'hellofresh.com']}
            accentGradient="linear-gradient(135deg, #E11D48 0%, #EA580C 100%)"
            badgeText="B2C AEO AUDIT PROBE"
          />
        </header>

        {/* ── SIGNALS GRID ────────────────────────────────────────── */}
        <section style={{ maxWidth: '920px', margin: '0 auto', padding: '20px 24px 60px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '36px', fontWeight: 600, color: '#14171C' }}>
            What AI Models Evaluate for Consumer Brands
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🌟', title: 'Review & Rating Schema', body: 'AggregateRating JSON-LD provides machine-readable proof of consumer satisfaction required for AI recommendations.' },
              { icon: '📍', title: 'LocalBusiness Entity Tags', body: 'Structured geo-location and operating hours schema ensure local consumer queries cite your physical locations.' },
              { icon: '📱', title: 'Mobile TTFB & Load Speed', body: 'Consumer queries rely heavily on fast mobile crawlers. TTFB under 400ms prevents bot timeouts.' },
              { icon: '💬', title: 'Natural Reading Ease', body: 'Flesch score of 60–80 ensures LLM semantic chunkers can easily parse and summarize your brand value.' },
              { icon: '🤖', title: 'Search Bot Permissions', body: 'Explicitly allowing OAI-SearchBot and PerplexityBot ensures real-time consumer answers include your website URL.' },
              { icon: '🔗', title: 'Social & Web Entity Links', body: 'Connecting your brand to official social profiles and review portals anchors your entity identity in AI knowledge graphs.' },
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
            B2C &amp; Consumer AI Visibility: Questions &amp; Answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '12px', padding: '24px', borderLeft: '4px solid #E11D48', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#14171C', lineHeight: 1.45 }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────── */}
        <section style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '16px', maxWidth: '800px', margin: '0 auto 80px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px', color: '#14171C' }}>
            Is Your B2C Brand AI-Ready?
          </h2>
          <p style={{ color: '#4B5563', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto 28px' }}>
            Run a free 80-metric AI Visibility audit on any consumer brand website or landing page in under 60 seconds.
          </p>

          <AuditInputBlock
            pageType="B2C"
            buttonText="Free B2C Brand Audit →"
            placeholder="https://your-consumer-brand.com"
            quickPicks={[]}
            accentGradient="linear-gradient(135deg, #E11D48 0%, #EA580C 100%)"
            badgeText="INSTANT B2C AUDIT PROBE"
          />
        </section>

        <Footer />
      </div>
    </>
  );
}
