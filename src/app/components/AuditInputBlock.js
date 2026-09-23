'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleAuditSubmit = (targetUrl) => {
    const rawUrl = targetUrl || inputUrl;
    if (!rawUrl.trim()) return;

    let cleanUrl = rawUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const consolePath = `/?url=${encodeURIComponent(cleanUrl)}&mode=${scanMode}&pageType=${encodeURIComponent(pageType)}&autoScan=true#console`;
    router.push(consolePath);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuditSubmit();
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

        <form onSubmit={handleSubmit}>
          {/* Scan mode radios */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: scanMode === 'exact' ? '#14171C' : '#565E6D' }}>
              <input
                type="radio"
                name={`scanModeChoice-${pageType}`}
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
                name={`scanModeChoice-${pageType}`}
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

        {/* Quick Picks */}
        {quickPicks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#565E6D' }}>
            <span style={{ fontWeight: 500 }}>Quick test:</span>
            {quickPicks.map(domain => (
              <button
                key={domain}
                type="button"
                onClick={() => { setInputUrl(domain); handleAuditSubmit(domain); }}
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
    </div>
  );
}
