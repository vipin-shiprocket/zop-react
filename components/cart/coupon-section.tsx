"use client"

import { ChevronRight } from "lucide-react"
import { useState, useTransition } from "react"
import { applyDiscountCode } from "@/app/cart/actions"
import {
  AVAILABLE_COUPONS,
  calcCouponSavings,
  isCouponApplicable,
} from "@/lib/coupon-config"
import { useCartStore, type Cart } from "@/lib/cart"
import { CouponModal } from "./coupon-modal"

export type CelebrationData = { code: string; savedAmount: number }

export function CouponSection({
  cart,
  onCelebrate,
}: {
  cart: Cart
  onCelebrate: (data: CelebrationData) => void
}) {
  const setCart = useCartStore((s) => s.setCart)
  const [modalError, setModalError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const subtotal = parseFloat(cart.cost.subtotalAmount.amount)
  const total = parseFloat(cart.cost.totalAmount.amount)
  const discountAmount = subtotal - total

  const appliedCode = cart.discountCodes.find((d) => d.applicable)?.code ?? null

  const bestSuggestion = (() => {
    if (appliedCode) return null
    const candidates = AVAILABLE_COUPONS.filter((c) =>
      isCouponApplicable(c, subtotal),
    )
    if (candidates.length === 0) return null
    return candidates.reduce((best, c) =>
      calcCouponSavings(c, subtotal) > calcCouponSavings(best, subtotal)
        ? c
        : best,
    )
  })()

  const applyConfigCoupon = (code: string): boolean => {
    const match = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase(),
    )
    if (!match || !isCouponApplicable(match, subtotal)) return false

    const saved = calcCouponSavings(match, subtotal)
    const newTotal = Math.max(0, subtotal - saved)
    const currency = cart.cost.subtotalAmount.currencyCode

    setCart({
      ...cart,
      cost: {
        ...cart.cost,
        totalAmount: { amount: newTotal.toString(), currencyCode: currency },
      },
      discountCodes: [{ code: match.code, applicable: true }],
    })
    setShowModal(false)
    onCelebrate({ code: match.code, savedAmount: saved })
    return true
  }

  const apply = (code: string) => {
    setModalError(null)
    if (applyConfigCoupon(code)) return

    startTransition(async () => {
      const result = await applyDiscountCode([code])
      if (result.cart) {
        setCart(result.cart)
        const applied = result.cart.discountCodes.find(
          (d) => d.code.toUpperCase() === code.toUpperCase(),
        )
        if (applied?.applicable) {
          const newSubtotal = parseFloat(result.cart.cost.subtotalAmount.amount)
          const newTotal = parseFloat(result.cart.cost.totalAmount.amount)
          const saved = newSubtotal - newTotal
          setShowModal(false)
          onCelebrate({ code: applied.code, savedAmount: saved })
        } else {
          setModalError("Please enter a valid coupon code.")
        }
      } else {
        setModalError("Please enter a valid coupon code.")
      }
    })
  }

  const isConfigCoupon = (code: string) =>
    AVAILABLE_COUPONS.some((c) => c.code.toUpperCase() === code.toUpperCase())

  const remove = () => {
    if (appliedCode && isConfigCoupon(appliedCode)) {
      setCart({
        ...cart,
        cost: {
          ...cart.cost,
          totalAmount: cart.cost.subtotalAmount,
        },
        discountCodes: [],
      })
      return
    }
    startTransition(async () => {
      const result = await applyDiscountCode([])
      if (result.cart) setCart(result.cart)
    })
  }

  const openModal = () => {
    setModalError(null)
    setShowModal(true)
  }

  if (appliedCode && discountAmount > 0) {
    return (
      <div className="mx-[10px] mt-3 px-3 py-3 border border-gray-200 rounded-[10px] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <CouponBadge />
          <p className="text-[13px] text-black truncate">
            <span className="font-bold text-green-600">
              ₹{discountAmount.toFixed(2)} saved
            </span>{" "}
            with <span className="font-bold">{appliedCode}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className="text-[13px] font-medium text-black underline cursor-pointer disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mx-[10px] mt-3 border border-gray-200 rounded-[10px] bg-white overflow-hidden">
        {bestSuggestion ? (
          <>
            <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-dashed border-gray-200">
              <div className="flex items-center gap-2 min-w-0">
                <CouponBadge />
                <p className="text-[13px] text-black truncate">
                  <span className="text-green-600 font-medium">
                    Save ₹
                    {calcCouponSavings(bestSuggestion, subtotal).toFixed(1)}
                  </span>{" "}
                  <span className="ml-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[12px] font-medium">
                    {bestSuggestion.code}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => apply(bestSuggestion.code)}
                disabled={isPending}
                className="shrink-0 h-8 px-3 text-[13px] font-medium text-black border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <button
                type="button"
                onClick={openModal}
                className="text-xs text-gray-500 underline cursor-pointer"
              >
                Enter a coupon
              </button>
              <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-0.5 text-xs text-gray-600 cursor-pointer hover:text-black"
              >
                +{AVAILABLE_COUPONS.length} offer(s) available
                <ChevronRight size={14} className="text-gray-400" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between px-3 py-3">
            <button
              type="button"
              onClick={openModal}
              className="text-[13px] text-black font-medium underline cursor-pointer"
            >
              Enter a coupon
            </button>
            <button
              type="button"
              onClick={openModal}
              className="flex items-center gap-0.5 text-xs text-gray-600 cursor-pointer hover:text-black"
            >
              +{AVAILABLE_COUPONS.length} offer(s) available
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <CouponModal
          subtotal={subtotal}
          isApplying={isPending}
          error={modalError}
          onApply={apply}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

function CouponBadge() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#16a34a"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9a2 2 0 0 0 2.83 0l7-7a2 2 0 0 0 0-2.84zM7 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
    </svg>
  )
}
