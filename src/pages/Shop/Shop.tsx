import { useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { collections, getCollection } from '../../data/products'
import { filterProducts, getSeason, seasons, holidays } from '../../data/seasons'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, localizedUrl, siteMeta } from '../../lib/seo'
import { localizedCollection, localizedSeason } from '../../data/catalog-i18n'
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import type { Route } from './+types/Shop'

const shopCopy = defineCopy({
  en: {
    metaTitle: 'Shop · Hand-poured Soy Candles · EarthyGlow',
    description: 'Browse hand-poured soy wax candles from EarthyGlow: flower candle gifts, seasonal scents and sculptural shapes, made by hand in the Netherlands.',
    home: 'Home',
    shop: 'Shop',
    breadcrumb: 'Breadcrumb',
    favourites: (_id: string, label: string) => `${label} favourites`,
    heading: 'Find your next little glow',
    lede: 'Browse by season, or take a look at everything I’ve been making.',
    eyebrow: 'Made by hand, chosen by you',
    caption: 'A glow for every season',
    bySeason: 'Shop by season',
    all: 'All candles',
    holidays: 'Holidays',
    emptyEyebrow: 'A different little glow',
    emptyTitle: 'No candles in this season just yet, check back in after November 1st',
    earlierSeasons: 'Show earlier seasons',
    moreSeasons: 'Show more seasons',
  },
  nl: {
    metaTitle: 'Shop · Handgegoten sojawaskaarsen · EarthyGlow',
    description: 'Bekijk de handgegoten sojawaskaarsen van EarthyGlow: bloemkaarsjes als cadeau, seizoensgeuren en sculpturale vormen, met de hand gemaakt in Nederland.',
    home: 'Home',
    shop: 'Shop',
    breadcrumb: 'Kruimelpad',
    favourites: (id: string, label: string) =>
      ({
        summer: 'Zomerfavorieten',
        spring: 'Lentefavorieten',
        autumn: 'Herfstfavorieten',
        winter: 'Winterfavorieten',
        halloween: 'Halloweenfavorieten',
        christmas: 'Kerstfavorieten',
      } as Record<string, string>)[id] ?? `Favorieten: ${label}`,
    heading: 'Vind jouw volgende kleine gloed',
    lede: 'Kies per seizoen, of bekijk alles wat ik heb gemaakt.',
    eyebrow: 'Met de hand gemaakt, door jou gekozen',
    caption: 'Een gloed voor elk seizoen',
    bySeason: 'Shop per seizoen',
    all: 'Alle kaarsen',
    holidays: 'Feestdagen',
    emptyEyebrow: 'Een andere kleine gloed',
    emptyTitle: 'Nog geen kaarsen voor dit seizoen, kijk na 1 november nog eens',
    earlierSeasons: 'Toon vorige seizoenen',
    moreSeasons: 'Toon meer seizoenen',
  },
  de: {
    metaTitle: 'Shop · Handgegossene Sojawachskerzen · EarthyGlow',
    description: 'Entdecke die handgegossenen Sojawachskerzen von EarthyGlow: Blumenkerzen als Geschenk, saisonale Düfte und skulpturale Formen, von Hand gemacht in den Niederlanden.',
    home: 'Start',
    shop: 'Shop',
    breadcrumb: 'Brotkrümelnavigation',
    favourites: (id: string, label: string) =>
      ({
        summer: 'Sommerlieblinge',
        spring: 'Frühlingslieblinge',
        autumn: 'Herbstlieblinge',
        winter: 'Winterlieblinge',
        halloween: 'Halloween-Lieblinge',
        christmas: 'Weihnachtslieblinge',
      } as Record<string, string>)[id] ?? `Lieblinge: ${label}`,
    heading: 'Finde deinen nächsten kleinen Glanz',
    lede: 'Stöbere nach Jahreszeit oder schau dir alles an, was ich gemacht habe.',
    eyebrow: 'Von Hand gemacht, von dir ausgewählt',
    caption: 'Ein Glanz für jede Jahreszeit',
    bySeason: 'Nach Jahreszeit shoppen',
    all: 'Alle Kerzen',
    holidays: 'Feiertage',
    emptyEyebrow: 'Ein anderer kleiner Glanz',
    emptyTitle: 'Noch keine Kerzen für diese Saison, schau nach dem 1. November wieder vorbei',
    earlierSeasons: 'Vorherige Jahreszeiten zeigen',
    moreSeasons: 'Weitere Jahreszeiten zeigen',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = shopCopy[locale]
  const base = getCollection(params.collectionId)
  const collection = base && localizedCollection(base, locale)
  return siteMeta({
    locale,
    title: collection ? `${collection.title} · Shop · EarthyGlow` : copy.metaTitle,
    description: collection?.blurb ?? copy.description,
    path: collection ? `/shop/${collection.id}` : '/shop',
  })
}

export function Shop() {
  const { collectionId } = useParams()
  const [params] = useSearchParams()
  const locale = useLocale()
  const copy = useCopy(shopCopy)
  const baseCollection = getCollection(collectionId)
  const activeCollection = baseCollection && localizedCollection(baseCollection, locale)
  const baseSeason = getSeason(params.get('season'))
  const activeSeason = baseSeason && localizedSeason(baseSeason, locale)
  const seasonNavRef = useRef<HTMLElement>(null)

  // The season row scrolls sideways on small screens. Its edge fades and the
  // arrow buttons follow the scroll position: a side only fades, and shows its
  // arrow, while there is more to see that way. Written straight to the DOM so
  // scrolling never re-renders the product grid.
  useEffect(() => {
    const nav = seasonNavRef.current
    if (!nav) return
    const update = () => {
      const max = nav.scrollWidth - nav.clientWidth
      const scrollable = max > 1
      nav.dataset.atStart = String(!scrollable || nav.scrollLeft <= 1)
      nav.dataset.atEnd = String(!scrollable || nav.scrollLeft >= max - 1)
    }
    update()
    nav.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    return () => {
      nav.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  // The arrows move the row by most of its width; keyboard users tab through
  // the links themselves, so the arrows stay out of the tab order.
  const scrollSeasons = (direction: 1 | -1) => {
    const nav = seasonNavRef.current
    nav?.scrollBy({ left: direction * nav.clientWidth * 0.7, behavior: 'smooth' })
  }
  useEffect(() => {
    const nav = seasonNavRef.current
    const selected = nav?.querySelector<HTMLElement>('.is-active')
    if (nav && selected) {
      // Centre the active season, but land exactly on an end when it is that
      // close, so the row is not left a few pixels off its start or end.
      const max = nav.scrollWidth - nav.clientWidth
      const centred = selected.offsetLeft - (nav.clientWidth - selected.offsetWidth) / 2
      const left = centred < 32 ? 0 : centred > max - 32 ? max : centred
      nav.scrollTo({ left })
    }
  }, [activeSeason?.id])

  useEffect(() => {
    const dropdowns = document.querySelectorAll('.season-dropdown')
    const cleanup: Array<() => void> = []
    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector('.season-dropdown-trigger') as HTMLElement | null
      const toggle = (e: Event) => {
        e.preventDefault()
        const menu = document.getElementById('holidays-dropdown') as HTMLElement | null
        if (!menu) return
        const isOpen = dropdown.classList.toggle('is-open')
        if (button) button.setAttribute('aria-expanded', String(isOpen))
        if (isOpen) {
          document.querySelectorAll('.season-dropdown.is-open').forEach((el) => {
            if (el !== dropdown) {
              el.classList.remove('is-open')
              const btn = el.querySelector('.season-dropdown-trigger') as HTMLElement | null
              if (btn) btn.setAttribute('aria-expanded', 'false')
            }
          })
          const rect = dropdown.getBoundingClientRect()
          menu.style.position = 'fixed'
          menu.style.left = `${rect.left}px`
          menu.style.top = `${rect.bottom + 4}px`
          menu.style.display = 'flex'
          menu.style.zIndex = '40'
          menu.style.minWidth = `${Math.max(rect.width, 180)}px`
        } else {
          menu.style.display = 'none'
        }
      }
      button?.addEventListener('click', toggle)
      cleanup.push(() => button?.removeEventListener('click', toggle))
    })
    const onDocClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.season-dropdown') && !(event.target as HTMLElement).closest('#holidays-dropdown')) {
        document.querySelectorAll('.season-dropdown.is-open').forEach((el) => {
          el.classList.remove('is-open')
          const btn = el.querySelector('.season-dropdown-trigger') as HTMLElement | null
          if (btn) btn.setAttribute('aria-expanded', 'false')
        })
        const menu = document.getElementById('holidays-dropdown') as HTMLElement | null
        if (menu) menu.style.display = 'none'
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.season-dropdown.is-open').forEach((el) => {
          el.classList.remove('is-open')
          const btn = el.querySelector('.season-dropdown-trigger') as HTMLElement | null
          if (btn) btn.setAttribute('aria-expanded', 'false')
        })
        const menu = document.getElementById('holidays-dropdown') as HTMLElement | null
        if (menu) menu.style.display = 'none'
      }
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    const onResize = () => {
      const dropdown = document.querySelector('.season-dropdown.is-open') as HTMLElement | null
      const menu = document.getElementById('holidays-dropdown') as HTMLElement | null
      if (dropdown && menu && menu.style.display !== 'none') {
        const rect = dropdown.getBoundingClientRect()
        menu.style.left = `${rect.left}px`
        menu.style.top = `${rect.bottom + 4}px`
        menu.style.minWidth = `${Math.max(rect.width, 180)}px`
      }
    }
    const onScroll = () => {
      const dropdown = document.querySelector('.season-dropdown.is-open') as HTMLElement | null
      const menu = document.getElementById('holidays-dropdown') as HTMLElement | null
      if (dropdown && menu && menu.style.display !== 'none') {
        const rect = dropdown.getBoundingClientRect()
        menu.style.left = `${rect.left}px`
        menu.style.top = `${rect.bottom + 4}px`
      }
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    cleanup.push(() => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    })
    return () => cleanup.forEach((fn) => fn())
  }, [activeSeason?.id])
  const shown = filterProducts(activeSeason?.id, activeCollection?.id)
  const grouped = !activeSeason && !activeCollection
  const groups = grouped
    ? collections
        .map((collection) => ({
          collection: localizedCollection(collection, locale),
          products: shown.filter((product) => product.collectionId === collection.id),
        }))
        .filter((group) => group.products.length > 0)
    : []
  const heading = activeSeason
    ? copy.favourites(activeSeason.id, activeSeason.label)
    : activeCollection?.title ?? copy.heading
  const lede = activeSeason?.description ?? activeCollection?.blurb ?? copy.lede

  function filterUrl(seasonId?: string, glowId?: string) {
    const path = glowId ? `/shop/${glowId}` : '/shop'
    return seasonId ? `${path}?season=${seasonId}` : path
  }

  const breadcrumbs = [
    { name: copy.home, path: '/' },
    { name: copy.shop, path: '/shop' },
    ...(activeSeason || activeCollection
      ? [{ name: (activeSeason?.label ?? activeCollection?.eyebrow) as string }]
      : []),
  ]

  return (
    <>
      <JsonLd data={breadcrumbLd(breadcrumbs, locale)} />
      {shown.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: shown.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: product.name,
              url: localizedUrl(locale, `/product/${product.id}`),
            })),
          }}
        />
      )}
      <section className="page-hero shop-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/shop" prefetch="intent">{copy.shop}</Link>
              {(activeSeason || activeCollection) && (
                <>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{activeSeason?.label ?? activeCollection?.eyebrow}</span>
                </>
              )}
            </nav>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{heading}</h1>
            <p className="section-lede">{lede}</p>
          </Reveal>
        </div>
      </section>

      {/* <Divider white />x */}

      <section className="shop-body">
        <div className="container">
          <Reveal className="shop-filters">
            <p className="shop-filter-caption">{copy.caption}</p>
            <nav ref={seasonNavRef} className="season-nav" aria-label={copy.bySeason}>
              {[{ id: '', label: copy.all }, ...seasons.map((season) => localizedSeason(season, locale))].map((season) => {
                const selected = (activeSeason?.id ?? '') === season.id
                const count = filterProducts(season.id || undefined).length
                return (
                  <Link
                    key={season.id}
                    to={filterUrl(season.id || undefined)}
                    className={`season-link${selected ? ' is-active' : ''}`}
                    aria-current={selected ? 'page' : undefined}
                    prefetch="intent"
                    preventScrollReset
                  >
                    <span>{season.label}</span>
                    <span className="season-count" aria-hidden="true">{String(count).padStart(2, '0')}</span>
                  </Link>
                )
              })}
              <span className="season-divider" aria-hidden="true" />
              <div className="season-dropdown">
                <button
                  type="button"
                  className={`season-link season-dropdown-trigger${holidays.some((h) => (activeSeason?.id ?? '') === h.id) ? ' is-active' : ''}`}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span>{copy.holidays}</span>
                  <svg className="season-chevron" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </nav>
            <button
              type="button"
              className="season-arrow season-arrow-prev"
              aria-label={copy.earlierSeasons}
              tabIndex={-1}
              onClick={() => scrollSeasons(-1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="season-arrow season-arrow-next"
              aria-label={copy.moreSeasons}
              tabIndex={-1}
              onClick={() => scrollSeasons(1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

          </Reveal>

          <div className="season-dropdown-menu" role="menu" id="holidays-dropdown">
            {holidays.map((holiday) => {
              const selected = (activeSeason?.id ?? '') === holiday.id
              const count = filterProducts(holiday.id).length
              return (
                <Link
                  key={holiday.id}
                  to={filterUrl(holiday.id)}
                  className={`season-dropdown-item${selected ? ' is-active' : ''}`}
                  onClick={() => {
                    document.querySelectorAll('.season-dropdown.is-open').forEach((el) => {
                      el.classList.remove('is-open')
                      const btn = el.querySelector('.season-dropdown-trigger') as HTMLElement | null
                      if (btn) btn.setAttribute('aria-expanded', 'false')
                    })
                    const menu = document.getElementById('holidays-dropdown') as HTMLElement | null
                    if (menu) menu.style.display = 'none'
                  }}
                  role="menuitem"
                  aria-current={selected ? 'page' : undefined}
                  prefetch="intent"
                  preventScrollReset
                >
                  <span>{localizedSeason(holiday, locale).label}</span>
                  <span className="season-count" aria-hidden="true">{String(count).padStart(2, '0')}</span>
                </Link>
              )
            })}
          </div>

          {shown.length > 0 ? (
            grouped ? (
              <div key="all" className="product-groups">
                {groups.map(({ collection, products: collectionProducts }) => (
                  <section
                    key={collection.id}
                    className="product-group"
                    aria-labelledby={`collection-${collection.id}`}
                  >
                    <Reveal className="product-group-head">
                      <div>
                        <p className="eyebrow">{collection.eyebrow}</p>
                        <h2 id={`collection-${collection.id}`}>{collection.title}</h2>
                      </div>
                    </Reveal>
                    <div className="product-grid">
                      {collectionProducts.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div
                key={`${activeSeason?.id ?? 'all'}:${activeCollection?.id ?? 'all'}`}
                className="product-grid"
              >
                {shown.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )
          ) : (
            <div className="shop-empty">
              <p className="eyebrow">{copy.emptyEyebrow}</p>
              <h2>{copy.emptyTitle}</h2>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Shop
