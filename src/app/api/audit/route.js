import { checkRobotsTxt } from '@/lib/checkRobotsTxt';
import { checkLlmsTxt } from '@/lib/checkLlmsTxt';
import { checkSitemap } from '@/lib/checkSitemap';
import { checkHtml } from '@/lib/checkHtml';
import { checkPageSpeed } from '@/lib/checkPageSpeed';
import { checkAgenticBrowsing } from '@/lib/checkAgenticBrowsing';
import { checkSemantics } from '@/lib/checkSemantics';
import { calculateScores } from '@/utils/scoring';
import { RULES_CATALOG } from '@/config/rulesConfig';
import { logScan } from '@/lib/tracker';
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  const data = rateLimitMap.get(ip);
  if (now - data.firstRequest > 60000) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (data.count >= 3) {
    return false;
  }
  data.count++;
  return true;
}

function isPrivateIp(hostname) {
  if (hostname === 'localhost') return true;
  const parts = hostname.split('.');
  if (parts.length !== 4) return false;
  if (parts[0] === '127' || parts[0] === '10') return true;
  if (parts[0] === '192' && parts[1] === '168') return true;
  if (parts[0] === '172') {
    const p2 = parseInt(parts[1], 10);
    if (p2 >= 16 && p2 <= 31) return true;
  }
  return false;
}

function categorizeError(error) {
  const msg = error.message ? error.message.toLowerCase() : '';
  
  if (msg.includes('timeout') || msg.includes('abort') || msg.includes('aborted')) {
    return { category: '[TIMEOUT]', userMessage: 'The audit took too long. The website might be slow to respond or has a massive sitemap. Try scanning an Exact URL instead.' };
  }
  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('econnrefused') || msg.includes('enotfound')) {
    return { category: '[NETWORK_ERROR]', userMessage: 'We couldn\'t reach the website. Please check if the URL is correct and the site is online.' };
  }
  if (msg.includes('403') || msg.includes('forbidden') || msg.includes('access denied')) {
    return { category: '[ACCESS_DENIED]', userMessage: 'We were blocked from scanning this website. The site likely has strict bot-protection (like Cloudflare) enabled.' };
  }
  if (msg.includes('parse') || msg.includes('json') || msg.includes('invalid html')) {
    return { category: '[PARSE_ERROR]', userMessage: 'We successfully fetched the page, but the data was malformed or couldn\'t be analyzed.' };
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return { category: '[RATE_LIMIT]', userMessage: 'Too many requests. Please wait a minute before trying again.' };
  }
  if (msg.includes('invalid url') || msg.includes('private network')) {
    return { category: '[INVALID_URL]', userMessage: 'The URL provided is invalid or unsupported.' };
  }
  
  return { category: '[INTERNAL_ERROR]', userMessage: 'An unexpected error occurred during the audit. Please try again later.' };
}

function normalizeInputUrl(rawUrl) {
  if (!rawUrl) return null;
  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }
  const urlObj = new URL(trimmed);
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS protocols are allowed.');
  }
  if (isPrivateIp(urlObj.hostname)) {
    throw new Error('Private network addresses are not allowed.');
  }
  return urlObj;
}

async function auditSingleUrl(rawUrl, options = {}) {
  const { customUserAgent, jsRenderMode } = options;

  let targetUrl;
  try {
    targetUrl = normalizeInputUrl(rawUrl);
  } catch (e) {
    throw new Error(`Invalid URL format: ${rawUrl}`);
  }

  const cleanUrl = targetUrl.href;
  const domain = targetUrl.origin;

  // Parallel fetches for core sources
  const [robotsData, llmsData, htmlData, pageSpeedData] = await Promise.all([
    checkRobotsTxt(domain, customUserAgent),
    checkLlmsTxt(domain),
    checkHtml(cleanUrl, customUserAgent),
    checkPageSpeed(cleanUrl)
  ]);

  // Semantic checks via free local NLP
  const semanticsData = checkSemantics(htmlData.extractedBodySnippet || '');
  htmlData.semantics = semanticsData;

  // Sitemap check (uses declared sitemap from robots if present)
  const sitemapData = await checkSitemap(domain, robotsData.sitemapUrl, cleanUrl, robotsData);

  // Agentic Browsing Score — computed from already-fetched module outputs (no extra HTTP calls)
  const agenticData = checkAgenticBrowsing(pageSpeedData, htmlData, robotsData);

  // Compute 5-category scoring, conflicts, and overall THC Ai Visibility Score
  const scoringResult = calculateScores({
    robotsData,
    sitemapData,
    llmsData,
    htmlData,
    pageSpeedData,
    targetUrl: cleanUrl
  });

  // Category details array for editorial bars
  const categoryDetails = [
    { key: 'aiCrawlerAccess', name: 'AI crawler access', score: scoringResult.categoryScores.aiCrawlerAccess, weight: 25 },
    { key: 'structuredData', name: 'Structured data', score: scoringResult.categoryScores.structuredData, weight: 25 },
    { key: 'contentExtractability', name: 'Content structure', score: scoringResult.categoryScores.contentExtractability, weight: 20 },
    { key: 'technicalPerformance', name: 'Performance', score: scoringResult.categoryScores.performance || 70, weight: 15 },
    { key: 'metadataHygiene', name: 'Metadata & indexation', score: scoringResult.categoryScores.metadataHygiene, weight: 15 }
  ];

  // Critical conflicts mapped
  const criticalConflicts = scoringResult.conflicts.map(c => ({
    title: c.title,
    impact: c.severity === 'CRITICAL' ? 'High' : 'Medium',
    evidence: c.evidence,
    standard: 'RFC 9309 / W3C',
    botsAffected: c.affected,
    fix: c.fix
  }));

  // Recommendations roadmap (combines AI Crawler Access, Agentic Browsing, Structured Data, Performance, Content Structure & Metadata)
  const recommendations = [];

  // 1. AI Crawler Access: Answer Bots Blocked
  if (robotsData.isAnswerBotBlocked) {
    const blockedNames = (robotsData.blockedRetrievalBots || []).map(b => b.name).join(', ') || 'AI Citation Bots';
    recommendations.push({
      priority: 'P0',
      title: `Unblock AI Answer Engine Bots (${blockedNames})`,
      category: 'AI Crawler Access',
      impact: 'High',
      effort: 'Low',
      rule: 'RFC 9309 Allow Directives',
      affected: 'ChatGPT, Perplexity, Claude, Bing Copilot',
      quadrant: 'quickWins',
      fix: 'Remove Disallow: / for live retrieval bots in robots.txt.'
    });
  }

  // 2. AI Crawler Access: Training Bots Blocked
  if (robotsData.blockedTrainingBots && robotsData.blockedTrainingBots.length > 0) {
    const trainingNames = robotsData.blockedTrainingBots.map(b => b.name).join(', ');
    recommendations.push({
      priority: 'P1',
      title: `Evaluate Model Training Crawler Policy (${trainingNames})`,
      category: 'AI Crawler Access',
      impact: 'Medium',
      effort: 'Low',
      rule: 'Model Training Ingestion',
      affected: 'GPTBot, ClaudeBot, CCBot',
      quadrant: 'quickWins',
      fix: 'Allow training crawlers if you wish for foundational AI models to include your site in training corpora.'
    });
  }

  // 3. AI Crawler Access: Missing llms.txt
  if (!llmsData.found && !llmsData.exists) {
    recommendations.push({
      priority: 'P1',
      title: 'Deploy /llms.txt Machine-Readable Site Map',
      category: 'AI Crawler Access',
      impact: 'Medium',
      effort: 'Low',
      rule: 'llmstxt.org Specification',
      affected: 'Perplexity, Cursor, LLM context windows',
      quadrant: 'quickWins',
      fix: 'Create /llms.txt with H1 title, summary blockquote, and markdown links to key site documentation.'
    });
  } else if (llmsData.isStub) {
    recommendations.push({
      priority: 'P2',
      title: 'Expand /llms.txt File (Currently a Minimal Stub)',
      category: 'AI Crawler Access',
      impact: 'Low',
      effort: 'Low',
      rule: 'llmstxt.org Specification',
      affected: 'LLM context windows',
      quadrant: 'lowPriority',
      fix: 'Add section headings and markdown links for your core product categories and documentation.'
    });
  }

  // 4. Structured Data: Zero Schema or High Errors
  if (!htmlData.structuredData?.schemaTypes || htmlData.structuredData.schemaTypes.length === 0) {
    recommendations.push({
      priority: 'P0',
      title: 'Implement JSON-LD Schema (Organization, WebSite, Article)',
      category: 'Structured Data',
      impact: 'High',
      effort: 'Medium',
      rule: 'Schema.org & Google Rich Results',
      affected: 'All AI systems & Google SGE',
      quadrant: 'majorProjects',
      fix: 'Add Organization and WebSite JSON-LD scripts to your page template.'
    });
  } else if (htmlData.structuredData?.score < 65) {
    recommendations.push({
      priority: 'P1',
      title: 'Fix Required Field Errors in JSON-LD Schema',
      category: 'Structured Data',
      impact: 'High',
      effort: 'Medium',
      rule: 'Schema.org Specification',
      affected: 'Google Rich Results & Entity extraction',
      quadrant: 'quickWins',
      fix: 'Review Rich Results tab and supply missing required fields (image, headline, author, offers).'
    });
  }

  // 5. Structured Data: Missing sameAs Entity Links
  if (htmlData.structuredData?.schemaTypes?.length > 0 && htmlData.structuredData?.entityLinking?.count === 0) {
    recommendations.push({
      priority: 'P1',
      title: 'Add sameAs Entity Links to Organization Schema',
      category: 'Structured Data',
      impact: 'Medium',
      effort: 'Low',
      rule: 'Entity Disambiguation',
      affected: 'Knowledge Graph linking',
      quadrant: 'quickWins',
      fix: 'Include sameAs array in Organization JSON-LD linking to Wikipedia, Wikidata, Crunchbase, or LinkedIn.'
    });
  }

  // 6. Agentic Browsing: High TTFB
  const nativeTtfb = pageSpeedData?.nativeTiming?.ttfbMs || pageSpeedData?.mobile?.serverResponseTime?.numericValue;
  if (nativeTtfb != null && nativeTtfb > 600) {
    recommendations.push({
      priority: nativeTtfb > 1200 ? 'P0' : 'P1',
      title: `Reduce Server Response Latency (TTFB ${nativeTtfb}ms)`,
      category: 'Agentic Browsing',
      impact: 'High',
      effort: 'High',
      rule: 'Agentic Timeout Resilience (<400ms)',
      affected: 'Autonomous AI Browsing Agents',
      quadrant: 'majorProjects',
      fix: 'Enable CDN caching, optimize database queries, or use edge rendering.'
    });
  }

  // 7. Agentic Browsing: Semantic HTML Landmarks (<main> / <article>)
  if (!htmlData.browserSignals?.semanticLandmarks?.hasMain) {
    recommendations.push({
      priority: 'P1',
      title: 'Wrap Main Content in HTML5 <main> and <article> Tags',
      category: 'Content Structure',
      impact: 'Medium',
      effort: 'Low',
      rule: 'W3C HTML5 Semantic Landmarks',
      affected: 'DOM extractors & readability parsers',
      quadrant: 'quickWins',
      fix: 'Add <main> tag around primary body content to help AI parsers isolate article text from chrome/nav.'
    });
  }

  // 8. Content Structure: Heading Hierarchy Skips
  if (htmlData.headings?.hasSkippedLevels) {
    recommendations.push({
      priority: 'P1',
      title: 'Fix Skipped Heading Levels in DOM Hierarchy (e.g. H1 → H3)',
      category: 'Content Structure',
      impact: 'Medium',
      effort: 'Low',
      rule: 'W3C Heading Hierarchy',
      affected: 'RAG Chunking & Outline generators',
      quadrant: 'quickWins',
      fix: `Ensure headings follow sequential H1 -> H2 -> H3 nesting. Skips: ${(htmlData.headings.skips || []).join(', ')}`
    });
  }

  // 9. Agentic Browsing: Low Content-to-Code Ratio
  if (htmlData.browserSignals?.contentToCodeRatio != null && htmlData.browserSignals.contentToCodeRatio < 12) {
    recommendations.push({
      priority: 'P2',
      title: `Improve Low Content-to-Code Ratio (${htmlData.browserSignals.contentToCodeRatio}%)`,
      category: 'Agentic Browsing',
      impact: 'Low',
      effort: 'Medium',
      rule: 'Markup Token Efficiency (≥15%)',
      affected: 'LLM token processing efficiency',
      quadrant: 'lowPriority',
      fix: 'Reduce inline CSS, nested boilerplate divs, and tracking scripts to make raw HTML more text-dense.'
    });
  }

  // 10. Content Structure: Monolithic Paragraphs
  const avgParaWords = htmlData.browserSignals?.paragraphs?.avgWords;
  const paragraphRule = RULES_CATALOG.find(r => r.id === 'R-EXT-03');
  const isParaRuleApplicable = paragraphRule?.isApplicable 
    ? paragraphRule.isApplicable(htmlData.structuredData?.schemaTypes || []) 
    : true;
    
  if (isParaRuleApplicable && avgParaWords != null && avgParaWords > 120) {
    recommendations.push({
      priority: 'P2',
      title: `Break Down Long Paragraphs (Avg ${avgParaWords} words)`,
      category: 'Content Structure',
      impact: 'Low',
      effort: 'Low',
      rule: 'RAG Chunking Window Optimization (<100 words)',
      affected: 'RAG retrieval chunk precision',
      quadrant: 'lowPriority',
      fix: 'Break long text blocks into smaller paragraphs (30-80 words) for higher vector embedding similarity.'
    });
  }

  // 11. Metadata: Missing Canonical or Description
  if (!htmlData.meta?.canonicalUrl) {
    recommendations.push({
      priority: 'P1',
      title: 'Add Self-Referencing Canonical Link Tag',
      category: 'Metadata & Indexation',
      impact: 'Medium',
      effort: 'Low',
      rule: 'Google Search Central',
      affected: 'All pages',
      quadrant: 'quickWins',
      fix: 'Add <link rel="canonical" href="..."> pointing to authoritative HTTPS URL.'
    });
  }
  if (!htmlData.meta?.description) {
    recommendations.push({
      priority: 'P1',
      title: 'Supply Meta Description Tag (70-160 chars)',
      category: 'Metadata & Indexation',
      impact: 'Medium',
      effort: 'Low',
      rule: 'Snippet Generation',
      affected: 'AI Overviews & Search Snippets',
      quadrant: 'quickWins',
      fix: 'Add concise meta description summarizing the entity topic.'
    });
  }

  const quadrantData = {
    quickWins: recommendations.filter(r => r.quadrant === 'quickWins'),
    majorProjects: recommendations.filter(r => r.quadrant === 'majorProjects'),
    lowPriority: recommendations.filter(r => r.quadrant === 'lowPriority'),
    reconsider: recommendations.filter(r => r.quadrant === 'reconsider')
  };

  return {
    success: true,
    url: cleanUrl,
    domain,
    resolvedUrl: htmlData.finalResolvedUrl || cleanUrl,
    scannedAt: new Date().toISOString(),
    finalScore: scoringResult.finalScore,
    grade: scoringResult.grade,
    gradeMeaning: scoringResult.gradeMeaning,
    verdict: scoringResult.description,
    isAnswerBotBlocked: scoringResult.isAnswerBotBlocked,
    categoryScores: scoringResult.categoryScores,
    categoryDetails,
    criticalConflicts,
    recommendations,
    quadrantData,
    checklistSummary: scoringResult.checklistSummary,
    checklistGroups: scoringResult.checklistGroups,
    conflicts: scoringResult.conflicts,
    extractabilityIssues: scoringResult.extractabilityIssues,
    metadataIssues: scoringResult.metadataIssues,
    signals: {
      robots: robotsData,
      sitemap: sitemapData,
      llmsTxt: llmsData,
      html: htmlData,
      pageSpeed: pageSpeedData,
      agenticBrowsing: agenticData
    },
    meta: htmlData.meta,
    httpHeaders: htmlData.httpHeaders,
    readability: htmlData.readability,
    sourceFiles: {
      robotsTxt: `${domain}/robots.txt`,
      sitemap: sitemapData.sitemapUrlChecked || `${domain}/sitemap.xml`,
      llmsTxt: llmsData.fetchedUrl || `${domain}/llms.txt`,
      pageSpeed: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(cleanUrl)}`
    },
    jsRenderModeActive: !!jsRenderMode
  };
}

export async function POST(request) {
  const startTime = Date.now();
  let body;
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
      console.warn(`[Audit] Rate limit exceeded for IP: ${ip}`);
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }), { status: 429 });
    }

    body = await request.json();
    const { url, mode = 'single', competitors = [], sampleSize = 5, customUserAgent, jsRenderMode } = body;

    if (!url && (!competitors || competitors.length === 0)) {
      return new Response(JSON.stringify({ error: 'Target URL is required' }), { status: 400 });
    }

    // COMPETITOR COMPARISON MODE
    if (mode === 'compare') {
      const allTargets = [url, ...competitors].filter(Boolean).map(u => u.trim()).filter(Boolean);
      if (allTargets.length < 2) {
        return new Response(JSON.stringify({ error: 'At least 2 domains are required for competitor comparison.' }), { status: 400 });
      }

      const results = await Promise.allSettled(
        allTargets.map(u => auditSingleUrl(u, { customUserAgent, jsRenderMode }))
      );

      const competitorResults = results.map((r, i) => {
        if (r.status === 'fulfilled') {
          return r.value;
        }
        return {
          url: allTargets[i],
          domain: allTargets[i],
          finalScore: 0,
          grade: 'F',
          gradeMeaning: 'Audit Failed',
          verdict: r.reason?.message || 'Could not fetch domain',
          categoryScores: {
            aiCrawlerAccess: 0,
            structuredData: 0,
            contentExtractability: 0,
            technicalPerformance: 0,
            metadataHygiene: 0
          },
          signals: {
            robots: { botMatrix: [] },
            sitemap: {},
            llmsTxt: {},
            html: { structuredData: {}, headings: {} },
            pageSpeed: {}
          },
          conflicts: [],
          error: r.reason?.message || 'Audit failed'
        };
      });

      return new Response(JSON.stringify({
        mode: 'compare',
        primaryDomain: competitorResults[0]?.domain || allTargets[0],
        competitors: competitorResults,
        scannedAt: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // SINGLE OR FULL-SITE MODE
    const primaryResult = await auditSingleUrl(url, { customUserAgent, jsRenderMode });

    // FULL-SITE MODE: Sample sub-pages from sitemap
    if (mode === 'sitemap' && primaryResult.signals.sitemap?.sampleUrls?.length > 0) {
      const samplesToScan = primaryResult.signals.sitemap.sampleUrls
        .filter(u => u !== primaryResult.url)
        .slice(0, Math.min(Number(sampleSize) || 4, 8));

      if (samplesToScan.length > 0) {
        const subPageAudits = await Promise.allSettled(
          samplesToScan.map(sampleUrl => auditSingleUrl(sampleUrl, { customUserAgent, jsRenderMode }))
        );

        primaryResult.sampledPages = subPageAudits
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Audit Complete] URL: ${primaryResult.url} | Score: ${primaryResult.finalScore} | Duration: ${duration}ms | IP: ${ip}`);

    // Dynamic classification helper for Google Sheets tagging
    const derivedPageType = body.pageType || (() => {
      try {
        const u = new URL(primaryResult.url);
        const p = u.pathname.toLowerCase();
        if (p === '/' || p === '' || p === '/index.html') return 'Homepage';
        if (p.includes('/category/') || p.includes('/collections/') || p.includes('/shop/') || p.includes('/c/')) return 'Category';
        if (p.includes('/blog/') || p.includes('/blogs/') || p.includes('/news/') || p.includes('/article/') || p.includes('/post/') || p.includes('/resources/')) return 'Article';
        if (p.includes('/p/') || p.includes('/product/') || p.includes('/products/') || p.includes('/item/')) return 'Product';
        if (p.includes('/service/') || p.includes('/services/') || p.includes('/solution/') || p.includes('/solutions/')) return 'Service';
        return 'Landing Page';
      } catch(e) {
        return 'Homepage';
      }
    })();

    // Await logging to ensure Vercel serverless doesn't terminate before webhook POST finishes
    try {
       await logScan({
         domain: primaryResult.domain,
         url: primaryResult.url,
         scanMode: mode,
         pageType: derivedPageType,
         success: true,
         score: primaryResult.finalScore,
         grade: primaryResult.grade,
         durationMs: duration
       });
    } catch(e) {}

    return new Response(JSON.stringify(primaryResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const categorized = categorizeError(error);
    const finalErrorMsg = `${categorized.category} ${categorized.userMessage}`;

    console.error(`THC AI Visibility Audit Error: ${finalErrorMsg} (Raw: ${error.message})`);
    try {
       // Log failure
       if (body?.url) {
         const failedUrlObj = parseUrl(body.url);
         await logScan({
           domain: failedUrlObj?.hostname || 'unknown',
           url: body.url,
           scanMode: body.mode || 'exact',
           success: false,
           errorMsg: finalErrorMsg
         });
       }
    } catch(e) {}
    
    return new Response(
      JSON.stringify({ error: categorized.userMessage, category: categorized.category }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
