import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma: Table page → `table` (8254:1575), `.table-header`, `.table-row-default`, `table cells`.
// Figma `type` → `variant` contained (the container: radius lg, 1px --overlay-16 stroke; rows on
// --background with --overlay-8 dividers, hover --muted) · ghost (no frame or dividers; rows hover
// --overlay-4 with rounded ends). Rows 56px; cells padding 16 / 8 inside the row's 8px padding.
// Header cells text/sm/semibold --foreground-subtle; body cells text/sm/medium --foreground.
// Selected rows (data-state=selected) → --muted. Figma cell types are content: checkbox, link,
// actions (icon buttons), slot.

type TableVariant = 'contained' | 'ghost'

function Table({
  className,
  variant = 'contained',
  ...props
}: React.ComponentProps<'table'> & { variant?: TableVariant }) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant}
      className={cn(
        'group/table relative w-full overflow-x-auto',
        // A border, not an inset ring: the cells' --background would paint over a ring.
        variant === 'contained' && 'rounded-lg border border-overlay-16',
      )}
    >
      <table
        data-slot="table"
        className={cn(
          'w-full caption-bottom border-separate border-spacing-0 type-text-sm-medium',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={className} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted type-text-sm-medium [&_td]:border-t [&_td]:border-overlay-8', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={cn('group/row', className)} {...props} />
}

// Cells carry the row look (separate borders let the ghost hover round its ends).
const cellClassName = cn(
  'h-14 px-2 py-4 align-middle whitespace-nowrap first:pl-4 last:pr-4 transition-colors duration-(--duration-fast)',
  // contained: dividers between rows, --background, hover --muted.
  'group-data-[variant=contained]/table:border-b group-data-[variant=contained]/table:border-overlay-8 group-data-[variant=contained]/table:bg-background',
  'group-data-[variant=contained]/table:in-data-[slot=table-body]:group-last/row:border-b-0',
  'group-data-[variant=contained]/table:in-data-[slot=table-body]:group-hover/row:bg-muted',
  // ghost: hover --overlay-4 with rounded ends.
  'group-data-[variant=ghost]/table:first:rounded-l-md group-data-[variant=ghost]/table:last:rounded-r-md',
  'group-data-[variant=ghost]/table:in-data-[slot=table-body]:group-hover/row:bg-overlay-4',
  'group-data-[state=selected]/row:bg-muted! [&:has([role=checkbox])]:w-9 [&:has([role=checkbox])]:pr-0',
)

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(cellClassName, 'text-left type-text-sm-semibold text-foreground-subtle', className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn(cellClassName, 'text-foreground', className)} {...props} />
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 type-text-sm-normal text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
