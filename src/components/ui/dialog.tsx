import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as DialogPrimitive } from 'radix-ui'

import {
  ShellCloseButton,
  ShellFooter,
  ShellHeader,
  shellDescriptionClassName,
  shellTitleClassName,
  type ShellFooterProps,
  type ShellHeaderProps,
} from '@/components/anvil/shell'
import { cn } from '@/lib/utils'

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
        'duration-(--duration-base) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
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
    'inset-ring inset-ring-overlay-16 shadow-elevation-modal',
    'duration-(--duration-base) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
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
  VariantProps<typeof dialogContentVariants>

const FOCUSABLE = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])'

function DialogContent({
  className,
  size = 'default',
  children,
  onOpenAutoFocus,
  ...props
}: DialogContentProps) {
  // The close button comes first in the DOM (header), so Radix would focus it. Start in the body
  // instead when it has a control, e.g. the first field of a form.
  const handleOpenAutoFocus = (event: Event) => {
    onOpenAutoFocus?.(event)
    if (event.defaultPrevented) return
    const content = event.target instanceof HTMLElement ? event.target : null
    const first = content?.querySelector<HTMLElement>(
      `[data-slot=dialog-body] :is(${FOCUSABLE}):not(:disabled)`,
    )
    if (first) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        className={cn(dialogContentVariants({ size }), className)}
        onOpenAutoFocus={handleOpenAutoFocus}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

type DialogHeaderProps = Omit<ShellHeaderProps, 'close'> & {
  /** Renders the close button at the end of the header (default true). */
  showCloseButton?: boolean
}

function DialogHeader({ showCloseButton = true, ...props }: DialogHeaderProps) {
  return (
    <ShellHeader
      data-slot="dialog-header"
      close={
        showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <ShellCloseButton />
          </DialogPrimitive.Close>
        ) : undefined
      }
      {...props}
    />
  )
}

/** Figma `modal-content` slot: scrolls when the dialog hits the viewport height. */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  // When it overflows, the body becomes focusable so keyboard users can scroll it.
  const ref = React.useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScrollable(el.scrollHeight > el.clientHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-slot="dialog-body"
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-ring',
        className,
      )}
      {...props}
    />
  )
}

function DialogFooter(props: ShellFooterProps) {
  return <ShellFooter data-slot="dialog-footer" {...props} />
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
  type DialogHeaderProps,
}
