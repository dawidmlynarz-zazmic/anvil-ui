import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as SheetPrimitive } from 'radix-ui'

import {
  ShellBody,
  ShellCloseButton,
  ShellFooter,
  ShellHeader,
  shellDescriptionClassName,
  shellTitleClassName,
  type ShellFooterProps,
  type ShellHeaderProps,
} from '@/components/anvil/shell'
import { cn } from '@/lib/utils'
import { modalMotion, panelMotion } from '@/lib/motion'

// Figma: Dialog · Sheet · Drawer page → `sheet` (10935:40686). Panel that slides in from a screen
// edge for secondary tasks, filters and settings; use instead of Dialog when the user should keep
// the page context. ShellHeader (bar) + body (Figma `content` slot) + ShellFooter (bar).
// `side` right · left (400px, full height) · top · bottom (full width). Overlay is a sibling.

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-(--z-overlay) bg-overlay',
        modalMotion,
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

const sheetContentVariants = cva(
  [
    'fixed z-(--z-modal) flex flex-col bg-background text-foreground outline-none',
    // A real border (Figma inside stroke): an inset ring is painted under the header and footer
    // bars' backgrounds, which left the outline around the body only.
    'border border-overlay-16 shadow-elevation-modal',
    panelMotion,
    'data-[state=closed]:animate-out data-[state=open]:animate-in',
  ],
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-full w-full max-w-100 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        left: 'inset-y-0 left-0 h-full w-full max-w-100 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        top: 'inset-x-0 top-0 h-auto max-h-[80dvh] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 h-auto max-h-[80dvh] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetContentVariants> & {
    showCloseButton?: boolean
  }

// As in shadcn, the content renders the close button last (Radix's initial focus lands on the first
// body control); Figma draws it in the header bar, so it is positioned there.
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-close-button={showCloseButton || undefined}
        className={cn(sheetContentVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close asChild>
            <ShellCloseButton data-slot="sheet-close-button" className="absolute top-2 right-2" />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

/** ShellHeader (bar); leaves room for the content's close button. */
function SheetHeader({ className, ...props }: Omit<ShellHeaderProps, 'close'>) {
  return (
    <ShellHeader
      data-slot="sheet-header"
      className={cn('in-data-close-button:pr-12', className)}
      {...props}
    />
  )
}

/** Figma `content` slot (ShellBody): 16px padding and gap, scrolls. */
function SheetBody(props: React.ComponentProps<'div'>) {
  return <ShellBody data-slot="sheet-body" {...props} />
}

function SheetFooter(props: ShellFooterProps) {
  return <ShellFooter data-slot="sheet-footer" {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title data-slot="sheet-title" className={cn(shellTitleClassName, className)} {...props} />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(shellDescriptionClassName, className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  sheetContentVariants,
  type SheetContentProps,
}
