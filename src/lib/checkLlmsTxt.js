/**
 * llms.txt parser and evaluator per Section 2.3
 * Evaluates presence, specification adherence (H1, blockquote summary, H2 sections, markdown links),
 * and assigns a usefulness score.
 */
export async function checkLlmsTxt(domain) {
  const timestamp = new Date().toISOString();
  const candidateUrls = [`${domain}/llms.txt`, `${domain}/.well-known/llms.txt`];

  let foundUrl = null;
  let rawContent = '';
  let contentPreview = null;
  let hasH1 = false;
  let h1Text = '';
  let hasBlockquote = false;
  let blockquoteText = '';
  let sectionCount = 0;
  let sections = [];
  let linkCount = 0;
  let wordCount = 0;
  let charCount = 0;
  let isStub = false;
  let usefulnessVerdict = 'Not Found';

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0)' },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const text = await res.text();
        // Check if response looks like plain text or markdown, not an HTML 404 page
        if (!text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
          foundUrl = url;
          rawContent = text;
          break;
        }
      }
    } catch (e) {
      // Continue to fallback
    }
  }

  if (!foundUrl) {
    return {
      score: 0,
      status: 'Fail',
      explanation: 'No llms.txt found. While not yet an officially ratified W3C/IETF standard, llms.txt is an emerging convention that allows AI models to efficiently discover your core documentation and key site entities.',
      fix: 'Create an /llms.txt file in your site root with an H1, summary blockquote, and markdown links to key pages.',
      contentPreview: null,
      rawContent: '',
      linkCount: 0,
      wordCount: 0,
      hasH1: false,
      hasBlockquote: false,
      sectionCount: 0,
      sections: [],
      charCount: 0,
      fetchedUrl: candidateUrls[0],
      found: false,
      isStub: false,
      usefulnessVerdict: 'Missing',
      dataVerifiedAt: timestamp
    };
  }

  // --- Parse llms.txt structure ---
  charCount = rawContent.length;
  contentPreview = rawContent.slice(0, 1500);
  wordCount = rawContent.split(/\s+/).filter(Boolean).length;

  // H1 Check
  const h1Match = rawContent.match(/^#\s+(.+)$/m);
  if (h1Match) {
    hasH1 = true;
    h1Text = h1Match[1].trim();
  }

  // Blockquote Summary Check
  const bqMatch = rawContent.match(/^>\s+(.+)$/m);
  if (bqMatch) {
    hasBlockquote = true;
    blockquoteText = bqMatch[1].trim();
  }

  // Markdown links: [Title](url) or [Title](url): description
  const linkMatches = rawContent.match(/\[([^\]]+)\]\(([^)]+)\)(?::\s*([^\n\r]+))?/g) || [];
  linkCount = linkMatches.length;

  // Extract sections (## Section)
  const lines = rawContent.split(/\r?\n/);
  let currentSection = null;

  for (const line of lines) {
    const secMatch = line.match(/^##\s+(.+)$/);
    if (secMatch) {
      currentSection = { title: secMatch[1].trim(), links: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      const lMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)(?::\s*(.+))?/);
      if (lMatch) {
        currentSection.links.push({
          title: lMatch[1].trim(),
          url: lMatch[2].trim(),
          description: lMatch[3]?.trim() || null
        });
      }
    }
  }
  sectionCount = sections.length;

  // Quality / Usefulness Evaluation
  if (wordCount < 30 || linkCount < 2) {
    isStub = true;
    usefulnessVerdict = 'Stub / Placeholder';
  } else if (hasH1 && hasBlockquote && sectionCount >= 2 && linkCount >= 5) {
    usefulnessVerdict = 'Comprehensive Navigation Map';
  } else if (hasH1 && linkCount >= 3) {
    usefulnessVerdict = 'Standard Useful Summary';
  } else {
    usefulnessVerdict = 'Incomplete Structure';
  }

  let score = 50;
  let status = 'Partial';
  let explanation = '';
  let fix = '';

  if (usefulnessVerdict === 'Comprehensive Navigation Map') {
    score = 100;
    status = 'Pass';
    explanation = `High-quality llms.txt found at ${foundUrl}. Features H1, summary blockquote, ${sectionCount} sections, and ${linkCount} mapped links.`;
    fix = 'No action needed. Continue keeping links updated as key products and documentation evolve.';
  } else if (usefulnessVerdict === 'Standard Useful Summary') {
    score = 80;
    status = 'Pass';
    explanation = `Valid llms.txt found at ${foundUrl} with ${linkCount} links.`;
    fix = 'Consider adding an introductory blockquote (> summary) and section groupings (## Sections) per the llms.txt specification.';
  } else if (isStub) {
    score = 40;
    status = 'Partial';
    explanation = `llms.txt file is present at ${foundUrl}, but appears to be a minimal stub (${wordCount} words, ${linkCount} link(s)).`;
    fix = 'Expand llms.txt to index your main product categories, documentation, pricing, and FAQ pages with brief descriptions.';
  } else {
    score = 60;
    status = 'Partial';
    explanation = `llms.txt exists at ${foundUrl} but lacks key convention elements (e.g. # Title, sections, or markdown links).`;
    fix = 'Structure the file with an H1 title, summary blockquote, and markdown-formatted links with short descriptive summaries.';
  }

  return {
    score,
    status,
    explanation,
    fix,
    contentPreview,
    rawContent,
    linkCount,
    wordCount,
    hasH1,
    h1Text,
    hasBlockquote,
    blockquoteText,
    sectionCount,
    sections,
    charCount,
    fetchedUrl: foundUrl,
    found: true,
    exists: true,
    isStub,
    usefulnessVerdict,
    dataVerifiedAt: timestamp
  };
}
