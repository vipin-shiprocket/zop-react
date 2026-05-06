export type Money = {
  amount: string
  currencyCode: string
}

export type MenuItem = {
  id: string
  resourceId: string | null
  tags: string[]
  title: string
  type: string
  url: string | null
  items?: MenuItem[]
}

export type Menu = {
  id: string
  items: MenuItem[]
}

export type ShopInfo = {
  id: string
  name: string
  description: string | null
  primaryDomain: { url: string }
  brand: { logo: { image: { url: string } } | null } | null
}

export type HeaderQuery = {
  shop: ShopInfo | null
  menu: Menu | null
}

export type FooterQuery = {
  contactMenu: Menu | null
  helpMenu: Menu | null
}

export type ProductImage = {
  id?: string | null
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
}

export type MediaImageNode = {
  __typename: "MediaImage"
  id?: string
  image?: ProductImage | null
}

export type VideoNode = {
  __typename: "Video"
  id?: string
  sources?: Array<{ url: string; mimeType?: string | null }>
}

export type ExternalVideoNode = {
  __typename: "ExternalVideo"
  id?: string
  host?: string
  originUrl?: string
}

export type ProductMedia = MediaImageNode | VideoNode | ExternalVideoNode

export type OptionSwatch = {
  color?: string | null
  image?: { previewImage?: { url: string } | null } | null
} | null

export type ProductOptionValue = {
  name: string
  swatch?: OptionSwatch
}

export type ProductOption = {
  name: string
  optionValues: ProductOptionValue[]
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  sku?: string | null
  image?: ProductImage | null
  price: Money
  compareAtPrice: Money | null
  selectedOptions: { name: string; value: string }[]
}

export type ProductMetafield = {
  key: string
  value: string
} | null

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
  seo: { title: string | null; description: string | null } | null
  options: ProductOption[]
  featuredImage: ProductImage | null
  media: { nodes: ProductMedia[] }
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money }
  compareAtPriceRange: { minVariantPrice: Money }
  variants: { nodes: ProductVariant[] }
  metafields: ProductMetafield[]
}

export type OffersListEntry = { title: string; line1: string }
export type OffersMap = Record<string, OffersListEntry>

export type ProductByHandleQuery = {
  shop: { offersList: { value: string } | null } | null
  product: Product | null
}

export type ProductCardProduct = {
  id: string
  title: string
  handle: string
  vendor: string
  featuredImage: ProductImage | null
  priceRange: { minVariantPrice: Money }
  compareAtPriceRange: { minVariantPrice: Money } | null
  variants: { nodes: Array<{ id: string }> }
}

export type VendorProductsQuery = {
  products: { nodes: ProductCardProduct[] }
}

export type CollectionProductsQuery = {
  collection: {
    products: {
      nodes: ProductCardProduct[]
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
    }
  } | null
}

export type {
  TrustooRating,
  TrustooReview,
  TrustooReviewsResponse,
  TrustooReviewsPage,
} from "./trustoo-types"

export type { ZopProductDetail } from "./zop-types"
