import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ProductMedia } from "@/lib/types"

interface ProductMediaItemProps {
  media: ProductMedia
  index: number
  className?: string
}

export function ProductMediaItem({
  media,
  index,
  className,
}: ProductMediaItemProps) {
  const isFirst = index === 0

  if (media.__typename === "MediaImage") {
    const image = media.image
    if (!image) return null
    const aspectRatio =
      image.width && image.height ? image.width / image.height : null
    return (
      <div
        className={cn("relative", className)}
        style={{ aspectRatio: aspectRatio ?? "3/4" }}
      >
        <Image
          src={image.url}
          alt={image.altText || "Product image"}
          fill
          loading={isFirst ? "eager" : "lazy"}
          fetchPriority={isFirst ? "high" : "auto"}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover rounded-bl-[12px] rounded-br-[12px]"
        />
      </div>
    )
  }

  if (media.__typename === "Video") {
    const src = media.sources?.[0]?.url
    const mimeType = media.sources?.[0]?.mimeType ?? undefined
    if (!src) return null
    return (
      <video
        className={cn("aspect-square h-full w-full object-cover", className)}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={src} type={mimeType} />
      </video>
    )
  }

  if (media.__typename === "ExternalVideo") {
    const url = media.originUrl
    if (!url) return null
    return (
      <iframe
        src={url}
        title="Product video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={cn("aspect-square h-full w-full object-cover", className)}
      />
    )
  }

  return null
}
