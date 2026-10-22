# EarthyGlow

React, TypeScript and React Router (framework mode, server-side rendered) storefront
with a separate backend in `server/`.

## Development

- `npm install` — install frontend dependencies.
- `npm run dev` — start the frontend development server (SSR + Netlify emulation).
- `npm run build` — create the production bundle and prerender static pages.
- `npm run typecheck` — generate route types and run TypeScript.
- `npm run lint` — run ESLint.
- `node scripts/images.mjs` — regenerate responsive image variants and
  `src/data/imageMeta.ts` after adding or replacing photos in `public/images`.

See `server/package.json` for backend commands and `.env.example` for configuration.
Run `npm --prefix server test` for catalog, variant/colour-pricing, coupon and
checkout regression checks.
These tests mock database access and payments; they do not create real orders.
Apply catalog migrations with `npm --prefix server run prisma:deploy` before releasing
storefront changes that add products or options.

## Coupon codes

Coupon codes live in the `Coupon` table; the admin portal has a **Coupons** page
to create and retire them. Every code has a type, so a new kind of offer is a new
row rather than new code:

- `free_shipping` — the shipping cost is taken off (the code `GLOWFAM`).
- `percent` — `percentOff` percent comes off the subtotal.
- `fixed_amount` — `amountOffCents` comes off the subtotal.

A code can also carry `maxUses` (a one-time code) and `expiresAt` (a code that
stops working on a date). The storefront checks a code before it is used and the
checkout checks it again, so a code that ran out is never honoured.

## Product colours

The Natural Glow candles come in five colours. A colour never changes the price;
it only changes the pictures. White is the basic candle: it keeps the neutral
photography, where the picture of the chosen size leads the gallery. Every other
colour brings its own pictures and replaces the gallery with them.

The pictures live per shape and per colour in `public/images/products/<shape>/<colour>/`
(`image-1.webp`, `image-2.webp`, …), and the neutral pictures of a shape live in
its `white/` folder. `src/data/products.ts` holds the palette and points every
colour at its pictures; the backend mirrors the palette in the `ProductColor`
table, so add a colour there with a migration as well.

## Frontend structure

```text
src/
  pages/
    Home/                 # Home page and its sections in components/
    Checkout/             # Checkout orchestration, countries, and form sections
    CheckoutConfirmation/ # Payment confirmation
    About/, Care/, ...    # Other route components and their CSS
    policies/             # Policy content sharing PolicyLayout
  components/
    layout/               # Site shell, navigation, footer, policy layout
    catalog/              # Reusable product and collection cards
    ui/                   # Reveal, buttons, divider, social links
  cart/
    components/           # Cart drawer and shipping progress
    cart.css              # Shared cart lines, quantities, totals, summary panels
    ...                   # Cart context, provider, hooks, API helpers
  admin/                  # Admin API client
  data/                   # Product and collection data
  styles/                 # Theme and shared styling primitives
  index.css               # Explicit stylesheet import list
  App.tsx                 # Route definitions
```

## Editing styles

Use ordinary CSS files beside the page or component they describe. For example,
edit `pages/Checkout/Checkout.css` for checkout layout and
`components/layout/Footer.css` for the footer. Keep media queries beside their
base rules.

Shared styles live in `styles/`: `theme.css` owns colors, fonts, spacing tokens,
and shadows; `base.css` owns resets; `buttons.css`, `forms.css`, and `layout.css`
own reusable primitives. The about and care section styles are shared between
home-page teasers and their full pages. Checkout result styles are shared by
checkout and payment confirmation.

`index.css` imports every stylesheet once in an explicit order. Register new
stylesheets there; avoid also importing them from TSX. This keeps the cascade
independent of the component import graph. Files are colocated for ownership,
but class names remain global: use page/component prefixes for new classes and
keep shared rules in shared stylesheets. Existing `hero-actions` is a shared
action-row utility in `styles/layout.css`.

Use inline styles only for runtime values, such as reveal delays and shipping
progress widths. Static styles, hover states, and responsive rules belong in CSS.

Keep route components focused on composition and page state. Extract substantial
sections into that page’s `components/` folder; move components to the shared
folders when multiple pages need them. Checkout keeps order submission in the
page, with separate contact, shipping, payment, and summary components.
