"use client"

import { useState } from "react"
import { Share2, ExternalLink, Info } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import type { Money } from "@/lib/types"
import { ShareProductDialog } from "./share-product-dialog"

function handleize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ProductDetailsHeader({
  title,
  vendor,
  isLimitedDeal,
  className,
}: {
  title: string
  vendor?: string | null
  isLimitedDeal?: boolean
  className?: string
}) {
  const [shareOpen, setShareOpen] = useState(false)

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title, url: window.location.href })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") {
            setShareOpen(true)
          }
        })
    } else {
      setShareOpen(true)
    }
  }

  return (
    <div className={cn("flex flex-col gap-1 md:gap-1.5", className)}>
      {isLimitedDeal && (
        <div className="hidden md:inline-flex w-fit items-center rounded bg-[#EE5F73] text-white h-[34px] px-3 text-sm leading-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/limited_time_deal.svg" alt="" width={12} height={17} />
          <span className="ml-2">Limited time deal</span>
        </div>
      )}

      {vendor && (
        <a
          href={`https://www.zop.in/collections/${handleize(vendor)}`}
          className="hidden md:inline-block w-fit text-[18px] font-semibold leading-[1.4] uppercase !text-[#997807] underline underline-offset-2 hover:opacity-80"
        >
          {vendor}
        </a>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="!text-[16px] md:!text-[28px] !font-semibold !leading-[1.3] !tracking-[0] text-[#1C1C15] !my-0">
          {title}
        </h1>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share product"
          className="mt-1 flex-shrink-0 rounded-full border border-[#A3A3A3] p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <ShareProductDialog
          title={title}
          url={typeof window !== "undefined" ? window.location.href : ""}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      </div>

      {vendor && (
        <a
          href={`https://www.zop.in/collections/${handleize(vendor)}`}
          className="md:hidden flex items-center gap-1 no-underline text-[14px] font-normal leading-[1] text-[#50504C] border-b border-dashed border-[#50504C] w-fit hover:opacity-70"
        >
          {vendor}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

export function MrpInfoIcon({ compareAtPrice }: { compareAtPrice: Money }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="MRP information"
        className="group relative opacity-70 hover:opacity-100 transition-opacity"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-[200px] rounded border border-black/10 bg-white p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 block w-0 h-0 border-[6px] border-transparent border-b-white" />
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#666]">MRP (incl. taxes)</span>
            <span className="font-semibold text-[#333]">
              {formatPrice(compareAtPrice)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
