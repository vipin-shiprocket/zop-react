import type { Metadata } from "next"
import { Poppins } from "next/font/google"

import "./globals.css"
import "./searchtap.css"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CartInit } from "@/components/cart/cart-init"
import { ShiprocketLoader } from "@/components/checkout/shiprocket-loader"
import { getCart } from "@/app/cart/actions"
import { FOOTER_QUERY, HEADER_QUERY } from "@/lib/queries"
import { shopifyClient } from "@/lib/shopify"
import type { FooterQuery, HeaderQuery } from "@/lib/types"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Zop",
  description: "Zop Store",
  icons: {
    icon: [
      {
        url: "https://cdn.shopify.com/s/files/1/0643/7119/6054/files/darkModeFavicon_8c1ce738-33d7-4353-a840-68e26145b8c1.png?width=100",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://www.zop.in/cdn/shop/t/95/assets/liteModeFavicon.png?width=100",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "https://cdn.shopify.com/s/files/1/0643/7119/6054/files/darkModeFavicon_8c1ce738-33d7-4353-a840-68e26145b8c1.png?width=100",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://www.zop.in/cdn/shop/t/95/assets/liteModeFavicon.png?width=100",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
}

const PUBLIC_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? ""

async function fetchHeader(): Promise<HeaderQuery | null> {
  try {
    const { data, errors } = await shopifyClient.request(HEADER_QUERY, {
      variables: { headerMenuHandle: "main-menu" },
    })
    if (errors) {
      console.error("HEADER_QUERY errors", errors)
      return null
    }
    return (data as HeaderQuery) ?? null
  } catch (err) {
    console.error("HEADER_QUERY failed", err)
    return null
  }
}

async function fetchFooter(): Promise<FooterQuery | null> {
  try {
    const { data, errors } = await shopifyClient.request(FOOTER_QUERY, {
      variables: {
        footerContactMenuHandle: "footer-contact",
        footerHelpMenuHandle: "footer-help",
      },
    })
    if (errors) {
      console.error("FOOTER_QUERY errors", errors)
      return null
    }
    return (data as FooterQuery) ?? null
  } catch (err) {
    console.error("FOOTER_QUERY failed", err)
    return null
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [header, footer, cart] = await Promise.all([
    fetchHeader(),
    fetchFooter(),
    getCart(),
  ])
  const primaryDomainUrl = header?.shop?.primaryDomain?.url ?? ""

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header
          header={header}
          publicStoreDomain={PUBLIC_STORE_DOMAIN}
          initialCartCount={cart?.totalQuantity ?? 0}
        />
        {children}
        <Footer
          footer={footer}
          primaryDomainUrl={primaryDomainUrl}
          publicStoreDomain={PUBLIC_STORE_DOMAIN}
        />
        <CartInit cart={cart} />
        <CartDrawer />
        <ShiprocketLoader />
      </body>
    </html>
  )
}
