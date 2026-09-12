import Link from 'next/link';
import styles from './page.module.css';
import { glossaryData } from '../../data/glossaryData';

export const metadata = {
  title: 'Glossary - AI Visibility Auditor',
  description: 'A comprehensive, beginner-friendly A-Z guide to AI visibility metrics, crawlers, and Answer Engine Optimization (AEO) concepts.',
};

export default function GlossaryPage() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Group glossary terms by starting letter
  const groupedTerms = glossaryData.reduce((acc, item) => {
    const letter = item.letter.toUpperCase();
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.glossaryWrap}>
      <Link href="/" className={styles.backLink}>
        ← Back to Auditor
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>The Comprehensive A-Z Glossary to AI SEO</h1>
        <p className={styles.subtitle}>
          No technical background required. Understand exactly what AI engines look for, what these terms mean in plain English, and what benchmarks you should aim for.
        </p>
      </header>

      {/* A-Z Jump Navigation */}
      <div className={styles.azNav}>
        {alphabet.map((letter) => {
          const hasTerms = groupedTerms[letter] && groupedTerms[letter].length > 0;
          return (
            <a 
              key={letter} 
              href={hasTerms ? `#letter-${letter}` : undefined} 
              className={`${styles.azLetter} ${!hasTerms ? styles.azLetterDisabled : ''}`}
            >
              {letter}
            </a>
          );
        })}
      </div>

      <div className={styles.glossaryContent}>
        {alphabet.map((letter) => {
          const terms = groupedTerms[letter];
          if (!terms || terms.length === 0) return null;

          return (
            <div key={letter} id={`letter-${letter}`} className={styles.letterSection}>
              <h2 className={styles.letterHeading}>{letter}</h2>
              <div className={styles.termList}>
                {terms.map((t) => (
                  <div key={t.id} className={styles.card}>
                    <div className={styles.term}>
                      {t.term}
                    </div>
                    <div className={styles.categoryBadge}>{t.category}</div>
                    
                    <div className={styles.section}>
                      <span className={styles.sectionLabel}>Definition</span>
                      <p className={styles.sectionText}>{t.definition}</p>
                    </div>

                    <div className={styles.section}>
                      <span className={styles.sectionLabel}>Why it matters</span>
                      <p className={styles.sectionText}><span className={styles.highlight}>{t.importance}</span></p>
                    </div>

                    <div className={styles.baseline}>
                      🎯 Baseline / Good Score: {t.goodScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <footer className={styles.footer}>
        Built by <a href="https://thehubcontent.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>The Hub Content</a>
      </footer>
    </div>
  );
}
