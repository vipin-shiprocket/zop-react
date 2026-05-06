import type { Product, ProductVariant } from "./types"

export type SelectedOptions = Record<string, string>

export function readSelectedOptionsFromParams(
  searchParams: URLSearchParams,
  product: Product,
): SelectedOptions {
  const result: SelectedOptions = {}
  for (const opt of product.options) {
    const v = searchParams.get(opt.name)
    if (v) result[opt.name] = v
  }
  return result
}

export function findSelectedVariant(
  product: Product,
  selectedOptions: SelectedOptions,
): ProductVariant | null {
  const variants = product.variants.nodes
  if (variants.length === 0) return null

  const optionNames = product.options.map((o) => o.name)
  const filledKeys = Object.keys(selectedOptions).filter(
    (k) => selectedOptions[k],
  )

  if (filledKeys.length === optionNames.length) {
    const exact = variants.find((v) =>
      v.selectedOptions.every((so) => selectedOptions[so.name] === so.value),
    )
    if (exact) return exact
  }

  if (filledKeys.length > 0) {
    const partial = variants.find(
      (v) =>
        v.availableForSale &&
        filledKeys.every((k) =>
          v.selectedOptions.some(
            (so) => so.name === k && so.value === selectedOptions[k],
          ),
        ),
    )
    if (partial) return partial
  }

  return variants.find((v) => v.availableForSale) ?? variants[0]
}

export function buildVariantUriQuery(
  selectedOptions: SelectedOptions,
  override: { name: string; value: string },
): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(selectedOptions)) {
    if (v) params.set(k, v)
  }
  params.set(override.name, override.value)
  return params.toString()
}

export function getOptionAvailability(
  product: Product,
  optionName: string,
  optionValue: string,
  selectedOptions: SelectedOptions,
): { exists: boolean; available: boolean } {
  const variants = product.variants.nodes
  const matches = variants.filter((v) =>
    v.selectedOptions.some(
      (so) => so.name === optionName && so.value === optionValue,
    ),
  )

  if (matches.length === 0) return { exists: false, available: false }

  const otherOptionNames = product.options
    .map((o) => o.name)
    .filter((n) => n !== optionName)

  const compatible = matches.filter((v) =>
    otherOptionNames.every((n) => {
      const sel = selectedOptions[n]
      if (!sel) return true
      return v.selectedOptions.some(
        (so) => so.name === n && so.value === sel,
      )
    }),
  )

  const candidates = compatible.length > 0 ? compatible : matches
  const available = candidates.some((v) => v.availableForSale)

  return { exists: true, available }
}
