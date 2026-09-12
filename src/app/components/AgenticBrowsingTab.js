'use client';
/**
 * AgenticBrowsingTab.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the standalone Agentic Browsing Score tab.
 * Shows signal table, score breakdown, and prioritized opportunities.
 */

import styles from '../page.module.css';

function formatScanTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function VerdictBadge({ verdict }) {
  const config = {
    good: { label: 'Good', bg: 'rgba(34,197,94,0.12)', color: 'var(--visible)', border: 'rgba(34,197,94,0.4)' },
    'needs-work': { label: 'Needs Work', bg: 'rgba(245,158,11,0.12)', color: 'var(--warn)', border: 'rgba(245,158,11,0.4)' },
    poor: { label: 'Poor', bg: 'rgba(239,68,68,0.08)', color: 'var(--block)', border: 'rgba(239,68,68,0.3)' },
    critical: { label: 'Critical', bg: 'rgba(239,68,68,0.12)', color: 'var(--block)', border: 'rgba(239,68,68,0.5)' },
    unknown: { label: 'No Data', bg: 'var(--bg)', color: 'var(--ink-soft)', border: 'var(--line)' },
  };
  const c = config[verdict] || config.unknown;
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

function ScoreArc({ score, grade }) {
  const color = score >= 80 ? 'var(--visible)' : score >= 60 ? 'var(--warn)' : 'var(--block)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 32px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: '56px', fontWeight: 800, color, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
        {score ?? '—'}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>/ 100</div>
      <div style={{ marginTop: '12px', padding: '4px 16px', background: color, color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
        Grade {grade}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    P0: { bg: 'rgba(239,68,68,0.12)', color: 'var(--block)', border: 'rgba(239,68,68,0.4)' },
    P1: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warn)', border: 'rgba(245,158,11,0.4)' },
    P2: { bg: 'var(--bg)', color: 'var(--ink-soft)', border: 'var(--line)' },
  };
  const c = colors[priority] || colors.P2;
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {priority}
    </span>
  );
}

import { useState } from 'react';

export default function AgenticBrowsingTab({ result, styles: externalStyles }) {
  const [showDeepScanInfo, setShowDeepScanInfo] = useState(false);
  const s = externalStyles || styles;
  const agentic = result?.signals?.agenticBrowsing;

  if (!agentic) {
    return (
      <div className={`${s.section} ${s.sectionActive}`} id="agentic">
        <div className={s.panel}>
          <div className={s.panelBody}>
            <p className={s.panelNote}>Agentic Browsing data is not available yet. Re-run the audit to generate this report.</p>
          </div>
        </div>
      </div>
    );
  }

  const { score, grade, verdict, description, signals = [], opportunities = [], scoreBreakdown = {}, apiAvailable } = agentic;

  return (
    <div className={`${s.section} ${s.sectionActive}`} id="agentic">
      {/* Score hero */}
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h3>Agentic Browsing Score</h3>
          <span className={s.verified}>composite score · verified {formatScanTime(result?.scannedAt)}</span>
        </div>
        <div className={s.panelBody}>
          <p className={s.panelNote}>
            Measures how reliably autonomous AI agents (ChatGPT Browsing, Perplexity Live, Claude Computer Use, Bing Copilot) can <strong>reach, parse, and extract</strong> content from this page. This is a standalone diagnostic — separate from your main THC score.
          </p>

          {!apiAvailable && (
            <div className={s.conflict} style={{ marginBottom: '16px', background: 'rgba(245,158,11,0.06)', borderLeft: '3px solid var(--warn)' }}>
              <div className={s.conflictTitle} style={{ color: 'var(--warn)' }}>⚠ Limited Data — PageSpeed API not configured</div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--ink-soft)' }}>
                Score is based on HTML and robots.txt signals only. Add a PAGESPEED_API_KEY to .env.local for full signal coverage (TTFB, TTI, TBT, DOM size).
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <ScoreArc score={score} grade={grade} />
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                {verdict}
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '20px' }}>
                {description}
              </div>
              {/* Score breakdown bars */}
              {Object.values(scoreBreakdown).map((cat, i) => {
                const pct = Math.round((cat.score / cat.maxScore) * 100);
                const color = pct >= 80 ? 'var(--visible)' : pct >= 50 ? 'var(--warn)' : 'var(--block)';
                return (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                      <span>{cat.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>{cat.score} / {cat.maxScore}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', border: '1px solid var(--line)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Signal table */}
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h3>Agentic Signal Breakdown</h3>
          <span className={s.verified}>{signals.length} signals evaluated</span>
        </div>
        <div className={s.panelBody}>
          <p className={s.panelNote}>
            Each signal is evaluated against thresholds calibrated for autonomous AI agents — not human browsers. Agent thresholds are stricter because agents have no tolerance for latency or hidden content.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>What it measures</th>
                  <th>Measured</th>
                  <th>Agent Target</th>
                  <th>Verdict</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {signals.map(sig => (
                  <tr key={sig.id}>
                    <td style={{ fontWeight: 600, fontSize: '12.5px' }}>{sig.label}</td>
                    <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>{sig.sublabel}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{sig.measured}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--ink-faint)' }}>{sig.target}</td>
                    <td><VerdictBadge verdict={sig.verdict} /></td>
                    <td style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{sig.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Opportunity analysis */}
      {opportunities.length > 0 && (
        <div className={s.panel}>
          <div className={s.panelHead}>
            <h3>Agentic Opportunity Analysis</h3>
            <span className={s.verified}>{opportunities.length} improvement{opportunities.length !== 1 ? 's' : ''} identified</span>
          </div>
          <div className={s.panelBody}>
            <p className={s.panelNote}>
              P0 issues prevent agents from reading the page at all. P1 issues reduce content comprehension quality. P2 issues are best-practice optimizations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {opportunities.map((opp, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', borderLeft: `3px solid ${opp.priority === 'P0' ? 'var(--block)' : opp.priority === 'P1' ? 'var(--warn)' : 'var(--ink-soft)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <PriorityBadge priority={opp.priority} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{opp.signal}</div>
                    <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--ink-faint)', background: 'var(--paper)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                      Effort: {opp.effort}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '10px' }}>
                    <span>Measured: <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{opp.measured}</strong></span>
                    <span>Target: <strong style={{ color: 'var(--visible)', fontFamily: 'var(--font-mono)' }}>{opp.target}</strong></span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.5 }}>
                    <strong>Why it matters:</strong> {opp.impact}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: 1.5, padding: '8px 12px', background: 'var(--paper)', borderRadius: '4px', borderLeft: '2px solid var(--line)' }}>
                    <strong>Fix:</strong> {opp.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {opportunities.length === 0 && (
        <div className={s.panel}>
          <div className={s.panelBody}>
            <p className={s.panelNote} style={{ textAlign: 'center', padding: '20px 0' }}>
              ✓ No critical agentic browsing issues detected. This page is well-optimized for AI agent access.
            </p>
          </div>
        </div>
      )}

      {/* Semantic Analysis (V2 Free-Free NLP) */}
      {result?.signals?.html?.semantics && (
        <div className={s.panel}>
          <div className={s.panelHead}>
            <h3>Semantic AI Analysis</h3>
            <span className={s.verified}>via server-side NLP</span>
          </div>
          <div className={s.panelBody}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <div style={{ flex: 1, padding: '16px', background: 'var(--paper)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '4px' }}>Entity Density</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.signals.html.semantics.entityDensity} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>/ 1k words</span></div>
              </div>
              <div style={{ flex: 1, padding: '16px', background: 'var(--paper)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '4px' }}>Readability Score</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.signals.html.semantics.readabilityScore || 'N/A'}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '8px' }}>Top Extracted Entities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.signals.html.semantics.topEntities.map((entity, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '16px', fontSize: '12px' }}>{entity}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>Deep Scan (Client-Side AI)</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ink-soft)' }}>Run a lightweight LLM directly in your browser to score semantic relevance. (100% Free)</p>
                </div>
                <button 
                  onClick={() => setShowDeepScanInfo(!showDeepScanInfo)}
                  style={{ padding: '8px 16px', background: showDeepScanInfo ? 'transparent' : 'var(--ink)', color: showDeepScanInfo ? 'var(--ink)' : 'var(--bg)', border: showDeepScanInfo ? '1px solid var(--line)' : 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  {showDeepScanInfo ? 'Close' : 'Run Deep Scan'}
                </button>
              </div>
              
              {showDeepScanInfo && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(34,197,94,0.2)', fontSize: '13px', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <strong>Coming Soon!</strong> The Deep Scan feature will download a lightweight, open-source embedding model (like Xenova/bge-small) directly into your browser cache.
                  </p>
                  <p style={{ margin: '0 0 12px 0' }}>
                    Instead of sending your data to expensive third-party APIs, this allows us to perform advanced semantic chunking and relevance scoring locally on your device for free.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warn)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                    Feature is currently in development.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
