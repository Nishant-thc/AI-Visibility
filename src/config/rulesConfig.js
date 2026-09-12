// Rules Configuration for THC Ai Visibility Score (v1.0)
// Rules verified live September 2026 per Google Search Central, RFC 9309, WCAG 2.1, and llmstxt.org

export const RULES_METADATA = {
  version: '1.0',
  lastSynced: 'September 2026',
  specAuthority: 'RFC 9309 / Google Search Central / Schema.org / WCAG 2.1',
  changelog: [
    {
      date: 'May 7, 2026',
      change: 'FAQPage rich result fully retired by Google for all sites. Search Console and Rich Results Test support removed. Schema remains valid for entity/Q&A extraction but contributes 0 points to rich result eligibility.'
    },
    {
      date: 'September 2026',
      change: 'AI Crawler Taxonomy updated: explicit distinction established between training bots, search/citation indexing bots, on-demand live fetchers, and control tokens (Google-Extended, Applebot-Extended).'
    },
    {
      date: 'March 2024',
      change: 'Interaction to Next Paint (INP) officially replaced First Input Delay (FID) as the Core Web Vitals responsiveness metric.'
    }
  ]
};

// Rich Results Rules per current Google Search Central specifications
export const RICH_RESULTS_RULES = {
  Article: {
    required: ['headline', 'image', 'datePublished', 'author'],
    recommended: ['dateModified', 'publisher', 'mainEntityOfPage', 'description'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/article'
  },
  BlogPosting: {
    required: ['headline', 'image', 'datePublished', 'author'],
    recommended: ['dateModified', 'publisher', 'mainEntityOfPage'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/article'
  },
  NewsArticle: {
    required: ['headline', 'image', 'datePublished', 'author'],
    recommended: ['dateModified', 'publisher', 'dateline'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/article'
  },
  Product: {
    required: ['name', 'image'],
    oneOfRequired: [
      { field: 'offers', label: 'Offer / price' },
      { field: 'aggregateRating', label: 'Aggregate rating' },
      { field: 'review', label: 'Customer review' }
    ],
    recommended: ['brand', 'sku', 'gtin', 'description'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/product'
  },
  FAQPage: {
    required: ['mainEntity'],
    recommended: [],
    richResultEligible: false, // Retired May 7, 2026
    deprecatedWarning: 'Rich result fully retired. Google restricted FAQ rich results in August 2023, then completely deprecated the feature effective May 7, 2026. Zero rich-result score contribution; evaluated strictly for AI Q&A entity extraction.',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage'
  },
  HowTo: {
    required: ['name', 'step'],
    recommended: ['image', 'totalTime', 'supply', 'tool'],
    richResultEligible: false, // Deprecated 2023
    deprecatedWarning: 'Rich result deprecated by Google on mobile and desktop. Valid schema for AI procedural step extraction, but contributes zero rich-result points.',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/how-to'
  },
  Organization: {
    required: ['name', 'url'],
    recommended: ['logo', 'sameAs', 'contactPoint', 'description'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/organization'
  },
  LocalBusiness: {
    required: ['name', 'address'],
    recommended: ['telephone', 'image', 'priceRange', 'openingHoursSpecification', 'geo', 'sameAs'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/local-business'
  },
  Review: {
    required: ['itemReviewed', 'reviewRating', 'author'],
    recommended: ['reviewBody', 'datePublished', 'publisher'],
    richResultEligible: true,
    deprecatedWarning: 'Ratings must not be self-authored by the business without an independent third-party review mechanism.',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/review-snippet'
  },
  BreadcrumbList: {
    required: ['itemListElement'],
    recommended: [],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb'
  },
  VideoObject: {
    required: ['name', 'description', 'thumbnailUrl', 'uploadDate'],
    recommended: ['transcript', 'contentUrl', 'embedUrl'],
    richResultEligible: true,
    deprecatedWarning: null,
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/video'
  }
};

// Full auditable rules definition table matching Section 1-7 of Rules & Validation Reference
export const RULES_CATALOG = [
  // 1. Robots.txt & AI Crawler Access
  { id: 'R-ROB-01', group: 'AI crawler access', name: 'User-agent case-insensitivity & path case-sensitivity', source: 'RFC 9309 §2.2', defaultSeverity: 'PASS' },
  { id: 'R-ROB-02', group: 'AI crawler access', name: 'Most specific matching rule wins (longest path)', source: 'RFC 9309 §2.2.2', defaultSeverity: 'PASS' },
  { id: 'R-ROB-03', group: 'AI crawler access', name: 'Empty Disallow: value treated as Allow all', source: 'RFC 9309 §2.2.2', defaultSeverity: 'PASS' },
  { id: 'R-ROB-04', group: 'AI crawler access', name: 'Path wildcards (*) and end-of-string ($) extensions', source: 'Google Search Central', defaultSeverity: 'PASS' },
  { id: 'R-ROB-05', group: 'AI crawler access', name: 'Crawl-delay non-standard directive handled as informational', source: 'Bing / RFC 9309', defaultSeverity: 'PASS' },
  { id: 'R-ROB-06', group: 'AI crawler access', name: 'Robots.txt availability (4xx/5xx fallback risk)', source: 'RFC 9309 §2.3', defaultSeverity: 'FAIL' },
  { id: 'R-ROB-TAX', group: 'AI crawler access', name: 'AI Crawler Taxonomy: Training vs Search/Citation vs Live vs Control tokens', source: 'Live AI Documentation', defaultSeverity: 'WARN' },
  { id: 'R-LLMS-01', group: 'AI crawler access', name: '/llms.txt discovery and formatting', source: 'llmstxt.org proposal', defaultSeverity: 'WARN' },
  { id: 'R-LLMS-03', group: 'AI crawler access', name: 'llms.txt quality score (maps real high-value pages)', source: 'Internal heuristic', defaultSeverity: 'PASS' },

  // 2. Sitemap Rules
  { id: 'R-SM-01', group: 'AI crawler access', name: 'Sitemap file size under 50,000 URLs and 50MB uncompressed', source: 'sitemaps.org protocol', defaultSeverity: 'FAIL' },
  { id: 'R-SM-03', group: 'AI crawler access', name: 'Fully-qualified absolute URLs in <loc> tags', source: 'sitemaps.org protocol', defaultSeverity: 'FAIL' },
  { id: 'R-SM-04', group: 'AI crawler access', name: 'Escaped special characters in sitemap URLs (&amp;)', source: 'sitemaps.org protocol', defaultSeverity: 'FAIL' },
  { id: 'R-SM-06', group: 'AI crawler access', name: 'Accurate <lastmod> (no template-wide timestamp bumps)', source: 'Google Search Central', defaultSeverity: 'WARN' },
  { id: 'R-SM-08', group: 'AI crawler access', name: 'Sitemap URLs blocked by robots.txt or returning non-200', source: 'Google Search Central', defaultSeverity: 'FAIL' },
  { id: 'R-SM-09', group: 'AI crawler access', name: 'Sitemap declared via Sitemap: line in robots.txt', source: 'Google Search Central', defaultSeverity: 'WARN' },

  // 3. Structured Data
  { id: 'R-SCH-01', group: 'Structured data', name: 'JSON-LD format preferred over Microdata/RDFa', source: 'Google Search Central', defaultSeverity: 'PASS' },
  { id: 'R-SCH-02', group: 'Structured data', name: 'Schema.org vocabulary and Google required fields', source: 'Google Search Central', defaultSeverity: 'FAIL' },
  { id: 'R-SCH-03', group: 'Structured data', name: 'Structured data matches visible rendered DOM text', source: 'Google Search Central', defaultSeverity: 'FAIL' },
  { id: 'R-SCH-04', group: 'Structured data', name: 'Organization schema entity disambiguation (sameAs)', source: 'Google Search Central', defaultSeverity: 'WARN' },
  { id: 'R-SCH-FAQ', group: 'Structured data', name: 'FAQPage rich result deprecation (May 7, 2026 rule)', source: 'Google Search Central', defaultSeverity: 'WARN' },

  // 4. Heading Structure
  { id: 'R-HEAD-01', group: 'Heading structure', name: 'Single present H1 element per page', source: 'WHATWG / WCAG 2.4.6', defaultSeverity: 'WARN' },
  { id: 'R-HEAD-02', group: 'Heading structure', name: 'Sequential heading hierarchy (no skipped levels)', source: 'WCAG 2.1 SC 1.3.1', defaultSeverity: 'WARN' },
  { id: 'R-HEAD-03', group: 'Heading structure', name: 'Headings used structurally, not purely for visual styling', source: 'WCAG 2.1 SC 1.3.1', defaultSeverity: 'FAIL' },
  { id: 'R-HEAD-04', group: 'Heading structure', name: 'Descriptive, non-generic heading text', source: 'WCAG 2.1 SC 2.4.6', defaultSeverity: 'WARN' },
  { id: 'R-HEAD-05', group: 'Heading structure', name: 'Heading outline aligns with declared schema blocks', source: 'Internal cross-reference', defaultSeverity: 'FAIL' },

  // 5. Content Structure & Extractability
  { id: 'R-EXT-01', group: 'Content structure & extractability', name: 'Text present only after JS execution under 20%', source: 'Heuristic (AI fetcher behavior)', defaultSeverity: 'WARN' },
  { id: 'R-EXT-02', group: 'Content structure & extractability', name: 'Content-to-code ratio above 10%', source: 'Heuristic (Markup efficiency)', defaultSeverity: 'WARN' },
  { id: 'R-EXT-03', group: 'Content structure & extractability', name: 'Average paragraph length under 150 words', source: 'Heuristic (LLM chunking)', defaultSeverity: 'PASS' },
  { id: 'R-EXT-04', group: 'Content structure & extractability', name: 'Data tables contain <th> headers and scope', source: 'HTML5 / WCAG SC 1.3.1', defaultSeverity: 'FAIL' },
  { id: 'R-EXT-05', group: 'Content structure & extractability', name: 'Accordion/collapsed content present in static HTML', source: 'Heuristic (Non-JS crawler)', defaultSeverity: 'WARN' },
  { id: 'R-EXT-06', group: 'Content structure & extractability', name: 'No full-viewport cookie consent overlay before main DOM', source: 'WCAG 2.4.1 / Heuristic', defaultSeverity: 'FAIL' },

  // 6. Performance
  { id: 'R-PERF-01', group: 'Performance', name: 'Core Web Vitals evaluated at 75th percentile (CrUX)', source: 'Chrome UX Report', defaultSeverity: 'PASS' },
  { id: 'R-PERF-02', group: 'Performance', name: 'Lab data explicitly labeled when CrUX field data insufficient', source: 'PageSpeed Insights API', defaultSeverity: 'PASS' },
  { id: 'R-PERF-03', group: 'Performance', name: 'Mobile and desktop scored separately', source: 'PageSpeed Insights API', defaultSeverity: 'PASS' },
  { id: 'R-PERF-04', group: 'Performance', name: 'Time to First Byte (TTFB) under 600ms', source: 'Practitioner guidance / CWV', defaultSeverity: 'WARN' },

  // 7. Metadata & Indexation
  { id: 'R-META-01', group: 'Metadata & indexation', name: 'Title tag presence and uniqueness', source: 'Google Search Central', defaultSeverity: 'WARN' },
  { id: 'R-META-02', group: 'Metadata & indexation', name: 'Title tag length (~60 chars desktop truncate proxy)', source: 'Google Search Central', defaultSeverity: 'WARN' },
  { id: 'R-META-03', group: 'Metadata & indexation', name: 'Meta description presence and uniqueness', source: 'Google Search Central', defaultSeverity: 'WARN' },
  { id: 'R-META-04', group: 'Metadata & indexation', name: 'Meta description length (150-160 soft target)', source: 'Google Search Central', defaultSeverity: 'PASS' },
  { id: 'R-META-05', group: 'Metadata & indexation', name: 'Conflicting robots directives (noindex vs sitemap)', source: 'Google Search Central', defaultSeverity: 'FAIL' },
  { id: 'R-META-06', group: 'Metadata & indexation', name: 'Valid robots meta directive values', source: 'Google Search Central', defaultSeverity: 'PASS' },
  { id: 'R-META-07', group: 'Metadata & indexation', name: 'Self-referencing absolute canonical tag', source: 'Google Search Central', defaultSeverity: 'FAIL' },
  { id: 'R-META-08', group: 'Metadata & indexation', name: 'Canonical protocol/www consistency', source: 'Google Search Central', defaultSeverity: 'WARN' },
  { id: 'R-META-09', group: 'Metadata & indexation', name: 'Hreflang reciprocal return tags', source: 'Google Search Central', defaultSeverity: 'WARN' }
];

export const AUTHORITATIVE_ENTITY_SOURCES = [
  'wikipedia.org',
  'wikidata.org',
  'linkedin.com',
  'crunchbase.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',
  'github.com'
];
