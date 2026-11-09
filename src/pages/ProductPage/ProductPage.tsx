import { useParams } from 'react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { getCollection, getProduct, getRelated, productLowestCents, productPriceLabel, type ProductColor, type ProductVariant } from '../../data/products'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'
import { useCart } from '../../cart/useCart'
import { NotFound } from '../NotFound/NotFound'
import { seasonForProduct } from '../../data/seasons'
import { JsonLd } from '../../components/seo/JsonLd'
import { imageAttrs, SIZES } from '../../lib/images'
import { absoluteUrl, breadcrumbLd, localizedUrl, merchantReturnPolicy, offerShippingDetails, siteMeta } from '../../lib/seo'
import { localizedCollection, localizedDescription, localizedSeason } from '../../data/catalog-i18n'
import { defineCopy, Link, localeFromParams, useCopy, useFormatPrice, useLocale } from '../../i18n'
import { optionLabel } from '../../i18n/options'
import { centsToEuros, trackEvent } from '../../lib/analytics'
import type { Route } from './+types/ProductPage'

// What the option pickers ask for, keyed by the product's English picker word.
type Picker = 'size or bundle' | 'colour' | 'shape'

const productCopy = defineCopy({
  en: {
    notFound: 'Product not found · EarthyGlow',
    imageAlt: (name: string) => `${name} — hand-poured soy wax candle by EarthyGlow`,
    perks: ['100% soy wax', 'Vegan & cruelty-free', 'Mica powder for colour', 'Hand-poured in small batches', 'Paraben-free & Phthalates-free'],
    home: 'Home',
    shop: 'Shop',
    breadcrumb: 'Breadcrumb',
    previous: 'Previous product image',
    next: 'Next product image',
    showImage: (n: number) => `Show image ${n}`,
    soldOut: 'Sold out',
    choose: { 'size or bundle': 'Choose your size or bundle', colour: 'Choose your colour', shape: 'Choose your shape' } as Record<Picker, string>,
    chooseOption: 'Choose your option',
    chooseGroup: 'Choose single or bundle',
    chooseColour: 'Choose a colour',
    chooseAny: 'Choose an option',
    soldOutButton: 'Currently sold out',
    unavailable: (link: ReactNode) => <>This candle is currently unavailable. {link} if you’d like to ask about it.</>,
    sendNote: 'Send me a note',
    quantity: 'Quantity',
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    add: 'Add to cart',
    handmade: 'Made by hand, small differences in colour and finish are part of each candle.',
    explore: 'Explore more',
    moreFrom: 'More from this collection',
    alsoLike: 'You may also like',
    all: 'Shop everything',
  },
  nl: {
    notFound: 'Product niet gevonden · EarthyGlow',
    imageAlt: (name: string) => `${name} — handgegoten sojawaskaars van EarthyGlow`,
    perks: ['100% sojawas', 'Vegan & dierproefvrij', 'Micapoeder voor kleur', 'Met de hand gegoten in kleine batches', 'Vrij van parabenen & ftalaten'],
    home: 'Home',
    shop: 'Shop',
    breadcrumb: 'Kruimelpad',
    previous: 'Vorige productfoto',
    next: 'Volgende productfoto',
    showImage: (n: number) => `Toon foto ${n}`,
    soldOut: 'Uitverkocht',
    choose: { 'size or bundle': 'Kies je maat of bundel', colour: 'Kies je kleur', shape: 'Kies je vorm' },
    chooseOption: 'Kies je optie',
    chooseGroup: 'Kies los of bundel',
    chooseColour: 'Kies een kleur',
    chooseAny: 'Kies een optie',
    soldOutButton: 'Momenteel uitverkocht',
    unavailable: (link: ReactNode) => <>Deze kaars is op dit moment niet beschikbaar. {link} als je er iets over wilt vragen.</>,
    sendNote: 'Stuur me een berichtje',
    quantity: 'Aantal',
    decrease: 'Aantal verlagen',
    increase: 'Aantal verhogen',
    add: 'In winkelmand',
    handmade: 'Met de hand gemaakt: kleine verschillen in kleur en afwerking maken elke kaars uniek.',
    explore: 'Ontdek meer',
    moreFrom: 'Meer uit deze collectie',
    alsoLike: 'Misschien vind je dit ook mooi',
    all: 'Bekijk alles',
  },
  de: {
    notFound: 'Produkt nicht gefunden · EarthyGlow',
    imageAlt: (name: string) => `${name} — handgegossene Sojawachskerze von EarthyGlow`,
    perks: ['100 % Sojawachs', 'Vegan & tierversuchsfrei', 'Mica-Pulver für die Farbe', 'Von Hand in kleinen Chargen gegossen', 'Frei von Parabenen & Phthalaten'],
    home: 'Start',
    shop: 'Shop',
    breadcrumb: 'Brotkrümelnavigation',
    previous: 'Vorheriges Produktbild',
    next: 'Nächstes Produktbild',
    showImage: (n: number) => `Bild ${n} anzeigen`,
    soldOut: 'Ausverkauft',
    choose: { 'size or bundle': 'Wähle Größe oder Set', colour: 'Wähle deine Farbe', shape: 'Wähle deine Form' },
    chooseOption: 'Wähle deine Option',
    chooseGroup: 'Einzeln oder Set wählen',
    chooseColour: 'Farbe wählen',
    chooseAny: 'Option wählen',
    soldOutButton: 'Derzeit ausverkauft',
    unavailable: (link: ReactNode) => <>Diese Kerze ist derzeit nicht erhältlich. {link}, wenn du danach fragen möchtest.</>,
    sendNote: 'Schreib mir eine Nachricht',
    quantity: 'Menge',
    decrease: 'Menge verringern',
    increase: 'Menge erhöhen',
    add: 'In den Warenkorb',
    handmade: 'Von Hand gemacht: Kleine Unterschiede in Farbe und Finish gehören zu jeder Kerze dazu.',
    explore: 'Mehr entdecken',
    moreFrom: 'Mehr aus dieser Kollektion',
    alsoLike: 'Das könnte dir auch gefallen',
    all: 'Alles ansehen',
  },
})

function pickerLegend(choose: Record<Picker, string>, word: string): string {
  return choose[word as Picker] ?? choose.colour
}

// Unknown products must fail with a real HTTP 404, not an in-page fallback.
export function loader({ params }: Route.LoaderArgs) {
  if (!getProduct(params.productId)) {
    throw new Response('Not Found', { status: 404 })
  }
  return null
}

// Product data is bundled, so client navigations can validate without a round
// trip to the server. The server loader still runs for real document requests
// so unknown products keep returning an HTTP 404 to crawlers.
export function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!getProduct(params.productId)) {
    throw new Response('Not Found', { status: 404 })
  }
  return null
}

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = productCopy[locale]
  const product = getProduct(params.productId)
  if (!product) {
    return siteMeta({ locale, title: copy.notFound, robots: 'noindex' })
  }
  return siteMeta({
    locale,
    title: `${product.name} · EarthyGlow`,
    description: localizedDescription(product, locale),
    path: `/product/${product.id}`,
    image: product.image,
    imageAlt: copy.imageAlt(product.name),
    type: 'product',
    product: {
      price: (productLowestCents(product) / 100).toFixed(2),
      availability: product.soldOut ? 'oos' : 'instock',
    },
  })
}

export function ProductPage() {
  const { productId } = useParams()
  const { addItem } = useCart()
  const locale = useLocale()
  const copy = useCopy(productCopy)
  const formatPrice = useFormatPrice()
  const product = getProduct(productId)
  const [variantId, setVariantId] = useState('')
  const [variantGroupId, setVariantGroupId] = useState('')
  const [colorId, setColorId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [galleryIndex, setGalleryIndex] = useState(0)
  // Holds the image that is fading out on top of the incoming one so switching
  // a variant crossfades instead of swapping the hero shot in a single frame.
  const [fadeImage, setFadeImage] = useState<{ src: string; id: number } | null>(null)

  useEffect(() => {
    if (!product) return
    const price = centsToEuros(product.priceCents)
    trackEvent('view_item', {
      currency: 'EUR',
      value: price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: getCollection(product.collectionId)?.title,
        price,
        quantity: 1,
      }],
    })
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps -- once per product shown

  if (!product) {
    return <NotFound />
  }

  const baseCollection = getCollection(product.collectionId)
  const collection = baseCollection && localizedCollection(baseCollection, locale)
  const related = getRelated(product)
  const description = localizedDescription(product, locale)

  const collectionTitle = collection?.title ?? 'EarthyGlow'
  const baseSeason = seasonForProduct(product.id)
  const season = baseSeason && localizedSeason(baseSeason, locale)
  const selectedVariant = product.variants?.find((variant) => variant.id === variantId)
  const selectedVariantGroup = product.variantGroups?.find((group) => group.id === variantGroupId)
  const visibleVariants = product.variantGroups
    ? product.variants?.filter((variant) => selectedVariantGroup?.variantIds.includes(variant.id))
    : product.variants
  const selectedColor = product.colors?.find((color) => color.id === colorId)

  // The gallery belongs to the chosen colour. A colour with its own
  // photography replaces the product's pictures entirely; the basic colour
  // (white) keeps them, with the picture of the chosen size leading.
  const heroFor = (variant?: ProductVariant, color?: ProductColor) =>
    color?.images?.length
      ? color.base
        ? variant?.image ?? color.images[0]
        : color.images[0]
      : variant?.images?.[0] ?? variant?.image

  const baseGallery = product.images?.length ? product.images : [product.image]
  const colorGallery = selectedColor?.images ?? []
  const heroImage = heroFor(selectedVariant, selectedColor) ?? baseGallery[0]
  const galleryImages = colorGallery.length
    ? selectedColor?.base
      ? [heroImage, ...colorGallery.filter((img) => img !== heroImage)]
      : colorGallery
    : selectedVariant?.images?.length
      ? selectedVariant.images
      : [heroImage, ...baseGallery.filter((img) => img !== heroImage)]
  const displayedImage = galleryImages[galleryIndex]

  const imageUrls = (product.images?.length ? product.images : [product.image]).map(absoluteUrl)
  const purchaseUrl = localizedUrl(locale, `/product/${product.id}`)
  const variantPrices = (product.variants ?? []).map(
    (variant) => variant.priceCents ?? product.priceCents,
  )
  const hasPriceRange =
    variantPrices.length > 0 &&
    Math.max(...variantPrices) !== Math.min(...variantPrices)
  const availability = product.soldOut
    ? 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock'
  const offerDetails = {
    url: purchaseUrl,
    priceCurrency: 'EUR',
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: 'EarthyGlow' },
    shippingDetails: offerShippingDetails(),
    hasMerchantReturnPolicy: merchantReturnPolicy(),
  }
  const offers = hasPriceRange
    ? {
        '@type': 'AggregateOffer',
        lowPrice: (Math.min(...variantPrices) / 100).toFixed(2),
        highPrice: (Math.max(...variantPrices) / 100).toFixed(2),
        offerCount: variantPrices.length,
        ...offerDetails,
      }
    : {
        '@type': 'Offer',
        price: (product.priceCents / 100).toFixed(2),
        ...offerDetails,
      }

  // Only crossfade when the hero shot actually changes; an option that reuses
  // the current image (or has none) should not flash the overlay.
  const crossfadeTo = (nextImage: string | undefined) => {
    if (nextImage && nextImage !== displayedImage) {
      setFadeImage((current) => ({ src: displayedImage, id: (current?.id ?? 0) + 1 }))
    }
  }

  const selectVariant = (id: string) => {
    const nextVariant = product.variants?.find((variant) => variant.id === id)
    crossfadeTo(heroFor(nextVariant, selectedColor) ?? baseGallery[0])
    setVariantId(id)
    setGalleryIndex(0)
  }

  const selectColor = (id: string) => {
    const nextColor = product.colors?.find((color) => color.id === id)
    crossfadeTo(heroFor(selectedVariant, nextColor))
    setColorId(id)
    setGalleryIndex(0)
  }

  // Ask for missing selections in the same order as the visible pickers.
  const missingOption = product.variantGroups && !selectedVariantGroup
    ? copy.chooseGroup
    : selectedVariantGroup && selectedVariantGroup.variantIds.length > 1 && !selectedVariant
      ? copy.chooseColour
      : product.colors && !selectedColor
        ? copy.chooseColour
        : product.variants && !selectedVariant
          ? copy.chooseAny
          : null

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description,
          inLanguage: locale,
          image: imageUrls,
          sku: product.id,
          url: purchaseUrl,
          brand: { '@type': 'Brand', name: 'EarthyGlow' },
          category: collection?.title ?? 'Candles',
          material: 'Soy wax',
          offers,
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: copy.home, path: '/' },
          { name: copy.shop, path: '/shop' },
          ...(collection ? [{ name: collection.title, path: `/shop/${collection.id}` }] : []),
          { name: product.name },
        ], locale)}
      />
      <section className="product-detail">
        <div className="container">
          <nav className="breadcrumb" aria-label={copy.breadcrumb}>
            <Link to="/" prefetch="intent">{copy.home}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop" prefetch="intent">{copy.shop}</Link>
            {collection && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={season ? `/shop?season=${season.id}` : '/shop'} prefetch="intent">{season?.label ?? collection.eyebrow}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product-detail-grid">
            <Reveal className="product-detail-media">
              <div className="product-gallery">
                <div className="product-gallery-main">
                  <div className="product-gallery-track" style={{ transform: `translateX(-${galleryIndex * 100}%)` }}>
                    {galleryImages.map((image) => (
                      <img key={image} {...imageAttrs(image, SIZES.gallery)} alt={copy.imageAlt(product.name)} />
                    ))}
                  </div>
                  {fadeImage && (
                    <img
                      key={fadeImage.id}
                      className="product-gallery-fade"
                      {...imageAttrs(fadeImage.src, SIZES.gallery)}
                      alt=""
                      aria-hidden="true"
                      onAnimationEnd={() => setFadeImage(null)}
                    />
                  )}
                  {galleryImages.length > 1 && (
                    <>
                      <button type="button" className="product-gallery-arrow product-gallery-prev" onClick={() => setGalleryIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length)} aria-label={copy.previous}>
                        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                          <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button type="button" className="product-gallery-arrow product-gallery-next" onClick={() => setGalleryIndex((index) => (index + 1) % galleryImages.length)} aria-label={copy.next}>
                        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                          <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <span className="product-gallery-count" aria-live="polite">{galleryIndex + 1} / {galleryImages.length}</span>
                    </>
                  )}
                  {product.soldOut && (
                    <span className="product-tag sold-out">{copy.soldOut}</span>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="product-gallery-thumbs">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={img}
                        type="button"
                        className={`product-gallery-thumb${galleryIndex === idx ? ' is-active' : ''}`}
                        onClick={() => setGalleryIndex(idx)}
                        aria-label={copy.showImage(idx + 1)}
                      >
                        <img {...imageAttrs(img, '64px')} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={100} className="product-detail-info">
              {collection && (
                <Link
                  to={season ? `/shop?season=${season.id}` : '/shop'}
                  className="eyebrow product-detail-collection"
                >
                  {season?.label ?? collection.eyebrow}
                </Link>
              )}
              <h1>{product.name}</h1>
              <p className="product-detail-price">{selectedVariant?.priceCents ? formatPrice(selectedVariant.priceCents) : productPriceLabel(product, locale)}</p>
              <p className="product-detail-desc">{description}</p>

              {product.colors && (
                <fieldset className="product-options">
                  <legend>{pickerLegend(copy.choose, product.colorLabel ?? 'colour')}</legend>
                  <div className="product-option-list">
                    {product.colors.map((color) => (
                      <label key={color.id} className={`product-option${colorId === color.id ? ' is-selected' : ''}`}>
                        <input type="radio" name="product-color" value={color.id} checked={colorId === color.id} onChange={() => selectColor(color.id)} />
                        <span
                          className="product-option-swatch"
                          style={color.swatch ? { backgroundColor: color.swatch } : undefined}
                          title={optionLabel(color.label, locale)}
                        >
                          <span className="visually-hidden">{optionLabel(color.label, locale)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {product.variantGroups && (
                <fieldset className="product-options">
                  <legend>{copy.chooseOption}</legend>
                  <div className="product-option-list">
                    {product.variantGroups.map((group) => (
                      <label key={group.id} className={`product-option${variantGroupId === group.id ? ' is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="product-variant-group"
                          value={group.id}
                          checked={variantGroupId === group.id}
                          onChange={() => {
                            setVariantGroupId(group.id)
                            selectVariant(group.variantIds.length === 1 ? group.variantIds[0] : '')
                          }}
                        />
                        <span>{optionLabel(group.label, locale)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {visibleVariants && visibleVariants.length > 0 && (!product.variantGroups || visibleVariants.length > 1) && (
                <fieldset className="product-options">
                  <legend>{pickerLegend(copy.choose, product.variantLabel ?? (visibleVariants.some((variant) => variant.swatch) ? 'colour' : 'shape'))}</legend>
                  <div className="product-option-list">
                    {visibleVariants.map((variant) => (
                      <label key={variant.id} className={`product-option${variantId === variant.id ? ' is-selected' : ''}`}>
                        <input type="radio" name="product-variant" value={variant.id} checked={variantId === variant.id} onChange={() => selectVariant(variant.id)} />
                        <span
                          className={variant.swatch ? 'product-option-swatch' : undefined}
                          style={variant.swatch ? { backgroundColor: variant.swatch } : undefined}
                          title={variant.swatch ? optionLabel(variant.label, locale) : undefined}
                        >
                          {variant.swatch && <span className="visually-hidden">{optionLabel(variant.label, locale)}</span>}
                          {!variant.swatch && optionLabel(variant.label, locale)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <ul className="product-detail-perks">
                {copy.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>

              {product.soldOut ? (
                <div className="product-detail-actions">
                  <button type="button" className="btn btn-primary" disabled>
                    {copy.soldOutButton}
                  </button>
                  <p className="product-detail-note">
                    {copy.unavailable(<Link to="/contact">{copy.sendNote}</Link>)}
                  </p>
                </div>
              ) : (
                <div className="product-detail-actions">
                  <div className="product-quantity-control">
                    <div className="qty-stepper product-quantity" aria-label={copy.quantity}>
                      <button
                        type="button"
                        aria-label={copy.decrease}
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        &minus;
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        aria-label={copy.increase}
                        onClick={() => setQuantity((current) => current + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => addItem(product, collectionTitle, quantity, selectedVariant, selectedColor)}
                    disabled={Boolean(missingOption)}
                  >
                    {missingOption ?? copy.add}
                  </button>
                </div>
              )}

              <div className="product-detail-meta">
                <p>{copy.handmade}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <div className="container">
            <Reveal className="section-head">
              <p className="eyebrow">{copy.explore}</p>
              <h2>{collection ? copy.moreFrom : copy.alsoLike}</h2>
            </Reveal>
            <div className="product-grid">
              {related.map((item, i) => (
                <ProductCard key={item.id} product={item} index={i} />
              ))}
            </div>
            <Reveal className="featured-cta">
              <Link to="/shop" className="btn btn-ghost">
                {copy.all}
              </Link>
            </Reveal>
          </div>
        </section>
      )}
    </>
  )
}

export default ProductPage
