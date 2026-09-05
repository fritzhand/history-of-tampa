# ARCHIVAL DATA RESEARCH PROMPT
# For use in a separate Claude window with web search enabled.
# Project: "The 2026 Iran War: A Geoeconomic Autopsy"
# Stepwell Centre for Asian Futures · Ahmedabad University

---

## CONTEXT

I am building a data journalism project titled **"The 2026 Iran War: A Geoeconomic Autopsy"** for the Stepwell Centre for Asian Futures at Ahmedabad University. It tracks geoeconomic consequences of a 112-day conflict (Feb 28 – Jun 20, 2026) centred on the Strait of Hormuz.

Every data point in our `data.js` file carries a `source` object with `institution`, `date`, and `url`. Our citationality standard requires **working hyperlinks to specific dated institutional sources**. We do not accept personal blogs, coaching sites, or non-institutional aggregators.

Your task is to **search for open-source, archival, or freely accessible data** from the named reputable sources for each metric below. For each, return:
1. The exact URL to the data (or the closest available page)
2. The publication date or data vintage
3. The specific figure or series you found
4. Whether it is freely downloadable, behind a paywall, or available via API

---

## METRICS TO FIND — IN PRIORITY ORDER

---

### TIER 1: DAILY MARKET DATA (Highest priority — free APIs likely exist)

**A. Brent Crude Oil Daily Settlement Price (Feb 27 – Jun 20, 2026)**
- Target source: EIA (U.S. Energy Information Administration)
- URL to check: https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RBRTE&f=D
- Also check: ICE Futures Europe (https://www.theice.com/products/219/Brent-Crude-Futures)
- Alternative: Quandl/Nasdaq Data Link `CHRIS/ICE_B1`
- What we need: Daily settlement USD/bbl, Feb 27 – Jun 20, 2026

**B. WTI Crude Oil Daily Settlement Price (Feb 27 – Jun 20, 2026)**
- Target source: EIA
- URL to check: https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RCLC1&f=D
- Also check: NYMEX via CME Group (https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.html)
- What we need: Daily settlement USD/bbl, Feb 27 – Jun 20, 2026

**C. Oman/Dubai Mercantile Exchange (DME) Crude Daily Price**
- Target source: DME (Dubai Mercantile Exchange)
- URL to check: https://www.dubaimerc.com/market-data/settlements
- Also check: Argus Media Oman Crude Marker, S&P Global Platts Dubai/Oman assessments
- What we need: Daily assessment USD/bbl, Feb 27 – Jun 20, 2026
- Note: This is the key Asian benchmark. Peaked at $166.96 on March 19, 2026

**D. RBI USD/INR Reference Rate (Daily, Feb 27 – Jun 20, 2026)**
- Target source: Reserve Bank of India
- URL to check: https://www.rbi.org.in/Scripts/ReferenceRateArchive.aspx
- Also check: RBI DBIE portal: https://dbie.rbi.org.in/DBIE/dbie.rbi?site=publications
- What we need: RBI reference rate (published daily 12:00 IST), Feb 27 – Jun 20, 2026
- Note: Rate peaked at ₹93.33/$1 on March 19, 2026

---

### TIER 2: WEEKLY INSTITUTIONAL DATA

**E. RBI Weekly Statistical Supplement (WSS) — Foreign Exchange Reserves**
- Target source: Reserve Bank of India, weekly publication
- URL to check: https://www.rbi.org.in/scripts/WSSViewDetail.aspx
- Also check: https://rbi.org.in/Scripts/BS_ViewBulletin.aspx
- What we need: Total FX reserves (USD Bn), weekly from Oct 2025 through Jun 2026
- Note: Peaked at $730B (Feb 27, 2026), trough at ~$697B (May 2026)

**F. PPAC Crude Oil Import Data — India Monthly**
- Target source: Petroleum Planning & Analysis Cell (Ministry of Petroleum & Natural Gas, GoI)
- URL to check: https://ppac.gov.in/content/212_1_PricesPetroleum.aspx
- Also check: https://ppac.gov.in/uploads/monthlyimportexport/ (for monthly reports)
- What we need: India's crude import volumes by country of origin, Feb–Jun 2026
- Note: Iraq 23%, Russia 21%, Saudi Arabia 14%, UAE/Kuwait 9%, Qatar 4%, Other 29% (pre-conflict)

---

### TIER 3: SHIPPING & MARITIME DATA (May require institutional access)

**G. Strait of Hormuz Daily Tanker Transit Count**
- Target sources (in order of preference):
  1. Vortexa: https://www.vortexa.com/blog/ (look for public Hormuz reports)
  2. Kpler: https://kpler.com/blog (check for public crisis reports)
  3. S&P Global Commodity Insights: https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/shipping/
  4. Argus Media: https://www.argusmedia.com/en/news-and-insights/latest-market-news/
  5. Windward Maritime AI: https://windward.ai/blog/
  6. Clarksons Research: https://www.clarksons.com/services/research/ (key source — cited Clarksons as confirming avg 4 transits/day week ending March 23)
  7. UANI (United Against Nuclear Iran) shipping tracker: https://www.unitedagainstnucleariran.com/blog/iran-war-shipping-update-march-19-2026
- What we need: Daily or weekly transit counts, Feb 28 – Jun 20, 2026
- Baseline: 125 transits/day pre-conflict (EIA World Oil Transit Chokepoints)
- Key dates: Mar 2 (closure, near-zero), Mar 13 (8 — Indian LPG allowed), Mar 24 (4 avg/day, Clarksons)

**H. Stranded Mariners & Vessel Count**
- Target sources:
  1. IMO (International Maritime Organization): https://www.imo.org/en/MediaCentre/PressBriefings/
  2. DG Shipping India: https://www.dgshipping.gov.in/
  3. Lloyd's List Intelligence: https://www.lloydslist.com/
  4. ITF (International Transport Workers' Federation): https://www.itfglobal.org/en/news-events/news/
- What we need: Official confirmed counts of stranded mariners and vessels
- Key figures: Apr 21 (IMO confirmed ~20,000 mariners, 2,000 ships); May 6 (Gen. Caine confirmed 22,500 mariners, 1,550+ vessels)
- Also check: US CENTCOM press releases for Gen. Dan Caine's May 6 statement

**I. Lloyd's Joint War Committee — War Risk Premium**
- Target source: Lloyd's of London / Lloyd's List
- URL to check: https://www.lloydslist.com/ll/sector/tankers/
- Also check: Lloyd's Market Association (LMA): https://www.lmalloyds.com/
- What we need: War risk premium as % of vessel value per voyage, Mar 1 – Jun 20, 2026
- Key figure: 0.75% peak (Mar 9); 8% cited in some reports (this may be 8% of cargo value — please clarify)
- Note: Solvency II requires 30-60 days zero incidents for full reset; Red Sea took 26+ months

---

### TIER 4: ECONOMIC FORECASTS & ANALYSIS (May be behind paywalls — find free summaries)

**J. Goldman Sachs India — GDP and CAD Revision (March 19, 2026)**
- Target source: Goldman Sachs India research
- URL to check: https://www.goldmansachs.com/intelligence/ (check for India macro notes)
- Also check: Reuters coverage of GS revision: https://www.reuters.com/markets/asia/goldman-sachs-cuts-india-gdp-forecast-6-5-2026-03-19/
- What we need: GS revised India GDP from 7.0% to 6.5%, CAD from -0.4% to -1.2% of GDP, March 19, 2026
- Also: Any GS note on RBI FX intervention scale ($18-20B figure)

**K. MUFG FX Research — India Stress Test (March 12, 2026)**
- Target source: MUFG (Mitsubishi UFJ Financial Group) FX Research
- URL to check: https://www.mufg.jp/english/report/research/ or https://www.mufgresearch.com/
- Also check: Bloomberg coverage of MUFG India stress test
- What we need: MUFG FX Research Note (Mar 12, 2026) — $100 oil → CAD -1.9% GDP; $120 oil → CAD -2.8% GDP

**L. Morgan Stanley India Oil Sensitivity Model**
- Target source: Morgan Stanley India research
- What we need: "Every $10/bbl sustained rise widens CAD by ~50 bps" — find the original note
- Also check: Morgan Stanley EM Debt Monitor Q3 2025 for EMBI spread data

---

### TIER 5: STRUCTURAL DATA (More stable, may already be archived)

**M. JP Morgan EMBI Spread Data (Pre-conflict vs post-shock)**
- Target source: JP Morgan EMBI+ (Emerging Market Bond Index)
- URL to check: https://www.jpmorgan.com/insights/research/embi
- Also check: ICE Data Services, Bloomberg EMBI data (may need subscription)
- Free alternative: World Bank data portal, IMF GFSR spreadsheets
- What we need: EMBI spreads (basis points) for Pakistan, Egypt, Sri Lanka, Bangladesh, Kenya, Nigeria, Indonesia, Turkey, India, Philippines, Brazil — circa Jan 2026 (pre-conflict) and Mar-Apr 2026 (post-shock)
- IMF GFSR Oct 2025: https://www.imf.org/en/Publications/GFSR

**N. India Remittances — RBI 6th Round Survey**
- Target source: Reserve Bank of India
- URL to check: https://www.rbi.org.in/Scripts/AnnualReportPublications.aspx
- Also check: https://www.rbi.org.in/Scripts/PublicationsView.aspx?id=21112 (6th Remittance Survey)
- What we need: State-wise breakdown of inward remittances, FY 23/24
- Key figures: Maharashtra ~20%, Kerala ~19.7%, total $118.7B
- Also: Kerala Migration Survey (Centre for Development Studies, Trivandrum): https://www.cds.edu/

**O. World Bank Migration & Remittances Data (Long-run trend)**
- Target source: World Bank
- URL to check: https://www.worldbank.org/en/topic/migrationremittancesdiasporaissues/brief/migration-remittances-data
- Also check: https://databank.worldbank.org/ (search "personal remittances")
- What we need: India annual remittances FY 10/11 through FY 23/24, USD Bn

**P. OPEC Annual Statistical Bulletin 2025 — Gulf Production**
- Target source: OPEC
- URL to check: https://www.opec.org/opec_web/en/publications/202.htm
- What we need: Production volumes by country (Saudi Arabia, Iraq, Iran, UAE, Kuwait, Qatar)

**Q. EIA World Oil Transit Chokepoints — Hormuz Flow Data**
- Target source: U.S. Energy Information Administration
- URL to check: https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints
- What we need: Pre-conflict baseline transit volumes (mb/d), % of global crude/LNG/LPG
- Key figures: ~20mb/d, 20% of global crude, 20% global LNG, 8% global LPG

---

## WHAT TO RETURN FOR EACH METRIC

For each item above, please return a structured response like:

```
METRIC: [Name]
STATUS: [Found / Partially Found / Behind Paywall / Not Found]
URL: [Exact URL]
DATA VINTAGE: [Date of publication or last update]
SPECIFIC FIGURES FOUND: [Key numbers]
ACCESS: [Free / Free with registration / Paywalled / API available]
NOTES: [Any caveats, alternative sources, or suggestions]
```

---

## IMPORTANT CONSTRAINTS

1. **Only institutional, government, or major news sources** — EIA, RBI, IMO, PPAC, IMF, World Bank, OPEC, Reuters, Bloomberg, AP, Lloyd's List, S&P Global, Vortexa, Kpler, Clarksons, Argus Media, Goldman Sachs, MUFG, Morgan Stanley, JP Morgan.

2. **Working URLs only** — If a URL is behind a paywall, note that clearly. Do not fabricate URLs.

3. **Prefer primary sources** — If the data exists directly from the institution (e.g., RBI WSS), cite that over a news article reporting the same figure.

4. **Date specificity matters** — We need data from Feb 28 – Jun 20, 2026 specifically. Pre-conflict baseline data (FY 23/24, 2025) is secondary but also useful.

5. **Free/open data preferred** — Prioritise freely accessible APIs, downloadable CSVs, or open data portals over paywalled institutional research.

---

## BONUS QUESTIONS

- Does EIA's daily spot price series update in near-real-time, or with a lag? What is the lag?
- Does the RBI publish WSS data as a machine-readable CSV or only as PDF?
- Is there a public API for Kpler or Vortexa data, even at limited resolution?
- What is the current status of DME/Oman crude pricing data — is it freely available anywhere, or is it only via Argus/S&P Global subscription?
- Is the UANI Iran shipping tracker (https://www.unitedagainstnucleariran.com/blog/) considered a sufficiently reputable source for academic citation? What would a stronger alternative be?
