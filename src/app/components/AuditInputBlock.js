'use client';

import { useState } from 'react';

export default function AuditInputBlock({
  pageType = 'Homepage',
  buttonText = 'Run Free AI Audit →',
  placeholder = 'https://your-domain.com',
  quickPicks = ['anthropic.com', 'openai.com', 'docs.stripe.com', 'wikipedia.org'],
  accentGradient = 'linear-gradient(135deg, #1348e4 0%, #6366f1 100%)',
  badgeText = 'AEO & GEO AUDIT'
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [scanMode, setScanMode] = useState('exact');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const runAudit = async (targetUrl) => {
    const urlToScan = targetUrl || inputUrl;
    if (!urlToScan.trim()) return;

    setScanning(true);
    setErrorMsg(null);
    setResult(null);
    setScanStep('Initializing diagnostic pipeline & fetching robots.txt…');

    try {
      const stepTimer1 = setTimeout(() => setScanStep('Parsing XML sitemaps & verifying page count…'), 1200);
      const stepTimer2 = setTimeout(() => setScanStep('Measuring server TTFB & Google PageSpeed insights…'), 2800);
      const stepTimer3 = setTimeout(() => setScanStep('Extracting JSON-LD Schema & entity knowledge graphs…'), 4200);

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToScan.trim(),
          mode: scanMode,
          pageType: pageType
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Audit failed. Please verify the URL and try again.');
      }

      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Audit encountered an unexpected error.');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runAudit();
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* ── AUDIT FORM BOX ────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #DEE1E7',
        borderRadius: '16px',
        padding: '32px 28px',
        boxShadow: '0 4px 24px rgba(20, 23, 28, 0.06)',
        marginBottom: '28px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(19, 72, 228, 0.08)',
            border: '1px solid rgba(19, 72, 228, 0.2)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#1348e4',
            letterSpacing: '0.08em',
            marginBottom: '10px'
          }}>
            {badgeText}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif, Georgia)', fontWeight: 600, color: '#14171C' }}>
            Test Your Site's AI Visibility Instant Probe
          </h2>
          <p style={{ fontSize: '13.5px', color: '#565E6D', marginTop: '6px' }}>
            Run a live, real-time audit against 14 AI crawlers &amp; 80+ generative ranking signals.
          </p>
        </div>

        {scanning ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #DEE1E7', borderTopColor: '#1348e4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#14171C', marginBottom: '6px' }}>Auditing Live Domain…</div>
            <div style={{ fontSize: '13px', color: '#565E6D', fontFamily: 'var(--font-mono)' }}>{scanStep}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Scan mode radios */}
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: scanMode === 'exact' ? '#14171C' : '#565E6D' }}>
                <input
                  type="radio"
                  name="scanModeChoice"
                  value="exact"
                  checked={scanMode === 'exact'}
                  onChange={() => setScanMode('exact')}
                  style={{ accentColor: '#1348e4' }}
                />
                Exact URL Audit
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: scanMode === 'domain' ? '#14171C' : '#565E6D' }}>
                <input
                  type="radio"
                  name="scanModeChoice"
                  value="domain"
                  checked={scanMode === 'domain'}
                  onChange={() => setScanMode('domain')}
                  style={{ accentColor: '#1348e4' }}
                />
                Whole Domain Crawl
              </label>
            </div>

            {/* Input field + Button */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={placeholder}
                style={{
                  flex: '1 1 320px',
                  padding: '14px 18px',
                  fontSize: '15px',
                  border: '1.5px solid #DEE1E7',
                  borderRadius: '10px',
                  outline: 'none',
                  color: '#14171C',
                  background: '#F8FAFC',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1348e4'}
                onBlur={(e) => e.target.style.borderColor = '#DEE1E7'}
              />
              <button
                type="submit"
                disabled={!inputUrl.trim()}
                style={{
                  background: accentGradient,
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '10px',
                  cursor: inputUrl.trim() ? 'pointer' : 'not-allowed',
                  opacity: inputUrl.trim() ? 1 : 0.6,
                  boxShadow: '0 4px 14px rgba(19, 72, 228, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                {buttonText}
              </button>
            </div>
          </form>
        )}

        {/* Quick Picks */}
        {!scanning && quickPicks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#565E6D' }}>
            <span style={{ fontWeight: 500 }}>Quick test:</span>
            {quickPicks.map(domain => (
              <button
                key={domain}
                type="button"
                onClick={() => { setInputUrl(domain); runAudit(domain); }}
                style={{
                  background: '#F1F3F7',
                  border: '1px solid #DEE1E7',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: '#14171C',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)',
                  transition: 'background 0.15s'
                }}
              >
                {domain}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── ERROR DISPLAY ─────────────────────────────────────────── */}
      {errorMsg && (
        <div style={{
          background: '#FBEAE8',
          border: '1px solid #A6342A',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#A6342A',
          fontSize: '14px',
          marginBottom: '28px'
        }}>
          <strong>Audit Alert:</strong> {errorMsg}
        </div>
      )}

      {/* ── AUDIT RESULTS DASHBOARD (IN-LINE) ────────────────────── */}
      {result && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #DEE1E7',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          marginBottom: '40px'
        }}>
          {/* Header & Overall Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DEE1E7', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#565E6D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Audit Results for
              </div>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', color: '#14171C', fontWeight: 600 }}>
                {result.domain || result.url}
              </h3>
              <div style={{ fontSize: '12px', color: '#8A909C', marginTop: '2px' }}>
                Audited page: <span style={{ fontFamily: 'var(--font-mono)', color: '#14171C' }}>{result.url}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: result.finalScore >= 70 ? '#0D7A3E' : result.finalScore >= 50 ? '#A9720C' : '#A6342A', fontFamily: 'var(--font-serif)' }}>
                  {result.finalScore}<span style={{ fontSize: '1rem', color: '#8A909C' }}>/100</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#565E6D' }}>
                  AI Visibility Grade {result.grade || 'C'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                style={{
                  background: '#F1F3F7',
                  border: '1px solid #DEE1E7',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#14171C'
                }}
              >
                Clear &amp; Re-audit
              </button>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#14171C', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category Signal Breakdown
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {[
                { name: 'AI Crawler Access', score: result.categoryScores?.aiCrawlerAccess, weight: '25%' },
                { name: 'Structured Data (JSON-LD)', score: result.categoryScores?.structuredData, weight: '25%' },
                { name: 'Content & Readability', score: result.categoryScores?.contentExtractability, weight: '20%' },
                { name: 'Technical & Speed', score: result.categoryScores?.technicalPerformance, weight: '15%' },
                { name: 'Metadata & Indexation', score: result.categoryScores?.metadataHygiene, weight: '15%' },
              ].map(cat => (
                <div key={cat.name} style={{ background: '#F8FAFC', border: '1px solid #DEE1E7', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', color: '#565E6D', marginBottom: '6px' }}>{cat.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: (cat.score || 0) >= 70 ? '#0D7A3E' : (cat.score || 0) >= 50 ? '#A9720C' : '#A6342A' }}>
                      {cat.score ?? '—'}/100
                    </span>
                    <span style={{ fontSize: '11px', color: '#8A909C', fontFamily: 'var(--font-mono)' }}>w: {cat.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflicts & Fixes */}
          {result.conflicts && result.conflicts.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#14171C', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Critical AI Access Conflicts Detected ({result.conflicts.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.conflicts.map((conf, i) => (
                  <div key={i} style={{ background: conf.severity === 'CRITICAL' ? '#FBEAE8' : '#FBF1DD', border: `1px solid ${conf.severity === 'CRITICAL' ? '#A6342A' : '#A9720C'}`, borderRadius: '10px', padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: conf.severity === 'CRITICAL' ? '#A6342A' : '#A9720C', marginBottom: '4px' }}>
                      [{conf.severity}] {conf.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#14171C', marginBottom: '6px' }}>{conf.evidence}</div>
                    <div style={{ fontSize: '12px', color: '#565E6D' }}><strong>Fix:</strong> {conf.fix}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
