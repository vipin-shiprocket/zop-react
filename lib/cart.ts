import { create } from "zustand"
import type { Money, ProductCardProduct, ProductImage } from "./types"

// ---- Types ----

export type CartLineMerchandise = {
  id: string
  availableForSale: boolean
  title: string
  image: ProductImage | null
  price: Money
  compareAtPrice: Money | null
  selectedOptions: { name: string; value: string }[]
  product: {
    id: string
    handle: string
    title: string
    vendor: string
  }
}

export type CartLine = {
  id: string
  quantity: number
  cost: {
    totalAmount: Money
    amountPerQuantity: Money
    compareAtAmountPerQuantity: Money | null
  }
  merchandise: CartLineMerchandise
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  updatedAt: string
  lines: { nodes: CartLine[] }
  cost: {
    subtotalAmount: Money
    totalAmount: Money
    totalTaxAmount: Money | null
  }
  discountCodes: { code: string; applicable: boolean }[]
}

export type CartUserError = {
  code?: string | null
  field?: string[] | null
  message: string
}

export type CartActionResult = {
  cart: Cart | null
  userErrors: CartUserError[]
}

export type CartRecommendationProduct = Omit<ProductCardProduct, "variants"> & {
  firstVariantId: string
}

// ---- Zustand store ----

type CartStore = {
  isOpen: boolean
  cart: Cart | null
  open: () => void
  close: () => void
  toggle: () => void
  setCart: (cart: Cart | null) => void
}

export const useCartStore = create<CartStore>((set) => ({
  isOpen: false,
  cart: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setCart: (cart) => set({ cart }),
}))
