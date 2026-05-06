"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/cart"
import { CartLineItem } from "./cart-line-item"
import { CartFooter } from "./cart-footer"
import { CartRecommendations } from "./cart-recommendations"
import { CouponSection, type CelebrationData } from "./coupon-section"
import { CouponCelebration } from "./coupon-celebration"

const PROMOS = [
  "Get EXTRA 10% Off Using Shipcoins",
  "Free Shipping on Orders Above ₹499",
  "Use Code WELCOME for 15% Off",
]

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const cart = useCartStore((s) => s.cart)
  const [celebration, setCelebration] = useState<CelebrationData | null>(null)

  const lines = cart?.lines.nodes ?? []
  const hasItems = lines.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        showClose={false}
        className="!w-full lg:!w-[420px] !max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
        <SheetDescription className="sr-only">
          Your shopping cart contents
        </SheetDescription>

        <div className="flex flex-col h-full relative">
          <DrawerHeader
            totalQuantity={cart?.totalQuantity ?? 0}
            onClose={close}
          />
          <PromoBanner />

          <div className="flex-1 overflow-y-auto">
            {hasItems ? (
              <>
                <div className="flex flex-col bg-[#F4F4F5] mx-[10px] mt-3 rounded-[10px]">
                  <div className="max-h-[330px] overflow-y-auto">
                    {lines.map((line) => (
                      <CartLineItem key={line.id} line={line} />
                    ))}
                  </div>
                </div>
                {cart && (
                  <CouponSection cart={cart} onCelebrate={setCelebration} />
                )}
                <CartRecommendations />
              </>
            ) : (
              <EmptyState onClose={close} />
            )}
          </div>

          {hasItems && cart && <CartFooter cart={cart} />}

          {celebration && (
            <CouponCelebration
              code={celebration.code}
              savedAmount={celebration.savedAmount}
              onDone={() => setCelebration(null)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DrawerHeader({
  totalQuantity,
  onClose,
}: {
  totalQuantity: number
  onClose: () => void
}) {
  return (
    <div className="flex items-center gap-1 px-4 py-[1px] border-b border-gray-200">
      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center w-8 h-8 -ml-2 cursor-pointer"
        aria-label="Close cart"
      >
        <ChevronLeft size={20} className="text-black" />
      </button>
      <span className="text-[15px] font-semibold text-black">
        Shopping Cart ({totalQuantity})
      </span>
    </div>
  )
}

function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-[25px] bg-black overflow-hidden relative">
      <div
        className="absolute inset-0 flex items-center transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {PROMOS.map((promo, i) => (
          <span
            key={i}
            className="w-full shrink-0 text-center text-[11px] font-medium text-white"
          >
            {promo}
          </span>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="relative mb-8">
        <span className="absolute -top-4 left-4 text-gray-400 text-xl font-light select-none">+</span>
        <span className="absolute top-0 right-2 text-gray-300 text-xs select-none">•</span>
        <span className="absolute top-2 -right-4 text-gray-300 text-sm select-none">○</span>
        <span className="absolute -bottom-2 left-0 text-gray-400 text-xl font-light select-none">+</span>
        <span className="absolute bottom-2 right-6 text-gray-300 text-xs select-none">•</span>
        <span className="absolute -top-6 right-8 text-gray-300 text-base select-none">−</span>
        <div className="absolute inset-0 bg-gray-100 rounded-full scale-110 -z-10" />
        <svg
          width="140"
          height="120"
          viewBox="0 0 140 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <path
            d="M28 20H112L100 78H40L28 20Z"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="white"
          />
          <path
            d="M18 12H32L28 20"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="58" cy="48" r="3" fill="#1a1a1a" />
          <circle cx="82" cy="48" r="3" fill="#1a1a1a" />
          <path
            d="M62 64 Q70 58 78 64"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="50" cy="92" r="9" stroke="#1a1a1a" strokeWidth="3" fill="white" />
          <circle cx="90" cy="92" r="9" stroke="#1a1a1a" strokeWidth="3" fill="white" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Oops! Your cart is empty!
      </h2>
      <p className="text-gray-400 max-w-75 text-[14px] mb-8 leading-snug">
        There is nothing in your cart lets add some items.
      </p>

      <Link
        href="/"
        onClick={onClose}
        className="w-full max-w-[300px] mt-4 bg-black text-white text-base font-medium py-4 rounded-2xl text-center block"
      >
        Shop Now
      </Link>
    </div>
  )
}
