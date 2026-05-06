import { cn } from "@/lib/utils"

export function DiscountBadge({
  percentage,
  className,
}: {
  percentage: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] px-3 py-1 text-sm font-medium text-white",
        className,
      )}
      style={{
        background:
          "linear-gradient(to bottom right, #00A63E 0%, #19191F 100%), linear-gradient(to bottom left, #9AFFC0 0%, #00A63E 100%)",
        backgroundSize: "110% 200%, 140% 140%",
        backgroundPosition: "0% 0%, 100% 100%",
        backgroundRepeat: "no-repeat",
        clipPath: "polygon(0 0,100% 0,calc(100% - 12px) 50%,100% 100%,0 100%)",
        paddingRight: "1.25rem",
      }}
    >
      {percentage}% Off
    </span>
  )
}
