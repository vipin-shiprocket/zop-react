import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcDiscountPercentage(
  priceAmount: string,
  compareAtAmount: string,
): number | null {
  const current = parseFloat(priceAmount)
  const compare = parseFloat(compareAtAmount)
  if (compare <= 0 || current >= compare) return null
  return Math.round(((compare - current) / compare) * 100)
}

export function parseGid(gid: string): string {
  return gid.split("/").pop() ?? gid
}

export function formatPrice({
  amount,
  currencyCode,
}: {
  amount: string
  currencyCode: string
}): string {
  const value = parseFloat(amount)
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value)
  } catch {
    return `${currencyCode} ${value}`
  }
}
