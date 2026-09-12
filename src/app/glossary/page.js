import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Glossary - AI Visibility Auditor',
  description: 'A beginner-friendly guide to AI visibility metrics, crawlers, and concepts.',
};

export default function GlossaryPage() {
  const terms = [
    {
      term: 'Agentic Browsing',
      icon: '🤖',
      layman: 'Instead of just reading a static database, an AI acts like a human browsing the web. It actively clicks links, reads pages, and gathers live information to answer a user\'s question.',
      calculation: 'This isn\'t a number, but a capability. Our tool checks if your server is fast enough and your code is clean enough for these AI agents to read your site without giving up.',
      importance: 'High. If an AI (like Perplexity or ChatGPT) tries to "browse" your site to answer a user\'s question and fails, you lose that citation entirely.',
      baseline: 'Ensure your site doesn\'t block AI bots in robots.txt and loads in under 3 seconds.'
    },
    {
      term: 'Robots.txt & AI Crawlers',
      icon: '🛑',
      layman: 'A simple text file on your website that acts like a "Do Not Enter" sign for web robots. You can tell specific AI bots (like OpenAI or Google) whether they are allowed to read your site or not.',
      calculation: 'Our tool scans your robots.txt file to see if you have explicitly blocked any of the 14 major AI bots (like OAI-SearchBot or ClaudeBot).',
      importance: 'Critical. If you block an AI\'s search bot, it literally cannot read your website, meaning you will never show up in their live search answers.',
      baseline: '0 Critical Bots Blocked (unless you intentionally want to hide from AI).'
    },
    {
      term: 'LLMs.txt',
      icon: '📝',
      layman: 'A new trend where websites create a special, stripped-down text file that contains all their important information perfectly formatted for an AI to read, skipping all the messy website code.',
      calculation: 'The tool checks if `yourwebsite.com/llms.txt` exists and if it contains readable links.',
      importance: 'Medium-High. It acts like a red carpet for AI. It makes it incredibly cheap and easy for AI to understand your entire website in seconds.',
      baseline: 'Having the file exist with at least 1 valid link.'
    },
    {
      term: 'Schema (Structured Data)',
      icon: '🏗️',
      layman: 'Hidden code on your website that spoon-feeds facts to AI. Instead of making the AI guess what your page is about, Schema explicitly says "This is a Recipe, it takes 30 minutes, and has 500 calories."',
      calculation: 'Our tool looks for JSON-LD code (the standard format for Schema) hidden in your website\'s HTML and counts how many distinct "items" or facts are defined.',
      importance: 'Very High. AI engines (especially Google AI Overviews) heavily rely on this hidden code to instantly understand facts without having to read your paragraphs.',
      baseline: 'At least 1 valid Schema type (like Article, Product, or Organization).'
    },
    {
      term: 'Entity & Entity Density',
      icon: '👤',
      layman: 'An "Entity" is simply a specific noun: a person, a place, a brand, or a concept (e.g., "Elon Musk", "Paris", "Artificial Intelligence"). "Density" is just how many of these specific nouns you use in your writing.',
      calculation: 'Our AI scans your text, highlights every recognized real-world noun, and divides that by your total word count.',
      importance: 'High. AI doesn\'t read words; it connects concepts. If your text is full of vague words ("these things are great") instead of concrete entities ("Apple iPhones are fast"), the AI won\'t know what you are talking about.',
      baseline: 'Good Entity Density is around 10% to 15%. This means every 10th word is a concrete, recognizable noun.'
    },
    {
      term: 'Readability (Flesch Score)',
      icon: '📖',
      layman: 'A grade that tells you how easy your text is to read. It punishes you for using massive words and never-ending sentences.',
      calculation: 'A mathematical formula based on the average number of syllables per word and the average number of words per sentence.',
      importance: 'Medium. AI breaks your text into small chunks to store it. If your sentences are incredibly long and complex, the AI struggles to chunk it properly, leading to confused answers.',
      baseline: 'A score of 60 to 80 is perfect. It means your text is conversational and easy for an 8th-grader (and an AI) to understand.'
    },
    {
      term: 'Heading Hierarchy',
      icon: '📑',
      layman: 'Using your Title tags (H1, H2, H3) in the correct order, like an outline in a book. You shouldn\'t jump from a Main Chapter (H1) straight to a sub-sub-bullet point (H4).',
      calculation: 'The tool scans your headings and flags an error if you skip a level (e.g., going from H2 to H4 without an H3 in between).',
      importance: 'Medium. AI uses your headings to understand what a section is about. If the headings are out of order, the AI gets lost and might attribute information to the wrong topic.',
      baseline: '0 Level Skips. Always move sequentially (H1 → H2 → H3).'
    },
    {
      term: 'JavaScript Dependency',
      icon: '⚙️',
      layman: 'Some websites are completely blank until the user\'s browser runs code (JavaScript) to draw the text on the screen. The problem? Many AI bots don\'t run JavaScript.',
      calculation: 'Our tool downloads the raw code of your site (without running JS) and compares it to the final visible site. If a lot of text is missing in the raw code, you have a high dependency.',
      importance: 'Critical. If your text requires JavaScript to appear, an AI crawler will just see a blank page and leave.',
      baseline: 'Under 25% dependency. Essential text should be visible instantly without code execution.'
    },
    {
      term: 'TTFB (Time to First Byte)',
      icon: '⚡',
      layman: 'The exact amount of time it takes for your website\'s server to "wake up" and send the very first piece of data after a bot knocks on the door.',
      calculation: 'Measured in milliseconds (ms) by pinging your server and waiting for a response.',
      importance: 'High. AI bots are impatient. If your server takes more than 1 or 2 seconds just to wake up, the bot will assume the site is broken and time out.',
      baseline: 'A good TTFB is under 800ms. An excellent TTFB is under 200ms.'
    },
    {
      term: 'Core Web Vitals (LCP, CLS, TBT)',
      icon: '🚦',
      layman: 'Google\'s official grading system for how fast and smooth a website feels to a human. LCP measures how fast the biggest image loads. CLS measures if the screen jumps around. TBT measures if the site freezes.',
      calculation: 'Google simulates loading your site on a slow mobile phone and measures exactly when pixels appear on the screen.',
      importance: 'Medium. While this is primarily for humans and Google Search, extremely poor scores usually mean the site is bloated, which will cause AI bots to abandon the crawl.',
      baseline: 'LCP (Largest text/image) should appear in under 2.5 seconds.'
    }
  ];

  return (
    <div className={styles.glossaryWrap}>
      <Link href="/" className={styles.backLink}>
        ← Back to Auditor
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>The Beginner\'s Glossary to AI SEO</h1>
        <p className={styles.subtitle}>
          No technical background required. Understand exactly what AI engines look for, what these terms mean in plain English, and what numbers you should aim for.
        </p>
      </header>

      <div className={styles.grid}>
        {terms.map((t, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.term}>
              <span>{t.icon}</span>
              {t.term}
            </div>
            
            <div className={styles.section}>
              <span className={styles.sectionLabel}>The Layman Definition</span>
              <p className={styles.sectionText}>{t.layman}</p>
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>How the tool calculates it</span>
              <p className={styles.sectionText}>{t.calculation}</p>
            </div>

            <div className={styles.section}>
              <span className={styles.sectionLabel}>Why it matters</span>
              <p className={styles.sectionText}><span className={styles.highlight}>{t.importance}</span></p>
            </div>

            <div className={styles.baseline}>
              🎯 Baseline: {t.baseline}
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        Built by <a href="https://thehubcontent.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>The Hub Content</a>
      </footer>
    </div>
  );
}
