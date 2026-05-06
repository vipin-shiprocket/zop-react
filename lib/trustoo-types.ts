export interface TrustooRating {
  ratingValue: number
  reviewCount: number
  star1Count: number
  star2Count: number
  star3Count: number
  star4Count: number
  star5Count: number
}

export interface TrustooReview {
  id: string
  rating: number
  author: string
  content: string
  commentedAt: string
  isVerified: boolean
  media: Array<{ url: string; thumbnailUrl: string; type: string }> | null
  reply: { content: string; replyAt: string } | null
}

export interface TrustooReviewsPage {
  page: number
  pageSize: number
  totalPage: number
  count: number
}

export interface TrustooReviewsResponse {
  page: TrustooReviewsPage
  list: TrustooReview[]
}

export interface TrustooApiResponse<T> {
  code: number
  message: string
  time: number
  request_id: string
  data: T
}

export interface TrustooRatingRaw {
  rating_value: string
  review_count: number
  star1_count: number
  star2_count: number
  star3_count: number
  star4_count: number
  star5_count: number
}

export interface TrustooReviewRaw {
  id: string
  rating: number
  author: string
  content: string
  commented_at: string
  is_verified: number
  media: Array<{ url: string; thumbnail_url: string; type: string }> | null
  reply: { content: string; reply_at: string } | null
}

export interface TrustooReviewsRaw {
  page: {
    page: number
    page_size: number
    total_page: number
    count: number
  }
  list: TrustooReviewRaw[]
}
