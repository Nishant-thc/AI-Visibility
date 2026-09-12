import { ALL_AUDITED_BOTS } from '@/config/bots';

/**
 * Parses robots.txt per RFC 9309.
 * Handles consecutive User-agent lines sharing rules, case-insensitivity,
 * and wildcard path patterns.
 */
export async function checkRobotsTxt(domain, customUserAgent) {
  const robotsUrl = `${domain}/robots.txt`;
  const timestamp = new Date().toISOString();

  let rawContent = '';
  let parsedBlocks = [];
  let sitemapDirectives = [];
  let syntaxConflicts = [];
  let fetchError = null;
  let notFound = false;
  let httpStatus = null;

  try {
    const res = await fetch(robotsUrl, {
      headers: {
        'User-Agent': customUserAgent || 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0; +https://antigravity.ai)'
      },
      signal: AbortSignal.timeout(8000)
    });

    httpStatus = res.status;

    if (res.status === 404) {
      notFound = true;
      rawContent = '';
    } else if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    } else {
      rawContent = await res.text();
    }
  } catch (err) {
    fetchError = err.message;
  }

  // If file doesn't exist (404), RFC 9309 specifies all bots are allowed by default
  if (notFound) {
    const botMatrix = ALL_AUDITED_BOTS.map(bot => ({
      ...bot,
      status: 'ALLOW',
      matchedRule: 'Implicit Allow (No robots.txt found — RFC 9309 §2.3.1)',
      isCustomRule: false
    }));

    return {
      score: 100,
      status: 'Pass',
      isAnswerBotBlocked: false,
      explanation: 'No robots.txt file found. By RFC 9309 standard, all AI and search bots are allowed access by default.',
      fix: 'Consider creating a robots.txt file to declare your sitemap and explicitly manage AI crawler access.',
      sitemapUrl: null,
      sitemapDirectives: [],
      rawContent: '',
      parsedBlocks: [],
      botMatrix,
      syntaxConflicts: [],
      hasSitemapDirective: false,
      notFound: true,
      fetchError: null,
      dataVerifiedAt: timestamp
    };
  }

  if (fetchError) {
    const botMatrix = ALL_AUDITED_BOTS.map(bot => ({
      ...bot,
      status: 'UNKNOWN',
      matchedRule: `Could not verify (${fetchError})`,
      isCustomRule: false
    }));

    return {
      score: 0,
      status: 'Fail',
      isAnswerBotBlocked: false,
      explanation: `Could not fetch robots.txt: ${fetchError}. AI crawlers encountering this error may back off or fail to index your site.`,
      fix: `Ensure robots.txt is publicly accessible at ${robotsUrl} without timeouts or server errors.`,
      sitemapUrl: null,
      sitemapDirectives: [],
      rawContent: '',
      parsedBlocks: [],
      botMatrix,
      syntaxConflicts: ['robots.txt endpoint unreachable'],
      hasSitemapDirective: false,
      notFound: false,
      fetchError,
      dataVerifiedAt: timestamp
    };
  }

  // --- RFC 9309 Parser ---
  // A record begins with one or more consecutive User-agent lines,
  // followed by one or more rule lines (Allow, Disallow).
  const lines = rawContent.split(/\r?\n/);
  let currentRecord = null;
  let inRuleSection = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineWithoutComment = rawLine.split('#')[0].trim();
    if (!lineWithoutComment) continue;

    const colonIdx = lineWithoutComment.indexOf(':');
    if (colonIdx === -1) {
      syntaxConflicts.push(`Line ${i + 1}: Malformed line without directive colon: "${lineWithoutComment}"`);
      continue;
    }

    const directive = lineWithoutComment.slice(0, colonIdx).trim().toLowerCase();
    const value = lineWithoutComment.slice(colonIdx + 1).trim();

    if (directive === 'user-agent') {
      // If we were previously in rule lines, this starts a new record
      if (inRuleSection || currentRecord === null) {
        currentRecord = {
          userAgents: [],
          disallows: [],
          allows: [],
          crawlDelay: null,
          lineStart: i + 1
        };
        parsedBlocks.push(currentRecord);
        inRuleSection = false;
      }
      currentRecord.userAgents.push(value);
    } else if (directive === 'disallow') {
      inRuleSection = true;
      if (currentRecord) {
        currentRecord.disallows.push(value);
      }
    } else if (directive === 'allow') {
      inRuleSection = true;
      if (currentRecord) {
        currentRecord.allows.push(value);
      }
    } else if (directive === 'crawl-delay') {
      if (currentRecord) {
        currentRecord.crawlDelay = value;
      }
    } else if (directive === 'sitemap') {
      if (value) {
        sitemapDirectives.push(value);
      }
    }
  }

  // Evaluate Bot Matrix
  const botMatrix = ALL_AUDITED_BOTS.map(bot => {
    const botNameLower = bot.name.toLowerCase();

    // Specific match: any record where one of the userAgents matches bot name
    const specificBlocks = parsedBlocks.filter(b =>
      b.userAgents.some(ua => {
        const cleanUa = ua.trim().toLowerCase();
        if (cleanUa === '*') return false;
        return botNameLower === cleanUa || botNameLower.includes(cleanUa) || cleanUa.includes(botNameLower);
      })
    );

    // Wildcard match: any record with User-agent: *
    const wildcardBlocks = parsedBlocks.filter(b =>
      b.userAgents.some(ua => ua.trim() === '*')
    );

    const relevantBlocks = specificBlocks.length > 0 ? specificBlocks : wildcardBlocks;
    const isCustomRule = specificBlocks.length > 0;

    if (relevantBlocks.length === 0) {
      return {
        ...bot,
        status: 'ALLOW',
        matchedRule: 'Allow (No matching Disallow rule found)',
        isCustomRule: false,
        disallows: [],
        allows: []
      };
    }

    const disallows = relevantBlocks.flatMap(b => b.disallows);
    const allows = relevantBlocks.flatMap(b => b.allows);

    const hasFullDisallow = disallows.some(d => d === '/' || d === '/*' || d === '*');
    const hasRootAllow = allows.some(a => a === '/' || a === '/*');
    const hasEmptyDisallow = disallows.some(d => d === '');

    let status = 'ALLOW';
    let matchedRule = 'Allow';

    if (hasFullDisallow && !hasRootAllow && allows.length === 0) {
      status = 'DISALLOW';
      matchedRule = `Disallow: / (${isCustomRule ? `Specific to ${bot.name}` : 'Inherited from User-agent: *'})`;
    } else if (hasFullDisallow && allows.length > 0) {
      status = 'PARTIAL';
      matchedRule = `Partial (Disallow: / with ${allows.length} Allow exception(s))`;
    } else if (disallows.filter(d => d !== '').length > 0) {
      status = 'PARTIAL';
      matchedRule = `Partial (${disallows.length} path restriction(s), e.g. ${disallows[0]})`;
    } else if (hasEmptyDisallow) {
      status = 'ALLOW';
      matchedRule = 'Explicit Allow (Disallow: empty)';
    }

    return {
      ...bot,
      status,
      matchedRule,
      isCustomRule,
      disallows,
      allows
    };
  });

  const citationAndFetchBots = botMatrix.filter(b => b.category === 'citation' || b.category === 'live_fetch');
  const trainingBots = botMatrix.filter(b => b.category === 'training');
  const searchEngineBots = botMatrix.filter(b => b.category === 'search_engine');

  const blockedRetrievalBots = botMatrix.filter(b => 
    (b.category === 'citation' || b.category === 'live_fetch' || b.criticalForVisibility) && b.status === 'DISALLOW'
  );
  const blockedTrainingBots = trainingBots.filter(b => b.status === 'DISALLOW');

  const criticalBots = botMatrix.filter(b => b.criticalForVisibility);
  const blockedCriticalCount = criticalBots.filter(b => b.status === 'DISALLOW').length;

  const isAnswerBotBlocked = blockedCriticalCount > 0 || (blockedRetrievalBots.length / Math.max(1, citationAndFetchBots.length)) >= 0.3;

  const citationAllowedCount = citationAndFetchBots.filter(b => b.status === 'ALLOW').length;
  const citationPartialCount = citationAndFetchBots.filter(b => b.status === 'PARTIAL').length;
  const citationScore = citationAndFetchBots.length > 0 
    ? ((citationAllowedCount + 0.5 * citationPartialCount) / citationAndFetchBots.length) * 60 
    : 60;

  const trainingAllowedCount = trainingBots.filter(b => b.status === 'ALLOW').length;
  const trainingPartialCount = trainingBots.filter(b => b.status === 'PARTIAL').length;
  const trainingScore = trainingBots.length > 0 
    ? ((trainingAllowedCount + 0.5 * trainingPartialCount) / trainingBots.length) * 25 
    : 25;

  const searchAllowedCount = searchEngineBots.filter(b => b.status === 'ALLOW').length;
  const searchScore = searchEngineBots.length > 0 
    ? (searchAllowedCount / searchEngineBots.length) * 15 
    : 15;

  const conflictPenalty = Math.min(10, syntaxConflicts.length * 2.5);

  let calculatedScore = Math.round(citationScore + trainingScore + searchScore - conflictPenalty);
  if (isAnswerBotBlocked) {
    calculatedScore = Math.min(calculatedScore, 15);
  }

  let overallStatus = 'Pass';
  let explanation = 'Your robots.txt allows key AI retrieval bots to fetch content for live answers.';
  let fix = 'No critical action needed.';

  if (isAnswerBotBlocked) {
    overallStatus = 'Fail';
    const names = blockedRetrievalBots.map(b => b.name).join(', ');
    explanation = `CRITICAL: Real-time AI answer bots (${names || 'ChatGPT/Perplexity/Claude'}) are blocked. When users query ChatGPT, Perplexity, or Claude, these bots cannot fetch your pages.`;
    fix = `Remove Disallow: / for retrieval bots (${names || 'ChatGPT-User, PerplexityBot, ClaudeBot'}). You may continue blocking training bots (like GPTBot, CCBot) if you prefer.`;
  } else if (sitemapDirectives.length === 0) {
    overallStatus = 'Partial';
    explanation = 'AI retrieval bots can crawl your pages, but no Sitemap directive was found in robots.txt.';
    fix = 'Add a Sitemap: directive pointing to your sitemap.xml to help crawlers discover deep pages.';
  } else if (syntaxConflicts.length > 0) {
    overallStatus = 'Partial';
    explanation = `Robots.txt parsed with ${syntaxConflicts.length} potential rule conflict(s).`;
    fix = 'Review conflicting Allow/Disallow rule combinations to ensure consistent crawler behavior.';
  }

  return {
    score: Math.max(0, calculatedScore),
    status: overallStatus,
    isAnswerBotBlocked,
    explanation,
    fix,
    sitemapUrl: sitemapDirectives[0] || null,
    sitemapDirectives,
    rawContent,
    parsedBlocks,
    botMatrix,
    blockedRetrievalBots,
    blockedTrainingBots,
    syntaxConflicts,
    hasSitemapDirective: sitemapDirectives.length > 0,
    notFound: false,
    fetchError: null,
    httpStatus,
    dataVerifiedAt: timestamp
  };
}
