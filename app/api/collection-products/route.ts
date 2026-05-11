import { NextRequest } from "next/server"
import { shopifyClient } from "@/lib/shopify"
import { COLLECTION_PRODUCTS_QUERY } from "@/lib/queries"
import type { CollectionProductsQuery } from "@/lib/types"
import logger from "@/lib/logger"

const log = logger.child({ module: "api/collection-products" })

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const handle = searchParams.get("handle")
  const cursor = searchParams.get("cursor")

  if (!handle) {
    return Response.json({ error: "handle is required" }, { status: 400 })
  }

  try {
    const { data, errors } = await shopifyClient.request(
      COLLECTION_PRODUCTS_QUERY,
      {
        variables: { handle, cursor: cursor ?? null },
      },
    )

    if (errors) {
      log.error({ errors }, "COLLECTION_PRODUCTS_QUERY errors")
      return Response.json({ error: "graphql_error" }, { status: 502 })
    }

    const typed = data as CollectionProductsQuery | undefined
    const products = typed?.collection?.products?.nodes ?? []
    const pageInfo = typed?.collection?.products?.pageInfo ?? {
      hasNextPage: false,
      endCursor: null,
    }

    return Response.json({ products, pageInfo })
  } catch (err) {
    log.error({ err }, "COLLECTION_PRODUCTS_QUERY failed")
    return Response.json({ error: "request_failed" }, { status: 502 })
  }
}
