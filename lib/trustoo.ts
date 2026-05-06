import "server-only"
import type {
  TrustooApiResponse,
  TrustooRating,
  TrustooRatingRaw,
  TrustooReview,
  TrustooReviewsRaw,
  TrustooReviewsResponse,
} from "./trustoo-types"

const BASE_URL = "https://rapi.trustoo.io"

export interface TrustooEnv {
  TRUSTOO_PUBLIC_TOKEN: string
  TRUSTOO_PRIVATE_TOKEN: string
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function generateSign(
  params: Record<string, string>,
  body: string | null,
  privateToken: string,
): Promise<string> {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key] ?? ""}`)
    .join("&")

  let toSign = sorted
  if (typeof body === "string" && body.length > 0) {
    toSign += "|" + body
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(privateToken),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(toSign),
  )

  return bufferToHex(signature)
}

async function buildHeaders(
  queryParams: Record<string, string>,
  body: string | null,
  env: TrustooEnv,
): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const allParams = { ...queryParams, timestamp }
  const sign = await generateSign(allParams, body, env.TRUSTOO_PRIVATE_TOKEN)

  return {
    "Public-Token": env.TRUSTOO_PUBLIC_TOKEN,
    Sign: sign,
    Timestamp: timestamp,
  }
}

function mapRating(raw: TrustooRatingRaw): TrustooRating {
  return {
    ratingValue: parseFloat(raw.rating_value) || 0,
    reviewCount: raw.review_count,
    star1Count: raw.star1_count,
    star2Count: raw.star2_count,
    star3Count: raw.star3_count,
    star4Count: raw.star4_count,
    star5Count: raw.star5_count,
  }
}

function mapReview(raw: TrustooReviewsRaw["list"][number]): TrustooReview {
  return {
    id: raw.id,
    rating: raw.rating,
    author: raw.author,
    content: raw.content,
    commentedAt: raw.commented_at,
    isVerified: raw.is_verified === 1,
    media:
      raw.media?.map((m) => ({
        url: m.url,
        thumbnailUrl: m.thumbnail_url,
        type: m.type,
      })) ?? null,
    reply: raw.reply
      ? { content: raw.reply.content, replyAt: raw.reply.reply_at }
      : null,
  }
}

function mapReviewsResponse(raw: TrustooReviewsRaw): TrustooReviewsResponse {
  return {
    page: {
      page: raw.page.page,
      pageSize: raw.page.page_size,
      totalPage: raw.page.total_page,
      count: raw.page.count,
    },
    list: raw.list.map(mapReview),
  }
}

export function readTrustooEnv(): TrustooEnv | null {
  const pub = process.env.TRUSTOO_PUBLIC_TOKEN
  const priv = process.env.TRUSTOO_PRIVATE_TOKEN
  if (!pub || !priv) return null
  return { TRUSTOO_PUBLIC_TOKEN: pub, TRUSTOO_PRIVATE_TOKEN: priv }
}

export async function fetchProductRating(
  productId: string,
  env: TrustooEnv,
): Promise<TrustooRating | null> {
  try {
    const queryParams: Record<string, string> = { product_id: productId }
    const headers = await buildHeaders(queryParams, null, env)
    const qs = new URLSearchParams(queryParams).toString()

    const url = `${BASE_URL}/api/v1/openapi/get_rating?${qs}`
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) return null

    const json = (await response.json()) as TrustooApiResponse<TrustooRatingRaw>
    if (json.code !== 0 || !json.data) return null

    return mapRating(json.data)
  } catch {
    return null
  }
}

export async function fetchProductReviews(
  productId: string,
  page: number,
  pageSize: number,
  env: TrustooEnv,
): Promise<TrustooReviewsResponse | null> {
  try {
    const queryParams: Record<string, string> = {
      product_ids: productId,
      page: String(page),
      page_size: String(pageSize),
      sort_by: "created-descending",
    }
    const headers = await buildHeaders(queryParams, null, env)
    const qs = new URLSearchParams(queryParams).toString()

    const url = `${BASE_URL}/api/v1/openapi/get_reviews?${qs}`
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) return null

    const json = (await response.json()) as TrustooApiResponse<TrustooReviewsRaw>
    if (json.code !== 0 || !json.data) return null

    return mapReviewsResponse(json.data)
  } catch {
    return null
  }
}

export async function createReview(
  data: {
    productId: string
    rating: number
    author: string
    content: string
  },
  env: TrustooEnv,
): Promise<{ id: number } | null> {
  try {
    const body = JSON.stringify({
      product_id: parseInt(data.productId, 10),
      rating: data.rating,
      author: data.author,
      content: data.content,
      is_published: 1,
      is_featured: 0,
      is_top: 0,
      is_verified: 0,
    })

    const queryParams: Record<string, string> = {}
    const headers = await buildHeaders(queryParams, body, env)

    const response = await fetch(`${BASE_URL}/api/v1/openapi/create_review`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) return null

    const json = (await response.json()) as { id?: number }
    if (!json.id) return null

    return { id: json.id }
  } catch {
    return null
  }
}
