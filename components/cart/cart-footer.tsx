"use client"

import { ChevronUp } from "lucide-react"
import { useState } from "react"
import { goToCheckout } from "@/lib/checkout"
import { formatPrice } from "@/lib/utils"
import type { Cart } from "@/lib/cart"

export function CartFooter({ cart }: { cart: Cart }) {
  const subtotal = parseFloat(cart.cost.subtotalAmount.amount)
  const total = parseFloat(cart.cost.totalAmount.amount)
  const discount = subtotal - total
  const hasDiscount = discount > 0
  const appliedCode = cart.discountCodes.find((d) => d.applicable)?.code ?? null

  const [expanded, setExpanded] = useState(hasDiscount)
  const [prevHasDiscount, setPrevHasDiscount] = useState(hasDiscount)
  if (hasDiscount !== prevHasDiscount) {
    setPrevHasDiscount(hasDiscount)
    setExpanded(hasDiscount)
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      <div
        className="h-[25px] flex items-center justify-center rounded-t-[10px] text-center text-[14px] font-medium text-black"
        style={{
          background:
            "linear-gradient(120deg, #7CE1BD 1.09%, #FFFFFF 4.35%, #7CE1BD 7.61%)",
          backgroundSize: "200% 100%",
          padding: "2px",
          animation: "slideLeftToRight 5s infinite linear",
        }}
      >
        {hasDiscount
          ? `🎉 You're saving ${discount.toFixed(1)} 🎉!`
          : "🎉 Continue to safe checkout 🎉!"}
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-[10px] pt-3 pb-2">
            <h4 className="text-[14px] font-bold text-black mb-2">
              Bill Summary
            </h4>
            <div className="flex items-center justify-between text-[13px] text-black">
              <span>Subtotal</span>
              <span>{formatPrice(cart.cost.subtotalAmount)}</span>
            </div>
            {hasDiscount && appliedCode && (
              <div className="flex items-center justify-between text-[13px] text-green-600 mt-1.5">
                <span>Coupon Code({appliedCode})</span>
                <span>
                  -
                  {formatPrice({
                    amount: discount.toString(),
                    currencyCode: cart.cost.subtotalAmount.currencyCode,
                  })}
                </span>
              </div>
            )}
            <div className="border-t border-dashed border-gray-200 mt-2" />
          </div>
        </div>
      </div>

      <div className="flex items-center h-[70px] p-[10px] gap-4">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="flex flex-col shrink-0 text-left cursor-pointer"
        >
          <span className="text-[12px] font-normal text-[#031222] flex items-center gap-1">
            Estimated Total
            <ChevronUp
              size={14}
              className={`text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </span>
          <span className="flex items-baseline gap-1.5">
            {hasDiscount && (
              <span className="text-[13px] text-gray-400 line-through">
                {formatPrice(cart.cost.subtotalAmount)}
              </span>
            )}
            <span className="text-[16px] font-bold text-[#031222]">
              {formatPrice(cart.cost.totalAmount)}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => goToCheckout(cart)}
          className="relative flex-1 h-[50px] bg-black text-white rounded-[50px] cursor-pointer hover:bg-[#1a1a1a] transition-colors flex items-center justify-center"
        >
          <span className="text-[14px] font-bold">Buy Now</span>
        </button>
      </div>
    </div>
  )
}
