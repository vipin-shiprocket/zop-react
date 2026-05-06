"use client"

import { cn, formatPrice } from "@/lib/utils"
import type { Money, ProductVariant } from "@/lib/types"
import { DiscountBadge } from "./discount-badge"

interface StickyMobileBarProps {
  selectedVariant: ProductVariant | null
  compareAtPrice: Money | null
  discount?: number | null
  isLimitedDeal?: boolean
}

export function StickyMobileBar({
  selectedVariant,
  compareAtPrice,
  discount,
  isLimitedDeal,
}: StickyMobileBarProps) {
  const isAvailable = !!selectedVariant?.availableForSale

  return (
    <div className="fixed bottom-0 inset-x-0 z-10 bg-white shadow-[0px_-4px_16px_0px_#0000001F] min-h-[78px] px-4 py-2 flex items-center justify-between gap-4 md:hidden">
      <div className="flex flex-col min-w-0 gap-1">
        <div className="flex items-center gap-[5px]">
          {selectedVariant?.price && (
            <span className="text-base font-bold leading-[1.4] text-[#1C1C15]">
              {formatPrice(selectedVariant.price)}
            </span>
          )}
          {compareAtPrice && (
            <span className="text-xs text-[#8F8F8F] line-through leading-[21px]">
              {formatPrice(compareAtPrice)}
            </span>
          )}
          {discount != null && (
            <DiscountBadge
              percentage={discount}
              className="rounded-[4px] px-[5px] py-0.5 pr-[1.7rem]"
            />
          )}
        </div>
        {isLimitedDeal && (
          <div
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs"
            style={{
              background:
                "linear-gradient(90deg, #F3EBB9, rgba(243,235,185,0) 103.38%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/discount_badge.svg"
              alt=""
              width={12}
              height={12}
            />
            <span className="text-xs font-normal text-[#1C1C15]">
              Free Shipping
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!isAvailable}
        onClick={() => {}}
        className={cn(
          "inline-flex items-center justify-center bg-black w-[9rem] text-white rounded-lg h-12 px-4 text-sm font-medium whitespace-nowrap",
          !isAvailable && "cursor-not-allowed opacity-50",
        )}
      >
        {isAvailable ? "Add To Bag" : "Sold out"}
      </button>
    </div>
  )
}
