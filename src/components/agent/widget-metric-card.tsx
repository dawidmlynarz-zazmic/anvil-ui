import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Icon, type LucideIcon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Builder › Core Kit › widget metric card (10663:2929) and widget metric group
// (10663:3065). Built from existing parts (no re-drawn elements): Card (radius xl, --border, 160px
// min, 8px gap; 16px padding, 12px when compact), the delta is a Badge (subtle, sm: up = success,
// down = destructive, neutral), loading is Skeleton (28px value, 16px delta). Label text/xs muted (one line) with an optional 16px icon at the end; value
// heading/3xl (compact heading/2xl); period text/xs muted after the delta. `trend` drives the delta
// tone. Figma state loaded · loading → `loading`. WidgetMetricGroup: a wrapping
// row, 12px apart, each card filling its share.

type Trend = 'up' | 'down' | 'neutral'

const DELTA_TONE: Record<Trend, 'success' | 'destructive' | 'neutral'> = {
  up: 'success',
  down: 'destructive',
  neutral: 'neutral',
}

function WidgetMetricCard({
  label,
  value,
  delta,
  period,
  trend = 'neutral',
  icon,
  size = 'default',
  loading = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'size'> & {
  label: React.ReactNode
  value?: React.ReactNode
  /** The change, e.g. "+12.4%" (Figma show delta). */
  delta?: React.ReactNode
  /** What the delta compares to, e.g. "vs last month". */
  period?: React.ReactNode
  trend?: Trend
  icon?: LucideIcon
  size?: 'default' | 'compact'
  /** Figma state loading: skeletons in place of the value and delta. */
  loading?: boolean
}) {
  const compact = size === 'compact'
  return (
    <Card
      data-slot="widget-metric-card"
      data-size={size}
      aria-busy={loading || undefined}
      className={cn(
        'min-w-40 gap-2 rounded-xl border-border px-(--card-padding)',
        compact && '[--card-padding:--spacing(3)]',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate type-text-xs-normal text-muted-foreground">{label}</span>
        {icon && <Icon icon={icon} className="text-muted-foreground" />}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-16" />
        </>
      ) : (
        <>
          <span className={cn('text-foreground', compact ? 'type-heading-2xl' : 'type-heading-3xl')}>
            {value}
          </span>
          {(delta || period) && (
            <div className="flex min-w-0 items-center gap-2">
              {delta && (
                <Badge variant="subtle" tone={DELTA_TONE[trend]} size="sm" className="min-w-5">
                  {delta}
                </Badge>
              )}
              {period && <span className="truncate type-text-xs-normal text-muted-foreground">{period}</span>}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

function WidgetMetricGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="widget-metric-group"
      className={cn('flex flex-wrap gap-3 *:flex-1', className)}
      {...props}
    />
  )
}

export { WidgetMetricCard, WidgetMetricGroup }
