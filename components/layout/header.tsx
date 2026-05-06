"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Loader2, User, X } from "lucide-react"

import { FALLBACK_HEADER_MENU, resolveMenuUrl } from "@/lib/menu"
import type { HeaderQuery } from "@/lib/types"
import { useCartStore } from "@/lib/cart"
import { AccountIcon } from "@/components/icons/account-icon"
import { CartIcon } from "@/components/icons/cart-icon"

interface HeaderProps {
  header: HeaderQuery | null
  publicStoreDomain: string
  initialCartCount?: number
}

function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])
  return scrolled
}

function SearchIcon({
  stroke = "currentColor",
  className,
}: {
  stroke?: string
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M10.1152 18.7305C14.5971 18.7305 18.2305 15.0971 18.2305 10.6152C18.2305 6.13333 14.5971 2.5 10.1152 2.5C5.63333 2.5 2 6.13333 2 10.6152C2 15.0971 5.63333 18.7305 10.1152 18.7305Z"
        stroke={stroke}
        strokeWidth="1.20461"
        strokeLinejoin="round"
      />
      <path
        d="M12.8158 7.43742C12.1247 6.74634 11.17 6.31891 10.1154 6.31891C9.06085 6.31891 8.10612 6.74634 7.41504 7.43742"
        stroke={stroke}
        strokeWidth="1.20461"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9492 16.4492L19.9998 20.4998"
        stroke={stroke}
        strokeWidth="1.20461"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Header({
  header,
  publicStoreDomain,
  initialCartCount = 0,
}: HeaderProps) {
  const scrolled = useScrolled()
  const [searchReady, setSearchReady] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openCart = useCartStore((s) => s.open)
  const cartCount = useCartStore(
    (s) => s.cart?.totalQuantity ?? initialCartCount,
  )

  const menu = header?.menu ?? FALLBACK_HEADER_MENU
  const primaryDomainUrl = header?.shop?.primaryDomain?.url ?? ""

  // SearchTap SDK setup: create DOM containers, inject script, attach the
  // .st-back click delegation. Each Header instance gets its own closure-bound
  // handler so React 19 strict-mode double-invoke (mount → unmount → remount)
  // re-attaches correctly even when the script tag is already present.
  useEffect(() => {
    if (!document.getElementById("st-autocomplete-container")) {
      const autocomplete = document.createElement("div")
      autocomplete.id = "st-autocomplete-container"
      document.body.appendChild(autocomplete)
    }
    if (!document.getElementById("st-search-container")) {
      const searchContainer = document.createElement("div")
      searchContainer.id = "st-search-container"
      const searchtapEl = document.createElement("searchtap")
      searchContainer.appendChild(searchtapEl)
      document.body.appendChild(searchContainer)
    }

    // Vue 3 SDK doesn't bind @click to .st-back. Walk the VNode tree to find
    // the proxy with closeAutocompleteWithoutSearching, cache it across calls.
    let cachedProxy: { closeAutocompleteWithoutSearching?: () => void } | null = null
    const handler = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el?.closest(".st-back")) return
      if (!cachedProxy?.closeAutocompleteWithoutSearching) {
        const mount = document.getElementById("st-autocomplete-container")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vnode = (mount as any)?._vnode
        if (!vnode) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(function walk(vn: any, d = 0): boolean {
          if (!vn || d > 10) return false
          if (vn.component?.proxy?.closeAutocompleteWithoutSearching) {
            cachedProxy = vn.component.proxy
            return true
          }
          if (vn.component?.subTree && walk(vn.component.subTree, d + 1)) return true
          if (Array.isArray(vn.children)) {
            for (const c of vn.children) {
              if (walk(c, d + 1)) return true
            }
          }
          return false
        })(vnode)
      }
      cachedProxy?.closeAutocompleteWithoutSearching?.()
    }

    let attached = false
    const attach = () => {
      if (attached) return
      document.addEventListener("click", handler)
      attached = true
    }
    if ((window as unknown as { __searchtapReady?: boolean }).__searchtapReady) {
      attach()
    } else {
      window.addEventListener("searchtap:ready", attach, { once: true })
    }

    if (!document.querySelector('script[src="/searchtap.js"]')) {
      const script = document.createElement("script")
      script.src = "/searchtap.js"
      script.defer = true
      script.onload = () => {
        ;(window as unknown as { __searchtapReady?: boolean }).__searchtapReady = true
        window.dispatchEvent(new CustomEvent("searchtap:ready"))
      }
      document.body.appendChild(script)
    }

    return () => {
      window.removeEventListener("searchtap:ready", attach)
      if (attached) document.removeEventListener("click", handler)
    }
  }, [])

  // SearchTap ready signal — set state once the SDK reports ready.
  useEffect(() => {
    if ((window as unknown as { __searchtapReady?: boolean }).__searchtapReady) {
      setSearchReady(true)
      return
    }
    const handler = () => setSearchReady(true)
    window.addEventListener("searchtap:ready", handler)
    return () => window.removeEventListener("searchtap:ready", handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color] duration-300 ${
        scrolled
          ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          : "bg-[#1a1a1a]"
      }`}
    >
      <div className="relative flex items-center gap-2 px-4 py-2.5 lg:px-10 lg:py-3">
        <Link
          href="/"
          aria-label="Home"
          className="relative z-[1] shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zop_logo.svg"
            alt="ZOP"
            className="rounded-full w-10 h-10 lg:w-12 lg:h-12"
          />
        </Link>

        {/* Mobile search trigger — overlaps the logo via negative margin */}
        <button
          type="button"
          className={`lg:hidden flex items-center gap-1.5 flex-1 h-9 px-3 rounded-lg text-left cursor-pointer border transition-colors duration-300 shadow-[0px_0px_8px_0px_rgba(0,0,0,0.12)] -ml-[3rem] pl-11 ${
            scrolled
              ? "bg-white border-[#d2d2d2]"
              : "bg-white/10 border-white/20"
          }`}
          aria-label="Open search"
          onClick={() => {
            const el = document.getElementById("search-mobile")
            if (el) el.click()
          }}
        >
          <span
            className={`flex-1 text-[12px] leading-[1.2] font-[Gilroy,sans-serif] truncate ${
              scrolled ? "text-[#a9aaac]" : "text-white/50"
            }`}
          >
            Search by product or category
          </span>

          <span
            id="search-mobile"
            className="st-search-icon-mobile hidden-desktop st-mobile-search-icon st-close-open-icon search_box flex items-center justify-center shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {searchReady ? (
              <SearchIcon
                stroke={scrolled ? "#a9aaac" : "white"}
                className="w-5 h-5"
              />
            ) : (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: scrolled ? "#a9aaac" : "white" }}
              />
            )}
          </span>
        </button>

        {/* Desktop SearchTap input — SDK binds to #search-desktop input[name="st"] */}
        <div
          className="st-search-autocomplete-desktop site-nav__link st-search-bar-container st-desktop-searchbox st-hidden-sm hidden lg:flex"
          style={{ display: "none" }}
        >
          <div className="st-search-bar st-for-desktop" id="search-desktop">
            <span className="st-icon-search">
              <svg data-icon="search" viewBox="0 0 512 512" width="14px" height="20px">
                <path d="M495,466.2L377.2,348.4c29.2-35.6,46.8-81.2,46.8-130.9C424,103.5,331.5,11,217.5,11C103.4,11,11,103.5,11,217.5   S103.4,424,217.5,424c49.7,0,95.2-17.5,130.8-46.7L466.1,495c8,8,20.9,8,28.9,0C503,487.1,503,474.1,495,466.2z M217.5,382.9   C126.2,382.9,52,308.7,52,217.5S126.2,52,217.5,52C308.7,52,383,126.3,383,217.5S308.7,382.9,217.5,382.9z" />
              </svg>
            </span>
            <input
              type="text"
              className="!mb-auto !mt-auto"
              name="st"
              placeholder="Search..."
              defaultValue=""
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
            <div className="st-clear-query-wrap">
              <span className="close_search st-search-close-icon">
                <svg
                  height="15px"
                  style={{ height: "10px", width: "15px", marginTop: "-3px" }}
                  viewBox="0 0 512.001 512.001"
                  width="12px"
                >
                  <path
                    d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717 L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859 c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287 l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285 L284.286,256.002z"
                    fill="#4E3830"
                  />
                </svg>
              </span>
              <span className="input-close-btn" style={{ display: "none" }}>
                Clear
              </span>
            </div>
          </div>
        </div>

        {/* Desktop search icon — SDK attaches click handler to .st-search-icon */}
        <span
          className="st-search-icon desktop_searchIcn st-icon-search hidden lg:flex items-center justify-center w-11 h-11 cursor-pointer shrink-0"
          onClick={() => {
            setTimeout(() => {
              const input = document.querySelector<HTMLInputElement>(
                '#search-desktop input[name="st"]',
              )
              input?.focus()
            }, 50)
          }}
        >
          {searchReady ? (
            <SearchIcon stroke={scrolled ? "black" : "white"} />
          ) : (
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: scrolled ? "black" : "white" }}
            />
          )}
        </span>

        {/* Cart icon — opens the cart drawer */}
        <button
          type="button"
          onClick={openCart}
          aria-label="Cart"
          className={`relative flex items-center justify-center shrink-0 transition-colors duration-300 cursor-pointer
            w-9 h-9 rounded-[10px] border border-[#d2d2d2] bg-white shadow-[0px_0px_8px_0px_rgba(0,0,0,0.12)]
            lg:w-11 lg:h-11 lg:bg-transparent lg:border-none lg:shadow-none lg:rounded-none`}
        >
          <CartIcon
            className={`w-5 h-5 text-[#7f7f7f] lg:w-6 lg:h-6 ${
              scrolled ? "lg:text-black" : "lg:text-white"
            }`}
          />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
              {cartCount}
            </span>
          )}
        </button>

        {/* Mobile menu trigger */}
        <DialogPrimitive.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              className="lg:hidden flex items-center justify-center rounded-full bg-[#3e3e3e] w-9 h-9 shrink-0 shadow-[0px_0px_8px_0px_rgba(0,0,0,0.12),0px_0px_4px_0px_rgba(0,0,0,0.06)] border border-[#d2d2d2]"
              aria-label="Open menu"
            >
              <User size={18} className="text-white" />
            </button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
            <DialogPrimitive.Content className="fixed top-0 right-0 z-[70] h-full w-[min(400px,100vw)] bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <DialogPrimitive.Title className="font-semibold text-base">
                  Menu
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Close menu"
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X size={18} />
                </DialogPrimitive.Close>
              </div>
              <nav className="flex flex-col p-4 gap-1 overflow-y-auto">
                <Link
                  href="/"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium hover:underline"
                >
                  Home
                </Link>
                {menu.items.map((item) => {
                  if (!item.url) return null
                  const url = resolveMenuUrl(
                    item.url,
                    publicStoreDomain,
                    primaryDomainUrl,
                  )
                  const isExternal = !url.startsWith("/")
                  return isExternal ? (
                    <a
                      key={item.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      href={url}
                      prefetch={false}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                  )
                })}
              </nav>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        {/* Desktop account link — external URL, plain anchor */}
        <a
          href="https://www.zop.in/account"
          aria-label="Account"
          className="hidden lg:flex items-center justify-center w-11 h-11 shrink-0"
        >
          <AccountIcon
            stroke={scrolled ? "black" : "white"}
            className="w-6 h-6"
          />
        </a>
      </div>
    </header>
  )
}
