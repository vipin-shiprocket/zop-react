"use client"

import { memo, useMemo } from "react"
import { RightArrowIcon } from "@/components/icons/right-arrow-icon"
import { ProductCard } from "./product-card"
import type { ProductCardProduct } from "@/lib/types"

interface VendorProductsSectionProps {
  products: ProductCardProduct[]
  vendorName: string
  currentProductId: string
}

export const VendorProductsSection = memo(function VendorProductsSection({
  products,
  vendorName,
  currentProductId,
}: VendorProductsSectionProps) {
  const filtered = useMemo(
    () => products.filter((p) => p.id !== currentProductId),
    [products, currentProductId],
  )

  if (filtered.length === 0) return null

  return (
    <section className="!px-4 py-6 md:!px-[70px] bg-[#f8f8f8] mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="!text-[20px] md:!text-[29px] font-semibold">
          More from {vendorName}
        </h2>
        <a
          href={`https://www.zop.in/collections/${encodeURIComponent(vendorName)}`}
          className="mr-4 block transition-transform duration-300 hover:translate-x-[5px] md:mr-0"
          aria-label="View all products"
          title="View all products"
        >
          <RightArrowIcon />
        </a>
      </div>

      <div className="scrollbar-hide -mx-4 flex pb-8 snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        {filtered.map((product, index) => (
          <div
            key={product.id}
            className="w-[60vw] flex-shrink-0 snap-start md:min-w-[280px] md:w-auto md:flex-1"
          >
            <ProductCard
              product={product}
              loading={index < 4 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </section>
  )
})
