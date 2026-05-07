import { type NextRequest, NextResponse } from "next/server"
import { shopifyClient } from "@/lib/shopify"
import { PRODUCT_BY_HANDLE_QUERY } from "@/lib/queries"
import { parseGid } from "@/lib/utils"

// Shopify REST-compatible product endpoint consumed by Fastrr checkout SDK
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params

  let result: Awaited<ReturnType<typeof shopifyClient.request>>
  try {
    result = await shopifyClient.request(PRODUCT_BY_HANDLE_QUERY, { variables: { handle } })
  } catch {
    return NextResponse.json({ product: null }, { status: 500 })
  }
  const { data, errors } = result

  if (errors) {
    return NextResponse.json({ product: null }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = (data as any)?.product
  if (!product) {
    return NextResponse.json({ product: null }, { status: 404 })
  }

  const numericProductId = parseInt(parseGid(product.id), 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = (product.variants?.nodes ?? []).map((v: any, i: number) => ({
    id: parseInt(parseGid(v.id), 10),
    product_id: numericProductId,
    title: v.title,
    price: v.price?.amount ?? "0.00",
    compare_at_price: v.compareAtPrice?.amount ?? null,
    sku: v.sku ?? "",
    available: v.availableForSale,
    option1: v.selectedOptions[0]?.value ?? null,
    option2: v.selectedOptions[1]?.value ?? null,
    option3: v.selectedOptions[2]?.value ?? null,
    options: v.selectedOptions.map((o: { name: string; value: string }) => o.value),
    position: i + 1,
  }))

  const images = (product.media?.nodes ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((m: any) => m.__typename === "MediaImage" && m.image)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any, i: number) => ({
      id: parseInt(parseGid(m.id), 10),
      product_id: numericProductId,
      src: m.image.url,
      alt: m.image.altText ?? null,
      width: m.image.width,
      height: m.image.height,
      position: i + 1,
    }))

  const restProduct = {
    id: numericProductId,
    title: product.title,
    handle: product.handle,
    body_html: product.descriptionHtml ?? "",
    vendor: product.vendor,
    product_type: product.productType ?? "",
    tags: product.tags ?? [],
    available: product.availableForSale,
    price: product.priceRange?.minVariantPrice?.amount ?? "0.00",
    price_min: product.priceRange?.minVariantPrice?.amount ?? "0.00",
    price_max: product.priceRange?.maxVariantPrice?.amount ?? "0.00",
    compare_at_price_min:
      product.compareAtPriceRange?.minVariantPrice?.amount ?? null,
    variants,
    images,
    featured_image: product.featuredImage?.url ?? null,
    options: product.options?.map(
      (o: { name: string; optionValues: { name: string }[] }, i: number) => ({
        name: o.name,
        position: i + 1,
        values: o.optionValues?.map((v) => v.name) ?? [],
      }),
    ) ?? [],
    url: `/products/${product.handle}`,
  }

  return NextResponse.json({ product: restProduct })
}
