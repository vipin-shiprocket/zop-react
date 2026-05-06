import { parseGid } from "./utils"
import type { Cart } from "./cart"

type ShiprocketBuyDirect = (opts: {
  type: string
  products: { variantId: string; quantity: number }[]
}) => void

declare global {
  interface Window {
    shiprocketCheckoutEvents?: { buyDirect?: ShiprocketBuyDirect }
  }
}

export function goToCheckout(cart: Cart) {
  const buyDirect = window.shiprocketCheckoutEvents?.buyDirect
  if (typeof buyDirect === "function") {
    const products = (cart.lines?.nodes ?? []).map((line) => ({
      variantId: parseGid(line.merchandise.id),
      quantity: line.quantity,
    }))
    buyDirect({ type: "cart", products })
    return
  }
  if (cart.checkoutUrl) {
    window.location.href = cart.checkoutUrl
  }
}

export function goToCheckoutDirect(variantGid: string, quantity = 1) {
  const variantId = parseGid(variantGid)
  const buyDirect = window.shiprocketCheckoutEvents?.buyDirect
  if (typeof buyDirect === "function") {
    buyDirect({ type: "cart", products: [{ variantId, quantity }] })
    return
  }
  window.location.href = `/cart/${variantId}:${quantity}`
}
