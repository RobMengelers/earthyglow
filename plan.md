# Plan: SSR + proper SEO for EarthyGlow

## Goal
Migrate the Vite SPA to **React Router 8 framework mode** (full SSR on Netlify), then layer in the complete SEO foundation that SSR unlocks: per-route meta/OG tags, canonical URLs, JSON-LD, robots.txt, sitemap, real 404s, noindex on private routes.

## Decisions (confirmed)
- **Framework**: React Router 8 framework mode (upgrade from current `react-router-dom` v7)
- **Render strategy**: `ssr: true` + `prerender` for all static public pages (products live in static `src/data/products.ts`, so prerender always matches the build)
- **SITE_URL**: `https://earthyglow.nl`
- **Keeps `src/` as app directory** (`appDirectory: "src"` — official migration path, minimal churn; components/routes/data stay where they are)
- Express API in `server/` (Railway) is untouched; client keeps fetching via `VITE_API_URL`

## Environment checks (done)
- Node v24.16.0 ✅ (RR8 needs 22.22+), React 19.2.8 ✅ (needs 19.2.7+), Vite 8.3 ✅ (needs 7+)
- Netlify support: `@netlify/vite-plugin-react-router` v4+ officially supports RR8 (serverless functions by default)
- RR8 breaking changes affecting us: drop `react-router-dom` (import from `react-router`), `meta` args use `loaderData` (not `data`)

---

## Phase 1 — Framework migration (SSR)

1. **Dependencies** (`package.json`)
   - Remove: `react-router-dom`, `@vitejs/plugin-react` (reactRouter() replaces it)
   - Add: `react-router@^8`, `@react-router/dev@^8`, `@netlify/vite-plugin-react-router@^4`
   - Check netlify/react-router-template package.json for any other required peer (e.g. `@react-router/node`) and mirror it

2. **`react-router.config.ts`** (new, repo root)
   ```ts
   { appDirectory: "src", buildDirectory: "build", ssr: true, prerender: async fn }
   ```
   Prerender list generated from `src/data/products.ts` exports:
   `/`, `/shop`, all `/shop/:collectionId`, all `/product/:productId`, `/about`,
   `/care`, `/contact`, 4× `/policies/*`, `/sitemap.xml`
   — **not** prerendered (runtime SSR): `/cart`, `/checkout/*`, `/admin/*`, `*` (404)

3. **`vite.config.ts`**
   ```ts
   plugins: [reactRouter(), netlifyPlugin()]  // keep existing /api dev proxy
   ```

4. **`src/root.tsx`** (new — replaces `index.html` + `main.tsx` bootstrap)
   - `Layout` export: full HTML shell (`<html lang="en">`, charset, viewport, favicon,
     Google Fonts `links()`, `<Meta/>`, `<Links/>`, `<Scripts/>`, `<ScrollRestoration/>`)
   - `CartProvider` moved here (currently in `main.tsx:8-16`)
   - Default export: `<Outlet />`
   - Root `meta()`: default title/description/OG tags (fallback for routes without meta)
   - Root `ErrorBoundary`: generic 500 page

5. **`src/routes.ts`** (new — replaces `App.tsx` `<Routes>`, same paths)
   - `route("admin", AdminLayout, [ index → loader `redirect("/admin/overview")`, overview, orders, orders/new ])`
   - `layout("./components/layout/Layout.tsx", [ ...all storefront routes... ])`
   - `route("*", NotFound)` — **loader throws `new Response(..., { status: 404 })`**,
     module `ErrorBoundary` renders existing `<NotFound/>` → real HTTP 404s (fixes soft-404)

6. **Convert pages to route modules** (each `src/pages/**` file keeps its named export,
   gains `export default X` + `export function meta()`):
   - Home, Shop, ProductPage, About, Care, Contact, Cart, Checkout,
     CheckoutConfirmation, 4× policies, NotFound, AdminLayout + 3 admin pages

7. **Delete**: `index.html`, `src/main.tsx`, `src/App.tsx`

8. **Import sweep**: `react-router-dom` → `react-router` across `src/`

9. **SSR/hydration fixes** (both crash or desync during server render today):
   - `src/cart/CartProvider.tsx:47` — `useState(loadItems)` reads `localStorage` at render →
     init `[]`, load in `useEffect` post-hydration, gate the save-effect on a `hydrated` flag
     (so the initial empty state doesn't wipe the stored cart)
   - `src/pages/Admin/AdminLayout.tsx:24` — `useState(() => getAdminToken())` reads
     `localStorage` unguarded → same pattern (init `null`, resolve in effect)
   - Audit pass for any other render-time browser API access (grep found all other
     `window`/`document` usage inside effects/handlers — safe)

10. **`package.json` scripts**
    ```json
    "dev": "react-router dev",
    "build": "react-router build",
    "typecheck": "react-router typegen && tsc -b"
    ```

11. **tsconfig**: add RR8 template requirements (typegen includes, `vite/client` types) — verify against netlify template during implementation

## Phase 2 — SEO layer

12. **`src/lib/seo.ts`** (new)
    - `SITE_URL = 'https://earthyglow.nl'`
    - `siteMeta({ title, description, path, image?, type?, robots? })` → complete meta
      descriptor array: `<title>`, description, **canonical**, `og:title/description/url/type/
      site_name/image`, `twitter:card` + twitter equivalents
    - Note: RR8 meta is *replace-not-merge* per route — helper always returns the full set

13. **Per-route meta** (via `siteMeta`):
    - Home/Shop/About/Care/Contact/Policies: page-specific title + description
    - Shop canonical = `/shop` (drops `?season=` → fixes duplicate-content variants)
    - Product: name + price/description from `products.ts`, canonical `/product/:id`
    - **noindex**: `admin/*` (on AdminLayout meta), `/cart`, `/checkout`,
      `/checkout/confirmation`, NotFound

14. **JSON-LD** (small `<JsonLd>` component, `dangerouslySetInnerHTML` script tag — valid in body):
    - Home: `WebSite` + `Organization`
    - ProductPage: `Product` + `Offer` (price, image, availability) + `BreadcrumbList`
    - Pages with breadcrumbs (Shop, About, Care, Contact, policies): `BreadcrumbList`
    - Contact: `LocalBusiness` (CoC/VAT data already in `Contact.tsx:72-86`)

15. **`public/robots.txt`** (new): allow all, `Disallow: /admin/`, `Sitemap: https://earthyglow.nl/sitemap.xml`

16. **`/sitemap.xml` resource route** (new: `src/routes/sitemap.ts`): loader returns
    XML built from `products.ts` + collections + static pages; listed in `prerender`
    → emitted as static `build/client/sitemap.xml` at build

17. **`netlify.toml`**
    - `publish = "build/client"` (command stays `npm run build`)
    - **Remove the `/* → /index.html 200` soft-404 redirect** (Netlify plugin owns routing;
      this redirect was masking 404s)
    - Pin `NODE_VERSION` ≥ 22.22 in `[build.environment]`

## Phase 3 — Verification

18. `npm run lint` && `npm run typecheck` && `npm run build` (prerender runs here)
19. `npm run dev` + `curl` matrix:
    - `/` — full content in HTML (not empty `<div id="root">`), title, description,
      canonical, OG/Twitter tags, WebSite JSON-LD
    - `/product/:id` — product title/desc, canonical, Product JSON-LD
    - `/shop?season=summer` — canonical → `https://earthyglow.nl/shop`
    - `/nope` — **HTTP 404** + noindex
    - `/admin/overview`, `/cart`, `/checkout` — `robots: noindex`
    - `/sitemap.xml` — valid, lists every product; `/robots.txt` — present
    - `grep -L "Little moments"` on fetched `/` HTML would fail → content is server-rendered
20. Manual browser check for hydration warnings (cart persists after reload)

## Explicitly out of scope (follow-ups, will note at end)
- Dedicated 1200×630 `og:image` (use `/logo.png` initially — square, suboptimal)
- Image optimization: `width`/`height` (CLS), srcset/sizes, descriptive filenames
- Self-hosting/subsetting Google Fonts (currently render-blocking CSS link, kept as-is)
- `favicon.ico`, web manifest, `theme-color`
- `ProductCard` heading level fix (h4 → h3)
