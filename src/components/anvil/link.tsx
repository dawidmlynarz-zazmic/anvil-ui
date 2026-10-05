import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Link page → `link` (8465:2320). An inline text link with optional icons (the API Contract's
// Link; shadcn's link styles on an anchor). `intent` brand (--foreground-link → --info-medium on
// hover) · neutral (--foreground) · inverse (--button-neutral-foreground, for inverse surfaces) ·
// destructive (--danger → --danger-medium; --danger-medium in dark, where --danger is under 4.5:1).
// `size` default (text/sm/semibold, 8px icon gap, 16px icons) · sm (text/xs/semibold, 4px, 12px).
// Every intent underlines on hover (Figma changes only brand and destructive colors). Focus →
// focus/ring; disabled (`aria-disabled`, anchors can't be disabled) → 30% as drawn. `asChild` for
// router links.

const linkVariants = cva(
  [
    'inline-flex w-fit items-center rounded-sm underline-offset-4 outline-none',
    'transition-colors duration-(--duration-fast) hover:underline focus-visible:focus-ring',
    'aria-disabled:pointer-events-none aria-disabled:opacity-30',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      intent: {
        brand: 'text-foreground-link hover:text-info-medium',
        neutral: 'text-foreground',
        inverse: 'text-button-neutral-foreground',
        destructive: 'text-danger hover:text-danger-medium dark:text-danger-medium',
      },
      size: {
        default: "gap-2 type-text-sm-semibold [&_svg:not([class*='size-'])]:size-4",
        sm: "gap-1 type-text-xs-semibold [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: { intent: 'brand', size: 'default' },
  },
)

function Link({
  className,
  intent,
  size,
  disabled = false,
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<'a'> &
  VariantProps<typeof linkVariants> & {
    /** Renders aria-disabled, drops it from the tab order and ignores clicks. */
    disabled?: boolean
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'a'
  return (
    <Comp
      data-slot="link"
      data-intent={intent ?? 'brand'}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      className={cn(linkVariants({ intent, size }), className)}
      {...props}
    />
  )
}

export { Link, linkVariants }
