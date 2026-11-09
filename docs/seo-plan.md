# SEO plan

Progress tracker for the follow-ups from the SEO audit of 2026-11-09, updated the same day after the Dutch, English and German site went live.
Check items off as they are finished.

**Status:** in progress · **Branch:** `feature/seo-fixes` (off master, one commit per item)

The site now has 120 pages: the same 40 pages under `/nl/`, `/en/` and `/de/`. Most fixes are made once and apply to all three. Only the written text in item 3 is triple the work.

Already done by the language work: `hreflang` links and alternates in the sitemap, Dutch and German text on every page, correct language tags, and a default of English for search engines.

| # | Item | Who | Status |
|---|------|-----|--------|
| 1 | Search Console | You | Verified, baseline pending |
| 2 | Mobile speed | Claude | Done, confirm after deploy |
| 3 | Titles and descriptions | Claude drafts, you approve | Products and collections done, not deployed yet |
| 4 | Internal links | Claude | To do |
| 5 | Heading order | Claude | To do |
| 6 | llms.txt | Claude | To do |
| – | Deploy and re-measure | Claude | To do |
| 7 | Bing Webmaster Tools | You | Done |
| 8 | Request indexing | You, after deploy | To do |
| 9 | Google Merchant Center | You and Claude, after deploy | To do |

## 1. Search Console (you)

- [x] Verify `earthyglow.nl` as a Domain property (TXT record at Strato; keep that record, removing it un-verifies the site)
- [x] Submit `https://www.earthyglow.nl/sitemap.xml`
- [x] Link Search Console to Google Analytics
- [ ] After a few days, note the indexed page count here as a baseline (expect it to grow towards 120): ____
- [ ] Check the Pages report. Old addresses like `/shop` listed as "Page with redirect" are expected
- [ ] Check the International targeting / hreflang area for errors, if Search Console reports any

## 2. Mobile speed

New baseline on the Dutch pages, simulated slow phone connection. Target: under 2.5s. "After fixes" is measured on a local production build, so confirm on the live site after deploy.

| Page | Before localization | Now | After fixes |
|------|---------------------|-----|-------------|
| Product (`/nl/product/floral-box/`) | ~10s | ~10.4s | ~3.0s |
| Home (`/nl/`) | ~6.4s | ~9.1s | ~3.4s |
| Shop (`/nl/shop/`) | ~4.5s | ~4.1s | ~1.1s |
| Care (`/nl/care/`) | ~3.8s | ~3.8s | ~1.9–3.2s |

- [x] Product gallery: first image first, the rest on demand
- [x] Generate smaller versions of product photos (thumbnails were downloading full-size images)
- [x] Replace the 114 KB menu logo with a 2 KB version
- [x] Re-compress the 33 heaviest photos (5.8 MB saved, quality checked)
- [x] Show top-of-page content straight away instead of waiting for JavaScript
- [ ] Confirm the numbers on the live site after deploy

## 3. Titles and descriptions

This is now the most valuable item. Dutch pages exist, but product titles have no Dutch search words: `/nl/product/boo-boo/` is just "Boo Boo · EarthyGlow".

- [x] Titles say what the product is, in each language
- [x] Collection titles in each language
- [x] Product and collection descriptions of 120 to 155 characters, in all three languages (`src/data/seo-copy.ts`)
- [ ] Collection page intros: left out for now, by choice
- [ ] Short descriptions on the remaining pages (home, about, policies and similar)
- [ ] Later: refine wording with real search terms once Search Console has data

## 4. Internal links

- [ ] Collection pages: they now have links from only 3 pages each. Add plain links in the footer and shop filters, visible without JavaScript
- [ ] Fix the slash mismatch: pages are served and canonicalised at `/nl/shop/`, but all internal links go to `/nl/shop` and get a 301. Best fixed once in the shared language `Link` (`src/i18n/links.tsx`)
- [ ] **Careful:** `src/root.tsx` strips trailing slashes in its loader and client loader. That must be fixed together with the links, or navigation will redirect back and forth. Cart and checkout are not prerendered and stay slashless
- [ ] Update the outdated comment in `src/root.tsx`
- [ ] Add a few links in running text: About and Care to collections
- [ ] Crawl check on all 120 pages: no internal 301s, every sitemap page has at least one link

## 5. Heading order

Same seven pages in each language, 21 in total. Fixing the shared code covers all three.

- [ ] Collection pages (4): add an h2 above the product grid, or lower the card heading
- [ ] Care: an h2 above the tips
- [ ] Policies index and contact information: h3 to h2
- [ ] Crawl check: no heading jumps on any of the 120 pages, with styling unchanged

## 6. llms.txt

- [ ] Add one `public/llms.txt` in English: who EarthyGlow is, what it sells, and links to the Dutch, English and German shop, collections, care and policies
- [ ] Confirm it returns 200 live

## Deploy and re-measure

- [ ] Tests, typecheck and lint pass
- [ ] Merge, push, then deploy with `netlify deploy --build --prod` (no API changes expected)
- [ ] Re-run the crawl and speed test on the live site, in all three languages

## 7. Bing Webmaster Tools (you)

- [x] Sign in at bing.com/webmasters and import the site from Search Console
- [x] Confirm the sitemap came across

## 8. Request indexing (you, after deploy)

Wait until the fixes are live: the daily quota is limited and the titles and links are about to change.

- [ ] In Search Console, use URL Inspection → Request indexing, Dutch pages first: `/nl/`, `/nl/shop/`, the 4 Dutch collection pages, best-selling products
- [ ] Then the same key pages in English and German, spread over a few days if the daily limit is reached

## 9. Google Merchant Center (after deploy)

- [ ] Create an account at merchants.google.com and link it to Search Console
- [ ] Start with the Netherlands: Dutch product data pointing at the `/nl/` pages. Add Germany (`/de/`) once that works
- [ ] Update the product schema first: it has only a flat €6.99 NL rate. The site charges €6.99 in NL (free from €25) and €12.95 internationally (free from €50)
- [ ] Check that return details match the site
- [ ] Add the products and turn on free listings
- [ ] Check for rejected products after review

## Later, not part of this plan

- Dutch and German read-through by a native speaker, starting with the legal pages
- Translated URLs (`/nl/winkel/` instead of `/nl/shop/`): small gain, needs redirects, not worth it for now
- Review stars in the schema, once there are real reviews
