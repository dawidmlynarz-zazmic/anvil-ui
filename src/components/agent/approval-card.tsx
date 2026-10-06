import * as React from 'react'

import { cn } from '@/lib/utils'
import { ShellDescription, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Icon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'

// Figma Agent Builder › Core Kit › approval card (10728:2418): confirmation before an action with
// side effects. --card, border, radius xl, shadow-sm, max 640px. Header (16px, divider): 32px
// radius-lg tile + title text/sm/semibold + subtitle text/xs muted + a Badge (subtle, xs,
// indicator). Details (16px, 10px
// gap): ApprovalCardField rows (96px label column) and an optional warning `note` (Alert, size xs). Then either
// ShellFooter variant card (--muted bar, `note`) or ActionStatus (Figma action status:
// executing --agent-subtle with pulse + progress · failed --danger-subtle · expired --muted).
// Figma `state` → `status` (domain status, never an interaction state). Denied and expired dim
// the details with --muted-foreground instead of Figma's 55% opacity (contrast).

type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'executing' | 'failed' | 'expired'

const TILE: Record<ApprovalStatus, { icon: LucideIcon; tone: 'warning' | 'success' | 'destructive' }> = {
  pending: { icon: ShieldAlertIcon, tone: 'warning' },
  approved: { icon: ShieldCheckIcon, tone: 'success' },
  denied: { icon: ShieldXIcon, tone: 'destructive' },
  executing: { icon: ShieldAlertIcon, tone: 'warning' },
  failed: { icon: ShieldAlertIcon, tone: 'warning' },
  expired: { icon: ShieldAlertIcon, tone: 'warning' },
}

const BADGE: Record<
  ApprovalStatus,
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'destructive' }
> = {
  pending: { label: 'Needs your approval', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  denied: { label: 'Denied', tone: 'destructive' },
  executing: { label: 'Needs your approval', tone: 'warning' },
  failed: { label: 'Failed', tone: 'destructive' },
  expired: { label: 'Expired', tone: 'neutral' },
}

function ApprovalCard({
  status = 'pending',
  title,
  subtitle,
  badge,
  note,
  footer,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  status?: ApprovalStatus
  title: React.ReactNode
  /** The action, e.g. "Action: Gmail · send message". */
  subtitle?: React.ReactNode
  /** Overrides the status label, e.g. "Approved · sent 14:22". */
  badge?: React.ReactNode
  /** Warning shown above the actions while pending, e.g. "This can't be undone once sent." */
  note?: React.ReactNode
  /** ShellFooter variant="card" (pending · approved · denied) or ActionStatus (executing · failed · expired). */
  footer?: React.ReactNode
}) {
  const titleId = React.useId()
  const tile = TILE[status]
  const tag = BADGE[status]
  return (
    <article
      data-slot="approval-card"
      data-status={status}
      aria-labelledby={titleId}
      className={cn(
        'group/approval flex w-full max-w-160 flex-col wrap-break-word overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <ShellHeader
        variant="card"
        media={<IconTile icon={tile.icon} tone={tile.tone} size="sm" />}
        trailing={
          <Badge data-slot="approval-card-badge" variant="subtle" tone={tag.tone} size="xs" indicator>
            {badge ?? tag.label}
          </Badge>
        }
      >
        <ShellTitle id={titleId}>{title}</ShellTitle>
        {subtitle && <ShellDescription>{subtitle}</ShellDescription>}
      </ShellHeader>
      {(children || (note && status === 'pending')) && (
        <div className="flex flex-col gap-2.5 p-4">
          {children}
          {note && status === 'pending' && (
            <Alert data-slot="approval-card-note" role="note" tone="warning" size="xs">
              <Icon icon={TriangleAlertIcon} />
              <AlertDescription>{note}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {footer}
    </article>
  )
}

/** One detail row: a 96px label and its value (Figma part / key value row, aligned). */
function ApprovalCardField({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { label: React.ReactNode }) {
  return (
    <div data-slot="approval-card-field" className={cn('flex items-start gap-3', className)} {...props}>
      <span className="w-24 shrink-0 type-text-sm-normal text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 type-text-sm-normal text-foreground group-data-[status=denied]/approval:text-muted-foreground group-data-[status=expired]/approval:text-muted-foreground">
        {children}
      </span>
    </div>
  )
}

export { ApprovalCard, ApprovalCardField, type ApprovalStatus }
