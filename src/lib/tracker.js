import fs from 'fs';
import path from 'path';

// Define the absolute path to the local DB file.
// We place it in the root folder, not src, so it doesn't trigger hot reloads during dev.
const DB_PATH = path.join(process.cwd(), 'scan-history.json');

function initializeDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ scans: [] }, null, 2), 'utf8');
  }
}

export async function logScan(scanData) {
  try {
    initializeDb();
    
    // Read the current data
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(rawData);
    
    // Create a new record
    const record = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      domain: scanData.domain || '',
      url: scanData.url || '',
      scanMode: scanData.scanMode || 'exact',
      pageType: scanData.pageType || 'Homepage',
      success: scanData.success || false,
      score: scanData.score || 0,
      grade: scanData.grade || 'F',
      durationMs: scanData.durationMs || 0,
      errorMsg: scanData.errorMsg || null,
    };
    
    // Add to the front of the list
    db.scans.unshift(record);
    
    // Cap at 10,000 records so the file doesn't grow infinitely
    if (db.scans.length > 10000) {
      db.scans = db.scans.slice(0, 10000);
    }
    
    // Write back
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');

    // Option B: Live Zero-Cost Database via Google Sheets
    // If the webhook URL is set in Vercel environment variables, fire a POST request.
    // MUST AWAIT in serverless environments so the function doesn't sleep before the request finishes.
    if (process.env.GOOGLE_SHEET_WEBHOOK) {
      console.log('Sending data to Google Sheets Webhook...');
      try {
        const res = await fetch(process.env.GOOGLE_SHEET_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        console.log(`Google Sheets Webhook Response Status: ${res.status}`);
        if (!res.ok) {
           const text = await res.text();
           console.error('Webhook failed with response:', text);
        }
      } catch (err) {
        console.error('Webhook Fetch Error:', err);
      }
    } else {
      console.log('Skipping Google Sheets: GOOGLE_SHEET_WEBHOOK environment variable is not set.');
    }

    return record;
  } catch (error) {
    console.error('Failed to log scan:', error);
    return null;
  }
}

export function getStats() {
  try {
    initializeDb();
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(rawData);
    
    const scans = db.scans;
    const totalScans = scans.length;
    const successfulScans = scans.filter(s => s.success).length;
    
    // Calculate unique domains
    const uniqueDomains = new Set();
    scans.forEach(s => {
      if (s.domain) uniqueDomains.add(s.domain);
    });

    const averageScore = successfulScans > 0 
      ? Math.round(scans.filter(s => s.success).reduce((sum, s) => sum + s.score, 0) / successfulScans) 
      : 0;

    return {
      totalScans,
      successRate: totalScans > 0 ? Math.round((successfulScans / totalScans) * 100) : 0,
      uniqueDomainsCount: uniqueDomains.size,
      averageScore,
      recentScans: scans.slice(0, 100) // Return top 100 for the dashboard
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return {
      totalScans: 0,
      successRate: 0,
      uniqueDomainsCount: 0,
      averageScore: 0,
      recentScans: [],
      error: 'Failed to read database'
    };
  }
}
