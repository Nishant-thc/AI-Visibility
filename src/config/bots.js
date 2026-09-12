// AI Crawler & Bot Catalog - THC Ai Visibility Score (v1.0)
// Verified live September 2026 per official AI provider documentation and RFC 9309

export const BOT_TAXONOMY = {
  SEARCH_CITATION: 'Search / Citation Indexing',
  LIVE_FETCH: 'On-Demand Live User Fetch',
  TRAINING: 'Model Training Crawl',
  CONTROL_TOKEN: 'Control Token (No HTTP Log Traffic)',
  SEARCH_ENGINE: 'Traditional Web Search Engine',
  SOCIAL_PREVIEW: 'Social / Link Preview Crawlers'
};

export const ALL_AUDITED_BOTS = [
  // 1. OpenAI Bots
  {
    name: 'OAI-SearchBot',
    operator: 'OpenAI',
    role: 'Search Engine Indexing',
    taxonomyType: BOT_TAXONOMY.SEARCH_CITATION,
    category: 'citation',
    description: 'Indexes web content for SearchGPT and ChatGPT web answers. Blocking this removes the site from ChatGPT search-grounded citations.',
    criticalForVisibility: true,
    docUrl: 'https://platform.openai.com/docs/bots'
  },
  {
    name: 'ChatGPT-User',
    operator: 'OpenAI',
    role: 'On-Demand Live User Fetch',
    taxonomyType: BOT_TAXONOMY.LIVE_FETCH,
    category: 'live_fetch',
    description: 'Triggered in real-time when an end user pastes a URL or asks ChatGPT about a specific link.',
    criticalForVisibility: true,
    docUrl: 'https://platform.openai.com/docs/bots'
  },
  {
    name: 'GPTBot',
    operator: 'OpenAI',
    role: 'Model Training Crawl',
    taxonomyType: BOT_TAXONOMY.TRAINING,
    category: 'training',
    description: 'Crawls content for training future OpenAI models. Blocking does NOT stop ChatGPT from citing or browsing the page.',
    criticalForVisibility: false,
    docUrl: 'https://platform.openai.com/docs/gptbot'
  },

  // 2. Anthropic Bots
  {
    name: 'Claude-SearchBot',
    operator: 'Anthropic',
    role: 'Claude Search Retrieval',
    taxonomyType: BOT_TAXONOMY.SEARCH_CITATION,
    category: 'citation',
    description: 'Indexes web pages to power answer grounding and citation for Claude. The primary bot for Claude citation visibility.',
    criticalForVisibility: true,
    docUrl: 'https://support.anthropic.com'
  },
  {
    name: 'Claude-User',
    operator: 'Anthropic',
    role: 'On-Demand Live User Fetch',
    taxonomyType: BOT_TAXONOMY.LIVE_FETCH,
    category: 'live_fetch',
    description: 'Live fetch executed when a Claude user explicitly inputs or references a URL.',
    criticalForVisibility: true,
    docUrl: 'https://support.anthropic.com'
  },
  {
    name: 'ClaudeBot',
    operator: 'Anthropic',
    role: 'Model Training Crawl',
    taxonomyType: BOT_TAXONOMY.TRAINING,
    category: 'training',
    description: 'Gathers data for training Claude foundation models. Separate from search/user retrieval.',
    criticalForVisibility: false,
    docUrl: 'https://support.anthropic.com'
  },

  // 3. Perplexity Bots
  {
    name: 'PerplexityBot',
    operator: 'Perplexity AI',
    role: 'Search Index Crawler',
    taxonomyType: BOT_TAXONOMY.SEARCH_CITATION,
    category: 'citation',
    description: 'Builds Perplexity search index. Blocking drastically reduces citations in Perplexity answer synthesis.',
    criticalForVisibility: true,
    docUrl: 'https://docs.perplexity.ai/docs/perplexitybot'
  },
  {
    name: 'Perplexity-User',
    operator: 'Perplexity AI',
    role: 'On-Demand Live User Fetch',
    taxonomyType: BOT_TAXONOMY.LIVE_FETCH,
    category: 'live_fetch',
    description: 'Executes real-time page fetches when a Perplexity query requests an immediate page lookup.',
    criticalForVisibility: true,
    docUrl: 'https://docs.perplexity.ai/docs/perplexitybot'
  },

  // 4. Control Tokens
  {
    name: 'Google-Extended',
    operator: 'Google',
    role: 'Gemini / AI Overviews Control Token',
    taxonomyType: BOT_TAXONOMY.CONTROL_TOKEN,
    category: 'control_token',
    description: 'Control token governing whether crawled content feeds Gemini/AI Overviews training. Does NOT crawl logs or impact classic Google Search rankings.',
    criticalForVisibility: false,
    docUrl: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers'
  },
  {
    name: 'Applebot-Extended',
    operator: 'Apple',
    role: 'Apple Intelligence Control Token',
    taxonomyType: BOT_TAXONOMY.CONTROL_TOKEN,
    category: 'control_token',
    description: 'Control token governing Apple Intelligence generative training. Does NOT affect Siri/Spotlight indexing via standard Applebot.',
    criticalForVisibility: false,
    docUrl: 'https://support.apple.com/en-us/HT214101'
  },

  // 5. Training & Data Scavengers
  {
    name: 'CCBot',
    operator: 'Common Crawl',
    role: 'Open Web Archive Crawl',
    taxonomyType: BOT_TAXONOMY.TRAINING,
    category: 'training',
    description: 'Feeds the open Common Crawl web corpus used by dozens of open and commercial LLM training pipelines.',
    criticalForVisibility: false,
    docUrl: 'https://commoncrawl.org/connect/blog/ccbot'
  },
  {
    name: 'Amazonbot',
    operator: 'Amazon',
    role: 'Alexa / Bedrock Services',
    taxonomyType: BOT_TAXONOMY.TRAINING,
    category: 'training',
    description: 'Scrapes web content for Alexa and Amazon AI services.',
    criticalForVisibility: false,
    docUrl: 'https://developer.amazon.com/support/amazonbot'
  },
  {
    name: 'Bytespider',
    operator: 'ByteDance / TikTok',
    role: 'ByteDance LLM Training',
    taxonomyType: BOT_TAXONOMY.TRAINING,
    category: 'training',
    description: 'High-frequency crawler used to train Doubao / ByteDance models. High crawl volume.',
    criticalForVisibility: false,
    docUrl: 'https://www.bytedance.com'
  },

  // 6. Search Engines
  {
    name: 'Googlebot',
    operator: 'Google',
    role: 'Search & AI Overviews Indexer',
    taxonomyType: BOT_TAXONOMY.SEARCH_ENGINE,
    category: 'search_engine',
    description: 'Standard Googlebot crawling the web for Search indexing and AI Overviews.',
    criticalForVisibility: true,
    docUrl: 'https://developers.google.com/search/docs/crawling-indexing/googlebot'
  },
  {
    name: 'Bingbot',
    operator: 'Microsoft',
    role: 'Bing & Copilot Indexer',
    taxonomyType: BOT_TAXONOMY.SEARCH_ENGINE,
    category: 'search_engine',
    description: 'Indexes web pages for Microsoft Bing and Copilot grounding.',
    criticalForVisibility: true,
    docUrl: 'https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0'
  },
  {
    name: 'Applebot',
    operator: 'Apple',
    role: 'Siri & Spotlight Search Indexer',
    taxonomyType: BOT_TAXONOMY.SEARCH_ENGINE,
    category: 'search_engine',
    description: 'Indexes web content for Apple Spotlight, Safari suggestions, and Siri web search.',
    criticalForVisibility: false,
    docUrl: 'https://support.apple.com/en-us/HT204683'
  },

  // 7. Social / Link Preview Crawlers
  {
    name: 'Twitterbot',
    operator: 'X / Twitter',
    role: 'Social Card Link Preview Generator',
    taxonomyType: BOT_TAXONOMY.SOCIAL_PREVIEW,
    category: 'social_preview',
    description: 'Fetches Open Graph metadata to render rich social card previews on X / Twitter. Blocking prevents social link expansion.',
    criticalForVisibility: false,
    docUrl: 'https://developer.x.com'
  },
  {
    name: 'facebookexternalhit',
    operator: 'Meta / Facebook',
    role: 'Meta Social Link Crawler',
    taxonomyType: BOT_TAXONOMY.SOCIAL_PREVIEW,
    category: 'social_preview',
    description: 'Generates link previews across Facebook, Instagram, and WhatsApp. Blocking breaks link snippets in Meta apps.',
    criticalForVisibility: false,
    docUrl: 'https://developers.facebook.com/docs/sharing/webmasters/crawler'
  },
  {
    name: 'LinkedInBot',
    operator: 'LinkedIn / Microsoft',
    role: 'LinkedIn Post Preview Generator',
    taxonomyType: BOT_TAXONOMY.SOCIAL_PREVIEW,
    category: 'social_preview',
    description: 'Scrapes page metadata to display link cards when users share content in LinkedIn feed posts.',
    criticalForVisibility: false,
    docUrl: 'https://www.linkedin.com/help/linkedin/answer/a420916'
  }
];

// Grouped exports
export const AI_CITATION_BOTS = ALL_AUDITED_BOTS.filter(b => b.taxonomyType === BOT_TAXONOMY.SEARCH_CITATION || b.taxonomyType === BOT_TAXONOMY.LIVE_FETCH);
export const AI_TRAINING_BOTS = ALL_AUDITED_BOTS.filter(b => b.taxonomyType === BOT_TAXONOMY.TRAINING);
export const CONTROL_TOKENS = ALL_AUDITED_BOTS.filter(b => b.taxonomyType === BOT_TAXONOMY.CONTROL_TOKEN);

// Backward-compat arrays
export const ANSWER_BOTS = AI_CITATION_BOTS.map(b => b.name);
export const TRAINING_BOTS = AI_TRAINING_BOTS.map(b => b.name);
export const BOTS = ALL_AUDITED_BOTS;
