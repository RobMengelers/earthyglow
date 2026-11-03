import type { Config } from '@react-router/dev/config'
import { collections, products } from './src/data/products.ts'
import { LOCALES, localizePath } from './src/i18n/locales.ts'

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
  // Every public page in every language. "/" itself is not prerendered: it
  // redirects to the visitor's language on the server.
  prerender: async () => [
    ...LOCALES.flatMap((locale) =>
      [
        ...staticPages,
        ...collections.map((collection) => `/shop/${collection.id}`),
        ...products.map((product) => `/product/${product.id}`),
      ].map((path) => localizePath(locale, path)),
    ),
    '/sitemap.xml',
  ],
} satisfies Config
