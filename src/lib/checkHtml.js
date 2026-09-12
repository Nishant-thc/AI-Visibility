import { load } from 'cheerio';
import { RICH_RESULTS_RULES, AUTHORITATIVE_ENTITY_SOURCES } from '@/config/rulesConfig';

function computeReadability(text) {
  if (!text || text.length < 50) {
    return { readingEase: null, gradeLevel: null, readingEaseLabel: 'Insufficient text' };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  if (sentences.length === 0 || words.length === 0) {
    return { readingEase: null, gradeLevel: null, readingEaseLabel: 'Insufficient text' };
  }

  const countSyllables = (word) => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  };

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  const sentenceCount = sentences.length;
  const wordCount = words.length;
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = totalSyllables / wordCount;

  const readingEase = Math.round(206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord));
  const clampedEase = Math.max(0, Math.min(100, readingEase));
  const gradeLevel = Math.max(1, Math.round((0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59));

  let readingEaseLabel = 'Standard';
  if (clampedEase >= 80) readingEaseLabel = 'Very Easy (Conversational)';
  else if (clampedEase >= 60) readingEaseLabel = 'Standard (General Public)';
  else if (clampedEase >= 45) readingEaseLabel = 'Moderate (College level)';
  else readingEaseLabel = 'Complex (Technical / Academic)';

  return {
    readingEase: clampedEase,
    gradeLevel,
    readingEaseLabel,
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(wordsPerSentence * 10) / 10
  };
}

function unpackJsonLd(obj, results = []) {
  if (!obj || typeof obj !== 'object') return results;

  if (Array.isArray(obj)) {
    obj.forEach(item => unpackJsonLd(item, results));
    return results;
  }

  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    obj['@graph'].forEach(item => unpackJsonLd(item, results));
  }

  if (obj['@type']) {
    results.push(obj);
  }

  for (const key of ['mainEntity', 'itemReviewed', 'publisher', 'author', 'hasPart', 'itemListElement']) {
    if (obj[key] && typeof obj[key] === 'object') {
      unpackJsonLd(obj[key], results);
    }
  }

  return results;
}

export async function checkHtml(url, customUserAgent) {
  const timestamp = new Date().toISOString();

  let hasVisibleText = false;
  let bodyTextLength = 0;
  let extractedBodySnippet = '';
  let readability = null;
  let finalResolvedUrl = url;

  let httpHeaders = {
    cacheControl: null,
    contentType: null,
    hsts: null,
    contentEncoding: null,
    server: null,
    cdn: null,
    xRobotsTag: null,
    status: null
  };

  let meta = {
    title: null,
    description: null,
    canonicalUrl: null,
    canonicalIsSelf: false,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogType: null,
    twitterCard: null,
    twitterTitle: null,
    twitterDescription: null,
    robots: null,
    hasNoIndex: false,
    hasNoFollow: false,
    hasNoAi: false,
    viewport: null,
    charset: null,
    lang: null,
    favicon: null,
    hreflangs: []
  };

  let headings = {
    score: 0,
    status: 'Fail',
    explanation: 'Could not inspect headings.',
    fix: 'Implement an H1-H6 heading hierarchy.',
    outline: [],
    h1Count: 0,
    totalCount: 0,
    countsByLevel: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
    hasSkippedLevels: false,
    skips: [],
    firstHeadingIsH1: false,
    faqCrossCheckMatch: null
  };

  let structuredData = {
    score: 0,
    status: 'Fail',
    explanation: 'No JSON-LD structured data found.',
    fix: 'Add Schema.org JSON-LD markup describing key entities.',
    schemaTypes: [],
    blockCount: 0,
    richResultsEligibility: [],
    entityLinking: { count: 0, sources: [] },
    hasMicrodata: false,
    hasRdfa: false,
    jsonLdBlocks: [],
    rawJsonLdStrings: []
  };

  // Section 2.9 Deep Browser-Only Signals
  let browserSignals = {
    contentToCodeRatio: 0,
    semanticLandmarks: {
      hasMain: false,
      hasArticle: false,
      hasNav: false,
      hasAside: false,
      hasSection: false,
      summary: ''
    },
    paragraphs: {
      count: 0,
      avgWords: 0,
      longestWords: 0,
      denseCount: 0 // > 180 words
    },
    structuredContentRatio: {
      listItemsCount: 0,
      tableRowsCount: 0,
      paragraphCount: 0,
      percentageStructured: 0
    },
    tableHeaderIntegrity: {
      totalTables: 0,
      validTables: 0,
      missingHeadersCount: 0
    },
    hasNoscript: false,
    noscriptTextLength: 0,
    hasTldrBlock: false,
    tldrSnippet: null,
    hiddenAccordionExtractable: null,
    authorByline: {
      foundInDom: false,
      domAuthorName: null,
      matchedWithSchema: false
    },
    breadcrumbs: {
      foundInDom: false,
      hasSchemaMatch: false
    },
    videoCaptions: {
      totalVideos: 0,
      withCaptions: 0
    },
    interstitialBlocker: {
      detected: false,
      type: null
    },
    mixedContent: {
      count: 0,
      urls: []
    },
    internalLinks: {
      total: 0,
      genericAnchorCount: 0,
      nofollowCount: 0,
      genericRatio: 0
    }
  };

  let rawHtml = '';

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': customUserAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    });

    finalResolvedUrl = res.url || url;
    httpHeaders.status = res.status;
    httpHeaders.cacheControl = res.headers.get('cache-control');
    httpHeaders.contentType = res.headers.get('content-type');
    httpHeaders.hsts = res.headers.get('strict-transport-security');
    httpHeaders.contentEncoding = res.headers.get('content-encoding');
    httpHeaders.server = res.headers.get('server');
    httpHeaders.xRobotsTag = res.headers.get('x-robots-tag');

    const cfRay = res.headers.get('cf-ray');
    const fastly = res.headers.get('x-fastly-request-id');
    const akamai = res.headers.get('x-akamai-transformed');
    if (cfRay) httpHeaders.cdn = 'Cloudflare';
    else if (fastly) httpHeaders.cdn = 'Fastly';
    else if (akamai) httpHeaders.cdn = 'Akamai';
    else if (httpHeaders.server) httpHeaders.cdn = httpHeaders.server;

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    rawHtml = await res.text();

    const $ = load(rawHtml);

    // 1. Clean Body Text
    const $bodyClone = load(rawHtml);
    $bodyClone('script, style, noscript, svg, nav, footer, header').remove();
    const cleanBodyText = $bodyClone('body').text().replace(/\s+/g, ' ').trim();
    bodyTextLength = cleanBodyText.length;
    hasVisibleText = bodyTextLength > 150;
    extractedBodySnippet = cleanBodyText.slice(0, 1000);
    readability = computeReadability(cleanBodyText);

    // 2. Meta Tags
    meta.title = $('title').first().text().trim() || null;
    meta.description = $('meta[name="description" i]').attr('content')?.trim() || null;
    meta.canonicalUrl = $('link[rel="canonical" i]').attr('href')?.trim() || null;

    if (meta.canonicalUrl) {
      try {
        const canonicalNorm = new URL(meta.canonicalUrl, finalResolvedUrl).href.replace(/\/$/, '').toLowerCase();
        const currentNorm = finalResolvedUrl.replace(/\/$/, '').toLowerCase();
        meta.canonicalIsSelf = canonicalNorm === currentNorm;
      } catch (e) {
        meta.canonicalIsSelf = false;
      }
    }

    meta.ogTitle = $('meta[property="og:title" i]').attr('content')?.trim() || null;
    meta.ogDescription = $('meta[property="og:description" i]').attr('content')?.trim() || null;
    meta.ogImage = $('meta[property="og:image" i]').attr('content')?.trim() || null;
    meta.ogType = $('meta[property="og:type" i]').attr('content')?.trim() || null;

    meta.twitterCard = $('meta[name="twitter:card" i]').attr('content')?.trim() || null;
    meta.twitterTitle = $('meta[name="twitter:title" i]').attr('content')?.trim() || null;
    meta.twitterDescription = $('meta[name="twitter:description" i]').attr('content')?.trim() || null;

    meta.robots = $('meta[name="robots" i]').attr('content')?.toLowerCase() || null;
    const combinedRobots = `${meta.robots || ''} ${httpHeaders.xRobotsTag || ''}`.toLowerCase();

    meta.hasNoIndex = combinedRobots.includes('noindex') || combinedRobots.includes('none');
    meta.hasNoFollow = combinedRobots.includes('nofollow') || combinedRobots.includes('none');
    meta.hasNoAi = combinedRobots.includes('noai') || combinedRobots.includes('noimageai');

    meta.viewport = $('meta[name="viewport" i]').attr('content') || null;
    meta.lang = $('html').attr('lang') || null;
    meta.favicon = $('link[rel*="icon" i]').attr('href') || null;

    const charsetMeta = $('meta[charset]').attr('charset');
    const httpEquivCharset = $('meta[http-equiv="Content-Type" i]').attr('content');
    meta.charset = charsetMeta || (httpEquivCharset ? httpEquivCharset.split('charset=')[1] : null) || null;

    $('link[rel="alternate"][hreflang]').each((_, el) => {
      meta.hreflangs.push({
        lang: $(el).attr('hreflang'),
        href: $(el).attr('href')
      });
    });

    // 3. Heading Tree & Hierarchy
    const allHeadings = [];
    const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    const skipLog = [];

    // Exclude common popup/modal containers
    const ignoreSelector = '.modal, .popup, dialog, [role="dialog"], .modal *, .popup *, dialog *, [role="dialog"] *';

    $('h1, h2, h3, h4, h5, h6').not(ignoreSelector).each((i, el) => {
      const tag = el.tagName.toLowerCase();
      const level = parseInt(tag[1], 10);
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      counts[tag] = (counts[tag] || 0) + 1;
      allHeadings.push({ tag, level, text });
    });

    let hasSkippedLevels = false;
    let prevLevel = 0;
    for (const h of allHeadings) {
      if (prevLevel > 0 && h.level > prevLevel + 1) {
        hasSkippedLevels = true;
        skipLog.push(`H${prevLevel} → H${h.level} at "${h.text.slice(0, 30)}${h.text.length > 30 ? '...' : ''}"`);
      }
      prevLevel = h.level;
    }

    const h1Count = counts.h1;
    const firstHeadingIsH1 = allHeadings.length > 0 && allHeadings[0].level === 1;

    let headingScore = 50;
    let headingStatus = 'Partial';
    let headingExplanation = '';
    let headingFix = '';

    if (h1Count === 1 && !hasSkippedLevels && firstHeadingIsH1) {
      headingScore = 100;
      headingStatus = 'Pass';
      headingExplanation = `Strict hierarchical heading structure: 1 H1 at the top with ${allHeadings.length} nested section headers. AI crawlers can parse semantic chunking reliably.`;
      headingFix = 'No action needed.';
    } else if (h1Count === 0) {
      headingScore = 20;
      headingStatus = 'Fail';
      headingExplanation = 'No H1 tag detected. LLM crawlers depend on H1 headers to establish the primary entity topic.';
      headingFix = 'Add a descriptive H1 header near the top of the main content.';
    } else if (h1Count > 1) {
      headingScore = 60;
      headingStatus = 'Partial';
      headingExplanation = `${h1Count} separate H1 tags detected. Multiple H1 tags can dilute document topic focus for AI summarization.`;
      headingFix = 'Consolidate into 1 overarching H1 tag and downgrade secondary titles to H2.';
    } else if (!firstHeadingIsH1) {
      headingScore = 70;
      headingStatus = 'Partial';
      headingExplanation = 'H1 tag exists, but is preceded by lower-level headers in the DOM flow.';
      headingFix = 'Ensure your primary H1 tag is the first heading encountered in the DOM flow.';
    } else if (hasSkippedLevels) {
      headingScore = 75;
      headingStatus = 'Partial';
      headingExplanation = 'Heading levels are skipped (e.g., jumping from H1 directly to H3/H4).';
      headingFix = 'Use sequential heading nesting (H1 -> H2 -> H3) to maintain coherent AI content chunking.';
    }

    headings = {
      score: headingScore,
      status: headingStatus,
      explanation: headingExplanation,
      fix: headingFix,
      outline: allHeadings.slice(0, 40).map(h => ({
        tag: h.tag.toUpperCase(),
        level: h.level,
        text: h.text.length > 100 ? h.text.slice(0, 100) + '…' : h.text
      })),
      h1Count,
      totalCount: allHeadings.length,
      countsByLevel: counts,
      hasSkippedLevels,
      skips: skipLog,
      firstHeadingIsH1
    };

    // 4. Recursive Structured Data Extraction
    const rawJsonLdStrings = [];
    const parsedJsonLdObjects = [];

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).html()?.trim();
        if (raw) {
          rawJsonLdStrings.push(raw);
          const parsed = JSON.parse(raw);
          unpackJsonLd(parsed, parsedJsonLdObjects);
        }
      } catch (e) {
        // Syntax error in JSON-LD script
      }
    });

    structuredData.hasMicrodata = $('[itemscope]').length > 0;
    structuredData.hasRdfa = $('[typeof], [property]').length > 0;
    structuredData.blockCount = parsedJsonLdObjects.length;
    structuredData.rawJsonLdStrings = rawJsonLdStrings;

    const extractedTypes = new Set();
    const entitySources = new Set();
    const richResultsEligibility = [];

    parsedJsonLdObjects.forEach(block => {
      const typeRaw = block['@type'];
      const types = Array.isArray(typeRaw) ? typeRaw : [typeRaw].filter(Boolean);

      types.forEach(t => extractedTypes.add(t));

      const sameAsList = Array.isArray(block.sameAs) ? block.sameAs : (block.sameAs ? [block.sameAs] : []);
      sameAsList.forEach(link => {
        try {
          const u = new URL(link);
          if (AUTHORITATIVE_ENTITY_SOURCES.some(src => u.hostname.includes(src))) {
            entitySources.add(`${u.hostname} (${block.name || types[0] || 'Entity'})`);
          }
        } catch (e) {}
      });

      types.forEach(type => {
        const rule = RICH_RESULTS_RULES[type];
        if (rule) {
          const missingRequired = rule.required.filter(field => !block[field]);
          const missingRecommended = rule.recommended.filter(field => !block[field]);

          let oneOfFailed = false;
          if (rule.oneOfRequired) {
            const hasAtLeastOne = rule.oneOfRequired.some(opt => !!block[opt.field]);
            if (!hasAtLeastOne) {
              oneOfFailed = true;
              missingRequired.push(`One of: ${rule.oneOfRequired.map(o => o.label).join(' OR ')}`);
            }
          }

          let eligibilityStatus = 'Eligible';
          if (rule.richResultEligible === false) {
            eligibilityStatus = 'Not eligible';
          } else if (missingRequired.length > 0) {
            eligibilityStatus = 'Has Errors';
          } else if (missingRecommended.length > 0) {
            eligibilityStatus = 'Has Warnings';
          }

          richResultsEligibility.push({
            type,
            status: eligibilityStatus,
            missingRequired,
            missingRecommended,
            deprecatedWarning: rule.deprecatedWarning,
            docUrl: rule.docUrl
          });
        }
      });
    });

    const faqBlock = parsedJsonLdObjects.find(b => {
      const t = Array.isArray(b['@type']) ? b['@type'] : [b['@type']];
      return t.includes('FAQPage');
    });

    if (faqBlock && faqBlock.mainEntity && Array.isArray(faqBlock.mainEntity)) {
      const schemaQuestions = faqBlock.mainEntity.map(q => q.name || q.question || '').filter(Boolean);
      let matchedCount = 0;
      schemaQuestions.forEach(q => {
        const snippet = q.slice(0, 30).toLowerCase();
        if (cleanBodyText.toLowerCase().includes(snippet)) {
          matchedCount++;
        }
      });
      headings.faqCrossCheckMatch = {
        totalInSchema: schemaQuestions.length,
        matchedInVisibleContent: matchedCount,
        isMismatched: matchedCount < Math.ceil(schemaQuestions.length * 0.5)
      };
    }

    structuredData.schemaTypes = Array.from(extractedTypes);
    structuredData.richResultsEligibility = richResultsEligibility;
    structuredData.entityLinking = {
      count: entitySources.size,
      sources: Array.from(entitySources)
    };
    structuredData.jsonLdBlocks = parsedJsonLdObjects.slice(0, 10);

    let schemaScore = 0;
    let schemaStatus = 'Fail';
    let schemaExplanation = '';
    let schemaFix = '';

    const highValueTypes = ['Article', 'BlogPosting', 'Product', 'BreadcrumbList', 'VideoObject', 'LocalBusiness', 'Organization', 'Review', 'SoftwareApplication'];
    const hasHighValue = structuredData.schemaTypes.some(t => highValueTypes.includes(t));
    const errorsCount = richResultsEligibility.filter(r => r.status === 'Has Errors').length;
    const warningsCount = richResultsEligibility.filter(r => r.status === 'Has Warnings').length;

    if (structuredData.schemaTypes.length === 0) {
      schemaScore = 0;
      schemaStatus = 'Fail';
      schemaExplanation = 'Zero structured data detected. AI systems cannot disambiguate key entities, authors, or products.';
      schemaFix = 'Implement Schema.org JSON-LD (e.g. Organization, Article, or Product) on all priority pages.';
    } else if (hasHighValue && errorsCount === 0) {
      schemaScore = warningsCount > 0 ? 90 : 100;
      schemaStatus = 'Pass';
      schemaExplanation = `High-value structured data (${structuredData.schemaTypes.join(', ')}) is syntactically valid and eligible for Google rich results.`;
      schemaFix = warningsCount > 0 ? 'Address recommended properties to maximize rich snippet prominence.' : 'No action needed. Structured data is AI-ready.';
    } else if (hasHighValue && errorsCount > 0) {
      schemaScore = Math.max(50, 85 - (errorsCount * 10));
      schemaStatus = 'Partial';
      schemaExplanation = `High-value schema detected (${structuredData.schemaTypes.join(', ')}), but ${errorsCount} required field error(s) prevent Google Rich Result eligibility.`;
      schemaFix = 'Review the Rich Results table below and supply missing required fields (e.g. image, headline, or offers).';
    } else {
      schemaScore = 60;
      schemaStatus = 'Partial';
      schemaExplanation = `Found basic schema types (${structuredData.schemaTypes.join(', ')}), but content-specific rich result types are absent.`;
      schemaFix = 'Add specific Schema.org types mapping directly to the subject matter of the page.';
    }

    if (structuredData.entityLinking.count > 0) {
      schemaScore = Math.min(100, schemaScore + 5);
    }

    structuredData.score = schemaScore;
    structuredData.status = schemaStatus;
    structuredData.explanation = schemaExplanation;
    structuredData.fix = schemaFix;

    // =========================================================================
    // 5. SECTION 2.9 BROWSER-ONLY SIGNAL COMPUTATION
    // =========================================================================

    // 5.1 Content-to-Code Ratio
    const totalHtmlLength = rawHtml.length || 1;
    browserSignals.contentToCodeRatio = Math.round((cleanBodyText.length / totalHtmlLength) * 1000) / 10;

    // 5.2 Semantic HTML5 Landmarks
    browserSignals.semanticLandmarks.hasMain = $('main').length > 0;
    browserSignals.semanticLandmarks.hasArticle = $('article').length > 0;
    browserSignals.semanticLandmarks.hasNav = $('nav').length > 0;
    browserSignals.semanticLandmarks.hasAside = $('aside').length > 0;
    browserSignals.semanticLandmarks.hasSection = $('section').length > 0;

    const presentLandmarks = [];
    if (browserSignals.semanticLandmarks.hasMain) presentLandmarks.push('<main>');
    if (browserSignals.semanticLandmarks.hasArticle) presentLandmarks.push('<article>');
    if (browserSignals.semanticLandmarks.hasSection) presentLandmarks.push('<section>');
    if (browserSignals.semanticLandmarks.hasNav) presentLandmarks.push('<nav>');
    if (browserSignals.semanticLandmarks.hasAside) presentLandmarks.push('<aside>');
    browserSignals.semanticLandmarks.summary = presentLandmarks.length > 0
      ? `${presentLandmarks.join(', ')} present`
      : 'No HTML5 semantic landmarks used';

    // 5.3 Paragraph Length Distribution
    const paragraphs = [];
    $('p').each((_, el) => {
      const pText = $(el).text().trim();
      const pWords = pText.split(/\s+/).filter(Boolean).length;
      if (pWords > 3) paragraphs.push(pWords);
    });

    if (paragraphs.length > 0) {
      const totalWords = paragraphs.reduce((a, b) => a + b, 0);
      browserSignals.paragraphs.count = paragraphs.length;
      browserSignals.paragraphs.avgWords = Math.round(totalWords / paragraphs.length);
      browserSignals.paragraphs.longestWords = Math.max(...paragraphs);
      browserSignals.paragraphs.denseCount = paragraphs.filter(w => w > 180).length;
    }

    // 5.4 List & Table Structured Content Ratio
    const listItems = $('ul li, ol li').length;
    const tableRows = $('table tr').length;
    const pCount = paragraphs.length;
    const totalChunks = listItems + tableRows + pCount;

    browserSignals.structuredContentRatio = {
      listItemsCount: listItems,
      tableRowsCount: tableRows,
      paragraphCount: pCount,
      percentageStructured: totalChunks > 0 ? Math.round(((listItems + tableRows) / totalChunks) * 100) : 0
    };

    // 5.5 Table Header Integrity
    const tables = $('table');
    browserSignals.tableHeaderIntegrity.totalTables = tables.length;
    let tablesWithHeaders = 0;
    tables.each((_, tbl) => {
      const hasTh = $(tbl).find('th').length > 0;
      if (hasTh) tablesWithHeaders++;
    });
    browserSignals.tableHeaderIntegrity.validTables = tablesWithHeaders;
    browserSignals.tableHeaderIntegrity.missingHeadersCount = tables.length - tablesWithHeaders;

    // 5.6 noscript content
    const noscriptText = $('noscript').text().trim();
    browserSignals.hasNoscript = $('noscript').length > 0;
    browserSignals.noscriptTextLength = noscriptText.length;

    // 5.7 TL;DR / Key-Takeaways Block Detection
    const tldrEl = $('.tldr, .key-takeaways, .takeaway, .summary-box, [data-component*="takeaway"], [class*="key-takeaways"]');
    if (tldrEl.length > 0) {
      browserSignals.hasTldrBlock = true;
      browserSignals.tldrSnippet = tldrEl.first().text().replace(/\s+/g, ' ').trim().slice(0, 150);
    } else {
      $('h2, h3').each((_, h) => {
        const text = $(h).text().toLowerCase();
        if (text.includes('takeaway') || text.includes('key points') || text.includes('at a glance') || text.includes('summary')) {
          browserSignals.hasTldrBlock = true;
          browserSignals.tldrSnippet = $(h).next().text().replace(/\s+/g, ' ').trim().slice(0, 150);
        }
      });
    }

    // 5.8 Hidden FAQ / Accordion in Static HTML
    const accordionTextBlocks = $('details, .accordion, [data-accordion], .collapse');
    if (accordionTextBlocks.length > 0) {
      const textLen = accordionTextBlocks.text().trim().length;
      browserSignals.hiddenAccordionExtractable = textLen > 50 ? 'Present in static HTML (Extractable)' : 'Injected via JS (Invisible to crawlers)';
    } else {
      browserSignals.hiddenAccordionExtractable = 'None detected';
    }

    // 5.9 Author Byline Paired with Person Schema
    const bylineEl = $('[rel="author"], .author, .byline, [class*="author-name"], [itemprop="author"]');
    if (bylineEl.length > 0) {
      browserSignals.authorByline.foundInDom = true;
      browserSignals.authorByline.domAuthorName = bylineEl.first().text().replace(/\s+/g, ' ').trim().slice(0, 50);

      // Check if Person schema exists
      const personSchema = parsedJsonLdObjects.find(b => {
        const t = Array.isArray(b['@type']) ? b['@type'] : [b['@type']];
        return t.includes('Person') || (b.author && (b.author.name || typeof b.author === 'string'));
      });
      browserSignals.authorByline.matchedWithSchema = !!personSchema;
    }

    // 5.10 Breadcrumb DOM Match
    const breadcrumbDom = $('nav[aria-label*="breadcrumb" i], .breadcrumb, .breadcrumbs, [class*="breadcrumb"]');
    browserSignals.breadcrumbs.foundInDom = breadcrumbDom.length > 0;
    browserSignals.breadcrumbs.hasSchemaMatch = structuredData.schemaTypes.includes('BreadcrumbList');

    // 5.11 Video Captions
    const videoTags = $('video');
    browserSignals.videoCaptions.totalVideos = videoTags.length;
    let videosWithCaptions = 0;
    videoTags.each((_, v) => {
      if ($(v).find('track[kind="captions"], track[kind="subtitles"]').length > 0) {
        videosWithCaptions++;
      }
    });
    browserSignals.videoCaptions.withCaptions = videosWithCaptions;

    // 5.12 Cookie Interstitial Overlay Before <main>
    const consentSelectors = '#onetrust-consent-sdk, .onetrust-pc-dark, #CybotCookiebotDialog, .cookie-banner, .cookie-consent, [class*="cookie-notice"]';
    const consentBanner = $(consentSelectors);
    if (consentBanner.length > 0) {
      const mainIndex = $('main, article').index();
      const consentIndex = consentBanner.index();
      browserSignals.interstitialBlocker.detected = true;
      browserSignals.interstitialBlocker.type = consentIndex < mainIndex
        ? 'Precedes <main> content in DOM order'
        : 'Appended after content';
    }

    // 5.13 Mixed Content (HTTP URLs on HTTPS page)
    if (url.startsWith('https:')) {
      const mixed = [];
      $('img[src^="http:"], script[src^="http:"], link[rel="stylesheet"][href^="http:"], iframe[src^="http:"]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('href');
        if (src) mixed.push(src);
      });
      browserSignals.mixedContent.count = mixed.length;
      browserSignals.mixedContent.urls = mixed.slice(0, 5);
    }

    // 5.14 Internal Link Quality & nofollow Check
    try {
      const currentHost = new URL(finalResolvedUrl).hostname;
      const genericAnchorPatterns = ['click here', 'read more', 'learn more', 'here', 'link', 'more', 'view more', 'continue reading'];
      let internalCount = 0;
      let genericCount = 0;
      let nofollowCount = 0;

      $('a[href]').each((_, a) => {
        const href = $(a).attr('href');
        if (!href) return;

        let isInternal = false;
        try {
          if (href.startsWith('/') || href.startsWith('#') || href.startsWith('./')) {
            isInternal = true;
          } else {
            const linkUrl = new URL(href, finalResolvedUrl);
            if (linkUrl.hostname === currentHost) isInternal = true;
          }
        } catch (e) {}

        if (isInternal) {
          internalCount++;
          const text = $(a).text().trim().toLowerCase();
          if (genericAnchorPatterns.includes(text)) {
            genericCount++;
          }
          const rel = $(a).attr('rel') || '';
          if (rel.toLowerCase().includes('nofollow')) {
            nofollowCount++;
          }
        }
      });

      browserSignals.internalLinks = {
        total: internalCount,
        genericAnchorCount: genericCount,
        nofollowCount: nofollowCount,
        genericRatio: internalCount > 0 ? Math.round((genericCount / internalCount) * 100) : 0
      };
    } catch (e) {}

    // Entity Signals & Schema @id Graph Analysis
    let schemaNodeIdsCount = 0;
    parsedJsonLdObjects.forEach(block => {
      if (block['@id']) schemaNodeIdsCount++;
    });

    const entityMatches = cleanBodyText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
    const uniqueEntities = Array.from(new Set(entityMatches)).filter(e => e.length > 3);
    const wordCount = cleanBodyText.split(/\s+/).filter(Boolean).length || 1;
    const entityDensityPer1kWords = Math.round((uniqueEntities.length / (wordCount / 1000)) * 10) / 10;

    const entitySignals = {
      schemaNodeIdsCount,
      uniqueEntityPhrasesCount: uniqueEntities.length,
      entityDensityPer1kWords,
      sampleEntities: uniqueEntities.slice(0, 8),
      sameAsCount: structuredData.entityLinking.count,
      sameAsSources: structuredData.entityLinking.sources
    };

    // Paywall & Licensing Schema Check
    let isPaywalled = false;
    parsedJsonLdObjects.forEach(block => {
      if (block.isAccessibleForFree === false || block.isAccessibleForFree === 'false') {
        isPaywalled = true;
      }
    });

    const licenseLink = $('link[rel="license" i]').attr('href') || null;
    const hasCreativeCommons = licenseLink ? licenseLink.includes('creativecommons.org') : false;

    const combinedRobotsStr = `${meta.robots || ''} ${httpHeaders.xRobotsTag || ''}`.toLowerCase();
    const paywallLicensing = {
      isPaywalled,
      licenseLink,
      hasCreativeCommons,
      noArchiveMeta: combinedRobotsStr.includes('noarchive')
    };

    return {
      hasVisibleText,
      bodyTextLength,
      extractedBodySnippet,
      readability,
      httpHeaders,
      meta,
      headings,
      structuredData,
      browserSignals,
      entitySignals,
      paywallLicensing,
      finalResolvedUrl,
      rawHtmlLength: rawHtml.length,
      dataVerifiedAt: timestamp
    };

  } catch (err) {
    headings.explanation = `Could not fetch HTML: ${err.message}`;
    structuredData.explanation = `Could not fetch HTML: ${err.message}`;
    return {
      hasVisibleText: false,
      bodyTextLength: 0,
      extractedBodySnippet: '',
      readability: null,
      httpHeaders,
      meta,
      headings,
      structuredData,
      browserSignals,
      entitySignals: { schemaNodeIdsCount: 0, uniqueEntityPhrasesCount: 0, entityDensityPer1kWords: 0, sampleEntities: [], sameAsCount: 0, sameAsSources: [] },
      paywallLicensing: { isPaywalled: false, licenseLink: null, hasCreativeCommons: false, noArchiveMeta: false },
      finalResolvedUrl,
      rawHtmlLength: 0,
      dataVerifiedAt: timestamp
    };
  }
}
