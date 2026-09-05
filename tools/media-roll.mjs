#!/usr/bin/env node
/**
 * media-roll.mjs — print the embedded-media roll (Markdown table) from
 * js/data.js `mediaAssets`, for CONTENT_LICENSE.md.
 *
 *   node tools/media-roll.mjs
 */
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
const win = {};
new Function('window', src)(win);
const assets = win.tampaData.mediaAssets || [];
console.log('| # | Title | Year | Era | License | Credit | Record |');
console.log('|---|---|---|---|---|---|---|');
assets.forEach((a, i) => {
  const rec = a.upstreamUrl ? `[${a.upstreamArchive || 'archive'}](${a.upstreamUrl}) · [file page](${a.sourceUrl})` : `[file page](${a.sourceUrl})`;
  console.log(`| ${i + 1} | ${a.title} | ${a.year} | ${a.era || ''} | ${a.license} | ${a.creditLine} | ${rec} |`);
});
console.error(`${assets.length} assets`);
