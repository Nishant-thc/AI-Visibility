/**
 * Sitemap parser and validator per Section 2.2
 * Supports recursive sitemap index resolution, lastmod freshness distribution,
 * and sample URL status verification.
 */
export async function checkSitemap(domain, declaredUrl, auditedUrl, robotsData) {
  const timestamp = new Date().toISOString();
  const pathsToTry = declaredUrl
    ? [declaredUrl]
    : [`${domain}/sitemap.xml`, `${domain}/sitemap_index.xml`, `${domain}/wp-sitemap.xml`];

  let sitemapUrlChecked = null;
  let rawXmlSnippet = '';
  let urlCount = 0;
  let auditedUrlFound = null;
  let hasLastMod = false;
  let lastmodFreshness = { freshCount: 0, staleCount: 0, missingCount: 0 };
  let isSitemapIndex = false;
  let childSitemaps = [];
  let sampleUrls = [];
  let sampledUrlChecks = [];
  let extensions = { images: false, videos: false, news: false };
  let priorityUsageCount = 0;
  let changefreqUsageCount = 0;
  let fetchError = null;

  for (const candidateUrl of pathsToTry) {
    try {
      const res = await fetch(candidateUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0)' },
        signal: AbortSignal.timeout(7000)
      });

      if (res.ok) {
        const text = await res.text();
        const isXml = text.trim().startsWith('<?xml') || text.includes('<urlset') || text.includes('<sitemapindex');

        if (isXml) {
          sitemapUrlChecked = candidateUrl;
          rawXmlSnippet = text.slice(0, 1500);
          isSitemapIndex = text.includes('<sitemapindex');
          extensions.images = text.includes('xmlns:image') || text.includes('<image:');
          extensions.videos = text.includes('xmlns:video') || text.includes('<video:');
          extensions.news = text.includes('xmlns:news') || text.includes('<news:');

          priorityUsageCount = (text.match(/<priority>/g) || []).length;
          changefreqUsageCount = (text.match(/<changefreq>/g) || []).length;

          if (isSitemapIndex) {
            // Extract child sitemaps
            const locMatches = text.match(/<loc>\s*(.*?)\s*<\/loc>/gi) || [];
            childSitemaps = locMatches
              .map(m => m.replace(/<\/?loc>/gi, '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim())
              .filter(u => u.length > 0);

            if (childSitemaps.length > 0) {
              const allUrlsSet = new Set();
              const childPromises = childSitemaps.slice(0, 25).map(async (childUrl) => {
                try {
                  const childRes = await fetch(childUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0)' },
                    signal: AbortSignal.timeout(5000)
                  });
                  if (childRes.ok) {
                    const childText = await childRes.text();
                    const childLocs = childText.match(/<loc>\s*(.*?)\s*<\/loc>/gi) || [];
                    const urls = childLocs
                      .map(m => m.replace(/<\/?loc>/gi, '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim())
                      .filter(u => u.startsWith('http'));

                    const lastmodMatches = childText.match(/<lastmod>\s*(.*?)\s*<\/lastmod>/gi) || [];
                    const now = Date.now();
                    const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);

                    lastmodMatches.forEach(lm => {
                      const dateStr = lm.replace(/<\/?lastmod>/gi, '').trim();
                      const parsedDate = Date.parse(dateStr);
                      if (!isNaN(parsedDate)) {
                        if (parsedDate > sixMonthsAgo) {
                          lastmodFreshness.freshCount++;
                        } else {
                          lastmodFreshness.staleCount++;
                        }
                      }
                    });

                    return urls;
                  }
                } catch (e) {}
                return [];
              });

              const childResults = await Promise.all(childPromises);
              childResults.forEach(urls => {
                urls.forEach(u => allUrlsSet.add(u));
              });

              const allUrls = Array.from(allUrlsSet);
              urlCount = allUrls.length;
              hasLastMod = (lastmodFreshness.freshCount + lastmodFreshness.staleCount) > 0;
              lastmodFreshness.missingCount = Math.max(0, urlCount - (lastmodFreshness.freshCount + lastmodFreshness.staleCount));

              if (urlCount > 0) {
                sampleUrls = allUrls.slice(0, 10);
              } else {
                sampleUrls = childSitemaps.slice(0, 8);
              }

              if (auditedUrl) {
                const normalizedAudited = auditedUrl.replace(/\/$/, '').toLowerCase();
                auditedUrlFound = allUrls.some(u => u.replace(/\/$/, '').toLowerCase() === normalizedAudited);
              }
            }
          } else {
            // Standard urlset
            const locMatches = text.match(/<loc>\s*(.*?)\s*<\/loc>/gi) || [];
            const allUrls = Array.from(new Set(
              locMatches
                .map(m => m.replace(/<\/?loc>/gi, '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim())
                .filter(u => u.startsWith('http'))
            ));
            urlCount = allUrls.length;
            sampleUrls = allUrls.slice(0, 10);

            // Parse lastmod dates
            const lastmodMatches = text.match(/<lastmod>\s*(.*?)\s*<\/lastmod>/gi) || [];
            hasLastMod = lastmodMatches.length > 0;

            const now = Date.now();
            const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);

            lastmodMatches.forEach(lm => {
              const dateStr = lm.replace(/<\/?lastmod>/gi, '').trim();
              const parsedDate = Date.parse(dateStr);
              if (!isNaN(parsedDate)) {
                if (parsedDate > sixMonthsAgo) {
                  lastmodFreshness.freshCount++;
                } else {
                  lastmodFreshness.staleCount++;
                }
              }
            });
            lastmodFreshness.missingCount = Math.max(0, urlCount - lastmodMatches.length);

            if (auditedUrl) {
              const normalizedAudited = auditedUrl.replace(/\/$/, '').toLowerCase();
              auditedUrlFound = allUrls.some(u => u.replace(/\/$/, '').toLowerCase() === normalizedAudited);
            }
          }

          break; // successfully found and parsed
        }
      }
    } catch (err) {
      // Continue to fallback
      fetchError = err.message;
    }
  }

  // Cross-check: sample 2 URLs from sitemap for 200 HTTP response & robots block
  if (sampleUrls.length > 0) {
    const urlsToCheck = sampleUrls.slice(0, 3);
    const checks = await Promise.allSettled(
      urlsToCheck.map(async (u) => {
        try {
          const r = await fetch(u, {
            method: 'HEAD',
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0)' },
            signal: AbortSignal.timeout(4000)
          });
          return { url: u, status: r.status, ok: r.ok };
        } catch (e) {
          return { url: u, status: 'TIMEOUT', ok: false };
        }
      })
    );

    sampledUrlChecks = checks.map(c => (c.status === 'fulfilled' ? c.value : { url: 'unknown', status: 'ERR', ok: false }));
  }

  // Scoring logic
  let score = 0;
  let status = 'Fail';
  let explanation = 'No valid XML sitemap found.';
  let fix = 'Generate an XML sitemap and reference it in robots.txt with the Sitemap: directive.';

  if (sitemapUrlChecked) {
    let baseScore = declaredUrl ? 80 : 60;

    if (hasLastMod || isSitemapIndex) baseScore += 10;
    if (urlCount > 0) baseScore += 10;

    score = Math.min(100, baseScore);

    if (declaredUrl) {
      status = 'Pass';
      explanation = `Valid XML sitemap found with ${urlCount} discovered URLs, properly declared in robots.txt.`;
      fix = 'Maintain sitemap freshness by updating <lastmod> timestamps upon content publishing.';
    } else {
      status = 'Partial';
      explanation = `XML sitemap found at ${sitemapUrlChecked}, but missing from robots.txt.`;
      fix = `Add "Sitemap: ${sitemapUrlChecked}" to your robots.txt file so all crawlers discover it immediately.`;
    }

    if (sampledUrlChecks.some(c => !c.ok)) {
      score = Math.max(40, score - 20);
      explanation += ' Note: Some sampled sitemap URLs returned HTTP errors.';
      fix = 'Remove broken or redirecting URLs from your XML sitemap.';
    }
  }

  return {
    score,
    status,
    explanation,
    fix,
    sitemapUrlChecked,
    urlCount,
    auditedUrlFound,
    hasLastMod,
    lastmodFreshness,
    isSitemapIndex,
    childSitemaps,
    sampleUrls,
    sampledUrlChecks,
    extensions,
    priorityUsageCount,
    changefreqUsageCount,
    declaredInRobots: !!declaredUrl,
    rawXmlSnippet,
    dataVerifiedAt: timestamp
  };
}
