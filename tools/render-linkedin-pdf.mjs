#!/usr/bin/env node
/**
 * render-linkedin-pdf.mjs — build assets/linkedin/downtown-tampa-carousel.pdf
 * from tools/linkedin-cards.html.
 *
 *   node tools/render-linkedin-pdf.mjs
 *
 * Seven 1080x1350 pages, one per card, for a LinkedIn document post.
 *
 * A note on the page box: 1350 CSS px is 1012.5pt, and Chromium's PDF export
 * rounds the media box to whole points, so pages measure 810 x 1013pt
 * (1080 x 1350.7px, a ratio of 0.7996 against 4:5's 0.8000). Declaring the
 * @page in points does not help -- it rounds that too. The 0.05 per cent is
 * invisible: the card paints its own background to the last row, checked on
 * the dark card. The PNGs from render-linkedin.mjs are exactly 1080x1350.
 *
 * The text
 * is printed as vector from the same source the PNGs come from, not stitched
 * from those PNGs, so it stays sharp at any zoom and the file stays small.
 *
 * Needs playwright, same as the other renderers. Set CHROME_PATH if
 * playwright's bundled Chromium is not the one installed.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const src  = path.join(root, 'tools', 'linkedin-cards.html');
const out  = path.join(root, 'assets', 'linkedin', 'downtown-tampa-carousel.pdf');
const W = 1080, H = 1350;   // LinkedIn 4:5 portrait

fs.mkdirSync(path.dirname(out), { recursive: true });

const launch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const browser = await chromium.launch(launch);
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();

await page.route('**/*', async r => {
  const u = r.request().url();
  if (u.startsWith('file:') || u.startsWith('data:')) return r.continue();
  try {
    const res = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const h = {}; const ct = res.headers.get('content-type'); if (ct) h['content-type'] = ct;
    await r.fulfill({ status: res.status, headers: h, body: Buffer.from(await res.arrayBuffer()) });
  } catch { await r.abort(); }
});

await page.goto('file://' + src, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
// The cards hydrate their archival photographs from js/data.js, so wait for
// the decode too — a half-loaded image would ship as a grey box.
await page.evaluate(() => Promise.all(
  Array.from(document.images).map(i => i.complete ? null : i.decode().catch(() => null))));
await page.waitForTimeout(2500);
const broken = await page.evaluate(() => Array.from(document.images)
  .filter(i => !i.naturalWidth).map(i => i.currentSrc || i.src));
if (broken.length) { console.error('images failed to load:'); broken.forEach(b => console.error('  ' + b)); process.exit(1); }

const cards = await page.$$eval('.card[data-card]', els => els.length);

// Chromium paginates from the print stylesheet, so the screen gutter has to be
// gone before the PDF is taken or every page inherits a slice of the next card.
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: out,
  width: `${W}px`,
  height: `${H}px`,
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  preferCSSPageSize: true,
});
await browser.close();

const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`wrote ${path.relative(root, out)}  ${W}x${H}  ${cards} cards  ${kb} KB`);
