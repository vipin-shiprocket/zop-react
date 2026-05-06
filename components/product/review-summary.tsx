"use client"

import type { TrustooRating } from "@/lib/types"
import { StarRating } from "./star-rating"

interface ReviewSummaryProps {
  rating: TrustooRating
  onWriteReview: () => void
}

const STAR_ROWS = [5, 4, 3, 2, 1] as const

export function ReviewSummary({ rating, onWriteReview }: ReviewSummaryProps) {
  const starCounts: Record<number, number> = {
    5: rating.star5Count,
    4: rating.star4Count,
    3: rating.star3Count,
    2: rating.star2Count,
    1: rating.star1Count,
  }

  const maxCount = Math.max(...Object.values(starCounts), 1)

  return (
    <div className="rounded-xl border p-5">
      <h2 className="!text-lg mb-4 text-center md:text-start">
        Customer Reviews
      </h2>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full text-center md:text-left">
        <div className="flex flex-col items-center shrink-0">
          <span className="text-4xl font-bold leading-tight">
            {rating.ratingValue.toFixed(1)}
          </span>
          <StarRating rating={Math.round(rating.ratingValue)} size="md" />
          <span className="text-sm text-muted-foreground mt-1">
            {rating.reviewCount} review{rating.reviewCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          {STAR_ROWS.map((star) => {
            const count = starCounts[star]
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-12 shrink-0 font-medium whitespace-nowrap">
                  {star} Star
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#FFA800] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onWriteReview}
          className="px-6 py-2.5 border border-foreground rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
        >
          Write A Review
        </button>
      </div>
    </div>
  )
}
