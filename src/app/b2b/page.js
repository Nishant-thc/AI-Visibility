import Link from 'next/link';
import Footer from '../components/Footer';
import AuditInputBlock from '../components/AuditInputBlock';

export const metadata = {
  title: 'AI Visibility for B2B & SaaS | Will AI Suggest Your Solution to Enterprise Buyers? | The Hub Content',
  description: 'Enterprise buyers use ChatGPT and Perplexity to research SaaS and B2B solutions. Find out if your website is indexed, cited, and recommended by AI answer engines with a free AI Visibility audit.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: { canonical: '/b2b' },
  openGraph: {
    title: 'AI Visibility for B2B & SaaS | The Hub Content',
    description: 'Audit whether ChatGPT, Claude, and Perplexity recommend your SaaS or B2B products to enterprise buyers.',
    url: 'https://ai-visibility.thehubcontent.com/b2b',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'Why is my B2B SaaS product missing when buyers ask ChatGPT for recommendations?',
    a: `Enterprise buyers increasingly use ChatGPT, Claude, and Perplexity for software vendor discovery. If your site blocks OAI-SearchBot or Claude-SearchBot in robots.txt, or if your core product messaging is hidden behind client-side JavaScript, AI answer engines cannot read or cite your product capabilities. Additionally, B2B sites without clear Schema.org Organization, SoftwareApplication, and Product JSON-LD markup lack the structured entity signals required for AI systems to accurately categorize software offerings.`,
  },
  {
    q: 'What structured data is essential for B2B software and service companies?',
    a: `B2B companies require three foundational schema types: (1) Organization schema with sameAs links to Crunchbase, LinkedIn, G2, and Wikidata to anchor entity identity; (2) SoftwareApplication or Service schema detailing operatingSystems, applicationCategory, pricing ranges, and key features; and (3) Article or TechArticle schema on documentation and whitepapers. These structured signals allow RAG vector databases to parse and attribute software capabilities without hallucinating features.`,
  },
  {
    q: 'How does /llms.txt help B2B SaaS documentation get cited by AI?',
    a: `An /llms.txt file provides AI crawlers with a clean, Markdown-formatted index of your key documentation, product features, and pricing details. Instead of crawling hundreds of heavy HTML pages laden with navigation chrome, LLMs read /llms.txt to fetch precise markdown docs. This reduces token consumption by up to 80% and ensures AI answer engines ingest your most authoritative product specifications when answering buyer queries.`,
  },
  {
    q: 'Should B2B companies block GPTBot or ClaudeBot?',
    a: `Blocking GPTBot (OpenAI) or ClaudeBot (Anthropic) stops foundation model creators from scraping your content to train future LLMs. However, you should NEVER block OAI-SearchBot, Claude-SearchBot, or PerplexityBot if you want live citations in search answers. The recommended configuration for B2B brands is to disallow training bots while explicitly allowing retrieval search bots in robots.txt.`,
  },
  {
    q: 'How do technical whitepapers and documentation impact AI visibility?',
    a: `LLMs heavily favor technical documentation, API specs, and whitepapers when generating detailed comparison answers for enterprise queries. To maximize extractability: (1) maintain a clean sequential heading structure (H1→H2→H3 without level skips); (2) keep Flesch Reading Ease in the 55-75 range for clear semantic chunking; (3) ensure text is available in raw HTML without requiring JavaScript execution; and (4) serve pages with server TTFB under 400ms to prevent bot timeouts.`,
  },
  {
    q: 'What is the role of entity linking (sameAs) in B2B AI visibility?',
    a: `Entity linking connects your domain to established knowledge bases. When your Organization schema includes sameAs links pointing to Wikidata entries, Crunchbase profiles, G2 listings, and official social channels, AI models can cross-verify your company's existence, market category, and reputation. Without sameAs entity links, AI models treat your brand as an unverified web string, reducing recommendation confidence.`,
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

export default function B2bLandingPage() {
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
          <div style={{ display: 'inline-block', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, color: '#0D9488', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', marginBottom: '20px' }}>
            B2B &amp; SAAS · AEO AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.25rem)', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, lineHeight: 1.15, marginBottom: '18px', color: '#14171C', letterSpacing: '-0.02em' }}>
            AI Visibility for<br />
            <span style={{ color: '#0D9488' }}>B2B &amp; SaaS Companies</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#4B5563', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 36px' }}>
            Enterprise buyers are asking ChatGPT, Claude, and Perplexity to recommend vendor solutions. If your site isn't indexed by AI search bots, your competitors are capturing those high-intent leads.
          </p>

          {/* Embedded Interactive Audit Form */}
          <AuditInputBlock
            pageType="B2B"
            buttonText="Audit B2B SaaS Site Free →"
            placeholder="https://your-saas.com"
            quickPicks={['stripe.com', 'hubspot.com', 'notion.so', 'datadoghq.com']}
            accentGradient="linear-gradient(135deg, #0D9488 0%, #0284C7 100%)"
            badgeText="B2B AEO AUDIT PROBE"
          />
        </header>

        {/* ── SIGNALS GRID ────────────────────────────────────────── */}
        <section style={{ maxWidth: '920px', margin: '0 auto', padding: '20px 24px 60px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '36px', fontWeight: 600, color: '#14171C' }}>
            Why B2B Brands Lose AI Recommendations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🔒', title: 'Robots.txt Misconfiguration', body: 'Blocking OAI-SearchBot or Claude-SearchBot removes your product docs from live AI buyer recommendations.' },
              { icon: '🏢', title: 'Missing Organization Schema', body: 'Without JSON-LD Organization & SoftwareApplication schema, AI engines cannot verify your product category or capabilities.' },
              { icon: '🔗', title: 'Weak Entity Linking (sameAs)', body: 'Failing to link your brand to Crunchbase, G2, or Wikidata reduces LLM confidence when recommending your SaaS.' },
              { icon: '⚡', title: 'Doc Server Response Latency', body: 'AI fetch bots operate under strict 5-second timeouts. Slow documentation servers trigger silent crawl drop-offs.' },
              { icon: '📄', title: 'Client-Side JS Render Gaps', body: 'Product feature pages rendered via React or Vue SPA hydrations without SSR are completely blank to AI crawlers.' },
              { icon: '🗺️', title: 'No /llms.txt Index', body: 'Lacking an /llms.txt file forces AI models to parse heavy HTML, leading to truncated context and missing feature citations.' },
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
            B2B &amp; SaaS AI Visibility: Questions &amp; Answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '12px', padding: '24px', borderLeft: '4px solid #0D9488', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#14171C', lineHeight: 1.45 }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────── */}
        <section style={{ background: '#FFFFFF', border: '1px solid #DEE1E7', borderRadius: '16px', maxWidth: '800px', margin: '0 auto 80px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px', color: '#14171C' }}>
            Is Your B2B SaaS Site AI-Ready?
          </h2>
          <p style={{ color: '#4B5563', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto 28px' }}>
            Run a free 80-metric AI Visibility audit on your main domain or product documentation URL in under 60 seconds.
          </p>

          <AuditInputBlock
            pageType="B2B"
            buttonText="Free B2B SaaS Audit →"
            placeholder="https://your-saas.com"
            quickPicks={[]}
            accentGradient="linear-gradient(135deg, #0D9488 0%, #0284C7 100%)"
            badgeText="INSTANT B2B AUDIT PROBE"
          />
        </section>

        <Footer />
      </div>
    </>
  );
}
