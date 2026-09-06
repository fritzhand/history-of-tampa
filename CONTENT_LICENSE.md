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

## A note on hot-linking

Thumbnails are loaded directly from `upload.wikimedia.org` with
`loading="lazy"`, which is within Wikimedia's terms for a credited,
low-volume site. Two consequences worth knowing:

- `tools/check-links.mjs` requests all 42 images in one pass and trips
  Wikimedia's rate limit (HTTP 429). That is the audit going too fast, not a
  broken image; the checker retries and reports those separately from dead
  links.
- If this site ever draws real traffic, mirror the public-domain and CC0
  files into `assets/images/` (recording provenance here) rather than
  continuing to hot-link. CC BY-SA files may also be mirrored, with the
  license and author preserved.

## Media roll

Generated with `node tools/media-roll.mjs` from `mediaAssets` in `js/data.js`.

| # | Title | Year | Era | License | Credit | Record |
|---|---|---|---|---|---|---|
| 1 | Tampa Bay on the Gulf of Mexico | 1837 | fortress | Public domain | Gray &amp; James. / Library of Congress, Prints & Photographs, via Wikimedia Commons (Public domain) | [Library of Congress, Prints & Photographs](https://www.loc.gov/item/96507236/) · [file page](https://commons.wikimedia.org/wiki/File:Tampa_Bay_on_the_Gulf_of_Mexico_LCCN96507236.jpg) |
| 2 | The first Hillsborough County courthouse | c. 1890 | fortress | Public domain | Burger &amp; Bros / Burgert Brothers, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Courthouse.jpg) |
| 3 | The steamer Olivette at the Tampa pier | c. 1890s | boomtown | Public domain | Unknown authorUnknown author / Library of Congress, Detroit Publishing Co., via Wikimedia Commons (Public domain) | [Library of Congress, Detroit Publishing Co.](https://www.loc.gov/item/2016817548/) · [file page](https://commons.wikimedia.org/wiki/File:Detroit_Publishing_-_Tampa_pier,_the_Olivette_at_her_landing.jpg) |
| 4 | Port Tampa Inn and docks | c. 1890s | boomtown | Public domain | Unknown authorUnknown author / Library of Congress, Detroit Publishing Co., via Wikimedia Commons (Public domain) | [Library of Congress, Detroit Publishing Co.](https://www.loc.gov/item/2016798560/) · [file page](https://commons.wikimedia.org/wiki/File:Detroit_Publishing_-_Tampa_Inn_and_docks,_Tampa,_Fla..jpg) |
| 5 | The Tampa Bay Hotel | 1902 | boomtown | Public domain | Unknown authorUnknown author / Newberry Library (postcard), via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Bay_Hotel,_Tampa,_Fla_(NBY_429735).jpg) |
| 6 | José Martí with cigar workers in Ybor City | 1893 | boomtown | Public domain | unknown (snapshot taken in 1893) / Public domain photograph, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Jose_Marti_in_Ybor_City.jpg) |
| 7 | The V. M. Ybor cigar factory | c. 1902 | boomtown | Public domain | Unknown / Library of Congress, HABS, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:VIEW_OF_FACTORY_WITH_ADDED_WINGS,_LOOKING_NORTHWEST._TAKEN_CIRCA_1902,_PHOTOGRAPHER_UNKNOWN._-_Ybor_Cigar_Factory,_1916_North_Fourteenth_Street,_Tampa,_Hillsborough_County,_FL_HABS_FLA,29-TAMP,19-32.tif) |
| 8 | Young cigarmakers, photographed by Lewis Hine | 1909 | boomtown | Public domain | Lewis Hine / Library of Congress, National Child Labor Committee (Lewis Hine), via Wikimedia Commons (Public domain) | [Library of Congress, National Child Labor Committee (Lewis Hine)](https://www.loc.gov/item/2018675065/) · [file page](https://commons.wikimedia.org/wiki/File:Lewis_Hine,_Cigarmakers,_Tampa,_Florida,_1909.jpg) |
| 9 | Company E's street at the Rough Riders' camp | 1898 | boomtown | Public domain | State Library and Archives of Florida / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [State Archives of Florida, Florida Memory](https://www.floridamemory.com/items/show/40676) · [file page](https://commons.wikimedia.org/wiki/File:Street_of_Company_E_at_the_Rough_Riders%27_camp-_Tampa,_Florida_(3465708856).jpg) |
| 10 | The steamer Florida leaving Port Tampa for Cuba | 1898 | boomtown | Public domain | Unknown authorUnknown author / Public domain photograph, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:The_steamer_Florida_leaving_port_Tampa_for_Cuba,_1898.jpg) |
| 11 | Troops marching through Tampa | 1898 | boomtown | Public domain | William James Glackens / Library of Congress (William Glackens sketch), via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:US_Soldiers_march_through_Tampa_during_Spanish-American_War.jpg) |
| 12 | Franklin and Lafayette Streets | c. 1920s | metropolis | Public domain | Florida Memory / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [State Archives of Florida, Florida Memory](https://www.floridamemory.com/items/show/30001) · [file page](https://commons.wikimedia.org/wiki/File:Intersection_of_Franklin_and_Lafayette_Streets_in_Tampa,_Florida_(10155348604).jpg) |
| 13 | Inside a Birney one-man streetcar | c. 1920s | metropolis | Public domain | Florida Memory / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [State Archives of Florida, Florida Memory](https://www.floridamemory.com/items/show/27266) · [file page](https://commons.wikimedia.org/wiki/File:Interior_of_a_Birney_one-man_streetcar_in_Tampa,_Florida_(10925212125).jpg) |
| 14 | A streetcar on Grand Central Avenue | 1925 | metropolis | Public domain | Unknown / Public domain photograph, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Street_Car,_Kennedy_Boulevard.webp) |
| 15 | A trolley passing the Citizens Bank Building | 1926 | metropolis | Public domain | Burgert Brothers Photography, Tampa, Florida, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Citizens_Bank_Building_-_Tampa,_1926.jpg) |
| 16 | Crowds on the Lafayette Street Bridge | 1925 | metropolis | Public domain | Florida Memory / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [State Archives of Florida, Florida Memory](https://www.floridamemory.com/items/show/18102) · [file page](https://commons.wikimedia.org/wiki/File:Crowds_on_Lafayette_Street_Bridge_-Tampa.jpg) |
| 17 | A United Cigar Stores storefront | 1925 | metropolis | Public domain | State Library and Archives of Florida / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [State Archives of Florida, Florida Memory](https://www.floridamemory.com/items/show/151492) · [file page](https://commons.wikimedia.org/wiki/File:United_Cigar_Stores_Company-_Tampa,_Florida_(9444920906).jpg) |
| 18 | The José Gasparilla in the 1922 invasion | 1922 | metropolis | Public domain | Burgert Brothers Photography, Tampa, Florida, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Gasparilla_ship_1922.jpg) |
| 19 | A lector reading at the Cuesta-Rey cigar factory | 1929 | depression | Public domain | Burgert Brothers. Burgert's Studio - Tampa, Florida, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Lector_reading_at_Cuesta-Rey_Cigar_Company_-_Tampa,_Florida,_1929.jpg) |
| 20 | “Skyline by Moonlight, Tampa, Fla.” | c. 1930s | depression | Public domain | State Library and Archives of Florida / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [State Archives of Florida, Florida Memory](https://www.floridamemory.com/items/show/163314) · [file page](https://commons.wikimedia.org/wiki/File:%22Skyline_by_Moonlight,_Tampa,_Fla.%22_(11450204913).jpg) |
| 21 | The Scrub neighborhood from the air | 1950 | suburban | CC BY 4.0 | Burgert Brothers / Burgert Brothers, Tampa-Hillsborough County Public Library, via Wikimedia Commons (CC BY 4.0) | [Burgert Brothers, Tampa-Hillsborough County Public Library](https://digitalcollections.hcplc.org/) · [file page](https://commons.wikimedia.org/wiki/File:Aerial_View_of_the_Scrub_Neighborhood_Tampa.jpg) |
| 22 | Model of the Interstate 4 downtown distributor | 1955 | suburban | Public domain | Florida State Road Department (now Florida Department of Transportation) / Florida State Road Department (via Florida Memory), via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Model_of_Interstate_4_Tampa_Downtown_Distributor_(1).jpg) |
| 23 | Downtown Tampa from the air | 1957 | suburban | CC0 | Jim Stokes / Jim Stokes (CC0), via Wikimedia Commons (CC0) | [file page](https://commons.wikimedia.org/wiki/File:Aerial_photograph_of_Downtown_Tampa,_September_1957.jpg) |
| 24 | The José Gasparilla II sails into downtown | 1959 | suburban | Public domain | Burgert Brothers Photography, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Gasparilla_Ship_1959.jpg) |
| 25 | Curtis Hixon Hall, newly completed | 1965 | renewal | Public domain | Florida Department of Transportation, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Curtis_hixon_hall_1965.jpg) |
| 26 | Downtown Tampa from the air | 1974 | renewal | CC0 | Karl E. Holland / Karl E. Holland (CC0), via Wikimedia Commons (CC0) | [file page](https://commons.wikimedia.org/wiki/File:Aerial_photograph_of_Downtown_Tampa,_August_1974.jpg) |
| 27 | Cuban cigar makers at work in Ybor City | 1974 | renewal | Public domain | State Library and Archives of Florida / State Archives of Florida, Florida Memory, via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Cuban_cigar_makers_at_work-_Ybor_City,_Florida_(7596637548).jpg) |
| 28 | The Tampa Theatre entrance on Franklin Street | 1978 | renewal | Public domain | Smalling, Walter, creator / Library of Congress, Historic American Buildings Survey (Walter Smalling), via Wikimedia Commons (Public domain) | [file page](https://commons.wikimedia.org/wiki/File:Main_entrance_-_Tampa_Theatre,_Tampa,_Hillsborough_County,_FL_HABS_FLA,29-TAMP,54-1_(CT).tif) |
| 29 | The downtown skyline | 1982 | renewal | CC0 | Unknown authorUnknown author / Public domain (CC0), via Wikimedia Commons (CC0) | [file page](https://commons.wikimedia.org/wiki/File:Downtown_Tampa_skyline,_February_1982.jpg) |
| 30 | Channelside Bay Plaza | 2007 | revival | CC BY 3.0 | Originally uploaded by Divinek (Transferred by Gyrobo) / Wikimedia Commons contributor, via Wikimedia Commons (CC BY 3.0) | [file page](https://commons.wikimedia.org/wiki/File:Channelside_Bay_Plaza_in_Tampa,_FL.jpg) |
| 31 | TECO Line streetcar tracks in the Channel District | 2008 | revival | CC BY-SA 3.0 | Infrogmation of New Orleans, via Wikimedia Commons (CC BY-SA 3.0) | [file page](https://commons.wikimedia.org/wiki/File:TampaTrackChanelsideAug08.jpg) |
| 32 | Tampa Union Station | 2009 | revival | CC BY-SA 3.0 | TampAGS, for AGS Media, via Wikimedia Commons (CC BY-SA 3.0) | [file page](https://commons.wikimedia.org/wiki/File:Amtrak_at_Tampa_Union_Station_Platform.jpg) |
| 33 | The skyline from the University of Tampa | 2007 | revival | Public domain | Carol M. Highsmith / Library of Congress, Carol M. Highsmith Archive, via Wikimedia Commons (Public domain) | [Library of Congress, Carol M. Highsmith Archive](https://www.loc.gov/item/2010630347/) · [file page](https://commons.wikimedia.org/wiki/File:Skyline,_Tampa,_Florida_LCCN2010630347.tif) |
| 34 | Downtown and the Channel District | 2013 | waterfront | CC BY-SA 3.0 | Alvesgaspar, via Wikimedia Commons (CC BY-SA 3.0) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Florida_November_2013-3a.jpg) |
| 35 | Sparkman Wharf opening day | 2018 | waterfront | CC BY-SA 4.0 | FloridaArmy, via Wikimedia Commons (CC BY-SA 4.0) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Mayor_Bob_Buckhorn_at_Sparkman_Wharf_grand_opening.png) |
| 36 | JW Marriott Tampa Water Street | 2021 | waterfront | CC BY-SA 4.0 | Chiefmiz, via Wikimedia Commons (CC BY-SA 4.0) | [file page](https://commons.wikimedia.org/wiki/File:JWMarriottTampa.jpg) |
| 37 | The Heron residences on Water Street | 2022 | waterfront | CC BY-SA 4.0 | Connorgrill, via Wikimedia Commons (CC BY-SA 4.0) | [file page](https://commons.wikimedia.org/wiki/File:Water_Street_Tampa,_Heron_Residences.png) |
| 38 | The Tampa Riverwalk | 2021 | waterfront | CC BY-SA 4.0 | Zeng8r, via Wikimedia Commons (CC BY-SA 4.0) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Riverwalk1.jpg) |
| 39 | The North Franklin Street Historic District | 2011 | waterfront | CC BY-SA 3.0 | Ebyabe, via Wikimedia Commons (CC BY-SA 3.0) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_FL_North_Franklin_St_HD01.jpg) |
| 40 | The Floridan Hotel, restored | 2011 | waterfront | CC BY-SA 3.0 | Ebyabe, via Wikimedia Commons (CC BY-SA 3.0) | [file page](https://commons.wikimedia.org/wiki/File:FloridanTampa_pano02.jpg) |
| 41 | The skyline from Ballast Point Park | 2024 | waterfront | CC BY 4.0 | Trevorrrrvalent, via Wikimedia Commons (CC BY 4.0) | [file page](https://commons.wikimedia.org/wiki/File:Tampa_Skyline_from_Ballast_Point_Park_April_2024.jpg) |
| 42 | Port Tampa Bay from the air | 2024 | waterfront | CC BY 4.0 | Euthman, via Wikimedia Commons (CC BY 4.0) | [file page](https://commons.wikimedia.org/wiki/File:Port_Tampa_Bay,_Florida,_USA,_2024;_aerial_view.jpg) |
