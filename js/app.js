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

Chart.defaults.font.family    = "'Space Mono', monospace";
Chart.defaults.font.size      = 10;

/* Theme tokens for canvas and SVG surfaces that CSS cannot reach. Filled
   from the stylesheet's custom properties by refreshTheme(), so charts,
   map markers and sankeys follow the light/dark toggle. */
const T = {
  text:'#555', textDim:'#666', title:'#444', grid:'#1a1a1a',
  tipBg:'#161616', tipBorder:'#2a2a2a', tipTitle:'#f0f0f0', tipBody:'#999',
  sankeyLabel:'#aaa', markerStroke:'rgba(255,255,255,0.35)', markerActive:'#ffffff'
};

const TIP = {
  backgroundColor:T.tipBg, borderColor:T.tipBorder, borderWidth:1,
  titleColor:T.tipTitle, bodyColor:T.tipBody, padding:12,
  titleFont:{ family:"'Space Grotesk',sans-serif", weight:'700', size:12 },
  bodyFont:{ family:"'Space Mono',monospace", size:10 }
};

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function refreshTheme() {
  const light = currentTheme() === 'light';
  T.text         = cssVar('--text-faint', '#555');
  T.textDim      = cssVar('--text-dim', '#666');
  T.title        = cssVar('--text-muted', '#444');
  T.grid         = cssVar('--border-light', '#1a1a1a');
  T.tipBg        = cssVar('--bg-card', '#161616');
  T.tipBorder    = cssVar('--border', '#2a2a2a');
  T.tipTitle     = cssVar('--text-primary', '#f0f0f0');
  T.tipBody      = cssVar('--text-secondary', '#999');
  T.sankeyLabel  = cssVar('--text-soft', '#aaa');
  T.markerStroke = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
  T.markerActive = light ? '#17171a' : '#ffffff';
  /* The two lightest viridis steps are illegible on paper: darken them in
     light mode. Era pills, markers and charts all derive from V / PC. */
  V.v8 = light ? '#8fb318' : '#b5de2b';
  V.v9 = light ? '#c9a800' : '#fde725';
  Object.assign(PC, { fortress:V.v1, boomtown:V.v2, metropolis:V.v3, depression:V.v4,
                      suburban:V.v5, renewal:V.v9, revival:V.v7, waterfront:V.v6 });
  Chart.defaults.color       = T.text;
  Chart.defaults.borderColor = T.grid;
  Object.assign(TIP, { backgroundColor:T.tipBg, borderColor:T.tipBorder, titleColor:T.tipTitle, bodyColor:T.tipBody });
}

function mkScale(overrides = {}) {
  return {
    grid:  { color:T.grid },
    ticks: { color:T.text, font:{ family:"'Space Mono',monospace", size:10 } },
    ...overrides
  };
}

/* Linear year axis: no thousands separators on years ("1,900" → "1900"). */
function yearScale(overrides = {}) {
  const s = mkScale({ type:'linear', title:{ display:true, text:'Year', color:'#444', font:{ size:10 }}, ...overrides });
  s.ticks = { ...s.ticks, callback: v => String(v) };
  return s;
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
const BASEMAPS = {
  dark: {
    base:  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    label: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
  },
  light: {
    base:  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    label: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
  },
  attribution: 'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  maxNativeZoom: 16,
  maxZoom: 18
};

const _basemapLayers = new Map();   // Leaflet map -> { base, label }

/* Adds (or, on a theme change, replaces) the basemap pair for a map. */
function addBasemap(map) {
  const urls = BASEMAPS[currentTheme()];
  const prev = _basemapLayers.get(map);
  if (prev) { map.removeLayer(prev.base); map.removeLayer(prev.label); }
  const base = L.tileLayer(urls.base, {
    attribution: BASEMAPS.attribution,
    maxNativeZoom: BASEMAPS.maxNativeZoom, maxZoom: BASEMAPS.maxZoom
  }).addTo(map);
  const label = L.tileLayer(urls.label, {
    maxNativeZoom: BASEMAPS.maxNativeZoom, maxZoom: BASEMAPS.maxZoom, opacity: 0.85
  }).addTo(map);
  _basemapLayers.set(map, { base, label });
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
  c.innerHTML = '';
  Object.entries(PC).forEach(([phase, color]) => {
    const light = color === V.v8 || color === V.v9;
    const el = document.createElement('a');
    el.className = 'phase-pill';
    el.dataset.phase = phase;
    el.href = '#scrollytelling';
    el.setAttribute('role', 'link');
    el.setAttribute('tabindex', '0');
    el.title = `Jump to the ${phase.toUpperCase()} era in the timeline`;
    el.style.cssText = `background:${color};color:${light ? '#000' : '#fff'}`;
    el.innerHTML = `<span class="dot" style="background:${light ? '#000' : '#fff'}"></span>${phase.toUpperCase()}`;
    el.addEventListener('click', e => { e.preventDefault(); scrollToPhase(phase); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToPhase(phase); }
    });
    c.appendChild(el);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function navHeight() {
  return document.getElementById('main-nav')?.offsetHeight || 56;
}

function legendHeight() {
  return document.getElementById('phase-legend')?.offsetHeight || 46;
}

/* Publish live nav + legend heights so sticky offsets adapt (CSS vars). */
function setLayoutVars() {
  document.documentElement.style.setProperty('--nav-h', navHeight() + 'px');
  document.documentElement.style.setProperty('--legend-h', legendHeight() + 'px');
}

/* Resolve an era to its first timeline step; eras without a dedicated step
   fall back to the nearest step by era order. */
function stepForPhase(phase) {
  const exact = document.querySelector(`.scroll-step[data-phase="${phase}"]`);
  if (exact) return exact;
  const order = Object.keys(PC);
  const want  = order.indexOf(phase);
  if (want === -1) return null;
  let best = null, bestDist = Infinity;
  document.querySelectorAll('.scroll-step').forEach(s => {
    const oi = order.indexOf(s.dataset.phase);
    if (oi === -1) return;
    const dist = Math.abs(oi - want);
    if (dist < bestDist) { best = s; bestDist = dist; }
  });
  return best;
}

function scrollToPhase(phase) {
  const target = stepForPhase(phase) || document.getElementById('scrollytelling');
  if (!target) return;
  const isStep = target.classList.contains('scroll-step');
  const mapH   = (isStep && window.innerWidth <= 900) ? (document.querySelector('.sticky-figure')?.offsetHeight || 0) : 0;
  const y = target.getBoundingClientRect().top + window.scrollY - navHeight() - legendHeight() - mapH - 16;
  /* Pin the destination step through the scroll so an intermediate step
     can't win the observer race mid-flight. */
  if (isStep) lockScrollyStep(target);
  window.scrollTo({ top: Math.max(y, 0), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/* Highlight the pill for the active era; on a horizontally scrolling legend
   (mobile) bring it into view. Also mirror the era into the nav indicator. */
function highlightPhasePill(phase) {
  const scroller = document.getElementById('phase-legend');
  document.querySelectorAll('#phase-pills-container .phase-pill').forEach(p => {
    const on = p.dataset.phase === phase;
    p.classList.toggle('is-current', on);
    if (on && scroller && scroller.scrollWidth > scroller.clientWidth + 4) {
      const cRect = scroller.getBoundingClientRect();
      const pRect = p.getBoundingClientRect();
      const left  = scroller.scrollLeft + (pRect.left - cRect.left) - (cRect.width / 2) + (pRect.width / 2);
      scroller.scrollTo({ left: Math.max(left, 0), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  });
  const ind = document.getElementById('nav-phase-indicator');
  if (ind) {
    const color = PC[phase];
    const light = color === V.v8 || color === V.v9;
    ind.innerHTML = color
      ? `<span class="nav-phase-pill" style="background:${color};color:${light ? '#000' : '#fff'}">${phase.toUpperCase()}</span>`
      : '';
  }
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
      color:T.markerStroke, weight:1,
      fillOpacity:0.75, opacity:1
    }).bindPopup(
      `<div class="map-popup-date">${ev.date} · ${(ev.phase||'').toUpperCase()}</div>` +
      `<div class="map-popup-title">${ev.title}</div>` +
      `<div class="map-popup-body">${ev.body}</div>` +
      `<div class="map-popup-source">${sourceHtml(ev.source)}</div>`,
      { maxWidth:280 }
    ).addTo(scrollMap);
    scrollMkrs[ev.id] = { m, phase: ev.phase };
  });
}

function activateMapStep(step) {
  if (!scrollMap) return;

  if (prevActiveId && scrollMkrs[prevActiveId]) {
    const p = scrollMkrs[prevActiveId];
    p.m.setRadius(5);
    p.m.setStyle({ fillOpacity:0.75, weight:1, color:T.markerStroke });
  }

  const ev = (D().mapEvents || []).find(e => e.id === step.eventId);
  if (ev && scrollMkrs[ev.id]) {
    const cur = scrollMkrs[ev.id];
    cur.m.setRadius(12);
    cur.m.setStyle({ fillOpacity:1, weight:2.5, color:T.markerActive });
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
    el.dataset.phase = step.phase || '';
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

/* Programmatic scrolls (era pills) freeze the observer and pin the destination
   step, otherwise "last intersecting step wins" can settle the highlight on
   the wrong step for the viewable area. The target is re-asserted when the
   scroll settles (scrollend, with a timeout fallback). */
let setActiveStep    = null;
let _scrollyObserver = null;
let _navScrollLock   = false;
let _navLockTimer    = null;
let _navLockRelease  = null;

function lockScrollyStep(target) {
  _navScrollLock = true;
  if (target && typeof setActiveStep === 'function') setActiveStep(target);
  if (_navLockRelease) window.removeEventListener('scrollend', _navLockRelease);
  clearTimeout(_navLockTimer);
  _navLockRelease = () => {
    clearTimeout(_navLockTimer);
    window.removeEventListener('scrollend', _navLockRelease);
    _navLockRelease = null;
    const cur = document.querySelector('.scroll-step.is-active');
    if (target && cur !== target && typeof setActiveStep === 'function') setActiveStep(target);
    _navScrollLock = false;
  };
  window.addEventListener('scrollend', _navLockRelease);
  _navLockTimer = setTimeout(_navLockRelease, 1600);
}

/* Active zone for the observer. On mobile it sits BELOW the sticky map so a
   step scrolling behind the map does not count as active. */
function scrollyRootMargin() {
  if (window.innerWidth <= 900) {
    const fig    = document.querySelector('.sticky-figure');
    const top    = navHeight() + legendHeight() + (fig?.offsetHeight || 0);
    const bottom = Math.max(window.innerHeight - top - Math.round(window.innerHeight * 0.22), 60);
    return `-${top}px 0px -${bottom}px 0px`;
  }
  return '-8% 0px -28% 0px';
}

function initScrollytelling() {
  const steps = document.querySelectorAll('.scroll-step');
  if (!steps.length) return;

  const oDate     = document.getElementById('map-overlay-date');
  const oHeadline = document.getElementById('map-overlay-headline');
  const oPop      = document.getElementById('map-overlay-pop');
  const oPort     = document.getElementById('map-overlay-port');

  setActiveStep = target => {
    const idx  = +target.dataset.idx;
    const step = (D().scrollSteps || [])[idx];
    if (!step) return;
    steps.forEach(s => s.classList.remove('is-active'));
    target.classList.add('is-active');
    highlightPhasePill(step.phase);
    activateMapStep(step);
    if (oDate)     oDate.textContent     = `${step.date} · ${(step.phase||'').toUpperCase()}`;
    if (oHeadline) oHeadline.textContent = step.headline;
    if (oPop)      oPop.textContent      = step.metric_pop;
    if (oPort)     oPort.textContent     = step.metric_port;
  };

  const build = () => {
    if (_scrollyObserver) _scrollyObserver.disconnect();
    _scrollyObserver = new IntersectionObserver(entries => {
      if (_navScrollLock) return;
      entries.forEach(entry => { if (entry.isIntersecting) setActiveStep(entry.target); });
    }, { threshold: 0, rootMargin: scrollyRootMargin() });
    steps.forEach(s => _scrollyObserver.observe(s));
  };
  build();

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { setLayoutVars(); build(); }, 200);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   6. SANDBOX MAP
═══════════════════════════════════════════════════════════════ */
let sandboxMap = null;
let coreMarker = null;
const sandboxMkrs = [];

/* Re-colour every map marker after a theme change (palette + strokes). */
function restyleMarkers() {
  Object.values(scrollMkrs).forEach(({ m, phase }) => {
    const active = prevActiveId && scrollMkrs[prevActiveId] && scrollMkrs[prevActiveId].m === m;
    m.setStyle({ fillColor: PC[phase] || V.v3, color: active ? T.markerActive : T.markerStroke });
  });
  sandboxMkrs.forEach(({ m, phase }) => m.setStyle({ fillColor: PC[phase] || V.v3, color: T.markerStroke }));
  if (coreMarker) coreMarker.setStyle({ color: T.markerActive });
}

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
    const m = L.circleMarker([ev.lat, ev.lng], {
      radius:5, fillColor:color,
      color:T.markerStroke, weight:1, fillOpacity:0.7
    }).bindPopup(
      `<div class="map-popup-date">${ev.date} · ${(ev.phase||'').toUpperCase()}</div>` +
      `<div class="map-popup-title">${ev.title}</div>` +
      `<div class="map-popup-body">${ev.body}</div>` +
      `<div class="map-popup-source">${sourceHtml(ev.source)}</div>`,
      { maxWidth:260 }
    ).addTo(sandboxMap);
    sandboxMkrs.push({ m, phase: ev.phase });
  });

  coreMarker = L.circleMarker(center, {
    radius:16, fillColor:V.v5,
    color:T.markerActive, weight:2, fillOpacity:0.85
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
        x: yearScale(),
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

/* Nominal dollars at the time; values span $1.9M to $3B, so the axis is
   logarithmic. `millions` is the field; a legacy `billions` is converted. */
function capitalMillions(d) {
  return d.millions != null ? d.millions : (d.billions != null ? d.billions * 1000 : null);
}
function fmtMoney(m) {
  if (m == null) return '—';
  return m >= 1000 ? `$${(m / 1000).toFixed(m >= 10000 ? 0 : 1)}B` : `$${m >= 100 ? Math.round(m) : m}M`;
}
function capitalPointLabel(d) {
  return d.label ? `${d.label} — ${fmtMoney(capitalMillions(d))}` : fmtMoney(capitalMillions(d));
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
        label: 'Development capital (nominal $M)',
        data: series.map(capitalMillions),
        backgroundColor: series.map(d => (d.source && d.source.verificationStatus === 'DERIVED') ? V.v7 + '66' : V.v7 + 'cc'),
        borderColor: V.v7,
        borderWidth: 1.5, borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          label: c => ` ${capitalPointLabel(series[c.dataIndex])}`,
          footer: items => pointFooter(series[items[0].dataIndex])
        }},
        legend: { display: false }
      },
      scales: {
        x: mkScale(),
        y: mkScale({ type:'logarithmic', min:1, title:{ display:true, text:'Nominal USD millions (log scale)', color:'#444', font:{ size:10 }}, ticks:{ callback: v => [1,10,100,1000,10000].includes(v) ? fmtMoney(v) : '' }})
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
      labels: series.map(d => String(d.era).split('\n')),
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
        x: yearScale(),
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
        label: 'Capital waves (nominal $M)',
        data: series.map(capitalMillions),
        backgroundColor: V.v6 + 'bb',
        borderColor: V.v6, borderWidth: 1, borderRadius: 3, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          label: c => ` ${capitalPointLabel(series[c.dataIndex])}`,
          footer: i => pointFooter(series[i[0].dataIndex])
        }},
        legend: { display: false }
      },
      scales: {
        x: mkScale({ ticks:{ font:{ size:9 }}}),
        y: mkScale({ type:'logarithmic', min:1, ticks:{ callback: v => [1,10,100,1000,10000].includes(v) ? fmtMoney(v) : '' }})
      }
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
   12c. CLEARANCE & DISPLACEMENT (plan Phase C3)
   `displacement`: [{ project, years, acresCleared, housingUnitsDemolished,
   familiesDisplaced, businessesDisplaced, note, source }]
   The section stays hidden until the data section exists.
═══════════════════════════════════════════════════════════════ */
function initDisplacementSection() {
  const section = document.getElementById('displacement');
  if (!section) return;
  const rows = D().displacement || [];
  if (!rows.length) { section.hidden = true; return; }
  section.hidden = false;

  const num = v => (v == null || v === '') ? '—' : (typeof v === 'number' ? v.toLocaleString() : esc(v));
  const tbody = document.getElementById('displacement-table-body');
  if (tbody) {
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="country-cell" style="white-space:normal;max-width:300px">${esc(r.project)}
          ${r.note ? `<div style="font-weight:400;font-size:11px;color:#777;line-height:1.4;margin-top:4px">${esc(r.note)}</div>` : ''}</td>
        <td style="white-space:nowrap">${esc(r.years || '')}</td>
        <td>${num(r.acresCleared)}</td>
        <td>${num(r.housingUnitsDemolished)}</td>
        <td>${num(r.familiesDisplaced)}</td>
        <td>${num(r.businessesDisplaced)}</td>
        <td style="font-family:var(--font-mono);font-size:10px;max-width:240px;white-space:normal">${sourceHtml(r.source)}</td>
      </tr>`).join('');
  }

  const ctx = document.getElementById('chart-displacement');
  const charted = rows.filter(r => r.familiesDisplaced != null || r.housingUnitsDemolished != null);
  if (ctx && charted.length) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: charted.map(r => r.project),
        datasets: [
          { label: 'Families / households displaced', data: charted.map(r => r.familiesDisplaced ?? null),
            backgroundColor: '#c0392bcc', borderColor: '#c0392b', borderWidth: 1.5, borderRadius: 3, borderSkipped: false },
          { label: 'Housing units demolished', data: charted.map(r => r.housingUnitsDemolished ?? null),
            backgroundColor: V.v1 + 'cc', borderColor: V.v1, borderWidth: 1.5, borderRadius: 3, borderSkipped: false }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          tooltip: { ...TIP, callbacks: { footer: items => pointFooter(charted[items[0].dataIndex]) }},
          legend: { labels: { color:'#666', boxWidth:14, font:{ size:10 }}}
        },
        scales: {
          x: mkScale({ min:0, title:{ display:true, text:'Count', color:'#444', font:{ size:10 }}}),
          y: mkScale({ ticks:{ font:{ size:9 }}})
        }
      }
    });
  } else if (ctx) {
    ctx.closest('.chart-card').hidden = true;
  }

  const src = document.getElementById('displacement-chart-source');
  if (src) {
    const insts = [...new Set(rows.map(r => r.source && r.source.institution).filter(Boolean))];
    src.innerHTML = 'Sources: ' + insts.map(esc).join(' · ');
  }
}

/* ═══════════════════════════════════════════════════════════════
   12d. STREETCAR RIDERSHIP (plan Phase C1 transit series)
   `streetcarRidership`: [{ year, riders, system, note, source }]
═══════════════════════════════════════════════════════════════ */
function initStreetcarChart() {
  const card = document.getElementById('transit-card');
  const ctx  = document.getElementById('chart-streetcar');
  if (!card || !ctx) return;
  const rows = D().streetcarRidership || [];
  if (!rows.length) { card.hidden = true; return; }
  card.hidden = false;

  const sys = r => r.system || 'Streetcar';
  const systems = [...new Set(rows.map(sys))];
  const colors  = [V.v4, V.v9, V.v6, V.v2];
  const bySystem = Object.fromEntries(systems.map(s => [s, rows.filter(r => sys(r) === s).sort((a, b) => a.year - b.year)]));

  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: systems.map((s, i) => ({
        label: s,
        data: bySystem[s].map(r => ({ x: r.year, y: r.riders })),
        borderColor: colors[i % colors.length], backgroundColor: 'transparent',
        borderWidth: 2.5, pointRadius: 4, tension: 0.25, parsing: false
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        tooltip: { ...TIP, callbacks: {
          label: c => ` ${fmtNum(c.parsed.y)} riders`,
          footer: items => pointFooter(bySystem[systems[items[0].datasetIndex]][items[0].dataIndex])
        }},
        legend: { labels: { color:'#666', boxWidth:16, font:{ size:10 }}}
      },
      scales: {
        x: yearScale(),
        y: mkScale({ min:0, title:{ display:true, text:'Annual riders', color:'#444', font:{ size:10 }}, ticks:{ callback: v => fmtNum(v) }})
      }
    }
  });

  const src = document.getElementById('streetcar-chart-source');
  if (src) {
    const insts = [...new Set(rows.map(r => r.source && r.source.institution).filter(Boolean))];
    src.innerHTML = 'Sources: ' + insts.map(esc).join(' · ');
  }
}

/* ═══════════════════════════════════════════════════════════════
   12e. SOURCE AUDIT (plan Phase E citation audit, rendered live)
   Walks every `source` object in tampaData and tallies institutions
   by verification status.
═══════════════════════════════════════════════════════════════ */
function buildSourceRoll() {
  const tbody   = document.getElementById('source-roll-body');
  const summary = document.getElementById('source-audit-summary');
  if (!tbody) return;

  const byInst = new Map();
  const counts = { CONFIRMED:0, PENDING:0, DERIVED:0 };
  let total = 0, uncited = 0;

  const add = src => {
    if (!src) return;
    if (Array.isArray(src)) { src.forEach(add); return; }
    if (typeof src === 'string') { uncited++; return; }
    total++;
    const st = src.verificationStatus || 'PENDING';
    counts[st] = (counts[st] || 0) + 1;
    const k = src.institution || 'Unknown';
    const e = byInst.get(k) || { n:0, CONFIRMED:0, PENDING:0, DERIVED:0, url:'', access:new Set() };
    e.n++; e[st] = (e[st] || 0) + 1;
    if (src.accessType) e.access.add(src.accessType);
    if (!e.url && src.url) e.url = src.url;
    byInst.set(k, e);
  };
  const walk = (o, depth) => {
    if (!o || depth > 4) return;
    if (Array.isArray(o)) { o.forEach(x => walk(x, depth + 1)); return; }
    if (typeof o !== 'object') return;
    if ('source' in o) add(o.source);
    for (const [k, v] of Object.entries(o)) if (k !== 'source' && v && typeof v === 'object') walk(v, depth + 1);
  };
  walk(D(), 0);

  const rows = [...byInst.entries()].sort((a, b) => b[1].n - a[1].n);
  tbody.innerHTML = rows.map(([inst, e]) => `
    <tr>
      <td class="country-cell" style="white-space:normal">${esc(inst)}</td>
      <td>${e.n}</td>
      <td>${e.CONFIRMED ? `<span class="net-badge net-gain">${e.CONFIRMED}</span>` : '—'}</td>
      <td>${e.PENDING ? `<span class="net-badge net-mixed">${e.PENDING}</span>` : '—'}</td>
      <td>${e.DERIVED ? `<span class="net-badge net-moderate">${e.DERIVED}</span>` : '—'}</td>
      <td><span class="role-badge">${[...e.access].join(' / ') || '—'}</span></td>
      <td>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:10px">open ↗</a>` : '—'}</td>
    </tr>`).join('');

  if (summary) {
    const pct = total ? Math.round(100 * counts.CONFIRMED / total) : 0;
    summary.innerHTML =
      `${total.toLocaleString()} cited data points across ${rows.length} institutions — ` +
      `<strong style="color:var(--v6)">${counts.CONFIRMED} confirmed (${pct}%)</strong>, ` +
      `<strong style="color:var(--v8)">${counts.PENDING} pending</strong>, ` +
      `<strong style="color:#a29bfe">${counts.DERIVED} derived</strong>` +
      (uncited ? `, ${uncited} free-text citations still awaiting source objects` : '') + '.';
  }
}

/* ═══════════════════════════════════════════════════════════════
   13. THEME (light / dark)
   Dark is the design default. The choice persists in localStorage and is
   applied before first paint by the inline script in index.html.
═══════════════════════════════════════════════════════════════ */
const THEME_KEY = 'oca-theme';
const SUN_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const MOON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function rebuildCharts() {
  document.querySelectorAll('canvas').forEach(c => { const ch = Chart.getChart(c); if (ch) ch.destroy(); });
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
  initDisplacementSection();
  initStreetcarChart();
}

function updateThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const light = currentTheme() === 'light';
  btn.setAttribute('aria-pressed', String(light));
  btn.title = light ? 'Switch to dark mode' : 'Switch to light mode';
  btn.innerHTML = light ? MOON_SVG : SUN_SVG;
}

function applyTheme(theme) {
  if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage unavailable */ }
  refreshTheme();
  if (scrollMap)  addBasemap(scrollMap);
  if (sandboxMap) addBasemap(sandboxMap);
  restyleMarkers();
  buildPhaseLegend();
  const cur = document.querySelector('.scroll-step.is-active');
  if (cur) highlightPhasePill(cur.dataset.phase);
  rebuildCharts();
  renderSankeyEconomy(currentEconomyMode);
  renderSankeyLandUse();
  updateThemeToggle();
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => applyTheme(currentTheme() === 'light' ? 'dark' : 'light'));
  updateThemeToggle();
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
  refreshTheme();
  initThemeToggle();
  initProgressBar();
  buildPhaseLegend();
  setLayoutVars();

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
  initDisplacementSection();
  initStreetcarChart();
  buildSourceRoll();

  /* No half-primed first step: the overlay shows the "scroll to begin"
     call-to-action over an overview map, and the observer activates the
     first real step when it scrolls into the reading zone. */
});
