import { reactRouter } from '@react-router/dev/vite'
import netlifyReactRouter from '@netlify/vite-plugin-react-router'
import netlify from '@netlify/vite-plugin'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    netlifyReactRouter(),
    // Edge functions emulation needs a local Deno install; this app deploys
    // to Netlify Functions, so that part is turned off.
    netlify({ edgeFunctions: { enabled: false } }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:4010',
    },
  },
})
