// Sequential-enough, human-readable order number: a base36 timestamp suffix
// plus three random characters, e.g. "EG-8U0LDJQS".
export function createOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5)
  const random = Math.random().toString(36).toUpperCase().slice(2, 5)
  return `EG-${stamp}${random}`
}
