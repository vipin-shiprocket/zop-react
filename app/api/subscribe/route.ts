import { NextRequest } from "next/server"

import { shopifyClient } from "@/lib/shopify"

interface CustomerUserError {
  code: string
  message: string
}

interface CustomerCreateData {
  customerCreate?: {
    customer?: { id: string }
    customerUserErrors: CustomerUserError[]
  }
}

const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Valid email is required" }, { status: 400 })
  }

  let result: { data: CustomerCreateData; errors?: unknown }
  try {
    result = (await shopifyClient.request(CUSTOMER_CREATE, {
      variables: {
        input: {
          email,
          password: crypto.randomUUID(),
          acceptsMarketing: true,
        },
      },
    })) as { data: CustomerCreateData; errors?: unknown }
  } catch {
    return Response.json({ error: "Subscription failed" }, { status: 502 })
  }

  if (result.errors) {
    return Response.json({ error: "Subscription failed" }, { status: 502 })
  }

  const userErrors = result.data?.customerCreate?.customerUserErrors ?? []

  // TAKEN = email already has an account — treat as success (already subscribed)
  if (userErrors.some((e) => e.code === "TAKEN")) {
    return Response.json({ success: true })
  }

  if (userErrors.length > 0) {
    return Response.json({ error: userErrors[0].message }, { status: 422 })
  }

  return Response.json({ success: true })
}
