"use client"

import { cn } from "@/lib/utils"

const SIZES = { sm: 14, md: 20, lg: 28 } as const

function StarIcon({
  filled,
  size,
  onClick,
  interactive,
}: {
  filled: boolean
  size: number
  onClick?: () => void
  interactive?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#FFA800" : "#E0E0E0"}
      xmlns="http://www.w3.org/2000/svg"
      className={interactive ? "cursor-pointer" : undefined}
      onClick={onClick}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const px = SIZES[size]

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          filled={star <= rating}
          size={px}
          interactive={interactive}
          onClick={interactive ? () => onChange?.(star) : undefined}
        />
      ))}
    </div>
  )
}
