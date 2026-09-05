#!/usr/bin/env node
/**
 * check-links.mjs — source-link audit for the Downtown Tampa autopsy.
 *
 * Extracts every http(s) URL from js/data.js and index.html (or the files
 * you pass), requests each one with a browser User-Agent, and prints the
 * HTTP status. Exit code 1 if any link is not 2xx/3xx.
 *
 *   node tools/check-links.mjs                 # data.js + index.html
 *   node tools/check-links.mjs js/data.js      # one file
 *
 * Behind a corporate proxy on Node >= 22.21: NODE_USE_ENV_PROXY=1 node tools/check-links.mjs
 *
 * Known caveats:
 *   - www.floridamemory.com answers automated clients with a Cloudflare
 *     challenge (403). A 403 there is not a dead link; verify in a browser.
 *   - Tile/font URL templates containing {s}/{z}/{x}/{y} are skipped.
 */
import fs from 'node:fs';

const files = process.argv.slice(2).length ? process.argv.slice(2) : ['js/data.js', 'index.html'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const CONCURRENCY = 8;
const TIMEOUT_MS = 25000;

const urls = new Map(); // url -> [file]
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]\\]+/g)) {
    const u = m[0].replace(/[.,;:!?]+$/, '');
    if (/\{[a-z]\}/.test(u)) continue;                       // tile / font URL templates
    if (/^http:\/\/www\.w3\.org\/2000\/svg$/.test(u)) continue; // SVG namespace, not a link
    if (/^https?:\/\/fonts\.g(oogleapis|static)\.com\/?$/.test(u)) continue; // preconnect origins
    if (!urls.has(u)) urls.set(u, []);
    urls.get(u).push(f);
  }
}

async function probe(url, method) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { method, redirect: 'follow', signal: ctl.signal,
      headers: { 'user-agent': UA, 'accept': 'text/html,application/json,*/*;q=0.8', 'accept-language': 'en-US,en;q=0.9' } });
    if (method === 'GET') { try { await r.body?.cancel(); } catch {} }
    return { status: r.status, final: r.url };
  } catch (e) {
    return { status: 0, err: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message) };
  } finally { clearTimeout(t); }
}

async function check(url) {
  let r = await probe(url, 'HEAD');
  if (r.status === 0 || r.status === 403 || r.status === 404 || r.status === 405 || r.status >= 500) r = await probe(url, 'GET');
  return { url, ...r };
}

const list = [...urls.keys()];
const results = [];
let i = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (i < list.length) { const u = list[i++]; results.push(await check(u)); }
}));

results.sort((a, b) => (a.status - b.status) || a.url.localeCompare(b.url));
let bad = 0;
for (const r of results) {
  const ok = r.status >= 200 && r.status < 400;
  if (!ok) bad++;
  const redirect = r.final && r.final !== r.url && r.final.replace(/\/$/, '') !== r.url.replace(/\/$/, '') ? `  -> ${r.final}` : '';
  console.log(`${String(r.status).padStart(3)}  ${r.url}${redirect}${r.err ? '  (' + r.err + ')' : ''}`);
}
console.log(`\n${results.length} URLs checked, ${bad} not OK`);
process.exit(bad ? 1 : 0);
