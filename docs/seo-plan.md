# SEO plan

Progress tracker for the six follow-ups from the SEO audit of 2026-11-09.
Check items off as they are finished.

**Status:** not started · **Branch:** `feature/seo-fixes` (off master, one commit per item)

| # | Item | Who | Status |
|---|------|-----|--------|
| 1 | Search Console | You | Verified, baseline pending |
| 2 | Mobile speed | Claude | To do |
| 3 | Product titles and descriptions | Claude drafts, you approve | To do |
| 4 | Internal links | Claude | To do |
| 5 | Heading order | Claude | To do |
| 6 | llms.txt | Claude | To do |
| – | Deploy and re-measure | Claude | To do |
| 7 | Bing Webmaster Tools | You | Done |
| 8 | Request indexing | You, after deploy | To do |
| 9 | Google Merchant Center | You and Claude, after deploy | To do |

## 1. Search Console (you)

Can start right away. It does not depend on the code work.

- [x] Verify `earthyglow.nl` as a Domain property (TXT record at Strato; keep that record, removing it un-verifies the site)
- [x] Submit `https://www.earthyglow.nl/sitemap.xml`
- [x] Link Search Console to Google Analytics
- [ ] After a few days, note the indexed page count here as a baseline: ____
- [ ] Check the Pages report for pages Google declined to index

## 2. Mobile speed

Baseline, simulated slow phone connection. Target: under 2.5s.

| Page | Before | After |
|------|--------|-------|
| Product (floral box) | ~10s | |
| Home | ~6.4s | |
| Shop | ~4.5s | |
| Care | ~3.8s | |

- [ ] Product gallery: only load the first image up front (`fetchPriority="high"`), lazy-load the rest. All gallery images download immediately today, up to 1.9 MB on the floral box
- [ ] Home: check the hero picks a sensible size on phones, and preload it
- [ ] Re-compress the 7 largest originals (over 250 KB) with `scripts/images.mjs`, checking they still look good
- [ ] Shop: find out why the heading is the slowest item (likely the display font or the reveal animation)
- [ ] Re-measure and fill in the table

## 3. Product titles and descriptions

- [ ] Add an optional `seoDescription` to products in `src/data/products.ts`, so the page text stays as it is
- [ ] Write descriptions of about 150 characters for the 19 products over 160, and tidy the other 7 where useful
- [ ] Titles say what the product is: "Boo Boo Soy Candle · EarthyGlow", "… Wax Melts · EarthyGlow", "… Gift Box · EarthyGlow"
- [ ] Same for the 4 collection pages, for example "The Natural Glow · Unscented Soy Candles · EarthyGlow" (check wording against what each collection really is)
- [ ] Lengthen the 6 descriptions under 120 characters: 3 collections (scented, little, natural glow), policies index, contact information, spiral
- [ ] Add a short, genuinely useful intro (2–4 sentences) to the 4 collection pages, which are thin at about 80–150 words
- [ ] **You approve the full list before it goes live**

## 4. Internal links

- [ ] Add real links to the 4 collection pages: footer and shop page filters, as plain links visible without JavaScript
- [ ] Fix the slash mismatch: pages are served and canonicalised at `/shop/`, links go to `/shop` and get a 301
- [ ] **Careful:** `src/root.tsx` strips trailing slashes in its loader and client loader. That must be fixed together with the links, or navigation will redirect back and forth. Cart and checkout are not prerendered and stay slashless
- [ ] Update the outdated comment in `src/root.tsx`
- [ ] Add a few links in running text: About and Care to collections
- [ ] Crawl check: no internal 301s, every sitemap page has at least one link

## 5. Heading order

- [ ] Collection pages (4): add an h2 above the product grid, or lower the card heading
- [ ] Care: an h2 above the tips
- [ ] Policies index and contact information: h3 to h2
- [ ] Crawl check: no heading jumps on any of the 40 pages, with styling unchanged

## 6. llms.txt

- [ ] Add `public/llms.txt`: who EarthyGlow is, what it sells, links to the shop, collections, care and policies
- [ ] Confirm it returns 200 live

## Deploy and re-measure

- [ ] Tests, typecheck and lint pass
- [ ] Merge, push, then deploy with `netlify deploy --build --prod` (no API changes expected)
- [ ] Re-run the crawl and speed test on the live site

## 7. Bing Webmaster Tools (you)

Can be done anytime.

- [x] Sign in at bing.com/webmasters and import the site from Search Console
- [x] Confirm the sitemap came across

## 8. Request indexing (you, after deploy)

Wait until the fixes are live: the daily quota is limited and the titles and links are about to change.

- [ ] In Search Console, use URL Inspection → Request indexing, most important pages first: home, shop, the 4 collection pages, best-selling products
- [ ] Spread the rest over a few days if the daily limit is reached

## 9. Google Merchant Center (after deploy)

- [ ] Create an account at merchants.google.com and link it to Search Console
- [ ] Check that shipping and return details match the site. The product schema has a flat €6.99 rate and does not mention free shipping over €25
- [ ] Add the products and turn on free listings
- [ ] Check for rejected products after review

## Later, not part of this plan

- Finish `feature/localization`: Dutch pages are probably the largest remaining SEO gain
- Review stars in the schema, once there are real reviews
