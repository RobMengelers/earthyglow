# EarthyGlow

React, TypeScript, and Vite storefront with a separate backend in `server/`.

## Development

- `npm install` — install frontend dependencies.
- `npm run dev` — start the frontend development server.
- `npm run build` — type-check and create the production bundle.
- `npm run lint` — run ESLint.

See `server/package.json` for backend commands and `.env.example` for configuration.
Run `npm --prefix server test` for catalog, variant-pricing and checkout regression checks.
These tests mock database access and payments; they do not create real orders.
Apply catalog migrations with `npm --prefix server run prisma:deploy` before releasing
storefront changes that add products or options.

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
