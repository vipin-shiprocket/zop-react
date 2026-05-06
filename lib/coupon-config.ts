export type CouponConfig = {
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderAmount?: number
  notApplicableMessage?: string
}

export const AVAILABLE_COUPONS: CouponConfig[] = [
  {
    code: "SASTA20",
    description: "Apply this code and get 20% off",
    discountType: "percentage",
    discountValue: 20,
  },
  {
    code: "PREPAID",
    description: "Apply this code and get 12.5% off",
    discountType: "percentage",
    discountValue: 12.5,
  },
  {
    code: "COFFEE",
    description: "Apply this code and get ₹80 off",
    discountType: "fixed",
    discountValue: 80,
    notApplicableMessage: "The offer is not applicable on the items in your cart",
  },
  {
    code: "TOP20",
    description: "Apply this code and get 20% off",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 400,
  },
]

export function calcCouponSavings(
  coupon: CouponConfig,
  subtotal: number,
): number {
  if (coupon.discountType === "percentage") {
    return (subtotal * coupon.discountValue) / 100
  }
  return Math.min(coupon.discountValue, subtotal)
}

export function isCouponApplicable(
  coupon: CouponConfig,
  subtotal: number,
): boolean {
  if (coupon.notApplicableMessage) return false
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return false
  return true
}

export function getUnlockMessage(
  coupon: CouponConfig,
  subtotal: number,
): string | null {
  if (coupon.notApplicableMessage) return coupon.notApplicableMessage
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    const remaining = coupon.minOrderAmount - subtotal
    return `Add more items worth ${remaining} to apply the offer`
  }
  return null
}
