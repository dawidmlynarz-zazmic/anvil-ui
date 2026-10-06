import * as React from 'react'

import { cn } from '@/lib/utils'
import { ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Card } from '@/components/ui/card'
import { EmptyState, EmptyStateDescription } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody } from '@/components/ui/table'

// Figma Agent Builder › Core Kit › widget table (10663:3199): a data table in an answer. Composed
// from existing parts, nothing re-drawn: Card (radius xl, --border, up to 640px), ShellHeader
// variant card as the toolbar (16 / 12px, title text/base/semibold + row count text/xs muted;
// `actions` at the end), the UI Table (variant flush, density compact, `striped`; sortable heads
// via TableHead `sort` / `onSort`; status cells are Badges), Skeleton rows while `loading`
// (4 × 16px, 12px apart), Empty State for `empty`, and Pagination in the footer (top divider, 8px).
// Figma's table header cell / table cell / table row are the UI Table's parts.

function WidgetTable({
  title,
  rowCount,
  actions,
  header,
  loading = false,
  empty,
  pagination,
  striped = true,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'title'> & {
  title?: React.ReactNode
  /** e.g. "6 rows" (Figma show row count). */
  rowCount?: React.ReactNode
  /** Toolbar actions at the end of the header (Figma show toolbar). */
  actions?: React.ReactNode
  /** The column headings: a TableHeader with TableHead cells (sortable with `sort`). */
  header: React.ReactNode
  /** Figma state loading: skeleton rows under the headings. */
  loading?: boolean
  /** Figma state empty: the message shown instead of rows, e.g. "No rows match this query". */
  empty?: React.ReactNode
  /** A Pagination (Figma show pagination). */
  pagination?: React.ReactNode
  striped?: boolean
  /** The rows (TableRow elements). */
  children?: React.ReactNode
}) {
  const titleId = React.useId()
  return (
    <Card
      data-slot="widget-table"
      aria-busy={loading || undefined}
      className={cn('max-w-160 min-w-0 gap-0 overflow-hidden rounded-xl border-border py-0', className)}
      {...props}
    >
      {(title || rowCount || actions) && (
        <ShellHeader variant="card" className="py-3" trailing={actions}>
          <div className="flex min-w-0 items-baseline gap-2">
            {title && (
              <ShellTitle id={titleId} className="truncate type-text-base-semibold">
                {title}
              </ShellTitle>
            )}
            {rowCount && (
              <span className="shrink-0 type-text-xs-normal text-muted-foreground">{rowCount}</span>
            )}
          </div>
        </ShellHeader>
      )}
      <Table
        variant="flush"
        density="compact"
        striped={striped}
        aria-labelledby={title ? titleId : undefined}
      >
        {header}
        {!loading && !empty && <TableBody>{children}</TableBody>}
      </Table>
      {loading && (
        <div className="flex flex-col gap-3 p-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      )}
      {!loading && empty && (
        <EmptyState className="border-0 px-4 py-8 md:px-4 md:py-8">
          <EmptyStateDescription>{empty}</EmptyStateDescription>
        </EmptyState>
      )}
      {pagination && <div className="flex justify-center border-t py-2">{pagination}</div>}
    </Card>
  )
}

export { WidgetTable }
