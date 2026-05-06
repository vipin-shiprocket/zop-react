"use client"

import { ChevronUp } from "lucide-react"
import { goToCheckout } from "@/lib/checkout"
import { formatPrice } from "@/lib/utils"
import type { Cart } from "@/lib/cart"

export function CartFooter({ cart }: { cart: Cart }) {
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
        🎉 Continue to safe checkout 🎉!
      </div>

      <div className="flex items-center h-[70px] p-[10px] gap-[10px]">
        <div className="flex flex-col shrink-0">
          <span className="text-[12px] font-normal text-[#031222] flex items-center gap-1">
            Estimated Total
            <ChevronUp size={14} className="text-gray-400" />
          </span>
          <span className="text-[16px] font-bold text-[#031222]">
            {formatPrice(cart.cost.subtotalAmount)}
          </span>
        </div>

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
