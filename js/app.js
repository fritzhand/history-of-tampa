/**
 * app.js — Downtown Tampa: A Civic Development Autopsy
 *
 * Sections:
 *   1. Constants & Helpers
 *   2. Progress Bar
 *   3. Phase Legend
 *   4. Scrollytelling Map (Leaflet)
 *   5. Scroll Steps — Build & Observe
 *   6. Sandbox Map (Leaflet)
 *   7. Timeline Slider
 *   8. Sankey Drawing Engine (Custom SVG)
 *   9. Sankey Renders — Economy & Land Use
 *  10. Chart.js Charts
 *  11. District Impact Table
 *  12. Photo Archive
 *  13. Main Init
 */

'use strict';

const D = () => window.tampaData || window.crisisData || {};

const V = {
  v0:'#440154', v1:'#482878', v2:'#3e4989', v3:'#31688e',
  v4:'#26828e', v5:'#1f9e89', v6:'#35b779', v7:'#6ece58',
  v8:'#b5de2b', v9:'#fde725'
};

const PC = {
  fortress:'#482878', boomtown:'#3e4989', metropolis:'#31688e',
  depression:'#26828e', suburban:'#1f9e89', renewal:'#fde725',
  revival:'#6ece58', waterfront:'#35b779'
};

const BASE_YEAR = 1824;
const MAX_OFFSET = 200; // 1824–2024

function yearOfOffset(offset) {
  return BASE_YEAR + offset;
}

function closestByYear(arr, year, yearFn) {
  if (!arr || !arr.length) return null;
  const yf = yearFn || (d => d.year);
  return arr.reduce((best, cur) => {
    const bd = Math.abs(yf(best) - year);
    const cd = Math.abs(yf(cur) - year);
    return cd < bd ? cur : best;
  });
}

function eraStatus(year) {
  if (year < 1884) return 'fortress';
  if (year < 1915) return 'boomtown';
  if (year < 1929) return 'metropolis';
  if (year < 1945) return 'depression';
  if (year < 1963) return 'suburban';
  if (year < 1986) return 'renewal';
  if (year < 2009) return 'revival';
  return 'waterfront';
}

Chart.defaults.color          = '#555';
Chart.defaults.borderColor    = '#1e1e1e';
Chart.defaults.font.family    = "'Space Mono', monospace";
Chart.defaults.font.size      = 10;

const TIP = {
  backgroundColor:'#161616', borderColor:'#2a2a2a', borderWidth:1,
  titleColor:'#f0f0f0', bodyColor:'#999', padding:12,
  titleFont:{ family:"'Space Grotesk',sans-serif", weight:'700', size:12 },
  bodyFont:{ family:"'Space Mono',monospace", size:10 }
};

function mkScale(overrides = {}) {
  return {
    grid:  { color:'#1a1a1a' },
    ticks: { color:'#555', font:{ family:"'Space Mono',monospace", size:10 } },
    ...overrides
  };
}

function fmtNum(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1000000) return (n/1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  return String(n);
}

/* Basemap — key-free dark raster (Esri World Dark Gray Canvas).
   CARTO's basemaps.cartocdn.com now watermarks anonymous tiles with
   "API KEY REQUIRED", so the original dark_all layer is unusable
   without registering a key. Esri's canvas needs only attribution. */
const BASEMAP = {
  base:  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  label: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxNativeZoom: 16,
  maxZoom: 18
};

function addBasemap(map) {
  L.tileLayer(BASEMAP.base, {
    attribution: BASEMAP.attribution,
    maxNativeZoom: BASEMAP.maxNativeZoom, maxZoom: BASEMAP.maxZoom
  }).addTo(map);
  L.tileLayer(BASEMAP.label, {
    maxNativeZoom: BASEMAP.maxNativeZoom, maxZoom: BASEMAP.maxZoom, opacity: 0.85
  }).addTo(map);
}

/* Citation helpers.
   A `source` may be a legacy string, one source object
   { institution, date, url, note, verificationStatus, accessType },
   or an array of source objects. */
function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

function statusBadge(status) {
  if (!status) return '';
  const s = String(status).toUpperCase();
  return `<span class="src-badge src-${s.toLowerCase()}" title="Verification status: ${s}">${s}</span>`;
}

function sourceHtml(src, { badge = true } = {}) {
  if (!src) return '';
  if (Array.isArray(src)) return src.map(s => sourceHtml(s, { badge })).filter(Boolean).join(' · ');
  if (typeof src === 'string') return esc(src);
  const label = esc(src.institution || src.label || src.url || 'Source');
  const link  = src.url
    ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${label}</a>`
    : label;
  const date  = src.date ? ` (${esc(src.date)})` : '';
  return link + date + (badge ? ' ' + statusBadge(src.verificationStatus) : '');
}

/* Tooltip footer lines for one data point: note, estimate / status flag,
   and the citing institution. Chart.js accepts an array of lines. */
function pointFooter(d) {
  if (!d) return '';
  const lines = [];
  const note = d.note || (d.source && d.source.note);
  if (note) lines.push(note);
  const status = d.source && d.source.verificationStatus;
  const flags = [d.estimate ? 'estimate' : null, status && status !== 'CONFIRMED' ? status : null].filter(Boolean);
  if (flags.length) lines.push('Status: ' + flags.join(' · '));
  if (d.source && d.source.institution) {
    lines.push('Source: ' + d.source.institution + (d.source.date ? ', ' + d.source.date : ''));
  }
  return lines;
}

/* ═══════════════════════════════════════════════════════════════
   2. PROGRESS BAR
═══════════════════════════════════════════════════════════════ */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const dH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${dH > 0 ? Math.min(window.scrollY / dH, 1) : 0})`;
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   3. PHASE LEGEND
═══════════════════════════════════════════════════════════════ */
function buildPhaseLegend() {
  const c = document.getElementById('phase-pills-container');
  if (!c) return;
  Object.entries(PC).forEach(([phase, color]) => {
    const light = color === V.v8 || color === V.v9;
    const el = document.createElement('span');
    el.className = 'phase-pill';
    el.style.cssText = `background:${color};color:${light ? '#000' : '#fff'}`;
    el.innerHTML = `<span class="dot" style="background:${light ? '#000' : '#fff'}"></span>${phase.toUpperCase()}`;
    c.appendChild(el);
  });
}

/* ═══════════════════════════════════════════════════════════════
   4. SCROLLYTELLING MAP
═══════════════════════════════════════════════════════════════ */
let scrollMap     = null;
const scrollMkrs  = {};
let prevActiveId  = null;

function initScrollMap() {
  const el = document.getElementById('scroll-map-container');
  if (!el || typeof L === 'undefined') return;

  const center = D().meta?.center || [27.9475, -82.4563];
  scrollMap = L.map('scroll-map-container', {
    center, zoom: 14,
    zoomControl:false, scrollWheelZoom:false,
    dragging:false, touchZoom:false, doubleClickZoom:false, keyboard:false
  });

  addBasemap(scrollMap);

  (D().mapEvents || []).forEach(ev => {
    const color = PC[ev.phase] || V.v3;
    const m = L.circleMarker([ev.lat, ev.lng], {
      radius:5, fillColor:color,
      color:'rgba(255,255,255,0.35)', weight:1,
      fillOpacity:0.75, opacity:1
    }).bindPopup(
      `<div class="map-popup-date">${ev.date} · ${(ev.phase||'').toUpperCase()}</div>` +
      `<div class="map-popup-title">${ev.title}</div>` +
      `<div class="map-popup-body">${ev.body}</div>` +
      `<div class="map-popup-source">${sourceHtml(ev.source)}</div>`,
      { maxWidth:280 }
    ).addTo(scrollMap);
    scrollMkrs[ev.id] = { m, color };
  });
}

function activateMapStep(step) {
  if (!scrollMap) return;

  if (prevActiveId && scrollMkrs[prevActiveId]) {
    const p = scrollMkrs[prevActiveId];
    p.m.setRadius(5);
    p.m.setStyle({ fillOpacity:0.75, weight:1, color:'rgba(255,255,255,0.35)' });
  }

  const ev = (D().mapEvents || []).find(e => e.id === step.eventId);
  if (ev && scrollMkrs[ev.id]) {
    const cur = scrollMkrs[ev.id];
    cur.m.setRadius(12);
    cur.m.setStyle({ fillOpacity:1, weight:2.5, color:'#ffffff' });
    prevActiveId = ev.id;
  }

  if (step.flyTo && scrollMap) {
    scrollMap.flyTo(step.flyTo, step.zoom || 14, { animate:true, duration:1.1 });
  }
}

/* ═══════════════════════════════════════════════════════════════
   5. SCROLL STEPS
═══════════════════════════════════════════════════════════════ */
function buildScrollSteps() {
  const container = document.getElementById('scroll-steps-container');
  if (!container) return;

  (D().scrollSteps || []).forEach((step, idx) => {
    const color = PC[step.phase] || V.v3;
    const el = document.createElement('div');
    el.className = 'scroll-step';
    el.dataset.idx = idx;
    el.style.borderLeftColor = color;
    el.innerHTML = `
      <div class="step-phase-date" style="color:${color}">
        ${step.date}&nbsp;&nbsp;·&nbsp;&nbsp;${(step.phase||'').toUpperCase()}
      </div>
      <h3 class="step-headline">${step.headline}</h3>
      <p class="step-narrative">${step.narrative}</p>
      <div class="step-metrics">
        <div class="step-metric-chip">Population <strong>${step.metric_pop}</strong></div>
        <div class="step-metric-chip">Port index <strong>${step.metric_port}</strong></div>
        ${step.metric_note ? `<div class="step-metric-chip"><em style="color:#888">${step.metric_note}</em></div>` : ''}
      </div>
      <p class="step-source">
        ${sourceHtml(((D().mapEvents||[]).find(e => e.id === step.eventId)||{}).source)}
      </p>`;
    container.appendChild(el);
  });
}

function initScrollytelling() {
  const steps = document.querySelectorAll('.scroll-step');
  if (!steps.length) return;

  const oDate     = document.getElementById('map-overlay-date');
  const oHeadline = document.getElementById('map-overlay-headline');
  const oPop      = document.getElementById('map-overlay-pop');
  const oPort     = document.getElementById('map-overlay-port');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx  = +entry.target.dataset.idx;
      const step = (D().scrollSteps || [])[idx];
      if (!step) return;

      steps.forEach(s => s.classList.remove('is-active'));
      entry.target.classList.add('is-active');
      activateMapStep(step);

      if (oDate)     oDate.textContent     = `${step.date} · ${(step.phase||'').toUpperCase()}`;
      if (oHeadline) oHeadline.textContent = step.headline;
      if (oPop)      oPop.textContent      = step.metric_pop;
      if (oPort)     oPort.textContent     = step.metric_port;
    });
  }, { threshold:0.42, rootMargin:'-8% 0px -28% 0px' });

  steps.forEach(s => io.observe(s));
}

/* ═══════════════════════════════════════════════════════════════
   6. SANDBOX MAP
═══════════════════════════════════════════════════════════════ */
let sandboxMap = null;
let coreMarker = null;

function initSandboxMap() {
  const el = document.getElementById('sandbox-map-container');
  if (!el || typeof L === 'undefined') return;

  const center = D().meta?.center || [27.9475, -82.4563];
  sandboxMap = L.map('sandbox-map-container', {
    center, zoom: 13,
    zoomControl:true, scrollWheelZoom:false
  });

  addBasemap(sandboxMap);

  (D().mapEvents || []).forEach(ev => {
    const color = PC[ev.phase] || V.v3;
    L.circleMarker([ev.lat, ev.lng], {
      radius:5, fillColor:color,
      color:'rgba(255,255,255,0.25)', weight:1, fillOpacity:0.7
    }).bindPopup(
      `<div class="map-popup-date">${ev.date} · ${(ev.phase||'').toUpperCase()}</div>` +
      `<div class="map-popup-title">${ev.title}</div>` +
      `<div class="map-popup-body">${ev.body}</div>` +
      `<div class="map-popup-source">${sourceHtml(ev.source)}</div>`,
      { maxWidth:260 }
    ).addTo(sandboxMap);
  });

  coreMarker = L.circleMarker(center, {
    radius:16, fillColor:V.v5,
    color:'#ffffff', weight:2, fillOpacity:0.85
  }).bindTooltip('Downtown core', { permanent:false, direction:'top' })
    .addTo(sandboxMap);
}

function updateSandboxMap(status) {
  if (!coreMarker) return;
  const c = PC[status] || V.v5;
  coreMarker.setStyle({ fillColor: c });
}

/* ═══════════════════════════════════════════════════════════════
   7. TIMELINE SLIDER
═══════════════════════════════════════════════════════════════ */
function initSlider() {
  const slider = document.getElementById('era-slider');
  if (!slider) return;
  slider.addEventListener('input', () => updateSlider(+slider.value), { passive:true });
  updateSlider(0);
}

function updateSlider(offset) {
  const year = yearOfOffset(offset);
  const city = closestByYear(D().cityPopulation || [], year);
  const dt   = closestByYear(D().downtownResidents || [], year);
  const port = closestByYear(D().portActivity || [], year);
  const cig  = closestByYear(D().cigarProduction || [], year);
  const com  = closestByYear(D().commercialIntensity || [], year);
  const hot  = closestByYear(D().hotelRooms || [], year);
  const ev   = (D().events || []).filter(e => e.yearOffset <= offset).slice(-1)[0]
            || (D().events || [])[0];

  const status = eraStatus(year);

  const dEl = document.getElementById('slider-date-label');
  if (dEl) dEl.textContent = `📅 ${year} · Year ${offset} of 200`;

  const badge = document.getElementById('era-badge');
  if (badge) {
    badge.textContent = `ERA: ${status.toUpperCase()}`;
    badge.className   = `hormuz-badge open`;
    badge.style.borderColor = PC[status] || V.v5;
    badge.style.color = PC[status] || V.v5;
  }

  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('stat-city-pop', fmtNum(city?.pop));
  set('stat-dt-pop',   fmtNum(dt?.residents));
  set('stat-port',     String(port?.index ?? '—'));
  set('stat-cigar',    cig?.millions != null ? cig.millions + 'M' : '—');
  set('stat-commerce', String(com?.index ?? '—'));
  set('stat-hotels',   fmtNum(hot?.rooms));

  const evH = document.getElementById('sandbox-event-headline');
  const evB = document.getElementById('sandbox-event-body');
  if (ev) {
    if (evH) evH.textContent = `${ev.year} · ${ev.headline || '—'}`;
    if (evB) evB.textContent = ev.body || '—';
  }

  updateSandboxMap(status);
}

/* ═══════════════════════════════════════════════════════════════
   8. SANKEY ENGINE
═══════════════════════════════════════════════════════════════ */
function drawSankey(svgId, { nodes, links }) {
  const svgEl = document.getElementById(svgId);
  if (!svgEl) return;

  const W  = Math.max(svgEl.parentElement?.clientWidth || 0, 680);
  const H  = parseInt(svgEl.style.height) || 380;
  const PAD = { top:40, right:128, bottom:10, left:10 };
  const NW  = 14;
  const NG  = 9;

  const numCols = Math.max(...nodes.map(n => n.col)) + 1;
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top  - PAD.bottom;
  const colSpan = iW / Math.max(numCols - 1, 1);

  const nd = nodes.map((n, i) => ({ ...n, idx:i, inV:0, outV:0, val:0 }));
  links.forEach(lk => { nd[lk.source].outV += lk.value; nd[lk.target].inV += lk.value; });
  nd.forEach(n => {
    n.val = n.col === 0            ? n.outV
          : n.col === numCols - 1  ? n.inV
          : Math.max(n.inV, n.outV);
  });

  const byCol = {};
  nd.forEach(n => (byCol[n.col] = byCol[n.col] || []).push(n));

  const pos = {};
  for (let c = 0; c < numCols; c++) {
    const cns  = byCol[c] || [];
    const tot  = cns.reduce((s, n) => s + n.val, 0) || 1;
    const usable = iH - NG * Math.max(cns.length - 1, 0);
    const xBase  = c === numCols - 1
      ? PAD.left + iW - NW
      : PAD.left + c * colSpan;
    let y = PAD.top;
    cns.forEach(n => {
      const h = Math.max((n.val / tot) * usable, 8);
      pos[n.idx] = { x:xBase, y, h, midY: y + h / 2, color: n.color || '#555' };
      y += h + NG;
    });
  }

  const NS = 'http://www.w3.org/2000/svg';
  svgEl.innerHTML = '';
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.setAttribute('width', W);
  svgEl.setAttribute('height', H);

  const linkGroup = document.createElementNS(NS, 'g');
  links.forEach(lk => {
    const s = pos[lk.source], t = pos[lk.target];
    if (!s || !t) return;
    const path = document.createElementNS(NS, 'path');
    const x0 = s.x + NW, x1 = t.x;
    const mid = (x0 + x1) / 2;
    const thick = Math.max(lk.value * 0.55, 2);
    path.setAttribute('d', `M${x0},${s.midY} C${mid},${s.midY} ${mid},${t.midY} ${x1},${t.midY}`);
    path.setAttribute('stroke', s.color);
    path.setAttribute('stroke-opacity', '0.35');
    path.setAttribute('stroke-width', thick);
    path.setAttribute('fill', 'none');
    linkGroup.appendChild(path);
  });
  svgEl.appendChild(linkGroup);

  nd.forEach(n => {
    const p = pos[n.idx];
    if (!p) return;
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', p.x);
    rect.setAttribute('y', p.y);
    rect.setAttribute('width', NW);
    rect.setAttribute('height', p.h);
    rect.setAttribute('rx', 2);
    rect.setAttribute('fill', p.color);
    svgEl.appendChild(rect);

    const label = document.createElementNS(NS, 'text');
    const right = n.col === numCols - 1;
    label.setAttribute('x', right ? p.x - 6 : p.x + NW + 6);
    label.setAttribute('y', p.midY + 3);
    label.setAttribute('text-anchor', right ? 'end' : 'start');
    label.setAttribute('fill', '#aaa');
    label.setAttribute('font-size', '11');
    label.setAttribute('font-family', "'Space Grotesk', sans-serif");
    label.textContent = n.name;
    svgEl.appendChild(label);
  });
}

let currentEconomyMode = '1925';

function renderSankeyEconomy(mode) {
  currentEconomyMode = mode;
  const data = mode === '2023' ? D().sankeyEconomy2023 : D().sankeyEconomy1925;
  if (!data) return;
  drawSankey('sankey-economy-svg', data);
  document.getElementById('sankey-economy-1925-btn')?.classList.toggle('active', mode === '1925');
  document.getElementById('sankey-economy-2023-btn')?.classList.toggle('active', mode === '2023');
  document.getElementById('sankey-economy-crisis-btn')?.classList.toggle('active', mode === '2023');
}

function renderSankeyLandUse() {
  const data = D().sankeyLandUse;
  if (!data) return;
  drawSankey('sankey-landuse-svg', data);
}

/* ═══════════════════════════════════════════════════════════════
   10. CHARTS
═══════════════════════════════════════════════════════════════ */
function initCityPopChart() {
  const ctx = document.getElementById('chart-city-pop');
  if (!ctx) return;
  const series = D().cityPopulation || [];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.map(d => d.year),
      datasets: [{
        label: 'City of Tampa population',
        data: series.map(d => d.pop),
        borderColor: V.v5, backgroundColor: V.v5 + '22',
        fill: true, borderWidth: 2.5, pointRadius: 4, tension: 0.25
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          label: c => ` ${fmtNum(c.parsed.y)}`,
          footer: items => pointFooter(series[items[0].dataIndex])
        }},
        legend: { display: false }
      },
      scales: {
        x: mkScale(),
        y: mkScale({ title: { display:true, text:'Residents', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initDowntownResidentsChart() {
  const ctx = document.getElementById('chart-dt-residents');
  if (!ctx) return;
  const series = D().downtownResidents || [];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.map(d => d.year),
      datasets: [{
        label: 'Downtown-core residents',
        data: series.map(d => d.residents),
        borderColor: V.v9, backgroundColor: V.v9 + '22',
        fill: true, borderWidth: 2.5, pointRadius: 5, tension: 0.3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          label: c => ` ${fmtNum(c.parsed.y)}${series[c.dataIndex]?.estimate ? ' (est.)' : ''}`,
          footer: items => pointFooter(series[items[0].dataIndex])
        }},
        legend: { display: false }
      },
      scales: {
        x: mkScale(),
        y: mkScale({ min: 0, title: { display:true, text:'Core residents', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initPortCigarChart() {
  const ctx = document.getElementById('chart-port-cigar');
  if (!ctx) return;
  const port = D().portActivity || [];
  const cig  = D().cigarProduction || [];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...new Set([...port.map(d=>d.year), ...cig.map(d=>d.year)])].sort((a,b)=>a-b),
      datasets: [
        {
          label: 'Port activity index',
          data: port.map(d => ({ x: d.year, y: d.index })),
          borderColor: V.v3, backgroundColor: 'transparent',
          borderWidth: 2.5, pointRadius: 4, tension: 0.25, parsing: false
        },
        {
          label: 'Cigar production (millions)',
          data: cig.map(d => ({ x: d.year, y: d.millions })),
          borderColor: V.v9, backgroundColor: 'transparent',
          borderDash: [5,3], borderWidth: 2, pointRadius: 4, tension: 0.25, parsing: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          footer: items => pointFooter((items[0].datasetIndex === 0 ? port : cig)[items[0].dataIndex])
        }},
        legend: { labels: { color:'#666', boxWidth:20 } }
      },
      scales: {
        x: mkScale({ type: 'linear', title: { display:true, text:'Year', color:'#444', font:{ size:10 }}}),
        y: mkScale({ title: { display:true, text:'Port index', color:'#444', font:{ size:10 }}}),
        y1: mkScale({
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display:true, text:'Cigars (M)', color:'#444', font:{ size:10 }}
        })
      }
    }
  });
}

function initCommercialChart() {
  const ctx = document.getElementById('chart-commercial');
  if (!ctx) return;
  const series = D().commercialIntensity || [];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.map(d => d.year),
      datasets: [{
        label: 'Commercial intensity index',
        data: series.map(d => d.index),
        backgroundColor: series.map(d => d.index >= 80 ? V.v9 + 'cc' : d.index <= 40 ? V.v1 + 'cc' : V.v5 + 'cc'),
        borderColor: series.map(d => d.index >= 80 ? V.v9 : d.index <= 40 ? V.v1 : V.v5),
        borderWidth: 1.5, borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: { footer: items => pointFooter(series[items[0].dataIndex]) }},
        legend: { display: false }
      },
      scales: {
        x: mkScale(),
        y: mkScale({ min:0, max:110, title:{ display:true, text:'Index (100 = 1925 peak)', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initCapitalChart() {
  const ctx = document.getElementById('chart-capital');
  if (!ctx) return;
  const series = D().developmentCapital || [];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.map(d => d.year),
      datasets: [{
        label: 'Development capital ($B)',
        data: series.map(d => d.billions),
        backgroundColor: V.v7 + 'cc',
        borderColor: V.v7,
        borderWidth: 1.5, borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          label: c => ` $${c.parsed.y.toFixed(2)}B`,
          footer: items => [series[items[0].dataIndex]?.label || '', ...pointFooter(series[items[0].dataIndex])].filter(Boolean)
        }},
        legend: { display: false }
      },
      scales: {
        x: mkScale(),
        y: mkScale({ min:0, title:{ display:true, text:'USD billions (nominal-ish)', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initHotelChart() {
  const ctx = document.getElementById('chart-hotels');
  if (!ctx) return;
  const series = D().hotelRooms || [];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.map(d => d.year),
      datasets: [{
        label: 'Downtown hotel rooms',
        data: series.map(d => d.rooms),
        borderColor: V.v6, backgroundColor: V.v6 + '22',
        fill: true, borderWidth: 2.5, pointRadius: 5, tension: 0.3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: { footer: items => pointFooter(series[items[0].dataIndex]) }},
        legend: { display: false }
      },
      scales: {
        x: mkScale(),
        y: mkScale({ min:0, title:{ display:true, text:'Rooms', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initLandUseChart() {
  const ctx = document.getElementById('chart-landuse');
  if (!ctx) return;
  const series = D().landUseShare || [];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.map(d => d.year),
      datasets: [
        { label: 'Residential', data: series.map(d => d.residential), backgroundColor: V.v5 + 'cc', stack: 'lu' },
        { label: 'Retail', data: series.map(d => d.retail), backgroundColor: V.v3 + 'cc', stack: 'lu' },
        { label: 'Industrial', data: series.map(d => d.industrial), backgroundColor: V.v9 + '99', stack: 'lu' },
        { label: 'Civic', data: series.map(d => d.civic), backgroundColor: V.v7 + 'cc', stack: 'lu' },
        { label: 'Vacant / parking', data: series.map(d => d.vacant), backgroundColor: V.v1 + 'cc', stack: 'lu' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP },
        legend: { labels: { color:'#666', boxWidth:14, font:{ size:10 }}}
      },
      scales: {
        x: mkScale({ stacked: true }),
        y: mkScale({ stacked: true, max: 100, title:{ display:true, text:'% of core parcel area', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initDisruptionChart() {
  const ctx = document.getElementById('chart-disruption');
  if (!ctx) return;
  const series = D().disruptionIndex || [];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.map(d => d.district),
      datasets: [
        { label: '1950', data: series.map(d => d.y1950), backgroundColor: V.v3 + 'aa' },
        { label: '1970', data: series.map(d => d.y1970), backgroundColor: V.v9 + 'aa' },
        { label: '1990', data: series.map(d => d.y1990), backgroundColor: V.v5 + 'aa' },
        { label: '2020', data: series.map(d => d.y2020), backgroundColor: V.v7 + 'aa' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP },
        legend: { labels: { color:'#666', boxWidth:14 }}
      },
      scales: {
        x: mkScale({ ticks: { maxRotation: 40, font: { size: 9 }}}),
        y: mkScale({ min:0, max:100, title:{ display:true, text:'Disruption index', color:'#444', font:{ size:10 }}})
      }
    }
  });
}

function initEraChart() {
  const ctx = document.getElementById('chart-eras');
  if (!ctx) return;
  const series = D().eraMilestones || [];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.map(d => d.era),
      datasets: [{
        label: 'Years in era',
        data: series.map(d => d.years),
        backgroundColor: series.map(d => d.color + 'cc'),
        borderColor: series.map(d => d.color),
        borderWidth: 1.5, borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: { footer: items => series[items[0].dataIndex]?.note || '' }},
        legend: { display: false }
      },
      scales: {
        x: mkScale({ title:{ display:true, text:'Years', color:'#444', font:{ size:10 }}}),
        y: mkScale({ ticks: { font: { size: 9 }}})
      }
    }
  });
}

function initSandboxDualChart() {
  const ctx = document.getElementById('chart-sandbox-dual');
  if (!ctx) return;
  const city = D().cityPopulation || [];
  const dt = D().downtownResidents || [];
  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'City population',
          data: city.map(d => ({ x: d.year, y: d.pop })),
          borderColor: V.v5, backgroundColor: 'transparent',
          borderWidth: 2, pointRadius: 3, tension: 0.25, parsing: false
        },
        {
          label: 'Downtown residents',
          data: dt.map(d => ({ x: d.year, y: d.residents })),
          borderColor: V.v9, backgroundColor: 'transparent',
          borderWidth: 2, pointRadius: 3, tension: 0.25, parsing: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          footer: items => pointFooter((items[0].datasetIndex === 0 ? city : dt)[items[0].dataIndex])
        }},
        legend: { labels: { color:'#666', boxWidth:16, font:{ size:10 }}}
      },
      scales: {
        x: mkScale({ type:'linear', title:{ display:true, text:'Year', color:'#444', font:{ size:10 }}}),
        y: mkScale({ title:{ display:true, text:'City pop', color:'#444', font:{ size:10 }}}),
        y1: mkScale({
          position:'right', grid:{ drawOnChartArea:false },
          title:{ display:true, text:'DT residents', color:'#444', font:{ size:10 }}
        })
      }
    }
  });
}

function initSandboxCapitalChart() {
  const ctx = document.getElementById('chart-sandbox-capital');
  if (!ctx) return;
  const series = D().developmentCapital || [];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.map(d => d.year),
      datasets: [{
        label: '$B capital waves',
        data: series.map(d => d.billions),
        backgroundColor: V.v6 + 'bb',
        borderColor: V.v6, borderWidth: 1, borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: { footer: i => series[i[0].dataIndex]?.label || '' }},
        legend: { display: false }
      },
      scales: { x: mkScale({ ticks:{ font:{ size:9 }}}), y: mkScale({ min:0 }) }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   11. DISTRICT TABLE
═══════════════════════════════════════════════════════════════ */
const NET_CLS = {
  'Rebuilt':'net-gain', 'Recovering':'net-moderate', 'Displaced':'net-catastrophic',
  'Mixed':'net-mixed', 'Transformed':'net-exposure', 'Catalytic':'net-gain',
  'Public gain':'net-gain', 'Stable residential':'net-moderate', 'Anchor':'net-gain'
};

function buildDistrictTable() {
  const tbody = document.getElementById('geo-table-body');
  if (!tbody) return;
  (D().districtImpact || []).forEach(row => {
    const cls = NET_CLS[row.net] || 'net-moderate';
    const tr  = document.createElement('tr');
    tr.innerHTML =
      `<td class="country-cell">${row.district}</td>` +
      `<td><span class="role-badge">${row.role}</span></td>` +
      `<td style="max-width:420px;font-size:12px;color:#888;line-height:1.5">${row.cost}</td>` +
      `<td><span class="net-badge ${cls}">${row.net}</span></td>`;
    tbody.appendChild(tr);
  });
}

/* ═══════════════════════════════════════════════════════════════
   12. MEDIA ARCHIVE (rights-cleared imagery)
   Reads `mediaAssets` (plan §4 schema: id, year, title, thumbUrl,
   fullUrl, lat, lng, era, license, rightsHolder, sourceUrl,
   upstreamUrl, creditLine, verificationStatus) and falls back to the
   legacy `photoArchive` shape { title, year, credit, url, thumb, caption }.
═══════════════════════════════════════════════════════════════ */
function buildMediaGrid() {
  const grid = document.getElementById('photo-archive-grid');
  if (!grid) return;
  const assets = (D().mediaAssets && D().mediaAssets.length) ? D().mediaAssets : (D().photoArchive || []);

  assets.forEach(a => {
    const thumb   = a.thumbUrl || a.thumb || '';
    const page    = a.sourceUrl || a.url || '#';
    const full    = a.fullUrl || page;
    const credit  = a.creditLine || a.credit || '';
    const eraColor = PC[a.era];
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = `
      <a class="photo-thumb-wrap" href="${esc(full)}" target="_blank" rel="noopener" title="Open full-size image">
        <img class="photo-thumb" src="${esc(thumb)}" alt="${esc(a.title)}" loading="lazy"
             onerror="this.style.display='none'; this.parentElement.classList.add('photo-fallback');" />
      </a>
      <div class="photo-meta">
        <div class="photo-title">${esc(a.title)}</div>
        <div class="photo-year">${esc(a.year)}${eraColor ? `<span class="photo-era" style="background:${eraColor}">${esc(a.era)}</span>` : ''}</div>
        <div class="photo-caption">${esc(a.caption || '')}</div>
        <div class="photo-credit">${esc(credit)}</div>
        ${a.license ? `<div class="photo-license">${esc(a.license)}${a.rightsHolder ? ' · ' + esc(a.rightsHolder) : ''} ${statusBadge(a.verificationStatus)}</div>` : ''}
        <div class="photo-links">
          <a href="${esc(page)}" target="_blank" rel="noopener">Source page</a>
          ${a.upstreamUrl ? `<a href="${esc(a.upstreamUrl)}" target="_blank" rel="noopener">${esc(a.upstreamArchive || 'Archive record')}</a>` : ''}
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════════
   12b. HERO & FOOTER STAT BLOCKS (data-driven, cited)
   `heroStats` / `footerStats`: [{ value, label, sublabel, color, source }].
   The plan's rule is that hero numbers are CONFIRMED only; anything
   else is rendered with its status badge so the caveat is visible.
═══════════════════════════════════════════════════════════════ */
function renderStatBlocks() {
  const hero = document.querySelector('.hero-stats');
  const hs = D().heroStats;
  if (hero && Array.isArray(hs) && hs.length) {
    hero.innerHTML = hs.map(s => `
      <div>
        <div class="hero-stat-number" style="color:${esc(s.color || V.v5)}">${esc(s.value)}</div>
        <div class="hero-stat-label">${s.label}${s.sublabel ? '<br>' + s.sublabel : ''}</div>
        ${s.source ? `<div class="hero-stat-source">${sourceHtml(s.source)}</div>` : ''}
      </div>`).join('');
  }
  const foot = document.querySelector('.footer-stats');
  const fs = D().footerStats;
  if (foot && Array.isArray(fs) && fs.length) {
    foot.innerHTML = fs.map(s => `
      <div class="footer-stat" style="border-color:${esc(s.color || V.v5)}">
        <div class="footer-stat-value" style="color:${esc(s.color || V.v5)}">${esc(s.value)}</div>
        <div class="footer-stat-delta">${s.sublabel || ''}</div>
        <div class="footer-stat-label">${s.label}</div>
        ${s.source ? `<div class="footer-stat-source">${sourceHtml(s.source)}</div>` : ''}
      </div>`).join('');
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESIZE
═══════════════════════════════════════════════════════════════ */
let _rsTimer;
window.addEventListener('resize', () => {
  clearTimeout(_rsTimer);
  _rsTimer = setTimeout(() => {
    renderSankeyEconomy(currentEconomyMode);
    renderSankeyLandUse();
    if (scrollMap)  scrollMap.invalidateSize();
    if (sandboxMap) sandboxMap.invalidateSize();
  }, 220);
}, { passive:true });

/* ═══════════════════════════════════════════════════════════════
   MAIN INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  buildPhaseLegend();

  initScrollMap();
  initSandboxMap();

  buildScrollSteps();
  requestAnimationFrame(() => requestAnimationFrame(initScrollytelling));

  initSlider();

  document.getElementById('sankey-economy-1925-btn')
    ?.addEventListener('click', () => renderSankeyEconomy('1925'));
  document.getElementById('sankey-economy-2023-btn')
    ?.addEventListener('click', () => renderSankeyEconomy('2023'));

  setTimeout(() => {
    renderSankeyEconomy('1925');
    renderSankeyLandUse();
  }, 100);

  initCityPopChart();
  initDowntownResidentsChart();
  initPortCigarChart();
  initCommercialChart();
  initCapitalChart();
  initHotelChart();
  initLandUseChart();
  initDisruptionChart();
  initEraChart();
  initSandboxDualChart();
  initSandboxCapitalChart();

  buildDistrictTable();
  buildMediaGrid();
  renderStatBlocks();

  /* No half-primed first step: the overlay shows the "scroll to begin"
     call-to-action over an overview map, and the observer activates the
     first real step when it scrolls into the reading zone. */
});
