import { Suspense, cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { shopifyClient } from "@/lib/shopify"
import {
  COLLECTION_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  VENDOR_PRODUCTS_QUERY,
} from "@/lib/queries"
import { fetchProductDetail } from "@/lib/zop"
import {
  fetchProductRating,
  fetchProductReviews,
  readTrustooEnv,
} from "@/lib/trustoo"
import { parseGid } from "@/lib/utils"
import type {
  CollectionProductsQuery,
  OffersMap,
  Product,
  ProductByHandleQuery,
  TrustooRating,
  TrustooReviewsResponse,
  VendorProductsQuery,
  ZopProductDetail,
} from "@/lib/types"
import { ProductPageClient } from "@/components/product/product-page-client"
import logger from "@/lib/logger"

const log = logger.child({ module: "products/[handle]" })

const DEALS_COLLECTION_HANDLE = "lightning-deals"

const fetchProduct = cache(_fetchProduct)

async function _fetchProduct(handle: string): Promise<{
  product: Product
  offersMap: OffersMap | null
} | null> {
  try {
    const { data, errors } = await shopifyClient.request(
      PRODUCT_BY_HANDLE_QUERY,
      { variables: { handle } },
    )
    if (errors) {
      log.error({ errors, handle }, "PRODUCT_BY_HANDLE_QUERY errors")
      return null
    }
    const typed = data as ProductByHandleQuery | undefined
    if (!typed?.product?.id) return null

    let offersMap: OffersMap | null = null
    const raw = typed.shop?.offersList?.value
    if (raw) {
      try {
        offersMap = JSON.parse(raw) as OffersMap
      } catch {
        offersMap = null
      }
    }

    return { product: typed.product, offersMap }
  } catch (err) {
    log.error({ err, handle }, "PRODUCT_BY_HANDLE_QUERY failed")
    return null
  }
}

function fetchVendorProducts(
  vendor: string,
): Promise<VendorProductsQuery | null> {
  return shopifyClient
    .request(VENDOR_PRODUCTS_QUERY, {
      variables: { vendorQuery: `vendor:${vendor}` },
    })
    .then(({ data, errors }) => {
      if (errors) {
        log.error({ errors, vendor }, "VENDOR_PRODUCTS_QUERY errors")
        return null
      }
      return (data as VendorProductsQuery) ?? null
    })
    .catch((err) => {
      log.error({ err, vendor }, "VENDOR_PRODUCTS_QUERY failed")
      return null
    })
}

function fetchCollectionProducts(): Promise<CollectionProductsQuery | null> {
  return shopifyClient
    .request(COLLECTION_PRODUCTS_QUERY, {
      variables: { handle: DEALS_COLLECTION_HANDLE, cursor: null },
    })
    .then(({ data, errors }) => {
      if (errors) {
        log.error({ errors }, "COLLECTION_PRODUCTS_QUERY errors")
        return null
      }
      return (data as CollectionProductsQuery) ?? null
    })
    .catch((err) => {
      log.error({ err }, "COLLECTION_PRODUCTS_QUERY failed")
      return null
    })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const result = await fetchProduct(handle)
  const product = result?.product
  if (!product) return { title: "Product not found" }
  return {
    title: product.seo?.title ?? `Buy ${product.title}`,
    description: product.seo?.description ?? product.description ?? undefined,
    alternates: {
      canonical: `/products/${product.handle}`,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const result = await fetchProduct(handle)
  if (!result) notFound()

  const { product, offersMap } = result
  const numericId = parseGid(product.id)
  const trustooEnv = readTrustooEnv()
  const zopToken = process.env.ZOP_API_TOKEN

  const zopDataPromise: Promise<ZopProductDetail | null> = zopToken
    ? fetchProductDetail(numericId, zopToken)
    : Promise.resolve(null)

  const reviewRatingPromise: Promise<TrustooRating | null> = trustooEnv
    ? fetchProductRating(numericId, trustooEnv)
    : Promise.resolve(null)

  const reviewListPromise: Promise<TrustooReviewsResponse | null> = trustooEnv
    ? fetchProductReviews(numericId, 1, 5, trustooEnv)
    : Promise.resolve(null)

  const vendorProductsPromise = fetchVendorProducts(product.vendor)
  const collectionProductsPromise = fetchCollectionProducts()

  return (
    <Suspense fallback={null}>
      <ProductPageClient
        product={product}
        offersMap={offersMap}
        zopDataPromise={zopDataPromise}
        reviewRatingPromise={reviewRatingPromise}
        reviewListPromise={reviewListPromise}
        vendorProductsPromise={vendorProductsPromise}
        collectionProductsPromise={collectionProductsPromise}
      />
    </Suspense>
  )
}
