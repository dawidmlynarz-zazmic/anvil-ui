import * as React from 'react'

import { cn } from '@/lib/utils'
import { TextShimmer } from '@/components/agent/text-shimmer'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Builder › Agent Patterns › States · widget skeleton (10814:3205): the loading
// placeholder of a widget, in the shape of what is coming. Built on Card (--card, --border, radius
// xl, shadow/sm), Text Shimmer (the `label`, "Loading…") and Skeleton blocks (--muted, radius lg),
// 16px padding, 12px apart. Figma `shape`:
// - card (≤320px): a 140px media block, two lines, a 24px button.
// - list (≤560px): four rows of a 36px tile, two lines and a trailing value.
// - table (≤560px): a header and five rows of four cells.
// - chart (≤560px): a title line and eight bars.
// `role="status"` named by the label, `aria-busy`; the blocks are decorative.

type WidgetSkeletonShape = 'card' | 'list' | 'table' | 'chart'

const LIST = [
  ['max-w-80', 'max-w-45'],
  ['max-w-65', 'max-w-35'],
  ['max-w-75', 'max-w-50'],
  ['max-w-55', 'max-w-30'],
]
const TABLE_ROWS = ['max-w-45', 'max-w-40', 'max-w-48', 'max-w-35', 'max-w-43']
const BARS = ['h-15', 'h-22', 'h-18', 'h-30', 'h-25', 'h-35', 'h-28', 'h-38']

function Blocks({ shape }: { shape: WidgetSkeletonShape }) {
  switch (shape) {
    case 'card':
      return (
        <>
          <Skeleton className="h-35 w-full max-w-72" />
          <Skeleton className="h-3.5 w-full max-w-50" />
          <Skeleton className="h-3 w-full max-w-35" />
          <Skeleton className="h-6 w-full max-w-24" />
        </>
      )
    case 'list':
      return LIST.map(([first, second], i) => (
        <div key={i} className="flex w-full items-center gap-3">
          <Skeleton className="size-9 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className={cn('h-3 w-full', first)} />
            <Skeleton className={cn('h-2.5 w-full', second)} />
          </div>
          <Skeleton className="h-3.5 w-14 shrink-0" />
        </div>
      ))
    case 'table':
      return (
        <>
          <div className="flex w-full gap-4">
            <Skeleton className="h-2.5 max-w-45 flex-1" />
            <Skeleton className="h-2.5 max-w-25 flex-1" />
            <Skeleton className="h-2.5 max-w-25 flex-1" />
            <Skeleton className="h-2.5 max-w-25 flex-1" />
          </div>
          {TABLE_ROWS.map((first, i) => (
            <div key={i} className="flex w-full gap-4">
              <Skeleton className={cn('h-3 flex-1', first)} />
              <Skeleton className="h-3 max-w-20 flex-1" />
              <Skeleton className="h-3 max-w-22 flex-1" />
              <Skeleton className="h-3 max-w-18 flex-1" />
            </div>
          ))}
        </>
      )
    case 'chart':
      return (
        <>
          <Skeleton className="h-5 w-full max-w-40" />
          <div className="flex w-full items-end gap-3">
            {BARS.map((height, i) => (
              <Skeleton key={i} className={cn('max-w-11 flex-1', height)} />
            ))}
          </div>
        </>
      )
  }
}

function WidgetSkeleton({
  shape = 'card',
  label = 'Loading…',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** The shape of what is loading. */
  shape?: WidgetSkeletonShape
  /** The status line, e.g. "Loading orders…". */
  label?: string
}) {
  return (
    <Card
      data-slot="widget-skeleton"
      data-shape={shape}
      role="status"
      aria-busy
      aria-label={label}
      className={cn(
        'w-full min-w-0 gap-3 rounded-xl border-border bg-card p-4 shadow-sm',
        shape === 'card' ? 'max-w-80' : 'max-w-140',
        className,
      )}
      {...props}
    >
      <TextShimmer aria-hidden>{label}</TextShimmer>
      <div aria-hidden className="contents">
        <Blocks shape={shape} />
      </div>
    </Card>
  )
}

export { WidgetSkeleton, type WidgetSkeletonShape }
