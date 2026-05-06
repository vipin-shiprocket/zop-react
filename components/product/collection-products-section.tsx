"use client"

import {
  memo,
  useEffect,
  useRef,
  useState,
  useCallback,
  useTransition,
} from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { RightArrowIcon } from "@/components/icons/right-arrow-icon"
import { ProductCard } from "./product-card"
import type { ProductCardProduct } from "@/lib/types"

interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

interface CollectionProductsSectionProps {
  products: ProductCardProduct[]
  pageInfo: PageInfo
  collectionHandle: string
  collectionTitle: string
}

export const CollectionProductsSection = memo(
  function CollectionProductsSection({
    products: initialProducts,
    pageInfo: initialPageInfo,
    collectionHandle,
    collectionTitle,
  }: CollectionProductsSectionProps) {
    const [products, setProducts] = useState(initialProducts)
    const [pageInfo, setPageInfo] = useState(initialPageInfo)
    const mobileSentinelRef = useRef<HTMLDivElement>(null)
    const desktopSentinelRef = useRef<HTMLDivElement>(null)
    const isFetchingRef = useRef(false)
    const [isPending, startTransition] = useTransition()

    const loadMore = useCallback(() => {
      if (
        isFetchingRef.current ||
        !pageInfo.hasNextPage ||
        !pageInfo.endCursor
      )
        return
      isFetchingRef.current = true

      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/collection-products?handle=${encodeURIComponent(
              collectionHandle,
            )}&cursor=${encodeURIComponent(pageInfo.endCursor!)}`,
          )
          if (!res.ok) {
            isFetchingRef.current = false
            return
          }
          const data = (await res.json()) as {
            products: ProductCardProduct[]
            pageInfo: PageInfo
          }
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const next = data.products.filter((p) => !existingIds.has(p.id))
            return next.length > 0 ? [...prev, ...next] : prev
          })
          setPageInfo(data.pageInfo)
        } catch {
          // ignore
        } finally {
          isFetchingRef.current = false
        }
      })
    }, [pageInfo, collectionHandle])

    const loadMoreRef = useRef(loadMore)
    useEffect(() => {
      loadMoreRef.current = loadMore
    })

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) loadMoreRef.current()
        },
        { rootMargin: "300px" },
      )

      if (mobileSentinelRef.current) observer.observe(mobileSentinelRef.current)
      if (desktopSentinelRef.current) observer.observe(desktopSentinelRef.current)
      return () => observer.disconnect()
    }, [])

    if (products.length === 0) return null

    return (
      <section className="!px-4 py-6 md:!px-[70px]">
        <div className="mb-0 flex items-center justify-between py-[2.4rem] md:py-[2.4rem]">
          <h2 className="m-0 !text-[20px] md:!text-[29px] font-semibold leading-[1] text-[#1C1C15] md:font-bold md:leading-[1.2]">
            {collectionTitle}
          </h2>
          <Link
            href={`/collections/${collectionHandle}`}
            prefetch={false}
            className="mr-4 block transition-transform duration-300 hover:translate-x-[5px] md:mr-0"
            aria-label={`View all ${collectionTitle}`}
            title={`View all ${collectionTitle}`}
          >
            <RightArrowIcon />
          </Link>
        </div>

        {/* Mobile: vertical list of horizontal cards */}
        <div className="flex flex-col gap-4 md:hidden">
          {products.map((product, index) => (
            <div key={product.id} className="w-full">
              <ProductCard
                product={product}
                variant="horizontal"
                loading={index < 4 ? "eager" : "lazy"}
              />
            </div>
          ))}

          {pageInfo.hasNextPage && (
            <div
              ref={mobileSentinelRef}
              className="flex w-full items-center justify-center py-2"
            >
              {isPending && (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              )}
            </div>
          )}
        </div>

        {/* Desktop: horizontal scroll of vertical cards */}
        <div className="scrollbar-hide hidden pb-8 md:flex md:flex-row md:snap-x md:snap-mandatory md:gap-4 md:overflow-x-auto">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="w-[220px] flex-shrink-0 snap-start md:min-w-[280px]"
            >
              <ProductCard
                product={product}
                variant="vertical"
                loading={index < 4 ? "eager" : "lazy"}
              />
            </div>
          ))}

          {pageInfo.hasNextPage && (
            <div
              ref={desktopSentinelRef}
              className="flex w-[100px] flex-shrink-0 items-center justify-center"
            >
              {isPending && (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              )}
            </div>
          )}
        </div>
      </section>
    )
  },
)
