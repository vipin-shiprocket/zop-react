"use client"

import { useState, useTransition } from "react"
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react"
import { StarRating } from "./star-rating"
import type { TrustooReview, TrustooReviewsResponse } from "@/lib/types"

interface ReviewListProps {
  productId: string
  initialReviews: TrustooReviewsResponse | null
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function formatRelativeDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 30) return `${diffDays} days ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return "1 month ago"
  if (diffMonths < 12) return `${diffMonths} months ago`

  const diffYears = Math.floor(diffDays / 365)
  if (diffYears === 1) return "1 year ago"
  return `${diffYears} years ago`
}

function ReviewItem({ review }: { review: TrustooReview }) {
  return (
    <div className="flex gap-4 py-5">
      <div className="shrink-0 w-[140px] md:w-[180px]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
            {getInitials(review.author)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{review.author}</p>
            {review.isVerified && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BadgeCheck className="h-3 w-3 text-blue-500" />
                Verified purchase
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2">
          {formatRelativeDate(review.commentedAt)}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <StarRating rating={review.rating} size="sm" />
        <p className="text-sm mt-1.5 text-foreground/80 whitespace-pre-line">
          {review.content}
        </p>
      </div>
    </div>
  )
}

function getVisiblePages(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total)
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total)
  }

  return pages
}

function PaginationControls({
  currentPage,
  totalPage,
  onPageChange,
  disabled,
}: {
  currentPage: number
  totalPage: number
  onPageChange: (page: number) => void
  disabled: boolean
}) {
  if (totalPage <= 1) return null

  const pages = getVisiblePages(currentPage, totalPage)

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button
        type="button"
        disabled={disabled || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-md hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onPageChange(p as number)}
            className={`w-8 h-8 text-sm rounded-md ${
              p === currentPage
                ? "font-semibold bg-foreground text-background"
                : "hover:bg-accent text-muted-foreground"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={disabled || currentPage >= totalPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-md hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ReviewList({ productId, initialReviews }: ReviewListProps) {
  const [prevProductId, setPrevProductId] = useState(productId)
  const [reviews, setReviews] = useState(initialReviews)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  if (productId !== prevProductId) {
    setPrevProductId(productId)
    setReviews(initialReviews)
    setCurrentPage(1)
  }

  if (!reviews || reviews.list.length === 0) return null

  const handlePageChange = (page: number) => {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/reviews?product_id=${encodeURIComponent(productId)}&page=${page}&page_size=5`,
        )
        if (!res.ok) return
        const data = (await res.json()) as TrustooReviewsResponse
        setReviews(data)
        setCurrentPage(page)
      } catch {
        // ignore
      }
    })
  }

  return (
    <div className={isPending ? "opacity-50 transition-opacity" : ""}>
      <div className="divide-y">
        {reviews.list.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPage={reviews.page.totalPage}
        onPageChange={handlePageChange}
        disabled={isPending}
      />
    </div>
  )
}
