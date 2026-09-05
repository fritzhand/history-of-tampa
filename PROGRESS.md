# Progress — Downtown Tampa History Fork

**Repository:** fritzhand/iranwar  
**Branch:** `copilot/copy-downtown-tampa-history-again`  
**Date:** 2026-09-05

---

## Done

- [x] Explored iranwar template end-to-end (`index.html`, `css/styles.css`, `js/data.js`, `js/app.js`, Iran archival prompt)
- [x] Mapped iranwar architecture: static data-journalism site with cited `window.crisisData`, Leaflet scrolly map, Chart.js (~13 charts), custom SVG sankeys, day slider sandbox, geopolitical cost matrix
- [x] Identified all 23 `crisisData` sections and app.js init surface area
- [x] Researched open Tampa archival/data sources (City open data, USF, Florida Memory, LOC/Sanborn, CRA pages, Census/NHGIS, Port, MPO)
- [x] Authored full implementation plan: `DOWNTOWN_TAMPA_PLAN.md`
- [x] Authored Tampa archival research prompt: `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md`
- [x] Documented MVP vs full parity, ethics guardrails, risks, execution checklist
- [x] Committed planning/prompting artifacts to this branch

## Not started (implementation)

- [ ] Phase A — Rename UI strings; `crisisData` → `tampaData` stubs; map recenter to downtown Tampa; year scrubber
- [ ] Phase B — Phases, mapEvents, scrollSteps
- [ ] Phase C — Charts, sankeys, displacement & modern boom metrics
- [ ] Phase D — Rights-cleared `mediaAssets`
- [ ] Phase E — README polish, `CONTENT_LICENSE.md`, citation audit, QA

## Branch state at this checkpoint

| Path | Role | Tampa status |
|---|---|---|
| `index.html` | Iran War page shell | Unchanged (template) |
| `css/styles.css` | Dark Viridis | Unchanged (reuse) |
| `js/data.js` | `window.crisisData` | Unchanged (template) |
| `js/app.js` | Iran War app logic | Unchanged (template) |
| `ARCHIVAL_RESEARCH_PROMPT.md` | Iran source hunt | Kept as reference |
| `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` | Tampa source hunt | **Added** |
| `DOWNTOWN_TAMPA_PLAN.md` | Full plan | **Added** |
| `PROGRESS.md` | This file | **Added** |
| `README.md` | Project readme | **Added** |
| `LICENSE` | License | Unchanged |

## Design decisions locked in planning

1. **Fork interaction model, don’t rewrite the stack** — Leaflet + Chart.js + D3 sankey + dark Viridis remain.
2. **Data kernel rename** — future implementation uses `window.tampaData` with the same citation object shape.
3. **Time model** — year/era scrubber (not crisis day 0–112).
4. **Geography** — Downtown CRA + Channel District + edges; Ybor as seam/context.
5. **Citationality** — institutional URLs required; hero stats CONFIRMED only.
6. **Media** — rights-first; link-out when redistribution unclear.
7. **Ethics** — displacement and segregation treated as first-class metrics beside skyline/investment.

## Next session recommended start

1. Read `DOWNTOWN_TAMPA_PLAN.md` §6 Phase A and §10 checklist  
2. Optionally run `ARCHIVAL_RESEARCH_PROMPT_TAMPA.md` in a search-enabled pass for Tier 1 metrics  
3. Implement Phase A skeleton fork on this branch  

## Notes

- Planning was initially delivered only in chat; this commit materializes it in-repo so work can pause/resume safely.
- No application behavior has changed yet; the live page is still the Iran War autopsy template.
