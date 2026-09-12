import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Glossary - AI Visibility Auditor',
  description: 'Knowledgebase and definitions for AI visibility metrics, crawlers, and concepts.',
};

export default function GlossaryPage() {
  const terms = [
    {
      term: 'Agentic Browsing',
      def: 'The ability of AI models (like Perplexity or ChatGPT) to autonomously fetch, render, and read live web pages to ground their answers in real-time information instead of relying solely on their pre-trained weights.',
      icon: '🤖'
    },
    {
      term: 'Entity Density',
      def: 'The ratio of recognized real-world entities (people, places, brands, concepts) to total words in a text. High entity density helps AI Knowledge Graphs understand the semantic topic of the page better.',
      icon: '📊'
    },
    {
      term: 'Flesch Reading Ease',
      def: 'A standard NLP metric that scores text readability based on syllable count and sentence length. AI systems prefer conversational, easily digestible text (scores 60-80) for chunking and vector storage.',
      icon: '📖'
    },
    {
      term: 'JSON-LD / Schema @id',
      def: 'A structured data format used to declare facts about a page. The "@id" attribute acts as a unique identifier for an entity, allowing AI Knowledge Graphs to connect disparate pieces of information unambiguously.',
      icon: '🔗'
    },
    {
      term: 'LLMs.txt',
      def: 'An emerging standard (similar to robots.txt) where sites publish a clean, markdown-formatted directory of their documentation specifically designed for Large Language Models to consume efficiently.',
      icon: '📝'
    },
    {
      term: 'RAG (Retrieval-Augmented Generation)',
      def: 'A framework where an AI first searches a database or the internet to retrieve relevant facts, and then uses those facts to generate an accurate, grounded answer with citations.',
      icon: '🔍'
    },
    {
      term: 'Semantic Chunking',
      def: 'The process of breaking a large document into smaller, meaningful pieces (chunks) so that a vector database can index them accurately. Poor heading hierarchy breaks semantic chunking.',
      icon: '🧩'
    },
    {
      term: 'TTFB (Time to First Byte)',
      def: 'The time it takes for a web server to send the very first byte of data after receiving a request. AI bots often have strict 5 to 10-second timeouts, so a high TTFB can cause the AI to abandon the crawl.',
      icon: '⚡'
    }
  ];

  return (
    <div className={styles.glossaryWrap}>
      <Link href="/" className={styles.backLink}>
        ← Back to Auditor
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>Knowledgebase &amp; Glossary</h1>
        <p className={styles.subtitle}>
          Understand the technical concepts, crawler behaviors, and metrics evaluated by the AI Visibility tool.
        </p>
      </header>

      <div className={styles.grid}>
        {terms.map((t, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.term}>
              <span>{t.icon}</span>
              {t.term}
            </div>
            <p className={styles.definition}>
              {t.def}
            </p>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        Built by <a href="https://thehubcontent.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>The Hub Content</a>
      </footer>
    </div>
  );
}
