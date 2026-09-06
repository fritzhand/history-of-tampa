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
several data sections still carry editorial estimates that need institutional
sources, and the timeline events still carry free-text citations.

| Plan phase (§10) | Status | Notes |
|---|---|---|
| A — Skeleton fork, `tampaData`, map recenter, year scrubber | **done** | Slider runs 1824–2024; eight civic eras replace the conflict phases |
| B — Eras, `mapEvents`, `scrollSteps` | **partial** | 20 events and 15 steps exist and are navigable; dates, coordinates and citations are being verified |
| C1 — Population and permits | **done (population)** | City and county series fully cited to Census tables; permits not started |
| C2 — Year-slider sandbox | **done** | Six stat cards, two synced charts, era-coloured map |
| C3 — Urban renewal and displacement | **not started** | Section and chart are built and hidden until the data exists; this is the largest remaining gap |
| C4 — Water Street and modern boom metrics | **done** | Capital and hotel series rebuilt from named, sourced projects |
| C5 — Sankeys | **partial** | Both render; flow weights remain a DERIVED editorial model |
| C6 — Impact matrix | **done** | Nine districts, each with institutional source objects |
| D — Rights-cleared media | **done** | 42 public-domain or CC images, 1837–2024, plus the LOC Sanborn volume index |
| E — README, content license, citation audit, QA | **mostly done** | Live source audit section, link checker, headless QA; PROGRESS and plan kept current |

## Citation status

Counted by `node tools/validate-data.mjs`:

| Verification status | Sources |
|---|---|
| CONFIRMED | 80 |
| PENDING | 38 |
| DERIVED | 7 |

Twenty `mapEvents` still carry a free-text `source` string rather than a
source object; the validator reports each as a warning. The site renders a
live version of this table in its own **Source Audit** section.

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
- **Interface work.** Key-free basemap (the CARTO tiles now watermark
  anonymous use), clickable era pills with a locked scroll observer, a
  sticky legend, a pinned mobile map, a light/dark theme, and a project logo.

## Next

1. **Displacement figures (plan C3).** The ethical guardrail requires
   clearance and displacement numbers printed beside redevelopment
   investment. Research is in flight; the section is built and waiting.
2. **Timeline events.** Verify all 20 dates and coordinates and replace the
   free-text citations with source objects.
3. **Port and cigar series.** Both are invented indices. Replace with Army
   Corps waterborne-commerce tonnage and sourced cigar output.
4. **The three conceptual indices.** `commercialIntensity`, `landUseShare`
   and `disruptionIndex` need either real data from City of Tampa parcel GIS
   and Sanborn digitisation, an explicit DERIVED methodology note, or
   removal.
5. **New series.** Streetcar ridership, Riverwalk milestones, residential
   units delivered, and CRA tax increment.

## Working with the repo

```bash
python3 -m http.server 8080          # serve the site
node tools/validate-data.mjs         # citation schema + counts
NODE_USE_ENV_PROXY=1 node tools/check-links.mjs   # every source URL
node tools/media-roll.mjs            # regenerate the CONTENT_LICENSE media table
```

`ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` is the brief for the next evidence pass.
