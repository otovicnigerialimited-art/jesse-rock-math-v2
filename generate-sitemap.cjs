/**
 * Production Sitemap Generator Script for Jesse Math Rockstar
 * Generates public/sitemap.xml during build execution
 */
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://jesse-math-rockstar-app.vercel.app';
const LAST_MOD = new Date().toISOString().split('T')[0];

const URLS = [
  { loc: `${DOMAIN}/`, priority: '1.0', changefreq: 'daily' }
];

const generateXml = () => {
  const urlEntries = URLS.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

const distPublicDir = path.join(__dirname, 'public');
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
}

fs.writeFileSync(path.join(distPublicDir, 'sitemap.xml'), generateXml());
console.log('✅ Production sitemap.xml successfully generated in public/sitemap.xml');
