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
// variant card: Figma part / card header (10843:4481), the header of agent cards (Approval Card,
// Connector Card, Clarifying Question, Memory Manager): 16px, 12px gap, divider below (remove it
// with `border-b-0` for headerless cards), title text/sm/semibold + description text/xs; it wraps,
// keeping the text at least 12rem wide. `media` leads (an Icon Tile), `trailing` follows the text
// (a Badge, a Switch). Audit M3: one header for overlays and cards.
const shellHeaderVariants = cva('group/shell-header flex justify-between gap-4', {
  variants: {
    variant: {
      bar: 'min-h-12 shrink-0 items-center border-b border-overlay-8 bg-background py-2 pr-2 pl-4',
      inline: 'items-start',
      card: 'flex-wrap items-center gap-3 border-b p-4',
    },
  },
  defaultVariants: { variant: 'bar' },
})

type ShellHeaderProps = React.ComponentProps<'div'> &
  VariantProps<typeof shellHeaderVariants> & {
    /** The close control, rendered at the end (each shell passes its own Close). */
    close?: React.ReactNode
    /** Leads the header, e.g. an Icon Tile (Figma card header show tile). */
    media?: React.ReactNode
    /** Follows the text, e.g. a Badge or a Switch (Figma card header trailing). */
    trailing?: React.ReactNode
  }

function ShellHeader({
  className,
  variant = 'bar',
  close,
  media,
  trailing,
  children,
  ...props
}: ShellHeaderProps) {
  return (
    <div
      data-slot="shell-header"
      data-variant={variant}
      className={cn(shellHeaderVariants({ variant }), className)}
      {...props}
    >
      {media}
      <div
        data-slot="shell-header-text"
        className="flex min-w-0 flex-1 flex-col gap-1 group-data-[variant=card]/shell-header:grow group-data-[variant=card]/shell-header:basis-48 group-data-[variant=card]/shell-header:gap-0.5 group-data-[variant=inline]/shell-header:gap-2"
      >
        {children}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      {close}
    </div>
  )
}

/** Title text: bar → text/sm/medium, inline → text/base/semibold, card → text/sm/semibold. */
const shellTitleClassName =
  'text-foreground type-text-sm-medium group-data-[variant=inline]/shell-header:type-text-base-semibold group-data-[variant=card]/shell-header:type-text-sm-semibold'

/** Description text: text/sm/normal muted; card → text/xs/normal. */
const shellDescriptionClassName =
  'type-text-sm-normal text-muted-foreground group-data-[variant=card]/shell-header:type-text-xs-normal'

/** A title for shells without their own (cards): an h3 by default. */
function ShellTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="shell-title" className={cn(shellTitleClassName, className)} {...props} />
}

/** A description for shells without their own (cards). */
function ShellDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="shell-description" className={cn(shellDescriptionClassName, className)} {...props} />
}

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
// variant bar: padded with a top shadow over scrolling content; inline: no padding; card: Figma
// part / card footer (10843:4522), the --muted action bar of agent cards (16 / 12px, wraps).
// align end (default) · between (secondary left) · stretch (full-width buttons, mobile Drawer).
// `note` puts a text/xs muted line first (Figma card footer note); it takes the free space.
// Actions are Buttons (Figma: size sm; secondary outline · neutral, primary default · brand).
const shellFooterVariants = cva('flex items-center gap-2', {
  variants: {
    variant: {
      bar: 'shrink-0 px-4 py-3 shadow-top',
      inline: '',
      card: 'flex-wrap border-t bg-muted px-4 py-3',
    },
    align: {
      end: 'justify-end',
      between: 'justify-between',
      stretch: '*:flex-1',
    },
  },
  defaultVariants: { variant: 'bar', align: 'end' },
})

type ShellFooterProps = React.ComponentProps<'div'> &
  VariantProps<typeof shellFooterVariants> & {
    /** A short text line before the actions, e.g. "You approved this action." */
    note?: React.ReactNode
  }

function ShellFooter({
  className,
  variant = 'bar',
  align = 'end',
  note,
  children,
  ...props
}: ShellFooterProps) {
  return (
    <div
      data-slot="shell-footer"
      data-variant={variant}
      data-align={align}
      className={cn(shellFooterVariants({ variant, align }), className)}
      {...props}
    >
      {note && (
        <p
          data-slot="shell-footer-note"
          className="min-w-30 flex-1 type-text-xs-normal text-muted-foreground"
        >
          {note}
        </p>
      )}
      {children}
    </div>
  )
}

export {
  ShellBody,
  ShellCloseButton,
  ShellDescription,
  ShellFooter,
  ShellHeader,
  ShellTitle,
  shellDescriptionClassName,
  shellFooterVariants,
  shellHeaderVariants,
  shellTitleClassName,
  type ShellFooterProps,
  type ShellHeaderProps,
}
