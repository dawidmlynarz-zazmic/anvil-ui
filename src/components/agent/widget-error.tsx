import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { Card } from '@/components/ui/card'
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { ClockIcon, CircleXIcon, LockIcon, WifiOffIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Agent Patterns › States · widget error (10814:3371): a widget that couldn't
// load, in place of its content. Built on Card (--card, --border, radius xl, shadow/sm, ≤420px) and
// Empty State (24px padding, 10px apart, centred): a 48px circle Icon Tile, `title`
// text/base/semibold, `description` text/sm muted, then `actions` (Buttons sm: the recovery outline
// with an icon, a second one ghost). Figma `type` (which kind of failure) sets the glyph, the tile
// tone and the default copy:
// failed → circle-x, destructive · offline → wifi-off, neutral · permission → lock, warning ·
// timeout → clock, warning. `role="status"`, so it is announced without interrupting.

type WidgetErrorType = 'failed' | 'offline' | 'permission' | 'timeout'

const TYPES: Record<
  WidgetErrorType,
  { icon: LucideIcon; tone: 'destructive' | 'neutral' | 'warning'; title: string; description: string }
> = {
  failed: {
    icon: CircleXIcon,
    tone: 'destructive',
    title: 'Couldn’t load',
    description: 'Something went wrong. Nothing was changed.',
  },
  offline: {
    icon: WifiOffIcon,
    tone: 'neutral',
    title: 'You’re offline',
    description: 'Changes will sync when you reconnect.',
  },
  permission: {
    icon: LockIcon,
    tone: 'warning',
    title: 'No access',
    description: 'You don’t have permission to see this.',
  },
  timeout: {
    icon: ClockIcon,
    tone: 'warning',
    title: 'This is taking longer than usual',
    description: 'It’s still running.',
  },
}

function WidgetError({
  type = 'failed',
  title,
  description,
  icon,
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Which kind of failure: sets the glyph, tone and default copy. */
  type?: WidgetErrorType
  title?: React.ReactNode
  description?: React.ReactNode
  /** Replaces the type's glyph. */
  icon?: LucideIcon
  /** Buttons (sm): the recovery (outline, with an icon), then a ghost one. */
  actions?: React.ReactNode
}) {
  const preset = TYPES[type]
  return (
    <Card
      data-slot="widget-error"
      data-type={type}
      role="status"
      className={cn('w-full max-w-105 min-w-0 rounded-xl border-border bg-card py-0 shadow-sm', className)}
      {...props}
    >
      <EmptyState className="gap-2.5 border-0 p-(--space-lg) md:p-(--space-lg)">
        <EmptyStateHeader className="max-w-none gap-2.5">
          <EmptyStateMedia className="mb-0 [&_svg:not([class*='size-'])]:size-5.5">
            <IconTile icon={icon ?? preset.icon} tone={preset.tone} size="lg" shape="circle" />
          </EmptyStateMedia>
          <EmptyStateTitle className="type-text-base-semibold">{title ?? preset.title}</EmptyStateTitle>
          <EmptyStateDescription className="text-muted-foreground">
            {description ?? preset.description}
          </EmptyStateDescription>
        </EmptyStateHeader>
        {actions && (
          <EmptyStateContent className="flex-row justify-center gap-2">{actions}</EmptyStateContent>
        )}
      </EmptyState>
    </Card>
  )
}

export { WidgetError, type WidgetErrorType }
