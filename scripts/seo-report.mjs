// Pulls Search Console and Google Analytics data for earthyglow.nl.
//
// Uses a read-only service account; the key lives outside the repo.
//   node scripts/seo-report.mjs [days=28] [outDir]
// Writes JSON files to outDir (default: ./seo-data, which is gitignored) and
// prints a short summary.
//
// Env overrides: GOOGLE_KEY_FILE, GA4_PROPERTY_ID, GSC_SITE.

import { createSign } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const KEY_FILE =
  process.env.GOOGLE_KEY_FILE ?? join(homedir(), '.config/earthyglow/google-key.json')
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID ?? '562238034'
const GSC_SITE = process.env.GSC_SITE ?? 'sc-domain:earthyglow.nl'
const DAYS = Number(process.argv[2] ?? 28)
const OUT_DIR = process.argv[3] ?? 'seo-data'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

const b64url = (input) => Buffer.from(input).toString('base64url')

async function getAccessToken() {
  const key = JSON.parse(await readFile(KEY_FILE, 'utf8'))
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPES.join(' '),
      aud: key.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  )
  const signature = createSign('RSA-SHA256')
    .update(`${header}.${claims}`)
    .sign(key.private_key, 'base64url')
  const res = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  })
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`)
  return (await res.json()).access_token
}

async function post(token, url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${url} → ${res.status} ${await res.text()}`)
  return res.json()
}

const isoDate = (d) => d.toISOString().slice(0, 10)

function dateRange(days) {
  // Search Console lags a few days; ending 3 days ago avoids partial data.
  const end = new Date(Date.now() - 3 * 86400_000)
  const start = new Date(end.getTime() - (days - 1) * 86400_000)
  return { startDate: isoDate(start), endDate: isoDate(end) }
}

async function searchConsole(token, dimensions, range) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`
  const data = await post(token, url, { ...range, dimensions, rowLimit: 1000 })
  return (data.rows ?? []).map((r) => ({
    ...Object.fromEntries(dimensions.map((d, i) => [d, r.keys[i]])),
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Number((r.ctr * 100).toFixed(2)),
    position: Number(r.position.toFixed(1)),
  }))
}

async function analytics(token, dimensions, metrics, days) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`
  const data = await post(token, url, {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
    limit: 500,
  })
  return (data.rows ?? []).map((r) => ({
    ...Object.fromEntries(dimensions.map((d, i) => [d, r.dimensionValues[i].value])),
    ...Object.fromEntries(metrics.map((m, i) => [m, Number(r.metricValues[i].value)])),
  }))
}

async function main() {
  const token = await getAccessToken()
  const range = dateRange(DAYS)

  const reports = {
    'gsc-queries': () => searchConsole(token, ['query'], range),
    'gsc-pages': () => searchConsole(token, ['page'], range),
    'gsc-query-page': () => searchConsole(token, ['query', 'page'], range),
    'gsc-countries': () => searchConsole(token, ['country'], range),
    'gsc-devices': () => searchConsole(token, ['device'], range),
    'gsc-dates': () => searchConsole(token, ['date'], range),
    'ga-channels': () =>
      analytics(token, ['sessionDefaultChannelGroup'], ['sessions', 'totalUsers', 'engagedSessions', 'conversions'], DAYS),
    'ga-sources': () =>
      analytics(token, ['sessionSource', 'sessionMedium'], ['sessions', 'totalUsers', 'engagedSessions'], DAYS),
    'ga-landing-pages': () =>
      analytics(token, ['landingPage'], ['sessions', 'totalUsers', 'engagedSessions', 'bounceRate'], DAYS),
    'ga-countries': () => analytics(token, ['country'], ['sessions', 'totalUsers'], DAYS),
    'ga-devices': () => analytics(token, ['deviceCategory'], ['sessions', 'totalUsers'], DAYS),
    'ga-events': () => analytics(token, ['eventName'], ['eventCount', 'totalUsers'], DAYS),
    'ga-daily': () => analytics(token, ['date'], ['sessions', 'totalUsers'], DAYS),
  }

  await mkdir(OUT_DIR, { recursive: true })
  const results = {}
  for (const [name, run] of Object.entries(reports)) {
    try {
      results[name] = await run()
      await writeFile(join(OUT_DIR, `${name}.json`), JSON.stringify(results[name], null, 2))
      console.log(`✓ ${name}: ${results[name].length} rows`)
    } catch (err) {
      console.log(`✗ ${name}: ${err.message.slice(0, 300)}`)
    }
  }
  console.log(`\nSearch Console range: ${range.startDate} → ${range.endDate}; GA4: last ${DAYS} days`)
  console.log(`Saved to ${OUT_DIR}/`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
