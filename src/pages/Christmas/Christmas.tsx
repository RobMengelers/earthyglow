import { getProduct, productLowestCents, type Product } from '../../data/products'
import { holidays } from '../../data/seasons'
import { shippingZoneForCountry } from '../../cart/CartContext'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { FaqItem } from '../../components/ui/FaqItem'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, faqLd, localizedUrl, siteMeta } from '../../lib/seo'
import { defineCopy, formatPriceFor, Link, LOCALE_INFO, localeFromParams, useCopy, useLocale, type Locale } from '../../i18n'
import type { Route } from './+types/Christmas'

// Christmas gift guide: the Christmas products grouped by price, with the
// shipping facts and questions people have before ordering a gift. Products,
// prices and shipping rates all come from the shop data, so the page never
// disagrees with the checkout.

const PATH = '/christmas-gifts'

const christmasProducts: Product[] = (holidays.find((holiday) => holiday.id === 'christmas')?.productIds ?? [])
  .map((id) => getProduct(id))
  .filter((product): product is Product => Boolean(product))
  .sort((a, b) => productLowestCents(a) - productLowestCents(b))

/** Price bands, each up to and including `maxCents`. */
const BANDS = [
  { id: 'under-5', maxCents: 500 },
  { id: 'under-10', maxCents: 1000 },
  { id: 'over-10', maxCents: Infinity },
] as const
type BandId = (typeof BANDS)[number]['id']

const bands = BANDS.map((band, i) => ({
  ...band,
  products: christmasProducts.filter((product) => {
    const cents = productLowestCents(product)
    return cents <= band.maxCents && (i === 0 || cents > BANDS[i - 1].maxCents)
  }),
})).filter((band) => band.products.length > 0)

const NL_ZONE = shippingZoneForCountry('NL')
const EU_ZONE = shippingZoneForCountry('DE')
const UNSCENTED = ['christmas-tree-dinner-candle', 'christmas-bubble-candle', 'twisted-tree-candle']

// Last order dates for delivery before Christmas Eve: 1 to 3 working days to
// get an order ready plus 2 to 4 for delivery, counted back from Thursday
// 24 December 2026, with extra margin abroad. Update these each year.
const ORDER_BY = { nl: '2026-12-15', eu: '2026-12-11' }

type Prices = {
  from: string
  nlRate: string
  nlFree: string
  euRate: string
  euFree: string
  unscented: string
  nlOrderBy: string
  euOrderBy: string
}

function pricesFor(locale: Locale): Prices {
  // Round amounts read better without cents: "free from €25".
  const price = (cents: number) => formatPriceFor(locale, cents).replace(/[.,]00$/, '')
  // UTC on both server and browser, so the prerendered date never shifts a day.
  const date = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE_INFO[locale].intl, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
  return {
    from: price(productLowestCents(christmasProducts[0])),
    nlRate: price(NL_ZONE.rateCents),
    nlFree: price(NL_ZONE.freeThresholdCents),
    euRate: price(EU_ZONE.rateCents),
    euFree: price(EU_ZONE.freeThresholdCents),
    unscented: UNSCENTED.map((id) => getProduct(id)?.name).filter(Boolean).join(', '),
    nlOrderBy: date(ORDER_BY.nl),
    euOrderBy: date(ORDER_BY.eu),
  }
}

type Band = { eyebrow: string; title: string; lede: string }

const christmasCopy = defineCopy({
  en: {
    metaTitle: 'Christmas Gifts & Soy Wax Christmas Candles · EarthyGlow',
    description: (p: Prices) =>
      `Hand-poured Christmas candles, scented candles and wax melts made from soy wax, from ${p.from}. Gifts under €5, €10 and €15, made by hand in the Netherlands.`,
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    crumb: 'Christmas gifts',
    eyebrow: 'Christmas gift guide',
    title: 'Christmas gifts, poured by hand',
    lede: (p: Prices) =>
      `Cosy scented candles, festive table candles and little wax melts, all hand-poured from soy wax in the Netherlands. Sorted by price, from ${p.from}.`,
    intro: [
      'Looking for a Christmas gift that feels personal? I pour every one of my Christmas candles and wax melts by hand, in small batches, from soy wax.',
      'You will find scented candles that smell of mulled wine, hot chocolate or a winter forest, unscented candles for the Christmas table, and small wax melts for a wax warmer. Below they are sorted by price, so you can quickly find something for a colleague, the neighbours, your mum or yourself.',
    ],
    perks: (p: Prices) => [
      { title: 'Hand-poured soy wax', text: 'Every candle is made by hand in the Netherlands, so each one is a little unique.' },
      { title: `Free shipping from ${p.nlFree}`, text: `Within the Netherlands. To other EU countries, shipping is free from ${p.euFree}.` },
      { title: `Order by ${p.nlOrderBy}`, text: `For delivery before Christmas in the Netherlands. To other EU countries, order by ${p.euOrderBy}.` },
    ],
    bands: {
      'under-5': { eyebrow: 'Stocking fillers', title: 'Christmas gifts under €5', lede: 'Little extras for a stocking, a Secret Santa or tucked in with a Christmas card.' },
      'under-10': { eyebrow: 'Small gifts', title: 'Christmas gifts under €10', lede: 'A cosy scented candle or a festive decoration: a gift you would love to get yourself.' },
      'over-10': { eyebrow: 'Something special', title: 'Christmas gifts from €10', lede: 'For someone who deserves a little more: a gift box full of flower candles or a large candle with a wintry scent.' },
    } as Record<BandId, Band>,
    shopAllTitle: 'Looking for something else?',
    shopAllText: 'Besides the Christmas collection there are flower candles, sculptural candles and wax melts all year round.',
    shopAll: 'Shop all candles',
    faqEyebrow: 'Good to know',
    faqTitle: 'Questions about ordering for Christmas',
    faqs: (p: Prices) => [
      { question: 'When should I order to have it in time for Christmas?', answer: `Order by ${p.nlOrderBy} for delivery in the Netherlands before Christmas, and by ${p.euOrderBy} for other EU countries. I get your order ready within 1 to 3 working days, after which delivery usually takes 2 to 4 working days. You can still order after those dates, but delivery services are very busy around the holidays, so I cannot promise it will arrive before Christmas.` },
      { question: 'What does shipping cost?', answer: `Within the Netherlands shipping costs ${p.nlRate} and is free from ${p.nlFree}. To other EU countries it costs ${p.euRate} and is free from ${p.euFree}.` },
      { question: 'Which Christmas candles are unscented?', answer: `${p.unscented} are unscented, which makes them ideal for the Christmas dinner table, where you want to smell the food.` },
      { question: 'What is the difference between a scented candle and wax melts?', answer: 'Wax melts have no wick: you place them in a wax warmer, where they slowly melt and release their scent. A scented candle you light with a flame. Both are hand-poured from soy wax.' },
      { question: 'Can a gift be returned?', answer: 'You can cancel your order within 14 days of receiving it, without giving a reason. Send the candles back unused and well packed; the return postage is yours.' },
      { question: 'What are the candles made of?', answer: 'Of soy wax, a plant-based wax. I pour every candle by hand in the Netherlands, so each one is a little different.' },
    ],
  },
  nl: {
    metaTitle: 'Kerstcadeaus & kerstkaarsen van sojawas · EarthyGlow',
    description: (p: Prices) =>
      `Handgegoten kerstkaarsen, geurkaarsen en wax melts van sojawas vanaf ${p.from}. Kerstcadeaus tot €5, €10 en €15. Gratis verzending in Nederland vanaf ${p.nlFree}.`,
    home: 'Home',
    breadcrumb: 'Kruimelpad',
    crumb: 'Kerstcadeaus',
    eyebrow: 'Kerstcadeaus',
    title: 'Kerstcadeaus, met de hand gegoten',
    lede: (p: Prices) =>
      `Knusse geurkaarsen, feestelijke kaarsen voor op tafel en kleine wax melts, allemaal met de hand gegoten van sojawas in Nederland. Op prijs gesorteerd, vanaf ${p.from}.`,
    intro: [
      'Op zoek naar een kerstcadeau dat persoonlijk voelt? Al mijn kerstkaarsen en wax melts giet ik zelf met de hand, in kleine batches, van sojawas.',
      'Je vindt hier geurkaarsen die ruiken naar glühwein, warme chocolade of een winterbos, geurloze kerstkaarsen voor op de kersttafel en kleine wax melts voor in een waxbrander. Hieronder staan ze op prijs, zodat je snel iets vindt voor een collega, de buren, je moeder of jezelf.',
    ],
    perks: (p: Prices) => [
      { title: 'Handgegoten sojawas', text: 'Elke kaars is met de hand gemaakt in Nederland, dus elk exemplaar is net een beetje uniek.' },
      { title: `Gratis verzending vanaf ${p.nlFree}`, text: `Binnen Nederland. Naar andere EU-landen is verzending gratis vanaf ${p.euFree}.` },
      { title: `Bestel uiterlijk ${p.nlOrderBy}`, text: `Voor levering voor kerst in Nederland. Naar andere EU-landen bestel je uiterlijk ${p.euOrderBy}.` },
    ],
    bands: {
      'under-5': { eyebrow: 'Kleine cadeautjes', title: 'Kerstcadeautjes tot €5', lede: 'Voor in de schoen, als lootjescadeau of als extraatje bij een kerstkaart.' },
      'under-10': { eyebrow: 'Kleine cadeaus', title: 'Kerstcadeaus tot €10', lede: 'Een knusse geurkaars of een feestelijke decoratie: een cadeau dat je zelf ook graag zou krijgen.' },
      'over-10': { eyebrow: 'Iets bijzonders', title: 'Kerstcadeaus vanaf €10', lede: 'Voor wie net iets meer verdient: een geschenkdoos vol bloemkaarsjes of een grote kaars met een winterse geur.' },
    },
    shopAllTitle: 'Toch iets anders zoeken?',
    shopAllText: 'Naast de kerstcollectie zijn er het hele jaar door bloemkaarsjes, sculpturale kaarsen en wax melts.',
    shopAll: 'Bekijk alle kaarsen',
    faqEyebrow: 'Goed om te weten',
    faqTitle: 'Vragen over bestellen voor kerst',
    faqs: (p: Prices) => [
      { question: 'Wanneer moet ik bestellen om het voor kerst in huis te hebben?', answer: `Bestel uiterlijk ${p.nlOrderBy} voor levering in Nederland voor kerst, en uiterlijk ${p.euOrderBy} voor andere EU-landen. Ik maak je bestelling binnen 1 tot 3 werkdagen klaar, daarna duurt de bezorging meestal 2 tot 4 werkdagen. Daarna bestellen kan nog steeds, maar rond de feestdagen heeft de bezorgdienst het erg druk, dus dan kan ik niet beloven dat het voor kerst binnen is.` },
      { question: 'Wat kost verzending?', answer: `Binnen Nederland kost verzending ${p.nlRate} en is het gratis vanaf ${p.nlFree}. Naar andere EU-landen kost het ${p.euRate} en is het gratis vanaf ${p.euFree}.` },
      { question: 'Welke kerstkaarsen zijn geurloos?', answer: `${p.unscented} zijn geurloos. Daardoor zijn ze ideaal voor op de kersttafel, waar je het eten wilt ruiken.` },
      { question: 'Wat is het verschil tussen een geurkaars en wax melts?', answer: 'Wax melts hebben geen lont: je legt ze in een waxbrander, waar ze langzaam smelten en hun geur afgeven. Een geurkaars steek je aan met een vlam. Beide zijn met de hand gegoten van sojawas.' },
      { question: 'Kan ik een cadeau terugsturen?', answer: 'Je kunt je bestelling binnen 14 dagen na ontvangst zonder opgave van reden annuleren. Stuur de kaarsen ongebruikt en goed verpakt terug; de retourkosten zijn voor jou.' },
      { question: 'Waar zijn de kaarsen van gemaakt?', answer: 'Van sojawas, een plantaardige was. Ik giet elke kaars met de hand in Nederland, dus elk exemplaar is net een beetje anders.' },
    ],
  },
  de: {
    metaTitle: 'Weihnachtsgeschenke & Weihnachtskerzen aus Sojawachs · EarthyGlow',
    description: (p: Prices) =>
      `Handgegossene Weihnachtskerzen, Duftkerzen und Wax Melts aus Sojawachs ab ${p.from}. Geschenke bis €5, €10 und €15, von Hand gemacht in den Niederlanden.`,
    home: 'Start',
    breadcrumb: 'Brotkrümelnavigation',
    crumb: 'Weihnachtsgeschenke',
    eyebrow: 'Weihnachtsgeschenke',
    title: 'Weihnachtsgeschenke, von Hand gegossen',
    lede: (p: Prices) =>
      `Gemütliche Duftkerzen, festliche Tischkerzen und kleine Wax Melts, alle von Hand aus Sojawachs gegossen in den Niederlanden. Nach Preis sortiert, ab ${p.from}.`,
    intro: [
      'Suchst du ein Weihnachtsgeschenk, das persönlich wirkt? Alle meine Weihnachtskerzen und Wax Melts gieße ich selbst von Hand, in kleinen Mengen, aus Sojawachs.',
      'Hier findest du Duftkerzen, die nach Glühwein, heißer Schokolade oder einem Winterwald duften, duftfreie Kerzen für den Weihnachtstisch und kleine Wax Melts für die Duftlampe. Unten sind sie nach Preis sortiert, damit du schnell etwas für Kollegen, die Nachbarn, deine Mutter oder dich selbst findest.',
    ],
    perks: (p: Prices) => [
      { title: 'Handgegossenes Sojawachs', text: 'Jede Kerze wird in den Niederlanden von Hand gemacht, deshalb ist jedes Stück ein kleines Unikat.' },
      { title: `Kostenloser Versand ab ${p.euFree}`, text: `In die EU. Innerhalb der Niederlande ist der Versand ab ${p.nlFree} kostenlos.` },
      { title: `Bestellen bis ${p.euOrderBy}`, text: `Für die Lieferung vor Weihnachten nach Deutschland und in die EU. Innerhalb der Niederlande bis ${p.nlOrderBy}.` },
    ],
    bands: {
      'under-5': { eyebrow: 'Kleine Aufmerksamkeiten', title: 'Weihnachtsgeschenke bis €5', lede: 'Für den Nikolausstiefel, das Wichteln oder als kleine Beigabe zur Weihnachtskarte.' },
      'under-10': { eyebrow: 'Kleine Geschenke', title: 'Weihnachtsgeschenke bis €10', lede: 'Eine gemütliche Duftkerze oder eine festliche Deko: ein Geschenk, über das du dich selbst freuen würdest.' },
      'over-10': { eyebrow: 'Etwas Besonderes', title: 'Weihnachtsgeschenke ab €10', lede: 'Für alle, die etwas mehr verdienen: eine Geschenkbox voller Blumenkerzen oder eine große Kerze mit winterlichem Duft.' },
    },
    shopAllTitle: 'Doch etwas anderes gesucht?',
    shopAllText: 'Neben der Weihnachtskollektion gibt es das ganze Jahr über Blumenkerzen, skulpturale Kerzen und Wax Melts.',
    shopAll: 'Alle Kerzen ansehen',
    faqEyebrow: 'Gut zu wissen',
    faqTitle: 'Fragen zur Bestellung für Weihnachten',
    faqs: (p: Prices) => [
      { question: 'Wann muss ich bestellen, damit es zu Weihnachten ankommt?', answer: `Bestelle bis ${p.euOrderBy} für die Lieferung vor Weihnachten nach Deutschland und in die anderen EU-Länder, innerhalb der Niederlande bis ${p.nlOrderBy}. Ich mache deine Bestellung innerhalb von 1 bis 3 Werktagen fertig, danach dauert die Lieferung meist 2 bis 4 Werktage. Danach kannst du weiterhin bestellen, aber rund um die Feiertage haben die Paketdienste sehr viel zu tun, deshalb kann ich nicht versprechen, dass es vor Weihnachten ankommt.` },
      { question: 'Was kostet der Versand?', answer: `In Deutschland und die anderen EU-Länder kostet der Versand ${p.euRate} und ist ab ${p.euFree} kostenlos. Innerhalb der Niederlande kostet er ${p.nlRate} und ist ab ${p.nlFree} kostenlos.` },
      { question: 'Welche Weihnachtskerzen sind duftfrei?', answer: `${p.unscented} sind duftfrei. Damit eignen sie sich ideal für den Weihnachtstisch, an dem du das Essen riechen möchtest.` },
      { question: 'Was ist der Unterschied zwischen einer Duftkerze und Wax Melts?', answer: 'Wax Melts haben keinen Docht: Du legst sie in eine Duftlampe, wo sie langsam schmelzen und ihren Duft abgeben. Eine Duftkerze zündest du mit einer Flamme an. Beide sind von Hand aus Sojawachs gegossen.' },
      { question: 'Kann ich ein Geschenk zurückschicken?', answer: 'Du kannst deine Bestellung innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen widerrufen. Schicke die Kerzen unbenutzt und gut verpackt zurück; die Rücksendekosten trägst du.' },
      { question: 'Woraus sind die Kerzen gemacht?', answer: 'Aus Sojawachs, einem pflanzlichen Wachs. Ich gieße jede Kerze in den Niederlanden von Hand, deshalb ist jedes Stück ein bisschen anders.' },
    ],
  },
})

const SHARE_IMAGE = getProduct('festive-glow-box')?.image

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = christmasCopy[locale]
  return siteMeta({
    locale,
    title: copy.metaTitle,
    description: copy.description(pricesFor(locale)),
    path: PATH,
    image: SHARE_IMAGE,
  })
}

export function Christmas() {
  const locale = useLocale()
  const copy = useCopy(christmasCopy)
  const prices = pricesFor(locale)
  const faqs = copy.faqs(prices)

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: copy.home, path: '/' }, { name: copy.crumb }], locale)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: christmasProducts.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: localizedUrl(locale, `/product/${product.id}`),
          })),
        }}
      />
      <JsonLd data={faqLd(faqs, locale)} />

      <section className="page-hero christmas-hero">
        <div className="container">
          <Reveal immediate>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.crumb}</span>
            </nav>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="section-lede">{copy.lede(prices)}</p>
          </Reveal>
        </div>
      </section>

      <section className="shop-body christmas-body">
        <div className="container">
          <Reveal immediate className="christmas-intro">
            {copy.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          <Reveal immediate className="christmas-perks">
            {copy.perks(prices).map((perk) => (
              <div key={perk.title} className="christmas-perk">
                <strong>{perk.title}</strong>
                <span>{perk.text}</span>
              </div>
            ))}
          </Reveal>

          <div className="product-groups">
            {bands.map((band) => {
              const text = copy.bands[band.id]
              return (
                <section key={band.id} id={band.id} className="product-group" aria-labelledby={`christmas-${band.id}`}>
                  <Reveal className="product-group-head">
                    <div>
                      <p className="eyebrow">{text.eyebrow}</p>
                      <h2 id={`christmas-${band.id}`}>{text.title}</h2>
                      <p className="christmas-band-lede">{text.lede}</p>
                    </div>
                  </Reveal>
                  <div className="product-grid">
                    {band.products.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          <Reveal className="christmas-more">
            <h2>{copy.shopAllTitle}</h2>
            <p>{copy.shopAllText}</p>
            <Link to="/shop" className="btn btn-primary" prefetch="intent">{copy.shopAll}</Link>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="faq">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{copy.faqEyebrow}</p>
            <h2>{copy.faqTitle}</h2>
          </Reveal>
          <Reveal className="faq-list">
            {faqs.map((faq, index) => (
              <FaqItem key={faq.question} index={index} {...faq} />
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default Christmas
