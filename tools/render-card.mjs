#!/usr/bin/env node
/**
 * render-card.mjs — regenerate assets/og-image.png from tools/og-card.html.
 *
 *   node tools/render-card.mjs
 *
 * Renders the card at 2x in headless Chromium (so the type is crisp), then
 * downsamples to exactly 1200x630 — the size index.html declares. Run
 * `node tools/check-meta.mjs` afterwards; it reads the PNG header and will
 * fail if the file and the declaration disagree.
 *
 * Needs playwright and sharp available to node. In a sandbox without direct
 * egress, every request is fulfilled through node so the proxy applies.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const src  = path.join(root, 'tools', 'og-card.html');
const out  = path.join(root, 'assets', 'og-image.png');
const W = 1200, H = 630;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
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
await page.waitForTimeout(2500);
const big = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();

let sharp;
try { sharp = (await import('sharp')).default; } catch {
  fs.writeFileSync(out, big);
  console.log(`wrote ${out} at 2x (${W * 2}x${H * 2}) — sharp not installed, so it was NOT`);
  console.log(`downsampled. Either install sharp and re-run, or update og:image:width/height.`);
  process.exit(1);
}
await sharp(big).resize(W, H, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(out);
console.log(`wrote ${out} ${W}x${H}, ${fs.statSync(out).size} bytes`);
