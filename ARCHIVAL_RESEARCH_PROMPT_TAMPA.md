# ARCHIVAL DATA RESEARCH PROMPT — Downtown Tampa
# For use in a separate session with web search enabled.
# Project: "Downtown Tampa: A Civic Development Autopsy"
# Repository: fritzhand/History-of-tampa
# Template parity: iranwar ARCHIVAL_RESEARCH_PROMPT.md (kept in this repo as the template reference)

---

## CONTEXT

We are building a static data-journalism project modeled on **"The 2026 Iran War: A Geoeconomic Autopsy"** (`fritzhand/iranwar`), retargeted to **the history and development of downtown Tampa** (Downtown Core + Channel District + immediate edges).

Every data point in `js/data.js` (`window.tampaData`) must carry a `source` object with `institution`, `date`, and `url`. Citationality requires **working hyperlinks to specific dated institutional or archival sources**. Do not accept personal blogs, coaching sites, or non-institutional aggregators as primary sources.

Your task is to **search for open-source, archival, or freely accessible data and media** for each metric below. For each, return:

1. The exact URL to the data (or closest available page)
2. The publication date or data vintage
3. The specific figure or series found
4. Whether it is freely downloadable, behind a paywall, registration-walled, or available via API
5. For images/maps: license / rights note and whether redistribution is allowed

Study area (working definition):

- City of Tampa **Downtown CRA** + **Channel District CRA**
- Edges: Franklin Street corridor, Riverwalk, Tampa Heights seam, Ybor approach / GasWorx
- Map center target: approx. 27.95°N, 82.46°W

---

## METRICS TO FIND — IN PRIORITY ORDER

---

### TIER 1: CORE TIME SERIES (Highest priority — open data likely)

**A. Population — Downtown-related census geography**

- Target: U.S. Census Bureau; NHGIS (IPUMS)
- URLs to check:
  - https://www.census.gov/
  - https://www.nhgis.org/
  - https://data.census.gov/
- Need: Population (and housing units if available) by decade 1900–2020 for tracts/block groups approximating downtown core; county series for context
- Notes: Document which tract IDs map to “downtown” in each decade (boundaries change)

**B. Building permits / units delivered — City of Tampa**

- Target: City of Tampa Open Data
- URLs:
  - https://opendata.tampa.gov/
  - https://city-tampa.opendata.arcgis.com/
- Need: Annual or multi-year residential/commercial permit counts or unit counts in downtown / Channel District geographies
- Prefer downloadable CSV/GeoJSON and API endpoint if present

**C. Parcel / year-built / assessed value**

- Target: Hillsborough County Property Appraiser; City GeoHub parcels
- Need: Aggregate year-built distribution and assessed value trends for core parcels if bulk data is open
- Note access terms and whether commercial redistribution is restricted

**D. Port commerce proxy**

- Target: Port Tampa Bay public reports; Army Corps / Waterborne Commerce if relevant
- Need: Long-run tonnage, vessel calls, or published annual highlights with stable URLs
- Vintage: as far back as openly published; denser 1990–present

**E. Transit ridership**

- Target: Hillsborough MPO; HART; TECO Line Streetcar reports; FDOT
- Need: Historic streetcar era figures if published; modern TECO Line annual ridership
- URLs: MPO documents library, HART open reports

**E2. Downtown employment / daytime population**

- Target: Census LEHD / OnTheMap; Tampa Downtown Partnership State of Downtown reports
- URL: https://onthemap.ces.census.gov/
- Need: Jobs by NAICS sector in the downtown study area, 2002–latest, to anchor "office canyon" vs mixed-use eras

---

### TIER 2: SPATIAL HISTORY (Maps)

**F. Sanborn fire insurance maps — Tampa**

- Target: Library of Congress
- URL pattern: LOC Sanborn Maps collection
- Need: Sheet list for downtown years available (e.g. 1880s–1950s), item URLs, rights statements
- Note which years cover Franklin St, waterfront, Scrub/Central Ave edges

**G. USGS topo and aerials**

- Target: USGS Historical Topographic Map Explorer; USF aerial photograph collections; UF / FDOT aerial archives; USGS EarthExplorer; Florida Memory maps
- Need: Years covering downtown (1940s, 1960s pre/post interstate, 1980s, 2000s frames); download or viewer URLs; georef status

**H. Historic street grid / CRA boundaries**

- Target: City of Tampa CRA pages; FGDL; city GIS
- URLs:
  - https://www.tampa.gov/CRAs/Channel-District
  - https://www.tampa.gov/CRAs/ybor-city
  - Downtown CRA page if separate
- Need: Boundary definitions, adoption years, plan PDFs with dates

**I. Interstate construction footprint**

- Target: FDOT historical project docs; academic / government reports on I-4 / I-275 in Tampa
- Need: Construction era dates, displacement citations tied to highway building

---

### TIER 3: PHOTOGRAPHS & MEDIA (Rights-first)

**J. Florida Memory — downtown Tampa**

- Target: State Archives of Florida / Florida Memory
- Need: 15–40 candidate images with: stable item URL, date, creator, rights/usage statement, place keywords
- Prefer public domain or explicit “use freely with credit”

**K. Library of Congress Prints & Photographs**

- Need: Tampa waterfront, streets, cigar/port industry images with rights notes

**L. USF Libraries — Burgert Brothers & Tampa Through Time**

- URLs:
  - https://archives.lib.usf.edu/ (Burgert Brothers collection guide)
  - https://tampa-through-time.humap.site/
  - https://digitalcommons.usf.edu/
- Need: Which items are digitized and openly reusable vs. research-only / rights-restricted
- **Critical:** Do not assume commercial photographers’ work is free to hotlink or republish

**M. City of Tampa Clerk Archives — historic downtown photos**

- URL pattern: https://www.tampa.gov/city-clerk/info/archives
- Need: Featured sets, rights, and whether download is offered

For every image candidate return:

```
IMAGE_ID:
TITLE:
YEAR:
CREATOR:
STABLE_URL:
THUMB_OR_DOWNLOAD_URL:
RIGHTS_STATEMENT:
REDISTRIBUTION_ALLOWED: yes/no/unclear
CREDIT_LINE:
LAT_LNG_IF_KNOWN:
NOTES:
```

---

### TIER 4: URBAN RENEWAL, DISPLACEMENT, EQUITY

**N. Urban renewal project statistics**

- Target: HUD historical urban renewal records; City archives; scholarly secondary with primary cites
- Need: Project names, years, families displaced, businesses displaced, acres cleared for downtown-adjacent projects (including Scrub / Central Avenue where documented)
- Prefer primary government figures

**O. Central Avenue / The Scrub**

- Target: USF special collections; Florida Memory; city reports; peer-reviewed history
- Need: Geography description, peak commercial era, clearance/renewal timeline, citable population or business counts

**P. Segregation / redlining context (careful, cited)**

- Target: Mapping Inequality (HOLC) if Tampa sheets exist; census race-by-tract; official reports
- Need: Whether HOLC maps cover Tampa; URLs; how to use ethically in product copy

---

### TIER 5: MODERN REDEVELOPMENT ECONOMICS

**Q. Water Street Tampa / Strategic Property Partners**

- Target: City commission agenda packets, development agreements, CRA reports, reputable business press summarizing **public documents**
- Need: Phase acreage, announced investment figures **with document dates**, unit/hotel counts, public contribution if any
- Mark paywalled press as secondary; hunt PDF primaries

**R. Channel District CRA financials / capital projects**

- URL: https://www.tampa.gov/CRAs/Channel-District and Channel District projects pages
- Need: TIF/increment figures if published; project lists with years; infrastructure program phases

**S. Amalie Arena / Channelside / entertainment district milestones**

- Need: Opening years, public funding notes from official sources, attendance only if institutional

**T. GasWorx / Ybor Harbor seam (edge projects)**

- Need: Official project descriptions, acreage, unit counts, approval dates from city or developer filings cited by city

**T2. Major project costs (capital waves)**

- Water Street Tampa program investment ($3.5–4B range — find the primary SPP statement or City/CRA document with date)
- Tampa Convention Center construction cost and opening (1990)
- Ice Palace / Amalie Arena cost and opening (1996); Florida Aquarium (1995)
- Tampa Riverwalk cumulative public investment; Tampa Bay Hotel (1891) cost and room count
- Franklin Street Mall: opening year, reopening to cars, retail vacancy narratives with citations

**U. Hotel rooms & residential unit inventory downtown**

- Target: Tourist development reports; city economic development dashboards; CRA annual reports
- Need: Time series or milestone counts 2000–present

---

### TIER 6: STRUCTURAL / COMPARATIVE SERIES

**V. Employment by sector — downtown or city with downtown notes**

- Target: BLS QCEW; BEBR (UF); census LEHD/OnTheMap
- Need: Series that can anchor “office canyon” vs mixed-use eras

**W. Land-use composition proxies**

- Target: Historic zoning maps; modern parcel land use codes; published planning existing-land-use maps
- Need: Decade snapshots suitable for stacked bars or sankey inputs (even if coarse)

**X. Riverwalk length / public realm milestones**

- Target: City parks/recreation or downtown partnership reports
- Need: Opening segments, miles, years

---

### TIER 7: CULTURAL & INSTITUTIONAL TIMELINE (index only — verify each claim)

**Y. Authoritative timeline pages**

- https://tampabayhistorycenter.org/ (Tampa Bay History Center timeline / exhibits)
- https://www.tampa.gov/info/tampa-history
- https://www.tampasdowntown.com/about-us/history/
- https://www.plantmuseum.com/
- https://en.wikipedia.org/wiki/Timeline_of_Tampa,_Florida (use only as an index — never cite it; verify each claim against a primary source)

---

## WHAT TO RETURN FOR EACH METRIC

```
METRIC: [Name]
STATUS: [Found / Partially Found / Behind Paywall / Not Found / Rights-Restricted]
URL: [Exact URL]
DATA_VINTAGE: [Date of publication or last update]
SPECIFIC_FIGURES_FOUND: [Key numbers or series description]
GEOGRAPHY: [How it maps to downtown study area]
ACCESS: [Free / Free with registration / Paywalled / API available]
RIGHTS: [For media/maps — usage summary]
VERIFICATION_STATUS_SUGGESTED: [CONFIRMED / PENDING / DERIVED]
NOTES: [Caveats, alternatives, tract ID issues, etc.]
```

---

## IMPORTANT CONSTRAINTS

1. **Only institutional, government, archival, or major reputable publishers** — Census, NHGIS, City of Tampa, Hillsborough County, FDOT, MPO, Port Tampa Bay, LOC, USGS, Florida Memory / State Archives, USF Libraries, HUD, BEBR, BLS, peer-reviewed journals, commission-filed PDFs.

2. **Working URLs only** — If paywalled, say so. Do not fabricate URLs or figures.

3. **Prefer primary sources** — City CRA PDF over a blog summarizing it.

4. **Date and geography specificity matter** — Downtown ≠ all of Tampa ≠ all of Hillsborough. State when a series is citywide only.

5. **Free/open data preferred** — CSV, GeoJSON, APIs, open PDFs.

6. **Image rights are blocking** — If rights are unclear, list as Rights-Restricted and recommend link-out only.

7. **Do not sanitize displacement** — Seek hard numbers for clearance and relocation alongside redevelopment investment.

---

## BONUS QUESTIONS

- Does City of Tampa Open Data expose permit history with enough history for a 20+ year chart?
- Are downtown CRA boundaries available as downloadable GeoJSON?
- Which Sanborn years are highest-resolution for the pre-interstate street grid?
- Is there an open NHGIS-friendly tract crosswalk for Hillsborough 1950–2020?
- What is the best **primary** citation for households displaced in the major downtown-adjacent urban renewal projects?
- Can TECO Line ridership be obtained as an annual open series without scraping?
- For Burgert Brothers images, what does USF state about reproduction permissions for web exhibits?

---

## OUTPUT PRIORITY FOR THE ENGINEERING TEAM

Return results in this consumption order so `data.js` can be filled fast:

1. Population decade series + geography notes  
2. Permits / units  
3. CRA boundaries + plan dates  
4. Urban renewal displacement figures  
5. Water Street / Channel District investment & unit milestones  
6. Transit ridership  
7. Port proxy  
8. Sanborn + aerial index  
9. Rights-cleared image shortlist (≤40)  
10. Everything else  

End with a **source roll** (institution → base URL) suitable for the site footer.

---

## IMPLEMENTATION HOOKS IN THIS REPO

After research, update:

- `js/data.js` — replace `estimate: true` rows with cited official series; every `source` carries `verificationStatus` and `accessType`
- `mediaAssets` — only rights-cleared images with stable URLs, license, rights holder, and credit line
- `landUseShare` / `disruptionIndex` / `commercialIntensity` — replace conceptual models with GIS- or archive-derived stats, or mark `DERIVED` with the inputs named
- Chart source footers in `index.html` — add deep links to the specific dated documents
- `PROGRESS.md` — log which metrics moved from PENDING to CONFIRMED
