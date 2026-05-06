import { NextRequest } from "next/server"
import {
  createReview,
  fetchProductReviews,
  readTrustooEnv,
} from "@/lib/trustoo"

export async function GET(request: NextRequest) {
  const env = readTrustooEnv()
  if (!env) {
    return Response.json({ error: "reviews_unavailable" }, { status: 503 })
  }

  const { searchParams } = request.nextUrl
  const productId = searchParams.get("product_id")
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("page_size") || "5", 10)

  if (!productId) {
    return Response.json({ error: "product_id is required" }, { status: 400 })
  }

  const data = await fetchProductReviews(productId, page, pageSize, env)
  if (!data) {
    return Response.json(
      { error: "Failed to fetch reviews" },
      { status: 502 },
    )
  }

  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const env = readTrustooEnv()
  if (!env) {
    return Response.json({ error: "reviews_unavailable" }, { status: 503 })
  }

  const formData = await request.formData()
  const productId = formData.get("product_id") as string
  const rating = parseInt((formData.get("rating") as string) || "0", 10)
  const author = ((formData.get("author") as string) ?? "").trim()
  const content = ((formData.get("content") as string) ?? "").trim()

  if (!productId || !rating || !author || !content) {
    return Response.json(
      { error: "product_id, rating, author, and content are required" },
      { status: 400 },
    )
  }

  if (rating < 1 || rating > 5) {
    return Response.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 },
    )
  }

  const result = await createReview(
    { productId, rating, author, content },
    env,
  )

  if (!result) {
    return Response.json(
      { error: "Failed to submit review" },
      { status: 502 },
    )
  }

  return Response.json({ success: true, id: result.id })
}
