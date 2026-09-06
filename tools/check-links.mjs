#!/usr/bin/env node
/**
 * check-links.mjs — source-link audit for the Downtown Tampa autopsy.
 *
 * Extracts every http(s) URL from js/data.js and index.html (or the files you
 * pass), requests each one, and prints the HTTP status grouped by outcome.
 * Exit code 1 if any link looks genuinely dead.
 *
 *   node tools/check-links.mjs                  # data.js + index.html
 *   node tools/check-links.mjs js/data.js       # one file
 *   node tools/check-links.mjs --verbose        # list the OK links too
 *
 * Behind the agent proxy on Node >= 22.21:
 *   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tools/check-links.mjs
 *
 * Three things this script has to work around, learned the hard way:
 *
 *   1. Wikimedia file names contain parentheses — File:Foo_(12345).jpg — so a
 *      naive URL regex that stops at ")" truncates them into 404s. URLs are
 *      extracted with balanced-parenthesis matching instead.
 *   2. upload.wikimedia.org rate-limits bursts with 429. Requests are
 *      serialized per host with a delay, and a 429 is retried with backoff.
 *   3. www.loc.gov and www.floridamemory.com reject Node's fetch (403) but
 *      answer curl with a browser User-Agent. Anything that fetch reports as
 *      403/429 is re-checked with curl before being called dead.
 */
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const argv = process.argv.slice(2);
const VERBOSE = argv.includes('--verbose');
const files = argv.filter(a => !a.startsWith('--'));
const TARGETS = files.length ? files : ['js/data.js', 'index.html'];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const TIMEOUT_MS = 30000;
const HOST_DELAY_MS = 400;      // between requests to the same host
/* upload.wikimedia.org throttles a burst of image requests from one IP hard.
   The site itself is fine (browsers lazy-load a few at a time); the audit is
   what trips the limit, so slow it down and retry rather than cry wolf. */
const SLOW_HOSTS = { 'upload.wikimedia.org': 1500 };
const THROTTLE_RETRIES = 3;
const MAX_HOSTS_IN_FLIGHT = 6;  // distinct hosts probed at once

/* Hosts that answer automated clients with a challenge. A 403 from these is
   reported as "blocked", not "dead" — verify in a browser before removing. */
const CHALLENGE_HOSTS = new Set(['www.floridamemory.com', 'floridamemory.com', 'www.loc.gov', 'tile.loc.gov']);

/* Hosts where a 429 means "you are auditing too fast", not "this link is dead". */
const THROTTLE_HOSTS = new Set(['upload.wikimedia.org', 'commons.wikimedia.org']);

/* ── URL extraction with balanced parens ───────────────────────────── */
function extractUrls(text) {
  const out = [];
  const re = /https?:\/\//g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let i = m.index, depth = 0, end = i;
    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (/[\s"'<>\\`]/.test(c)) { end = j; break; }
      if (c === '(') depth++;
      else if (c === ')') { if (depth === 0) { end = j; break; } depth--; }
      else if (c === ']') { end = j; break; }
      end = j + 1;
    }
    let url = text.slice(i, end).replace(/[.,;:!?]+$/, '');
    out.push(url);
    re.lastIndex = end;
  }
  return out;
}

const urls = new Map(); // url -> Set(file)
for (const f of TARGETS) {
  const text = fs.readFileSync(f, 'utf8');
  for (const u of extractUrls(text)) {
    if (/\{[a-z]\}/.test(u)) continue;                            // tile URL templates
    if (u === 'http://www.w3.org/2000/svg') continue;             // SVG namespace
    if (/^https?:\/\/fonts\.g(oogleapis|static)\.com\/?$/.test(u)) continue;  // preconnect origins
    if (!urls.has(u)) urls.set(u, new Set());
    urls.get(u).add(f);
  }
}

/* ── probes ────────────────────────────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchProbe(url, method) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method, redirect: 'follow', signal: ctl.signal,
      headers: { 'user-agent': UA, 'accept': 'text/html,application/json,image/*,*/*;q=0.8', 'accept-language': 'en-US,en;q=0.9' }
    });
    if (method === 'GET') { try { await r.body?.cancel(); } catch {} }
    return { status: r.status, final: r.url };
  } catch (e) {
    return { status: 0, err: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message) };
  } finally { clearTimeout(t); }
}

async function curlProbe(url) {
  try {
    const { stdout } = await execFileAsync('curl', [
      '-sS', '-o', '/dev/null', '-L', '--max-time', '30', '-A', UA,
      '-w', '%{http_code} %{url_effective}', url
    ], { timeout: TIMEOUT_MS + 5000 });
    const [code, ...rest] = stdout.trim().split(' ');
    return { status: parseInt(code, 10) || 0, final: rest.join(' '), via: 'curl' };
  } catch {
    return { status: 0, err: 'curl failed', via: 'curl' };
  }
}

async function probe(url) {
  let r = await fetchProbe(url, 'HEAD');
  /* Some servers do not implement HEAD and answer it with 404 or 403 rather
     than 405 — npgallery.nps.gov serves the NRHP nomination PDFs that way.
     Always confirm a non-2xx HEAD with a real GET before believing it. */
  if (r.status < 200 || r.status >= 300) r = await fetchProbe(url, 'GET');
  for (let i = 0; r.status === 429 && i < THROTTLE_RETRIES; i++) {
    await sleep(4000 * (i + 1));
    r = await fetchProbe(url, 'GET');
  }
  // Hosts that fingerprint the client answer curl even when they refuse fetch.
  if (r.status === 403 || r.status === 429 || r.status === 0) {
    const c = await curlProbe(url);
    if (c.status >= 200 && c.status < 400) return c;
    return c.status ? { ...c, fetchStatus: r.status } : r;
  }
  return r;
}

/* ── run, serialized per host ──────────────────────────────────────── */
const byHost = new Map();
for (const u of urls.keys()) {
  let h;
  try { h = new URL(u).host; } catch { h = 'invalid'; }
  if (!byHost.has(h)) byHost.set(h, []);
  byHost.get(h).push(u);
}

const results = new Map();
const hosts = [...byHost.keys()];
let hostIdx = 0;
async function hostWorker() {
  while (hostIdx < hosts.length) {
    const host = hosts[hostIdx++];
    for (const u of byHost.get(host)) {
      results.set(u, await probe(u));
      await sleep(SLOW_HOSTS[host] ?? HOST_DELAY_MS);
    }
  }
}
await Promise.all(Array.from({ length: Math.min(MAX_HOSTS_IN_FLIGHT, hosts.length) }, hostWorker));

/* ── report ────────────────────────────────────────────────────────── */
const ok = [], blocked = [], dead = [];
for (const [u, r] of results) {
  const host = (() => { try { return new URL(u).host; } catch { return ''; } })();
  if (r.status >= 200 && r.status < 400) ok.push([u, r]);
  else if (CHALLENGE_HOSTS.has(host) && (r.status === 403 || r.status === 429)) blocked.push([u, r]);
  else if (THROTTLE_HOSTS.has(host) && r.status === 429) blocked.push([u, r]);
  else dead.push([u, r]);
}

const where = u => [...urls.get(u)].join(', ');
if (VERBOSE) {
  console.log(`── OK (${ok.length}) ──`);
  for (const [u, r] of ok.sort()) console.log(`${String(r.status).padEnd(4)} ${u}${r.via ? '  [curl]' : ''}`);
}
if (blocked.length) {
  console.log(`\n── Rate-limited or challenge-gated, not dead (${blocked.length}) ──`);
  for (const [u, r] of blocked.sort()) console.log(`${String(r.status).padEnd(4)} ${u}`);
}
if (dead.length) {
  console.log(`\n── Needs attention (${dead.length}) ──`);
  for (const [u, r] of dead.sort()) console.log(`${String(r.status || r.err).padEnd(6)} ${u}\n       in ${where(u)}`);
}
console.log(`\n${results.size} URLs checked · ${ok.length} ok · ${blocked.length} blocked-by-challenge · ${dead.length} need attention`);
process.exit(dead.length ? 1 : 0);
