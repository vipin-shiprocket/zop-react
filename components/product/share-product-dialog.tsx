"use client"

import {
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
  useCallback,
} from "react"
import { Check, Copy } from "lucide-react"
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

interface ShareProductDialogProps {
  title: string
  url: string
  imageUrl?: string
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

function FacebookSocialIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

function XSocialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3.04221 4L9.72655 12.9408L3 20.21H4.51388L10.403 13.8457L15.1612 20.21H20.313L13.2525 10.7663L19.5135 4H17.9997L12.5761 9.86141L8.19399 4H3.04221ZM5.26848 5.11552H7.63522L18.0863 19.0943H15.7196L5.26848 5.11552Z" />
    </svg>
  )
}

function PinterestSocialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.6611 3.07934C10.6273 2.79957 8.56095 3.26511 6.84363 4.38998C5.12631 5.51485 3.87398 7.22309 3.31788 9.19927C2.76179 11.1754 2.93948 13.2861 3.81815 15.1415C4.69683 16.9969 6.21713 18.4717 8.09835 19.2936C8.04748 18.6406 8.09417 17.9838 8.2369 17.3446C8.39415 16.6315 9.33848 12.7011 9.33848 12.7011C9.15043 12.2796 9.05646 11.8222 9.06308 11.3607C9.06308 10.0985 9.79152 9.15671 10.6976 9.15671C10.8604 9.15434 11.0218 9.18705 11.1708 9.25261C11.3198 9.31818 11.4529 9.41506 11.5611 9.53667C11.6694 9.65828 11.7501 9.80177 11.7979 9.95739C11.8458 10.113 11.8595 10.2771 11.8383 10.4385C11.8383 11.2035 11.347 12.3611 11.0903 13.4474C11.0396 13.6466 11.0363 13.855 11.0809 14.0557C11.1254 14.2564 11.2165 14.4438 11.3468 14.6028C11.477 14.7619 11.6428 14.8881 11.8308 14.9713C12.0188 15.0545 12.2237 15.0924 12.429 15.0819C14.0423 15.0819 15.1235 13.0156 15.1235 10.5762C15.1235 8.70622 13.885 7.30545 11.602 7.30545C11.0558 7.28423 10.5109 7.37423 10.0006 7.57001C9.49018 7.76579 9.02493 8.06325 8.63303 8.44433C8.24114 8.82542 7.93078 9.28217 7.72081 9.78687C7.51084 10.2916 7.40563 10.8337 7.41157 11.3803C7.38723 11.9866 7.58284 12.5813 7.96235 13.0547C8.03327 13.1077 8.08505 13.1822 8.10989 13.2672C8.13473 13.3521 8.13127 13.4428 8.10005 13.5256C8.06095 13.682 7.96235 14.0552 7.92326 14.192C7.91512 14.2384 7.8962 14.2823 7.86803 14.32C7.83985 14.3578 7.80319 14.3884 7.76102 14.4094C7.71885 14.4304 7.67233 14.4412 7.62521 14.441C7.5781 14.4407 7.5317 14.4294 7.48976 14.4079C6.31339 13.937 5.7592 12.6425 5.7592 11.1644C5.7592 8.74447 7.78556 5.84773 11.84 5.84773C15.0665 5.84773 17.2119 8.20813 17.2119 10.7326C17.2119 14.0552 15.3614 16.5533 12.6271 16.5533C12.2184 16.5663 11.813 16.4761 11.4484 16.291C11.0838 16.1059 10.7718 15.8318 10.5412 15.4942C10.5412 15.4942 10.0499 17.4627 9.95301 17.835C9.75521 18.4782 9.46334 19.0886 9.08688 19.6463C9.87141 19.8843 10.6865 20.0033 11.5059 19.9999C12.6224 20.0008 13.7282 19.7815 14.7598 19.3544C15.7914 18.9274 16.7287 18.3011 17.5179 17.5113C18.3071 16.7215 18.9328 15.7838 19.3591 14.7519C19.7854 13.72 20.004 12.6141 20.0023 11.4976C20.0013 9.44485 19.2576 7.46184 17.9085 5.91469C16.5595 4.36754 14.6962 3.36074 12.6628 3.08019L12.6611 3.07934Z" />
    </svg>
  )
}

function WhatsAppSocialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 308 308" className={className} fill="currentColor">
      <path d="M227.904,176.981c-0.6-0.288-23.054-11.345-27.044-12.781c-1.629-0.585-3.374-1.156-5.23-1.156c-3.032,0-5.579,1.511-7.563,4.479c-2.243,3.334-9.033,11.271-11.131,13.642c-0.274,0.313-0.648,0.687-0.872,0.687c-0.201,0-3.676-1.431-4.728-1.888c-24.087-10.463-42.37-35.624-44.877-39.867c-0.358-0.61-0.373-0.887-0.376-0.887c0.088-0.323,0.898-1.135,1.316-1.554c1.223-1.21,2.548-2.805,3.83-4.348c0.607-0.731,1.215-1.463,1.812-2.153c1.86-2.164,2.688-3.844,3.648-5.79l0.503-1.011c2.344-4.657,0.342-8.587-0.305-9.856c-0.531-1.062-10.012-23.944-11.02-26.348c-2.424-5.801-5.627-8.502-10.078-8.502c-0.413,0,0,0-1.732,0.073c-2.109,0.089-13.594,1.601-18.672,4.802c-5.385,3.395-14.495,14.217-14.495,33.249c0,17.129,10.87,33.302,15.537,39.453c0.116,0.155,0.329,0.47,0.638,0.922c17.873,26.102,40.154,45.446,62.741,54.469c21.745,8.686,32.042,9.69,37.896,9.69c0.001,0,0.001,0,0.001,0c2.46,0,4.429-0.193,6.166-0.364l1.102-0.105c7.512-0.666,24.02-9.22,27.775-19.655c2.958-8.219,3.738-17.199,1.77-20.458C233.168,179.508,230.845,178.393,227.904,176.981z" />
      <path d="M156.734,0C73.318,0,5.454,67.354,5.454,150.143c0,26.777,7.166,52.988,20.741,75.928L0.212,302.716c-0.484,1.429-0.124,3.009,0.933,4.085C1.908,307.58,2.943,308,4,308c0.405,0,0.813-0.061,1.211-0.188l79.92-25.396c21.87,11.685,46.588,17.853,71.604,17.853C240.143,300.27,308,232.923,308,150.143C308,67.354,240.143,0,156.734,0zM156.734,268.994c-23.539,0-46.338-6.797-65.936-19.657c-0.659-0.433-1.424-0.655-2.194-0.655c-0.407,0-0.815,0.062-1.212,0.188l-40.035,12.726l12.924-38.129c0.418-1.234,0.209-2.595-0.561-3.647c-14.924-20.392-22.813-44.485-22.813-69.677c0-65.543,53.754-118.867,119.826-118.867c66.064,0,119.812,53.324,119.812,118.867C276.546,215.678,222.799,268.994,156.734,268.994z" />
    </svg>
  )
}

function ShareContent({
  title,
  url,
  imageUrl,
}: Pick<ShareProductDialogProps, "title" | "url" | "imageUrl">) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }, [url])

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const socialLinks = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer.php?u=${encodedUrl}`,
      icon: <FacebookSocialIcon className="h-5 w-5" />,
    },
    {
      name: "X",
      href: `https://twitter.com/share?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <XSocialIcon className="h-5 w-5" />,
    },
    {
      name: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}${imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : ""}&description=${encodedTitle}`,
      icon: <PinterestSocialIcon className="h-5 w-5" />,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <WhatsAppSocialIcon className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 min-w-0 h-10 rounded-lg border border-border bg-muted/50 px-3 my-0 text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 h-10 rounded-lg border border-border bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  )
}

export function ShareProductDialog({
  title,
  url,
  imageUrl,
  open,
  onOpenChange,
}: ShareProductDialogProps) {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-medium">Share this product</DialogTitle>
          <DialogDescription className="sr-only">
            Share {title} via link or social media
          </DialogDescription>
          <ShareContent title={title} url={url} imageUrl={imageUrl} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-6">
        <SheetTitle className="font-medium">Share this product</SheetTitle>
        <SheetDescription className="sr-only">
          Share {title} via link or social media
        </SheetDescription>
        <div className="mt-4">
          <ShareContent title={title} url={url} imageUrl={imageUrl} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
