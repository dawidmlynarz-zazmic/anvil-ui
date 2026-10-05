import * as React from 'react'

import { buttonVariants, type Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon, Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Pagination page → `pagination` (10892:479). Links are Buttons at size sm (32px,
// text/xs/semibold) 4px apart: pages, Previous and Next ghost · neutral, the current page outline ·
// neutral. Ellipsis 32px with a 14px icon. Figma `current` first · last disables Previous / Next:
// pass `aria-disabled` (links cannot be `disabled`) — Button's disabled look (30%). Figma `type`
// compact = Previous, a "Page n of m" text item (text/sm/normal, muted) and Next.

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

function PaginationLink({ className, isActive, size = 'sm', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          intent: 'neutral',
          size,
        }),
        'min-w-8 aria-disabled:pointer-events-none aria-disabled:opacity-30',
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn('gap-2', className)} {...props}>
      <Icon icon={ChevronLeftIcon} />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn('gap-2', className)} {...props}>
      <span className="hidden sm:block">Next</span>
      <Icon icon={ChevronRightIcon} />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-8 items-center justify-center text-foreground', className)}
      {...props}
    >
      <Icon icon={EllipsisIcon} className="size-3.5" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
