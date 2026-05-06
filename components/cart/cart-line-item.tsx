"use client"

import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore, type CartLine } from "@/lib/cart"
import { removeCartLines, updateCartLines } from "@/app/cart/actions"
import { formatPrice } from "@/lib/utils"

function lineItemUrl(
  handle: string,
  selectedOptions: { name: string; value: string }[],
): string {
  const params = new URLSearchParams()
  for (const opt of selectedOptions) {
    if (opt.value && opt.value !== "Default Title") {
      params.set(opt.name, opt.value)
    }
  }
  const qs = params.toString()
  return qs ? `/products/${handle}?${qs}` : `/products/${handle}`
}

export function CartLineItem({ line }: { line: CartLine }) {
  const { id, merchandise, quantity, cost } = line
  const { product, title, image, selectedOptions } = merchandise
  const close = useCartStore((s) => s.close)
  const setCart = useCartStore((s) => s.setCart)
  const [isPending, startTransition] = useTransition()

  const variantLabel = selectedOptions
    .map((opt) => opt.value)
    .filter((v) => v !== "Default Title")
    .join(" / ")

  const url = lineItemUrl(product.handle, selectedOptions)

  const updateQuantity = (next: number) => {
    startTransition(async () => {
      const result = await updateCartLines([{ id, quantity: next }])
      if (result.cart) setCart(result.cart)
    })
  }

  const remove = () => {
    startTransition(async () => {
      const result = await removeCartLines([id])
      if (result.cart) setCart(result.cart)
    })
  }

  const decrement = () => {
    if (quantity <= 1) remove()
    else updateQuantity(quantity - 1)
  }

  return (
    <div className="flex gap-3 px-3 py-3 border-b border-gray-200 last:border-b-0">
      {image && (
        <Link href={url} onClick={close} className="shrink-0">
          <Image
            alt={image.altText ?? title}
            src={image.url}
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg object-cover bg-gray-50"
          />
        </Link>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <Link href={url} onClick={close}>
          <p className="text-[13px] font-medium text-black leading-snug line-clamp-2">
            {product.title}
          </p>
          {variantLabel && (
            <p className="text-[11px] text-gray-500 mt-0.5">{variantLabel}</p>
          )}
        </Link>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[13px] font-semibold text-black">
            {formatPrice(cost.totalAmount)}
          </span>

          <div className="flex items-center">
            <button
              type="button"
              onClick={decrement}
              disabled={isPending}
              className="flex items-center justify-center w-7 h-7 border border-gray-300 rounded-l text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label={quantity <= 1 ? "Remove from cart" : "Decrease quantity"}
            >
              {quantity <= 1 ? (
                <Trash2 size={13} className="text-red-500" />
              ) : (
                <Minus size={14} />
              )}
            </button>

            <span className="flex items-center justify-center w-8 h-7 border-y border-gray-300 text-[13px] font-medium text-black">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isPending}
              className="flex items-center justify-center w-7 h-7 border border-gray-300 rounded-r text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
