import { cn } from "@/lib/utils"

interface FeatureBadgesProps {
  isLimitedDeal?: boolean
  dynamicBadges?: Array<{ icon: string; label: string; description: string }> | null
}

const STATIC_BADGES = [
  {
    key: "genuine",
    icon: "https://www.zop.in/cdn/shop/files/genuine_product_5e410a23-c7e2-4304-8777-8086d5b54122_small.png?format=webp",
    text: "100% Genuine",
    always: true,
  },
  {
    key: "free-shipping",
    icon: "https://www.zop.in/cdn/shop/files/free_shipping_01_small.png?format=webp",
    text: "Free Shipping",
    always: false,
  },
  {
    key: "delivery",
    icon: "https://www.zop.in/cdn/shop/files/7-10daysShipping_small.png?format=webp",
    text: "7-10 Days Delivery",
    always: true,
  },
]

export function FeatureBadges({
  isLimitedDeal,
  dynamicBadges,
}: FeatureBadgesProps) {
  const staticBadges = STATIC_BADGES.filter((b) => b.always || isLimitedDeal)
  const allBadges = [
    ...staticBadges.map((b) => ({ key: b.key, icon: b.icon, text: b.text })),
    ...(dynamicBadges?.map((b, i) => ({
      key: `dyn-${i}`,
      icon: b.icon,
      text: b.label,
    })) ?? []),
  ]

  if (allBadges.length === 0) return null

  return (
    <div
      className={cn(
        "grid gap-3 my-6",
        allBadges.length === 3 && "grid-cols-3 max-[500px]:grid-cols-3",
        allBadges.length === 2 && "grid-cols-2",
        allBadges.length === 4 &&
          "grid-cols-[repeat(auto-fit,minmax(140px,1fr))] max-[500px]:grid-cols-2",
        ![2, 3, 4].includes(allBadges.length) &&
          "grid-cols-[repeat(auto-fit,minmax(140px,1fr))]",
      )}
    >
      {allBadges.map((badge) => (
        <div
          key={badge.key}
          className="grid grid-rows-[auto_auto] justify-items-center items-center gap-3 rounded-lg bg-[#FAFAFA] border border-[#FAFAFA] p-2.5 min-h-[100px]"
        >
          <div className="h-[60px] w-[60px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badge.icon}
              alt={badge.text}
              width={60}
              height={60}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-center text-xs font-bold leading-snug text-black/50 break-words">
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  )
}
