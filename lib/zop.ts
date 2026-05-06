import "server-only"
import type { ZopApiResponse, ZopProductDetail } from "./zop-types"

const ZOP_PRODUCT_DETAIL_URL =
  "https://sr-channel.shiprocket.in/v1/zop/inside/product/detail"

export async function fetchProductDetail(
  productId: string,
  apiToken: string,
): Promise<ZopProductDetail | null> {
  try {
    const response = await fetch(ZOP_PRODUCT_DETAIL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiToken,
      },
      body: JSON.stringify({ product_id: productId }),
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) {
      console.error(
        `Zop API returned ${response.status} for product ${productId}`,
      )
      return null
    }

    const json = (await response.json()) as ZopApiResponse
    const data = json?.data

    if (!data) return null

    return {
      productTags: data.product_tags ?? null,
      keyFeatures: data.key_features ?? null,
      shippingReturn: data.shipping_return ?? null,
      materialCare: data.material_care ?? null,
      soldCount: data.sold_info?.overall ?? null,
      isCustomised: data.is_customised ?? false,
      featureBadges: data.feature_badges
        ? data.feature_badges.map((b) => ({
            icon: b.icon ?? "",
            label: b.label ?? "",
            description: b.description ?? "",
          }))
        : null,
    }
  } catch (error) {
    console.error(`Zop API fetch failed for product ${productId}:`, error)
    return null
  }
}
