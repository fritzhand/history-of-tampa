# Downtown Tampa: A Civic Development Autopsy

An open-data, scrollytelling data-journalism site on **200 years of downtown Tampa** — from Fort Brooke (1824) to the Water Street era. It is a domain fork of [`fritzhand/iranwar`](https://github.com/fritzhand/iranwar) (*The 2026 Iran War: A Geoeconomic Autopsy*): same architecture, same citation standard, different subject.

**Live:** <https://fritzhand.github.io/history-of-tampa/>

Published with GitHub Pages from the root of `main`. The URL uses the
lower-case repository name; the mixed-case spelling returns 404. Every asset
path is relative, so the site works unchanged under the `/history-of-tampa/`
project subpath.

## What you get

| Layer | Implementation |
| --- | --- |
| Narrative scrollytelling map | Leaflet + IntersectionObserver steps (`js/app.js`) |
| Cited data layer | `js/data.js` — `window.tampaData`; every series carries `source` metadata |
| Interactive timeline sandbox | Year slider 1824–2024 with live metrics |
| Charts | Chart.js — population, port/cigars, capital, land use, disruption |
| Flow diagrams | Custom SVG sankeys — 1925 vs 2023 economy; redevelopment pathways |
| District impact matrix | HTML table of winners / losses / rebuild outcomes |
| Open photo archive | 42 rights-cleared archival images, 1837–2024, each credited |
| Live source audit | Every institution, its data points, and their verification status |
| Light / dark theme | Toggle in the nav, remembered between visits |
| Research backlog | `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` for the next evidence pass |

## Run locally

This is a static site with no build step. From the repo root:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Map tiles, fonts, and CDN libraries need network access.

## Project structure

```
index.html                          # Page sections & chart mounts
css/styles.css                      # Editorial theme tokens, light + dark
js/data.js                          # window.tampaData (cited series, media, sources)
js/app.js                           # maps, charts, slider, sankeys, tables, theme
tools/validate-data.mjs             # citation schema check + status counts
tools/check-links.mjs               # requests every source URL, reports dead ones
tools/media-roll.mjs                # regenerates the CONTENT_LICENSE media table
tools/migrate-sources.py            # one-off schema migration (kept for reference)
DOWNTOWN_TAMPA_PLAN.md              # Implementation strategy, schema, phases, checklist
ARCHIVAL_RESEARCH_PROMPT_TAMPA.md   # Tampa source-hunting brief (canonical)
ARCHIVAL_RESEARCH_PROMPT.md         # iranwar research prompt, kept as the template reference
PROGRESS.md                         # What is done, what is not, what is next
CONTENT_LICENSE.md                  # Data license, media rights policy, media roll
LICENSE
README.md
```

## Tools

```bash
node tools/validate-data.mjs                       # schema + CONFIRMED/PENDING/DERIVED counts
NODE_USE_ENV_PROXY=1 node tools/check-links.mjs    # every source URL, grouped by outcome
node tools/media-roll.mjs                          # regenerate the media roll
```

The link checker separates dead links from hosts that merely refuse
automated clients (Florida Memory and loc.gov item pages answer browsers
fine) and from Wikimedia's rate limit.

## Historical arc (phases)

1. **Fortress** (1824–1883) — Fort Brooke and river landing
2. **Boomtown** (1884–1914) — Plant railroad, Ybor cigars, Tampa Bay Hotel, 1898 embarkation
3. **Metropolis** (1915–1929) — Phosphate port + land-boom skyline
4. **Depression / War** (1929–1945) — Bust, then wartime industry
5. **Suburban** (1945–1962) — Auto exodus; Central Avenue apex
6. **Renewal** (1963–1985) — Interstates, clearance, Franklin Mall
7. **Revival** (1986–2008) — Convention center, aquarium, arena
8. **Waterfront** (2009–2024) — Riverwalk, Sparkman Wharf, Water Street

## Citation standard

Every metric in `js/data.js` carries:

```js
source: {
  institution: "...",
  date: "YYYY-MM-DD",
  url: "https://...",
  note: "...",                     // optional
  verificationStatus: "CONFIRMED", // or PENDING | DERIVED
  accessType: "FREE"               // or REGISTRATION | PAYWALL | API
}
```

- Prefer **primary institutions**: U.S. Census, City of Tampa and its CRA
  reports, Port Tampa Bay, Florida Memory, Library of Congress, National Park
  Service nominations, HUD, FDOT, Tampa Downtown Partnership.
- Hero and footer numbers must be `CONFIRMED`.
- Rows marked `estimate: true` are working placeholders pending archival confirmation.
- Image cards use public-domain or openly licensed assets with visible credit; when reuse rights are unclear, link out instead of embedding.

## Planning documents

| File | Purpose |
|---|---|
| [`DOWNTOWN_TAMPA_PLAN.md`](./DOWNTOWN_TAMPA_PLAN.md) | Full implementation strategy, schema, phases, checklist |
| [`ARCHIVAL_RESEARCH_PROMPT_TAMPA.md`](./ARCHIVAL_RESEARCH_PROMPT_TAMPA.md) | Tiered open-data / archives / photo-rights research prompt |
| [`PROGRESS.md`](./PROGRESS.md) | Done / not-done checkpoint for resume |

## Status

See [`PROGRESS.md`](./PROGRESS.md).

## Built with

Leaflet · Chart.js · Esri World Dark Gray and Light Gray Canvas tiles ·
Space Grotesk / Space Mono
