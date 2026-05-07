"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  FALLBACK_CONTACT_MENU,
  FALLBACK_HELP_MENU,
  resolveMenuUrl,
} from "@/lib/menu"
import type { FooterQuery, Menu } from "@/lib/types"

const BRAND_DESCRIPTION =
  "At ZOP, we cherish stories that inspire. Each brand showcases Indian Craftsmanship and Passion. Shop with us to support dreams and fuel innovation of the Best in house D2C Brands. Welcome to ZOP, where every purchase empowers a story."

const SEO_FULL_TEXT =
  "Shop on ZOP: Your Go-To Brand Discovery Platform. Looking for the best D2C brands offering top-notch quality at unbeatable prices? Shop on ZOP, India's first brand discovery platform is here to connect you with a wide range of emerging and established brands. Whether you're searching for fashion, electronics, beauty, or home essentials, ZOP brings you curated selections with exclusive deals. With a focus on quality, affordability, and variety, our platform ensures that every purchase is worthwhile."

const SEO_PREVIEW_LENGTH = 200

interface FooterProps {
  footer: FooterQuery | null
  primaryDomainUrl: string
  publicStoreDomain: string
}

export function Footer({
  footer,
  primaryDomainUrl,
  publicStoreDomain,
}: FooterProps) {
  const [seoExpanded, setSeoExpanded] = useState(false)

  const contactMenu = footer?.contactMenu ?? FALLBACK_CONTACT_MENU
  const helpMenu = footer?.helpMenu ?? FALLBACK_HELP_MENU

  const renderLinks = (menu: Menu, baseUrl?: string) =>
    menu.items.map((item) => {
      if (!item.url) return null
      let url = resolveMenuUrl(item.url, publicStoreDomain, primaryDomainUrl);
      if (baseUrl && url.startsWith("/")) url = `${baseUrl}${url}`
      const isExternal = !url.startsWith("/")
      const linkClass =
        "block !text-white hover:opacity-80 text-sm py-1 transition-opacity"
      return isExternal ? (
        <a
          key={item.id}
          href={url}
          rel="noopener noreferrer"
          target="_blank"
          className={linkClass}
        >
          {item.title}
        </a>
      ) : (
        <Link key={item.id} href={url} prefetch={false} className={linkClass}>
          {item.title}
        </Link>
      )
    })

  const seoPreview = SEO_FULL_TEXT.slice(0, SEO_PREVIEW_LENGTH) + "..."

  return (
    <footer className="bg-[#1c1c15] text-white mt-auto">
      <div className="px-5 py-10 md:px-10 md:py-12">
        <div className="hidden md:grid md:grid-cols-4 md:gap-10">
          <p className="text-sm text-white leading-relaxed">{BRAND_DESCRIPTION}</p>

          <div>
            <p className="font-semibold text-sm text-white mb-3">Contact Us</p>
            <div>{renderLinks(contactMenu)}</div>
          </div>

          <div>
            <p className="font-semibold text-sm text-white mb-3">Need Help?</p>
            <div>{renderLinks(helpMenu, "https://www.zop.in")}</div>
          </div>

          <SubscribeForm />
        </div>

        <div className="md:hidden space-y-6">
          <div className="mb-8">
            <SubscribeForm />
          </div>

          <p className="text-sm text-white leading-relaxed">{BRAND_DESCRIPTION}</p>

          <Accordion
            type="multiple"
            defaultValue={["help"]}
            className="border-t border-white/10"
          >
            <AccordionItem value="contact" className="border-white/10">
              <AccordionTrigger className="text-white text-sm font-semibold hover:no-underline [&>svg]:text-white">
                Contact Us
              </AccordionTrigger>
              <AccordionContent className="text-white">
                <div className="flex flex-col gap-1">{renderLinks(contactMenu)}</div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="help" className="border-white/10">
              <AccordionTrigger className="text-white text-sm font-semibold hover:no-underline [&>svg]:text-white">
                Need Help?
              </AccordionTrigger>
              <AccordionContent className="text-white">
                <div className="flex flex-col gap-1">{renderLinks(helpMenu, "https://www.zop.in")}</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="px-5 md:px-10 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zop_outline.svg"
          alt="ZOP"
          className="h-20 md:h-32 brightness-0 invert opacity-60"
        />
      </div>

      <div className="px-5 md:px-10 pb-8">
        <p className="text-sm text-white leading-relaxed">
          {seoExpanded ? SEO_FULL_TEXT : seoPreview}
        </p>
        <button
          onClick={() => setSeoExpanded((v) => !v)}
          className="text-sm text-white underline mt-2 hover:text-white/80 transition-colors"
        >
          {seoExpanded ? "Read Less" : "Read More"}
        </button>
      </div>

      <div className="border-t border-white/10 px-5 md:px-10 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/zopstore"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <FacebookIcon className="w-5 h-5 text-white" />
          </a>
          <a
            href="https://www.instagram.com/zopstore"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <InstagramIcon className="w-5 h-5 text-white" />
          </a>
        </div>

        <p className="text-xs !text-white leading-relaxed w-full md:max-w-[50%]">
          © 2025. All Rights Reserved.{" "}
          <Link
            href="/policies/privacy-policy"
            prefetch={false}
            className="underline !text-white hover:opacity-70 transition-opacity"
          >
            Privacy Policy
          </Link>
          . A unit of Shiprocket Merchant App Pvt. Ltd. Registered Address: Plot
          No. B, Khasra No. 360, Sultanpur, M.G Road, New Delhi 110030
        </p>
      </div>
    </footer>
  )
}

function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setErrorMsg(data.error ?? "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div>
        <p className="font-semibold text-sm text-white !mb-3">
          Subscribe to our emails
        </p>
        <p className="text-sm text-green-400">Thanks for subscribing!</p>
      </div>
    )
  }

  return (
    <div>
      <p className="font-semibold text-sm text-white !mb-3">
        Subscribe to our emails
      </p>
      <form
        className="flex items-center border border-white/30 rounded"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          required
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/60 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={status === "loading"}
          className="px-3 text-white hover:text-white/80 transition-colors disabled:opacity-50"
        >
          <ArrowRight size={18} />
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
      )}
    </div>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
