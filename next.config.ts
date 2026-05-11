import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // pino + pino-pretty use dynamic require() for their thread-based transport
  // loader, which the bundler cannot statically analyze. Mark them external so
  // they resolve at runtime instead.
  serverExternalPackages: ["pino", "pino-pretty"],
  async rewrites() {
    return [
      // Shopify-compatible REST endpoints consumed by the Fastrr checkout SDK
      { source: "/products/:handle.js", destination: "/api/shopify/product/:handle" },
      { source: "/products/:handle.json", destination: "/api/shopify/product/:handle" },
      { source: "/cart.json", destination: "/api/shopify/cart" },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "www.zop.in" },
    ],
  },
}

export default nextConfig
