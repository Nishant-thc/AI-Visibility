export const glossaryData = [
  {
    id: "ai-crawler-access",
    term: "AI Crawler Access",
    letter: "A",
    category: "Crawler Control",
    definition: "AI Crawler Access refers to the set of rules defined within a website's robots.txt file that specifically dictate whether bots associated with Artificial Intelligence (AI) models are permitted to scan, index, and scrape the site's content. Unlike traditional search engine crawlers (like Googlebot) which index pages to surface them in search results, AI crawlers (like GPTBot, ClaudeBot, or PerplexityBot) often scrape data to train Large Language Models (LLMs) or provide real-time grounded answers in generative search features (such as ChatGPT Search). Managing AI crawler access is critical because it allows site owners to protect their proprietary intellectual property from being absorbed into training datasets without their consent, while simultaneously ensuring they remain visible to real-time 'Answer Engines' that provide direct citations to users. A baseline standard is to use specific user-agent directives to block training crawlers (e.g., Disallow: / for GPTBot) but allow live-fetch bots (e.g., Allow: / for OAI-SearchBot) so that your brand still appears as a cited source when users ask AI tools direct questions.",
    importance: "Critical for IP protection and Answer Engine Optimization (AEO). If you block all AI bots, you disappear from modern search.",
    goodScore: "0 Critical Live Bots Blocked"
  },
  {
    id: "answer-engine-optimization",
    term: "Answer Engine Optimization (AEO)",
    letter: "A",
    category: "Strategy",
    definition: "Answer Engine Optimization (AEO) is the evolution of traditional Search Engine Optimization (SEO). While SEO focuses on ranking ten blue links on a Search Engine Results Page (SERP) based on keywords, AEO focuses on optimizing content so that it can be easily ingested, comprehended, and synthesized by generative AI models (like ChatGPT, Perplexity, and Google AI Overviews). Answer engines use Retrieval-Augmented Generation (RAG) to read the web in real-time, generate an answer, and cite the source. AEO requires clean HTML structures, clear semantic hierarchies, low latency, and explicit entity definitions (like schema markup) so that when the AI reads your page, it can confidently extract the exact facts and cite your domain as the authoritative source. If your site lacks AEO, AI models will hallucinate information or cite your competitors instead, leading to a massive loss in top-of-funnel brand visibility.",
    importance: "Fundamental paradigm shift in digital marketing. Without AEO, brands lose visibility in zero-click AI searches.",
    goodScore: "N/A - This is a holistic strategy"
  },
  {
    id: "content-to-code-ratio",
    term: "Content-to-Code Ratio",
    letter: "C",
    category: "Content Structure",
    definition: "The Content-to-Code Ratio is a metric that compares the volume of actual, human-readable text on a web page against the amount of HTML, CSS, and JavaScript code required to render it. In the context of AI Visibility, this is an incredibly important metric. Large Language Models (LLMs) and their associated scraping bots have finite 'context windows' (the maximum amount of text they can process at one time). If a web page is heavily bloated with thousands of lines of inline CSS, massive JavaScript payloads, and deeply nested HTML div tags, the AI scraper will waste the vast majority of its token limit simply reading the code, rather than understanding the actual content. A high content-to-code ratio ensures that the payload delivered to the RAG (Retrieval-Augmented Generation) system is dense with semantic meaning, reducing hallucination risks and ensuring the AI accurately grasps the core message of the page.",
    importance: "Prevents LLM token exhaustion. High code bloat forces AI to truncate your page before reading the most important facts.",
    goodScore: "Ratio ≥ 25%"
  },
  {
    id: "entity-linking",
    term: "Entity Linking (sameAs)",
    letter: "E",
    category: "Structured Data",
    definition: "Entity Linking is a semantic web technique executed via structured data (JSON-LD), specifically utilizing the 'sameAs' property in Schema.org vocabulary. It involves providing direct, machine-readable URLs to external, authoritative knowledge bases (such as Wikipedia, Wikidata, LinkedIn, or Crunchbase) to explicitly define who or what your brand is. For AI models, the internet is full of linguistic ambiguity. Two different companies might share the same name, or a company name might also be a common noun (e.g., 'Apple'). By embedding a 'sameAs' link to your official Wikidata entry, you provide the AI's Knowledge Graph with a unique, globally recognized identifier. This completely eliminates entity ambiguity. When an AI generates an answer about your brand, entity linking ensures it pulls facts associated with the correct entity vector, preventing cross-contamination of facts from competitors or unrelated topics with similar names.",
    importance: "The strongest defense against AI hallucinations regarding your brand identity. It mathematically proves to the AI who you are.",
    goodScore: "≥ 1 Verified Authoritative URL"
  },
  {
    id: "flesch-reading-ease",
    term: "Flesch Reading Ease",
    letter: "F",
    category: "Content Structure",
    definition: "Flesch Reading Ease is a standard readability metric that evaluates the complexity of a text based on the average number of syllables per word and the average number of words per sentence. The score generally ranges from 0 to 100, where higher scores indicate text that is easier to read. In the realm of AI Visibility and RAG (Retrieval-Augmented Generation), this metric is critical because AI models process text by breaking it into 'chunks' or 'tokens' and translating them into mathematical vectors. Highly convoluted sentences with excessive jargon and extreme length create 'noisy' vectors that are difficult for the model's attention mechanism to map accurately. A conversational, clear reading ease (typically a score between 55 and 70) aligns perfectly with the semantic chunking algorithms used by tools like ChatGPT and Perplexity. It ensures that when the AI extracts a sentence to answer a user's prompt, the sentence stands alone logically and doesn't confuse the generative output.",
    importance: "Directly impacts the accuracy of AI summaries. Overly complex text leads to poor vector embeddings and hallucinated citations.",
    goodScore: "Score ≥ 55"
  },
  {
    id: "heading-hierarchy-skips",
    term: "Heading Hierarchy Skips",
    letter: "H",
    category: "Content Structure",
    definition: "Heading Hierarchy Skips occur when a web page's HTML heading tags (H1, H2, H3, etc.) do not follow a strict, sequential logical order. For example, jumping directly from an H1 tag to an H4 tag without an intervening H2 or H3. While human readers visually scanning a page might not notice or care about this, AI scrapers and vector databases rely entirely on these tags to build a hierarchical tree of your document's meaning. When an AI system chunks your content for a RAG database, it uses headings as boundary markers to understand what a particular paragraph is about. If the hierarchy skips levels, the AI parser assumes a piece of the logical puzzle is missing, causing semantic fragmentation. The resulting vector embeddings will lack the proper contextual parent-child relationships, making it highly unlikely that the AI will confidently retrieve that section of text to answer a relevant user query.",
    importance: "Critical for RAG database indexing. Broken heading structures destroy the semantic parent-child relationship of your content.",
    goodScore: "0 Skips"
  },
  {
    id: "id-graph-node-density",
    term: "ID Graph Node Density",
    letter: "I",
    category: "Structured Data",
    definition: "ID Graph Node Density refers to the concentration of '@id' declarations within a webpage's JSON-LD structured data. In the semantic web, an '@id' acts as a unique identifier (like a digital fingerprint) for a specific entity or concept on the page (e.g., an Author, an Organization, or a Product). Instead of nesting schemas in a flat structure, high-density ID graphs link different schemas together. For example, an Article schema can state that its author is '@id': '#john-doe', and elsewhere in the JSON-LD, a Person schema defines exactly who '#john-doe' is. AI knowledge graphs (like Google's Knowledge Graph or SearchGPT's internal graphs) rely heavily on these @id references to construct multi-dimensional relationships between entities. High node density proves to the AI that your data is cleanly architected, highly relational, and easily digestible, drastically increasing the chances of your site being featured as a rich snippet or a definitive AI answer.",
    importance: "Transforms flat JSON-LD into a multi-dimensional relational database that AI models can traverse natively.",
    goodScore: "≥ 2 @id Nodes"
  },
  {
    id: "llms-txt",
    term: "LLMs.txt Protocol",
    letter: "L",
    category: "Metadata & Indexation",
    definition: "The LLMs.txt protocol is an emerging standard where webmasters place an '/llms.txt' file at the root of their domain. Similar in concept to a robots.txt or a sitemap.xml, the llms.txt file is designed exclusively for Large Language Models. It serves as a clean, Markdown-formatted directory that points AI crawlers directly to the most important, context-rich, and plain-text versions of a site's content (such as API documentation, primary guides, or knowledge bases). Because AI models consume tokens, navigating a visually complex website wastes their token limits. The llms.txt file acts as a fast-pass lane, allowing bots like ChatGPT and Claude to bypass heavy UI components and ingest pure, high-signal information. Implementing this protocol demonstrates technical maturity and drastically reduces the computational cost for AI engines to learn about your brand, guaranteeing deeper and more accurate representation in their models.",
    importance: "The ultimate optimization for Answer Engines. It provides a token-efficient, direct pipeline for AI to ingest your core knowledge.",
    goodScore: "Valid file with > 0 links"
  },
  {
    id: "native-ttfb",
    term: "Native TTFB (Time to First Byte)",
    letter: "N",
    category: "Performance",
    definition: "Time to First Byte (TTFB) is a fundamental web performance metric measuring the time it takes for a user's browser (or an AI bot) to receive the very first byte of data from the web server after making an HTTP request. In the realm of AI visibility, Native TTFB is critical due to the operational constraints of live-fetch AI bots. When a user asks a tool like ChatGPT Search or Perplexity a question, the tool's headless browser reaches out to your server in real-time. Because users expect instant answers, these AI bots are programmed with aggressively short timeout thresholds (often between 5 to 10 seconds for the entire render process). If your server is slow to respond and has a high TTFB (e.g., over 1 second), the AI bot will simply abort the connection and pull information from a faster competitor instead. Sub-800ms TTFB is the baseline requirement to ensure a reliable handshake with impatient generative AI agents.",
    importance: "The #1 cause of silent AI crawl failures. If your server doesn't respond instantly, live AI bots will abandon the fetch.",
    goodScore: "< 800ms"
  },
  {
    id: "paywall-schema",
    term: "Paywall Schema Metadata",
    letter: "P",
    category: "Metadata & Indexation",
    definition: "Paywall Schema Metadata involves using specific JSON-LD structured data properties (namely 'isAccessibleForFree': false and 'hasPart' combined with 'cssSelector') to explicitly signal to search engines and AI crawlers which portions of a page are hidden behind a subscription or paywall. Historically used by Google for 'Flexible Sampling', this metadata is now hyper-relevant for AI models. If an AI scraper hits a paywalled page without this schema, it might interpret the paywall login screen as the actual content of the page, destroying the semantic value of that URL in its index. Furthermore, advanced AI compliance bots look for this schema to ensure they do not accidentally ingest and regurgitate copyrighted, premium content, which could trigger legal liabilities. Properly implementing paywall schema allows the AI to index the free teaser content while understanding the context of the gated information.",
    importance: "Prevents AI from indexing your login screens as content and protects premium IP from unauthorized LLM ingestion.",
    goodScore: "Present if gated"
  }
];
