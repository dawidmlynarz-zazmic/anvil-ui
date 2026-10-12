import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { Badge } from '@/components/ui/badge'
import {
  CircleCheckIcon,
  Icon,
  RefreshCcwIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Split canvas · sync indicator (10744:3903): whether the canvas
// and the chat agree. Built on Badge (subtle, pill, 24px, text/xs/medium in the tone's strong text),
// nothing re-drawn. Figma state → `status`: updating (agent, Pulse Dot) · synced (success, circle
// check) · out-of-date (warning, refresh) · conflict (destructive, triangle). `children` is the
// label; `actions` (ghost xs pill Buttons: Update · Keep mine · Use the assistant's) sit inside the
// pill, which tightens its end padding. It is a polite status region, so changes are announced.

type SyncStatus = 'updating' | 'synced' | 'out-of-date' | 'conflict'

const STATUS: Record<
  SyncStatus,
  { tone: 'agent' | 'success' | 'warning' | 'destructive'; icon?: LucideIcon }
> = {
  updating: { tone: 'agent' },
  synced: { tone: 'success', icon: CircleCheckIcon },
  'out-of-date': { tone: 'warning', icon: RefreshCcwIcon },
  conflict: { tone: 'destructive', icon: TriangleAlertIcon },
}

function SyncIndicator({
  status = 'synced',
  actions,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> & {
  status?: SyncStatus
  /** ghost xs pill Buttons inside the pill, e.g. Update, or Keep mine + Use the assistant's. */
  actions?: React.ReactNode
}) {
  const { tone, icon } = STATUS[status]
  return (
    <Badge
      data-slot="sync-indicator"
      data-status={status}
      role="status"
      variant="subtle"
      tone={tone}
      shape="pill"
      className={cn(
        'h-6 max-w-full gap-1.5 ps-2 pe-2.5 type-text-xs-medium',
        actions && 'pe-1',
        '[&>svg]:size-3.5',
        className,
      )}
      {...props}
    >
      {icon ? <Icon icon={icon} /> : <PulseDot />}
      <span className="truncate">{children}</span>
      {actions && <span className="flex shrink-0 items-center">{actions}</span>}
    </Badge>
  )
}

export { SyncIndicator, type SyncStatus }
