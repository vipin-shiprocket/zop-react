import type { ReactNode } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ProductInfoTabsProps {
  descriptionHtml: string
  keyFeatures?: string | null
  shippingReturn?: string | null
  materialCare?: string | null
  manufacturedBy?: string | null
  soldBy?: string | null
  reviewsContent?: ReactNode
}

const FALLBACK_SHIPROCKET_HTML = `
  <p><b>Shiprocket Merchant App Private Limited</b></p>
  <p>Block A, 35 Technopark, Technopark Junction, Kinfra, Kakkanad, Kochi, Kerala 682030, India</p>
  <p>Country of Origin: India</p>
  <p>Email: <a href="mailto:support@shiprocket.in">support@shiprocket.in</a></p>
`

export function ProductInfoTabs({
  descriptionHtml,
  keyFeatures,
  shippingReturn,
  materialCare,
  manufacturedBy,
  soldBy,
  reviewsContent,
}: ProductInfoTabsProps) {
  const productDetailsHtml = [descriptionHtml, keyFeatures]
    .filter(Boolean)
    .join("")

  const showFallback = !manufacturedBy && !soldBy
  const additionalInfoContent = [
    materialCare,
    manufacturedBy
      ? `<h4 style="font-weight: bold; margin-bottom: 0.5rem;">Manufactured by</h4>${manufacturedBy}`
      : showFallback
        ? `<h4 style="font-weight: bold; margin-bottom: 0.5rem;">Manufactured by</h4>${FALLBACK_SHIPROCKET_HTML}`
        : null,
    soldBy
      ? `<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">Sold by</h4>${soldBy}`
      : null,
  ]
    .filter(Boolean)
    .join("")

  const tabs = [
    {
      value: "product-details",
      label: "Product Details",
      content: productDetailsHtml,
    },
    {
      value: "shipping-return",
      label: "Shipping & Return",
      content: shippingReturn,
    },
    {
      value: "additional-info",
      label: "Additional Information",
      content: additionalInfoContent,
    },
  ]

  const visibleTabs = tabs.filter((t) => t.content)

  if (visibleTabs.length === 0 && !reviewsContent) return null

  const allItems: Array<{
    value: string
    label: string
    html: string | null
    node: ReactNode | null
  }> = [
    ...(reviewsContent
      ? [
          {
            value: "customer-reviews",
            label: "Customer Reviews",
            html: null,
            node: reviewsContent,
          },
        ]
      : []),
    ...visibleTabs.map((tab) => ({
      value: tab.value,
      label: tab.label,
      html: tab.content!,
      node: null as ReactNode,
    })),
  ]

  return (
    <div className="space-y-3">
      {allItems.map((item) => (
        <Accordion
          key={item.value}
          type="single"
          collapsible
          className="rounded-lg border"
        >
          <AccordionItem value={item.value} className="border-b-0">
            <AccordionTrigger className="min-h-11 text-lg font-semibold">
              {item.label}
            </AccordionTrigger>
            <AccordionContent>
              {item.node ?? (
                <div
                  className="text-sm text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: item.html! }}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  )
}
