export type Product = {
  id: string
  name: string
  price: string
  priceCents: number
  image: string
  images?: string[]
  soldOut?: boolean
  description: string
  collectionId: string
  care?: string
  variantLabel?: string
  variants?: ProductVariant[]
  colorLabel?: string
  colors?: ProductColor[]
}

export type ProductVariant = {
  id: string
  label: string
  priceCents?: number
  swatch?: string
  image?: string
}

// A colour is a second, independent choice next to the size/shape variants.
// It never changes the price — the size stays the only priced option — but it
// can bring its own photography, like the floral-box swatches do.
export type ProductColor = {
  id: string
  label: string
  swatch?: string
  image?: string
  images?: string[]
  // The basic colour of a product: it keeps the product's own pictures, where
  // the picture of the chosen size leads.
  base?: boolean
}

export type Collection = {
  id: string
  eyebrow: string
  title: string
  blurb: string
  products: Product[]
}

// The Natural Glow candles all share one colour range. White is the basic
// candle: it keeps the neutral photography, every other colour brings its own
// pictures.
const naturalGlowPalette: Omit<ProductColor, 'images'>[] = [
  { id: 'white', label: 'White', swatch: '#f0ebe1', base: true },
  { id: 'pink', label: 'Pink', swatch: '#e8a1b5' },
  { id: 'purple', label: 'Purple', swatch: '#9b72c4' },
  { id: 'brown', label: 'Brown', swatch: '#8a6a52' },
  { id: 'baby-blue', label: 'Baby blue', swatch: '#9fc9e8' },
]

// The pictures of one colour of one shape live in their own folder, so the
// gallery of a colour is replaced by the pictures of that colour.
function naturalGlowColors(
  shape: string,
  pictureCounts: Record<string, number>,
): ProductColor[] {
  return naturalGlowPalette.map((colour) => ({
    ...colour,
    images: Array.from(
      { length: pictureCounts[colour.id] ?? 0 },
      (_, index) => `/images/products/${shape}/${colour.id}/image-${index + 1}.webp`,
    ),
  }))
}

export const collections: Collection[] = [
  {
    id: 'little-glow',
    eyebrow: 'Scented Thealights',
    title: 'Little Glow Thealights',
    blurb:
      'Hand-poured flower candles, arranged in boxes and baskets. A bouquet with a little something different.',
    products: [
      {
        id: 'floral-box',
        name: 'The Floral Box',
        price: '€14,95',
        priceCents: 1495,
        image: '/images/floral-box.webp',
        images: Array.from({ length: 10 }, (_, index) => `/images/products/floral-box/image-${index + 1}.webp`),
        collectionId: 'little-glow',
        description:
          'Nine individually poured flower candles, arranged in a gift box and scented with Bluebell. I make these with approximately 220g of soy wax. Choose pink, baby blue or purple for someone you love, or for yourself.',
        variants: [
          { id: 'pink', label: 'Pink', swatch: '#e8a1b5', priceCents: 1495, image: '/images/products/floral-box/image-4.webp' },
          { id: 'baby-blue', label: 'Baby blue', swatch: '#9fc9e8', priceCents: 1495, image: '/images/products/floral-box/image-5.webp' },
          { id: 'purple', label: 'Purple', swatch: '#9b72c4', priceCents: 1495, image: '/images/products/floral-box/image-6.webp' },
        ],
      },
      {
        id: 'floral-basket',
        name: 'The Floral Basket',
        price: '€12,95',
        priceCents: 1295,
        image: '/images/floral-basket.webp',
        images: Array.from({ length: 5 }, (_, index) => `/images/products/floral-basket/image-${index + 1}.webp`),
        collectionId: 'little-glow',
        description:
          'A basket of individually poured flower candles with an English Rose scent. Made with approximately 150g of soy wax and available in pink or red. A little bouquet you can enjoy at home or give as a gift.',
        variants: [
          { id: 'floral-basket-pink', label: 'Pink', priceCents: 1295, swatch: '#e8a1b5', image: '/images/products/floral-basket/image-1.webp' },
          { id: 'floral-basket-red', label: 'Red', priceCents: 1295, swatch: '#c94c55', image: '/images/products/floral-basket/image-3.webp' },
        ],
      },
    ],
  },
  {
    id: 'scented-glow',
    eyebrow: 'Scented Candles',
    title: 'The Scented Glow',
    blurb:
      'From Coconut Island to Pumpkin Spice, find a fragrance for your favourite time of year.',
    products: [
      {
        id: 'coconut-beach',
        name: 'Coconut Beach',
        price: 'From €14,95',
        priceCents: 1495,
        image: '/images/coconut-beach.webp',
        images: ['/images/products/coconut-beach/image-1.webp', '/images/products/coconut-beach/image-2.webp', '/images/products/coconut-beach/image-3.webp', '/images/products/coconut-beach/image-4.webp', '/images/products/coconut-beach/image-5.webp'],
        collectionId: 'scented-glow',
        description:
          'A little beach scene, poured by hand with soy wax and scented with Coconut Island. Pineapple and orange meet creamy coconut, almond and peach. Choose your favourite of the four seaside shapes.',
        variants: [
          { id: 'oyster', label: 'Oyster', priceCents: 1495, image: '/images/products/coconut-beach/image-5.webp' },
          { id: 'coconut', label: 'Coconut', priceCents: 1795, image: '/images/products/coconut-beach/image-2.webp' },
          { id: 'shell', label: 'Shell', priceCents: 1795, image: '/images/products/coconut-beach/image-4.webp' },
          { id: 'sea-star', label: 'Sea star', priceCents: 1795, image: '/images/products/coconut-beach/image-3.webp' },
        ],
      },
      {
        id: 'autumn-ember',
        name: 'Autumn Ember',
        price: '€14,95',
        priceCents: 1495,
        image: '/images/autumn-ember.webp',
        images: ['/images/products/autumn-ember/image-1.webp', '/images/products/autumn-ember/image-2.webp'],
        collectionId: 'scented-glow',
        description:
          'I decorate this soy wax candle with autumn-inspired wax details. Its Vanilla & Cinders fragrance brings together smoky vanilla, clove, cedarwood, amber and musk for an evening at home.',
      },
      {
        id: 'pumpkin-spice',
        name: 'Pumpkin Spice',
        price: '€14,95',
        priceCents: 1495,
        image: '/images/pumpkin-spice.webp',
        images: ['/images/products/pumpkin-spice/image-1.webp', '/images/products/pumpkin-spice/image-2.webp'],
        collectionId: 'scented-glow',
        soldOut: true,
        description:
          'A soy wax candle in a pumpkin-shaped jar, finished with autumn details and a warm Pumpkin Spice fragrance. A little seasonal colour for your home.',
      },
      {
        id: 'pumpkin-spice-latte',
        name: 'Pumpkin Spice Latte',
        price: '€9,95',
        priceCents: 995,
        image: '/images/pumpkin-spice-latte.webp',
        images: ['/images/products/pumpkin-spice-latte/image-1.webp', '/images/products/pumpkin-spice-latte/image-2.webp'],
        collectionId: 'scented-glow',
        description:
          'A candle inspired by a favourite autumn drink, with whipped wax and handmade seasonal details. Poured with soy wax and scented with Pumpkin Spice. For your shelf, not your coffee cup.',
      },
    ],
  },
  {
    id: 'halloween',
    eyebrow: 'Ghosts & pumpkins',
    title: 'Halloween candles',
    blurb: 'Little ghosts, pumpkin shapes and autumn scents. A few playful things I’ve made for the season.',
    products: [
      {
        id: 'ghostlight-dinner-candle',
        name: 'Ghostlight Dinner Candle',
        price: '€2,95',
        priceCents: 295,
        image: '/images/ghostlight-dinner-candle.webp',
        images: ['/images/products/ghostlight-dinner-candle/image-1.webp'],
        collectionId: 'halloween',
        description:
          'A twisted dinner candle with a little ghost face, poured by hand with 100% soy wax. A playful addition to your Halloween table or a small gift for someone who loves the season.',
        care: 'Use a suitable candle holder on a stable, heat-resistant surface. Never leave a burning candle unattended.',
      },
      {
        id: 'pumpkin-boo',
        name: 'Pumpkin Boo',
        price: '€8,95',
        priceCents: 895,
        image: '/images/pumpkin-boo.webp',
        images: ['/images/products/pumpkin-boo/image-1.webp', '/images/products/pumpkin-boo/image-2.webp'],
        collectionId: 'halloween',
        description:
          'A little ghost and pumpkin, finished by hand in soy wax. Pumpkin Boo has a warm Pumpkin Spice fragrance for autumn evenings at home.',
      },
      {
        id: 'boo-boo',
        name: 'Boo Boo',
        price: '€8,95',
        priceCents: 895,
        image: '/images/boo-boo.webp',
        images: ['/images/products/boo-boo/image-1.webp', '/images/products/boo-boo/image-2.webp'],
        collectionId: 'halloween',
        description:
          'A handmade ghost detail sits on this soy wax candle. Scented with Vanilla & Cinders, with smoky vanilla, clove, cedarwood, amber and musk.',
      },
      {
        id: 'scary-boo',
        name: 'Scary Boo',
        price: '€8,95',
        priceCents: 895,
        image: '/images/scary-boo.webp',
        images: ['/images/products/scary-boo/image-1.webp', '/images/products/scary-boo/image-2.webp'],
        collectionId: 'halloween',
        description:
          'A spooky little addition to your autumn shelf, decorated by hand with a ghost-inspired wax detail. Made with soy wax and scented with Vanilla & Cinders.',
      },
      {
        id: 'pumpkin-spice-wax-melts',
        name: 'Pumpkin Spice Wax Melts',
        price: '€4,95',
        priceCents: 495,
        image: '/images/pumpkin-spice-wax-melts.webp',
        images: ['/images/products/pumpkin-spice-wax-melts/image-1.webp', '/images/products/pumpkin-spice-wax-melts/image-2.webp'],
        collectionId: 'halloween',
        description:
          'Little pumpkin-shaped wax melts with a warm Pumpkin Spice fragrance. I pour them by hand with soy wax and pack approximately 70g in each bag. Use them in a suitable wax warmer.',
        care: 'Place one or two melts in a suitable wax warmer. Never add water or light the melts directly. Follow your warmer’s instructions and never leave it unattended.',
      },
    ],
  },
  {
    id: 'natural-glow',
    eyebrow: 'Fragrance-free',
    title: 'The Natural Glow',
    blurb:
      'Fragrance-free soy wax candles in simple, sculptural shapes. Choose one for your favourite spot at home.',
    products: [
      {
        id: 'column',
        name: 'Column candle',
        price: 'From €9,95',
        priceCents: 995,
        image: '/images/column.webp',
        images: ['/images/products/column/white/image-1.webp', '/images/products/column/white/image-2.webp', '/images/products/column/white/image-3.webp'],
        collectionId: 'natural-glow',
        description:
          'Straight, ribbed lines and a simple column shape, poured by hand with 100% soy wax. Fragrance-free, so you can enjoy the candlelight without an added scent.',
        variantLabel: 'size or bundle',
        colorLabel: 'colour',
        colors: naturalGlowColors('column', { 'white': 3, 'pink': 1, 'purple': 1, 'brown': 1, 'baby-blue': 1 }),
        variants: [
          { id: 'column-small', label: 'Small', priceCents: 995, image: '/images/products/column/white/image-3.webp' },
          { id: 'column-large', label: 'Large', priceCents: 1295, image: '/images/products/column/white/image-2.webp' },
          { id: 'column-bundle', label: 'Bundle', priceCents: 1995, image: '/images/products/column/white/image-1.webp' },
        ],
      },
      {
        id: 'pillar',
        name: 'Pillar candle',
        price: 'From €6,95',
        priceCents: 695,
        image: '/images/pillar.webp',
        images: Array.from({ length: 5 }, (_, index) => `/images/products/pillar/white/image-${index + 1}.webp`),
        collectionId: 'natural-glow',
        description:
          'A ribbed pillar candle for a table or a favourite corner of your home. I pour it by hand with 100% soy wax and leave it fragrance-free.',
        variantLabel: 'size or bundle',
        colorLabel: 'colour',
        colors: naturalGlowColors('pillar', { 'white': 5, 'pink': 1, 'purple': 1, 'brown': 1, 'baby-blue': 1 }),
        variants: [
          { id: 'pillar-small', label: 'Small', priceCents: 695, image: '/images/products/pillar/white/image-5.webp' },
          { id: 'pillar-medium', label: 'Medium', priceCents: 995, image: '/images/products/pillar/white/image-4.webp' },
          { id: 'pillar-large', label: 'Large', priceCents: 1295, image: '/images/products/pillar/white/image-3.webp' },
          { id: 'pillar-bundle', label: 'Bundle', priceCents: 2495, image: '/images/products/pillar/white/image-2.webp' },
        ],
      },
      {
        id: 'spiral',
        name: 'Spiral candle',
        price: 'From €6,95',
        priceCents: 695,
        image: '/images/spiral.webp',
        images: Array.from({ length: 5 }, (_, index) => `/images/products/spiral/white/image-${index + 1}.webp`),
        collectionId: 'natural-glow',
        description:
          'Soft twists and rounded lines give this candle its shape. Poured by hand with 100% soy wax, with no added fragrance.',
        variantLabel: 'size or bundle',
        colorLabel: 'colour',
        colors: naturalGlowColors('spiral', { 'white': 5, 'pink': 1, 'purple': 1, 'brown': 1, 'baby-blue': 1 }),
        variants: [
          { id: 'spiral-small', label: 'Small', priceCents: 695, image: '/images/products/spiral/white/image-5.webp' },
          { id: 'spiral-medium', label: 'Medium', priceCents: 995, image: '/images/products/spiral/white/image-4.webp' },
          { id: 'spiral-large', label: 'Large', priceCents: 1295, image: '/images/products/spiral/white/image-3.webp' },
          { id: 'spiral-bundle', label: 'Bundle', priceCents: 2495, image: '/images/products/spiral/white/image-2.webp' },
        ],
      },
      {
        id: 'shell',
        name: 'Shell candle',
        price: 'From €4,95',
        priceCents: 495,
        image: '/images/shell.webp',
        images: Array.from({ length: 3 }, (_, index) => `/images/products/shell/white/image-${index + 1}.webp`),
        collectionId: 'natural-glow',
        description:
          'A small reminder of the seaside, with curved lines inspired by a shell. Poured by hand with 100% soy wax and no added fragrance.',
        variantLabel: 'size or bundle',
        colorLabel: 'colour',
        colors: naturalGlowColors('shell', { 'white': 3, 'pink': 1, 'purple': 1, 'brown': 1, 'baby-blue': 1 }),
        variants: [
          { id: 'shell-small', label: 'Small', priceCents: 495, image: '/images/products/shell/white/image-3.webp' },
          { id: 'shell-large', label: 'Large', priceCents: 895, image: '/images/products/shell/white/image-2.webp' },
          { id: 'shell-bundle', label: 'Bundle', priceCents: 1195, image: '/images/products/shell/white/image-1.webp' },
        ],
      },
      {
        id: 'arch',
        name: 'Arch candle',
        price: 'From €4,95',
        priceCents: 495,
        image: '/images/arch.webp',
        images: ['/images/products/arch/white/image-1.webp', '/images/products/arch/white/image-2.webp', '/images/products/arch/white/image-3.webp', '/images/products/arch/white/image-4.webp'],
        collectionId: 'natural-glow',
        description:
          'A simple arch shape that looks lovely on its own or beside your favourite objects. Made by hand with 100% soy wax and no added fragrance.',
        variantLabel: 'size or bundle',
        colorLabel: 'colour',
        colors: naturalGlowColors('arch', { 'white': 4, 'pink': 1, 'purple': 1, 'brown': 1, 'baby-blue': 1 }),
        variants: [
          { id: 'arch-small', label: 'Small', priceCents: 495, image: '/images/products/arch/white/image-4.webp' },
          { id: 'arch-medium', label: 'Medium', priceCents: 695, image: '/images/products/arch/white/image-3.webp' },
          { id: 'arch-large', label: 'Large', priceCents: 895, image: '/images/products/arch/white/image-2.webp' },
          { id: 'arch-bundle', label: 'Bundle', priceCents: 1595, image: '/images/products/arch/white/image-1.webp' },
        ],
      },
      {
        id: 'bubble',
        name: 'Bubble candle',
        price: 'From €4,95',
        priceCents: 495,
        image: '/images/bubble.webp',
        images: Array.from({ length: 4 }, (_, index) => `/images/products/bubble/white/image-${index + 1}.webp`),
        collectionId: 'natural-glow',
        description:
          'Rounded, playful bubbles in a candle you can tuck into a favourite corner. I pour it by hand with 100% soy wax and leave it fragrance-free.',
        variantLabel: 'size or bundle',
        colorLabel: 'colour',
        colors: naturalGlowColors('bubble', { 'white': 4, 'pink': 1, 'purple': 1, 'brown': 1, 'baby-blue': 1 }),
        variants: [
          { id: 'bubble-small', label: 'Small', priceCents: 495, image: '/images/products/bubble/white/image-2.webp' },
          { id: 'bubble-medium', label: 'Medium', priceCents: 695, image: '/images/products/bubble/white/image-3.webp' },
          { id: 'bubble-large', label: 'Large', priceCents: 895, image: '/images/products/bubble/white/image-4.webp' },
          { id: 'bubble-bundle', label: 'Bundle', priceCents: 1595, image: '/images/products/bubble/white/image-1.webp' },
        ],
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

export const heroImage = '/images/hero-candles.webp'
export const aboutImage = '/images/about-candles.webp'
