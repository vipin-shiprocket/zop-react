export type Money = {
  amount: string
  currencyCode: string
}

export type ProductMedia = {
  type: 'IMAGE'
  url: string
  altText?: string
  width?: number
  height?: number
}

export type ProductOption = {
  name: string
  values: string[]
}

export type ProductVariant = {
  id: string
  title: string
  price: Money
  compareAtPrice: Money | null
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  productType: string
  vendor: string
  tags: string[]
  availableForSale: boolean
  options: ProductOption[]
  media: {
    edges: {
      node: {
        mediaContentType: string
        image?: { url: string; altText: string | null; width: number; height: number }
      }
    }[]
  }
  featuredImage: { url: string; altText: string | null; width: number; height: number } | null
  priceRange: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
  compareAtPriceRange: {
    minVariantPrice: Money
  }
  variants: {
    edges: { node: ProductVariant }[]
  }
}
