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
import { ArrowRight, Loader2 } from "lucide-react"
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
    const sentinelRef = useRef<HTMLDivElement>(null)
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
      const sentinel = sentinelRef.current
      if (!sentinel) return

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMoreRef.current()
        },
        { rootMargin: "300px" },
      )

      observer.observe(sentinel)
      return () => observer.disconnect()
    }, [])

    if (products.length === 0) return null

    return (
      <section className="!px-4 py-6 md:!px-0">
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
            <ArrowRight className="w-[29px] h-[15px] md:w-[40px] md:h-[40px]" />
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:scrollbar-hide md:-mx-0 md:flex-row md:snap-x md:snap-mandatory md:gap-4 md:overflow-x-auto md:px-0">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="w-full flex-shrink-0 md:w-[220px] md:snap-start"
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
              ref={sentinelRef}
              className="flex flex-shrink-0 items-center justify-center w-full md:w-[100px]"
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
