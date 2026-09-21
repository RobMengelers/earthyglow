export type Product = {
  id: string
  name: string
  price: string
  priceCents: number
  image: string
  soldOut?: boolean
  description: string
  collectionId: string
  care?: string
  variantLabel?: string
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

export const collections: Collection[] = [
  {
    id: 'little-glow',
    eyebrow: 'The Little Glow',
    title: 'Flower candle gifts',
    blurb:
      'Hand-poured flower candles, arranged in boxes and baskets. A bouquet with a little something different.',
    products: [
      {
        id: 'floral-box',
        name: 'The Floral Box',
        price: '€14,95',
        priceCents: 1495,
        image: '/images/d99f763e-0f02-4797-9cff-2fdf82d96529.webp',
        collectionId: 'little-glow',
        description:
          'Nine individually poured flower candles, arranged in a gift box and scented with Bluebell. I make these with approximately 220g of soy wax. Choose pink, baby blue or purple for someone you love, or for yourself.',
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
        image: '/images/670b77ea-aeb3-4566-8863-e9fa02b40b8e.webp',
        collectionId: 'little-glow',
        description:
          'A basket of individually poured flower candles with an English Rose scent. Made with approximately 150g of soy wax and available in pink or red. A little bouquet you can enjoy at home or give as a gift.',
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
      'From Coconut Island to Pumpkin Spice, find a fragrance for your favourite time of year.',
    products: [
      {
        id: 'coconut-beach',
        name: 'Coconut Beach',
        price: 'From €14,95',
        priceCents: 1495,
        image: '/images/31eca091-4aa2-40ea-9a50-d76cdea8f7bc.webp',
        collectionId: 'scented-glow',
        description:
          'A little beach scene, poured by hand with soy wax and scented with Coconut Island. Pineapple and orange meet creamy coconut, almond and peach. Choose your favourite of the four seaside shapes.',
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
        image: '/images/50adf898-6887-4195-a3c6-286f4926778d.webp',
        collectionId: 'scented-glow',
        description:
          'I decorate this soy wax candle with autumn-inspired wax details. Its Vanilla & Cinders fragrance brings together smoky vanilla, clove, cedarwood, amber and musk for an evening at home.',
      },
      {
        id: 'pumpkin-spice',
        name: 'Pumpkin Spice',
        price: '€14,95',
        priceCents: 1495,
        image: '/images/5869d3a7-0b47-42bc-a78a-f8a3b78eab39.webp',
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
        image: '/images/Pumpkin_Spice_Latte.webp',
        collectionId: 'scented-glow',
        description:
          'A candle inspired by a favourite autumn drink, with whipped wax and handmade seasonal details. Poured with soy wax and scented with Pumpkin Spice. For your shelf, not your coffee cup.',
      },
    ],
  },
  {
    id: 'halloween',
    eyebrow: 'The Halloween Glow',
    title: 'Halloween candles',
    blurb: 'Little ghosts, pumpkin shapes and autumn scents. A few playful things I’ve made for the season.',
    products: [
      {
        id: 'ghostlight-dinner-candle',
        name: 'Ghostlight Dinner Candle',
        price: '€2,95',
        priceCents: 295,
        image: '/images/ghostlight-dinner-candle.webp',
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
        collectionId: 'halloween',
        description:
          'Little pumpkin-shaped wax melts with a warm Pumpkin Spice fragrance. I pour them by hand with soy wax and pack approximately 70g in each bag. Use them in a suitable wax warmer.',
        care: 'Place one or two melts in a suitable wax warmer. Never add water or light the melts directly. Follow your warmer’s instructions and never leave it unattended.',
      },
    ],
  },
  {
    id: 'natural-glow',
    eyebrow: 'The Natural Glow',
    title: 'Sculptural natural candles',
    blurb:
      'Fragrance-free soy wax candles in simple, sculptural shapes. Choose one for your favourite spot at home.',
    products: [
      {
        id: 'column',
        name: 'Column candle',
        price: 'From €9,95',
        priceCents: 995,
        image: '/images/Schermafbeelding2026-05-03152509.webp',
        collectionId: 'natural-glow',
        description:
          'Straight, ribbed lines and a simple column shape, poured by hand with 100% soy wax. Fragrance-free, so you can enjoy the candlelight without an added scent.',
        variantLabel: 'size or bundle',
        variants: [
          { id: 'column-small', label: 'Small', priceCents: 995 },
          { id: 'column-large', label: 'Large', priceCents: 1295 },
          { id: 'column-bundle', label: 'Bundle', priceCents: 1995 },
        ],
      },
      {
        id: 'pillar',
        name: 'Pillar candle',
        price: 'From €6,95',
        priceCents: 695,
        image: '/images/1b8dcdc0-1ca6-4d8b-bd8d-78d13c22efaf.webp',
        collectionId: 'natural-glow',
        description:
          'A ribbed pillar candle for a table or a favourite corner of your home. I pour it by hand with 100% soy wax and leave it fragrance-free.',
        variantLabel: 'size or bundle',
        variants: [
          { id: 'pillar-small', label: 'Small', priceCents: 695 },
          { id: 'pillar-medium', label: 'Medium', priceCents: 995 },
          { id: 'pillar-large', label: 'Large', priceCents: 1295 },
          { id: 'pillar-bundle', label: 'Bundle', priceCents: 2495 },
        ],
      },
      {
        id: 'spiral',
        name: 'Spiral candle',
        price: 'From €6,95',
        priceCents: 695,
        image: '/images/e3d2f8c0-1f58-4c8b-a2e7-a7aafead6d4d.webp',
        collectionId: 'natural-glow',
        description:
          'Soft twists and rounded lines give this candle its shape. Poured by hand with 100% soy wax, with no added fragrance.',
        variantLabel: 'size or bundle',
        variants: [
          { id: 'spiral-small', label: 'Small', priceCents: 695 },
          { id: 'spiral-medium', label: 'Medium', priceCents: 995 },
          { id: 'spiral-large', label: 'Large', priceCents: 1295 },
          { id: 'spiral-bundle', label: 'Bundle', priceCents: 2495 },
        ],
      },
      {
        id: 'shell',
        name: 'Shell candle',
        price: 'From €4,95',
        priceCents: 495,
        image: '/images/Schermafbeelding_2026-05-03_153832.webp',
        collectionId: 'natural-glow',
        description:
          'A small reminder of the seaside, with curved lines inspired by a shell. Poured by hand with 100% soy wax and no added fragrance.',
        variantLabel: 'size or bundle',
        variants: [
          { id: 'shell-small', label: 'Small', priceCents: 495 },
          { id: 'shell-large', label: 'Large', priceCents: 895 },
          { id: 'shell-bundle', label: 'Bundle', priceCents: 1195 },
        ],
      },
      {
        id: 'arch',
        name: 'Arch candle',
        price: 'From €4,95',
        priceCents: 495,
        image: '/images/7aa7691d-26fe-4ea2-8188-64529e4bda46.webp',
        collectionId: 'natural-glow',
        description:
          'A simple arch shape that looks lovely on its own or beside your favourite objects. Made by hand with 100% soy wax and no added fragrance.',
        variantLabel: 'size or bundle',
        variants: [
          { id: 'arch-small', label: 'Small', priceCents: 495 },
          { id: 'arch-medium', label: 'Medium', priceCents: 695 },
          { id: 'arch-large', label: 'Large', priceCents: 895 },
          { id: 'arch-bundle', label: 'Bundle', priceCents: 1595 },
        ],
      },
      {
        id: 'bubble',
        name: 'Bubble candle',
        price: 'From €4,95',
        priceCents: 495,
        image: '/images/6efade16-e5a8-4eb0-99e9-ad0a90b19f9a.webp',
        collectionId: 'natural-glow',
        description:
          'Rounded, playful bubbles in a candle you can tuck into a favourite corner. I pour it by hand with 100% soy wax and leave it fragrance-free.',
        variantLabel: 'size or bundle',
        variants: [
          { id: 'bubble-small', label: 'Small', priceCents: 495 },
          { id: 'bubble-medium', label: 'Medium', priceCents: 695 },
          { id: 'bubble-large', label: 'Large', priceCents: 895 },
          { id: 'bubble-bundle', label: 'Bundle', priceCents: 1595 },
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

export const heroImage = '/images/17ba3741-6495-4fc7-84fe-a4653dbdda61.webp'
export const aboutImage = '/images/Schermafbeelding_2026-05-30_164759.webp'
