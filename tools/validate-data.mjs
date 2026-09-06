#!/usr/bin/env node
/**
 * validate-data.mjs — schema and sanity checks for js/data.js.
 *
 *   node tools/validate-data.mjs        # exit 1 on errors
 *
 * Checks every `source` object for the citation fields the plan requires,
 * map coordinates against the downtown Tampa study area, scroll-step and
 * event cross-references, media license policy, and the hero-stat rule
 * (hero numbers must be CONFIRMED).
 */
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
const win = {};
new Function('window', src)(win);
const d = win.tampaData;

const errors = [], warnings = [];
const STATUS = new Set(['CONFIRMED', 'PENDING', 'DERIVED']);
const ACCESS = new Set(['FREE', 'REGISTRATION', 'PAYWALL', 'API']);
const PHASES = new Set(['fortress', 'boomtown', 'metropolis', 'depression', 'suburban', 'renewal', 'revival', 'waterfront']);
const LICENSES = /^(PD|Public domain|PD-US|PD-USGov|CC0|CC BY( \d\.\d)?|CC BY-SA( \d\.\d)?|CC-BY(-SA)?( \d\.\d)?)/i;
const BBOX = { latMin: 27.90, latMax: 28.00, lngMin: -82.52, lngMax: -82.40 };
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
warnings.forEach(w => console.log('WARN  ' + w));
errors.forEach(e => console.log('ERROR ' + e));
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
