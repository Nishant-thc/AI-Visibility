import { NextResponse } from 'next/server';

function classifyUrl(urlStr, domain) {
  try {
    const u = new URL(urlStr);
    const path = u.pathname.toLowerCase();
    
    // Explicitly check for homepage
    if (path === '/' || path === '') return 'Homepage';
    
    if (path.includes('/category/') || path.includes('/collections/') || path.includes('/shop/') || path.includes('/c/')) {
      return 'Category';
    }
    if (path.includes('/blog/') || path.includes('/blogs/') || path.includes('/news/') || path.includes('/article/') || path.includes('/post/')) {
      return 'Article';
    }
    if (path.includes('/p/') || path.includes('/product/') || path.includes('/products/') || path.includes('/item/')) {
      return 'Product';
    }
    return 'Other';
  } catch(e) {
    return 'Other';
  }
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let domain = url.trim().toLowerCase();
    if (!domain.startsWith('http')) domain = 'https://' + domain;
    try {
      const u = new URL(domain);
      domain = u.origin;
    } catch(e) {
      return NextResponse.json({ error: 'Invalid URL formatting' }, { status: 400 });
    }

    const pathsToTry = [`${domain}/sitemap.xml`, `${domain}/sitemap_index.xml`, `${domain}/wp-sitemap.xml`];
    let allLocs = [];

    for (const sitemapUrl of pathsToTry) {
      try {
        const res = await fetch(sitemapUrl, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0)' },
          signal: AbortSignal.timeout(5000) 
        });
        
        if (res.ok) {
          const text = await res.text();
          const locMatches = text.match(/<loc>\s*(.*?)\s*<\/loc>/gi) || [];
          allLocs = locMatches
            .map(m => m.replace(/<\/?loc>/gi, '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim())
            .filter(u => u.startsWith('http'));
          
          // If it's a sitemap index, fetch up to 25 child sitemaps to get real URLs
          if (text.includes('<sitemapindex') && allLocs.length > 0) {
             const childLocsAggr = [];
             const childUrlsToFetch = allLocs.slice(0, 25);
             
             // Fetch in parallel
             const promises = childUrlsToFetch.map(async (childUrl) => {
               try {
                  const childRes = await fetch(childUrl, { 
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; THC-AiVisibilityBot/1.0)' },
                    signal: AbortSignal.timeout(5000) 
                  });
                  if (childRes.ok) {
                    const childText = await childRes.text();
                    const childLocs = childText.match(/<loc>\s*(.*?)\s*<\/loc>/gi) || [];
                    return childLocs
                      .map(m => m.replace(/<\/?loc>/gi, '').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim())
                      .filter(u => u.startsWith('http'));
                  }
               } catch(e) {}
               return [];
             });

             const results = await Promise.all(promises);
             results.forEach(arr => {
               childLocsAggr.push(...arr);
             });
             
             if (childLocsAggr.length > 0) allLocs = Array.from(new Set(childLocsAggr));
          }
          break; 
        }
      } catch(e) {}
    }

    // Categorize
    const categorized = {
      Homepage: null,
      Category: null,
      Article: null,
      Product: null,
      Other: null
    };

    categorized.Homepage = domain; // Always test the homepage

    if (allLocs.length > 0) {
      for (const u of allLocs) {
         const type = classifyUrl(u, domain);
         if (type !== 'Homepage' && !categorized[type]) {
           categorized[type] = u;
         }
      }
    }

    const finalUrls = [];
    Object.keys(categorized).forEach(type => {
      if (categorized[type]) {
        finalUrls.push({ url: categorized[type], type });
      }
    });

    return NextResponse.json({ domain, urls: finalUrls });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
