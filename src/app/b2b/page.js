import Link from 'next/link';
import Footer from '../components/Footer';

export const metadata = {
  title: 'AI Visibility for B2B Companies | Are AI Assistants Recommending Your Brand? | The Hub Content',
  description: 'B2B buyers now ask ChatGPT, Perplexity, and Claude for vendor recommendations. If your brand isn\'t indexed by AI crawlers, you\'re missing the highest-intent decision-stage buyers. Run a free AI Visibility audit.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: { canonical: '/b2b' },
  openGraph: {
    title: 'AI Visibility for B2B Companies | The Hub Content',
    description: 'Are AI assistants recommending your B2B brand? Run a free audit to find out.',
    url: 'https://ai-visibility.thehubcontent.com/b2b',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'Why is my B2B SaaS product not being recommended by ChatGPT or Perplexity?',
    a: `B2B SaaS companies are often invisible to AI assistants because their websites rely heavily on JavaScript-rendered content. Most AI crawlers — including OAI-SearchBot and PerplexityBot — parse only the raw HTML response, meaning any product features, pricing, or comparison content loaded via React, Vue, or Angular after page load is completely invisible. The fix is ensuring your core value proposition, key features, and use case descriptions are present in the server-rendered HTML, not just loaded client-side.`,
  },
  {
    q: 'What content types help B2B brands appear in AI-generated vendor lists?',
    a: `AI assistants compile vendor recommendation lists from multiple signals: (1) Explicit "best of" and comparison editorial content from third-party review sites like G2, Capterra, and TrustRadius. (2) Your own comparison and alternative pages (e.g., "/vs-competitor" or "/alternatives"). (3) Use-case-specific landing pages with clear entity definitions (What is [Your Tool]? Who uses it?). (4) Well-structured FAQ content using FAQPage schema that directly answers buyer questions. (5) Strong Organization schema with defined service areas, industries served, and product categories.`,
  },
  {
    q: 'How does AI visibility affect B2B buyer journey and pipeline?',
    a: `The B2B buyer journey increasingly begins with an AI assistant query rather than a Google search. Analysts and decision-makers ask ChatGPT or Perplexity questions like "What is the best CRM for mid-market B2B sales teams?" or "Compare [Category] vendors for enterprise use." If your brand appears in AI-generated answers at this discovery stage, it enters the consideration set before any human sales interaction. Brands invisible to AI assistants are being screened out before they even have the chance to engage buyers.`,
  },
  {
    q: 'What structured data schema is most important for B2B SaaS?',
    a: `For B2B SaaS and services companies, the most impactful Schema.org types are: (1) Organization — defining your company, founding date, service area, and industry. (2) SoftwareApplication — product name, description, applicationCategory, operatingSystem, pricing. (3) FAQPage — answering the exact questions your buyers ask AI assistants. (4) HowTo — step-by-step guides that AI assistants love to surface as featured answers. (5) Review and AggregateRating — social proof signals that increase citation confidence for AI systems.`,
  },
  {
    q: 'Should my B2B company block or allow AI crawlers?',
    a: `The answer depends on the specific crawler. GPTBot is used to train OpenAI's models — you can block it if you don't want your proprietary content used for training. However, blocking OAI-SearchBot (which powers ChatGPT's real-time web search) will remove your company from ChatGPT's live citation results entirely. Similarly, blocking PerplexityBot removes your brand from Perplexity's answer index. For most B2B companies, the optimal strategy is to allow all search-focused AI bots while blocking training-only bots.`,
  },
  {
    q: 'How do I measure my B2B brand\'s AI visibility over time?',
    a: `To track AI visibility trends, run monthly audits using this tool on your homepage, key product pages, and comparison pages. Track changes in your AI Visibility Score across the four categories: Crawler Access, Structured Data, Content Extractability, and Technical Performance. Additionally, manually query ChatGPT, Perplexity, and Claude with your target buyer questions monthly to observe whether your brand appears in generated answers. Document which pages are cited when your brand does appear — these are your highest-performing AI visibility assets to protect and expand.`,
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

export default function B2BLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div style={{ minHeight: '100vh', background: 'var(--bg, #0d0e12)', color: 'var(--ink, #e8eaf0)', fontFamily: 'var(--font-sans, system-ui)' }}>

        {/* ── NAV ─────────────────────────────────────────────────── */}
        <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(13,14,18,0.92)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo_processed.png" alt="AI Visibility Checker" width={28} height={28} style={{ borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, color: '#fff', fontSize: '15px' }}>AI Visibility Checker</span>
          </Link>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--ink-soft, #8b8fa8)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', padding: '7px 16px', borderRadius: '6px' }}>
            ← Run Free Audit
          </Link>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <header style={{ maxWidth: '820px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#2dd4bf', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', marginBottom: '24px' }}>
            B2B · VENDOR RECOMMENDATION AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            AI Visibility for<br />
            <span style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>B2B Companies</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 36px' }}>
            Your buyers are asking ChatGPT, Perplexity, and Claude for vendor recommendations — right now. If your brand isn't indexed by AI crawlers, you're invisible at the highest-intent moment in the B2B funnel.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(20,184,166,0.3)' }}>
            Audit Your B2B Brand Free →
          </Link>
        </header>

        {/* ── SIGNALS GRID ────────────────────────────────────────── */}
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '40px', fontWeight: 600 }}>
            Why B2B Brands Fail the AI Visibility Test
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🚫', title: 'JS-Gated Content', body: 'SaaS platforms often render features, pricing, and case studies via JavaScript. AI crawlers see an empty shell — not your product.' },
              { icon: '🏢', title: 'Missing Organization Schema', body: 'Without Organization JSON-LD defining your company name, industry, and service areas, AI systems can\'t confidently categorize your brand.' },
              { icon: '❓', title: 'No FAQ / Q&A Content', body: 'B2B buyers ask specific questions. Without FAQPage schema, your answers aren\'t surfaced by AI assistants as direct responses.' },
              { icon: '📊', title: 'No Comparison Pages', body: 'AI systems compile vendor comparisons from existing comparison content. "/vs-competitor" pages are among the highest-cited B2B page types.' },
              { icon: '🤖', title: 'Blocked AI Crawlers', body: 'Many enterprise sites block all bots for security. This also blocks OAI-SearchBot and PerplexityBot — eliminating all AI citation potential.' },
              { icon: '⚡', title: 'Slow Server Response', body: 'AI crawlers operating at scale skip slow pages. A TTFB over 600ms significantly reduces crawl depth and citation frequency for B2B sites.' },
            ].map((card) => (
              <div key={card.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: '#e8eaf0' }}>{card.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.65, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ SECTION ─────────────────────────────────────────── */}
        <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '40px', fontWeight: 600, textAlign: 'center' }}>
            B2B AI Visibility: Questions &amp; Answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderLeft: '3px solid rgba(20,184,166,0.4)', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#e8eaf0', lineHeight: 1.45 }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(56,189,248,0.06) 100%)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '16px', maxWidth: '760px', margin: '0 auto 80px', padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px' }}>
            Is Your B2B Brand Showing Up in AI Answers?
          </h2>
          <p style={{ color: 'var(--ink-soft, #8b8fa8)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
            Audit any B2B landing page, product page, or case study against 80+ AI visibility metrics. Free. Instant. No sign-up.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
            Free B2B AI Visibility Audit →
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
