#!/usr/bin/env node
/**
 * apply-audit.mjs — apply a JSON patch file to js/data.js.
 *
 *   node tools/apply-audit.mjs patches.json
 *
 * patches.json: [
 *   { "section": "cityPopulation", "match": { "year": 1880 }, "set": { "pop": 720 },
 *     "source": { "institution": "...", "date": "...", "url": "...", "verificationStatus": "CONFIRMED", "accessType": "FREE" } },
 *   { "section": "mapEvents", "match": { "id": "fort-brooke" }, "set": { "lat": 27.94 }, "source": {...} },
 *   { "section": "displacement", "append": { ...row... } },
 *   { "section": "portActivity", "replace": [ ...rows... ] },
 *   { "section": "photoArchive", "delete": true }
 * ]
 * A patch with `source` merges it into the matched row's source object.
 */
import fs from 'node:fs';
import { loadData, saveData } from './data-io.mjs';

const file = process.argv[2];
if (!file) { console.error('usage: node tools/apply-audit.mjs patches.json'); process.exit(2); }
const patches = JSON.parse(fs.readFileSync(file, 'utf8'));
const { data, header } = loadData();
let applied = 0, missed = 0;

for (const p of patches) {
  if (p.delete) { delete data[p.section]; applied++; continue; }
  if (p.replace) { data[p.section] = p.replace; applied++; continue; }
  if (p.append) { (data[p.section] = data[p.section] || []).push(p.append); applied++; continue; }
  if (p.setSection) { data[p.section] = { ...(data[p.section] || {}), ...p.setSection }; applied++; continue; }
  const arr = data[p.section];
  if (!Array.isArray(arr)) { console.warn('no such array section', p.section); missed++; continue; }
  const row = arr.find(r => Object.entries(p.match || {}).every(([k, v]) => String(r[k]) === String(v)));
  if (!row) { console.warn('no match in', p.section, JSON.stringify(p.match)); missed++; continue; }
  if (p.set) Object.assign(row, p.set);
  if (p.unset) for (const k of p.unset) delete row[k];
  if (p.source) row.source = { ...(typeof row.source === 'object' && row.source ? row.source : {}), ...p.source };
  applied++;
}
saveData(data, header);
console.log(`applied ${applied} patches, ${missed} missed`);
process.exit(missed ? 1 : 0);
