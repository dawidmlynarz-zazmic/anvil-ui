import * as React from 'react'

import { cn } from '@/lib/utils'
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
// radius-lg tile + title text/sm/semibold + subtitle text/xs muted + a Badge (semantic, xs,
// indicator). Details (16px, 10px
// gap): ApprovalCardField rows (96px label column) and an optional warning `note`. Then either
// ApprovalCardFooter (--muted bar, 16/12px, 8px gap) or ActionStatus (Figma action status:
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
  /** ApprovalCardFooter (pending · approved · denied) or ActionStatus (executing · failed · expired). */
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
      <header className="flex flex-wrap items-center gap-3 border-b p-4">
        <IconTile icon={tile.icon} tone={tile.tone} size="sm" />
        <div className="flex min-w-0 grow basis-48 flex-col gap-0.5">
          <h3 id={titleId} className="type-text-sm-semibold text-foreground">
            {title}
          </h3>
          {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
        </div>
        <Badge
          data-slot="approval-card-badge"
          variant="semantic"
          tone={tag.tone}
          size="xs"
          indicator
          className="shrink-0"
        >
          {badge ?? tag.label}
        </Badge>
      </header>
      {(children || (note && status === 'pending')) && (
        <div className="flex flex-col gap-2.5 p-4">
          {children}
          {note && status === 'pending' && (
            <p
              data-slot="approval-card-note"
              className="flex items-start gap-2 rounded-md bg-warning-subtle px-3 py-2.5 type-text-xs-normal text-warning-strong [&>svg]:mt-0.5 [&>svg]:text-warning"
            >
              <Icon icon={TriangleAlertIcon} size="xs" />
              <span className="min-w-0 flex-1">{note}</span>
            </p>
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

/**
 * The action bar (Figma part / card footer). Pending: leading ghost action, then Deny (outline
 * destructive) and Approve (brand). Approved / denied: a `message` and one ghost action.
 */
function ApprovalCardFooter({
  message,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { message?: React.ReactNode }) {
  return (
    <div
      data-slot="approval-card-footer"
      className={cn('flex flex-wrap items-center gap-2 border-t bg-muted px-4 py-3', className)}
      {...props}
    >
      {message && <p className="min-w-0 flex-1 type-text-xs-normal text-muted-foreground">{message}</p>}
      {children}
    </div>
  )
}

export { ApprovalCard, ApprovalCardField, ApprovalCardFooter, type ApprovalStatus }
