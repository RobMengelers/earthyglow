export type Product = {
  id: string
  name: string
  price: string
  priceCents: number
  image: string
  soldOut?: boolean
  description: string
  collectionId: string
  variants?: ProductVariant[]
}

export type ProductVariant = {
  id: string
  label: string
  priceCents?: number
  swatch?: string
}

export type Collection = {
  id: string
  eyebrow: string
  title: string
  blurb: string
  products: Product[]
}

const img = (file: string) => `/images/${file.replace(/\.png$/, '.webp')}`

export const collections: Collection[] = [
  {
    id: 'little-glow',
    eyebrow: 'The Little Glow',
    title: 'Tealight gift boxes',
    blurb:
      'Soft, flower-bloomed tealights in gift-ready boxes. Made for cosy corners and thoughtful gifts.',
    products: [
      {
        id: 'floral-box',
        name: 'The Floral Box',
        price: '€14,95',
        priceCents: 1495,
        image: img('d99f763e-0f02-4797-9cff-2fdf82d96529.png'),
        collectionId: 'little-glow',
        description:
          'A curated box of flower-bloomed tealights, gift-ready and made to bring soft ambient light to any corner. Poured in 100% soy wax and finished with clean, plant-based fragrance.',
        variants: [
          { id: 'pink', label: 'Pink', swatch: '#e8a1b5', priceCents: 1495 },
          { id: 'baby-blue', label: 'Baby blue', swatch: '#9fc9e8', priceCents: 1495 },
          { id: 'purple', label: 'Purple', swatch: '#9b72c4', priceCents: 1495 },
        ],
      },
      {
        id: 'floral-basket',
        name: 'The Floral Basket',
        price: '€12,95',
        priceCents: 1295,
        image: img('670b77ea-aeb3-4566-8863-e9fa02b40b8e.png'),
        collectionId: 'little-glow',
        description:
          'A woven basket filled with floral tealights — a charming, ready-to-give gift that lights up cosy evenings with a soft, natural glow.',
        variants: [
          { id: 'floral-basket-pink', label: 'Pink', priceCents: 1295, swatch: '#e8a1b5' },
          { id: 'floral-basket-red', label: 'Red', priceCents: 1295, swatch: '#c94c55' },
        ],
      },
    ],
  },
  {
    id: 'scented-glow',
    eyebrow: 'The Scented Glow',
    title: 'Scented soy candles',
    blurb:
      'Warm, seasonal fragrances in clean-burning soy wax. Vegan, cruelty-free and phthalate-free.',
    products: [
      {
        id: 'coconut-beach',
        name: 'Coconut Beach',
        price: 'From €14,95',
        priceCents: 1495,
        image: img('31eca091-4aa2-40ea-9a50-d76cdea8f7bc.png'),
        collectionId: 'scented-glow',
        description:
          'A warm, sun-drenched fragrance poured into clean-burning soy wax. Soft coconut notes bring a holiday feeling to every room.',
        variants: [
          { id: 'oyster', label: 'Oyster', priceCents: 1495 },
          { id: 'coconut', label: 'Coconut', priceCents: 1795 },
          { id: 'shell', label: 'Shell', priceCents: 1795 },
          { id: 'sea-star', label: 'Sea star', priceCents: 1795 },
        ],
      },
      {
        id: 'autumn-ember',
        name: 'Autumn Ember',
        price: '€14,95',
        priceCents: 1495,
        image: img('50adf898-6887-4195-a3c6-286f4926778d.png'),
        collectionId: 'scented-glow',
        description:
          'Smoky, warm and soothing — the scent of crackling autumn evenings, captured by hand in a 100% soy wax candle.',
      },
      {
        id: 'pumpkin-spice',
        name: 'Pumpkin Spice',
        price: '€14,95',
        priceCents: 1495,
        image: img('5869d3a7-0b47-42bc-a78a-f8a3b78eab39.png'),
        collectionId: 'scented-glow',
        soldOut: true,
        description:
          'The cosiest seasonal classic. Warm pumpkin and spice fill the room with that unmistakable autumn feeling.',
      },
      {
        id: 'pumpkin-spice-latte',
        name: 'Pumpkin Spice Latte',
        price: '€9,95',
        priceCents: 995,
        image: img('Pumpkin_Spice_Latte.png'),
        collectionId: 'scented-glow',
        description:
          'A smaller glow with all the cosy comfort of your favourite autumn drink — pumpkin, spice and everything nice.',
      },
    ],
  },
  {
    id: 'natural-glow',
    eyebrow: 'The Natural Glow',
    title: 'Sculptural natural candles',
    blurb:
      'Nature-inspired shapes that double as decor. Hand-poured, one of a kind, and made to be kept.',
    products: [
      {
        id: 'column',
        name: 'Column candle',
        price: 'From €9,95',
        priceCents: 995,
        image: img('Schermafbeelding2026-05-03152509.png'),
        collectionId: 'natural-glow',
        description:
          'A clean, architectural column candle — a sculptural statement that looks at home on any shelf or mantel.',
      },
      {
        id: 'pillar',
        name: 'Pillar candle',
        price: 'From €6,95',
        priceCents: 695,
        image: img('1b8dcdc0-1ca6-4d8b-bd8d-78d13c22efaf.png'),
        collectionId: 'natural-glow',
        description:
          'Classic and stately, this hand-poured pillar candle brings a soft, steady warmth to the table.',
      },
      {
        id: 'spiral',
        name: 'Spiral candle',
        price: 'From €6,95',
        priceCents: 695,
        image: img('e3d2f8c0-1f58-4c8b-a2e7-a7aafead6d4d.png'),
        collectionId: 'natural-glow',
        description:
          'A flowing, sculpted candle with natural texture and movement — a piece of decor you will want to keep long after it burns.',
      },
      {
        id: 'shell',
        name: 'Shell candle',
        price: 'From €4,95',
        priceCents: 495,
        image: img('Schermafbeelding_2026-05-03_153832.png'),
        collectionId: 'natural-glow',
        description:
          'A delicate, sea-inspired shell candle — a little piece of nature, hand-poured and one of a kind.',
      },
      {
        id: 'arch',
        name: 'Arch candle',
        price: 'From €4,95',
        priceCents: 495,
        image: img('7aa7691d-26fe-4ea2-8188-64529e4bda46.png'),
        collectionId: 'natural-glow',
        description:
          'An elegant arch candle that draws the eye — soft curves and natural beauty in hand-poured wax.',
      },
      {
        id: 'bubble',
        name: 'Bubble candle',
        price: 'From €4,95',
        priceCents: 495,
        image: img('6efade16-e5a8-4eb0-99e9-ad0a90b19f9a.png'),
        collectionId: 'natural-glow',
        description:
          'Playful bubble forms in natural wax — a fun, tactile decor piece with a warm, gentle glow.',
      },
    ],
  },
]

export const products: Product[] = collections.flatMap((c) => c.products)

export function getProduct(id: string | undefined): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getCollection(id: string | undefined): Collection | undefined {
  return collections.find((c) => c.id === id)
}

export function getRelated(product: Product, count = 3): Product[] {
  return collections
    .find((c) => c.id === product.collectionId)
    ?.products.filter((p) => p.id !== product.id)
    .concat(
      products.filter((p) => p.collectionId !== product.collectionId),
    )
    .slice(0, count) ?? products.filter((p) => p.id !== product.id).slice(0, count)
}

export const heroImage = img('17ba3741-6495-4fc7-84fe-a4653dbdda61.png')
export const aboutImage = img('Schermafbeelding_2026-05-30_164759.png')
