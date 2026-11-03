import type { Locale } from './locales'

// Colour, size and shape names of product options. Carts and orders keep the
// English label (it is what the API validates and stores), and only the text a
// visitor reads is translated. Keep in sync with server/src/i18n.ts.
const OPTION_LABELS: Record<string, { nl: string; de: string }> = {
  Small: { nl: 'Klein', de: 'Klein' },
  Medium: { nl: 'Middel', de: 'Mittel' },
  Large: { nl: 'Groot', de: 'Groß' },
  Single: { nl: 'Los', de: 'Einzeln' },
  Bundle: { nl: 'Bundel', de: 'Set' },
  'Bundle (3 colours)': { nl: 'Bundel (3 kleuren)', de: 'Set (3 Farben)' },
  White: { nl: 'Wit', de: 'Weiß' },
  Pink: { nl: 'Roze', de: 'Rosa' },
  Red: { nl: 'Rood', de: 'Rot' },
  Purple: { nl: 'Paars', de: 'Lila' },
  Brown: { nl: 'Bruin', de: 'Braun' },
  Green: { nl: 'Groen', de: 'Grün' },
  'Baby blue': { nl: 'Babyblauw', de: 'Babyblau' },
  Oyster: { nl: 'Oester', de: 'Auster' },
  Coconut: { nl: 'Kokosnoot', de: 'Kokosnuss' },
  Shell: { nl: 'Schelp', de: 'Muschel' },
  'Sea star': { nl: 'Zeester', de: 'Seestern' },
}

/** The visitor-facing name of an option label; unknown labels pass through unchanged. */
export function optionLabel(label: string, locale: Locale): string {
  if (locale === 'en') return label
  return OPTION_LABELS[label]?.[locale] ?? label
}

/** Every known English option label, for checks that the server copy stays in sync. */
export const OPTION_LABEL_KEYS = Object.keys(OPTION_LABELS)
