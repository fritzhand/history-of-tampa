# ARCHIVAL DATA RESEARCH PROMPT
# For use in a separate research window with web search enabled.
# Project: "Downtown Tampa: A Civic Development Autopsy"
# Open civic / historical data journalism · 1824–2024

---

## CONTEXT

I am building a data journalism project titled **"Downtown Tampa: A Civic Development Autopsy"**. It tracks two centuries of downtown development: Fort Brooke, the Plant railroad, Ybor cigar industrialization, phosphate port wealth, the 1920s land boom, Depression/WWII, suburbanization, interstate/urban renewal clearance (including Central Avenue / The Scrub), Franklin Street Mall, convention/arena revival, Riverwalk, and Water Street.

Every data point in our `js/data.js` file carries a `source` object with `institution`, `date`, and `url`. Our citationality standard requires **working hyperlinks to specific dated institutional sources**. We do not accept personal blogs or non-institutional aggregators when a primary source exists.

Your task is to **search for open-source, archival, or freely accessible data** from the named reputable sources for each metric below. For each, return:
1. The exact URL to the data (or the closest available page)
2. The publication date or data vintage
3. The specific figure or series you found
4. Whether it is freely downloadable, behind a paywall, or available via API
5. License / reuse terms if images

---

## METRICS TO FIND — IN PRIORITY ORDER

---

### TIER 1: OPEN DEMOGRAPHIC & BOUNDARY DATA

**A. City of Tampa decennial population (1850–2020)**
- Target: U.S. Census Bureau
- URL seeds: https://data.census.gov/ · https://www.census.gov/programs-surveys/decennial-census.html
- Also: NHGIS (IPUMS) for consistent historical boundaries
- Need: Official counts; note annexation effects (esp. 1960)

**B. Downtown-core residential population by decade**
- Define geography: CBD + Channel District + Harbour Island (+ Water Street)
- Target: Census tract/block group time series; Tampa Downtown Partnership reports
- URL seeds: https://www.tampasdowntown.com/ · https://data.census.gov/
- Need: 1970–2023 residential counts with tract IDs documented
- Flag estimates vs official ACS/decennial

**C. Downtown employment / daytime population**
- Target: LEHD / OnTheMap (Census), TDP State of Downtown reports
- URL: https://onthemap.ces.census.gov/
- Need: Jobs by NAICS in downtown study area, 2002–latest

---

### TIER 2: HISTORICAL MAPS & URBAN FORM

**D. Sanborn Fire Insurance Maps — Tampa**
- Target: Library of Congress
- URL: https://www.loc.gov/collections/sanborn-maps/
- Need: Sheet lists for 1880s–1950s covering Franklin St, fort area, Ybor edge
- Extractable: building footprint density, land use coding proxies

**E. City of Tampa parcel / zoning open data**
- Target: https://opendata.tampa.gov/
- Need: Current land use, vacant parcels, historic district overlays, building footprints
- Prefer GeoJSON/shapefile downloads

**F. Historic aerials**
- Target: UF / FDOT aerial archives, USGS EarthExplorer, Florida Memory maps
- Need: 1940s, 1960s (pre/post interstate), 1980s, 2000s frames of downtown

---

### TIER 3: OPEN PHOTOGRAPHIC ARCHIVES

**G. Florida Memory — Tampa downtown photographs**
- URL: https://www.floridamemory.com/discover/photographs/
- Queries: "Franklin Street Tampa", "Fort Brooke", "Port Tampa", "Central Avenue Tampa", "Ybor cigar", "Tampa Theatre", "urban renewal Tampa"
- Need: Direct item URLs, dates, photographers, rights statements (public domain vs restricted)

**H. Library of Congress prints & photographs**
- Queries: Tampa waterfront, Spanish-American War camps Tampa, Plant System
- Need: high-res downloads with rights notes

**I. Wikimedia Commons categories**
- https://commons.wikimedia.org/wiki/Category:Tampa,_Florida
- https://commons.wikimedia.org/wiki/Category:Ybor_City
- https://commons.wikimedia.org/wiki/Category:Skylines_of_Tampa,_Florida
- Verify license (PD, CC BY-SA, etc.) before embedding

**J. USF Libraries Digital Collections / Tampa Through Time**
- URL seeds: https://digital.lib.usf.edu/ · https://tampa-through-time.humap.site/
- Need: oral histories metadata + photo essays on Central Avenue and renewal

---

### TIER 4: ECONOMIC & PORT SERIES

**K. Port Tampa Bay historical tonnage / cruise stats**
- URL: https://www.porttb.com/
- Also: U.S. Army Corps Waterborne Commerce Statistics
- Need: annual tonnage or cargo value proxies 1900–2022; cruise passengers if available

**L. Cigar production / factory counts (Ybor & West Tampa)**
- Target: NPS Ybor City NHL documentation, Ybor City Museum Society
- URL: https://www.nps.gov/ybor/index.htm
- Need: factories operating by decade; production volume if published; worker counts

**M. Hotel room inventory downtown**
- Target: TDP reports, City lodging tax records, historic hotel registries
- Need: room counts 1891, 1926, 1950, 1975, 1990, 2010, 2023

**N. Development capital / major project costs**
- Water Street Tampa program investment ($3.5–4B range — find primary SPP or City statement)
- Convention Center construction cost (1990)
- Arena construction cost (1990s)
- Riverwalk cumulative public investment

---

### TIER 5: DISPLACEMENT & RENEWAL (handle with care)

**O. Urban renewal project footprints and household displacement**
- Target: HUD legacy urban renewal records; City of Tampa archives; academic theses
- Need: project names, acres cleared, housing units demolished, years active
- Central Avenue / The Scrub documentation especially important

**P. Interstate right-of-way takings (I-4 / I-275)**
- Target: FDOT / FHWA historical reports; local newspaper archives (open if any)
- Need: acres, structures removed, neighborhood names

**Q. Franklin Street Mall**
- Opening year, redesign/reopening to cars, retail vacancy narratives with citations

---

### TIER 6: CULTURAL & INSTITUTIONAL TIMELINE

**R. Authoritative timeline pages**
- https://en.wikipedia.org/wiki/Timeline_of_Tampa,_Florida (use only as index — verify each claim)
- https://tampabayhistorycenter.org/exhibit/tampa-bay-timeline/
- https://www.tampa.gov/info/tampa-history
- https://www.tampasdowntown.com/about-us/history/
- https://www.plantmuseum.com/

---

## WHAT TO RETURN FOR EACH METRIC

```
METRIC: [Name]
STATUS: [Found / Partially Found / Behind Paywall / Not Found]
URL: [Exact URL]
DATA VINTAGE: [Date]
SPECIFIC FIGURES FOUND: [Key numbers]
ACCESS: [Free / Registration / Paywalled / API]
LICENSE: [For images — PD / CC / restricted]
NOTES: [Caveats, annexation issues, geography definitions]
```

---

## IMPORTANT CONSTRAINTS

1. **Prefer primary institutional sources** — Census, City of Tampa, Port Tampa Bay, NPS, State Archives, LOC, HUD, FDOT.
2. **Working URLs only** — Do not fabricate.
3. **Label estimates** — If a figure is interpolated or geography-imprecise, say so.
4. **Image ethics** — Prefer public domain / CC with attribution; never hotlink restricted Florida Memory items if ToS forbids; download and attribute properly when allowed.
5. **Displacement sensitivity** — Central Avenue, The Scrub, and Ybor clearance are community trauma histories; prioritize community archives and oral histories alongside government records.
6. **Free/open first** — opendata.tampa.gov, data.census.gov, floridamemory.com, loc.gov, commons.wikimedia.org.

---

## BONUS QUESTIONS

- What is the best census tract set for a stable "downtown Tampa" definition 1970–2020?
- Does Florida Memory provide bulk metadata export or IIIF manifests?
- Are Port Tampa Bay historical annual reports digitized with tonnage tables?
- Is there an open GIS layer of urban renewal project boundaries for Tampa?
- Which Water Street investment figure is most citable from a primary source?
- Where are Central Avenue business directories digitized?

---

## IMPLEMENTATION HOOKS IN THIS REPO

After research, update:
- `js/data.js` — replace `estimate: true` rows with cited official series
- `photoArchive` — swap thumbs for verified open images with stable URLs
- `landUseShare` / `disruptionIndex` — replace conceptual models with GIS-derived stats
- Chart source footers in `index.html` — add deep links
