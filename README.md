# Downtown Tampa History (iranwar template fork)

This branch adapts the **fritzhand/iranwar** static data-journalism template into a project on the **history and development of downtown Tampa**, using open institutional data and rights-aware historical imagery.

> **Checkpoint (2026-09-05):** Planning and archival prompting are complete and committed. The runnable site on this branch is still the original Iran War template until Phase A implementation begins.

## Template origin

**The 2026 Iran War: A Geoeconomic Autopsy** — a cited, scrollytelling, chart-heavy static site:

- `index.html` — hero, phase legend, scrolly map, charts, sandbox, matrix, footer  
- `css/styles.css` — dark Viridis theme  
- `js/data.js` — `window.crisisData` with per-point `source` citations  
- `js/app.js` — Leaflet maps, timeline slider, SVG sankeys, Chart.js  
- `ARCHIVAL_RESEARCH_PROMPT.md` — original Iran-war source hunt prompt  

## Tampa fork documents (this commit)

| File | Purpose |
|---|---|
| [`DOWNTOWN_TAMPA_PLAN.md`](./DOWNTOWN_TAMPA_PLAN.md) | Full implementation strategy, schema, phases, checklist |
| [`ARCHIVAL_RESEARCH_PROMPT_TAMPA.md`](./ARCHIVAL_RESEARCH_PROMPT_TAMPA.md) | Tiered open-data / archives / photo rights research prompt |
| [`PROGRESS.md`](./PROGRESS.md) | Done / not-done checkpoint for resume |

## Target product (not yet built)

- Same UX parity as iranwar: scrolly map, sandbox scrubber, ~13 charts, sankeys, impact matrix  
- Domain: downtown Tampa eras from founding through urban renewal to Water Street / Channel District  
- Data: `window.tampaData` with institutional citations  
- Media: Florida Memory, LOC, city archives, USF — **rights-cleared only**  

## Local preview (current template)

Serve the repo root over HTTP (required for some module-free static setups and map tiles):

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Citation standard (carried forward)

Every metric should carry:

```js
source: {
  institution: "...",
  date: "YYYY-MM-DD",
  url: "https://...",
  note: "...",                    // optional
  verificationStatus: "CONFIRMED" // or PENDING | DERIVED
  accessType: "FREE"              // or REGISTRATION | PAYWALL | API
}
```

## License

See [`LICENSE`](./LICENSE) for code/content terms of the original project. A separate `CONTENT_LICENSE.md` for third-party archival media will be added when images are vendored.

## Status

See [`PROGRESS.md`](./PROGRESS.md).
