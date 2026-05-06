"use client"

import {
  memo,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaCarouselType } from "embla-carousel"
import Image from "next/image"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductMedia, ProductVariant } from "@/lib/types"
import { ProductMediaItem } from "./product-media-item"
import { GalleryDiscountBadge } from "./gallery-discount-badge"
import { ShareIcon } from "@/components/icons/share-icon"
import { ShareProductDialog } from "./share-product-dialog"
import type { LightboxImage } from "@/components/ui/image-lightbox"

const ImageLightbox = lazy(() =>
  import("@/components/ui/image-lightbox").then((m) => ({
    default: m.ImageLightbox,
  })),
)

const galleryNoopSubscribe = () => () => {}

interface ProductGalleryProps {
  media: ProductMedia[]
  selectedVariant?: ProductVariant | null
  discount?: number | null
  isLimitedDeal?: boolean
  title?: string
  className?: string
}

export const ProductGallery = memo(function ProductGallery({
  media,
  selectedVariant,
  discount,
  isLimitedDeal,
  title,
  className,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const shareUrl = useSyncExternalStore(
    galleryNoopSubscribe,
    () => window.location.href,
    () => "",
  )

  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      media
        .map((m) => {
          if (m.__typename === "MediaImage" && m.image) {
            return m.image satisfies LightboxImage
          }
          if (m.__typename === "Video") {
            const src = m.sources?.[0]?.url
            if (src)
              return { url: src, type: "video" as const } satisfies LightboxImage
          }
          return null
        })
        .filter((img): img is LightboxImage => img !== null),
    [media],
  )

  const [mainRef, mainApi] = useEmblaCarousel({ loop: false, align: "start" })
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const onSelect = useCallback(() => {
    if (!mainApi) return
    const index = mainApi.selectedScrollSnap()
    setSelectedIndex(index)
    if (thumbApi) thumbApi.scrollTo(index)
  }, [mainApi, thumbApi])

  useEffect(() => {
    if (!mainApi) return
    mainApi.on("select", onSelect)
    return () => {
      mainApi.off("select", onSelect)
    }
  }, [mainApi, onSelect])

  useEffect(() => {
    if (!mainApi || !selectedVariant?.image?.id) return
    const variantImageId = selectedVariant.image.id
    const index = media.findIndex(
      (m) => m.__typename === "MediaImage" && m.image?.id === variantImageId,
    )
    if (index !== -1 && index !== mainApi.selectedScrollSnap()) {
      mainApi.scrollTo(index)
    }
  }, [mainApi, selectedVariant?.image?.id, media])

  const handleThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return
      mainApi.scrollTo(index)
    },
    [mainApi],
  )

  if (!media.length) return null

  const firstImageUrl =
    media[0]?.__typename === "MediaImage" ? media[0].image?.url : undefined

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative">
        {discount != null && discount > 0 && (
          <GalleryDiscountBadge percentage={discount} />
        )}
        {isLimitedDeal && (
          <div
            className="absolute top-0 left-0 z-[2] whitespace-nowrap rounded-tl-0 bg-gradient-to-r from-[#FFF4ED] to-[#FFCCBA] px-3 py-2 pr-6 text-[13px] font-semibold leading-4 text-[#FF4558] md:hidden"
            style={{
              clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
            }}
          >
            Deal ends soon
          </div>
        )}

        <button
          type="button"
          aria-label="Share product"
          onClick={() => setShareOpen(true)}
          className="absolute top-3 right-3 z-[3] hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all hover:bg-white hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
        >
          <ShareIcon />
        </button>
        <ShareProductDialog
          title={title ?? ""}
          url={shareUrl}
          imageUrl={firstImageUrl}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />

        <div className="w-full">
          <div className="overflow-hidden rounded-none md:rounded-lg" ref={mainRef}>
            <div className="flex touch-pan-y">
              {media.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className={cn(
                    "relative min-w-0 flex-[0_0_100%]",
                    (item.__typename === "MediaImage" ||
                      item.__typename === "Video") &&
                      "cursor-pointer",
                  )}
                  onClick={
                    item.__typename === "MediaImage" ||
                    item.__typename === "Video"
                      ? (e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setSourceRect(rect)
                          const itemUrl =
                            item.__typename === "MediaImage"
                              ? item.image?.url
                              : item.sources?.[0]?.url
                          setLightboxIndex(
                            lightboxImages.findIndex(
                              (img) => img.url === itemUrl,
                            ),
                          )
                          setLightboxOpen(true)
                        }
                      : undefined
                  }
                >
                  <ProductMediaItem media={item} index={index} />
                </div>
              ))}
            </div>
          </div>

          {media.length > 1 && (
            <DotIndicators
              count={media.length}
              selectedIndex={selectedIndex}
              mainApi={mainApi}
            />
          )}
        </div>

        {media.length > 1 && (
          <div className="mt-3 hidden md:block">
            <div className="overflow-hidden" ref={thumbRef}>
              <div className="flex gap-2">
                {media.map((item, index) => (
                  <ThumbButton
                    key={item.id ?? index}
                    media={item}
                    isSelected={index === selectedIndex}
                    onClick={() => handleThumbClick(index)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && lightboxImages.length > 0 && (
        <Suspense fallback={null}>
          <ImageLightbox
            images={lightboxImages}
            initialIndex={Math.max(0, lightboxIndex)}
            sourceRect={sourceRect}
            onClose={() => setLightboxOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
})

function ThumbButton({
  media,
  isSelected,
  onClick,
  index,
}: {
  media: ProductMedia
  isSelected: boolean
  onClick: () => void
  index: number
}) {
  const thumbnailImage =
    media.__typename === "MediaImage" ? media.image : null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View product image ${index + 1}`}
      className={cn(
        "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
        isSelected ? "border-foreground" : "border-transparent opacity-70",
      )}
    >
      {thumbnailImage ? (
        <Image
          alt={
            thumbnailImage.altText || `Product thumbnail ${index + 1}`
          }
          src={thumbnailImage.url}
          fill
          loading="lazy"
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Play className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </button>
  )
}

function DotIndicators({
  count,
  selectedIndex,
  mainApi,
}: {
  count: number
  selectedIndex: number
  mainApi: EmblaCarouselType | undefined
}) {
  return (
    <div
      className="mt-3 flex items-center justify-center gap-1 md:hidden"
      role="tablist"
    >
      {Array.from({ length: count }).map((_, index) => {
        const distance = Math.abs(index - selectedIndex)
        const isActive = distance === 0
        const isAdjacent = distance === 1

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to image ${index + 1}`}
            onClick={() => mainApi?.scrollTo(index)}
            className={cn(
              "rounded-full transition-all duration-300",
              isActive
                ? "h-2.5 w-5 bg-foreground"
                : isAdjacent
                  ? "h-2.5 w-2.5 border border-foreground bg-transparent"
                  : "h-2 w-2 border border-foreground/60 bg-transparent",
            )}
          />
        )
      })}
    </div>
  )
}
