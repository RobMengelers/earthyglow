import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60

const JWT_HEADER = Buffer.from(
  JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
).toString('base64url')

export function signAdminToken(secret: string): string {
  const now = Math.floor(Date.now() / 1000)
  const body = Buffer.from(
    JSON.stringify({
      sub: 'admin',
      iat: now,
      exp: now + ADMIN_SESSION_TTL_SECONDS,
    }),
  ).toString('base64url')
  const signature = createHmac('sha256', secret)
    .update(`${JWT_HEADER}.${body}`)
    .digest('base64url')
  return `${JWT_HEADER}.${body}.${signature}`
}

export function verifyAdminToken(token: string, secret: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return false

  const expected = createHmac('sha256', secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest('base64url')

  const a = Buffer.from(expected)
  const b = Buffer.from(parts[2])
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      exp?: unknown
    }
    return (
      typeof payload.exp === 'number' &&
      payload.exp >= Math.floor(Date.now() / 1000)
    )
  } catch {
    return false
  }
}

// Constant-time comparison for credentials; hashes both sides first so the
// comparison length never leaks information about the real values.
export function secureEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

// Deterministically derived from the login credentials so the admin flow works
// with a single ADMIN_PASSWORD variable. It only ever protects on-disk tokens
// of the same secret, so derivation from the password is sufficient.
export function adminJwtSecret(username: string, password: string): string {
  return createHash('sha256')
    .update(`earthyglow-admin:${username}:${password}`)
    .digest('hex')
}