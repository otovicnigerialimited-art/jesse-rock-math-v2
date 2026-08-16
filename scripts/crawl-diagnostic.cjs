/**
 * Crawl Diagnostic Debugging Script
 * Audits live deployment URL for hidden noindex tags, response headers, status codes & Googlebot blockages
 * Run with: node scripts/crawl-diagnostic.cjs <url>
 */
const https = require('https');
const http = require('http');

const TARGET_URL = process.argv[2] || 'https://jesse-math-rockstar-app.vercel.app/';

console.log(`\n======================================================`);
console.log(`🔍 STARTING PRODUCTION CRAWL DIAGNOSTIC AUDIT`);
console.log(`🎯 Target URL: ${TARGET_URL}`);
console.log(`======================================================\n`);

const googlebotHeaders = {
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

const req = https.get(TARGET_URL, { headers: googlebotHeaders }, (res) => {
  console.log(`📡 Response HTTP Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`\n--- CRITICAL HEADERS AUDIT ---`);
  
  const xRobotsTag = res.headers['x-robots-tag'];
  const contentType = res.headers['content-type'];
  const cacheControl = res.headers['cache-control'];

  console.log(`• X-Robots-Tag: ${xRobotsTag || 'NONE DETECTED'}`);
  console.log(`• Content-Type: ${contentType || 'NONE DETECTED'}`);
  console.log(`• Cache-Control: ${cacheControl || 'NONE DETECTED'}`);

  if (xRobotsTag && xRobotsTag.toLowerCase().includes('noindex')) {
    console.error(`\n❌ CATASTROPHIC ERROR: 'X-Robots-Tag: noindex' is active on this response!`);
  } else {
    console.log(`\n✅ HTTP Response Headers permit indexing.`);
  }

  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    console.log(`\n--- HTML BODY AUDIT ---`);
    
    // Check for meta robots noindex
    const metaRobotsMatch = rawData.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    if (metaRobotsMatch) {
      console.log(`• Meta Robots Tag: ${metaRobotsMatch[0]}`);
      if (metaRobotsMatch[1].toLowerCase().includes('noindex')) {
        console.error(`❌ CATASTROPHIC ERROR: HTML contains <meta name="robots" content="noindex">`);
      } else {
        console.log(`✅ Meta Robots directive permits indexing.`);
      }
    } else {
      console.log(`⚠️ Warning: No explicit <meta name="robots"> tag found in raw HTML body.`);
    }

    // Check canonical tag
    const canonicalMatch = rawData.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    if (canonicalMatch) {
      console.log(`• Canonical Tag: ${canonicalMatch[1]}`);
    } else {
      console.warn(`⚠️ Warning: No canonical <link rel="canonical"> tag found in HTML.`);
    }

    // Check title tag
    const titleMatch = rawData.match(/<title>([^<]*)<\/title>/i);
    if (titleMatch) {
      console.log(`• Page Title: "${titleMatch[1]}" (${titleMatch[1].length} chars)`);
    } else {
      console.error(`❌ Error: Page missing <title> tag.`);
    }

    console.log(`\n======================================================`);
    console.log(`🏁 CRAWL DIAGNOSTIC AUDIT COMPLETE`);
    console.log(`======================================================\n`);
  });
});

req.on('error', (err) => {
  console.error(`❌ Connection Error: ${err.message}`);
});
