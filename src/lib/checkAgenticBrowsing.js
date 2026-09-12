/**
 * checkAgenticBrowsing.js
 * ─────────────────────────────────────────────────────────────────────────────
 * THC Ai Visibility Score — Agentic Browsing Module (v1.0)
 *
 * Computes a standalone "Agentic Browsing Score" (0–100) that measures how
 * accessible a page is to autonomous AI agents (ChatGPT Browsing, Perplexity
 * Live, Claude Computer Use, Bing Copilot, etc.).
 *
 * Score composition:
 *   — 40 pts  PSI-derived signals (TTFB, TTI, TBT, DOM size, JS dependency)
 *   — 30 pts  Content extractability signals (from checkHtml)
 *   — 20 pts  Crawler access signals (from checkRobotsTxt)
 *   — 10 pts  Structured data richness (from checkHtml structuredData)
 *
 * Called AFTER checkPageSpeed so it can consume the already-fetched PSI data.
 */

/**
 * Agentic-specific thresholds — stricter than standard web perf
 * because agents have shorter patience and simpler parsers.
 */
const THRESHOLDS = {
  // Server Response (TTFB) — agents time out faster than browsers
  ttfb: { good: 400, warn: 800, poor: 1500 },
  // Time to Interactive — agent waits for TTI before reading
  tti: { good: 3000, warn: 5000, poor: 8000 },
  // Total Blocking Time — blocked main thread = agent read failure
  tbt: { good: 150, warn: 350, poor: 700 },
  // DOM Size — huge DOMs confuse agentic HTML parsers
  domSize: { good: 800, warn: 1500, poor: 3000 },
  // Content-to-code ratio — agents prefer text-dense pages
  contentRatio: { good: 20, warn: 12, poor: 5 },
};

/**
 * Returns a 0–100 sub-score and verdict for a single metric value
 * given thresholds in the "lower is better" direction.
 */
function scoreMetric(value, thresholds, higherIsBetter = false) {
  if (value == null) return { score: null, verdict: 'unknown' };
  const { good, warn, poor } = thresholds;
  let score, verdict;
  if (higherIsBetter) {
    if (value >= good) { score = 100; verdict = 'good'; }
    else if (value >= warn) { score = 60; verdict = 'needs-work'; }
    else if (value >= poor) { score = 30; verdict = 'poor'; }
    else { score = 0; verdict = 'critical'; }
  } else {
    if (value <= good) { score = 100; verdict = 'good'; }
    else if (value <= warn) { score = 70; verdict = 'needs-work'; }
    else if (value <= poor) { score = 35; verdict = 'poor'; }
    else { score = 0; verdict = 'critical'; }
  }
  return { score, verdict };
}

/**
 * Extracts agentic signals from already-computed module outputs.
 * Returns a fully self-contained agenticBrowsing result object.
 *
 * @param {object} pageSpeedData  — Output of checkPageSpeed()
 * @param {object} htmlData       — Output of checkHtml()
 * @param {object} robotsData     — Output of checkRobotsTxt()
 */
export function checkAgenticBrowsing(pageSpeedData, htmlData, robotsData) {
  const timestamp = new Date().toISOString();

  // ─── Section 1: PSI-derived signals (40 pts) ────────────────────────────
  // Prefer mobile data (primary Google index, same env agents use)
  const cwv = pageSpeedData?.mobile?.cwv || {};
  const nativeTiming = pageSpeedData?.nativeTiming || {};
  const mobileOpps = pageSpeedData?.mobile?.opportunities || [];
  const mobileDiags = pageSpeedData?.mobile?.diagnostics || [];

  // TTFB: use PSI's server-response-time if available, else native timing
  const ttfbMs = pageSpeedData?.mobile?.serverResponseTime?.numericValue
    ?? nativeTiming?.ttfbMs
    ?? null;

  const ttfbSignal = scoreMetric(ttfbMs, THRESHOLDS.ttfb);
  const ttiSignal = scoreMetric(cwv.ttiMs, THRESHOLDS.tti);
  const tbtSignal = scoreMetric(cwv.tbtMs, THRESHOLDS.tbt);

  // DOM size from diagnostics
  const domDiag = mobileDiags.find(d => d.id === 'dom-size');
  const domSizeNodes = domDiag?.displayValue
    ? parseInt(domDiag.displayValue.replace(/[^0-9]/g, ''), 10) || null
    : null;
  const domSizeSignal = scoreMetric(domSizeNodes, THRESHOLDS.domSize);

  // JS render dependency — check if there are heavy unused JS opportunities
  const unusedJsOpp = mobileOpps.find(o => o.id === 'unused-javascript');
  const jsHeavy = unusedJsOpp?.savingsMs != null && unusedJsOpp.savingsMs > 500;

  // Weighted PSI sub-score (40 pts total)
  const psiScores = [ttfbSignal, ttiSignal, tbtSignal, domSizeSignal].filter(s => s.score !== null);
  const psiAvg = psiScores.length > 0
    ? psiScores.reduce((acc, s) => acc + s.score, 0) / psiScores.length
    : 75; // fallback if no PSI data
  const psiSubScore = Math.round((psiAvg / 100) * 40);

  // ─── Section 2: Content extractability (30 pts) ──────────────────────────
  const browserSignals = htmlData?.browserSignals || {};
  const headings = htmlData?.headings || {};

  const contentRatio = browserSignals?.contentToCodeRatio ?? null;
  const contentRatioSignal = scoreMetric(contentRatio, THRESHOLDS.contentRatio, true);

  const hasSemanticLandmarks = browserSignals?.semanticLandmarks?.hasMain === true;
  const hasCleanHeadings = !headings?.hasSkippedLevels;
  const hasFaq = (htmlData?.structuredData?.schemaTypes || []).includes('FAQPage');
  const avgParaWords = browserSignals?.paragraphs?.avgWords ?? browserSignals?.avgParagraphWords ?? null;
  const goodParagraphs = avgParaWords != null && avgParaWords >= 30 && avgParaWords <= 100;

  // 30 pts split: 12 content-ratio + 8 semantic + 5 headings + 5 paragraphs
  let extractSubScore = 0;
  extractSubScore += Math.round((contentRatioSignal.score ?? 50) / 100 * 12);
  extractSubScore += hasSemanticLandmarks ? 8 : 2;
  extractSubScore += hasCleanHeadings ? 5 : 0;
  extractSubScore += goodParagraphs ? 5 : 2;

  // ─── Section 3: Crawler access (20 pts) ─────────────────────────────────
  const botMatrix = robotsData?.botMatrix || [];
  const liveAgentBots = botMatrix.filter(b =>
    b.category === 'live_fetch' || b.criticalForVisibility
  );
  const allowedCount = liveAgentBots.filter(b => b.status === 'ALLOW' || b.status === 'PARTIAL').length;
  const crawlerSubScore = liveAgentBots.length > 0
    ? Math.round((allowedCount / liveAgentBots.length) * 20)
    : 15;

  // ─── Section 4: Structured data richness (10 pts) ────────────────────────
  const schemaTypes = htmlData?.structuredData?.schemaTypes || [];
  const hasAnySchema = schemaTypes.length > 0;
  const hasOrgSchema = schemaTypes.some(t => t.toLowerCase().includes('organization'));
  const hasFaqSchema = schemaTypes.some(t => t.toLowerCase().includes('faqpage'));
  const hasBreadcrumb = schemaTypes.some(t => t.toLowerCase().includes('breadcrumb'));
  let schemaSubScore = 0;
  if (hasAnySchema) schemaSubScore += 4;
  if (hasOrgSchema) schemaSubScore += 3;
  if (hasFaqSchema || hasBreadcrumb) schemaSubScore += 3;

  // ─── Final score ─────────────────────────────────────────────────────────
  const totalScore = Math.min(100, psiSubScore + extractSubScore + crawlerSubScore + schemaSubScore);

  let grade, verdict, description;
  if (totalScore >= 80) { grade = 'A'; verdict = 'Agent-Ready'; description = 'This page is well-optimized for autonomous AI agent browsing. Agents can reach, parse, and extract content efficiently.'; }
  else if (totalScore >= 65) { grade = 'B'; verdict = 'Mostly Ready'; description = 'Agents can browse this page but may encounter friction. Addressing flagged issues will improve AI answer quality.'; }
  else if (totalScore >= 50) { grade = 'C'; verdict = 'Moderate Friction'; description = 'Agents can load the page but content extraction is unreliable. JS dependency, slow TTFB, or thin semantic structure reduce AI comprehension.'; }
  else if (totalScore >= 35) { grade = 'D'; verdict = 'High Friction'; description = 'Significant barriers prevent agents from reliably reading this page. Prioritize TTFB reduction and content structure.'; }
  else { grade = 'F'; verdict = 'Agent-Hostile'; description = 'This page fails most agentic browsing checks. Agents will either time out, receive empty content, or be blocked entirely.'; }

  // ─── Opportunities ──────────────────────────────────────────────────────
  const opportunities = [];

  if (ttfbMs != null && ttfbMs > THRESHOLDS.ttfb.warn) {
    opportunities.push({
      priority: ttfbMs > THRESHOLDS.ttfb.poor ? 'P0' : 'P1',
      signal: 'Server Response Time (TTFB)',
      measured: `${ttfbMs}ms`,
      target: '< 400ms',
      impact: 'Agents time out or back off on slow servers. This is the #1 reason agents fail to read a page.',
      fix: 'Enable server-side caching, use a CDN, or optimize database queries. Target < 400ms for agent reliability.',
      effort: 'High'
    });
  }

  if (cwv.ttiMs != null && cwv.ttiMs > THRESHOLDS.tti.warn) {
    opportunities.push({
      priority: 'P1',
      signal: 'Time to Interactive (TTI)',
      measured: cwv.tti || `${cwv.ttiMs}ms`,
      target: '< 3.0s',
      impact: 'Agentic browsers wait for TTI before reading DOM content. High TTI means agents read a half-loaded page.',
      fix: 'Reduce JavaScript execution time and defer non-critical scripts.',
      effort: 'Medium'
    });
  }

  if (cwv.tbtMs != null && cwv.tbtMs > THRESHOLDS.tbt.warn) {
    opportunities.push({
      priority: 'P1',
      signal: 'Total Blocking Time (TBT)',
      measured: cwv.tbt || `${cwv.tbtMs}ms`,
      target: '< 150ms',
      impact: 'Long tasks block the main thread. Agents running in browser environments fail to trigger click/scroll actions needed to reveal content.',
      fix: 'Break up long JavaScript tasks. Use web workers for non-UI work.',
      effort: 'Medium'
    });
  }

  if (!hasSemanticLandmarks) {
    opportunities.push({
      priority: 'P1',
      signal: 'Missing Semantic HTML Landmarks',
      measured: 'No <main> or <article> detected',
      target: '<main> + <article> present',
      impact: 'Agentic parsers use semantic landmarks to identify the primary content area. Without them, agents read sidebars, navbars, and footers as main content.',
      fix: 'Wrap your primary content in <main> and <article> tags. Add <nav> and <aside> for structural clarity.',
      effort: 'Low'
    });
  }

  if (!hasCleanHeadings) {
    opportunities.push({
      priority: 'P1',
      signal: 'Heading Hierarchy Skips',
      measured: 'H-level skips detected',
      target: 'Sequential H1→H2→H3 hierarchy',
      impact: 'AI agents use heading hierarchy to build a document outline for RAG chunking. Skipped levels break the outline.',
      fix: `Fix heading levels: ${(headings.skips || []).join(', ') || 'See Content Structure tab for details'}.`,
      effort: 'Low'
    });
  }

  if (!hasAnySchema) {
    opportunities.push({
      priority: 'P0',
      signal: 'No Structured Data',
      measured: '0 JSON-LD schemas detected',
      target: 'Organization + WebSite minimum',
      impact: 'AI agents use schema.org data to instantly understand page context without parsing prose. Missing schema forces agents to guess.',
      fix: 'Add Organization and WebSite JSON-LD blocks to your page template.',
      effort: 'Low'
    });
  } else if (!hasOrgSchema) {
    opportunities.push({
      priority: 'P1',
      signal: 'Missing Organization Schema',
      measured: 'No Organization JSON-LD',
      target: 'Organization with name, url, sameAs',
      impact: 'Without Organization schema, agents cannot reliably attribute content to your brand entity.',
      fix: 'Add an Organization JSON-LD block with name, url, logo, and sameAs fields.',
      effort: 'Low'
    });
  }

  if (contentRatio != null && contentRatio < THRESHOLDS.contentRatio.warn) {
    opportunities.push({
      priority: 'P2',
      signal: 'Low Content-to-Code Ratio',
      measured: `${contentRatio}%`,
      target: '≥ 20%',
      impact: 'Very low text-to-HTML ratio means agents spend compute processing boilerplate markup instead of meaningful content.',
      fix: 'Reduce inline styles, nested divs, and tracking scripts. Serve a lean HTML response.',
      effort: 'Medium'
    });
  }

  if (jsHeavy) {
    opportunities.push({
      priority: 'P2',
      signal: 'Heavy Unused JavaScript',
      measured: `${unusedJsOpp?.savingsMs}ms savings available`,
      target: '< 100ms unused JS',
      impact: 'Agents that cannot execute JavaScript receive an empty page. Heavy JS also slows TTI significantly.',
      fix: 'Code-split and lazy-load JavaScript. Remove unused dependencies.',
      effort: 'High'
    });
  }

  // ─── Signal summary for UI display ──────────────────────────────────────
  const signals = [
    {
      id: 'ttfb',
      label: 'Server Response Time',
      sublabel: 'How fast does the server respond to agent requests?',
      measured: ttfbMs != null ? `${ttfbMs}ms` : 'N/A',
      target: '< 400ms',
      verdict: ttfbSignal.verdict,
      score: ttfbSignal.score,
      source: 'PSI + Native HTTP',
    },
    {
      id: 'tti',
      label: 'Time to Interactive',
      sublabel: 'When is the page ready for agents to read?',
      measured: cwv.tti || (cwv.ttiMs != null ? `${cwv.ttiMs}ms` : 'N/A'),
      target: '< 3.0s',
      verdict: ttiSignal.verdict,
      score: ttiSignal.score,
      source: 'PSI Mobile',
    },
    {
      id: 'tbt',
      label: 'Total Blocking Time',
      sublabel: 'How long is the main thread blocked?',
      measured: cwv.tbt || (cwv.tbtMs != null ? `${cwv.tbtMs}ms` : 'N/A'),
      target: '< 150ms',
      verdict: tbtSignal.verdict,
      score: tbtSignal.score,
      source: 'PSI Mobile',
    },
    {
      id: 'dom',
      label: 'DOM Complexity',
      sublabel: 'Is the HTML tree manageable for agentic parsers?',
      measured: domSizeNodes != null ? `${domSizeNodes} nodes` : 'N/A',
      target: '< 800 nodes',
      verdict: domSizeSignal.verdict,
      score: domSizeSignal.score,
      source: 'PSI Diagnostics',
    },
    {
      id: 'semantic',
      label: 'Semantic HTML Landmarks',
      sublabel: 'Can agents find the main content area?',
      measured: hasSemanticLandmarks ? '<main> detected' : 'No <main> found',
      target: '<main> + <article>',
      verdict: hasSemanticLandmarks ? 'good' : 'critical',
      score: hasSemanticLandmarks ? 100 : 0,
      source: 'HTML Analysis',
    },
    {
      id: 'schema',
      label: 'Structured Data',
      sublabel: 'Does the page give agents instant structured context?',
      measured: schemaTypes.length > 0 ? schemaTypes.join(', ') : 'None detected',
      target: 'Organization + WebSite minimum',
      verdict: hasOrgSchema ? 'good' : hasAnySchema ? 'needs-work' : 'critical',
      score: schemaSubScore * 10, // normalize
      source: 'HTML Analysis',
    },
    {
      id: 'heading',
      label: 'Heading Hierarchy',
      sublabel: 'Can agents build a document outline?',
      measured: hasCleanHeadings ? 'Clean hierarchy' : `${headings?.skips?.length || 1} skip(s)`,
      target: 'Sequential H1→H2→H3',
      verdict: hasCleanHeadings ? 'good' : 'needs-work',
      score: hasCleanHeadings ? 100 : 30,
      source: 'HTML Analysis',
    },
    {
      id: 'crawler',
      label: 'Live Agent Bot Access',
      sublabel: 'Are the key agentic crawlers allowed?',
      measured: `${allowedCount}/${liveAgentBots.length} agents allowed`,
      target: 'All critical agents: ALLOW',
      verdict: allowedCount === liveAgentBots.length ? 'good' : allowedCount > 0 ? 'needs-work' : 'critical',
      score: crawlerSubScore * 5, // normalize
      source: 'robots.txt',
    },
  ];

  return {
    score: totalScore,
    grade,
    verdict,
    description,
    signals,
    opportunities: opportunities.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2 };
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    }),
    scoreBreakdown: {
      psiSignals: { score: psiSubScore, maxScore: 40, label: 'Performance Signals (PSI)' },
      extractability: { score: extractSubScore, maxScore: 30, label: 'Content Extractability' },
      crawlerAccess: { score: crawlerSubScore, maxScore: 20, label: 'Agent Crawler Access' },
      structuredData: { score: schemaSubScore, maxScore: 10, label: 'Structured Data Richness' },
    },
    apiAvailable: pageSpeedData?.apiAvailable ?? false,
    dataVerifiedAt: timestamp,
  };
}
