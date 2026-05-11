const MENU_FRAGMENT = `
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...MenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
`

export const HEADER_QUERY = `
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain { url }
    brand { logo { image { url } } }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop { ...Shop }
    menu(handle: $headerMenuHandle) { ...Menu }
  }
  ${MENU_FRAGMENT}
`

export const FOOTER_QUERY = `
  query Footer(
    $country: CountryCode
    $footerContactMenuHandle: String!
    $footerHelpMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    contactMenu: menu(handle: $footerContactMenuHandle) { ...Menu }
    helpMenu: menu(handle: $footerHelpMenuHandle) { ...Menu }
  }
  ${MENU_FRAGMENT}
`

const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    sku
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    shop {
      offersList: metafield(namespace: "custom", key: "offers_list") {
        value
      }
    }
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      productType
      vendor
      tags
      availableForSale
      seo {
        title
        description
      }
      options {
        name
        optionValues {
          name
          swatch {
            color
            image {
              previewImage {
                url
              }
            }
          }
        }
      }
      featuredImage {
        url
        altText
        width
        height
      }
      media(first: 20) {
        nodes {
          __typename
          ... on MediaImage {
            id
            image {
              id
              url(transform: { maxWidth: 800 })
              altText
              width
              height
            }
          }
          ... on Video {
            id
            sources {
              url
              mimeType
            }
          }
          ... on ExternalVideo {
            id
            host
            originUrl
          }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 100) {
        nodes {
          ...ProductVariantFields
        }
      }
      metafields(identifiers: [
        {namespace: "custom", key: "manufactured_by_address"}
        {namespace: "custom", key: "sold_by_address"}
      ]) {
        key
        value
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`

export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCardFields on Product {
    id
    title
    handle
    vendor
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    variants(first: 2) {
      nodes {
        id
      }
    }
  }
`

export const VENDOR_PRODUCTS_QUERY = `
  query VendorProducts($vendorQuery: String!) {
    products(first: 8, query: $vendorQuery) {
      nodes {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`

export const COLLECTION_PRODUCTS_QUERY = `
  query CollectionProducts($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      products(first: 20, after: $cursor) {
        nodes {
          ...ProductCardFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`
