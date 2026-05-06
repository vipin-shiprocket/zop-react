"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LightboxImage {
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
  type?: "image" | "video"
}

interface ImageLightboxProps {
  images: LightboxImage[]
  initialIndex: number
  sourceRect: DOMRect | null
  onClose: () => void
}

function computeClipPath(rect: DOMRect): string {
  const ww = window.innerWidth
  const wh = window.innerHeight
  const top = (rect.top / wh) * 100
  const left = (rect.left / ww) * 100
  const bottom = ((wh - rect.bottom) / wh) * 100
  const right = ((ww - rect.right) / ww) * 100
  return `inset(${top}% ${right}% ${bottom}% ${left}% round 8px)`
}

const noopSubscribe = () => () => {}

export function ImageLightbox({
  images,
  initialIndex,
  sourceRect,
  onClose,
}: ImageLightboxProps) {
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)

  const pinchRef = useRef({ startDist: 0, scale: 1 })
  const lastTapRef = useRef(0)
  const closedRef = useRef(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: initialIndex,
  })

  useEffect(() => {
    if (!isMounted) return
    document.body.style.overflow = "hidden"
    const raf = requestAnimationFrame(() => {
      setIsOpen(true)
    })
    return () => {
      document.body.style.overflow = ""
      cancelAnimationFrame(raf)
    }
  }, [isMounted])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setScale(1)
    pinchRef.current.scale = 1
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit({ watchDrag: scale <= 1 })
  }, [emblaApi, scale])

  const triggerClose = useCallback(() => {
    if (closedRef.current) return
    closedRef.current = true
    setIsClosing(true)
    setIsOpen(false)
    setTimeout(() => {
      onClose()
    }, 420)
  }, [onClose])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") triggerClose()
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
      if (e.key === "ArrowRight") emblaApi?.scrollNext()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [emblaApi, triggerClose])

  function getTouchDist(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    return Math.hypot(dx, dy)
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinchRef.current.startDist = getTouchDist(e)
    }
    if (e.touches.length === 1) {
      const now = Date.now()
      if (now - lastTapRef.current < 280) {
        setScale(1)
        pinchRef.current.scale = 1
      }
      lastTapRef.current = now
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2) return
    const dist = getTouchDist(e)
    const delta = dist / pinchRef.current.startDist
    const newScale = Math.min(Math.max(pinchRef.current.scale * delta, 1), 4)
    setScale(newScale)
  }

  function handleTouchEnd() {
    pinchRef.current.scale = scale
  }

  if (!isMounted) return null

  const closedClip = sourceRect
    ? computeClipPath(sourceRect)
    : "inset(50% 50% 50% 50% round 8px)"

  const currentClip = isOpen && !isClosing ? "inset(0% 0% 0% 0%)" : closedClip
  const contentOpacity = isOpen && !isClosing ? 1 : 0

  const portal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-50"
      style={{
        clipPath: currentClip,
        transition: "clip-path 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: contentOpacity,
          transition: "opacity 300ms ease",
        }}
        onClick={triggerClose}
        aria-hidden="true"
      />

      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4"
        style={{ opacity: contentOpacity, transition: "opacity 300ms ease" }}
      >
        <button
          type="button"
          onClick={triggerClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Close image preview"
        >
          <X className="h-5 w-5" />
        </button>
        {images.length > 1 && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </span>
        )}
      </div>

      <div
        ref={emblaRef}
        className="h-full w-full overflow-hidden"
        style={{ opacity: contentOpacity, transition: "opacity 280ms ease" }}
      >
        <div className="flex h-full">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative h-full min-w-0 flex-[0_0_100%] flex items-center justify-center"
            >
              <div
                style={{
                  transform:
                    img.type !== "video"
                      ? `scale(${i === selectedIndex ? scale : 1})`
                      : undefined,
                  transition:
                    img.type !== "video" && scale === 1
                      ? "transform 200ms ease"
                      : undefined,
                  touchAction:
                    img.type !== "video" && scale > 1 ? "none" : "pan-y",
                  willChange: "transform",
                }}
                onTouchStart={
                  img.type !== "video" ? handleTouchStart : undefined
                }
                onTouchMove={
                  img.type !== "video" ? handleTouchMove : undefined
                }
                onTouchEnd={img.type !== "video" ? handleTouchEnd : undefined}
              >
                {img.type === "video" ? (
                  <video
                    src={img.url}
                    controls
                    playsInline
                    className="max-h-screen max-w-full object-contain"
                    style={{ maxHeight: "100dvh" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img.url}
                    alt={img.altText || `Image ${i + 1}`}
                    className="max-h-screen max-w-screen object-contain select-none pointer-events-none"
                    style={{ maxHeight: "100dvh" }}
                    width={img.width ?? undefined}
                    height={img.height ?? undefined}
                    draggable={false}
                    loading={Math.abs(i - initialIndex) <= 1 ? "eager" : "lazy"}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={selectedIndex === 0}
            style={{ opacity: contentOpacity, transition: "opacity 300ms ease" }}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-10",
              "hidden md:flex h-11 w-11 items-center justify-center",
              "rounded-full bg-white/10 text-white backdrop-blur-sm",
              "transition-[background-color,opacity] hover:bg-white/20",
              "disabled:pointer-events-none disabled:opacity-20",
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={selectedIndex === images.length - 1}
            style={{ opacity: contentOpacity, transition: "opacity 300ms ease" }}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-10",
              "hidden md:flex h-11 w-11 items-center justify-center",
              "rounded-full bg-white/10 text-white backdrop-blur-sm",
              "transition-[background-color,opacity] hover:bg-white/20",
              "disabled:pointer-events-none disabled:opacity-20",
            )}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  )

  return createPortal(portal, document.body)
}

export default ImageLightbox
