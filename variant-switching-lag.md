# Variant Switching Lag — Root Cause & Fix

## The Problem (zop-react)

When you click a variant button, it calls `router.replace()`. In Next.js App Router, this triggers a **server round-trip** — Next.js fetches a fresh RSC payload, the server re-runs the page function, and only then does the UI update. You're waiting on the network before anything changes visually.

**Current order:** click → wait for URL/server → UI updates

## What zop-hydrogen Does

Hydrogen uses two hooks:

1. **`useOptimisticVariant`** — the moment you click, it immediately swaps the variant in local state using the clicked option values, without waiting for the server. The UI updates instantly.

2. **`useSelectedOptionInUrlParam`** — then, as a side-effect, it syncs the selected options back to the URL. This doesn't block the render.

**Hydrogen order:** click → UI updates immediately → URL catches up

## Proposed Fix for zop-react

Mirror the hydrogen approach:

- Move `selectedOptions` from URL-derived state (`useSearchParams`) into `useState` in `ProductPageClient`
- Update it on click **immediately** (optimistic)
- Use `window.history.replaceState()` to sync the URL as a side-effect — no navigation, no server round-trip

### Files to change

- `components/product/product-page-client.tsx` — replace `useMemo` over `useSearchParams` with `useState` for selected options
- `components/product/product-form.tsx` — accept `onOptionChange` callback instead of calling `router.replace()`
