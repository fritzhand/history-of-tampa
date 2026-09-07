#!/usr/bin/env node
/**
 * render-linkedin.mjs — regenerate assets/linkedin/*.png from tools/linkedin-cards.html.
 *
 *   node tools/render-linkedin.mjs
 *
 * Renders every `.card[data-card]` in the source at 2x (so the type is crisp),
 * then downsamples each to exactly 1080x1350 — LinkedIn's 4:5 portrait, the
 * tallest slot the feed gives an image post. Files are named `<NN>-<slug>.png`
 * from the data-card attribute, so the upload order is the reading order.
 *
 * Needs playwright and sharp available to node, same as tools/render-card.mjs.
 * Set CHROME_PATH if playwright's bundled Chromium is not the one installed.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const src  = path.join(root, 'tools', 'linkedin-cards.html');
const dir  = path.join(root, 'assets', 'linkedin');
const W = 1080, H = 1350;   // LinkedIn 4:5 portrait

fs.mkdirSync(dir, { recursive: true });

let sharp;
try { sharp = (await import('sharp')).default; } catch {
  console.error('sharp is required so the 2x render can be downsampled to 1080x1350.');
  console.error('Install it (npm i sharp) and re-run.');
  process.exit(1);
}

const launch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const browser = await chromium.launch(launch);
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

// Same affordance as render-card.mjs: in a sandbox without direct egress every
// request is fulfilled through node, so the proxy applies and the webfont loads.
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

// A displayed box that disagrees with the file's own aspect ratio is a crop.
// Archival photographs are composed to their edges, so a crop here silently
// destroys the subject -- fail loudly rather than ship it.
const cropped = await page.evaluate(() => Array.from(document.images).map(i => {
  const r = i.getBoundingClientRect();
  const natural = i.naturalWidth / i.naturalHeight;
  const shown = r.width / r.height;
  return { src: (i.currentSrc || i.src).split('/').pop(), natural, shown,
           drift: Math.abs(shown - natural) / natural };
}).filter(x => x.drift > 0.02));
if (cropped.length) {
  console.error('\nCROPPED — displayed box does not match the image aspect:');
  for (const c of cropped) {
    console.error(`  ${c.src}: natural ${c.natural.toFixed(2)}, shown ${c.shown.toFixed(2)} (${(c.drift * 100).toFixed(0)}% off)`);
  }
  process.exit(1);
}

const names = await page.$$eval('.card[data-card]', els => els.map(e => e.dataset.card));
if (!names.length) { console.error('no .card[data-card] elements found in ' + src); process.exit(1); }

// A card that overflows its 1080x1350 box would ship as silently clipped copy,
// so measure before screenshotting and fail loudly instead.
const overflow = await page.$$eval('.card[data-card]', els => els
  .map(e => ({ card: e.dataset.card, h: e.scrollHeight, w: e.scrollWidth }))
  .filter(x => x.h > 1350 || x.w > 1080));

let n = 0;
for (const name of names) {
  const el = await page.$(`.card[data-card="${name}"]`);
  const big = await el.screenshot();
  const out = path.join(dir, `${name}.png`);
  await sharp(big).resize(W, H, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(out);
  console.log(`  ${path.relative(root, out)}  ${W}x${H}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  n++;
}
await browser.close();

console.log(`\nwrote ${n} cards to ${path.relative(root, dir)}/`);
if (overflow.length) {
  console.error('\nCLIPPED — these cards are taller or wider than 1080x1350:');
  for (const o of overflow) console.error(`  ${o.card}: ${o.w}x${o.h}`);
  process.exit(1);
}
console.log('no card overflows its 1080x1350 box.');
