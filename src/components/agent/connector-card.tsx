import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircleCheckIcon, FileTextIcon, HardDriveIcon, Icon, type LucideIcon } from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'
import { PulseDot } from '@/components/agent/pulse-dot'

// Figma Agent Builder › Core Kit › connector card (10730:2985): asks to connect an app, then shows
// the result. --card, border, radius xl, shadow-sm, max 640px. Header (16px, 12px gap, no
// divider): 40px --muted radius-lg tile with an 18px app icon (neutral; swap in the partner logo
// in product), title text/sm/semibold, description text/xs muted, status Badge (semantic, xs,
// indicator). Body (16px sides and bottom):
// ConnectorCardPermission rows (Figma part / check row) or ConnectorCardItem results. Then
// ConnectorCardFooter (--muted bar) or ConnectorCardStatus (connecting strip: pulse + progress).
// Figma `state` → `status` suggest · connected · reconnect · connecting.

type ConnectorStatus = 'suggest' | 'connected' | 'reconnect' | 'connecting'

const BADGE: Record<
  ConnectorStatus,
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'destructive' }
> = {
  suggest: { label: 'Not connected', tone: 'neutral' },
  connecting: { label: 'Not connected', tone: 'neutral' },
  connected: { label: 'Connected', tone: 'success' },
  reconnect: { label: 'Expired', tone: 'warning' },
}

function ConnectorCard({
  status = 'suggest',
  icon = HardDriveIcon,
  title,
  description,
  badge,
  footer,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  status?: ConnectorStatus
  /** The app icon (neutral by default; the partner logo in product). */
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Overrides the status label. */
  badge?: React.ReactNode
  /** ConnectorCardFooter, or ConnectorCardStatus while connecting. */
  footer?: React.ReactNode
}) {
  const titleId = React.useId()
  const tag = BADGE[status]
  return (
    <article
      data-slot="connector-card"
      data-status={status}
      aria-labelledby={titleId}
      className={cn(
        'flex w-full max-w-160 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm wrap-break-word',
        className,
      )}
      {...props}
    >
      <header className="flex flex-wrap items-start gap-3 p-4">
        <IconTile icon={icon} />
        <div className="flex min-w-0 grow basis-48 flex-col gap-1">
          <h3 id={titleId} className="type-text-sm-semibold text-foreground">
            {title}
          </h3>
          {description && <p className="type-text-xs-normal text-muted-foreground">{description}</p>}
        </div>
        <Badge
          data-slot="connector-card-badge"
          variant="semantic"
          tone={tag.tone}
          size="xs"
          indicator
          className="shrink-0"
        >
          {badge ?? tag.label}
        </Badge>
      </header>
      {children && <div className="flex flex-col gap-1.5 px-4 pb-4">{children}</div>}
      {footer}
    </article>
  )
}

/** What the connection allows (Figma part / check row, included). */
function ConnectorCardPermission({ className, children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="connector-card-permission"
      className={cn('flex items-center gap-1.5 type-text-xs-normal text-foreground', className)}
      {...props}
    >
      <Icon icon={CircleCheckIcon} size="xs" className="size-3.5 text-success dark:text-success-medium" />
      {children}
    </p>
  )
}

/** A result from the connected app: icon, name and `meta` (e.g. when it was edited). */
function ConnectorCardItem({
  icon = FileTextIcon,
  meta,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { icon?: LucideIcon; meta?: React.ReactNode }) {
  return (
    <div
      data-slot="connector-card-item"
      className={cn('flex items-center gap-2.5 rounded-md bg-muted px-2.5 py-2', className)}
      {...props}
    >
      <Icon icon={icon} className="text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate type-text-sm-medium text-foreground">{children}</span>
      {meta && <span className="shrink-0 type-text-xs-normal text-muted-foreground">{meta}</span>}
    </div>
  )
}

/** The action bar (Figma part / card footer): leading action, then the primary action at the end. */
function ConnectorCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="connector-card-footer"
      className={cn('flex flex-wrap items-center gap-2 border-t bg-muted px-4 py-3', className)}
      {...props}
    />
  )
}

/** The connecting strip (Figma action status, executing): pulse, message, `progress` and `action`. */
function ConnectorCardStatus({
  progress,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { progress?: number; action?: React.ReactNode }) {
  return (
    <div
      data-slot="connector-card-status"
      role="status"
      className={cn(
        'flex items-center gap-2.5 border-t border-agent-soft bg-agent-subtle py-2.5 pr-3 pl-4 text-agent-strong dark:text-foreground',
        className,
      )}
      {...props}
    >
      <PulseDot />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="type-text-sm-medium">{children}</p>
        {progress !== undefined && (
          <Progress tone="agent" size="sm" value={progress} aria-label="Progress" className="bg-agent-soft" />
        )}
      </div>
      {action}
    </div>
  )
}

export {
  ConnectorCard,
  ConnectorCardFooter,
  ConnectorCardItem,
  ConnectorCardPermission,
  ConnectorCardStatus,
  type ConnectorStatus,
}
