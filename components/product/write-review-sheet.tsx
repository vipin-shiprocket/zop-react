"use client"

import {
  useState,
  useEffect,
  useSyncExternalStore,
  useTransition,
} from "react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { StarRating } from "./star-rating"

interface WriteReviewSheetProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  )
}

function ReviewForm({
  productId,
  onOpenChange,
}: {
  productId: string
  onOpenChange: (open: boolean) => void
}) {
  const [rating, setRating] = useState(0)
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!submitted) return
    const timeout = setTimeout(() => {
      onOpenChange(false)
      setRating(0)
      setAuthor("")
      setContent("")
      setSubmitted(false)
      setErrors({})
    }, 2000)
    return () => clearTimeout(timeout)
  }, [submitted, onOpenChange])

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (rating < 1) next.rating = "Please select a rating"
    if (!author.trim()) next.author = "Name is required"
    if (!content.trim()) next.content = "Review is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.set("product_id", productId)
    formData.set("rating", String(rating))
    formData.set("author", author.trim())
    formData.set("content", content.trim())

    startTransition(async () => {
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          body: formData,
        })
        const data = (await res.json()) as {
          success?: boolean
          error?: string
        }
        if (data.success) {
          setSubmitted(true)
          return
        }
        setErrors({ submit: data.error ?? "Failed to submit" })
      } catch {
        setErrors({ submit: "Failed to submit" })
      }
    })
  }

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-semibold">Thank you!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your review has been submitted and will appear shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5 !max-w-full">
      <div>
        <label className="text-sm font-medium block mb-2">Rating</label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
        {errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-author"
          className="text-sm font-medium block mb-2"
        >
          Name
        </label>
        <input
          id="review-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={120}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your name"
        />
        {errors.author && (
          <p className="text-xs text-red-500 mt-1">{errors.author}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-content"
          className="text-sm font-medium block mb-2"
        >
          Review
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={10000}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Share your experience..."
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1">{errors.content}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-sm text-red-500">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export function WriteReviewSheet({
  productId,
  open,
  onOpenChange,
}: WriteReviewSheetProps) {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Write A Review</DialogTitle>
          <DialogDescription className="sr-only">
            Share your experience with this product
          </DialogDescription>
          <ReviewForm productId={productId} onOpenChange={onOpenChange} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-2xl p-6 overflow-y-auto"
      >
        <SheetTitle>Write A Review</SheetTitle>
        <SheetDescription className="sr-only">
          Share your experience with this product
        </SheetDescription>
        <ReviewForm productId={productId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  )
}
