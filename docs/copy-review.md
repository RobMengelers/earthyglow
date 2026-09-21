# Website copy review

Reviewed on 21 September 2026 against the live EarthyGlow shop and this application's behaviour.

## Voice

Write as Naomi when describing making candles or helping a customer. Use short, specific sentences and ordinary punctuation. Avoid em dashes, generic lifestyle promises, invented launch dates and guarantees that the business has not confirmed. Keep functional labels clear.

## Checked and corrected

- [About EarthyGlow](https://earthyglow.nl/pages/about-earthyglow): Naomi is the founder and maker, works in social care, and makes candles in the Netherlands. The revised story follows those facts.
- [Products](https://earthyglow.nl/collections/all) and the [public product catalog](https://earthyglow.nl/products.json?limit=250): Floral Box contains nine flower candles, approximately 220g, with Bluebell fragrance. Floral Basket is approximately 150g with English Rose fragrance. These are flower arrangements, not tealights.
- Product descriptions now identify Coconut Island, Vanilla & Cinders and Pumpkin Spice where appropriate. Sculptural candles are fragrance-free. Generic claims that every candle has a wooden wick or reusable glass have been removed.
- [Candle care](https://earthyglow.nl/pages/candle-care): restored separate flower and sculptural candle instructions, wooden wick length of 3 to 5 mm, and jar-specific burn guidance. Product pages link to the care guide. Follow individual product safety labels.
- [Contact](https://earthyglow.nl/pages/contact): email, KVK 42049155 and VAT number NL005456394B38 match. Removed the unverified 24-hour response promise.
- Shipping remains €6.99 for NL, free from €25; €12.95 internationally, free from €50, as explicitly confirmed by the owner. These rates match both checkout implementations. The original site's €4.95 NL wording is intentionally not copied.
- Removed newsletter signup, early-access and September launch claims from the Instagram section. No newsletter signup exists in this application.
- Removed promises that sold-out products will return. Inventory remains controlled by this application's catalog, not inferred from the other shop.
- Corrected payment-status wording: a refund is not an unpaid order; a failed payment lookup does not establish whether a customer was charged. The local-only demo no longer promises an emailed payment link.
- Removed em/en dashes from storefront, admin text, metadata and transactional email copy. CSS custom properties and CLI flags are unaffected.

## Catalog coverage implemented

Added Ghostlight Dinner Candle (€2.95), Pumpkin Boo (€8.95), Boo Boo (€8.95), Scary Boo (€8.95) and Pumpkin Spice Wax Melts (€4.95) under The Halloween Glow. Images come from the original shop, saved locally as WebP. Wax melts and the dinner candle have product-specific care instructions.

Added size/bundle selectors with these prices:

| Product | Small | Medium | Large | Bundle |
| --- | --- | --- | --- | --- |
| Column | €9.95 | N/A | €12.95 | €19.95 |
| Pillar | €6.95 | €9.95 | €12.95 | €24.95 |
| Spiral | €6.95 | €9.95 | €12.95 | €24.95 |
| Shell | €4.95 | N/A | €8.95 | €11.95 |
| Arch | €4.95 | €6.95 | €8.95 | €15.95 |
| Bubble | €4.95 | €6.95 | €8.95 | €15.95 |

Source: the [original shop catalog](https://earthyglow.nl/products.json?limit=250), checked on 21 September 2026. Bundle contents are not specified in the source, so this implementation does not invent them.

Migration `20260921210000_expand_seasonal_catalog` adds five products and 22 variants without overwriting existing catalog records. Applied to the local database. It must also run before the updated storefront is released to production.

Cart refresh now uses variant prices rather than replacing them with base prices. Checkout requires an option for products with variants and validates the option against the server catalog. Older cart entries without a required option receive an instruction to choose one and add the product again. Existing stock flags, shipping rates and order history are preserved.

## Policy findings still needing review

### Refund and delivery terms

The original refund policy and this project both say handmade/made-to-order items are not automatically returnable and ask customers to contact the shop within seven days. The terms ask for damage reports within 48 hours and disclaim carrier delays. These substantive rules were not changed as part of the tone edit.

These rules need review before treating the policies as legally verified. [EU guidance on returns](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm) describes a general 14-day withdrawal period for online purchases and an exception for genuinely personalised goods. Handmade production alone should not be treated as establishing that exception. Short reporting requests must not remove statutory rights.

### Privacy policy

The current policy contains generic claims about customer accounts, wishlists, reviews, advertising, card details and Global Privacy Control. The application has no customer account, wishlist, review or advertising feature, redirects payment to Mollie, and stores the cart in browser local storage. Email delivery uses Resend; hosting uses Netlify and Railway.

The privacy policy was not rewritten to guess at business-wide practices. Confirm actual marketing, provider agreements, retention periods and international-transfer arrangements, then replace the generic text with an accurate policy for this storefront. [EU privacy guidance](https://europa.eu/youreurope/citizens/consumers/internet-telecoms/data-protection-online-privacy/index_en.htm) outlines the information customers should receive.

## Validation

Frontend production build, ESLint, backend TypeScript check and whitespace checks pass. No remaining em/en dashes were found in source copy. Catalog route and checkout tests pass with mocked database/payment calls (`npm --prefix server test`). All 17 product pages render, all image paths resolve, and the local API prices match the storefront. Changes are local; this copy review and catalog expansion have not been deployed.
