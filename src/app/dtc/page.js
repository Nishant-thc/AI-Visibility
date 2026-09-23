import Link from 'next/link';
import Footer from '../components/Footer';

export const metadata = {
  title: 'AI Visibility for DTC Brands | Will AI Assistants Recommend Your Direct-to-Consumer Products? | The Hub Content',
  description: 'DTC brands depend on direct discovery. AI assistants are now the new discovery channel — but only for brands that are crawlable, structured, and AI-readable. Run a free AI Visibility audit for your DTC brand.',
  robots: 'index, follow',
  metadataBase: new URL('https://ai-visibility.thehubcontent.com'),
  alternates: { canonical: '/dtc' },
  openGraph: {
    title: 'AI Visibility for DTC Brands | The Hub Content',
    description: 'Is your DTC brand appearing in AI product discovery? Run a free audit to find out.',
    url: 'https://ai-visibility.thehubcontent.com/dtc',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'Why do DTC brands struggle with AI visibility more than traditional retailers?',
    a: `DTC brands face a compound AI visibility challenge. First, they operate without the third-party retailer listings (Amazon, Walmart) that traditional brands rely on for AI citation surfaces. Second, DTC websites are typically built on Shopify, Headless commerce, or SPAs (Single Page Applications) that render product content entirely in JavaScript — which most AI crawlers cannot process. Third, DTC brands often have strong social media followings but thin, product-forward websites that lack the editorial depth and semantic structure AI systems need to generate confident citations.`,
  },
  {
    q: 'How can a DTC Shopify store improve its AI visibility?',
    a: `Shopify stores have a specific AI visibility profile. The most impactful improvements for DTC Shopify brands are: (1) Enable Shopify's JSON-LD output (or install a schema app) to add Product, AggregateRating, and Organization markup. (2) Ensure product descriptions are in the server-rendered HTML — avoid product detail pages that load via JavaScript after initial page render. (3) Create a dedicated "About" page with Organization schema defining your brand's mission, founding story, and product categories. (4) Add a blog or editorial section with content that answers the questions your customers ask AI assistants. (5) Configure robots.txt to explicitly allow OAI-SearchBot and PerplexityBot.`,
  },
  {
    q: 'What is the impact of AI visibility on DTC customer acquisition cost?',
    a: `AI visibility is becoming a zero-cost customer acquisition channel for DTC brands. When a consumer asks Perplexity or ChatGPT "What are the best organic protein powders?" and your brand is cited, that discovery costs nothing — unlike paid social or Google Shopping. Early DTC brands investing in AI visibility are building a compounding organic citation channel. The brands that appear in AI answers today are training user expectations about which brands are authoritative in their category. DTC brands that establish AI visibility now will benefit from increasing citation frequency as AI assistant usage grows.`,
  },
  {
    q: 'How do headless commerce and DTC technology stacks affect AI crawler access?',
    a: `Headless commerce architectures — where a React/Next.js frontend fetches product data from a headless CMS or commerce API — create significant AI visibility risks. In a headless setup, the initial HTML response is typically a minimal shell with JavaScript bundles. The actual product content (name, price, description, images) only renders after client-side JavaScript executes and API calls complete. AI crawlers that don't execute JavaScript — including many versions of PerplexityBot and OAI-SearchBot — receive empty or near-empty pages. The solution is server-side rendering (SSR) or static site generation (SSG) for all product-critical pages.`,
  },
  {
    q: 'Should DTC brands invest in AI visibility or traditional SEO first?',
    a: `For DTC brands with limited resources, AI visibility and traditional SEO are not competing priorities — they share a 70% technical foundation overlap. The structural improvements that help AI crawlers (clean HTML rendering, structured data, fast TTFB, clear semantic content) also improve traditional SEO performance. The differentiating investment for AI visibility is: (1) FAQPage schema answering customer-facing questions, (2) NLP-optimized content structure with natural question-and-answer formats, (3) Explicit AI crawler access rules in robots.txt, and (4) Brand entity schema (Organization, Manufacturer). DTC brands doing both simultaneously get compounding benefit across both channels.`,
  },
  {
    q: 'How do DTC brand subscription models affect AI citation signals?',
    a: `DTC subscription models introduce an AI visibility complication: subscription-gated content is invisible to AI crawlers. If your subscription brand gates product reviews, community content, or editorial content behind a login, AI crawlers cannot access or index this content. Additionally, if your pricing requires subscription enrollment to display, AI assistants cannot surface your pricing in comparison answers. DTC subscription brands should maintain a robust public content layer — including a public product catalog, editorial blog, and public FAQ — that serves as the AI-crawlable surface of their brand, separate from the subscriber-only content layer.`,
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

export default function DTCLandingPage() {
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
          <div style={{ display: 'inline-block', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#fbbf24', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', marginBottom: '24px' }}>
            DTC · DIRECT DISCOVERY AUDIT
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            AI Visibility for<br />
            <span style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DTC Brands</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 36px' }}>
            DTC brands built their growth on cutting out the middleman. Now AI assistants are the new discovery layer — and most DTC sites aren't built for them. Find out if yours is.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(234,179,8,0.25)' }}>
            Audit Your DTC Brand Free →
          </Link>
        </header>

        {/* ── DTC-SPECIFIC RISKS ──────────────────────────────────── */}
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.6rem', marginBottom: '40px', fontWeight: 600 }}>
            The DTC AI Visibility Stack
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🛒', title: 'Shopify / SPA Rendering', body: 'DTC stores on Shopify or headless platforms often render product data via JavaScript. AI crawlers see empty pages. SSR is required.' },
              { icon: '🤖', title: 'Explicit Bot Access', body: 'Default server configurations may block all bots. Explicitly allow OAI-SearchBot, PerplexityBot, and Claude-SearchBot in robots.txt.' },
              { icon: '📦', title: 'Product Schema Depth', body: 'Product JSON-LD with Offer, AggregateRating, and Manufacturer fields tells AI systems what you sell and validates your brand authority.' },
              { icon: '📝', title: 'Editorial Content Layer', body: 'A blog or editorial section gives AI crawlers semantic context about your brand, ingredients, materials, and use cases.' },
              { icon: '⭐', title: 'Public Review Surface', body: 'Public-facing reviews with AggregateRating schema are critical for AI inclusion in "best of" product comparison answers.' },
              { icon: '🧠', title: 'NLP-Optimized Copy', body: 'Product descriptions written in natural language with question-answer formats are more likely to be extracted and cited by LLMs.' },
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
            DTC AI Visibility: Questions &amp; Answers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderLeft: '3px solid rgba(234,179,8,0.4)', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#e8eaf0', lineHeight: 1.45 }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft, #8b8fa8)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(249,115,22,0.06) 100%)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '16px', maxWidth: '760px', margin: '0 auto 80px', padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif, Georgia)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '16px' }}>
            Is Your DTC Brand in the AI Discovery Layer?
          </h2>
          <p style={{ color: 'var(--ink-soft, #8b8fa8)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
            Run a free audit of any DTC product page, collection page, or brand homepage. See exactly where you stand on 80+ AI visibility metrics.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
            Free DTC AI Visibility Audit →
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
