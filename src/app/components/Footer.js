'use client';

import Link from 'next/link';

const footerLinks = [
  {
    heading: 'By Industry',
    links: [
      { label: 'AI Visibility for Ecommerce', href: '/ecommerce' },
      { label: 'AI Visibility for B2B', href: '/b2b' },
      { label: 'AI Visibility for B2C', href: '/b2c' },
      { label: 'AI Visibility for DTC Brands', href: '/dtc' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Glossary / Knowledgebase', href: '/glossary' },
      { label: 'LLMs.txt Standard', href: '/llms.txt' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'The Hub Content', href: 'https://thehubcontent.com', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--bg)',
        padding: '48px 24px 32px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Link grid */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}
      >
        {footerLinks.map((col) => (
          <div key={col.heading}>
            <div
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: '12px',
              }}
            >
              {col.heading}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-soft)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-soft)')}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-soft)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          borderTop: '1px solid var(--line)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
          © {new Date().getFullYear()} The Hub Content · AI Visibility Checker
        </span>
        <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
          Built for Answer Engine Optimization (AEO)
        </span>
      </div>
    </footer>
  );
}
