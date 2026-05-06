"use client"

import { Suspense, use, useMemo, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { calcDiscountPercentage, parseGid } from "@/lib/utils"
import {
  findSelectedVariant,
  readSelectedOptionsFromParams,
} from "@/lib/product-variants"
import type {
  CollectionProductsQuery,
  Money,
  OffersMap,
  Product,
  TrustooRating,
  TrustooReviewsResponse,
  VendorProductsQuery,
  ZopProductDetail,
} from "@/lib/types"
import { ProductGallery } from "./product-gallery"
import { ProductDetailsHeader, MrpInfoIcon } from "./product-details-header"
import { ProductPrice } from "./product-price"
import { DiscountBadge } from "./discount-badge"
import { ProductForm } from "./product-form"
import { addCartLines } from "@/app/cart/actions"
import { useCartStore } from "@/lib/cart"
import { FeatureBadges } from "./feature-badges"
import { PromotionalBadges } from "./promotional-badges"
import { ReviewSummary } from "./review-summary"
import { ReviewList } from "./review-list"
import { WriteReviewSheet } from "./write-review-sheet"
import { ProductInfoTabs } from "./product-info-tabs"
import { VendorProductsSection } from "./vendor-products-section"
import { CollectionProductsSection } from "./collection-products-section"
import { StickyMobileBar } from "./sticky-mobile-bar"
import { Container } from "@/components/layout/container"
import { TrendingUpIcon } from "@/components/icons/trending-up-icon"
import { FireIcon } from "@/components/icons/fire-icon"

const DEALS_COLLECTION_HANDLE = "lightning-deals"

interface ProductPageClientProps {
  product: Product
  offersMap: OffersMap | null
  zopDataPromise: Promise<ZopProductDetail | null>
  reviewRatingPromise: Promise<TrustooRating | null>
  reviewListPromise: Promise<TrustooReviewsResponse | null>
  vendorProductsPromise: Promise<VendorProductsQuery | null>
  collectionProductsPromise: Promise<CollectionProductsQuery | null>
}

export function ProductPageClient({
  product,
  offersMap,
  zopDataPromise,
  reviewRatingPromise,
  reviewListPromise,
  vendorProductsPromise,
  collectionProductsPromise,
}: ProductPageClientProps) {
  const searchParams = useSearchParams()
  const [writeReviewOpen, setWriteReviewOpen] = useState(false)
  const setCart = useCartStore((s) => s.setCart)
  const openCart = useCartStore((s) => s.open)
  const [, startTransition] = useTransition()

  const { selectedOptions, selectedVariant } = useMemo(() => {
    const fromParams = readSelectedOptionsFromParams(
      new URLSearchParams(searchParams?.toString() ?? ""),
      product,
    )
    const variant = findSelectedVariant(product, fromParams)
    const merged = { ...fromParams }
    if (variant) {
      for (const so of variant.selectedOptions) {
        if (!merged[so.name]) merged[so.name] = so.value
      }
    }
    return { selectedOptions: merged, selectedVariant: variant }
  }, [searchParams, product])

  const validCompareAtPrice: Money | null =
    selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) > 0 &&
    selectedVariant.compareAtPrice.amount !== selectedVariant?.price?.amount
      ? selectedVariant.compareAtPrice
      : null

  const discount =
    selectedVariant?.price && validCompareAtPrice
      ? calcDiscountPercentage(
          selectedVariant.price.amount,
          validCompareAtPrice.amount,
        )
      : null

  const isLimitedDeal = product.tags?.includes("free-shipping-deals") ?? false
  const numericProductId = parseGid(product.id)

  const addToCart = () => {
    if (!selectedVariant) return
    startTransition(async () => {
      const result = await addCartLines([
        { merchandiseId: selectedVariant.id, quantity: 1 },
      ])
      if (!result.cart) return
      setCart(result.cart)
      openCart()
    })
  }

  return (
    <div className="w-full pb-8">
      <Container className="flex flex-col md:grid md:grid-cols-2 md:gap-12 md:items-start">
        <div className="md:sticky md:top-0 md:self-start">
          <ProductGallery
            media={product.media.nodes}
            selectedVariant={selectedVariant}
            discount={discount}
            isLimitedDeal={isLimitedDeal}
            title={product.title}
          />
        </div>

        <div className="flex flex-col gap-3 mt-4 px-4 md:mt-0 md:px-0 md:gap-4">
          <ProductDetailsHeader
            title={product.title}
            vendor={product.vendor}
            isLimitedDeal={isLimitedDeal}
          />

          <Suspense fallback={null}>
            <ZopSoldCount promise={zopDataPromise} />
          </Suspense>

          <div className="hidden md:flex flex-wrap items-center gap-2">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={validCompareAtPrice}
            />
            {discount != null && <DiscountBadge percentage={discount} />}
            {selectedVariant?.compareAtPrice &&
              parseFloat(selectedVariant.compareAtPrice.amount) > 0 && (
                <MrpInfoIcon compareAtPrice={selectedVariant.compareAtPrice} />
              )}
          </div>

          <PromotionalBadges
            productTags={product.tags ?? []}
            offersMap={offersMap}
          />

          <div className="hidden md:block">
            <ProductForm
              product={product}
              selectedOptions={selectedOptions}
              selectedVariant={selectedVariant}
            />
          </div>

          <Suspense fallback={<FeatureBadges isLimitedDeal={isLimitedDeal} />}>
            <ZopFeatureBadges
              promise={zopDataPromise}
              isLimitedDeal={isLimitedDeal}
            />
          </Suspense>

          <Suspense fallback={null}>
            <ReviewSummaryAsync
              promise={reviewRatingPromise}
              onWriteReview={() => setWriteReviewOpen(true)}
            />
          </Suspense>

          <WriteReviewSheet
            productId={numericProductId}
            open={writeReviewOpen}
            onOpenChange={setWriteReviewOpen}
          />

          <div className="mb-8">
            <Suspense
              fallback={
                <ProductInfoTabs descriptionHtml={product.descriptionHtml} />
              }
            >
              <AccordionsAsync
                product={product}
                zopPromise={zopDataPromise}
                reviewListPromise={reviewListPromise}
              />
            </Suspense>
          </div>
        </div>
      </Container>

      <Suspense fallback={null}>
        <VendorSectionAsync
          promise={vendorProductsPromise}
          vendor={product.vendor}
          currentProductId={product.id}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CollectionSectionAsync promise={collectionProductsPromise} />
      </Suspense>

      <StickyMobileBar
        selectedVariant={selectedVariant}
        compareAtPrice={validCompareAtPrice}
        discount={discount}
        isLimitedDeal={isLimitedDeal}
        onAddToBag={addToCart}
      />
    </div>
  )
}

function ZopSoldCount({
  promise,
}: {
  promise: Promise<ZopProductDetail | null>
}) {
  const data = use(promise)
  if (!data?.soldCount) return null
  const formatted = data.soldCount.toLocaleString()
  return (
    <>
      <div
        className="hidden md:inline-flex items-center gap-3 px-[18px] py-1.5 rounded-full w-full text-[14px] font-semibold text-[#0b3b1f]"
        style={{
          background:
            "linear-gradient(90deg, #e6ffe8 0%, #fff9e0 50%, #fff 100%)",
        }}
      >
        <TrendingUpIcon className="flex-shrink-0" />
        <span>
          <span>{formatted}+</span> Units sold in last week
        </span>
      </div>
      <p className="md:hidden flex gap-1.5 !text-[12px] font-medium text-[#6D6D6D]">
        <FireIcon className="flex-shrink-0" />
        <span className="font-bold text-[#DF6E7A]">{formatted}+</span> Units
        sold in last week
      </p>
    </>
  )
}

function ZopFeatureBadges({
  promise,
  isLimitedDeal,
}: {
  promise: Promise<ZopProductDetail | null>
  isLimitedDeal: boolean
}) {
  const data = use(promise)
  return (
    <FeatureBadges
      isLimitedDeal={isLimitedDeal}
      dynamicBadges={data?.featureBadges ?? null}
    />
  )
}

function ReviewSummaryAsync({
  promise,
  onWriteReview,
}: {
  promise: Promise<TrustooRating | null>
  onWriteReview: () => void
}) {
  const rating = use(promise)
  if (!rating) return null
  return <ReviewSummary rating={rating} onWriteReview={onWriteReview} />
}

function AccordionsAsync({
  product,
  zopPromise,
  reviewListPromise,
}: {
  product: Product
  zopPromise: Promise<ZopProductDetail | null>
  reviewListPromise: Promise<TrustooReviewsResponse | null>
}) {
  const zop = use(zopPromise)
  const reviews = use(reviewListPromise)

  const manufacturedBy = product.metafields?.find(
    (m) => m?.key === "manufactured_by_address",
  )?.value
  const soldBy = product.metafields?.find(
    (m) => m?.key === "sold_by_address",
  )?.value

  return (
    <ProductInfoTabs
      descriptionHtml={product.descriptionHtml}
      keyFeatures={zop?.keyFeatures}
      shippingReturn={zop?.shippingReturn}
      materialCare={zop?.materialCare}
      manufacturedBy={manufacturedBy}
      soldBy={soldBy}
      reviewsContent={
        reviews && reviews.list.length > 0 ? (
          <ReviewList
            productId={parseGid(product.id)}
            initialReviews={reviews}
          />
        ) : undefined
      }
    />
  )
}

function VendorSectionAsync({
  promise,
  vendor,
  currentProductId,
}: {
  promise: Promise<VendorProductsQuery | null>
  vendor: string
  currentProductId: string
}) {
  const data = use(promise)
  const products = data?.products?.nodes
  if (!products?.length) return null
  return (
    <VendorProductsSection
      products={products}
      vendorName={vendor}
      currentProductId={currentProductId}
    />
  )
}

function CollectionSectionAsync({
  promise,
}: {
  promise: Promise<CollectionProductsQuery | null>
}) {
  const data = use(promise)
  const products = data?.collection?.products?.nodes
  const pageInfo = data?.collection?.products?.pageInfo
  if (!products?.length || !pageInfo) return null
  return (
    <CollectionProductsSection
      products={products}
      pageInfo={pageInfo}
      collectionHandle={DEALS_COLLECTION_HANDLE}
      collectionTitle="Our Top Deals"
    />
  )
}
