#!/usr/bin/env node
/**
 * check-meta.mjs — social and structured metadata check for index.html.
 *
 *   node tools/check-meta.mjs                 # check the local file
 *   node tools/check-meta.mjs --live          # also fetch the deployed page
 *
 * Verifies the Open Graph and Twitter Card tags a crawler needs, that every
 * declared image and icon actually exists, that og:image really is the size it
 * claims (unfurls reserve the box from these numbers), and that the JSON-LD
 * block parses. Exits 1 on errors; warnings do not fail the run.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [], warnings = [], notes = [];

const attr = (tag, key) => {
  const m = new RegExp(`<meta[^>]*(?:property|name)=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i').exec(tag);
  if (!m) return null;
  const c = /content=["']([^"']*)["']/i.exec(m[0]);
  return c ? c[1] : null;
};
const meta = k => attr(html, k);
const link = rel => {
  const m = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*>`, 'i').exec(html);
  if (!m) return null;
  const h = /href=["']([^"']*)["']/i.exec(m[0]);
  return h ? h[1] : null;
};

/* ── required tags ───────────────────────────────────────────── */
const REQUIRED = [
  'og:title', 'og:description', 'og:type', 'og:url', 'og:image',
  'og:image:width', 'og:image:height', 'og:image:alt', 'og:site_name',
  'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
];
for (const k of REQUIRED) if (!meta(k)) errors.push(`missing <meta> ${k}`);

if (!/<title>[^<]+<\/title>/.test(html)) errors.push('missing <title>');
if (!meta('description')) errors.push('missing <meta name="description">');
if (!link('canonical')) errors.push('missing <link rel="canonical">');

const card = meta('twitter:card');
if (card && card !== 'summary_large_image') {
  warnings.push(`twitter:card is "${card}"; a 1200x630 image wants summary_large_image`);
}

/* ── absolute URLs: crawlers do not resolve relative paths ───── */
for (const k of ['og:url', 'og:image', 'twitter:image']) {
  const v = meta(k);
  if (v && !/^https?:\/\//.test(v)) errors.push(`${k} must be an absolute URL, got "${v}"`);
}

const canonical = link('canonical');
const ogUrl = meta('og:url');
if (canonical && ogUrl && canonical !== ogUrl) {
  warnings.push(`canonical (${canonical}) and og:url (${ogUrl}) disagree`);
}

/* ── length budgets: what actually renders in an unfurl ──────── */
const lim = (k, max) => {
  const v = meta(k);
  if (v && v.length > max) warnings.push(`${k} is ${v.length} chars; most clients truncate near ${max}`);
};
lim('og:title', 90);
lim('og:description', 200);
lim('twitter:title', 70);
lim('twitter:description', 200);

/* ── every declared local file must exist ────────────────────── */
const BASE = ogUrl || canonical || '';
const localOf = url => {
  if (!url) return null;
  if (!/^https?:\/\//.test(url)) return url.replace(/^\.?\//, '');
  if (BASE && url.startsWith(BASE)) return url.slice(BASE.length);
  return null; // genuinely remote, nothing to check on disk
};
const declared = [
  ['og:image', meta('og:image')],
  ['twitter:image', meta('twitter:image')],
  ['icon', link('icon')],
  ['apple-touch-icon', link('apple-touch-icon')],
];
for (const [label, url] of declared) {
  const rel = localOf(url);
  if (!rel) continue;
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) errors.push(`${label} points at ${rel}, which does not exist`);
  else notes.push(`${label} -> ${rel} (${fs.statSync(abs).size} bytes)`);
}
/* the 32px png is declared with a sizes attribute, so rel="icon" alone misses it */
for (const m of html.matchAll(/<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*>/gi)) {
  const rel = localOf(m[1]);
  if (rel && !fs.existsSync(path.join(root, rel))) errors.push(`icon points at ${rel}, which does not exist`);
}

/* ── og:image really is the size it claims ───────────────────── */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
const imgRel = localOf(meta('og:image'));
if (imgRel) {
  const abs = path.join(root, imgRel);
  if (fs.existsSync(abs)) {
    const buf = fs.readFileSync(abs);
    const size = pngSize(buf);
    if (!size) warnings.push(`${imgRel} is not a PNG; og:image:type says ${meta('og:image:type') || '(unset)'}`);
    else {
      const dw = +meta('og:image:width'), dh = +meta('og:image:height');
      if (size.w !== dw || size.h !== dh) {
        errors.push(`og:image is ${size.w}x${size.h} but declares ${dw}x${dh}`);
      } else notes.push(`og:image is ${size.w}x${size.h}, as declared`);
      if (size.w < 600 || size.h < 315) errors.push('og:image is below the 600x315 minimum for a large card');
      const ratio = size.w / size.h;
      if (Math.abs(ratio - 1.91) > 0.06) warnings.push(`og:image aspect ${ratio.toFixed(2)}:1 is off the 1.91:1 unfurl box`);
    }
    if (buf.length > 5_000_000) errors.push(`og:image is ${(buf.length / 1e6).toFixed(1)}MB; keep it under 5MB`);
    else if (buf.length > 1_000_000) warnings.push(`og:image is ${(buf.length / 1e6).toFixed(2)}MB; under 1MB unfurls faster`);
  }
}

/* ── JSON-LD ─────────────────────────────────────────────────── */
const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
if (!ld) warnings.push('no JSON-LD structured data');
else {
  try {
    const d = JSON.parse(ld[1]);
    if (!d['@context'] || !d['@type']) errors.push('JSON-LD is missing @context or @type');
    else notes.push(`JSON-LD ${d['@type']} parses (${Object.keys(d).length} keys)`);
    if (d.image && d.image !== meta('og:image')) warnings.push('JSON-LD image and og:image disagree');
  } catch (e) { errors.push(`JSON-LD does not parse: ${e.message}`); }
}

/* ── optional live check ─────────────────────────────────────── */
async function live() {
  const url = ogUrl || canonical;
  if (!url) { warnings.push('--live needs og:url or a canonical link'); return; }
  const get = async (u, as) => {
    const r = await fetch(u, { headers: { 'user-agent': as } });
    return r;
  };
  const CRAWLER = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
  const page = await get(url, CRAWLER);
  if (!page.ok) { errors.push(`live page ${url} returned ${page.status}`); return; }
  const body = await page.text();
  for (const k of REQUIRED) {
    if (!new RegExp(`(?:property|name)=["']${k}["']`).test(body)) errors.push(`live page is missing ${k} (stale deploy?)`);
  }
  notes.push(`live page ${page.status}, ${body.length} bytes, as a crawler`);
  for (const [label, u] of declared) {
    if (!u || !/^https?:\/\//.test(u)) continue;
    const r = await get(u, CRAWLER);
    if (!r.ok) errors.push(`live ${label} ${u} returned ${r.status}`);
    else notes.push(`live ${label} ${r.status} ${r.headers.get('content-type')}`);
  }
}

const run = process.argv.includes('--live') ? live() : Promise.resolve();
run.catch(e => errors.push(`live check failed: ${e.message}`)).then(() => {
  notes.forEach(n => console.log('  ' + n));
  warnings.forEach(w => console.log('WARN  ' + w));
  errors.forEach(e => console.log('ERROR ' + e));
  console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
});
