import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// shadcn Empty, named Empty State in Anvil (the Figma name).
// Figma: Empty state page → `empty state` (1623:6410). Placeholder for empty lists and zero-data
// views: a centered column, 16px apart — media (48px icon or illustration), header (title
// heading/xl --foreground, description text/sm/normal --foreground-subtle, 8px apart), content
// (actions: Button default · neutral, optional link).

function EmptyState({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border-dashed border-border p-6 text-center text-balance md:p-12',
        className,
      )}
      {...props}
    />
  )
}

function EmptyStateHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-header"
      className={cn('flex max-w-sm flex-col items-center gap-2 text-center', className)}
      {...props}
    />
  )
}

const emptyStateMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: "bg-transparent [&_svg:not([class*='size-'])]:size-12",
        icon: "size-12 rounded-lg bg-muted [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function EmptyStateMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyStateMediaVariants>) {
  return (
    <div
      data-slot="empty-state-icon"
      data-variant={variant}
      className={cn(emptyStateMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyStateTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-title"
      className={cn('type-heading-xl text-foreground', className)}
      {...props}
    />
  )
}

function EmptyStateDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-state-description"
      className={cn(
        'type-text-sm-normal text-foreground-subtle [&>a]:text-foreground-link [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

function EmptyStateContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 type-text-sm-normal text-balance',
        className,
      )}
      {...props}
    />
  )
}

export {
  EmptyState,
  EmptyStateHeader,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateMedia,
}
