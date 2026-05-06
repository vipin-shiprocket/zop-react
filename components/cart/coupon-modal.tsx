"use client"

import { X } from "lucide-react"
import { useState } from "react"
import {
  AVAILABLE_COUPONS,
  calcCouponSavings,
  getUnlockMessage,
  isCouponApplicable,
  type CouponConfig,
} from "@/lib/coupon-config"

export function CouponModal({
  subtotal,
  isApplying,
  error,
  onApply,
  onClose,
}: {
  subtotal: number
  isApplying: boolean
  error: string | null
  onApply: (code: string) => void
  onClose: () => void
}) {
  const [input, setInput] = useState("")

  const available = AVAILABLE_COUPONS.filter((c) =>
    isCouponApplicable(c, subtotal),
  )
  const unlock = AVAILABLE_COUPONS.filter(
    (c) => !isCouponApplicable(c, subtotal),
  )

  return (
    <>
      <button
        type="button"
        aria-label="Close offers"
        onClick={onClose}
        className="absolute inset-0 z-40 bg-black/50 cursor-pointer"
      />

      <div className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl flex flex-col max-h-[70%] animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-center px-4 pt-4 pb-3 border-b border-gray-100 relative">
          <h3 className="text-[15px] font-bold text-black">Apply coupon</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200"
          >
            <X size={14} className="text-gray-600" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <CouponIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => input.trim() && onApply(input.trim())}
              disabled={!input.trim() || isApplying}
              className="h-10 px-4 text-sm font-medium text-black border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[12px] text-red-500">{error}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {available.length > 0 && (
            <div className="px-4 py-3 space-y-3">
              {available.map((coupon) => (
                <CouponCard
                  key={coupon.code}
                  coupon={coupon}
                  subtotal={subtotal}
                  isApplying={isApplying}
                  onApply={onApply}
                />
              ))}
            </div>
          )}

          {unlock.length > 0 && (
            <div className="px-4 py-3">
              <h4 className="text-[15px] font-bold text-black mb-3">
                Unlock coupons
              </h4>
              <div className="space-y-3">
                {unlock.map((coupon) => (
                  <CouponCard
                    key={coupon.code}
                    coupon={coupon}
                    subtotal={subtotal}
                    isApplying={isApplying}
                    onApply={onApply}
                    locked
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function CouponCard({
  coupon,
  subtotal,
  isApplying,
  onApply,
  locked = false,
}: {
  coupon: CouponConfig
  subtotal: number
  isApplying: boolean
  onApply: (code: string) => void
  locked?: boolean
}) {
  const savings = calcCouponSavings(coupon, subtotal)
  const unlockMsg = getUnlockMessage(coupon, subtotal)

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CouponIcon className={locked ? "text-gray-400" : "text-green-600"} />
          <span
            className={`text-[14px] font-bold ${locked ? "text-gray-400" : "text-black"}`}
          >
            {coupon.code}
          </span>
        </div>
        <button
          type="button"
          onClick={() => !locked && onApply(coupon.code)}
          disabled={isApplying || locked}
          className={`h-8 px-3 text-[13px] font-medium border rounded-lg disabled:cursor-not-allowed ${
            locked
              ? "text-gray-400 border-gray-200 bg-gray-50"
              : "text-black border-gray-300 hover:bg-gray-50 cursor-pointer"
          }`}
        >
          Apply
        </button>
      </div>

      {!locked && savings > 0 && (
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-[12px] text-green-600 bg-green-50 border border-green-200 rounded">
            Apply coupon &amp; save ₹{savings.toFixed(2)}!
          </span>
        </div>
      )}

      {locked && unlockMsg && (
        <p className="mt-2 text-[12px] text-red-500">{unlockMsg}</p>
      )}

      <p
        className={`mt-2 text-[12px] ${locked ? "text-gray-500" : "text-gray-700"}`}
      >
        {coupon.description}
      </p>
    </div>
  )
}

function CouponIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.78 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z" />
    </svg>
  )
}
