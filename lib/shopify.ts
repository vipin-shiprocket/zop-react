import "server-only"
import { createStorefrontApiClient } from "@shopify/storefront-api-client"

export const shopifyClient = createStorefrontApiClient({
  storeDomain: `https://${process.env.SHOPIFY_STORE_DOMAIN}`,
  apiVersion: "2026-07",
  publicAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
})



