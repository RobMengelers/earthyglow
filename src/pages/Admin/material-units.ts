// Units come from a fixed list rather than free text: "kgs", "KG" and "kg" as
// separate spellings would quietly break the per-product calculations later.
export const MATERIAL_UNITS = ['g', 'kg', 'ml', 'l', 'pcs'] as const
