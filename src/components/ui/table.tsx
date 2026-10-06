import * as React from 'react'

import { cn } from '@/lib/utils'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, Icon } from '@/components/ui/icon'

// Figma: Table page → `table` (8254:1575), `.table-header`, `.table-row-default`, `table cells`.
// Figma `type` → `variant` contained (the container: radius lg, 1px --overlay-16 stroke; rows on
// --background with --overlay-8 dividers, hover --muted) · ghost (no frame or dividers; rows hover
// --overlay-4 with rounded ends). Rows 56px; cells padding 16 / 8 inside the row's 8px padding.
// Header cells text/sm/semibold --foreground-subtle; body cells text/sm/medium --foreground.
// Selected rows (data-state=selected) → --muted. Figma cell types are content: checkbox, link,
// actions (icon buttons), slot.
// Agent widgets reuse this table (Core Kit's table header cell / cell / row duplicate these parts):
// `variant` flush = contained's dividers without the frame (inside a card); `density` compact
// (Figma table row density compact: 40px rows, 12 / 8px cells, header text/xs/semibold
// --muted-foreground, body text/sm/normal); `striped` (Figma stripe even = --border-alpha-4);
// TableHead `sort` none · asc · desc + `onSort` (a sort button with an arrow, aria-sort).

type TableVariant = 'contained' | 'ghost' | 'flush'

function Table({
  className,
  variant = 'contained',
  density = 'default',
  striped = false,
  ...props
}: React.ComponentProps<'table'> & {
  variant?: TableVariant
  /** compact: 40px rows (agent widgets, Figma table row density compact). */
  density?: 'default' | 'compact'
  /** Tints every other body row (Figma stripe). */
  striped?: boolean
}) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant}
      data-dividers={variant !== 'ghost' || undefined}
      data-density={density}
      data-striped={striped || undefined}
      className={cn(
        'group/table relative w-full overflow-x-auto',
        // A border, not an inset ring: the cells' --background would paint over a ring.
        variant === 'contained' && 'rounded-lg border border-overlay-16',
      )}
    >
      <table
        data-slot="table"
        className={cn(
          'w-full caption-bottom border-separate border-spacing-0 type-text-sm-medium group-data-[density=compact]/table:type-text-sm-normal',
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
  'group-data-[density=compact]/table:h-10 group-data-[density=compact]/table:px-3 group-data-[density=compact]/table:py-2 group-data-[density=compact]/table:first:pl-3 group-data-[density=compact]/table:last:pr-3',
  // contained and flush: dividers between rows, --background, hover --muted.
  'group-data-dividers/table:border-b group-data-dividers/table:border-overlay-8 group-data-dividers/table:bg-background',
  'group-data-dividers/table:in-data-[slot=table-body]:group-last/row:border-b-0',
  'group-data-striped/table:in-data-[slot=table-body]:group-even/row:bg-border-alpha-4',
  'group-data-dividers/table:in-data-[slot=table-body]:group-hover/row:bg-muted',
  // ghost: hover --overlay-4 with rounded ends.
  'group-data-[variant=ghost]/table:first:rounded-l-md group-data-[variant=ghost]/table:last:rounded-r-md',
  'group-data-[variant=ghost]/table:in-data-[slot=table-body]:group-hover/row:bg-overlay-4',
  'group-data-[state=selected]/row:bg-muted! [&:has([role=checkbox])]:w-9 [&:has([role=checkbox])]:pr-0',
)

const SORT_ICON = { none: ArrowUpDownIcon, asc: ArrowUpIcon, desc: ArrowDownIcon } as const
const ARIA_SORT = { none: 'none', asc: 'ascending', desc: 'descending' } as const

function TableHead({
  className,
  sort,
  onSort,
  children,
  ...props
}: React.ComponentProps<'th'> & {
  /** Makes the column sortable: the current order (Figma sort none · asc · desc). */
  sort?: 'none' | 'asc' | 'desc'
  onSort?: () => void
}) {
  return (
    <th
      data-slot="table-head"
      data-sort={sort}
      aria-sort={sort ? ARIA_SORT[sort] : undefined}
      className={cn(
        cellClassName,
        'text-left type-text-sm-semibold text-foreground-subtle',
        'group-data-[density=compact]/table:h-9 group-data-[density=compact]/table:type-text-xs-semibold group-data-[density=compact]/table:text-muted-foreground',
        className,
      )}
      {...props}
    >
      {sort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:focus-ring',
            sort !== 'none' && 'text-foreground',
          )}
        >
          {children}
          <Icon icon={SORT_ICON[sort]} className="size-3.5" />
        </button>
      ) : (
        children
      )}
    </th>
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
