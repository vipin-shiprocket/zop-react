import { shopifyClient } from "@/lib/shopify"
import { CART_RECOMMENDATIONS_QUERY } from "@/lib/cart-queries"
import type { CartRecommendationProduct } from "@/lib/cart"
import type { ProductCardProduct } from "@/lib/types"

export const revalidate = 300

type RecommendationsQueryData = {
  products: { nodes: ProductCardProduct[] }
}

async function fetchByQuery(
  query: string,
): Promise<ProductCardProduct[] | null> {
  try {
    const { data, errors } = await shopifyClient.request(
      CART_RECOMMENDATIONS_QUERY,
      { variables: { query } },
    )
    if (errors) {
      console.error("CART_RECOMMENDATIONS errors", errors)
      return null
    }
    return (data as RecommendationsQueryData | undefined)?.products?.nodes ?? []
  } catch (err) {
    console.error("CART_RECOMMENDATIONS failed", err)
    return null
  }
}

export async function GET() {
  // Tag string is misspelled to match the source-of-truth tag in zop-hydrogen.
  const tagged = await fetchByQuery("tag:non-catalouge-deals")
  let products = tagged ?? null
  if (!products || products.length === 0) {
    products = await fetchByQuery("")
  }

  if (!products) {
    return Response.json({ error: "request_failed" }, { status: 502 })
  }

  const mapped: CartRecommendationProduct[] = products.map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    featuredImage: product.featuredImage,
    priceRange: product.priceRange,
    compareAtPriceRange: product.compareAtPriceRange,
    firstVariantId: product.variants?.nodes?.[0]?.id ?? "",
  }))

  return Response.json({ products: mapped })
}
