import * as React from 'react'
import { Slot } from 'radix-ui'

import { ChevronRightIcon, EllipsisIcon, Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Breadcrumbs page → `breadcrumbs` (6223:29124). Hierarchical trail, 8px apart: links
// text/sm/medium --foreground (hover underline, focus ring: not drawn, CLAUDE.md gaps), the current
// page text/sm/normal --foreground-subtle, 12px chevron separators in --foreground-disabled. Figma's
// optional back button and project avatar are content: a Button (icon-xs) / Avatar in an item.

function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-2 type-text-sm-medium break-words text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-2', className)} {...props} />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'a'

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'rounded-xs underline-offset-4 outline-none hover:underline focus-visible:focus-ring',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('type-text-sm-normal text-foreground-subtle', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('text-foreground-disabled [&>svg]:size-3', className)}
      {...props}
    >
      {children ?? <Icon icon={ChevronRightIcon} size="xs" />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-6 items-center justify-center text-foreground-subtle', className)}
      {...props}
    >
      <Icon icon={EllipsisIcon} />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
