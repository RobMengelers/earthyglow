import { Hero } from './components/Hero'
import { Divider } from '../../components/ui/Divider'
import { AboutTeaser } from './components/AboutTeaser'
import { Newsletter } from './components/Newsletter'
import { Reveal } from '../../components/ui/Reveal'
import { products } from '../../data/products'
import { seasons } from '../../data/seasons'
import { JsonLd } from '../../components/seo/JsonLd'
import { imageAttrs, SIZES } from '../../lib/images'
import { localizedUrl, organizationLd, siteMeta } from '../../lib/seo'
import { localizedSeason } from '../../data/catalog-i18n'
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import type { Route } from './+types/Home'

const featuredSeasons = seasons

const homeCopy = defineCopy({
  en: {
    eyebrow: 'Shop by season',
    title: 'Make room for a winter glow',
    lede: 'Cosy winter favourites and thoughtful gifts, alongside a little glow for every season. All poured by hand.',
    count: (count: number) => `${count} ${count === 1 ? 'product' : 'products'}`,
    cardTitle: { summer: 'Summer candles', spring: 'Spring candles', autumn: 'Autumn candles', winter: 'Winter candles' } as Record<string, string>,
    explore: (label: string) => `Explore ${label}`,
    all: 'Shop everything',
  },
  nl: {
    eyebrow: 'Shop per seizoen',
    title: 'Maak plaats voor een winterse gloed',
    lede: 'Knusse winterfavorieten en attente cadeaus, en een beetje gloed voor elk seizoen. Allemaal met de hand gegoten.',
    count: (count: number) => `${count} ${count === 1 ? 'product' : 'producten'}`,
    // \u00ad marks where a long title may break on narrow screens.
    cardTitle: { summer: 'Zomer\u00adkaarsen', spring: 'Lente\u00adkaarsen', autumn: 'Herfst\u00adkaarsen', winter: 'Winter\u00adkaarsen' },
    explore: (label: string) => `Ontdek ${label.toLowerCase()}`,
    all: 'Bekijk alles',
  },
  de: {
    eyebrow: 'Nach Jahreszeit shoppen',
    title: 'Mach Platz für winterlichen Glanz',
    lede: 'Gemütliche Winterlieblinge und liebevolle Geschenke, dazu ein kleiner Glanz für jede Jahreszeit. Alles von Hand gegossen.',
    count: (count: number) => `${count} ${count === 1 ? 'Produkt' : 'Produkte'}`,
    cardTitle: { summer: 'Sommer\u00adkerzen', spring: 'Frühlings\u00adkerzen', autumn: 'Herbst\u00adkerzen', winter: 'Winter\u00adkerzen' },
    explore: (label: string) => `${label} entdecken`,
    all: 'Alles ansehen',
  },
})

export function meta({ params }: Route.MetaArgs) {
  return siteMeta({ locale: localeFromParams(params), path: '/' })
}

export function Home() {
  const locale = useLocale()
  const copy = useCopy(homeCopy)
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'EarthyGlow',
          url: localizedUrl(locale, '/'),
          inLanguage: locale,
        }}
      />
      <JsonLd data={organizationLd(locale)} />
      <Hero />
      <Divider />

      <section className="collections" id="collections">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p className="section-lede">{copy.lede}</p>
          </Reveal>
          <div className="collection-card-grid">
            {featuredSeasons.map((baseSeason, i) => {
              const season = localizedSeason(baseSeason, locale)
              const cover = products.find((product) => product.id === season.coverProductId)
              return (
                <Reveal key={season.id} delay={i * 90} className="collection-card-wrap">
                  <Link to={`/shop?season=${season.id}`} className="collection-card" prefetch="intent">
                    <div className="collection-card-media">
                      {cover && (
                        <img
                          {...imageAttrs(cover.image, SIZES.cover)}
                          alt={season.label}
                          loading="lazy"
                        />
                      )}
                      <span className="collection-card-count">{copy.count(season.productIds.length)}</span>
                    </div>
                    <div className="collection-card-body">
                      <p className="eyebrow">{season.label}</p>
                      <h3>{copy.cardTitle[season.id] ?? season.label}</h3>
                      <p>{season.description}</p>
                      <span className="product-cta">{copy.explore(season.label)}<span aria-hidden="true">→</span></span>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
          <Reveal className="featured-cta">
            <Link to="/shop" className="btn btn-ghost" prefetch="intent">
              {copy.all}
            </Link>
          </Reveal>
        </div>
      </section>

      <AboutTeaser />
      <Newsletter />
    </>
  )
}

export default Home
