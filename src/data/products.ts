import { formatPrice } from '../lib/price.ts'

export type Product = {
  id: string
  name: string
  priceCents: number
  image: string
  images?: string[]
  soldOut?: boolean
  description: string
  collectionId: string
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

export function productPriceLabel(product: Product): string {
  const prices = [
    product.priceCents,
    ...(product.variants ?? []).map(
      (variant) => variant.priceCents ?? product.priceCents,
    ),
  ]
  const hasPriceRange = new Set(prices).size > 1

  return `${hasPriceRange ? 'From ' : ''}${formatPrice(Math.min(...prices))}`
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
        priceCents: 1495,
        image: '/images/floral-box.webp',
        images: Array.from({ length: 10 }, (_, index) => `/images/products/floral-box/image-${index + 1}.webp`),
        collectionId: 'little-glow',
        description:
          'A beautiful collection of nine individually hand-poured flower candles, carefully arranged in an elegant gift box and delicately scented with Bluebell. \n\n Made with approximately 220g of 100% natural soy wax, each flower is poured by hand, making every box unique. \n\n The Bluebell fragrance is fresh, floral and elegant, opening with notes of bluebell and hyacinth, followed by a soft floral heart of lavender, galbanum, rose and jasmine, and finished with a warm touch of musk. \n\n Choose from soft pink, baby blue or purple and give someone special a gift that looks almost too beautiful to burn or simply treat yourself. ♡',
        variants: [
          { id: 'pink', label: 'Pink', swatch: '#e8a1b5', priceCents: 1495, image: '/images/products/floral-box/image-4.webp' },
          { id: 'baby-blue', label: 'Baby blue', swatch: '#9fc9e8', priceCents: 1495, image: '/images/products/floral-box/image-5.webp' },
          { id: 'purple', label: 'Purple', swatch: '#9b72c4', priceCents: 1495, image: '/images/products/floral-box/image-6.webp' },
        ],
      },
      {
        id: 'floral-basket',
        name: 'The Floral Basket',
        priceCents: 1295,
        image: '/images/floral-basket.webp',
        images: Array.from({ length: 5 }, (_, index) => `/images/products/floral-basket/image-${index + 1}.webp`),
        collectionId: 'little-glow',
        description:
          'A charming basket filled with eight individually hand-poured flower candles, carefully arranged and delicately scented with English Rose. \n\n Made with approximately 150g of 100% natural soy wax, each flower is poured by hand, making every basket unique. \n\n The English Rose fragrance is soft, warm and elegant, opening with sweet notes of vanilla and citrus, followed by a green, fruity and slightly spicy heart, and finished with a warm base of musk, woody notes and balsamic tones. \n\n Available in pink or red, this little floral bouquet is perfect to enjoy at home or to give as a thoughtful gift. ♡',
        variants: [
          { id: 'floral-basket-pink', label: 'Pink', priceCents: 1295, swatch: '#e8a1b5', image: '/images/products/floral-basket/image-1.webp' },
          { id: 'floral-basket-red', label: 'Red', priceCents: 1295, swatch: '#c94c55', image: '/images/products/floral-basket/image-3.webp' },
        ],
      },
      {
        id: 'festive-glow-box',
        name: 'The Festive Glow Box',
        priceCents: 1495,
        image: '/images/festive-glow-box.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/festive-glow-box/image-${index + 1}.webp`),
        collectionId: 'little-glow',
        description:
          'Bring the warmth of Christmas into your home with our Festive Glow Box. The box contains 9 handmade flower candles, scented with Mulled Wine. \n\n The fragrance is warm, rich and festive, with the cozy character of spiced wine, sweet fruit and warming Christmas spices. It creates that familiar winter feeling of a steaming glass of mulled wine on a cold December evening. \n\n The candles are made with approximately 170 g of wax in total and the box is approximately 20 cm high. \n\n Important: Always remove the candles from the box before lighting. The decorative materials inside the box are flammable and must never come into contact with an open flame. \n\n 9 candles | Approx. 170 g wax | Approx. 20 cm high | Mulled Wine fragrance',
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
        priceCents: 1495,
        image: '/images/coconut-beach.webp',
        images: Array.from({ length: 5 }, (_, index) => `/images/products/coconut-beach/image-${index + 1}.webp`),
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
        priceCents: 1495,
        image: '/images/autumn-ember.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/autumn-ember/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'A cozy autumn candle finished with delicate, hand-poured wax details inspired by the season. Its Vanilla & Cinders fragrance combines smoky vanilla, clove, cedarwood, amber and musk, creating a warm and inviting scent for slow evenings at home.',
      },
      {
        id: 'pumpkin-spice',
        name: 'Pumpkin Spice',
        priceCents: 1495,
        image: '/images/pumpkin-spice.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/pumpkin-spice/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        soldOut: true,
        description:
          'A soy wax candle in a pumpkin-shaped jar, finished with autumn details and a warm Pumpkin Spice fragrance. A little seasonal colour for your home.',
      },
      {
        id: 'pumpkin-spice-latte',
        name: 'Pumpkin Spice Latte',
        priceCents: 995,
        image: '/images/pumpkin-spice-latte.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/pumpkin-spice-latte/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'A candle inspired by a favourite autumn drink, with whipped wax and handmade seasonal details. Poured with soy wax and scented with Pumpkin Spice. For your shelf, not your coffee cup.',
      },
      {
        id: 'pumpkin-boo',
        name: 'Pumpkin Boo',
        priceCents: 895,
        image: '/images/pumpkin-boo.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/pumpkin-boo/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'A playful autumn candle featuring a little ghost and pumpkin, carefully finished by hand in soy wax. Scented with warm Pumpkin Spice, Pumpkin Boo brings a cozy seasonal feel to your home and is perfect for crisp autumn evenings.',
      },
      {
        id: 'boo-boo',
        name: 'Boo Boo',
        priceCents: 895,
        image: '/images/boo-boo.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/boo-boo/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'A handmade ghost detail sits on this soy wax candle. Scented with Vanilla & Cinders, with smoky vanilla, clove, cedarwood, amber and musk.',
      },
      {
        id: 'scary-boo',
        name: 'Scary Boo',
        priceCents: 895,
        image: '/images/scary-boo.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/scary-boo/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'A playful autumn candle with a hand-finished ghost-inspired wax detail, perfect for adding a subtle spooky touch to your home. \n\n Made with soy wax and scented with Vanilla & Cinders, a warm and comforting fragrance with smoky vanilla, soft clove, cedarwood, glowing amber and musk. Rich, cozy and slightly mysterious, it feels like a crisp autumn evening by the fire.',
      },
      {
        id: 'hot-cocoa',
        name: 'Hot Cocoa',
        priceCents: 995,
        image: '/images/hot-cocoa.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/hot-cocoa/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'Bring a little extra coziness into your home with our Hot Cocoa Candle. Scented with Pain au Chocolat, this warm and indulgent fragrance fills your space with the comforting aroma of rich chocolate and freshly baked pastry. \n\n Handmade with approximately 150 g of wax in a glass jar measuring around 9 cm high, making it the perfect cozy candle for the colder months. \n\n Approx. 150 g wax | Approx. 9 cm high | Pain au Chocolat fragrance',
      },
      {
        id: 'gluhwein',
        name: 'Gluhwein',
        priceCents: 995,
        image: '/images/gluhwein.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/gluhwein/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'Bring the warm and festive feeling of Christmas into your home with our Glühwein Candle. Scented with Mulled Wine, this cozy fragrance combines warm spices with a rich, fruity character, inspired by a classic cup of glühwein. \n\n Handmade with approximately 150 g of wax in a glass jar measuring around 9 cm high, making it a perfect candle for cozy winter evenings and the holiday season. \n\n Approx. 150 g wax | Approx. 9 cm high | Mulled Wine fragrance',
      },
      {
        id: 'winter-wonderland-candle',
        name: 'Winter Wonderland Candle',
        priceCents: 1495,
        image: '/images/winter-wonderland-candle.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/winter-wonderland-candle/image-${index + 1}.webp`),
        collectionId: 'scented-glow',
        description:
          'Bring the fresh feeling of a winter forest into your home with our Winter Wonderland Candle. The fragrance opens with crisp notes of pine needles, cypress, eucalyptus and peppermint, followed by a warm heart of fir balsam. Cedarwood and resinous base notes give the scent a deep, woody and comforting finish. \n\n The candle is handmade with approximately 245 g of wax and comes in a low glass jar measuring around 7 cm high with a diameter of approximately 12 cm. \n\n Approx. 245 g wax | Approx. 7 cm high | Approx. 12 cm diameter | Nordic Cedar fragrance',
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
        priceCents: 995,
        image: '/images/column.webp',
        images: Array.from({ length: 3 }, (_, index) => `/images/products/column/white/image-${index + 1}.webp`),
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
        priceCents: 495,
        image: '/images/arch.webp',
        images: Array.from({ length: 4 }, (_, index) => `/images/products/arch/white/image-${index + 1}.webp`),
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
      {
        id: 'ghostlight-dinner-candle',
        name: 'Ghostlight Dinner Candle',
        priceCents: 295,
        image: '/images/ghostlight-dinner-candle.webp',
        images: ['/images/products/ghostlight-dinner-candle/image-1.webp'],
        collectionId: 'natural-glow',
        description:
          'A twisted dinner candle with a little ghost face, poured by hand with 100% soy wax. A playful addition to your Halloween table or a small gift for someone who loves the season.',
      },
      {
        id: 'christmas-bubble-candle',
        name: 'Christmas Bubble Candle',
        priceCents: 695,
        image: '/images/christmas-bubble-candle.webp',
        images: ['/images/products/christmas-bubble-candle/image-1.webp'],
        collectionId: 'natural-glow',
        description:
          'Add a festive touch to your home with our handmade Christmas Bubble Candle. This unscented decorative candle is made with 100% natural soy wax, a cotton wick and mica powder, finished with beautiful Christmas-inspired details. \n\n With its playful bubble shape and festive colours, it is perfect as a small Christmas decoration or seasonal gift. \n\n Approx. 50 g wax | Approx. 6 cm high | Unscented | 100% natural soy wax',
      },
      {
        id: 'christmas-tree-dinner-candle',
        name: 'Christmas Tree Dinner Candle',
        priceCents: 295,
        image: '/images/christmas-tree-dinner-candle.webp',
        images: ['/images/products/christmas-tree-dinner-candle/image-1.webp'],
        collectionId: 'natural-glow',
        description:
          'Bring a festive touch to your Christmas table with our handmade Christmas Tree Dinner Candle. Its elegant tree-inspired shape makes it perfect for a cozy Christmas dinner, festive table setting or seasonal decoration. \n\n The candle is unscented and made with 100% natural soy wax, mica powder and a cotton wick. Each candle is handmade, making every piece slightly unique. \n\n Approx. 20 cm high | Unscented | 100% natural soy wax',
      },
      {
        id: 'twisted-tree-candle',
        name: 'Twisted Tree Candle',
        priceCents: 1295,
        image: '/images/twisted-tree-candle.webp',
        images: ['/images/products/twisted-tree-candle/white/image-1.webp'],
        collectionId: 'natural-glow',
        description:
          'Our handmade Twisted Tree Candle combines a soft, elegant shape with a festive and timeless look. The flowing, twisted design gives the candle a beautiful sculptural finish while keeping the overall style simple and natural. \n\n The candle is unscented and made with 100% natural soy wax, mica powder and a cotton wick. \n\n Approx. 70 g wax | Approx. 12 cm high | Unscented',
        colorLabel: 'colour',
        colors: [
          { id: 'white', label: 'White', swatch: '#f0ebe1', base: true, images: ['/images/products/twisted-tree-candle/white/image-1.webp'] },
          { id: 'pink', label: 'Pink', swatch: '#e8a1b5', images: ['/images/products/twisted-tree-candle/pink/image-1.webp'] },
          { id: 'red', label: 'Red', swatch: '#c94c55', images: ['/images/products/twisted-tree-candle/red/image-1.webp'] },
        ],
      },
    ],
  },
  {
    id: 'wax-melts',
    eyebrow: 'Scented soy melts',
    title: 'Wax Melts',
    blurb: 'Little seasonal shapes for your warmer, poured by hand in soy wax and made to fill the room with a warm, comforting fragrance.',
    products: [
      {
        id: 'pumpkin-spice-wax-melts',
        name: 'Pumpkin Spice Wax Melts',
        priceCents: 495,
        image: '/images/pumpkin-spice-wax-melts.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/pumpkin-spice-wax-melts/image-${index + 1}.webp`),
        collectionId: 'wax-melts',
        description:
          'Little pumpkin-shaped wax melts with a warm Pumpkin Spice fragrance. I pour them by hand with soy wax and pack approximately 70g in each bag. Use them in a suitable wax warmer.',
      },
      {
        id: 'sweet-christmas-wax-melts',
        name: 'Sweet Christmas Wax Melts',
        priceCents: 295,
        image: '/images/sweet-christmas-wax-melts.webp',
        images: Array.from({ length: 2 }, (_, index) => `/images/products/sweet-christmas-wax-melts/image-${index + 1}.webp`),
        collectionId: 'wax-melts',
        description:
          'Fill your home with the warm and comforting scent of our Sweet Christmas Wax Melts. Scented with Pain au Chocolat, this cozy fragrance has a rich chocolate aroma with the sweet, bakery-like character of freshly baked pastries. \n\n Each 7 x 7 cm box contains 8 handmade Christmas-shaped wax melts, with approximately 45 g of wax in total. \n\n 8 wax melts | Approx. 45 g wax | Box size 7 x 7 cm | Pain au Chocolat fragrance',
      },
      {
        id: 'white-christmas-wax-melts',
        name: 'White Christmas Wax Melts',
        priceCents: 295,
        image: '/images/white-christmas-wax-melts.webp',
        images: ['/images/products/white-christmas-wax-melts/image-1.webp'],
        collectionId: 'wax-melts',
        description:
          'Fill your home with the fresh and festive scent of our White Christmas Wax Melts. This Christmas fragrance opens with notes of raspberry, green leaf and orange, followed by warm clove, pine and herbal notes, with a soft base of caramel and woody accords. \n\n Each 7 x 7 cm box contains 1 large snowflake and 6 small Christmas tree wax melts, with approximately 35 g of wax in total. \n\n 7 wax melts | Approx. 35 g wax | Box size 7 x 7 cm | White Christmas fragrance',
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

export const heroImage = '/images/hero-winter.webp'
export const aboutImage = '/images/about-candles.webp'
