"use client"

import { useEffect } from "react"

const SR_SCRIPT_SRC =
  "https://fastrr-boost-ui.pickrr.com/assets/js/channels/shopify.js"
const SR_STYLE_HREF =
  "https://fastrr-boost-ui.pickrr.com/assets/styles/shopify.css"
const SELLER_DOMAIN = "www.zop.in"

export function ShiprocketLoader() {
  useEffect(() => {
    if (!document.getElementById("sellerDomain")) {
      const input = document.createElement("input")
      input.type = "hidden"
      input.id = "sellerDomain"
      input.value = SELLER_DOMAIN
      document.body.appendChild(input)
    }

    if (!document.querySelector(`script[src="${SR_SCRIPT_SRC}"]`)) {
      const script = document.createElement("script")
      script.src = SR_SCRIPT_SRC
      script.defer = true
      document.body.appendChild(script)
    }

    if (!document.querySelector(`link[href="${SR_STYLE_HREF}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = SR_STYLE_HREF
      document.head.appendChild(link)
    }
  }, [])

  return null
}
