'use client';
/**
 * CrawlerAccessTab.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the full AI Bot Access Matrix grouped by taxonomy type.
 * Shows every crawler tested with status, operator, role, and matched rule.
 */

import styles from '../page.module.css';

const TAXONOMY_ORDER = [
  'Search / Citation Indexing',
  'On-Demand Live User Fetch',
  'Search Engine',
  'Control Token (No HTTP Log Traffic)',
  'Model Training Crawl',
];

const TAXONOMY_LABELS = {
  'Search / Citation Indexing': {
    label: 'AI Search & Citation Indexers',
    emoji: '🔍',
    why: 'These bots index your content to power AI-generated answers and citations. Blocking them removes you from ChatGPT, Perplexity, and Claude search results.',
    critical: true,
  },
  'On-Demand Live User Fetch': {
    label: 'Live User Fetch Agents',
    emoji: '⚡',
    why: 'Triggered in real-time when a user references your URL in an AI chat. Blocking these means agents cannot read your page on demand.',
    critical: true,
  },
  'Search Engine': {
    label: 'Traditional Search Engines',
    emoji: '🌐',
    why: 'Classic web indexers. AI Overviews (Google), Copilot (Bing), and Spotlight (Apple) depend on these crawlers.',
    critical: true,
  },
  'Control Token (No HTTP Log Traffic)': {
    label: 'AI Training Control Tokens',
    emoji: '🔒',
    why: `These are meta-directives that control whether your content is used for AI model training. They do not crawl your site — they are checked server-side. Blocking does NOT affect live AI answers.`,
    critical: false,
  },
  'Model Training Crawl': {
    label: 'Model Training Crawlers',
    emoji: '🧠',
    why: 'These crawl for dataset collection to train future AI models. Blocking has NO effect on current AI citations or live answers.',
    critical: false,
  },
};

function StatusPill({ status, styles }) {
  const isAllow = status === 'ALLOW';
  const isBlock = status === 'DISALLOW' || status === 'BLOCKED' || status === 'Block';
  const isPartial = status === 'PARTIAL';
  const className = isAllow ? styles.pillAllow : isBlock ? styles.pillBlock : styles.pillPartial;
  const label = isAllow ? 'Allowed' : isBlock ? 'Blocked' : isPartial ? 'Partial' : status;
  return <span className={`${styles.pill} ${className}`}>{label}</span>;
}

function formatScanTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export default function CrawlerAccessTab({ result, styles: externalStyles }) {
  const s = externalStyles || styles;
  const botMatrix = result?.signals?.robots?.botMatrix || [];
  const scannedAt = result?.scannedAt;

  // Group bots by taxonomy type
  const grouped = {};
  for (const bot of botMatrix) {
    const key = bot.taxonomyType || 'Model Training Crawl';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(bot);
  }

  // Summary counts
  const allowCount = botMatrix.filter(b => b.status === 'ALLOW').length;
  const blockCount = botMatrix.filter(b => b.status === 'DISALLOW' || b.status === 'BLOCKED').length;
  const partialCount = botMatrix.filter(b => b.status === 'PARTIAL').length;
  const criticalBlocked = botMatrix.filter(b => b.criticalForVisibility && (b.status === 'DISALLOW' || b.status === 'BLOCKED'));

  return (
    <div className={`${s.section} ${s.sectionActive}`} id="crawl">
      {/* Summary strip */}
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h3>AI Bot Access Summary</h3>
          <span className={s.verified}>read from /robots.txt · verified {formatScanTime(scannedAt)}</span>
        </div>
        <div className={s.panelBody}>
          <p className={s.panelNote}>
            Googlebot access does <strong>not</strong> imply AI-crawler access. These are completely independent gates. This tool checks each bot directly against the live robots.txt — {botMatrix.length} bots tested.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ flex: 1, minWidth: '120px', padding: '16px', background: 'rgba(34,197,94,0.08)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--visible)' }}>{allowCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Allowed</div>
            </div>
            <div style={{ flex: 1, minWidth: '120px', padding: '16px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--block)' }}>{blockCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Blocked</div>
            </div>
            <div style={{ flex: 1, minWidth: '120px', padding: '16px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warn)' }}>{partialCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Partial</div>
            </div>
            <div style={{ flex: 1, minWidth: '120px', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>{botMatrix.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>Bots Tested</div>
            </div>
          </div>

          {criticalBlocked.length > 0 && (
            <div className={s.conflict} style={{ marginBottom: '16px' }}>
              <div className={s.conflictTitle}>⚠ Critical Visibility Blockers Detected</div>
              <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--ink)' }}>
                The following bots are blocked, which will remove your site from AI search results and live agent answers:
                {' '}<strong>{criticalBlocked.map(b => b.name).join(', ')}</strong>
              </div>
              <div className={s.conflictEvidence}>
                Fix: Remove Disallow rules for these bots in robots.txt or add explicit Allow: / directives.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grouped bot tables */}
      {TAXONOMY_ORDER.map(taxonomyType => {
        const bots = grouped[taxonomyType];
        if (!bots || bots.length === 0) return null;
        const meta = TAXONOMY_LABELS[taxonomyType] || { label: taxonomyType, emoji: '🤖', why: '', critical: false };

        return (
          <div key={taxonomyType} className={s.panel}>
            <div className={s.panelHead}>
              <h3>{meta.emoji} {meta.label}</h3>
              <span className={s.verified}>{bots.length} bot{bots.length !== 1 ? 's' : ''} tested</span>
            </div>
            <div className={s.panelBody}>
              {meta.why && (
                <p className={s.panelNote}>
                  {meta.critical && <span style={{ color: 'var(--block)', fontWeight: 600, marginRight: '4px' }}>Critical for AI visibility.</span>}
                  {meta.why}
                </p>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Bot / User-Agent</th>
                      <th>Operator</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Rule Matched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.map(bot => (
                      <tr key={bot.name}>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '12.5px' }}>{bot.name}</div>
                          {bot.criticalForVisibility && (
                            <div style={{ fontSize: '10px', color: 'var(--block)', marginTop: '2px' }}>★ Critical for AI visibility</div>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{bot.operator}</td>
                        <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>{bot.role}</td>
                        <td>
                          <StatusPill status={bot.status} styles={s} />
                        </td>
                        <td className={s.urlCell} style={{ fontSize: '11px' }}>
                          {bot.matchedRule || bot.ruleApplied || 'No matching rule'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Raw robots.txt */}
      {result?.signals?.robots?.rawContent && (
        <div className={s.panel}>
          <div className={s.panelHead}><h3>Raw robots.txt</h3></div>
          <div className={s.panelBody}>
            <details className={s.rawDetails}>
              <summary>View raw robots.txt content</summary>
              <div className={s.rawContent}>{result.signals.robots.rawContent}</div>
            </details>
          </div>
        </div>
      )}

      {/* Sitemap health */}
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h3>Sitemap Health</h3>
          <span className={s.verified}>verified {formatScanTime(scannedAt)}</span>
        </div>
        <div className={s.panelBody}>
          <table className={s.table}>
            <thead><tr><th>Check</th><th>Result</th></tr></thead>
            <tbody>
              <tr>
                <td>Sitemap URL</td>
                <td className={s.urlCell}>{result?.signals?.sitemap?.sitemapUrlChecked || 'Not found'}</td>
              </tr>
              <tr>
                <td>Total URLs declared</td>
                <td className={s.urlCell}>{result?.signals?.sitemap?.urlCount ?? '—'}</td>
              </tr>
              <tr>
                <td>Sampled URLs (200 OK)</td>
                <td>
                  <span className={`${s.statusDot} ${s.statusPass}`}></span>
                  {result?.signals?.sitemap?.sampledUrlChecks?.filter(c => c.ok).length ?? 0} / {result?.signals?.sitemap?.sampledUrlChecks?.length ?? 0}
                </td>
              </tr>
              <tr>
                <td>HTTP Error/Timeout (Sampled)</td>
                <td>
                  <span className={`${s.statusDot} ${result?.signals?.sitemap?.sampledUrlChecks?.some(c => !c.ok) ? s.statusFail : s.statusPass}`}></span>
                  {result?.signals?.sitemap?.sampledUrlChecks?.filter(c => !c.ok).length ?? 0}
                </td>
              </tr>
              <tr>
                <td>Stale lastmod (&gt;6mo)</td>
                <td>
                  <span className={`${s.statusDot} ${result?.signals?.sitemap?.lastmodFreshness?.staleCount > 0 ? s.statusWarn : s.statusPass}`}></span>
                  {result?.signals?.sitemap?.lastmodFreshness?.staleCount ?? 0}
                </td>
              </tr>
              <tr>
                <td>Referenced in robots.txt</td>
                <td>
                  <span className={`${s.statusDot} ${result?.signals?.sitemap?.declaredInRobots ? s.statusPass : s.statusWarn}`}></span>
                  {result?.signals?.sitemap?.declaredInRobots ? 'Yes' : 'No'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
