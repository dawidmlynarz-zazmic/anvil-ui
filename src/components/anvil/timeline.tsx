import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import type { LucideIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Parts · timeline item (10851:5493): one event in a time-ordered list
// (incidents, activity, audit and change logs, itineraries). Built on Icon Tile (the tile marker).
// - Timeline: the `<ol>`.
// - TimelineItem: a `<li>` of a 44px mono `time` (code/xs --muted-foreground), a rail with the marker and
//   a 2px --border connector to the next event, the text (`title` text/sm, `detail` text/xs
//   --muted-foreground, 12px below), the `actor` (text/xs --foreground-subtle) and an optional `trailing`
//   node (a Badge, a Button). `marker` dot (an 8px disc in a 24×16 box) · tile (a 24px circle Icon Tile
//   with `icon`); `tone` neutral · agent · success · warning · destructive · info. Figma show … booleans
//   = pass the prop or not; `last` drops the connector. The `time` is a `<time>` when you give `dateTime`.

type TimelineTone = 'neutral' | 'agent' | 'success' | 'warning' | 'destructive' | 'info'

const DOT: Record<TimelineTone, string> = {
  neutral: 'bg-foreground-subtle',
  agent: 'bg-agent',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-danger',
  info: 'bg-info',
}

function Timeline({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol data-slot="timeline" className={cn('flex flex-col', className)} {...props} />
}

function TimelineItem({
  time,
  dateTime,
  title,
  detail,
  actor,
  trailing,
  marker = 'dot',
  icon,
  tone = 'neutral',
  last = false,
  className,
  ...props
}: Omit<React.ComponentProps<'li'>, 'title'> & {
  /** The event time, e.g. “09:31”. */
  time?: React.ReactNode
  /** Machine-readable time for the `<time>` element. */
  dateTime?: string
  title: React.ReactNode
  detail?: React.ReactNode
  /** Who did it: “Northwind Labs”, “Maya Chen”. */
  actor?: React.ReactNode
  /** After the actor: a Badge or a Button. */
  trailing?: React.ReactNode
  marker?: 'dot' | 'tile'
  /** The glyph of the tile marker. */
  icon?: LucideIcon
  tone?: TimelineTone
  /** The last event: no connector. */
  last?: boolean
}) {
  const TimeTag = dateTime ? 'time' : 'span'
  return (
    <li
      data-slot="timeline-item"
      data-marker={marker}
      data-tone={tone}
      className={cn('flex items-start gap-3', className)}
      {...props}
    >
      {time && (
        <TimeTag
          {...(dateTime ? { dateTime } : {})}
          className="h-4 w-11 shrink-0 type-code-xs text-muted-foreground"
        >
          {time}
        </TimeTag>
      )}
      <div className="flex flex-col items-center gap-1 self-stretch" aria-hidden>
        {marker === 'tile' && icon ? (
          <IconTile icon={icon} tone={tone} size="xs" shape="circle" />
        ) : (
          <span className="flex h-4 w-6 items-center justify-center">
            <span className={cn('size-2 rounded-full', DOT[tone])} />
          </span>
        )}
        {!last && <span className="min-h-px w-0.5 flex-1 bg-border" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-3">
        <p className="type-text-sm-normal text-foreground">{title}</p>
        {detail && <p className="type-text-xs-normal text-muted-foreground">{detail}</p>}
      </div>
      {actor && <p className="shrink-0 type-text-xs-normal text-foreground-subtle">{actor}</p>}
      {trailing}
    </li>
  )
}

export { Timeline, TimelineItem, type TimelineTone }
