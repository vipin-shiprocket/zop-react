"use client"

import Image from "next/image"
import { useTransition } from "react"
import useSWR from "swr"
import { addCartLines } from "@/app/cart/actions"
import { useCartStore, type CartRecommendationProduct } from "@/lib/cart"
import { calcDiscountPercentage, formatPrice } from "@/lib/utils"

const fetcher = async (
  url: string,
): Promise<{ products: CartRecommendationProduct[] }> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("recommendations fetch failed")
  return res.json()
}

export function CartRecommendations() {
  const { data } = useSWR("/api/cart-recommendations", fetcher, {
    revalidateOnFocus: false,
  })
  const products = data?.products

  if (!products || products.length === 0) return null

  return (
    <div className="px-4 pt-4 pb-3">
      <h3 className="text-sm font-bold text-black mb-3">You may also like</h3>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <RecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function RecommendationCard({
  product,
}: {
  product: CartRecommendationProduct
}) {
  const setCart = useCartStore((s) => s.setCart)
  const [isPending, startTransition] = useTransition()

  const price = product.priceRange.minVariantPrice
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice
  const discount =
    compareAtPrice && Number(compareAtPrice.amount) > Number(price.amount)
      ? calcDiscountPercentage(price.amount, compareAtPrice.amount)
      : null

  const add = () => {
    if (!product.firstVariantId) return
    startTransition(async () => {
      const result = await addCartLines([
        { merchandiseId: product.firstVariantId, quantity: 1 },
      ])
      if (result.cart) setCart(result.cart)
    })
  }

  return (
    <div className="w-[252px] h-[102px] shrink-0 snap-start [scroll-snap-stop:always] flex gap-2 rounded-lg border border-gray-200 overflow-hidden bg-white">
      {product.featuredImage && (
        <div className="w-[102px] h-[102px] shrink-0 bg-gray-50 relative">
          <Image
            alt={product.featuredImage.altText ?? product.title}
            src={product.featuredImage.url}
            fill
            sizes="102px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center py-1.5 pr-2 min-w-0">
        <p className="text-[11px] text-black leading-snug line-clamp-2">
          {product.title}
        </p>

        <div className="flex items-center gap-1.5 mt-0.5">
          {compareAtPrice && discount != null && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
          <span className="text-[12px] font-bold text-black">
            {formatPrice(price)}
          </span>
        </div>

        {discount != null && (
          <p className="text-[10px] text-green-600 font-medium">
            {discount}% off
          </p>
        )}

        <button
          type="button"
          onClick={add}
          disabled={isPending || !product.firstVariantId}
          className="mt-1 h-6 px-3 text-[11px] font-medium border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors self-start disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +Add
        </button>
      </div>
    </div>
  )
}
