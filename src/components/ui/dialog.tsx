import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as DialogPrimitive } from 'radix-ui'

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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { modalMotion } from '@/lib/motion'

// Figma: Dialog · Sheet · Drawer page → `dialog` (8255:1298). Centered modal: ShellHeader (bar) +
// body (Figma `modal-content` slot, 16px padding and gap) + ShellFooter (bar). `size` sm · default ·
// lg (400 / 480 / 640). Overlay (--overlay scrim) is a sibling of the content.
// Use Alert Dialog for destructive confirmations, Sheet for side tasks, Drawer on mobile.

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
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

const dialogContentVariants = cva(
  [
    'fixed top-1/2 left-1/2 z-(--z-modal) flex w-[calc(100%-(--spacing(8)))] -translate-x-1/2 -translate-y-1/2 flex-col',
    'max-h-[calc(100dvh-(--spacing(8)))] overflow-hidden rounded-xl bg-background text-foreground outline-none',
    // A real border (Figma inside stroke): an inset ring is painted under the header and footer
    // bars' backgrounds, which left the outline around the body only.
    'border border-overlay-16 shadow-elevation-modal',
    modalMotion,
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-100',
        default: 'max-w-120',
        lg: 'max-w-160',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContentVariants> & {
    showCloseButton?: boolean
  }

// As in shadcn, the content renders the close button last (so Radix's initial focus lands on the
// first control in the body); Figma draws it in the header bar, so it is positioned there.
function DialogContent({
  className,
  size = 'default',
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        data-close-button={showCloseButton || undefined}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <ShellCloseButton data-slot="dialog-close-button" className="absolute top-2 right-2" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/** ShellHeader (bar); leaves room for the content's close button. */
function DialogHeader({ className, ...props }: Omit<ShellHeaderProps, 'close'>) {
  return (
    <ShellHeader
      data-slot="dialog-header"
      className={cn('in-data-close-button:pr-12', className)}
      {...props}
    />
  )
}

/** Figma `modal-content` slot (ShellBody): 16px padding and gap, scrolls at the viewport height. */
function DialogBody(props: React.ComponentProps<'div'>) {
  return <ShellBody data-slot="dialog-body" {...props} />
}

function DialogFooter({
  showCloseButton = false,
  children,
  ...props
}: ShellFooterProps & {
  showCloseButton?: boolean
}) {
  return (
    <ShellFooter data-slot="dialog-footer" {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button size="sm" variant="outline" intent="neutral">
            Close
          </Button>
        </DialogPrimitive.Close>
      )}
    </ShellFooter>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(shellTitleClassName, className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(shellDescriptionClassName, className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
  type DialogContentProps,
}
