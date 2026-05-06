"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  buildVariantUriQuery,
  getOptionAvailability,
  type SelectedOptions,
} from "@/lib/product-variants"
import type { OptionSwatch, Product, ProductVariant } from "@/lib/types"
import { addCartLines } from "@/app/cart/actions"
import { useCartStore } from "@/lib/cart"
import { goToCheckoutDirect } from "@/lib/checkout"

interface ProductFormProps {
  product: Product
  selectedOptions: SelectedOptions
  selectedVariant: ProductVariant | null
}

function isColorOption(values: Product["options"][number]["optionValues"]) {
  return values.some((v) => v.swatch?.color || v.swatch?.image)
}

function getOptionClassName(
  isColor: boolean,
  selected: boolean,
  available: boolean,
  exists: boolean,
): string {
  if (isColor) {
    return cn(
      "relative h-8 w-8 cursor-pointer rounded-full md:h-10 md:w-10",
      selected && "ring-2 ring-[#1C1C15] ring-offset-2",
      !available && "opacity-40",
      !exists && "cursor-not-allowed opacity-30",
    )
  }

  return cn(
    "relative rounded-full border px-3 py-1.5 text-sm transition-colors",
    selected
      ? "border-[#1C1C15] bg-[#1C1C15] text-white"
      : exists
        ? "cursor-pointer border-[#DEDEDF] bg-white text-[#1C1C15] hover:border-[#1C1C15]"
        : "cursor-not-allowed border-[#DEDEDF] bg-[#F2F2F2] text-[#D4D4D4]",
    !available &&
      exists &&
      "border-[#DEDEDF] bg-[#F2F2F2] text-[#D4D4D4] hover:border-[#DEDEDF]",
  )
}

function showStrikethrough(
  isColor: boolean,
  available: boolean,
  exists: boolean,
): boolean {
  return !isColor && (!available || !exists)
}

function StrikethroughLine() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span className="block h-px w-[calc(100%+4px)] -rotate-45 bg-[#D4D4D4]" />
    </span>
  )
}

function Swatch({
  swatch,
  name,
  isColor,
}: {
  swatch?: OptionSwatch
  name: string
  isColor: boolean
}) {
  const image = swatch?.image?.previewImage?.url
  const color = swatch?.color

  if (!image && !color) return name

  return (
    <div
      aria-label={name}
      className={cn(
        "overflow-hidden",
        isColor ? "h-full w-full rounded-full" : "h-4 w-4 rounded-full",
      )}
      style={{ backgroundColor: color || "transparent" }}
    >
      {!!image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" />
      )}
    </div>
  )
}

export function ProductForm({
  product,
  selectedOptions,
  selectedVariant,
}: ProductFormProps) {
  const router = useRouter()
  const setCart = useCartStore((s) => s.setCart)
  const openCart = useCartStore((s) => s.open)
  const [isPending, startTransition] = useTransition()

  const isAvailable = !!selectedVariant?.availableForSale
  const canSubmit = isAvailable && !isPending && !!selectedVariant

  const addToCart = () => {
    if (!selectedVariant) return
    startTransition(async () => {
      const result = await addCartLines([
        { merchandiseId: selectedVariant.id, quantity: 1 },
      ])
      if (!result.cart) return
      setCart(result.cart)
      openCart()
    })
  }

  const buyNow = () => {
    if (!selectedVariant) return
    goToCheckoutDirect(selectedVariant.id)
  }

  return (
    <div className="space-y-6">
      {product.options.map((option) => {
        if (option.optionValues.length === 1) return null

        const isColor = isColorOption(option.optionValues)
        const currentValue = selectedOptions[option.name]

        return (
          <div key={option.name}>
            <h5 className="mb-2 text-sm font-medium text-[#1C1C15]">
              {option.name}
            </h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const selected = currentValue === value.name
                const { exists, available } = getOptionAvailability(
                  product,
                  option.name,
                  value.name,
                  selectedOptions,
                )

                return (
                  <button
                    type="button"
                    key={option.name + value.name}
                    disabled={!exists}
                    onClick={() => {
                      if (selected) return
                      const qs = buildVariantUriQuery(selectedOptions, {
                        name: option.name,
                        value: value.name,
                      })
                      router.replace(`?${qs}`, { scroll: false })
                    }}
                    className={getOptionClassName(
                      isColor,
                      selected,
                      available,
                      exists,
                    )}
                  >
                    <Swatch
                      swatch={value.swatch}
                      name={value.name}
                      isColor={isColor}
                    />
                    {showStrikethrough(isColor, available, exists) && (
                      <StrikethroughLine />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex flex-col gap-3 md:flex-row">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={addToCart}
          className={cn(
            "h-12 w-full cursor-pointer rounded-lg border-2 border-[#1C1C15] bg-white font-semibold text-[#1C1C15] transition-opacity",
            !canSubmit && "cursor-not-allowed opacity-50",
          )}
        >
          {!isAvailable ? "Sold out" : isPending ? "Adding…" : "Add to Bag"}
        </button>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={buyNow}
          className={cn(
            "h-12 w-full cursor-pointer rounded-lg border-2 border-[#1C1C15] bg-[#1C1C15] font-semibold text-white transition-opacity",
            !canSubmit && "cursor-not-allowed opacity-50",
          )}
        >
          Buy Now
        </button>
      </div>
    </div>
  )
}
