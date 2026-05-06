"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
      className,
    )}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  side?: "top" | "bottom" | "left" | "right"
  showClose?: boolean
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "bottom", showClose = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-background shadow-lg outline-none transition-transform duration-200",
        side === "bottom" &&
          "inset-x-0 bottom-0 rounded-t-2xl data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full",
        side === "top" &&
          "inset-x-0 top-0 rounded-b-2xl data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-full",
        side === "left" &&
          "inset-y-0 left-0 w-3/4 max-w-sm data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
        side === "right" &&
          "inset-y-0 right-0 w-3/4 max-w-sm data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = "SheetContent"

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetTitle,
  SheetDescription,
}
