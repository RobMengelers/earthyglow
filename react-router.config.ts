import type { Config } from '@react-router/dev/config'
import { collections, products } from './src/data/products.ts'

const staticPages = [
  '/',
  '/shop',
  '/about',
  '/care',
  '/contact',
  '/policies',
  '/policies/privacy-policy',
  '/policies/refund-policy',
  '/policies/terms-of-service',
  '/policies/contact-information',
]

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  ssr: true,
  prerender: async () => [
    ...staticPages,
    ...collections.map((collection) => `/shop/${collection.id}`),
    ...products.map((product) => `/product/${product.id}`),
    '/sitemap.xml',
  ],
} satisfies Config
