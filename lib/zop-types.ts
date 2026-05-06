export interface ZopProductDetail {
  productTags: string[] | null
  keyFeatures: string | null
  shippingReturn: string | null
  materialCare: string | null
  soldCount: number | null
  isCustomised: boolean
  featureBadges: Array<{
    icon: string
    label: string
    description: string
  }> | null
}

export interface ZopApiResponse {
  data: {
    product_tags?: string[]
    key_features?: string
    shipping_return?: string
    material_care?: string
    sold_info?: { overall?: number }
    is_customised?: boolean
    feature_badges?: Array<{
      icon?: string
      label?: string
      description?: string
    }>
  }
}
