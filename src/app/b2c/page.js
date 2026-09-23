import Link from 'next/link';
import Footer from '../components/Footer';

export const metadata = {
  title: 'AI Visibility for B2C Businesses | Get Your Brand Into AI-Generated Consumer Answers | The Hub Content',
  description: 'Consumers are asking AI assistants for brand recommendations, product reviews, and lifestyle advice. Free AI Visibility audit for B2C businesses to ensure your brand is cited by ChatGPT, Perplexity, and Google AI Overviews.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: { canonical: '/b2c' },
  openGraph: {
    title: 'AI Visibility for B2C Businesses | The Hub Content',
    description: 'Is your B2C brand appearing in AI-generated consumer answers? Run a free audit to find out.',
    url: 'https://ai-visibility.thehubcontent.com/b2c',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'How do consumers find B2C brands through AI assistants?',
    a: `Consumers increasingly use ChatGPT, Perplexity, and Google Gemini to ask questions like "What are the best skincare brands for sensitive skin?" or "Which coffee brands are sustainably sourced?" AI assistants pull answers from indexed web content, editorial reviews, and structured brand data. B2C brands appear in these answers when they have: (1) clear brand entity definitions in JSON-LD Organization schema, (2) their products reviewed on high-authority editorial sites, (3) their own content optimized with Product and Review schema, and (4) fast, crawlable pages that AI bots can access and parse.`,
  },
  {
    q: 'What is the role of brand entity authority in B2C AI visibility?',
    a: `Brand entity authority is the degree to which AI systems recognize and trust your brand as a distinct, authoritative entity. It is built through: consistent brand name usage across your site and external citations, Organization JSON-LD schema with verified contact information and founding details, Wikipedia or Wikidata presence (for larger brands), mentions in high-authority editorial content (Forbes, industry publications), and Knowledge Graph inclusion via Google's entity indexing. Higher brand entity authority means AI systems cite your brand with greater confidence and frequency.`,
  },
  {
    q: 'Why does my B2C brand appear in Google Search but not in AI-generated answers?',
    a: `Google Search rankings and AI citation are driven by different signals. Google Search prioritizes domain authority, backlink profiles, and on-page SEO factors. AI answer engines prioritize: content clarity and extractability, structured data specificity, direct question-answer content formats, and entity disambiguation. Many B2C brands optimize for traditional SEO but neglect the AI-specific signals — their content ranks but doesn't surface in AI answers because it's too generic, not structured for AI extraction, or relies on JavaScript rendering that AI crawlers can't process.`,
  },
  {
    q: 'How important are customer reviews for B2C AI visibility?',
    a: `Customer reviews are critically important for B2C AI visibility for two reasons: (1) External review platforms (Google Reviews, Trustpilot, product review sites) are major sources AI assistants use to evaluate brand credibility and gather consumer sentiment. (2) AggregateRating schema on your own product pages provides AI systems with quantitative social proof signals they trust. Brands with high review volumes and strong ratings are significantly more likely to be cited in AI-generated "best of" and recommendation answers than brands with few or no structured review signals.`,
  },
  {
    q: 'What content formats work best for B2C brands in AI search?',
    a: `AI assistants prefer content that directly answers consumer questions in natural language. The highest-performing content formats for B2C AI visibility are: (1) "Best for" guides that explicitly match products to consumer needs (e.g., "Best for oily skin," "Best for beginners"). (2) Comparison content structured with clear category and attribute tables. (3) FAQ pages using FAQPage schema that address the exact questions consumers ask AI assistants. (4) How-to content using HowTo schema for product usage guides. (5) Ingredient, material, or specification content that provides factual extraction surfaces for AI systems.`,
  },
  {
    q: 'Does social media content help B2C AI visibility?',
    a: `Social media content itself is rarely indexed by the AI crawlers used for real-time citation. However, social signals indirectly affect AI visibility through two paths: (1) High-performing social content often generates editorial coverage and backlinks that do get indexed by AI crawlers. (2) Your social media profiles can appear in AI-generated brand identity answers, especially when querying brand names directly. Focus on creating canonical, indexable content on your website that mirrors your brand's social positioning — your site is where AI citations are actually generated from.`,
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

export default function B2CLandingPage() {
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
          <div style={{ display: 'inline-block', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#fb7185', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', marginBottom: '24px' }}>
            B2C · CONSUMER BRAND AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            AI Visibility for<br />
            <span style={{ background: 'linear-gradient(135deg, #fb7185 0%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>B2C Businesses</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 36px' }}>
            Your consumers are asking AI assistants what brands to trust, what products to buy, and what businesses to visit. Brand recommendation now happens in AI — not just search results.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #e11d48 0%, #ea580c 100%)', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(244,63,94,0.3)' }}>
            Audit Your B2C Brand Free →
          </Link>
        </header>

        {/* ── SIGNALS GRID ────────────────────────────────────────── */}
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '40px', fontWeight: 600 }}>
            What AI Assistants Need to Recommend Your Brand
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🏷️', title: 'Brand Entity Schema', body: 'Organization JSON-LD with your brand name, logo, founding date, and industry defines your entity in AI knowledge systems.' },
              { icon: '⭐', title: 'Review & Rating Signals', body: 'AggregateRating schema on product pages gives AI systems quantitative social proof to include in brand comparisons.' },
              { icon: '❓', title: 'Consumer Q&A Content', body: 'FAQPage schema answering "Is [brand] good for X?" or "What is [brand] known for?" directly feeds AI recommendation answers.' },
              { icon: '📰', title: 'Editorial Coverage', body: 'AI assistants heavily reference third-party editorial sites. Press releases, media features, and reviews increase citation probability.' },
              { icon: '🖼️', title: 'Rich Media Accessibility', body: 'Product images with descriptive alt text help AI systems with visual understanding and richer answer generation.' },
              { icon: '🔍', title: 'Semantic Content Clarity', body: 'High Flesch readability scores (60-80) and clear sentence structure make it easier for LLMs to extract and summarize brand information.' },
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
            B2C AI Visibility: Questions &amp; Answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderLeft: '3px solid rgba(244,63,94,0.4)', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#e8eaf0', lineHeight: 1.45 }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(249,115,22,0.06) 100%)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '16px', maxWidth: '760px', margin: '0 auto 80px', padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px' }}>
            Is Your B2C Brand AI-Ready?
          </h2>
          <p style={{ color: 'var(--ink-soft, #8b8fa8)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
            Run a free AI Visibility audit on your brand homepage, product page, or editorial content in under 60 seconds.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #e11d48 0%, #ea580c 100%)', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
            Free B2C AI Visibility Audit →
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
