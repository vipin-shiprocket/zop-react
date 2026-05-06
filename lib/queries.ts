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

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
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
      options {
        name
        values
      }
      media(first: 20) {
        edges {
          node {
            mediaContentType
            ... on MediaImage {
              image {
                url
                altText
                width
                height
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
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
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
        }
      }
    }
  }
`
