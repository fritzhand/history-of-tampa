/**
 * data-io.mjs — load js/data.js as an object and write it back in a
 * canonical, diff-friendly layout (one data point per line, source objects
 * inline). Used by apply-audit.mjs; can also be run directly to normalise:
 *
 *   node tools/data-io.mjs            # rewrite js/data.js in canonical form
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const DATA_PATH = new URL('../js/data.js', import.meta.url);

export function loadData() {
  const src = fs.readFileSync(DATA_PATH, 'utf8');
  const win = {};
  new Function('window', src)(win);
  const header = src.match(/^\/\*\*[\s\S]*?\*\/\n/);
  return { data: win.tampaData, header: header ? header[0] : '' };
}

const KEY_ORDER = ['id', 'year', 'eventId', 'project', 'district', 'era', 'label', 'date', 'phase', 'title', 'headline'];
function keyRank(k) { const i = KEY_ORDER.indexOf(k); return i === -1 ? 50 : i; }
function orderedKeys(o) {
  const keys = Object.keys(o);
  return keys.sort((a, b) => {
    const ra = a === 'source' || a === 'note' ? 100 + (a === 'note' ? 0 : 1) : keyRank(a);
    const rb = b === 'source' || b === 'note' ? 100 + (b === 'note' ? 0 : 1) : keyRank(b);
    return ra - rb || keys.indexOf(a) - keys.indexOf(b);
  });
}
const q = s => JSON.stringify(s);
function isPlain(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function inlineObj(o) {
  return '{ ' + orderedKeys(o).map(k => `${k}: ${fmt(o[k], 0, true)}`).join(', ') + ' }';
}
function fmt(v, indent, inline) {
  const pad = ' '.repeat(indent);
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return q(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    if (v.every(x => typeof x !== 'object' || x === null)) return '[' + v.map(x => fmt(x, 0, true)).join(', ') + ']';
    return '[\n' + v.map(x => pad + '  ' + fmt(x, indent + 2, false)).join(',\n') + '\n' + pad + ']';
  }
  if (isPlain(v)) {
    const keys = orderedKeys(v);
    const hasNested = keys.some(k => Array.isArray(v[k]) && v[k].some(x => typeof x === 'object' && x !== null));
    if (inline || !hasNested) {
      // data point: put `source` on its own continuation line for readability
      const parts = keys.map(k => `${k}: ${fmt(v[k], indent + 2, true)}`);
      const srcIdx = keys.indexOf('source');
      if (!inline && srcIdx !== -1 && parts.length > 1) {
        const before = parts.slice(0, srcIdx), after = parts.slice(srcIdx + 1);
        return '{ ' + before.join(', ') + (before.length ? ',' : '') + '\n' + pad + '  ' + [parts[srcIdx], ...after].join(', ') + ' }';
      }
      return '{ ' + parts.join(', ') + ' }';
    }
    return '{\n' + keys.map(k => pad + '  ' + k + ': ' + fmt(v[k], indent + 2, false)).join(',\n') + '\n' + pad + '}';
  }
  return String(v);
}

export function serialize(data, header) {
  const body = Object.keys(data).map(k => `  ${k}: ${fmt(data[k], 2, false)}`).join(',\n\n');
  return (header || '') + '\nwindow.tampaData = {\n\n' + body + '\n};\n\nwindow.crisisData = window.tampaData;\n';
}

export function saveData(data, header) {
  fs.writeFileSync(DATA_PATH, serialize(data, header));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { data, header } = loadData();
  saveData(data, header);
  console.log('js/data.js rewritten in canonical form');
}
