# Progress — Downtown Tampa: A Civic Development Autopsy

**Repository:** `fritzhand/History-of-tampa`
**Branch:** `claude/history-tampa-repo-setup-s4b06j`
**Last updated:** 2026-09-06

This repository was seeded from the two `copilot/*` branches in
`fritzhand/iranwar`: the rebuilt Downtown Tampa site and the planning
documents, merged into one lineage. Everything below describes the state of
that merged branch.

---

## Where the project stands

The site runs end to end. The remaining work is evidentiary, not structural:
the port and cigar series are still invented indices, and three conceptual
models carry DERIVED methodology notes where real data belongs.

| Plan phase (§10) | Status | Notes |
|---|---|---|
| A — Skeleton fork, `tampaData`, map recenter, year scrubber | **done** | Slider runs 1824–2024; eight civic eras replace the conflict phases |
| B — Eras, `mapEvents`, `scrollSteps` | **done** | 26 events and 15 steps, every date and claim verified, every event carrying a source object; coordinates corrected by up to 1.2 km |
| C1 — Population and permits | **done (population)** | City and county series fully cited to Census tables; permits not started |
| C2 — Year-slider sandbox | **done** | Six stat cards, two synced charts, era-coloured map |
| C3 — Urban renewal and displacement | **done** | Federal urban renewal figures for all three Tampa projects, the two interstates, Central Park Village and the Selmon corridor, plus the 1936 redlining survey |
| C4 — Water Street and modern boom metrics | **done** | Capital and hotel series rebuilt from named, sourced projects |
| C5 — Sankeys | **partial** | Both render; flow weights remain a DERIVED editorial model |
| C6 — Impact matrix | **done** | Nine districts, each with institutional source objects |
| D — Rights-cleared media | **done** | 42 public-domain or CC images, 1837–2024, plus the LOC Sanborn volume index |
| E — README, content license, citation audit, QA | **mostly done** | Live source audit section, link checker, headless QA; PROGRESS and plan kept current |

## Citation status

Counted by `node tools/validate-data.mjs`:

| Verification status | Sources |
|---|---|
| CONFIRMED | 168 |
| PENDING | 42 |
| DERIVED | 47 |

The validator reports no errors and one warning, for the Port Tampa event,
which is genuinely nine miles outside the downtown study area and says so in
its own note. The site renders a live version of this table in its own
**Source Audit** section.

## Done in this pass

- **Repository set up.** Both copilot branches merged into
  `fritzhand/History-of-tampa`; research prompts reconciled with the layout
  the plan specifies (`ARCHIVAL_RESEARCH_PROMPT.md` kept as the iranwar
  template reference, `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` canonical).
- **Citation schema enforced.** Every `source` object carries
  `verificationStatus` and `accessType`; `tools/validate-data.mjs` checks the
  shape and `tools/check-links.mjs` checks that the URLs resolve.
- **Census data verified.** Every decade of `cityPopulation` cites the
  specific Census table it comes from. The 1850 figure was reclassified as
  DERIVED once the Census Office's own note showed it was never published as
  an aggregate; 1870 was added; the 1960 note now quantifies the annexation
  effect (140,331 of 274,970 residents lived in territory annexed after
  1950). A `countyPopulation` series was added for context.
- **Downtown residents corrected.** 2010, 2020 and 2025 now use Tampa
  Downtown Partnership district counts (8,494 → 17,366 → ~23,600); two
  unsourced modern estimates were removed.
- **Capital and hotels rebuilt.** `developmentCapital` is now nominal
  millions, one named project per point, on a log axis — the untraceable
  billion-dollar era totals are gone. `hotelRooms` keeps only the four
  anchors that have sources.
- **District matrix sourced.** All nine rows carry institutional source
  arrays; the Ybor, Channelside and Riverwalk rows were corrected against
  the NHL nomination and City CRA reports.
- **Media layer built.** The six fabricated thumbnails were replaced with 42
  verified images and a rights policy in `CONTENT_LICENSE.md`.
- **Displacement documented.** The site now prints what redevelopment
  removed beside what it built: 309.6 acres, 2,223 dwellings and 1,242
  families across three federal urban renewal projects, 91.7 per cent of the
  families recorded as non-white, against $36.8M in federal grants approved.
  Sources are the federal Urban Renewal Project Characteristics quarterlies
  and HUD's Urban Renewal Directory as digitised by the University of
  Richmond, cross-checked against Robert Kerstein's 1997 article. Where
  sources disagree, both figures are printed and neither is averaged.
- **Timeline verified.** All 26 events carry source objects; ten dates or
  coordinates were corrected, and six events were added, including the 1959
  Scrub clearance and the 1960 Woolworth sit-in.
- **Interface work.** Key-free basemap (the CARTO tiles now watermark
  anonymous use), clickable era pills with a locked scroll observer, a
  sticky legend, a pinned mobile map, a light/dark theme, and a project logo.
- **Editorial redesign.** The viridis identity is gone from both themes.
  Crimson Pro carries the headlines, Work Sans the body, labels and numbers,
  and the palette is warm neutrals with two accents that mean something: a
  steel blue for the primary series, an oxblood for the crisis peak. The
  eight eras became named colours rather than ramp positions. The palette
  lives once in the stylesheet; `js/app.js` reads it from there and the data
  layer names a ramp step or an era instead of a hex, so every chart, marker,
  sankey and stat card follows the theme toggle.
- **Contrast fixes the redesign surfaced.** The era badge put era-coloured
  text on an unrelated fill; the pill label colour was chosen by asking
  whether the fill was one of two neon viridis stops; text on an accent fill
  was hardcoded black and vanished on the light theme's dark accents. All
  three now compute or flip correctly.
- **Source audit corrected.** The live roll counted each sankey link's node
  index as a citation, inflating it to 307 points and inventing an "Unknown"
  institution holding 50 of them. It now counts only citation objects, so the
  page and `tools/validate-data.mjs` agree.
- **Ported from the iranwar editorial branch.** The floating scroll assist
  (steps are nav targets at every width, so the arrows walk the map narrative
  rather than leaping past the sticky map), a hero byline, and a footer
  author credit.
- **Photographs in the narrative.** Every scrollytelling step now carries one
  or two archival photographs drawn from `mediaAssets` by id, so the sticky
  map is not the only thing on screen for fifteen steps. Rights and credit
  stay in the media layer; a thumbnail that fails to load removes its own
  figure.

## Next

1. **Port and cigar series.** Both are still invented 0–100 indices.
   Replace with Army Corps waterborne-commerce tonnage and sourced cigar
   output. Research in flight.
2. **The three conceptual indices.** `commercialIntensity`, `landUseShare`
   and `disruptionIndex` now carry honest DERIVED methodology notes, but
   they should be rebuilt from City of Tampa parcel GIS and a Sanborn
   digitisation. The displacement research makes two `disruptionIndex` rows
   replaceable with real quantities today.
3. **New series.** Streetcar ridership, Riverwalk milestones, residential
   units delivered, and CRA tax increment. Research in flight.
4. **Pre-1970 downtown residents.** Four points remain PENDING estimates
   with no tract data behind them.
5. **Follow-ups the displacement research named.** OCR the Tampa pages of
   the federal Urban Renewal Project Characteristics quarterlies to cite the
   document directly rather than through the Digital Scholarship Lab, and
   check the USF Roberts City photograph collection for the media layer.

## Working with the repo

```bash
python3 -m http.server 8080          # serve the site
node tools/validate-data.mjs         # citation schema + counts
NODE_USE_ENV_PROXY=1 node tools/check-links.mjs   # every source URL
node tools/media-roll.mjs            # regenerate the CONTENT_LICENSE media table
```

`ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` is the brief for the next evidence pass.
