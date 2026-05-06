"use client"

import Link from "next/link"
import Image from "next/image"
import { cn, calcDiscountPercentage, formatPrice } from "@/lib/utils"
import { DiscountBadge } from "./discount-badge"
import type { ProductCardProduct } from "@/lib/types"

interface ProductCardProps {
  product: ProductCardProduct
  loading?: "eager" | "lazy"
  showVendor?: boolean
  variant?: "vertical" | "horizontal"
  className?: string
}

export function ProductCard({
  product,
  loading = "lazy",
  showVendor = true,
  variant = "vertical",
  className,
}: ProductCardProps) {
  const price = product.priceRange.minVariantPrice
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice
  const discount = compareAtPrice
    ? calcDiscountPercentage(price.amount, compareAtPrice.amount)
    : null
  const href = `/products/${product.handle}`

  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "flex gap-5 rounded-2xl bg-white p-4 shadow-sm",
          className,
        )}
      >
        <Link
          href={href}
          prefetch={false}
          className="relative w-[40%] flex-shrink-0 aspect-square"
        >
          {product.featuredImage && (
            <Image
              alt={product.featuredImage.altText || product.title}
              src={product.featuredImage.url}
              fill
              loading={loading}
              sizes="160px"
              className="rounded-[8px] object-cover"
            />
          )}
        </Link>

        <div className="flex w-[60%] flex-col overflow-hidden">
          <Link
            href={href}
            prefetch={false}
            className="block"
          >
            <h3 className="truncate text-sm font-medium">{product.title}</h3>
          </Link>

          {showVendor && product.vendor && (
            <p className="truncate text-xs text-[#939393]">{product.vendor}</p>
          )}

          <div className="mt-auto flex items-center gap-1.5">
            <span className="text-sm font-bold whitespace-nowrap">
              {formatPrice(price)}
            </span>
            {discount != null && compareAtPrice && (
              <>
                <span className="text-xs text-[#8F8F8F] line-through whitespace-nowrap">
                  {formatPrice(compareAtPrice)}
                </span>
                <DiscountBadge
                  percentage={discount}
                  className="text-[11px] py-0.5 px-1.5 shrink-0"
                />
              </>
            )}
          </div>

          <Link
            href={href}
            prefetch={false}
            className="mt-2.5 max-w-[16rem] rounded-lg px-3 py-1.5 text-sm bg-black text-center font-medium text-white hover:bg-[#333] transition-colors"
          >
            Add to Bag
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[15px] bg-white p-3 shadow-sm md:p-4",
        className,
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className="relative block aspect-square"
      >
        {product.featuredImage && (
          <Image
            alt={product.featuredImage.altText || product.title}
            src={product.featuredImage.url}
            fill
            loading={loading}
            sizes="(min-width: 768px) 280px, 60vw"
            className="rounded-[8px] object-cover"
          />
        )}
      </Link>

      <div className="mt-2 flex flex-grow flex-col">
        <Link
          href={href}
          prefetch={false}
          className="block"
        >
          <h3 className="truncate text-[15px] font-medium md:text-lg">
            {product.title}
          </h3>
        </Link>

        {showVendor && product.vendor && (
          <p className="truncate text-sm text-[#939393] mb-1">
            {product.vendor}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold whitespace-nowrap md:text-xl">
            {formatPrice(price)}
          </span>
          {discount != null && compareAtPrice && (
            <>
              <span className="text-xs text-[#8F8F8F] line-through whitespace-nowrap md:text-sm">
                {formatPrice(compareAtPrice)}
              </span>
              <DiscountBadge
                percentage={discount}
                className="text-xs shrink-0"
              />
            </>
          )}
        </div>

        <Link
          href={href}
          prefetch={false}
          className="mt-auto pt-2.5 w-full rounded-lg py-2 text-base bg-black text-center font-medium text-white hover:bg-[#333] transition-colors"
        >
          Add to Bag
        </Link>
      </div>
    </div>
  )
}
