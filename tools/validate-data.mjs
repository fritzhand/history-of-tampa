#!/usr/bin/env node
/**
 * validate-data.mjs — schema and sanity checks for a cited data layer.
 *
 *   node tools/validate-data.mjs                  # js/data.js (downtown)
 *   node tools/validate-data.mjs js/ybor-data.js  # any other dataset
 *   node tools/validate-data.mjs --all            # every dataset in js/
 *
 * Checks every `source` object for the citation fields the plan requires,
 * map coordinates against the dataset's OWN study area, scroll-step and
 * event cross-references, media license policy, and the hero-stat rule
 * (hero numbers must be CONFIRMED).
 *
 * The study-area box and the set of valid era slugs are read from the data
 * itself (`meta.studyArea.boundingBox`, `eraMilestones`), so a second study
 * of a different place is checked against its own geography rather than
 * against downtown Tampa's.
 */
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DATASET = 'js/data.js';
const root = new URL('../', import.meta.url);
const argv = process.argv.slice(2);
const datasets = argv.includes('--all')
  ? fs.readdirSync(new URL('js/', root)).filter(f => /(^|-)data\.js$/.test(f)).sort().map(f => 'js/' + f)
  : (argv.filter(a => !a.startsWith('--')).length ? argv.filter(a => !a.startsWith('--')) : [DEFAULT_DATASET]);

let failed = 0;
for (const rel of datasets) {
  if (datasets.length > 1) console.log(`\n── ${rel} ${'─'.repeat(Math.max(0, 60 - rel.length))}`);
  failed += checkDataset(rel) ? 0 : 1;
}
process.exit(failed ? 1 : 0);

function checkDataset(rel) {
const src = fs.readFileSync(new URL(rel, root), 'utf8');
const win = {};
new Function('window', src)(win);
const d = win.tampaData;
if (!d) { console.log(`ERROR ${rel}: does not define window.tampaData`); return false; }

const errors = [], warnings = [];
const STATUS = new Set(['CONFIRMED', 'PENDING', 'DERIVED']);
const ACCESS = new Set(['FREE', 'REGISTRATION', 'PAYWALL', 'API']);
// Era slugs: a dataset may declare them outright in meta.eraSlugs. Otherwise
// they are derived from the eraMilestones labels, which carry the display name
// and the span ("Depression/War\n1929-1945"). Only the leading word is the
// slug, because records key on `depression`, not `depression-war`.
const eraSlug = e => String(e || '').split(/[\s/\n]/)[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
const declaredEras = (d.meta && Array.isArray(d.meta.eraSlugs) && d.meta.eraSlugs.length)
  ? d.meta.eraSlugs
  : (d.eraMilestones || []).map(m => eraSlug(m.era)).filter(Boolean);
const PHASES = new Set(declaredEras.length ? declaredEras
  : ['fortress', 'boomtown', 'metropolis', 'depression', 'suburban', 'renewal', 'revival', 'waterfront']);
const LICENSES = /^(PD|Public domain|PD-US|PD-USGov|CC0|CC BY( \d\.\d)?|CC BY-SA( \d\.\d)?|CC-BY(-SA)?( \d\.\d)?)/i;
// The study area is the dataset's own, declared in meta. Falling back to the
// downtown box for a dataset that does not declare one would silently check a
// second study against the first one's geography.
const bb = (d.meta && d.meta.studyArea && d.meta.studyArea.boundingBox) || null;
const PAD = 0.02;   // events just outside a tight study box warn, not error
const BBOX = bb
  ? { latMin: bb.south - PAD, latMax: bb.north + PAD, lngMin: bb.west - PAD, lngMax: bb.east + PAD }
  : { latMin: 27.90, latMax: 28.00, lngMin: -82.52, lngMax: -82.40 };
const inBox = (lat, lng) => lat >= BBOX.latMin && lat <= BBOX.latMax && lng >= BBOX.lngMin && lng <= BBOX.lngMax;

const statusCounts = { CONFIRMED: 0, PENDING: 0, DERIVED: 0 };
function checkSource(s, where) {
  if (!s) { errors.push(`${where}: missing source`); return; }
  if (typeof s === 'string') { warnings.push(`${where}: source is a free-text string, not a source object`); return; }
  if (Array.isArray(s)) { s.forEach((x, i) => checkSource(x, `${where}[${i}]`)); return; }
  for (const k of ['institution', 'date', 'url']) if (!s[k]) errors.push(`${where}: source.${k} missing`);
  if (s.url && !/^https?:\/\//.test(s.url)) errors.push(`${where}: source.url is not http(s)`);
  if (!STATUS.has(s.verificationStatus)) errors.push(`${where}: verificationStatus "${s.verificationStatus}" invalid`);
  else statusCounts[s.verificationStatus]++;
  if (!ACCESS.has(s.accessType)) errors.push(`${where}: accessType "${s.accessType}" invalid`);
  if (s.verificationStatus === 'DERIVED' && !s.note) warnings.push(`${where}: DERIVED without a methodology note`);
}

// Walk every section: arrays of cited points, and object sections (the
// sankeys) that carry one source for the whole model.
for (const [name, val] of Object.entries(d)) {
  if (Array.isArray(val)) {
    val.forEach((row, i) => {
      if (row && typeof row === 'object' && 'source' in row) checkSource(row.source, `${name}[${i}]`);
    });
  } else if (val && typeof val === 'object' && 'source' in val) {
    checkSource(val.source, name);
  }
}

// mapEvents
const ids = new Set();
(d.mapEvents || []).forEach((ev, i) => {
  const w = `mapEvents[${i}] (${ev.id})`;
  if (!ev.id) errors.push(`${w}: missing id`); else if (ids.has(ev.id)) errors.push(`${w}: duplicate id`); else ids.add(ev.id);
  if (!PHASES.has(ev.phase)) errors.push(`${w}: phase "${ev.phase}" unknown`);
  if (typeof ev.lat !== 'number' || typeof ev.lng !== 'number') errors.push(`${w}: lat/lng missing`);
  else if (!inBox(ev.lat, ev.lng)) warnings.push(`${w}: coordinates ${ev.lat},${ev.lng} outside study bbox`);
  if (!('source' in ev)) errors.push(`${w}: missing source`);
});
(d.scrollSteps || []).forEach((st, i) => {
  const w = `scrollSteps[${i}] (${st.eventId})`;
  if (!ids.has(st.eventId)) errors.push(`${w}: eventId not in mapEvents`);
  if (!PHASES.has(st.phase)) errors.push(`${w}: phase "${st.phase}" unknown`);
  if (st.flyTo && !inBox(st.flyTo[0], st.flyTo[1])) warnings.push(`${w}: flyTo outside study bbox`);
});
(d.events || []).forEach((ev, i) => {
  if (ev.yearOffset !== ev.year - 1824) errors.push(`events[${i}] (${ev.year}): yearOffset ${ev.yearOffset} != year-1824`);
});

// media
(d.mediaAssets || []).forEach((a, i) => {
  const w = `mediaAssets[${i}] (${a.id})`;
  for (const k of ['id', 'title', 'year', 'thumbUrl', 'sourceUrl', 'license', 'creditLine']) if (!a[k]) errors.push(`${w}: ${k} missing`);
  if (a.license && !LICENSES.test(a.license)) errors.push(`${w}: license "${a.license}" is not in the embed-allowed set`);
  if (a.era && !PHASES.has(a.era)) errors.push(`${w}: era "${a.era}" unknown`);
  if (a.thumbUrl && !/^https:\/\//.test(a.thumbUrl)) errors.push(`${w}: thumbUrl must be https`);
});

// Renderer contract. js/app.js interpolates these straight into the template
// with no guard, so a record missing one puts the literal string "undefined" on
// the page. The schema checks above all passed while the live Ybor page showed
// 40 of them, because they check citations, not what the renderer reads.
const REQUIRED = {
  scrollSteps: ['date', 'phase', 'headline', 'narrative', 'metric_pop', 'metric_port'],
  mapEvents:   ['id', 'date', 'phase', 'title', 'body'],
  heroStats:   ['value', 'label'],
  footerStats: ['value', 'label'],
};
for (const [key, fields] of Object.entries(REQUIRED)) {
  (d[key] || []).forEach((row, i) => {
    for (const f of fields) {
      if (row[f] === undefined || row[f] === null || row[f] === '') {
        errors.push(`${key}[${i}]${row.id ? ` (${row.id})` : ''}: missing "${f}" — app.js renders this unguarded, so the page would print "undefined"`);
      }
    }
  });
}
// Steps point at events and at media by id; a dangling reference renders empty.
const eventIds = new Set((d.mapEvents || []).map(e => e.id));
const mediaIds = new Set((d.mediaAssets || []).map(a => a.id));
(d.scrollSteps || []).forEach((st, i) => {
  if (st.eventId && !eventIds.has(st.eventId)) errors.push(`scrollSteps[${i}]: eventId "${st.eventId}" matches no mapEvent`);
  (st.media || []).forEach(m => { if (!mediaIds.has(m)) errors.push(`scrollSteps[${i}]: media id "${m}" matches no mediaAsset`); });
});

// hero rule
(d.heroStats || []).forEach((s, i) => {
  const st = s.source && s.source.verificationStatus;
  if (st !== 'CONFIRMED') errors.push(`heroStats[${i}] (${s.label}): hero numbers must be CONFIRMED (is ${st})`);
});

// land use rows sum to 100
(d.landUseShare || []).forEach((r, i) => {
  const sum = ['residential', 'retail', 'industrial', 'civic', 'vacant'].reduce((n, k) => n + (r[k] || 0), 0);
  if (Math.abs(sum - 100) > 0.5) warnings.push(`landUseShare[${i}] (${r.year}): shares sum to ${sum}`);
});

console.log(`sections: ${Object.keys(d).length} · sources by status: ${JSON.stringify(statusCounts)} · mapEvents: ${(d.mapEvents || []).length} · scrollSteps: ${(d.scrollSteps || []).length} · mediaAssets: ${(d.mediaAssets || []).length}`);
if (PHASES.size) console.log(`eras: ${[...PHASES].join(', ')}`);
warnings.forEach(w => console.log('WARN  ' + w));
errors.forEach(e => console.log('ERROR ' + e));
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
return errors.length === 0;
}
