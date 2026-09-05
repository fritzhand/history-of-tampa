# Downtown Tampa: A Civic Development Autopsy

An open-data, scrollytelling data-journalism site on **200 years of downtown Tampa** — from Fort Brooke (1824) to the Water Street era — structured in the same architectural pattern as the original geoeconomic autopsy format in this repository lineage.

## What you get

| Layer | Implementation |
| --- | --- |
| Narrative scrollytelling map | Leaflet + IntersectionObserver steps (`js/app.js`) |
| Cited data layer | `js/data.js` — every series carries `source` metadata |
| Interactive timeline sandbox | Year slider 1824–2024 with live metrics |
| Charts | Chart.js — population, port/cigars, capital, land use, disruption |
| Flow diagrams | Custom SVG sankeys — 1925 vs 2023 economy; redevelopment pathways |
| District impact matrix | HTML table of winners/loss/rebuild outcomes |
| Open photo archive | Florida Memory / Wikimedia / NPS-oriented cards |
| Research backlog | `ARCHIVAL_RESEARCH_PROMPT.md` for the next evidence pass |

## Run locally

This is a static site. From the repo root:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Or open `index.html` directly (map tiles and CDN libraries need network access).

## Project structure

```
index.html                     # Page sections & chart mounts
css/styles.css                 # Dark viridis theme + photo grid
js/data.js                     # window.tampaData (cited series)
js/app.js                      # maps, charts, slider, sankeys, table
ARCHIVAL_RESEARCH_PROMPT.md    # Source-hunting brief for deeper accuracy
LICENSE
README.md
```

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

- Prefer **primary institutions**: U.S. Census, City of Tampa, Port Tampa Bay, Florida Memory, LOC Sanborn, NPS Ybor, TDP, SPP.  
- Rows marked `estimate: true` are working placeholders pending archival confirmation.  
- Image cards should use public-domain or openly licensed assets with visible credit.  

## Roadmap (parity with research prompt)

- [ ] Replace downtown residential estimates with tract-stable Census/ACS series  
- [ ] Derive land-use shares from `opendata.tampa.gov` parcel extracts  
- [ ] Embed verified Florida Memory item IDs (with allowed reuse)  
- [ ] Quantify urban renewal acres / units from HUD + City archives  
- [ ] Add optional GeoJSON overlays (renewal footprints, historic districts)  

## Built with

Leaflet · Chart.js · Carto Dark Matter · Space Grotesk / Space Mono
