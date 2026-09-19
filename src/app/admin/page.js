'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?key=${key}`);
      if (!res.ok) throw new Error('Unauthorized or failed to fetch');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1117', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ marginBottom: '20px' }}>Admin Dashboard Login</h1>
        <form onSubmit={fetchStats} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="password" 
            value={key} 
            onChange={e => setKey(e.target.value)} 
            placeholder="Enter admin key"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #30363D', background: '#010409', color: '#fff' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '4px', background: '#238636', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        {error && <div style={{ color: '#F85149', marginTop: '16px' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', color: '#E6EDF3', fontFamily: 'system-ui, sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363D', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1>AI Visibility - Admin Tracking</h1>
          <button onClick={fetchStats} style={{ padding: '8px 16px', borderRadius: '4px', background: '#21262D', color: '#C9D1D9', border: '1px solid #30363D', cursor: 'pointer' }}>Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#161B22', padding: '24px', borderRadius: '8px', border: '1px solid #30363D' }}>
            <div style={{ fontSize: '13px', color: '#8B949E', marginBottom: '8px' }}>Total Audits Run</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{stats.totalScans}</div>
          </div>
          <div style={{ background: '#161B22', padding: '24px', borderRadius: '8px', border: '1px solid #30363D' }}>
            <div style={{ fontSize: '13px', color: '#8B949E', marginBottom: '8px' }}>Success Rate</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#238636' }}>{stats.successRate}%</div>
          </div>
          <div style={{ background: '#161B22', padding: '24px', borderRadius: '8px', border: '1px solid #30363D' }}>
            <div style={{ fontSize: '13px', color: '#8B949E', marginBottom: '8px' }}>Unique Domains</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{stats.uniqueDomainsCount}</div>
          </div>
          <div style={{ background: '#161B22', padding: '24px', borderRadius: '8px', border: '1px solid #30363D' }}>
            <div style={{ fontSize: '13px', color: '#8B949E', marginBottom: '8px' }}>Avg Score</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#58A6FF' }}>{stats.averageScore}/100</div>
          </div>
        </div>

        <h3>Recent Audits</h3>
        <div style={{ background: '#161B22', borderRadius: '8px', border: '1px solid #30363D', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363D', background: '#21262D' }}>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Domain</th>
                <th style={{ padding: '12px 16px' }}>Path</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Score</th>
                <th style={{ padding: '12px 16px' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentScans?.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#8B949E' }}>No audits logged yet.</td>
                </tr>
              )}
              {stats.recentScans?.map((scan, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #30363D' }}>
                  <td style={{ padding: '12px 16px', color: '#8B949E' }}>{new Date(scan.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{scan.domain}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={scan.url}>{new URL(scan.url).pathname}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', background: '#30363D', fontSize: '11px' }}>{scan.pageType}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    {scan.success ? <span style={{ color: '#3FB950' }}>Success</span> : <span style={{ color: '#F85149' }}>Failed</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{scan.success ? `${scan.score} (${scan.grade})` : '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#8B949E' }}>{scan.durationMs ? `${(scan.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
