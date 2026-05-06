"use client"

import { useEffect } from "react"
import { useCartStore, type Cart } from "@/lib/cart"

export function CartInit({ cart }: { cart: Cart | null }) {
  useEffect(() => {
    // Only seed from the server snapshot once. Subsequent layout re-renders
    // must not stomp on a cart that the client has already mutated.
    if (useCartStore.getState().cart === null) {
      useCartStore.setState({ cart })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
