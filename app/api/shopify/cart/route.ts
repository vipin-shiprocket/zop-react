import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { shopifyClient } from "@/lib/shopify"
import { CART_QUERY } from "@/lib/cart-queries"
import { parseGid } from "@/lib/utils"

const CART_ID_KEY = "cart_id"

// Shopify REST-compatible cart endpoint consumed by Fastrr checkout SDK
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_ID_KEY)?.value ?? null

  if (!cartId) {
    return NextResponse.json(emptyCart())
  }

  let result: Awaited<ReturnType<typeof shopifyClient.request>>
  try {
    result = await shopifyClient.request(CART_QUERY, { variables: { cartId } })
  } catch {
    return NextResponse.json(emptyCart())
  }
  const { data, errors } = result

  if (errors) {
    return NextResponse.json(emptyCart())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cart = (data as any)?.cart
  if (!cart) {
    return NextResponse.json(emptyCart())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = cart.lines.nodes.map((line: any) => {
    const v = line.merchandise
    // Use actual per-unit cart cost (reflects discounts), not catalogue price
    const unitPrice = Math.round(
      parseFloat(line.cost?.amountPerQuantity?.amount ?? v.price?.amount ?? "0") * 100,
    )
    return {
      id: parseInt(parseGid(line.id), 10),
      quantity: line.quantity,
      variant_id: parseInt(parseGid(v.id), 10),
      product_id: parseInt(parseGid(v.product?.id ?? ""), 10) || 0,
      title: v.product?.title ?? "",
      variant_title: v.title,
      price: unitPrice,
      line_price: unitPrice * line.quantity,
      sku: v.sku ?? "",
      image: v.image?.url ?? null,
      handle: v.product?.handle ?? "",
      url: `/products/${v.product?.handle ?? ""}`,
    }
  })

  const totalPrice = Math.round(
    parseFloat(cart.cost?.totalAmount?.amount ?? "0") * 100,
  )
  const subtotalPrice = Math.round(
    parseFloat(cart.cost?.subtotalAmount?.amount ?? "0") * 100,
  )
  const currency = cart.cost?.totalAmount?.currencyCode ?? "INR"

  return NextResponse.json({
    token: parseGid(cart.id),
    note: "",
    attributes: {},
    original_total_price: subtotalPrice,
    total_price: totalPrice,
    total_discount: Math.max(0, subtotalPrice - totalPrice),
    total_weight: 0,
    item_count: cart.totalQuantity ?? 0,
    items,
    requires_shipping: true,
    currency,
    items_subtotal_price: subtotalPrice,
    cart_level_discount_applications: [],
  })
}

function emptyCart() {
  return {
    token: "",
    note: "",
    attributes: {},
    original_total_price: 0,
    total_price: 0,
    total_discount: 0,
    total_weight: 0,
    item_count: 0,
    items: [],
    requires_shipping: false,
    currency: "INR",
    items_subtotal_price: 0,
    cart_level_discount_applications: [],
  }
}
