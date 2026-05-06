import type { OffersMap } from "@/lib/types"

interface PromotionalBadgesProps {
  productTags: string[]
  offersMap: OffersMap | null
}

function PercentDiscountIcon() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/discount_badge.svg"
      alt=""
      width={16}
      height={16}
      className="shrink-0"
    />
  )
}

export function PromotionalBadges({
  productTags,
  offersMap,
}: PromotionalBadgesProps) {
  if (!offersMap || !productTags || productTags.length === 0) return null

  let offerTitle = ""
  let offerLine1 = ""

  for (const tag of productTags) {
    const offer = offersMap[tag]
    if (offer) {
      offerTitle = offer.title
      offerLine1 = offer.line1
      break
    }
  }

  if (!offerTitle) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-[#eaeaef] w-full md:w-2/3 md:rounded-2xl max-md:rounded-xl">
      <div className="bg-[#1c1c15] px-4 py-3 text-sm font-semibold leading-tight text-[#fff19b] max-md:px-3 max-md:py-2">
        {offerTitle}
      </div>
      <div className="flex items-center gap-2.5 bg-[#fffce9] px-4 py-3 text-sm font-medium leading-snug text-[#1c1c15] max-md:gap-2 max-md:px-3 max-md:py-2">
        <PercentDiscountIcon />
        <span>{offerLine1}</span>
      </div>
    </div>
  )
}
