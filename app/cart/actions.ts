"use server"

import { cookies } from "next/headers"
import { shopifyClient } from "@/lib/shopify"
import {
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/cart-queries"
import type { Cart, CartActionResult, CartUserError } from "@/lib/cart"

const CART_ID_KEY = "cart_id"
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 10 // 10 days — Shopify cart inactivity expiry

async function readCartId(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_ID_KEY)?.value ?? null
}

async function writeCartId(id: string): Promise<void> {
  const store = await cookies()
  store.set(CART_ID_KEY, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  })
}

async function clearCartId(): Promise<void> {
  const store = await cookies()
  store.delete(CART_ID_KEY)
}

type ShopifyCartMutationResponse = {
  cart: Cart | null
  userErrors: CartUserError[]
}

function unwrap<K extends string>(
  data: Record<string, ShopifyCartMutationResponse> | undefined,
  key: K,
): CartActionResult {
  const payload = data?.[key]
  return {
    cart: payload?.cart ?? null,
    userErrors: payload?.userErrors ?? [],
  }
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await readCartId()
  if (!cartId) return null
  try {
    const { data, errors } = await shopifyClient.request(CART_QUERY, {
      variables: { cartId },
    })
    if (errors) {
      console.error("CART_QUERY errors", errors)
      return null
    }
    const cart = (data as { cart: Cart | null } | undefined)?.cart ?? null
    if (!cart) {
      // Cookie points at an expired/missing cart — clear it so future requests start fresh.
      await clearCartId()
    }
    return cart
  } catch (err) {
    console.error("CART_QUERY failed", err)
    return null
  }
}

type LineInput = { merchandiseId: string; quantity: number }

export async function addCartLines(
  lines: LineInput[],
): Promise<CartActionResult> {
  const cartId = await readCartId()

  if (!cartId) {
    const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION, {
      variables: { input: { lines } },
    })
    if (errors) {
      console.error("CART_CREATE errors", errors)
      return { cart: null, userErrors: [{ message: "Failed to create cart" }] }
    }
    const result = unwrap(
      data as Record<string, ShopifyCartMutationResponse>,
      "cartCreate",
    )

    // Concurrent-create guard: another request may have written a cart_id
    // between our readCartId() and now. If so, prefer the concurrent cart
    // (it may already have other items the user added) and fold these lines
    // into it. The cookie already points at concurrentId — don't overwrite.
    const concurrentId = await readCartId()
    if (concurrentId && result.cart && concurrentId !== result.cart.id) {
      const merge = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
        variables: { cartId: concurrentId, lines },
      })
      if (merge.errors) {
        console.error("CART_LINES_ADD merge errors", merge.errors)
        return {
          cart: null,
          userErrors: [{ message: "Failed to add to cart" }],
        }
      }
      return unwrap(
        merge.data as Record<string, ShopifyCartMutationResponse>,
        "cartLinesAdd",
      )
    }

    if (result.cart) {
      await writeCartId(result.cart.id)
    }
    return result
  }

  const { data, errors } = await shopifyClient.request(
    CART_LINES_ADD_MUTATION,
    { variables: { cartId, lines } },
  )
  if (errors) {
    console.error("CART_LINES_ADD errors", errors)
    return { cart: null, userErrors: [{ message: "Failed to add to cart" }] }
  }
  return unwrap(
    data as Record<string, ShopifyCartMutationResponse>,
    "cartLinesAdd",
  )
}

export async function updateCartLines(
  lines: { id: string; quantity: number }[],
): Promise<CartActionResult> {
  const cartId = await readCartId()
  if (!cartId) return { cart: null, userErrors: [{ message: "No cart" }] }

  const { data, errors } = await shopifyClient.request(
    CART_LINES_UPDATE_MUTATION,
    { variables: { cartId, lines } },
  )
  if (errors) {
    console.error("CART_LINES_UPDATE errors", errors)
    return { cart: null, userErrors: [{ message: "Failed to update cart" }] }
  }
  return unwrap(
    data as Record<string, ShopifyCartMutationResponse>,
    "cartLinesUpdate",
  )
}

export async function removeCartLines(
  lineIds: string[],
): Promise<CartActionResult> {
  const cartId = await readCartId()
  if (!cartId) return { cart: null, userErrors: [{ message: "No cart" }] }

  const { data, errors } = await shopifyClient.request(
    CART_LINES_REMOVE_MUTATION,
    { variables: { cartId, lineIds } },
  )
  if (errors) {
    console.error("CART_LINES_REMOVE errors", errors)
    return {
      cart: null,
      userErrors: [{ message: "Failed to remove from cart" }],
    }
  }
  return unwrap(
    data as Record<string, ShopifyCartMutationResponse>,
    "cartLinesRemove",
  )
}

export async function applyDiscountCode(
  discountCodes: string[],
): Promise<CartActionResult> {
  const cartId = await readCartId()
  if (!cartId) return { cart: null, userErrors: [{ message: "No cart" }] }

  const { data, errors } = await shopifyClient.request(
    CART_DISCOUNT_CODES_UPDATE_MUTATION,
    { variables: { cartId, discountCodes } },
  )
  if (errors) {
    console.error("CART_DISCOUNT_CODES_UPDATE errors", errors)
    return {
      cart: null,
      userErrors: [{ message: "Failed to apply discount" }],
    }
  }
  return unwrap(
    data as Record<string, ShopifyCartMutationResponse>,
    "cartDiscountCodesUpdate",
  )
}
