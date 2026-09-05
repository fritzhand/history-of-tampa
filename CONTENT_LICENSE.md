# Content License & Media Rights

The code in this repository is covered by [`LICENSE`](./LICENSE), inherited
from the `fritzhand/iranwar` template. This file covers the **content**: the
compiled data in `js/data.js` and the third-party media the site displays.

## Compiled data

- The compiled dataset (`window.tampaData` in `js/data.js`) is released under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Individual figures are facts drawn from the institutional sources cited on
  each data point. Every point carries a `source` object with
  `institution`, `date`, `url`, `verificationStatus`
  (`CONFIRMED` · `PENDING` · `DERIVED`) and `accessType`
  (`FREE` · `REGISTRATION` · `PAYWALL` · `API`).
- Values marked `estimate: true` or `DERIVED` are editorial reconstructions;
  the `note` names the inputs. Do not cite them as primary figures.
- Suggested attribution: *Downtown Tampa: A Civic Development Autopsy*
  (`fritzhand/History-of-tampa`), compiled from the sources cited per point.

## Media policy (plan §4 "Media layer", §5 Tier 3)

1. **Embed only rights-cleared images.** An image is embedded (as a
   hot-linked thumbnail) only if its license is public domain
   (PD, PD-US, PD-USGov), CC0, CC BY, or CC BY-SA, as stated on its
   Wikimedia Commons file page or Library of Congress item record.
2. **Link out for everything else.** Items whose reuse terms are unclear or
   restrictive — including Burgert Brothers photographs held by USF Libraries
   and Florida Memory items without an explicit reuse statement — are
   referenced by link only and never copied or embedded.
3. **Credit every image.** Each `mediaAssets` entry records `license`,
   `rightsHolder`, `creditLine`, the `sourceUrl` (Commons or LOC page),
   and, where the file was digitised from an archive, `upstreamArchive` and
   `upstreamUrl`. The credit line is rendered on the card.
4. **Share-alike images are shown unmodified.** CC BY-SA images are
   displayed as published, with the license named on the card.
5. **No self-hosting** of third-party media unless the license is PD/CC0 and
   the file is committed with its provenance in this document.

Rights concerns: open an issue on the repository and the item will be
removed or replaced with a link-out while it is reviewed.

## Basemap and libraries

- Map tiles: Esri World Dark Gray Canvas — © Esri, HERE, Garmin,
  © OpenStreetMap contributors. Used under Esri's basemap terms with
  attribution displayed on the map.
- Libraries: Leaflet (BSD-2), Chart.js (MIT), loaded from public CDNs.
- Fonts: Space Grotesk and Space Mono (SIL Open Font License) via Google Fonts.

## Media roll

The current list of embedded images, with license and credit, is generated
from `js/data.js`:

```bash
node tools/media-roll.mjs
```

_(The roll is regenerated whenever `mediaAssets` changes; see `PROGRESS.md`.)_
