import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '@/components/ui/button'
import { Icon, XIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Dialog · Sheet · Drawer page → `.shell header` (10960:223) and `.shell footer` (10960:260),
// shared by every shell: Dialog, Alert Dialog, Sheet, Drawer, Popover and Card. Each shell wraps
// these with its own Title / Description / Close (e.g. DialogTitle) so Radix wires up the a11y.
// The overlay is a sibling of the shell (DialogOverlay …), never part of it.

// ── Header ────────────────────────────────────────────────────────────────────────────────
// variant bar: padded, 48px, divider below (Dialog, Sheet, Drawer).
// variant inline: no padding, the container pads it (Alert Dialog, Popover, Card).
const shellHeaderVariants = cva('group/shell-header flex justify-between gap-4', {
  variants: {
    variant: {
      bar: 'min-h-12 shrink-0 items-center border-b border-overlay-8 bg-background py-2 pr-2 pl-4',
      inline: 'items-start',
    },
  },
  defaultVariants: { variant: 'bar' },
})

type ShellHeaderProps = React.ComponentProps<'div'> &
  VariantProps<typeof shellHeaderVariants> & {
    /** The close control, rendered at the end (each shell passes its own Close). */
    close?: React.ReactNode
  }

function ShellHeader({ className, variant = 'bar', close, children, ...props }: ShellHeaderProps) {
  return (
    <div
      data-slot="shell-header"
      data-variant={variant}
      className={cn(shellHeaderVariants({ variant }), className)}
      {...props}
    >
      <div
        data-slot="shell-header-text"
        className="flex min-w-0 flex-1 flex-col gap-1 group-data-[variant=inline]/shell-header:gap-2"
      >
        {children}
      </div>
      {close}
    </div>
  )
}

/** Title text: bar → text/sm/medium, inline → text/base/semibold. For a shell's own *Title. */
const shellTitleClassName =
  'text-foreground type-text-sm-medium group-data-[variant=inline]/shell-header:type-text-base-semibold'

/** Description text (text/sm/normal, muted). For a shell's own *Description. */
const shellDescriptionClassName = 'type-text-sm-normal text-muted-foreground'

/** Figma close: icon button ghost · neutral · icon-sm with an X. Use with a shell's Close asChild. */
function ShellCloseButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="shell-close"
      variant="ghost"
      intent="neutral"
      size="icon-sm"
      aria-label="Close"
      className={cn('shrink-0', className)}
      {...props}
    >
      <Icon icon={XIcon} />
    </Button>
  )
}

// ── Body ──────────────────────────────────────────────────────────────────────────────────
// Figma content / modal-content slot of bar shells (Dialog, Sheet, Drawer): 16px padding and gap.
// Scrolls when the shell hits its max height, and becomes focusable only while it overflows so
// keyboard users can scroll it.
function ShellBody({ className, ...props }: React.ComponentProps<'div'>) {
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
      data-slot="shell-body"
      data-shell-body=""
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-ring',
        className,
      )}
      {...props}
    />
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────────────────
// variant bar: padded with a top shadow over scrolling content; inline: no padding.
// align end (default) · between (secondary left) · stretch (full-width buttons, mobile Drawer).
// Actions are Buttons (Figma: size sm; secondary outline · neutral, primary default · brand).
const shellFooterVariants = cva('flex items-center gap-2', {
  variants: {
    variant: {
      bar: 'shrink-0 px-4 py-3 shadow-top',
      inline: '',
    },
    align: {
      end: 'justify-end',
      between: 'justify-between',
      stretch: '*:flex-1',
    },
  },
  defaultVariants: { variant: 'bar', align: 'end' },
})

type ShellFooterProps = React.ComponentProps<'div'> & VariantProps<typeof shellFooterVariants>

function ShellFooter({ className, variant = 'bar', align = 'end', ...props }: ShellFooterProps) {
  return (
    <div
      data-slot="shell-footer"
      data-variant={variant}
      data-align={align}
      className={cn(shellFooterVariants({ variant, align }), className)}
      {...props}
    />
  )
}

export {
  ShellBody,
  ShellCloseButton,
  ShellFooter,
  ShellHeader,
  shellDescriptionClassName,
  shellFooterVariants,
  shellHeaderVariants,
  shellTitleClassName,
  type ShellFooterProps,
  type ShellHeaderProps,
}
