import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard } from '@/components/agent/task-card'
import { Badge } from '@/components/ui/badge'
import { CircleCheckIcon, FileTextIcon, HardDriveIcon, Icon, type LucideIcon } from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'

// Figma Agent Builder › Core Kit › connector card (10730:2985): asks to connect an app, then shows
// the result. --card, border, radius xl, shadow-sm, max 640px. Header (16px, 12px gap, no
// divider): 40px --muted radius-lg tile with an 18px app icon (neutral; swap in the partner logo
// in product), title text/sm/semibold, description text/xs muted, status Badge (subtle, xs,
// indicator). Body (16px sides and bottom):
// ConnectorCardPermission rows (Figma part / check row) or ConnectorCardItem results. Then
// ShellFooter variant card (--muted bar) or ActionStatus (executing while connecting: pulse + progress).
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
  /** ShellFooter variant="card", or ActionStatus (executing) while connecting. */
  footer?: React.ReactNode
}) {
  const tag = BADGE[status]
  return (
    <TaskCard
      data-slot="connector-card"
      data-status={status}
      media={<IconTile icon={icon} />}
      headerClassName="items-start border-b-0"
      title={title}
      subtitle={description}
      badge={
        <Badge data-slot="connector-card-badge" variant="subtle" tone={tag.tone} size="xs" indicator>
          {badge ?? tag.label}
        </Badge>
      }
      footer={footer}
      className={className}
      {...props}
    >
      {children && <div className="flex flex-col gap-1.5 px-4 pb-4">{children}</div>}
    </TaskCard>
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

export { ConnectorCard, ConnectorCardItem, ConnectorCardPermission, type ConnectorStatus }
