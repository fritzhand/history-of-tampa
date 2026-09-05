# Downtown Tampa History — Implementation Plan

**Branch:** `copilot/copy-downtown-tampa-history-again`  
**Template:** `fritzhand/iranwar` (The 2026 Iran War: A Geoeconomic Autopsy)  
**Status:** Planning complete · Implementation not started  
**Last updated:** 2026-09-05

---

## Goal

Rebuild the iranwar data-journalism stack as a **Downtown Tampa urban history autopsy**: same architecture (static site + cited data layer + scrollytelling map + charts + sandbox), same citational rigor, different domain — **settlement → port/cigar boom → urban renewal scars → waterfront redevelopment**.

### Working titles (pick at kickoff)

- **Downtown Tampa: A Civic Autopsy**
- **The Making of Downtown Tampa**
- **Tampa Core: 1880–2026**

### Scope boundary

**Downtown Core + Channel District + adjacent edges** (Franklin St corridor, Riverwalk, Tampa Heights edge, Ybor approach / GasWorx seam). Ybor is context and a feeder district, not the whole story, unless scope expands later.

### Quality bar = iranwar parity

- Every metric has `{ institution, date, url, note?, verificationStatus?, accessType? }`
- Institutional / archival sources only (no random blogs as primary)
- Dark Viridis UI, Leaflet scrollytelling, Chart.js, custom Sankey, interactive scrubber
- Research prompt file that drives external archival harvesting

---

## 1. What the Iran War Repo Is (Pattern to Copy)

| Layer | Iran War | Tampa analog |
|---|---|---|
| `index.html` | Hero → phase legend → scrolly map → charts → sandbox → cost matrix → footer | Same section skeleton |
| `js/data.js` | ~23 cited sections on `window.crisisData` | `window.tampaData` with parallel sections |
| `js/app.js` | Leaflet + slider + Sankey + ~13 charts | Same engines; retarget maps/charts |
| `css/styles.css` | Dark Viridis, Space Grotesk/Mono | Keep visual system; retint phase tokens |
| `ARCHIVAL_RESEARCH_PROMPT.md` | Tiered source hunt (Iran geoeconomics) | Tampa-specific tiered archival hunt (see `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md`) |
| Citation rule | Working URLs to dated institutional sources | Same + image rights metadata |

**Do not invent a new framework.** Fork the interaction model; replace content and geography.

### Current template inventory (verified on this branch)

| File | Lines (approx) | Role |
|---|---|---|
| `index.html` | ~431 | Page shell, sections, chart canvases |
| `css/styles.css` | ~1085 | Dark Viridis theme |
| `js/data.js` | ~1304 | `window.crisisData` — 23 sections |
| `js/app.js` | ~1172 | Maps, slider, Sankey, charts, init |
| `ARCHIVAL_RESEARCH_PROMPT.md` | ~206 | Iran-war archival hunt (keep as reference) |
| `LICENSE` | — | Project license |

### Iran `crisisData` sections to mirror

1. Daily oil prices → Tampa time-series proxies  
2. FX rates → demographic / economic series  
3. FX reserves → CRA / assessed value  
4. Hormuz transits → port / transit counts  
5. Stranded mariners → displacement metrics  
6. War risk premium → development cost / insurance proxies if sourced  
7. India macro → downtown macro indicators  
8. Import basket → land-use / sector mix  
9. Remittances → labor / corridor flows if applicable  
10. EM debt vulnerability → vulnerability / equity metrics  
11. Gulf production → port / industrial output  
12. Geopolitical cost matrix → who gained/lost matrix  
13. Key events timeline  
14. Metadata  
15. Leaflet map events  
16. Scroll steps  
17. Bar-chart daily series  
18–19. Sankeys  
20–23. Scenario / expanded chart datasets  

---

## 2. Narrative Arc (Phases)

Eras replace iranwar conflict phases (color-coded pills):

1. **Indigenous / Spanish approach** (pre-1821) — Tocobaga / Spanish Florida context  
2. **Fort & founding** (1824–1880s) — Fort Brooke, incorporation  
3. **Railroad & port boom** (1880s–1920s) — Plant System, port, cigar-capital adjacency  
4. **Interwar / Depression / WWII** (1920s–1945) — building stock, shipyard, military  
5. **Postwar peak & segregation geography** (1945–1960) — streetcar end, Central Ave / Scrub  
6. **Urban renewal & highway cut** (1950s–1970s) — I-275/I-4, demolition, “slum clearance”  
7. **Office canyon / hollow core** (1970s–1990s) — CBD towers, evening emptiness  
8. **Stadium & entertainment bets** (1990s–2010s) — Ice Palace/Amalie, Channelside, streetcar revival  
9. **Water Street & Riverwalk era** (2010s–present) — SPP, hotel/office/residential surge  
10. **Current pipeline** (2024–2030s) — GasWorx, Channel District CAP, Ybor Harbor seam, transit  

### Hero stats (provisional until verified)

- Years since Fort Brooke (1824)  
- Peak cigar / port employment era figure (USF / census)  
- Acres cleared or households displaced in urban renewal (HUD / city CRA / academic)  
- Capital investment in Water Street phase 1 (public filings / CRA reports)  
- Miles of Riverwalk / streetcar ridership recovery  

**Rule:** Hero numbers = `verificationStatus: "CONFIRMED"` only.

---

## 3. Page Information Architecture

1. **Hero** — title, subtitle, 4 keystone stats  
2. **Phase legend** — era pills  
3. **Scrollytelling map** — sticky Leaflet map; ~12–18 key events with lat/lng  
4. **Built form & land use** — building age, height, land-use change  
5. **Flows Sankey** — people / goods / capital routes  
6. **Interactive sandbox** — year scrubber (1880–2026) updating map + stat cards  
7. **Demographics & displacement** — census tract time series  
8. **Economic structure** — employment, assessed value, CRA TIF  
9. **Photo / map compare strip** — open historic images linked to map pins  
10. **Impact matrix** — who gained/lost by era  
11. **Footer / sources** — institutional credit roll  

---

## 4. `tampaData` Schema

Implement as `window.tampaData = { ... }`.

### Core time series

- `meta` — title, date range, methodology, bounding box, CRS notes  
- `phases` — id, label, startYear, endYear, color key  
- `events` / `mapEvents` / `scrollSteps` — scrollytelling  
- `populationCore` — downtown-related tract population by decade (Census / NHGIS)  
- `buildingPermits` — core totals (City open data)  
- `assessedValue` — CRA / property appraiser aggregates if open  
- `portTonnage` or `commerceIndex` — Port Tampa Bay public stats  
- `transitRidership` — historic streetcar + TECO Line modern  
- `hotelRooms` / `residentialUnits` — Water Street / Channel District inventory  

### Structural / comparative

- `landUseSankey` — 1950 → 1980 → 2020 transitions  
- `capitalFlowsSankey` — public subsidy / private capital / CRA  
- `displacement` — urban renewal project stats  
- `geoImpactMatrix` — Scrub/Central Ave, Ybor workers, port labor, CBD finance, Water Street capital, tourists  
- `skylineMilestones` — towers/venues with year, height, use, source  

### Media layer (required for historical pictures)

```text
mediaAssets[]: {
  id, year, title, thumbUrl, fullUrl, lat, lng,
  license, rightsHolder, sourceUrl, verificationStatus
}
```

Only assets with **clear reuse rights** (public domain, CC, or explicit library open access). Prefer deep links + attribution over hotlinking when ToS is unclear; self-host only when license allows.

### Citation object (non-negotiable)

```js
source: {
  institution,
  date,
  url,
  note?,
  verificationStatus: "CONFIRMED" | "PENDING" | "DERIVED",
  accessType: "FREE" | "REGISTRATION" | "PAYWALL" | "API"
}
```

---

## 5. Open Source / Archival Source Stack

### Tier 1 — Free institutional data

- U.S. Census / NHGIS (IPUMS) — tract/county time series  
- City of Tampa Open Data — https://opendata.tampa.gov/ and ArcGIS GeoHub  
- Hillsborough County Property Appraiser — building year built where bulk-open  
- FDOT / Hillsborough MPO — TECO streetcar ridership, traffic  
- Port Tampa Bay — public annual reports / tonnage  
- Florida Geographic Data Library (FGDL) — boundaries, infrastructure  

### Tier 2 — Maps & spatial history

- Library of Congress — Sanborn maps, panoramic maps  
- USGS Historical Topographic Map Explorer  
- State Archives of Florida / Florida Memory — maps, photos (item-level rights)  
- USF Libraries Special Collections — aerials, Burgert Brothers (rights-aware)  
- Tampa Through Time (USF) — https://tampa-through-time.humap.site/ (discovery; cite originals)  

### Tier 3 — Photographs (rights-first)

- Florida Memory  
- LOC Prints & Photographs  
- City of Tampa Clerk Archives historic downtown sets  
- Wikimedia Commons (verify upstream)  
- USF Digital Commons — open items only; else link-out + metadata  

### Tier 4 — Narrative / secondary (framing, not sole numeric source)

- City CRA plans (Channel District, Downtown, Ybor)  
- Water Street / SPP public presentations & commission docs  
- Scholarly urban renewal literature (DOI/catalog)  
- Local papers only when institutionally archived  

### Avoid as primary

- Unsourced social “history” groups  
- SEO then-and-now sites without provenance  
- Paywalled numbers without a free institutional twin  

Full hunt checklist: `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md`.

---

## 6. Technical Implementation Strategy

### Phase A — Skeleton fork

1. Rename project strings, nav, hero, footer credits  
2. Keep Leaflet / Chart.js / D3-sankey / annotation plugin stack  
3. Retarget map center to downtown Tampa (~27.95, −82.46), zoom 14–15  
4. Replace `crisisData` → `tampaData`; stub sections with comments  
5. Year-based scrubber (`yearOf`, `getEraStatus(year)`) instead of day 0–112  
6. Keep Viridis; map phase CSS vars to eras  

### Phase B — Geography & scrollytelling

1. Curate **15 mapEvents** with real coordinates (Fort Brooke, Union Station, Franklin St, Central Ave, interstate junction, Amalie, Water Street, Riverwalk nodes)  
2. Write `scrollSteps` after data leads copy  
3. Basemap: Carto Dark Matter; optional historic overlay later  

### Phase C — Metrics & charts (~13-chart parity)

1. Population of core / adjacent tracts (line)  
2. Building permits or units delivered (bar)  
3. Assessed value or CRA increment (line)  
4. Port or trade proxy (line)  
5. Land-use composition by decade (stacked bar)  
6. Displacement / clearance (bar)  
7. Transit ridership historic vs modern (line)  
8. Hotel rooms + residential units (dual axis)  
9. Skyline / major project timeline  
10–11. Sandbox-synced mini charts  
12. Impact matrix table  

Sankeys: people/economy pre-interstate vs post–Water Street; capital stack public CRA vs private.

### Phase D — Media & provenance

1. `mediaAssets` with 20–40 rights-cleared images  
2. Map popups: thumbnail + credit  
3. Footer / `CONTENT_LICENSE.md` for media reuse  
4. Citation audit: CONFIRMED only in hero  

### Phase E — Hardening

1. Preserve code LICENSE; add `CONTENT_LICENSE.md` for media/data  
2. README: update data, citation rules, local preview  
3. Optional `/tools` scripts for Census/open data → JSON  
4. A11y: alt text, keyboard slider, reduced-motion  

### Target repo layout

```text
/
  index.html
  css/styles.css
  js/data.js                 # window.tampaData
  js/app.js
  ARCHIVAL_RESEARCH_PROMPT.md          # Iran template (reference)
  ARCHIVAL_RESEARCH_PROMPT_TAMPA.md    # Tampa hunt
  DOWNTOWN_TAMPA_PLAN.md               # this file
  PROGRESS.md
  README.md
  LICENSE
  CONTENT_LICENSE.md                   # (Phase E)
  data/raw/                            # optional CSVs
  assets/maps/                         # optional georef overlays
  assets/images/                       # cleared stills only
```

No backend. GitHub Pages–ready static hosting (same as iranwar).

---

## 7. Research Workflow

1. Freeze geography: GeoJSON of Downtown CRA + Channel District.  
2. Freeze chronology: 1824–present; denser 1955–1975 and 2015–2026.  
3. Run `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` in a search-enabled session.  
4. Verification: CONFIRMED for hero; PENDING allowed in deep charts with notes; DERIVED lists inputs.  
5. Image rights log → `mediaAssets`.  
6. Narrative pass: scrolly steps written **after** data.

---

## 8. Editorial / Ethical Guardrails

Downtown Tampa history includes **forced displacement, segregation, and urban renewal**.

- Name communities (The Scrub, Central Avenue) with primary sources  
- Avoid nostalgia-only “blight clearance” framing  
- Pair redevelopment investment with displacement figures  
- Impact matrix must include net losers, not only skyline wins  

---

## 9. MVP vs Full Parity

### MVP (same shape)

- Full UI shell + 12 scroll steps + 8 charts + 1 Sankey + year sandbox + 15 sourced events + 15 images + research prompt  

### Full parity

- 20+ data sections, dual Sankeys, ~13 charts, media layer, CRA capital series, census small multiples, georeferenced 1950s overlay, full citation audit  

### Stretch

- Before/after image compare  
- 1930s Sanborn georef toggle  
- BibTeX citation export  

---

## 10. Execution Checklist

- [ ] Phase A: Project rename + `tampaData` stub + map recenter  
- [ ] Phase B: Phases + 15 `mapEvents` + scroll steps  
- [ ] Phase C1: Census population + permits charts  
- [ ] Phase C2: Year slider sandbox wiring  
- [ ] Phase C3: Urban renewal / displacement section  
- [ ] Phase C4: Water Street / modern boom metrics  
- [ ] Phase C5: Sankeys  
- [ ] Phase D: Media assets + popup integration  
- [ ] Phase C6: Impact matrix  
- [ ] Phase E: README + citation audit + visual QA + source link check  

---

## 11. Success Criteria

- Visitor can scrub eras and see map + KPIs update  
- Every visible number traces to a working institutional URL  
- Scrolly map tells a coherent downtown story in ≤18 steps  
- Open historic imagery is credited and rights-safe  
- Visual/interaction quality matches iranwar  
- Research prompt enables a second person to deepen data without touching UI code  

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Photo rights murky (Burgert etc.) | Link-out first; self-host only PD/CC |
| Historic land-use hard to digitize | Decade snapshots from published maps + modern parcels |
| CRA financials inconsistent | Official annual reports; mark DERIVED |
| Scope creep into all of Tampa Bay | Hard boundary GeoJSON; Ybor as edge |
| Empty early decades | Qualitative map events + fewer charts until data exists |

---

## Bottom Line

Treat iranwar as a **template product**: cited data kernel → scrolly geographic narrative → sandbox → structural charts → cost/impact matrix. Rebuild that product for **Downtown Tampa’s long development arc**, powered by Census, City/County open data, LOC/Sanborn/Florida Memory/USF archives, and CRA public records — with photograph rights as a first-class data type. Ship MVP shell quickly, then thicken `data.js` until citation density matches the original.
