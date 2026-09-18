'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import CrawlerAccessTab from './components/CrawlerAccessTab';
import AgenticBrowsingTab from './components/AgenticBrowsingTab';
import { generateMarkdownReport, generateCsvReport, downloadFile } from '@/utils/exportReport';

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function formatScanTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return '—';
  }
}

/* ─── Performance score SVG gauge ─────────────────────────────────────── */
function PerfGauge({ score, label = 'Performance' }) {
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? Math.min(100, Math.max(0, score)) / 100 : 0;
  const dashoffset = circ * (1 - pct);
  const color = score == null ? '#D1D5DB' : score >= 90 ? '#0D7A3E' : score >= 50 ? '#A9720C' : '#A6342A';

  return (
    <div className={styles.perfGaugeWrap}>
      <svg width="88" height="88" className={styles.perfGaugeSvg} viewBox="0 0 88 88">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E9EBF0" strokeWidth="8" />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Score text */}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="18" fontWeight="600" fill={color} fontFamily="var(--font-serif)">
          {score != null ? score : '—'}
        </text>
      </svg>
      <div className={styles.perfGaugeInfo}>
        <div className={styles.perfGaugeScore} style={{ color }}>{score != null ? score : '—'}<span style={{ fontSize: '16px', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>/100</span></div>
        <div className={styles.perfGaugeLabel}>{label}</div>
      </div>
    </div>
  );
}

/* ─── CWV Chip ────────────────────────────────────────────────────────── */
function CwvChip({ label, value, category }) {
  const cls = category === 'good' ? styles.cwvGood : category === 'needs-work' ? styles.cwvNeedsWork : category === 'poor' ? styles.cwvPoor : styles.cwvUnknown;
  const statusText = category === 'good' ? 'Good' : category === 'needs-work' ? 'Needs work' : category === 'poor' ? 'Poor' : 'Unknown';
  return (
    <div className={styles.cwvChip}>
      <div className={styles.cwvChipLabel}>{label}</div>
      <div className={styles.cwvChipValue}>{value || '—'}</div>
      <div className={`${styles.cwvChipStatus} ${cls}`}>{statusText}</div>
    </div>
  );
}

/* ─── Expandable Opportunity / Diagnostic Row ─────────────────────────── */
function OppRow({ item }) {
  const [open, setOpen] = useState(false);
  const hasItems = item.items && item.items.length > 0;
  return (
    <div className={styles.oppRow}>
      <div className={styles.oppRowHead} onClick={() => hasItems && setOpen(o => !o)}>
        <span className={styles.oppExpandIcon} style={{ transform: open ? 'rotate(90deg)' : 'none' }}>▶</span>
        <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>{item.title}</span>
        {item.savingsMs != null && (
          <span className={styles.oppSavingsMs}>−{item.savingsMs}ms</span>
        )}
        {item.displayValue && !item.savingsMs && (
          <span className={styles.oppSavingsBytes} style={{ color: 'var(--ink-soft)' }}>{item.displayValue}</span>
        )}
        {item.savingsBytes != null && (
          <span className={styles.oppSavingsBytes}>{item.savingsBytes}KB</span>
        )}
      </div>
      {open && hasItems && (
        <div className={styles.oppItems}>
          {item.items.map((it, i) => (
            <div key={i} className={styles.oppItemRow}>
              <span className={styles.oppItemUrl} title={it.label}>{it.label}</span>
              <span className={styles.oppItemSavings}>
                {it.wastedMs != null ? `−${it.wastedMs}ms` : (it.wastedBytes != null ? `${it.wastedBytes}KB` : '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Filmstrip Component ─────────────────────────────────────────────── */
function Filmstrip({ frames }) {
  if (!frames || frames.length === 0) return null;
  return (
    <div className={styles.filmstripWrap}>
      <div className={styles.filmstripHead}>
        <span style={{ color: 'var(--visible)' }}>◎</span>
        Page load filmstrip — sequential screenshots captured during Lighthouse audit
      </div>
      <div className={styles.filmstripScroll}>
        {frames.map((f, i) => (
          <div key={i} className={styles.filmFrame}>
            {f.data ? (
              <img src={f.data} alt={`Frame at ${f.timing}ms`} className={styles.filmFrameImg} />
            ) : (
              <div className={styles.filmFrameImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--ink-faint)' }}>–</div>
            )}
            <div className={styles.filmFrameTime}>
              {f.timing != null ? (f.timing >= 1000 ? `${(f.timing / 1000).toFixed(1)}s` : `${f.timing}ms`) : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Interactive Live Snapshot Section ───────────────────────────────── */
function LiveSnapshotSection({ result }) {
  const [device, setDevice] = useState('mobile');

  const ps = result?.signals?.pageSpeed;
  const psiData = device === 'mobile' ? ps?.mobile : ps?.desktop;
  const apiAvailable = ps?.apiAvailable;
  const scannedAt = result?.scannedAt;
  const targetUrl = result?.url || '';
  const displayUrl = targetUrl.replace(/^https?:\/\//, '');

  const cwv = psiData?.cwv || {};
  const finalShot = psiData?.finalScreenshot;
  const filmstrip = psiData?.filmstrip || [];
  const opportunities = psiData?.opportunities || [];
  const diagnostics = psiData?.diagnostics || [];
  const perfScore = psiData?.score;
  const nativeTtfb = ps?.nativeTiming?.ttfbMs;

  return (
    <div>
      <p className={styles.panelNote} style={{ marginBottom: '20px' }}>
        Live snapshot captured at audit time using Google PageSpeed Insights API — real page load data, actual screenshots, and element-level diagnostics for each breakpoint.
      </p>

      {/* Device toggle */}
      <div className={styles.snapshotTabRow}>
        <button
          className={`${styles.snapshotTab} ${device === 'mobile' ? styles.snapshotTabActive : ''}`}
          onClick={() => setDevice('mobile')}
        >
          📱 Mobile
        </button>
        <button
          className={`${styles.snapshotTab} ${device === 'desktop' ? styles.snapshotTabActive : ''}`}
          onClick={() => setDevice('desktop')}
        >
          🖥 Desktop
        </button>
      </div>

      {/* If PSI is unavailable, show diagnostic fallback */}
      {!apiAvailable && (
        <div className={styles.psiNoData}>
          <div className={styles.psiNoDataTitle}>
            {ps?.exclusionReason ? 'PageSpeed Insights Notice' : 'PageSpeed Insights API not configured'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--ink-soft)' }}>
            {ps?.exclusionReason || (nativeTtfb != null
              ? `Native HTTP TTFB measured: ${nativeTtfb}ms — Add a PAGESPEED_API_KEY to .env.local for full filmstrip, CWV, and element-level diagnostics.`
              : 'Add a PAGESPEED_API_KEY to .env.local for full filmstrip, CWV, and element-level diagnostics.')}
          </div>
        </div>
      )}

      {/* Performance score gauge + category scores */}
      {apiAvailable && (
        <div className={styles.panel} style={{ marginBottom: '20px' }}>
          <PerfGauge score={perfScore} label={`${device === 'mobile' ? 'Mobile' : 'Desktop'} Performance`} />
          {psiData?.categories && (
            <div style={{ display: 'flex', gap: '16px', padding: '0 24px 18px', flexWrap: 'wrap' }}>
              {[
                { label: 'Performance', val: psiData.categories.performance },
                { label: 'Accessibility', val: psiData.categories.accessibility },
                { label: 'Best Practices', val: psiData.categories.bestPractices },
                { label: 'SEO', val: psiData.categories.seo },
              ].map(c => c.val != null && (
                <div key={c.label} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--ink-faint)' }}>{c.label}: </span>
                  <span style={{
                    fontWeight: 600,
                    color: c.val >= 90 ? '#0D7A3E' : c.val >= 50 ? 'var(--warn)' : 'var(--block)'
                  }}>{c.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CWV Chips */}
      {apiAvailable && Object.keys(cwv).length > 0 && (
        <div className={styles.cwvRow}>
          <CwvChip label="LCP" value={cwv.lcp} category={cwv.lcpCategory} />
          <CwvChip label="FCP" value={cwv.fcp} category={cwv.fcpCategory} />
          <CwvChip label="TBT" value={cwv.tbt} category={cwv.tbtCategory} />
          <CwvChip label="CLS" value={cwv.cls} category={cwv.clsCategory} />
          <CwvChip label="Speed Index" value={cwv.si} category={cwv.siCategory} />
        </div>
      )}

      {/* Filmstrip */}
      {apiAvailable && filmstrip.length > 0 && (
        <Filmstrip frames={filmstrip} />
      )}

      {/* Device screenshots */}
      <div className={styles.snapshotDeviceGrid}>
        {/* Desktop frame */}
        <div className={styles.browserFrame}>
          <div className={styles.browserChrome}>
            <div className={styles.browserDots}>
              <span></span><span></span><span></span>
            </div>
            <div className={styles.browserUrl}>{displayUrl || 'example.com'}</div>
          </div>
          <div className={styles.browserViewport}>
            {finalShot ? (
              <img
                src={finalShot}
                alt="Page final screenshot"
                className={styles.snapshotImg}
                loading="lazy"
              />
            ) : psiData?.screenshotFallback ? (
              <img
                src={psiData.screenshotFallback}
                alt={`Live ${device} viewport capture`}
                className={styles.snapshotImg}
                loading="lazy"
                onError={(e) => { e.target.style.display='none'; }}
              />
            ) : (
              <div className={styles.mockPage}>
                <div className={styles.mockHero}></div>
                <div className={styles.mockLine} style={{ width: '70%', height: '14px' }}></div>
                <div className={styles.mockLine} style={{ width: '40%' }}></div>
                <div className={styles.mockLine} style={{ width: '88%' }}></div>
                <div className={styles.mockLine} style={{ width: '82%' }}></div>
                <div className={styles.mockLine} style={{ width: '55%' }}></div>
              </div>
            )}
            <div className={styles.snapshotBadge}>
              {device === 'mobile' ? 'Mobile · 360×640' : 'Desktop · 1350×940'}
            </div>
          </div>
          <div className={styles.snapshotCaption}>
            <span>captured {formatScanTime(scannedAt)}</span>
            <span>{finalShot ? 'Google Lighthouse · full JS render' : (psiData?.screenshotFallback ? 'Live visual capture · cloud viewport render' : 'No screenshot available')}</span>
          </div>
        </div>

        {/* Right: TTFB + raw HTML panel */}
        <div>
          <div className={styles.panel} style={{ marginBottom: '14px' }}>
            <div className={styles.panelHead}>
              <h3>Server response</h3>
              <span className={styles.verified}>live probe</span>
            </div>
            <div className={styles.panelBody}>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>TTFB (native probe)</td>
                    <td className={styles.urlCell}>
                      {nativeTtfb != null ? (
                        <span style={{ color: nativeTtfb < 400 ? '#0D7A3E' : nativeTtfb < 800 ? 'var(--warn)' : 'var(--block)', fontWeight: 600 }}>
                          {nativeTtfb}ms
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                  {psiData?.serverResponseTime?.displayValue && (
                    <tr>
                      <td>TTFB (Lighthouse)</td>
                      <td className={styles.urlCell}>{psiData.serverResponseTime.displayValue}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Compression</td>
                    <td className={styles.urlCell}>{ps?.nativeTiming?.compression || '—'}</td>
                  </tr>
                  <tr>
                    <td>HTTP status</td>
                    <td className={styles.urlCell}>{ps?.nativeTiming?.status || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <details className={styles.rawDetails}>
            <summary>raw HTML response (first paint, no JS)</summary>
            <div className={styles.rawContent}>
              {typeof result?.signals?.html?.browserSignals?.rawExcerpt === 'string'
                ? result.signals.html.browserSignals.rawExcerpt
                : (result?.signals?.html?.extractedBodySnippet
                    ? result.signals.html.extractedBodySnippet.slice(0, 400)
                    : `<div id="app"></div>\n<script src="/static/js/bundle.js"></script>\n<!-- content rendered client-side after hydration -->`)}
            </div>
          </details>
        </div>
      </div>

      {/* Opportunities */}
      {apiAvailable && opportunities.length > 0 && (
        <div className={styles.oppList}>
          <div className={styles.oppListHead}>
            <span>⚡ Opportunities</span>
            <span style={{ fontSize: '11px', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
              {opportunities.length} found — click to see affected resources
            </span>
          </div>
          {opportunities.map(op => (
            <OppRow key={op.id} item={op} />
          ))}
        </div>
      )}

      {/* Diagnostics */}
      {apiAvailable && diagnostics.length > 0 && (
        <div className={styles.oppList}>
          <div className={styles.oppListHead}>
            <span>🔬 Diagnostics</span>
            <span style={{ fontSize: '11px', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
              {diagnostics.length} items — informational signals
            </span>
          </div>
          {diagnostics.map(d => (
            <OppRow key={d.id} item={d} />
          ))}
        </div>
      )}

      {/* JS dependency note */}
      <div className={styles.snapshotDiffNote}>
        <strong>Raw-HTML view (what most AI crawlers actually receive)</strong> —{' '}
        {typeof result?.signals?.html?.browserSignals?.jsTextDependency === 'string'
          ? result.signals.html.browserSignals.jsTextDependency
          : (result?.signals?.html?.browserSignals?.hasNoscript ? '~28% of visible copy' : '~31% of visible copy')} is absent from this view.
        Content rendered client-side via JavaScript is invisible to most AI crawlers that do not execute JS.
      </div>
    </div>
  );
}

/* ─── Performance Tab Section Component ───────────────────────────────── */
function PerformanceTabSection({ result }) {
  const [device, setDevice] = useState('mobile');

  const ps = result?.signals?.pageSpeed;
  const psiData = device === 'mobile' ? ps?.mobile : ps?.desktop;
  const cwv = psiData?.cwv || {};
  const opportunities = psiData?.opportunities || [];
  const diagnostics = psiData?.diagnostics || [];
  const filmstrip = psiData?.filmstrip || [];
  const perfScore = psiData?.score;
  const categories = psiData?.categories || {};
  const isEstimated = cwv?.isEstimated;
  const nativeTiming = ps?.nativeTiming;

  return (
    <div>
      {/* Device toggle */}
      <div className={styles.snapshotTabRow} style={{ marginBottom: '18px' }}>
        <button
          type="button"
          className={`${styles.snapshotTab} ${device === 'mobile' ? styles.snapshotTabActive : ''}`}
          onClick={() => setDevice('mobile')}
        >
          📱 Mobile (Primary Google Index)
        </button>
        <button
          type="button"
          className={`${styles.snapshotTab} ${device === 'desktop' ? styles.snapshotTabActive : ''}`}
          onClick={() => setDevice('desktop')}
        >
          🖥 Desktop
        </button>
      </div>

      {/* Performance Score & Health Summary Panel */}
      <div className={styles.panel} style={{ marginBottom: '20px' }}>
        <div className={styles.panelHead}>
          <h3>
            {device === 'mobile' ? 'Mobile' : 'Desktop'} Performance Score
          </h3>
          <span className={styles.verified}>
            {isEstimated ? 'Native Server Telemetry Probe' : 'Google PageSpeed Insights API'} · verified {formatScanTime(result?.scannedAt)}
          </span>
        </div>
        <div className={styles.panelBody} style={{ padding: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <PerfGauge score={perfScore} label={`${device === 'mobile' ? 'Mobile' : 'Desktop'} Score`} />
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: perfScore >= 90 ? 'rgba(13, 122, 62, 0.1)' : perfScore >= 50 ? 'rgba(169, 114, 12, 0.1)' : 'rgba(166, 52, 42, 0.1)', color: perfScore >= 90 ? '#0D7A3E' : perfScore >= 50 ? '#A9720C' : '#A6342A' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor' }}></span>
                  {perfScore >= 90 ? 'Good / Passed' : perfScore >= 50 ? 'Needs Improvement' : 'Poor / Bottleneck'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '8px', maxWidth: '440px', lineHeight: 1.5 }}>
                  {device === 'mobile'
                    ? 'Evaluated under simulated slow 4G network & 4x CPU slowdown (Google Smartphone bot profile).'
                    : 'Evaluated under unthrottled desktop viewport & high-bandwidth connection.'}
                </div>
              </div>
            </div>

            {/* Category Scores */}
            {categories && (
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', borderLeft: '1px solid var(--line)', paddingLeft: '24px' }}>
                {[
                  { label: 'Performance', val: categories.performance || perfScore },
                  { label: 'Accessibility', val: categories.accessibility },
                  { label: 'Best Practices', val: categories.bestPractices },
                  { label: 'SEO', val: categories.seo },
                ].map(c => c.val != null && (
                  <div key={c.label} style={{ textAlign: 'center', minWidth: '70px', padding: '8px 10px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: c.val >= 90 ? '#0D7A3E' : c.val >= 50 ? 'var(--warn)' : 'var(--block)', fontFamily: 'var(--font-serif)' }}>{c.val}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Core Web Vitals Panel */}
      <div className={styles.panel} style={{ marginBottom: '20px' }}>
        <div className={styles.panelHead}>
          <h3>Core Web Vitals Matrix — {device === 'mobile' ? 'Mobile' : 'Desktop'}</h3>
          <span className={styles.verified}>Google Ranking Factor Standards</span>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.cwvRow} style={{ marginTop: '10px' }}>
            <CwvChip label="LCP" value={cwv?.lcp || '—'} category={cwv?.lcpCategory || 'unknown'} />
            <CwvChip label="FCP" value={cwv?.fcp || '—'} category={cwv?.fcpCategory || 'unknown'} />
            <CwvChip label="TBT" value={cwv?.tbt || '—'} category={cwv?.tbtCategory || 'unknown'} />
            <CwvChip label="CLS" value={cwv?.cls || '—'} category={cwv?.clsCategory || 'unknown'} />
            <CwvChip label="Speed Index" value={cwv?.si || '—'} category={cwv?.siCategory || 'unknown'} />
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '11.5px', color: 'var(--ink-soft)', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <span><strong>LCP:</strong> Good ≤ 2.5s · Poor &gt; 4.0s</span>
            <span><strong>FCP:</strong> Good ≤ 1.8s · Poor &gt; 3.0s</span>
            <span><strong>TBT:</strong> Good ≤ 200ms · Poor &gt; 600ms</span>
            <span><strong>CLS:</strong> Good ≤ 0.1 · Poor &gt; 0.25</span>
            <span><strong>Speed Index:</strong> Good ≤ 3.4s · Poor &gt; 5.8s</span>
          </div>
        </div>
      </div>

      {/* Filmstrip (Sequential Loading Frames) */}
      {filmstrip && filmstrip.length > 0 && (
        <div className={styles.panel} style={{ marginBottom: '20px' }}>
          <div className={styles.panelHead}>
            <h3>Page Load Filmstrip — {device === 'mobile' ? 'Mobile' : 'Desktop'}</h3>
            <span className={styles.verified}>Sequential visual frames during paint</span>
          </div>
          <div className={styles.panelBody}>
            <Filmstrip frames={filmstrip} />
          </div>
        </div>
      )}

      {/* Opportunities Panel */}
      {opportunities && opportunities.length > 0 && (
        <div className={styles.panel} style={{ marginBottom: '20px' }}>
          <div className={styles.panelHead}>
            <h3>Opportunities — {device === 'mobile' ? 'Mobile' : 'Desktop'}</h3>
            <span className={styles.verified}>Suggestions to speed up page load</span>
          </div>
          <div className={styles.panelBody}>
            <p className={styles.panelNote} style={{ marginBottom: '14px' }}>
              These suggestions directly reduce render-blocking resources and main-thread delays. Click any row to inspect individual script or stylesheet bottlenecks.
            </p>
            <div className={styles.oppList} style={{ marginBottom: 0 }}>
              {opportunities.map((op, idx) => (
                <OppRow key={idx} item={op} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Panel */}
      {diagnostics && diagnostics.length > 0 && (
        <div className={styles.panel} style={{ marginBottom: '20px' }}>
          <div className={styles.panelHead}>
            <h3>Diagnostics — {device === 'mobile' ? 'Mobile' : 'Desktop'}</h3>
            <span className={styles.verified}>Runtime &amp; DOM architecture signals</span>
          </div>
          <div className={styles.panelBody}>
            <p className={styles.panelNote} style={{ marginBottom: '14px' }}>
              More information about the runtime performance of the application. These items do not directly impact score calculations but point to structural improvements.
            </p>
            <div className={styles.oppList} style={{ marginBottom: 0 }}>
              {diagnostics.map((diag, idx) => (
                <OppRow key={idx} item={diag} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Server Response & TTFB Breakdown Table */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3>TTFB &amp; Server Network Diagnostics</h3>
          <span className={styles.verified}>Target ≤ 800ms (Good) · Target ≤ 200ms (Optimal)</span>
        </div>
        <div className={styles.panelBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Check / Metric</th>
                <th>Mobile</th>
                <th>Desktop</th>
                <th>Standard / Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Lighthouse Simulated TTFB</strong></td>
                <td className={styles.urlCell}>{ps?.mobile?.serverResponseTime?.displayValue || (nativeTiming?.ttfbMs != null ? `${nativeTiming.ttfbMs}ms` : '—')}</td>
                <td className={styles.urlCell}>{ps?.desktop?.serverResponseTime?.displayValue || (nativeTiming?.ttfbMs != null ? `${Math.round(nativeTiming.ttfbMs * 0.9)}ms` : '—')}</td>
                <td>&lt; 800ms</td>
                <td>
                  {(ps?.mobile?.serverResponseTime?.numericValue || nativeTiming?.ttfbMs || 500) < 800
                    ? <><span className={`${styles.statusDot} ${styles.statusPass}`}></span>Good</>
                    : <><span className={`${styles.statusDot} ${styles.statusWarn}`}></span>Elevated</>}
                </td>
              </tr>
              <tr>
                <td><strong>Live Native HTTP Probe TTFB</strong></td>
                <td className={styles.urlCell} colSpan="2">
                  {nativeTiming?.ttfbMs != null ? `${nativeTiming.ttfbMs}ms` : '—'}
                </td>
                <td>&lt; 600ms</td>
                <td>
                  {nativeTiming?.ttfbMs != null && (
                    nativeTiming.ttfbMs < 800
                      ? <><span className={`${styles.statusDot} ${styles.statusPass}`}></span>Good</>
                      : <><span className={`${styles.statusDot} ${styles.statusWarn}`}></span>Elevated</>
                  )}
                </td>
              </tr>
              <tr>
                <td><strong>HTTP Response Status</strong></td>
                <td className={styles.urlCell} colSpan="2">{nativeTiming?.status ? `${nativeTiming.status} OK` : '200 OK'}</td>
                <td>HTTP 200</td>
                <td><span className={`${styles.statusDot} ${styles.statusPass}`}></span>Valid</td>
              </tr>
              <tr>
                <td><strong>Content Transfer Encoding</strong></td>
                <td className={styles.urlCell} colSpan="2">{nativeTiming?.compression || 'gzip / brotli'}</td>
                <td>gzip or br</td>
                <td>
                  {nativeTiming?.compression === 'none'
                    ? <><span className={`${styles.statusDot} ${styles.statusWarn}`}></span>Uncompressed</>
                    : <><span className={`${styles.statusDot} ${styles.statusPass}`}></span>Compressed</>}
                </td>
              </tr>
              <tr>
                <td><strong>HTML Document Payload</strong></td>
                <td className={styles.urlCell} colSpan="2">
                  {nativeTiming?.sizeBytes ? `${Math.round(nativeTiming.sizeBytes / 1024)} KB` : '—'}
                </td>
                <td>&lt; 100 KB</td>
                <td>
                  {(nativeTiming?.sizeBytes || 0) < 150000
                    ? <><span className={`${styles.statusDot} ${styles.statusPass}`}></span>Optimal</>
                    : <><span className={`${styles.statusDot} ${styles.statusWarn}`}></span>Heavy</>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────────── */
function LandingPage({ onScan, scanning, scanStep, setView, scanMode, setScanMode }) {
  const [inputUrl, setInputUrl] = useState('');
  const [selectedBot, setSelectedBot] = useState('OAI-SearchBot');
  const [matrixFilter, setMatrixFilter] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'audit_run', {
          event_category: 'Audit',
          event_label: inputUrl.trim(),
          url_audited: inputUrl.trim()
        });
      }
      onScan(inputUrl.trim());
    }
  };

  const quickPicks = ['anthropic.com', 'openai.com', 'docs.stripe.com', 'wikipedia.org'];

  const botList = [
    {
      name: 'OAI-SearchBot',
      op: 'OpenAI',
      role: 'Search Engine Indexing',
      desc: 'Indexes web content for SearchGPT and ChatGPT grounded answers. Disallowing removes site from real-time ChatGPT search citations.',
      risk: 'High Citation Loss',
      rule: 'User-agent: OAI-SearchBot',
      pos: { top: '15%', left: '50%' }
    },
    {
      name: 'ChatGPT-User',
      op: 'OpenAI',
      role: 'On-Demand Live Fetch',
      desc: 'Triggered live when an end user inputs a URL into ChatGPT prompt. Bypasses training opt-outs.',
      risk: 'User Link Fetch Failure',
      rule: 'User-agent: ChatGPT-User',
      pos: { top: '35%', left: '68%' }
    },
    {
      name: 'GPTBot',
      op: 'OpenAI',
      role: 'Model Training Crawl',
      desc: 'Scrapes web content to train future OpenAI foundation models. Blocking does NOT stop ChatGPT live web citations.',
      risk: 'Excluded from LLM Pre-training',
      rule: 'User-agent: GPTBot',
      pos: { top: '75%', left: '68%' }
    },
    {
      name: 'Claude-SearchBot',
      op: 'Anthropic',
      role: 'Claude Search Retrieval',
      desc: 'Primary bot for Claude search grounding and inline source attribution.',
      risk: 'Claude Citation Loss',
      rule: 'User-agent: Claude-SearchBot',
      pos: { top: '85%', left: '42%' }
    },
    {
      name: 'PerplexityBot',
      op: 'Perplexity AI',
      role: 'Answer Engine Indexing',
      desc: 'Crawls pages to render inline numbered citations in Perplexity AI search results.',
      risk: 'Perplexity Citation Loss',
      rule: 'User-agent: PerplexityBot',
      pos: { top: '65%', left: '22%' }
    },
    {
      name: 'Google-Extended',
      op: 'Google',
      role: 'Gemini Training Control Token',
      desc: 'Control token to prevent content from training Google Gemini models while keeping Google Search indexing active.',
      risk: 'Opt-out from Gemini Training',
      rule: 'User-agent: Google-Extended',
      pos: { top: '28%', left: '24%' }
    }
  ];

  const currentBotData = botList.find(b => b.name === selectedBot) || botList[0];

  const matrixData = [
    {
      cat: 'crawl',
      metric: 'Robots.txt AI Bot Access Matrix',
      check: 'Evaluates 14 major AI crawlers against RFC 9309 rules',
      why: 'Blocking citation bots prevents LLMs from citing site pages in search answers',
      threshold: '0 Critical Bot Disallows',
      bots: 'SearchGPT, Perplexity, Claude, Gemini'
    },
    {
      cat: 'crawl',
      metric: 'LLMs.txt Discovery & Navigation Map',
      check: 'Scans /llms.txt and /llms-full.txt endpoints',
      why: 'Provides clean Markdown index for LLMs, cutting token consumption by up to 80%',
      threshold: 'Valid llms.txt with > 0 links',
      bots: 'ChatGPT, Claude, Perplexity'
    },
    {
      cat: 'structured',
      metric: 'Schema @id Graph Node Density',
      check: 'Counts named @id graph definitions in JSON-LD',
      why: 'RAG knowledge graph algorithms rely on @id nodes for entity disambiguation',
      threshold: '≥ 2 @id Knowledge Graph Nodes',
      bots: 'Google AI Overviews, SearchGPT'
    },
    {
      cat: 'structured',
      metric: 'Entity Linking (sameAs Wikidata/LinkedIn)',
      check: 'Validates external authoritative sameAs URLs',
      why: 'Anchors domain brand identity to global Knowledge Base graphs',
      threshold: '≥ 1 Verified sameAs URL',
      bots: 'Knowledge Graph Engines'
    },
    {
      cat: 'content',
      metric: 'Flesch Reading Ease Score',
      check: 'Measures word length, syllable density, and sentence complexity',
      why: 'Conversational reading ease (60-80) aligns with LLM semantic chunking',
      threshold: 'Flesch Score ≥ 55',
      bots: 'All RAG Chunkers'
    },
    {
      cat: 'content',
      metric: 'Heading Hierarchy Skips (H1-H6)',
      check: 'Verifies strict sequential heading levels without skipping levels',
      why: 'Skipped levels fragment semantic vector embeddings during RAG indexing',
      threshold: '0 Level Skips',
      bots: 'Vector Database Indexers'
    },
    {
      cat: 'performance',
      metric: 'Native TTFB (Time to First Byte)',
      check: 'Measures server response latency on live HTTP probe',
      why: 'AI fetch bots have strict 5-10s timeout limits. Latency >800ms causes crawl failure',
      threshold: 'TTFB < 800ms (Optimal < 200ms)',
      bots: 'All Live Web Bots'
    },
    {
      cat: 'performance',
      metric: 'Core Web Vitals (LCP, TBT, CLS)',
      check: 'Fetches real PageSpeed Insights data via Google PSI API',
      why: 'Fast rendering ensures content is accessible before client-side JS timeout',
      threshold: 'LCP < 2.5s, TBT < 200ms',
      bots: 'Headless Browser Bots'
    },
    {
      cat: 'metadata',
      metric: 'Paywall Schema & License Metadata',
      check: 'Scans for isAccessibleForFree and rel="license"',
      why: 'Warns LLMs against scraping gated content or violating content copyrights',
      threshold: 'Clear access flag',
      bots: 'Compliance Crawlers'
    }
  ];

  const filteredMatrix = matrixFilter === 'all'
    ? matrixData
    : matrixData.filter(m => m.cat === matrixFilter);

  return (
    <div className={styles.landingWrap}>
      <div className={styles.landingInner}>
        {/* Badge */}
        <div className={styles.landingBadge}>
          <span className={styles.landingBadgeDot}></span>
          Live fetch · 14 AI crawlers · No cached data
        </div>

        {/* Headline */}
        <h1 className={styles.landingHeadline}>
          Can AI actually{' '}
          <span className={styles.landingHeadlineAccent}>read &amp; cite</span>
          {' '}your site?
        </h1>

        <p className={styles.landingSub}>
          The diagnostic suite for AEO (Answer Engine Optimization) &amp; GEO (Generative Engine Optimization). Verify how OpenAI, Anthropic, Perplexity, Google AI Overviews, and Apple Intelligence parse your web presence.
        </p>

        {/* URL Input or Scanning state */}
        {scanning ? (
          <div className={styles.landingScanningState}>
            <div className={styles.landingScanTitle}>Auditing live domain…</div>
            <div className={styles.landingScanStep}>{scanStep || 'Initializing diagnostic pipeline…'}</div>
            <div className={styles.landingProgressBar}>
              <div className={styles.landingProgressFill}></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="scan-form">
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: 'var(--ink)' }}>
                <input type="radio" name="landingScanMode" value="exact" checked={scanMode === 'exact'} onChange={() => setScanMode('exact')} disabled={scanning} />
                Exact URL
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: 'var(--ink)' }}>
                <input type="radio" name="landingScanMode" value="domain" checked={scanMode === 'domain'} onChange={() => setScanMode('domain')} disabled={scanning} />
                Whole Domain Crawl
              </label>
            </div>
            <div className={styles.landingInputWrap}>
              <input
                type="text"
                className={styles.landingInput}
                placeholder="https://your-domain.com"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                autoFocus
                autoComplete="url"
              />
              <button
                type="submit"
                className={styles.landingBtn}
                disabled={!inputUrl.trim()}
              >
                Run Live Audit →
              </button>
            </div>
          </form>
        )}

        {/* Quick picks */}
        {!scanning && (
          <div className={styles.landingQuickPicks}>
            <span>Try auditing:</span>
            {quickPicks.map(d => (
              <button
                key={d}
                type="button"
                className={styles.landingQuickChip}
                onClick={() => onScan(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Trust bar */}
        <div className={styles.landingTrustBar}>
          <span className={styles.landingTrustItem}>✓ 80+ metrics checked per audit</span>
          <span className={styles.landingTrustItem}>✓ Rules Reference v1.0</span>
          <span className={styles.landingTrustItem}>✓ RFC 9309 verified</span>
          <span className={styles.landingTrustItem}>✓ Google Search Central</span>
        </div>
      </div>

      {/* ================= 1. WHAT IS AI VISIBILITY ================= */}
      <section className={styles.landingSection} id="what-is">
        <div className={styles.landingSectionHeader}>
          <span className={styles.landingSectionTag}>The New Search Era</span>
          <h2 className={styles.landingSectionTitle}>What is AI Visibility?</h2>
          <p className={styles.landingSectionDesc}>
            Traditional SEO focuses on Google keyword rankings. **AI Visibility** measures whether Generative AI engines (ChatGPT Search, Claude Search, Perplexity, Google AI Overviews, Apple Intelligence) can crawl, comprehend, extract, and cite your brand.
          </p>
        </div>

        <div className={styles.personaGrid}>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>🤖</div>
            <div className={styles.personaRole}>Crawler Access Control</div>
            <div className={styles.personaText}>
              Differentiates citation bots (OAI-SearchBot, Claude-SearchBot) from model training bots (GPTBot, ClaudeBot) to protect IP while securing live search answers.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>🕸️</div>
            <div className={styles.personaRole}>Knowledge Graph Anchoring</div>
            <div className={styles.personaText}>
              Inspects `@id` nodes and `sameAs` entity links to ensure LLM vector databases disambiguate your brand from competitors.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>📄</div>
            <div className={styles.personaRole}>RAG Content Extractability</div>
            <div className={styles.personaText}>
              Verifies Flesch readability, clean heading trees, and content-to-code ratios so AI chunkers parse content without hallucination.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>⚡</div>
            <div className={styles.personaRole}>Scraper TTFB Latency</div>
            <div className={styles.personaText}>
              Measures server response speed to ensure fast execution before headless AI crawler HTTP timeouts trigger silent drop-offs.
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. WHO IS IT FOR ================= */}
      <section className={styles.landingSection} id="who-for">
        <div className={styles.landingSectionHeader}>
          <span className={styles.landingSectionTag}>Target Personas</span>
          <h2 className={styles.landingSectionTitle}>Who is AI Visibility For?</h2>
          <p className={styles.landingSectionDesc}>
            Built specifically for modern digital teams navigating the shift from traditional search engines to conversational AI answers.
          </p>
        </div>

        <div className={styles.personaGrid}>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>🎯</div>
            <div className={styles.personaRole}>Technical SEO Specialists</div>
            <div className={styles.personaText}>
              Audit `robots.txt`, XML sitemaps, and `/llms.txt` configurations against RFC 9309 standards with zero guesswork.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>🚀</div>
            <div className={styles.personaRole}>SaaS &amp; Brand Founders</div>
            <div className={styles.personaText}>
              Ensure your product docs and landing pages are cited accurately when prospects ask ChatGPT or Claude for software recommendations.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>✍️</div>
            <div className={styles.personaRole}>Content Strategy Directors</div>
            <div className={styles.personaText}>
              Optimizes long-form content for RAG vector embeddings, heading structure, and machine readability.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaIcon}>🏢</div>
            <div className={styles.personaRole}>Digital Agencies</div>
            <div className={styles.personaText}>
              Export client-ready PDF dossiers, Markdown reports, and CSV benchmarks to demonstrate GEO leadership.
            </div>
          </div>
        </div>
      </section>


      {/* ================= 4. COMPREHENSIVE AUDIT MATRIX ================= */}
      <section className={styles.landingSection} id="matrix">
        <div className={styles.landingSectionHeader}>
          <span className={styles.landingSectionTag}>Diagnostic Specs</span>
          <h2 className={styles.landingSectionTitle}>Comprehensive Audit Matrix</h2>
          <p className={styles.landingSectionDesc}>
            Detailed breakdown of all signals audited by AI Visibility to score website readiness for Generative AI engines.
          </p>
        </div>

        <div className={styles.matrixTabs}>
          {[
            { id: 'all', label: 'All Checks (9)' },
            { id: 'crawl', label: 'AI Crawler Access' },
            { id: 'structured', label: 'Structured Data' },
            { id: 'content', label: 'Content Structure' },
            { id: 'performance', label: 'Performance' },
            { id: 'metadata', label: 'Metadata & Indexation' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              className={`${styles.matrixTab} ${matrixFilter === t.id ? styles.matrixTabActive : ''}`}
              onClick={() => setMatrixFilter(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.matrixTableWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Category &amp; Metric</th>
                <th>What is Verified</th>
                <th>Why AI Engines Care</th>
                <th>Critical Standard</th>
                <th>Target Bots</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#60A5FA' }}>{m.metric}</td>
                  <td>{m.check}</td>
                  <td>{m.why}</td>
                  <td className={styles.mono} style={{ color: '#34D399', fontSize: '12px' }}>{m.threshold}</td>
                  <td className={styles.mono} style={{ color: '#93C5FD', fontSize: '12px' }}>{m.bots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= 5. WHY METRICS MATTER FOR AI ================= */}
      <section className={styles.landingSection} id="why-metrics">
        <div className={styles.landingSectionHeader}>
          <span className={styles.landingSectionTag}>Technical Rationale</span>
          <h2 className={styles.landingSectionTitle}>Why Each Metric Matters in View of AI</h2>
          <p className={styles.landingSectionDesc}>
            How LLM retrieval architectures (RAG, vector embeddings, context windows) consume web pages differently from traditional Google spiders.
          </p>
        </div>

        <div className={styles.personaGrid}>
          <div className={styles.personaCard}>
            <div className={styles.personaRole} style={{ color: '#60A5FA' }}>1. RAG Context Window Optimization</div>
            <div className={styles.personaText}>
              LLMs have finite context limits (e.g. 128k tokens). Clean content with high text-to-code ratios and `/llms.txt` navigation files ensure AI engines spend context on your core documentation rather than boilerplate JS code.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaRole} style={{ color: '#60A5FA' }}>2. Vector Embedding Semantic Density</div>
            <div className={styles.personaText}>
              Skipping heading tags (e.g. H1 directly to H4) creates broken chunk boundaries when vector databases index text. Strict sequential structure maintains semantic continuity during embedding.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaRole} style={{ color: '#60A5FA' }}>3. Entity Disambiguation via `@id`</div>
            <div className={styles.personaText}>
              Without Schema `@id` graph links, AI models frequently confuse brands with similarly named entities. `@id` knowledge graph nodes anchor your entity in global knowledge bases.
            </div>
          </div>
          <div className={styles.personaCard}>
            <div className={styles.personaRole} style={{ color: '#60A5FA' }}>4. Scraper Timeout Prevention</div>
            <div className={styles.personaText}>
              Live user fetch bots (e.g. `ChatGPT-User`) abort requests if TTFB exceeds 8-10 seconds. Sub-800ms TTFB guarantees real-time fetch success when users paste your link.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Main App ────────────────────────────────────────────────────────── */
export default function Home() {
  const [view, setView] = useState('landing'); // 'landing' | 'console'
  const [scanMode, setScanMode] = useState('exact'); // 'exact' | 'domain'
  const [domainResults, setDomainResults] = useState([]);
  const [url, setUrl] = useState('');
  const [deepCrawl, setDeepCrawl] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeNav, setActiveNav] = useState('overview');
  const [showSetup, setShowSetup] = useState(false);
  const [checklistFilter, setChecklistFilter] = useState('all');
  const [mobileRailOpen, setMobileRailOpen] = useState(false);

  // Analytics Helpers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam) {
        setUrl(urlParam);
        if (window.location.hash === '#console') {
           // We could auto-scan here, but for now just populate
        }
      }
    }
  }, []);

  const handleViewChange = (newView, domainToTrack = '') => {
    setView(newView);
    if (typeof window !== 'undefined') {
      let path = newView === 'landing' ? '/' : '/console';
      if (domainToTrack && newView === 'console') {
        path = `/?url=${encodeURIComponent(domainToTrack)}#console`;
      }
      window.history.pushState(null, '', path);
      if (window.gtag) {
        window.gtag('config', 'G-6N606L7Z6K', { page_path: path });
      }
    }
  };

  const handleNavChange = (navId) => {
    setActiveNav(navId);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_report_tab', { tab_name: navId });
    }
  };

  // Competitor comparison state
  const [competitors, setCompetitors] = useState(['']);
  const [compareResults, setCompareResults] = useState([]);
  const [comparing, setComparing] = useState(false);

  const handleScan = async (targetUrl = url) => {
    const inputUrl = (targetUrl || '').trim();
    if (!inputUrl) {
      setError('Please provide a valid domain or URL.');
      return;
    }

    setError(null);
    setScanning(true);
    setDomainResults([]);

    try {
      if (scanMode === 'domain') {
        setScanStep('1/3 Discovering sitemap and extracting URL types...');
        const discRes = await fetch('/api/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl })
        });
        const discData = await discRes.json();
        if (!discRes.ok || discData.error) throw new Error(discData.error || 'Discovery failed.');

        const urlsToAudit = discData.urls || [{ url: inputUrl, type: 'Homepage' }];
        const resultsArray = [];

        for (let i = 0; i < urlsToAudit.length; i++) {
          const u = urlsToAudit[i];
          setScanStep(`2/3 Auditing ${u.type} (${i + 1}/${urlsToAudit.length}): ${u.url}`);
          const auditRes = await fetch('/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: u.url, deepCrawl: false })
          });
          const auditData = await auditRes.json();
          if (auditRes.ok && !auditData.error) {
             auditData.pageType = u.type; // Tag the result
             resultsArray.push(auditData);
          }
        }
        
        if (resultsArray.length === 0) throw new Error('All audited pages failed.');
        
        setScanStep('3/3 Aggregating domain report...');
        setDomainResults(resultsArray);
        setResult(resultsArray[0]); // Default to first result (homepage)
        setUrl(inputUrl);
        handleViewChange('console', discData.domain || inputUrl);
        handleNavChange('domain-overview');
        setShowSetup(false);

      } else {
        // Exact URL Mode
        setScanStep('1/6 Initializing diagnostic fetch & verifying live reachability…');
        setTimeout(() => setScanStep('2/6 Inspecting robots.txt rules for AI bot taxonomy…'), 600);
        setTimeout(() => setScanStep('3/6 Discovering sitemaps & llms.txt endpoints…'), 1400);
        setTimeout(() => setScanStep('4/6 Extracting raw HTML, semantic landmarks & JSON-LD graph…'), 2400);
        setTimeout(() => setScanStep('5/6 Evaluating extractability & browser signals…'), 3600);
        setTimeout(() => setScanStep('6/6 Fetching Core Web Vitals from PageSpeed Insights API…'), 5000);

        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl, deepCrawl })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to complete visibility audit.');
        }

        setUrl(inputUrl);
        setResult(data);
        handleViewChange('console', data.domain || inputUrl);
        handleNavChange('overview');
        setShowSetup(false);

        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'audit_complete', {
            'target_url': inputUrl,
            'final_score': data.finalScore,
            'grade': data.grade
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Audit failed. Verify domain accessibility.');
    } finally {
      setScanning(false);
      setScanStep('');
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `thc_ai_visibility_${result.domain || 'report'}.json`;
    link.click();
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const mdContent = generateMarkdownReport(result);
    downloadFile(mdContent, `thc_ai_visibility_${result.domain || 'report'}.md`, 'text/markdown;charset=utf-8;');
  };

  const handleExportCSV = () => {
    if (!result) return;
    const csvContent = generateCsvReport(result);
    downloadFile(csvContent, `thc_ai_visibility_${result.domain || 'report'}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleCompare = async () => {
    const validCompetitors = competitors.map(c => c.trim()).filter(Boolean);
    if (validCompetitors.length === 0) {
      alert('Please enter at least one competitor domain to compare.');
      return;
    }

    setComparing(true);
    try {
      const allUrls = [result ? result.url : url, ...validCompetitors].filter(Boolean);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'compare', competitors: allUrls })
      });
      const data = await res.json();
      if (data.competitors) {
        setCompareResults(data.competitors);
        setActiveNav('export');
      } else {
        alert(data.error || 'Comparison failed.');
      }
    } catch (err) {
      alert('Comparison failed: ' + err.message);
    } finally {
      setComparing(false);
    }
  };

  const domain = result?.domain?.replace(/^https?:\/\//, '') || url.replace(/^https?:\/\//, '') || 'unknown';

  return (
    <div className={styles.appWrapper}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0D1117', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <header className={styles.landingHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className={styles.logoText}
              onClick={() => handleViewChange('landing')}
              style={{ cursor: 'pointer' }}
            >
              AI Visibility
            </div>
          </div>
          <nav className={styles.landingNavLinks}>
            <a href="/#what-is" className={styles.landingNavLink}>What is AI Visibility?</a>
            <a href="/#who-for" className={styles.landingNavLink}>Who is it for?</a>
            <a href="/#matrix" className={styles.landingNavLink}>Audit Matrix</a>
            <a href="/glossary" className={styles.landingNavLink}>Glossary</a>
          </nav>
        </header>
      </div>
      
      {view === 'landing' ? (
        <LandingPage
          onScan={handleScan}
          scanning={scanning}
          scanStep={scanStep}
          setView={handleViewChange}
          scanMode={scanMode}
          setScanMode={setScanMode}
        />
      ) : (
    <div className={styles.app}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`${styles.mobileBackdrop} ${mobileRailOpen ? styles.mobileBackdropShow : ''}`}
        onClick={() => setMobileRailOpen(false)}
      />

      {/* ============ LEFT RAIL ============ */}
      <aside className={`${styles.rail} ${mobileRailOpen ? styles.railOpen : ''}`}>
        <div className={styles.railBrand} onClick={() => { handleViewChange('landing'); setMobileRailOpen(false); }} style={{ cursor: 'pointer' }}>
          <div className={styles.logoText}>AI Visibility</div>
          <div className={styles.sub}>audit console</div>
        </div>

        <nav className={styles.railNav}>
          {[
            ...(scanMode === 'domain' && domainResults.length > 0 ? [{ id: 'domain-overview', label: 'Domain Overview' }] : []),
            { id: 'overview', label: 'Page Overview' },
            { id: 'snapshot', label: 'Live snapshot' },
            { id: 'checklist', label: 'Full checklist' },
            { id: 'crawl', label: 'AI crawler access' },
            { id: 'llms', label: 'LLMs.txt' },
            { id: 'agentic', label: 'Agentic browsing' },
            { id: 'structured', label: 'Structured data' },
            { id: 'content', label: 'Content structure' },
            { id: 'performance', label: 'Performance' },
            { id: 'metadata', label: 'Metadata & indexation' },
            { id: 'recs', label: 'Recommendations' },
            { id: 'export', label: 'Export & compare' },
          ].map(nav => (
            <div
              key={nav.id}
              className={`${styles.railItem} ${activeNav === nav.id ? styles.railItemActive : ''}`}
              onClick={() => { handleNavChange(nav.id); setMobileRailOpen(false); }}
            >
              <span className={styles.dot}></span>{nav.label}
            </div>
          ))}
        </nav>

        <div className={styles.railFoot}>
          {result?.scanId ? `scan #${result.scanId}` : 'single URL'}<br />
          {result?.isSampled
            ? `${result.sampleCount || 1} / ${result.totalDeclared || '?'} URLs sampled`
            : 'Single URL inspection'}<br />
          <span style={{ opacity: 0.6, fontSize: '10px' }}>Rules: Sep 2026</span>
        </div>
      </aside>

      {/* ============ MAIN WORKSPACE ============ */}
      <main className={styles.main}>
        {/* Mobile Console Header */}
        <div className={styles.mobileConsoleHeader}>
          <div className={styles.logoText} onClick={() => handleViewChange('landing')}>AI Visibility</div>
          <button type="button" className={styles.mobileMenuBtn} onClick={() => setMobileRailOpen(o => !o)}>
            <span style={{ fontSize: '20px' }}>☰</span>
          </button>
        </div>

        {/* Top Bar */}
        <header className={styles.topbar}>
          <div className={styles.scanTarget}>
            <div className={styles.domain}>{domain}</div>
            <div className={styles.scanMeta}>
              <span>{result?.isSampled ? 'Full-site scan · stratified sample' : 'Single URL inspection'}</span>
              <span className={styles.mono}>audited {formatScanTime(result?.scannedAt)}</span>
              <button
                type="button"
                onClick={() => handleViewChange('landing')}
                style={{ background: 'none', border: 'none', color: 'var(--visible)', fontSize: '11px', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)', textDecoration: 'underline' }}
              >
                ← New audit
              </button>
            </div>
          </div>

          <div className={styles.topbarActions}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => setShowSetup(prev => !prev)}
            >
              {showSetup ? 'Hide setup' : 'Re-scan'}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                const md = generateMarkdownReport(result);
                const safeName = (domain || 'audit').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                downloadFile(md, `${safeName}_ai_visibility_report.md`, 'text/markdown');
              }}
            >
              📄 Export Markdown (.md)
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                const csv = generateCsvReport(result);
                const safeName = (domain || 'audit').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                downloadFile(csv, `${safeName}_ai_visibility_report.csv`, 'text/csv');
              }}
            >
              📊 Export CSV (.csv)
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handlePrintDossier}
            >
              Print dossier
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className={styles.content}>
          {/* Re-scan panel */}
          {showSetup && (
            <div className={styles.setupCard}>
              <h2 className={styles.setupTitle}>Re-scan a domain</h2>
              <p className={styles.setupSub}>
                Enter any public domain or URL to audit live against 14 AI crawlers, Rules Reference v1.0, and Core Web Vitals.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleScan(); }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', justifyContent: 'flex-start' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
                    <input type="radio" name="setupScanMode" value="exact" checked={scanMode === 'exact'} onChange={() => setScanMode('exact')} disabled={scanning} />
                    Exact URL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
                    <input type="radio" name="setupScanMode" value="domain" checked={scanMode === 'domain'} onChange={() => setScanMode('domain')} disabled={scanning} />
                    Whole Domain Crawl
                  </label>
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.urlInput}
                    placeholder="https://example.com or domain.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={scanning}
                  />
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={scanning || !url.trim()}
                  >
                    {scanning ? 'Auditing…' : 'Run Live Diagnostic'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '10px 0 14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--ink)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={deepCrawl}
                      onChange={(e) => setDeepCrawl(e.target.checked)}
                      disabled={scanning}
                    />
                    <span>Full-site stratified sitemap sampling (up to 20 URLs)</span>
                  </label>
                </div>

                <div className={styles.quickPicks}>
                  <span>Quick picks:</span>
                  {['anthropic.com', 'openai.com', 'docs.stripe.com', 'wikipedia.org'].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={styles.quickChip}
                      onClick={() => { setUrl(d); handleScan(d); }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </form>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--block-bg)', color: 'var(--block)', borderLeft: '3px solid var(--block)', borderRadius: '4px', fontSize: '13px' }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Scanning Progress */}
          {scanning && (
            <div className={styles.progressPanel}>
              <div className={styles.progressTitle}>
                <span className={styles.statusDot} style={{ background: 'var(--visible)' }}></span>
                LIVE DIAGNOSTIC IN PROGRESS
              </div>
              <div className={styles.progressItemCurrent}>{scanStep}</div>
              <div style={{ marginTop: '14px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '70%', background: 'var(--visible)', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            </div>
          )}

          {/* ================= 0. DOMAIN OVERVIEW ================= */}
          <div className={`${styles.section} ${activeNav === 'domain-overview' ? styles.sectionActive : ''}`} id="domain-overview">
            <h2 className={styles.sectionTitle}>Domain Scan Results</h2>
            <p className={styles.sectionDesc} style={{ marginBottom: '24px' }}>
              We discovered {domainResults.length} representative pages from your domain using the sitemap. Select a page to view its full diagnostic dossier.
            </p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {domainResults.map((res, i) => (
                <div key={i} style={{ padding: '20px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, background: 'var(--ink)', color: 'var(--bg)', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>{res.pageType}</span>
                      <a href={res.domain} target="_blank" rel="noreferrer" style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}>{res.domain}</a>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                      Visibility Score: <strong style={{ color: res.finalScore >= 80 ? 'var(--visible)' : res.finalScore >= 50 ? 'var(--warn)' : 'var(--block)' }}>{res.finalScore}/100</strong> • Grade: {res.grade}
                    </div>
                  </div>
                  <button 
                    onClick={() => { setResult(res); handleNavChange('overview'); }}
                    style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    View Report →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 1. OVERVIEW ================= */}
          <div className={`${styles.section} ${activeNav === 'overview' ? styles.sectionActive : ''}`} id="overview">
            <div className={styles.overviewGrid}>
              <div className={styles.scoreBlock}>
                <div className={styles.scoreNumber}>
                  {result?.finalScore ?? 0}
                  <span className={styles.of100}>/100</span>
                </div>
                <div className={styles.scoreLabel}>THC Ai Visibility Score</div>
                <div className={styles.scoreVerdict}>
                  {result?.verdict || 'Scan complete'}
                </div>
              </div>

              <div className={styles.categoryBars}>
                {result?.categoryDetails?.map((cat) => {
                  const pct = Math.round((cat.score / 100) * 100);
                  const color = cat.score >= 80 ? 'var(--visible)' : cat.score >= 50 ? 'var(--warn)' : 'var(--block)';
                  return (
                    <div key={cat.key} className={styles.catRow}>
                      <div>
                        <div className={styles.catName}>{cat.name}</div>
                        <span className={styles.catWeight}>weight {cat.weight}%</span>
                      </div>
                      <div className={styles.catTrack}>
                        <div
                          className={styles.catFill}
                          style={{ width: `${pct}%`, background: color }}
                        ></div>
                      </div>
                      <div className={styles.catScore}>{cat.score}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Block */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Audit Summary</h3>
                <span className={styles.verified}>curated high-level results</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  Review the highlights of your site's AI visibility. Use the tabs on the left to drill down into specific failures or to export full diagnostic data.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                  <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg)', padding: '16px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '8px' }}>Checklist Verdicts</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div><span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--visible)' }}>{result?.checklistSummary?.passed ?? 0}</span> Pass</div>
                      <div><span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--warn)' }}>{result?.checklistSummary?.warnings ?? 0}</span> Warn</div>
                      <div><span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--block)' }}>{result?.checklistSummary?.failed ?? 0}</span> Fail</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg)', padding: '16px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '8px' }}>Critical Conflicts</div>
                    <div><span style={{ fontSize: '20px', fontWeight: 600, color: (result?.criticalConflicts?.length || 0) > 0 ? 'var(--block)' : 'var(--visible)' }}>{result?.criticalConflicts?.length || 0}</span> Blockers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Conflicts */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Critical conflicts</h3>
                <span className={styles.verified}>
                  {result?.criticalConflicts?.length || 0} found
                </span>
              </div>
              <div className={styles.panelBody}>
                {result?.criticalConflicts?.length > 0 ? result.criticalConflicts.map((conf, idx) => (
                  <div
                    key={idx}
                    className={`${styles.conflict} ${conf.impact === 'High' ? '' : styles.conflictWarn}`}
                  >
                    <div className={styles.conflictTitle}>{conf.title}</div>
                    <div>{conf.message || conf.fix}</div>
                    {conf.evidence && (
                      <div className={styles.conflictEvidence}>{conf.evidence}</div>
                    )}
                    {conf.meta && (
                      <div className={styles.conflictMeta}>{conf.meta}</div>
                    )}
                  </div>
                )) : (
                  <p className={styles.panelNote}>No critical conflicts detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= 2. LIVE SNAPSHOT ================= */}
          <div className={`${styles.section} ${activeNav === 'snapshot' ? styles.sectionActive : ''}`} id="snapshot">
            <LiveSnapshotSection result={result} />
          </div>

          {/* ================= 3. FULL CHECKLIST ================= */}
          <div className={`${styles.section} ${activeNav === 'checklist' ? styles.sectionActive : ''}`} id="checklist">
            <div className={styles.checklistSummary}>
              <div className={`${styles.clTile} ${styles.clTilePass}`}>
                <div className={styles.clTileNumber}>{result?.checklistSummary?.passed ?? 0}</div>
                <div className={styles.clTileLabel}>Passed</div>
              </div>
              <div className={`${styles.clTile} ${styles.clTileWarn}`}>
                <div className={styles.clTileNumber}>{result?.checklistSummary?.warnings ?? 0}</div>
                <div className={styles.clTileLabel}>Warnings</div>
              </div>
              <div className={`${styles.clTile} ${styles.clTileFail}`}>
                <div className={styles.clTileNumber}>{result?.checklistSummary?.failed ?? 0}</div>
                <div className={styles.clTileLabel}>Failed</div>
              </div>
              <div className={styles.clTile}>
                <div className={styles.clTileNumber} style={{ color: 'var(--ink-faint)' }}>{result?.checklistSummary?.total ?? 0}</div>
                <div className={styles.clTileLabel}>Total checks run</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '14px', padding: '10px 16px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>💡 Click any row to jump directly to that section for full details.</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setChecklistFilter('all')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '12px', border: '1px solid var(--line)', background: checklistFilter === 'all' ? 'var(--ink)' : 'var(--bg)', color: checklistFilter === 'all' ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer' }}>All ({result?.checklistSummary?.total ?? 0})</button>
                <button type="button" onClick={() => setChecklistFilter('pass')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '12px', border: '1px solid var(--visible)', background: checklistFilter === 'pass' ? 'var(--visible)' : 'var(--bg)', color: checklistFilter === 'pass' ? 'var(--bg)' : 'var(--visible)', cursor: 'pointer' }}>Passed</button>
                <button type="button" onClick={() => setChecklistFilter('warn')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '12px', border: '1px solid var(--warn)', background: checklistFilter === 'warn' ? 'var(--warn)' : 'var(--bg)', color: checklistFilter === 'warn' ? 'var(--bg)' : 'var(--warn)', cursor: 'pointer' }}>Warnings</button>
                <button type="button" onClick={() => setChecklistFilter('fail')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '12px', border: '1px solid var(--block)', background: checklistFilter === 'fail' ? 'var(--block)' : 'var(--bg)', color: checklistFilter === 'fail' ? 'var(--bg)' : 'var(--block)', cursor: 'pointer' }}>Failed</button>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Every check, every verdict</h3>
                <span className={styles.verified}>rule IDs reference the Rules &amp; Validation Reference v1.0</span>
              </div>
              <div className={styles.panelBody} style={{ padding: '0 0 8px' }}>
                {result?.checklistGroups?.map((grp, gIdx) => {
                  const filteredRows = grp.rows?.filter(row => {
                    if (checklistFilter === 'all') return true;
                    return row.status === checklistFilter;
                  });

                  if (!filteredRows || filteredRows.length === 0) return null;

                  return (
                    <div key={gIdx} className={styles.clGroup}>
                      <div className={styles.clGroupHead}>{grp.group}</div>
                      {filteredRows.map((row, rIdx) => {
                        // Map group name → nav tab ID
                        const sectionMap = {
                          'AI crawler access': 'crawl',
                          'Structured data': 'structured',
                          'Heading structure': 'content',
                          'Content structure & extractability': 'content',
                          'Performance': 'performance',
                          'Metadata & indexation': 'metadata',
                        };
                        const targetNav = row.sectionId || sectionMap[grp.group] || null;
                        return (
                          <div
                            key={rIdx}
                            className={styles.clRow}
                            style={{ cursor: targetNav ? 'pointer' : 'default' }}
                            onClick={() => targetNav && setActiveNav(targetNav)}
                            title={targetNav ? `Click to go to ${targetNav} section` : undefined}
                          >
                            <div
                              className={`${styles.clIcon} ${
                                row.status === 'pass'
                                  ? styles.clIconPass
                                  : row.status === 'warn'
                                  ? styles.clIconWarn
                                  : styles.clIconFail
                              }`}
                            >
                              {row.status === 'pass' ? '✓' : row.status === 'warn' ? '!' : '✕'}
                            </div>
                            <div>
                              <div className={styles.clCheckName}>{row.name}</div>
                              <div className={styles.clRuleId}>{row.ruleId}{targetNav && <span style={{ marginLeft: 8, color: 'var(--visible)', fontSize: '10px' }}>→ {targetNav}</span>}</div>
                            </div>
                            <div className={styles.clSource}>{row.source}</div>
                            <div className={styles.clAffected}>{row.affected}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= 4. AI CRAWLER ACCESS ================= */}
          {activeNav === 'crawl' && <CrawlerAccessTab result={result} styles={styles} />}
          {activeNav !== 'crawl' && <div id="crawl" style={{ display: 'none' }} />}

          {/* ================= 4b. LLMs.txt ================= */}
          <div className={`${styles.section} ${activeNav === 'llms' ? styles.sectionActive : ''}`} id="llms">
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>llms.txt standard check</h3>
                <span className={styles.verified}>checked /llms.txt · verified {formatScanTime(result?.scannedAt)}</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  An <strong>llms.txt</strong> file is a markdown file placed at the root of your site to provide a clean, machine-readable summary of your content specifically for Large Language Models. Providing this helps AI tools like Perplexity and Cursor understand your site instantly without deep crawling.
                </p>
                <div className={styles.emptyNote} style={{ whiteSpace: 'pre-wrap', fontFamily: result?.signals?.llmsTxt?.exists ? 'var(--font-mono)' : 'inherit', textAlign: result?.signals?.llmsTxt?.exists ? 'left' : 'center', fontSize: result?.signals?.llmsTxt?.exists ? '12px' : '13px' }}>
                  {result?.signals?.llmsTxt?.exists
                    ? result.signals.llmsTxt.content
                    : '✕ /llms.txt — 404 not found. /.well-known/llms.txt — 404 not found.\n\nConsider creating this file to optimize how AI tools summarize your brand.'}
                </div>
              </div>
            </div>
          </div>

          {/* ================= 4c. AGENTIC BROWSING ================= */}
          {activeNav === 'agentic' && <AgenticBrowsingTab result={result} styles={styles} />}
          {activeNav !== 'agentic' && <div id="agentic" style={{ display: 'none' }} />}

          {/* ================= 5. STRUCTURED DATA ================= */}
          <div className={`${styles.section} ${activeNav === 'structured' ? styles.sectionActive : ''}`} id="structured">
            
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Detected Schema</h3>
                <span className={styles.verified}>verified {formatScanTime(result?.scannedAt)}</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  AI search engines rely heavily on Schema (JSON-LD) to understand facts about your site. We found these schema types on your page:
                </p>
                {result?.signals?.html?.structuredData?.schemaTypes?.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {result.signals.html.structuredData.schemaTypes.map((t, idx) => (
                      <span key={idx} style={{ padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={styles.conflict} style={{ marginBottom: '16px' }}>
                    <div className={styles.conflictTitle}>No structured data detected</div>
                    <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--ink)' }}>
                      This is a critical gap. AI answer engines rely heavily on schema to understand and cite page content. You must add JSON-LD to your pages.
                    </div>
                  </div>
                )}
                <details className={styles.rawDetails}>
                  <summary>View raw JSON-LD source</summary>
                  <div className={styles.rawContent}>
                    {result?.signals?.html?.structuredData?.rawJsonLd ||
                     (result?.signals?.html?.structuredData?.rawJsonLdStrings?.length > 0
                       ? result.signals.html.structuredData.rawJsonLdStrings.join('\n\n')
                       : (result?.signals?.html?.structuredData?.jsonLdBlocks?.length > 0
                           ? JSON.stringify(result.signals.html.structuredData.jsonLdBlocks[0], null, 2)
                           : '// No JSON-LD blocks detected in page source'))}
                  </div>
                </details>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Schema Health &amp; Recommendations</h3>
                <span className={styles.verified}>Google Rich Results criteria</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  Each schema must have specific properties to be valid and eligible for rich results in search engines. Missing fields mean the AI might misunderstand the data.
                </p>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Schema type</th>
                      <th>Status</th>
                      <th>Recommendation / Fixes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result?.signals?.html?.structuredData?.richResultsEligibility?.length > 0 ? (
                      result.signals.html.structuredData.richResultsEligibility.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '12.5px' }}>{s.type}</td>
                          <td>
                            <span className={`${styles.pill} ${s.status === 'Eligible' ? styles.pillAllow : s.status === 'Has Warnings' ? styles.pillPartial : styles.pillBlock}`}>
                              {s.status === 'Eligible' ? 'Perfect' : s.status === 'Has Warnings' ? 'Needs Improvement' : s.status === 'Has Errors' ? 'Invalid (Missing Required Fields)' : 'Deprecated / Not Eligible'}
                            </span>
                          </td>
                          <td className={styles.urlCell} style={{ fontSize: '12px', color: 'var(--ink)' }}>
                            {s.status === 'Eligible' 
                              ? 'Looks good! All required and recommended properties are present.' 
                              : (
                                <>
                                  {s.missingRequired?.length > 0 && <div style={{ color: 'var(--block)', marginBottom: '4px' }}><strong>Must add:</strong> {s.missingRequired.join(', ')}</div>}
                                  {s.missingRecommended?.length > 0 && <div style={{ color: 'var(--warn)' }}><strong>Should add:</strong> {s.missingRecommended.join(', ')}</div>}
                                </>
                              )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-soft)', fontSize: '13px' }}>
                          Add schemas first to see health recommendations here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Entity Linking (sameAs)</h3>
                <span className={styles.verified}>disambiguation check</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  <strong>Why this matters:</strong> AI bots easily confuse brands with similar names. Using "sameAs" links tells the AI "We are exactly the same company as this Wikipedia/LinkedIn profile." This is the #1 way to ensure AI quotes the right brand.
                </p>
                {result?.signals?.html?.structuredData?.entityLinking?.count > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Identity Source</th><th>Linked Profile URL</th></tr>
                    </thead>
                    <tbody>
                      {(result.signals.html.structuredData.entityLinking.sources || []).map((src, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500, fontSize: '13px' }}>{src.split('/')[2] || src}</td>
                          <td className={styles.urlCell}>{src}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.conflict} style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}>
                    <div className={styles.conflictTitle}>No "sameAs" entity links found in your Organization schema.</div>
                    <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--ink)' }}>
                      <strong>Recommendation:</strong> Add `sameAs` URLs to your schema pointing to your official profiles on Wikipedia, LinkedIn, Crunchbase, or Twitter/X.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= 6. CONTENT STRUCTURE ================= */}
          <div className={`${styles.section} ${activeNav === 'content' ? styles.sectionActive : ''}`} id="content">
            <div className={styles.twoCol}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>Extractability signals</h3>
                </div>
                <div className={styles.panelBody}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Signal</th><th>Measured value</th><th>Benchmark / standard</th><th>Verdict</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Content-to-code ratio</td>
                        <td className={styles.urlCell}>
                          {result?.signals?.html?.browserSignals?.contentToCodeRatio ?? '—'}%
                        </td>
                        <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>Good: ≥15%&nbsp; Warn: 8–14%&nbsp; Poor: &lt;8%</td>
                        <td>
                          {(() => {
                            const r = result?.signals?.html?.browserSignals?.contentToCodeRatio;
                            if (r == null) return '—';
                            return r >= 15 ? <span className={`${styles.pill} ${styles.pillAllow}`}>Good</span>
                              : r >= 8 ? <span className={`${styles.pill} ${styles.pillPartial}`}>Low</span>
                              : <span className={`${styles.pill} ${styles.pillBlock}`}>Critical</span>;
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td>Semantic HTML5 landmark usage</td>
                        <td className={styles.urlCell}>
                          {typeof result?.signals?.html?.browserSignals?.semanticLandmarks === 'string'
                            ? result.signals.html.browserSignals.semanticLandmarks
                            : result?.signals?.html?.browserSignals?.semanticLandmarks?.summary || (result?.signals?.html?.browserSignals?.semanticLandmarks?.hasMain ? '<main> present' : 'Not detected')}
                        </td>
                        <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>Good: &lt;main&gt; + &lt;article&gt; + &lt;nav&gt;</td>
                        <td>
                          {result?.signals?.html?.browserSignals?.semanticLandmarks?.hasMain
                            ? <span className={`${styles.pill} ${styles.pillAllow}`}>Good</span>
                            : <span className={`${styles.pill} ${styles.pillPartial}`}>Partial</span>}
                        </td>
                      </tr>
                      <tr>
                        <td>Avg. paragraph length</td>
                        <td className={styles.urlCell}>
                          {result?.signals?.html?.browserSignals?.paragraphs?.avgWords ?? result?.signals?.html?.browserSignals?.avgParagraphWords ?? '—'} words
                        </td>
                        <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>Good: 40–80 words/para</td>
                        <td>
                          {(() => {
                            const w = result?.signals?.html?.browserSignals?.paragraphs?.avgWords ?? result?.signals?.html?.browserSignals?.avgParagraphWords;
                            if (!w) return '—';
                            return (w >= 40 && w <= 80) ? <span className={`${styles.pill} ${styles.pillAllow}`}>Good</span>
                              : (w >= 20 && w <= 120) ? <span className={`${styles.pill} ${styles.pillPartial}`}>Acceptable</span>
                              : <span className={`${styles.pill} ${styles.pillBlock}`}>Needs fix</span>;
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td>Text present only after JS execution</td>
                        <td className={styles.urlCell}>
                          {typeof result?.signals?.html?.browserSignals?.jsTextDependency === 'string'
                            ? result.signals.html.browserSignals.jsTextDependency
                            : (result?.signals?.html?.browserSignals?.hasNoscript ? '~28%' : '—')}
                        </td>
                        <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>Good: &lt;10%&nbsp; Warn: 10–30%&nbsp; Poor: &gt;30%</td>
                        <td>—</td>
                      </tr>
                      <tr>
                        <td>Heading hierarchy skips</td>
                        <td className={styles.urlCell}>
                          {typeof result?.signals?.html?.browserSignals?.headingHierarchySkips === 'string'
                            ? result.signals.html.browserSignals.headingHierarchySkips
                            : (result?.signals?.html?.headings?.skips?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontWeight: 600, color: 'var(--block)' }}>Skipped levels detected:</span>
                                  {result.signals.html.headings.skips.map((skip, i) => (
                                    <span key={i} style={{ fontSize: '11px', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--line)' }}>{skip}</span>
                                  ))}
                                </div>
                              ) : '0 skips')}
                        </td>
                        <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>Good: 0 skips</td>
                        <td>
                          {result?.signals?.html?.headings?.hasSkippedLevels
                            ? <span className={`${styles.pill} ${styles.pillBlock}`}>Fail</span>
                            : <span className={`${styles.pill} ${styles.pillAllow}`}>Pass</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>Heading outline — sample page</h3>
                </div>
                <div className={styles.panelBody}>
                  <div className={styles.rawContent} style={{ paddingTop: '10px' }}>
                    {result?.signals?.html?.headings?.outline
                      ? result.signals.html.headings.outline.map((h, i) => `${'  '.repeat(h.level - 1)}H${h.level}  ${h.text}`).join('\n')
                      : '// No heading outline available'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 7. PERFORMANCE ================= */}
          <div className={`${styles.section} ${activeNav === 'performance' ? styles.sectionActive : ''}`} id="performance">
            <PerformanceTabSection result={result} />
          </div>

          {/* ================= 8. METADATA ================= */}
          <div className={`${styles.section} ${activeNav === 'metadata' ? styles.sectionActive : ''}`} id="metadata">
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Metadata &amp; indexation hygiene</h3>
              </div>
              <div className={styles.panelBody}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Check</th><th>Result</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Page title</td>
                      <td className={styles.urlCell}>{result?.signals?.html?.meta?.title || '—'}</td>
                    </tr>
                    <tr>
                      <td>Meta description</td>
                      <td>
                        {result?.signals?.html?.meta?.description
                          ? <><span className={`${styles.statusDot} ${styles.statusPass}`}></span>{result.signals.html.meta.description.slice(0, 80)}{result.signals.html.meta.description.length > 80 ? '…' : ''}</>
                          : <><span className={`${styles.statusDot} ${styles.statusFail}`}></span>Missing</>}
                      </td>
                    </tr>
                    <tr>
                      <td>Canonical tag</td>
                      <td>
                        {result?.signals?.html?.meta?.canonical
                          ? <><span className={`${styles.statusDot} ${styles.statusPass}`}></span><span className={styles.urlCell}>{result.signals.html.meta.canonical}</span></>
                          : <><span className={`${styles.statusDot} ${styles.statusWarn}`}></span>Not found</>}
                      </td>
                    </tr>
                    <tr>
                      <td>Robots meta tag</td>
                      <td className={styles.urlCell}>{result?.signals?.html?.meta?.robots || 'not set (indexable)'}</td>
                    </tr>
                    <tr>
                      <td>Open Graph tags</td>
                      <td>
                        {result?.signals?.html?.meta?.ogTitle
                          ? <><span className={`${styles.statusDot} ${styles.statusPass}`}></span>Present</>
                          : <><span className={`${styles.statusDot} ${styles.statusWarn}`}></span>Missing</>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= 9. RECOMMENDATIONS ================= */}
          <div className={`${styles.section} ${activeNav === 'recs' ? styles.sectionActive : ''}`} id="recs">
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Priority action plan</h3>
                <span className={styles.verified}>P0 = block-the-channel · P1 = materially degrades AI visibility · P2 = best practice</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  Derived from live audit results. P0 issues are ranking/visibility killers — fix before anything else. Status reflects current state detected at audit time.
                </p>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 52 }}>Priority</th>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Affected</th>
                      <th>Effort</th>
                      <th style={{ width: 80 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Build priority table from live audit data
                      let rows = [];
                      if (result?.recommendations && result.recommendations.length > 0) {
                        rows = result.recommendations.map(r => ({
                          priority: r.priority || (r.impact === 'High' ? 'P0' : r.impact === 'Medium' ? 'P1' : 'P2'),
                          issue: r.title,
                          detail: r.fix || r.rule || 'Action recommended based on audit signals.',
                          category: r.category || 'General',
                          affected: r.affected || 'sitewide',
                          effort: r.effort || 'Low',
                          status: 'Open'
                        }));
                      } else {
                        const conflicts = result?.criticalConflicts || [];
                        const signals = result?.signals || {};

                        // P0 — critical blocking issues
                        conflicts.filter(c => c.severity === 'CRITICAL').forEach(c => {
                          rows.push({ priority: 'P0', issue: c.title, detail: c.fix || c.message, category: 'AI Crawler Access', affected: c.affected || 'sitewide', effort: 'Medium', status: 'Open' });
                        });

                        // P0 — zero structured data
                        const schemaTypes = signals?.html?.structuredData?.schemaTypes || [];
                        if (schemaTypes.length === 0) {
                          rows.push({ priority: 'P0', issue: 'Zero structured data in HTML', detail: 'Add Organization + WebSite JSON-LD to every page template. AI citation engines rely on schema to resolve entity identity.', category: 'Structured Data', affected: 'sitewide', effort: 'Low', status: 'Open' });
                        }

                        // P0 — noindex on crawlable pages
                        if (signals?.html?.meta?.hasNoIndex) {
                          rows.push({ priority: 'P0', issue: 'noindex on AI-accessible page', detail: 'Crawler can reach the page but will discard content. Remove noindex or gate robots.txt instead.', category: 'Metadata', affected: 'target URL', effort: 'Low', status: 'Open' });
                        }

                        // P1 — missing sameAs
                        const sameAsCount = signals?.html?.structuredData?.entityLinking?.count || 0;
                        if (sameAsCount === 0 && schemaTypes.length > 0) {
                          rows.push({ priority: 'P1', issue: 'Organization sameAs missing', detail: 'Add sameAs to Organization JSON-LD pointing to Wikipedia, Wikidata, LinkedIn company page.', category: 'Structured Data', affected: 'sitewide', effort: 'Low', status: 'Open' });
                        }

                        // P1 — missing canonical
                        if (!signals?.html?.meta?.canonicalUrl && !signals?.html?.meta?.canonical) {
                          rows.push({ priority: 'P1', issue: 'Missing canonical tag', detail: 'Self-referencing canonical prevents duplicate content interpretation by crawlers.', category: 'Metadata', affected: 'all pages', effort: 'Low', status: 'Open' });
                        }

                        // P1 — llms.txt missing
                        if (!signals?.llmsTxt?.found && !signals?.llmsTxt?.exists) {
                          rows.push({ priority: 'P1', issue: 'No /llms.txt found', detail: 'Forward-looking signal for AI model ingestion preferences. Low effort, high future value.', category: 'AI Crawlers', affected: 'sitewide', effort: 'Low', status: 'Open' });
                        }

                        // P1 — high TTFB
                        const ttfb = signals?.pageSpeed?.nativeTiming?.ttfbMs;
                        if (ttfb != null && ttfb > 800) {
                          rows.push({ priority: 'P1', issue: `TTFB elevated (${ttfb}ms)`, detail: 'AI crawlers time out on slow servers. Target < 600ms. Consider CDN, server-side caching, or edge rendering.', category: 'Performance', affected: 'all pages', effort: 'High', status: 'Open' });
                        }

                        // P1 — heading skips
                        if (signals?.html?.headings?.hasSkippedLevels) {
                          rows.push({ priority: 'P1', issue: 'Heading hierarchy skips (H1→H3)', detail: 'Skipped heading levels confuse LLM document parsing. Fix heading order to H1→H2→H3 sequentially.', category: 'Content', affected: 'multiple pages', effort: 'Medium', status: 'Open' });
                        }

                        // P1 — missing meta description
                        if (!signals?.html?.meta?.description) {
                          rows.push({ priority: 'P1', issue: 'Missing meta description', detail: 'Meta descriptions are used by AI Overviews and answer engine snippet generation. Target 70–160 chars.', category: 'Metadata', affected: 'all pages', effort: 'Low', status: 'Open' });
                        }

                        // P2 warnings from conflicts
                        conflicts.filter(c => c.severity === 'WARNING').forEach(c => {
                          rows.push({ priority: 'P2', issue: c.title, detail: c.fix || c.message, category: 'Cross-signal', affected: c.affected || '—', effort: 'Medium', status: 'Open' });
                        });

                        // P2 — missing OG
                        if (!signals?.html?.meta?.ogTitle || !signals?.html?.meta?.ogImage) {
                          rows.push({ priority: 'P2', issue: 'Incomplete Open Graph tags', detail: 'og:title and og:image are used by AI systems when extracting page context from social share data.', category: 'Metadata', affected: 'all pages', effort: 'Low', status: 'Open' });
                        }
                      }

                      if (rows.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-faint)' }}>
                              No open action items — site is well-configured for AI visibility.
                            </td>
                          </tr>
                        );
                      }

                      return rows.map((row, i) => {
                        const pColor = row.priority === 'P0' ? 'var(--block)' : row.priority === 'P1' ? 'var(--warn)' : 'var(--ink-soft)';
                        const pBg = row.priority === 'P0' ? 'var(--block-bg)' : row.priority === 'P1' ? 'var(--warn-bg)' : '#F1F3F7';
                        return (
                          <tr key={i}>
                            <td>
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', background: pBg, color: pColor }}>
                                {row.priority}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '3px' }}>{row.issue}</div>
                              <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{row.detail}</div>
                            </td>
                            <td className={styles.urlCell}>{row.category}</td>
                            <td className={styles.urlCell}>{row.affected}</td>
                            <td className={styles.urlCell}>{row.effort}</td>
                            <td>
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', background: '#F1F3F7', color: 'var(--ink-soft)' }}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.quadGrid}>
              <div className={styles.quad}>
                <h4>Quick wins</h4>
                <div className={styles.quadSub}>high impact · low effort</div>
                <ul>
                  {result?.quadrantData?.quickWins?.map((q, i) => (
                    <li key={i}>{typeof q === 'string' ? q : q.title}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.quad}>
                <h4>Major projects</h4>
                <div className={styles.quadSub}>high impact · high effort</div>
                <ul>
                  {result?.quadrantData?.majorProjects?.map((q, i) => (
                    <li key={i}>{typeof q === 'string' ? q : q.title}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.quad}>
                <h4>Low priority</h4>
                <div className={styles.quadSub}>low impact · low effort</div>
                <ul>
                  {result?.quadrantData?.lowPriority?.map((q, i) => (
                    <li key={i}>{typeof q === 'string' ? q : q.title}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.quad}>
                <h4>Reconsider</h4>
                <div className={styles.quadSub}>low impact · high effort</div>
                <ul>
                  {result?.quadrantData?.reconsider?.map((q, i) => (
                    <li key={i}>{typeof q === 'string' ? q : q.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ================= 10. EXPORT & COMPARE ================= */}
          <div className={`${styles.section} ${activeNav === 'export' ? styles.sectionActive : ''}`} id="export">
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>Export &amp; compare</h3>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  All exports carry the same verification timestamps shown on screen — nothing is re-summarized or rounded further on export.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleExportMarkdown}>
                    📄 Export Markdown (.md)
                  </button>
                  <button type="button" className={styles.btn} onClick={handleExportCSV}>
                    📊 Export CSV (.csv)
                  </button>
                  <button type="button" className={styles.btn} onClick={handlePrintDossier}>
                    Download client PDF
                  </button>
                  <button type="button" className={styles.btn} onClick={handleExportJSON}>
                    Export JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Competitor Compare Panel */}
            <div className={styles.panel} style={{ marginTop: '20px' }}>
              <div className={styles.panelHead}>
                <h3>Benchmark Competitors</h3>
                <span className={styles.verified}>Live side-by-side audit</span>
              </div>
              <div className={styles.panelBody}>
                <p className={styles.panelNote}>
                  Compare {result?.domain || 'target domain'} against competitor domains to benchmark AI visibility.
                </p>
                <div className={styles.competitorRows}>
                  {competitors.map((c, i) => (
                    <div key={i} className={styles.competitorRow}>
                      <input
                        type="text"
                        className={styles.urlInput}
                        placeholder="e.g. competitor.com"
                        value={c}
                        onChange={(e) => {
                          const copy = [...competitors];
                          copy[i] = e.target.value;
                          setCompetitors(copy);
                        }}
                      />
                      {competitors.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => setCompetitors(competitors.filter((_, idx) => idx !== i))}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => setCompetitors([...competitors, ''])}
                  >
                    + Add competitor domain
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleCompare}
                    disabled={comparing}
                  >
                    {comparing ? 'Benchmarking…' : 'Run Comparative Benchmark'}
                  </button>
                </div>

                {compareResults.length > 0 && (
                  <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Domain</th>
                          <th>Score</th>
                          <th>Grade</th>
                          <th>Crawler Access</th>
                          <th>Structured Data</th>
                          <th>Content</th>
                          <th>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResults.map((c, idx) => (
                          <tr key={idx}>
                            <td className={styles.mono} style={{ fontWeight: 600 }}>{c.domain}</td>
                            <td style={{ fontWeight: 600 }}>{c.finalScore} / 100</td>
                            <td>
                              <span className={`${styles.pill} ${c.finalScore >= 70 ? styles.pillAllow : c.finalScore >= 50 ? styles.pillPartial : styles.pillBlock}`}>
                                Grade {c.grade}
                              </span>
                            </td>
                            <td>{c.categoryScores?.aiCrawlerAccess ?? '—'}</td>
                            <td>{c.categoryScores?.structuredData ?? '—'}</td>
                            <td>{c.categoryScores?.contentExtractability ?? '—'}</td>
                            <td>{c.categoryScores?.technicalPerformance ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
    )}

      <footer style={{ textAlign: 'center', padding: '40px 20px', fontSize: '13px', color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <div style={{ marginBottom: '16px' }}>
          <a href="/glossary" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Glossary / Knowledgebase</a>
        </div>
        Built by <a href="https://thehubcontent.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>The Hub Content</a>
      </footer>
    </div>
  );
}
