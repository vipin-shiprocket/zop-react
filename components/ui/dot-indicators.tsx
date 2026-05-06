import type { EmblaCarouselType } from "embla-carousel"
import { cn } from "@/lib/utils"

interface DotIndicatorsProps {
  count: number
  selectedIndex: number
  emblaApi: EmblaCarouselType | undefined
  className?: string
}

export function DotIndicators({
  count,
  selectedIndex,
  emblaApi,
  className,
}: DotIndicatorsProps) {
  const MAX_VISIBLE = 5
  const half = Math.floor(MAX_VISIBLE / 2)
  const windowStart = Math.min(
    Math.max(0, selectedIndex - half),
    Math.max(0, count - MAX_VISIBLE),
  )
  const windowEnd = Math.min(count - 1, windowStart + MAX_VISIBLE - 1)

  return (
    <div
      className={cn("flex items-center justify-center gap-1", className)}
      role="tablist"
    >
      {Array.from(
        { length: windowEnd - windowStart + 1 },
        (_, i) => windowStart + i,
      ).map((index) => {
        const distance = Math.abs(index - selectedIndex)
        const isActive = distance === 0

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "rounded-full transition-all duration-300",
              isActive
                ? "h-2 w-5 bg-foreground"
                : distance === 1
                  ? "h-2 w-2 border border-black bg-white"
                  : "h-1.5 w-1.5 border border-black bg-white",
            )}
          />
        )
      })}
    </div>
  )
}
