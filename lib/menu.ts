import type { Menu } from "./types"

const stripProto = (s: string) =>
  s.replace(/^https?:\/\//, "").replace(/\/$/, "")

export function resolveMenuUrl(
  url: string,
  publicStoreDomain: string,
  primaryDomainUrl: string,
): string {
  const shopHost = stripProto(publicStoreDomain)
  const primaryHost = stripProto(primaryDomainUrl)
  try {
    const parsed = new URL(url)
    if (
      (shopHost && parsed.hostname === shopHost) ||
      parsed.hostname.endsWith(".myshopify.com") ||
      (primaryHost && parsed.hostname === primaryHost)
    ) {
      return parsed.pathname
    }
  } catch {
    // not an absolute URL — fall through and return as-is
  }
  return url
}

export const FALLBACK_HEADER_MENU: Menu = {
  id: "fallback-header",
  items: [
    { id: "h-collections", resourceId: null, tags: [], title: "Collections", type: "HTTP", url: "/collections", items: [] },
    { id: "h-blog", resourceId: null, tags: [], title: "Blog", type: "HTTP", url: "/blogs/journal", items: [] },
    { id: "h-policies", resourceId: null, tags: [], title: "Policies", type: "HTTP", url: "/policies", items: [] },
    { id: "h-about", resourceId: null, tags: [], title: "About", type: "PAGE", url: "/pages/about", items: [] },
  ],
}

export const FALLBACK_CONTACT_MENU: Menu = {
  id: "fallback-contact",
  items: [
    { id: "c-support", resourceId: null, tags: [], title: "Customer Support", type: "HTTP", url: "/pages/contact", items: [] },
    { id: "c-refund", resourceId: null, tags: [], title: "Return/Refund Request", type: "HTTP", url: "/policies/refund-policy", items: [] },
  ],
}

export const FALLBACK_HELP_MENU: Menu = {
  id: "fallback-help",
  items: [
    { id: "h-about-us", resourceId: null, tags: [], title: "About us", type: "HTTP", url: "/pages/about", items: [] },
    { id: "h-terms", resourceId: null, tags: [], title: "Terms & Conditions", type: "HTTP", url: "/policies/terms-of-service", items: [] },
    { id: "h-shipping", resourceId: null, tags: [], title: "Shipping & Returns", type: "HTTP", url: "/policies/shipping-policy", items: [] },
    { id: "h-privacy", resourceId: null, tags: [], title: "Privacy Policy", type: "HTTP", url: "/policies/privacy-policy", items: [] },
    { id: "h-onboard", resourceId: null, tags: [], title: "Get onboarded on ZOP", type: "HTTP", url: "/pages/onboarding", items: [] },
  ],
}
