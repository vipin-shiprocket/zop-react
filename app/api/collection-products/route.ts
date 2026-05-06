import { NextRequest } from "next/server"
import { shopifyClient } from "@/lib/shopify"
import { COLLECTION_PRODUCTS_QUERY } from "@/lib/queries"
import type { CollectionProductsQuery } from "@/lib/types"

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
      console.error("COLLECTION_PRODUCTS_QUERY errors", errors)
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
    console.error("COLLECTION_PRODUCTS_QUERY failed", err)
    return Response.json({ error: "request_failed" }, { status: 502 })
  }
}
