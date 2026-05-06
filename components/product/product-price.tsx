import type { Money } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface ProductPriceProps {
  price?: Money
  compareAtPrice?: Money | null
}

export function ProductPrice({ price, compareAtPrice }: ProductPriceProps) {
  return (
    <div aria-label="Price" role="group" className="flex items-center gap-2">
      {compareAtPrice ? (
        <>
          {price && (
            <span className="text-[24px] font-bold leading-[1.3] text-[#1C1C15] md:text-[40px] md:leading-[1.4]">
              {formatPrice(price)}
            </span>
          )}
          <s>
            <span className="text-[18px] font-normal leading-[1.3] text-[#8F8F8F] md:text-[32px] md:leading-[1.4]">
              {formatPrice(compareAtPrice)}
            </span>
          </s>
        </>
      ) : price ? (
        <span className="text-[24px] font-bold leading-[1.3] text-[#1C1C15] md:text-[40px] md:leading-[1.4]">
          {formatPrice(price)}
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  )
}
