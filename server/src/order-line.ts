// The description of an order line as the customer and the shop see it: the
// product name followed by the options that were picked. The variant (size or
// bundle) comes first, the colour second, so every line reads the same way in
// the payment, the invoice and the order notification.
export function describeLine(
  name: string,
  variantLabel?: string | null,
  colorLabel?: string | null,
): string {
  const options = [variantLabel, colorLabel]
    .map((option) => option?.trim())
    .filter((option): option is string => Boolean(option))
  return options.length > 0 ? `${name} (${options.join(', ')})` : name
}
