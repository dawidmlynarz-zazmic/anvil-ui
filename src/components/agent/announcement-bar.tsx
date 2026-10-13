import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon, SparklesIcon, TagIcon, TriangleAlertIcon, XIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Proactive · announcement bar (10752:6398): a short message the
// agent shows on the host page without being asked. Built from existing parts, nothing re-drawn.
// Figma `tone` info · alert · opportunity → `tone` agent · warning · success (the contract's tone
// names); the default glyph is sparkles · alert triangle · tag.
// - position top: an Alert (size sm, shape full-bleed, tinted, role="status") across the top edge — no side
//   stroke, no top stroke, a --space-lg start padding — with the message as its title, `action` (outline xs
//   Button) + Snooze (ghost xs) and the dismiss X.
// - position bottom: a floating pill — --popover, --border, radius full, 8px padding, 12px gap,
//   elevation/raised (Figma shadow/lg) — with a 32px circle Icon Tile, the message (text/sm/medium),
//   `action` (brand · sm · pill Button), Snooze (ghost · sm · pill) and dismiss (ghost icon-sm circle).
// `actionLabel` / `onAction` draw the standard action Button; pass `action` to draw your own (the
// Proactive Drawer's peek bar does). Snooze shows when `onSnooze` is set, dismiss when `onDismiss`.
// Polite status, so a new message is announced without taking focus.

type AnnouncementPosition = 'top' | 'bottom'
type AnnouncementTone = 'agent' | 'warning' | 'success'

const DEFAULT_ICON: Record<AnnouncementTone, LucideIcon> = {
  agent: SparklesIcon,
  warning: TriangleAlertIcon,
  success: TagIcon,
}

function AnnouncementBar({
  position = 'top',
  tone = 'agent',
  icon,
  actionLabel,
  onAction,
  action,
  snoozeLabel = 'Snooze',
  onSnooze,
  onDismiss,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onChange'> & {
  /** Figma position: across the top edge, or a floating pill at the bottom. */
  position?: AnnouncementPosition
  /** Figma tone info · alert · opportunity → agent · warning · success. */
  tone?: AnnouncementTone
  /** Replaces the tone's glyph. */
  icon?: LucideIcon
  /** The action's label, e.g. "Review & pay". */
  actionLabel?: React.ReactNode
  onAction?: () => void
  /** Your own action control, instead of `actionLabel` / `onAction`. */
  action?: React.ReactNode
  snoozeLabel?: React.ReactNode
  /** Shows Snooze. */
  onSnooze?: () => void
  /** Shows the dismiss button. */
  onDismiss?: () => void
  /** The message. */
  children: React.ReactNode
}) {
  const glyph = icon ?? DEFAULT_ICON[tone]
  const top = position === 'top'
  const actionButton =
    action ??
    (actionLabel && (
      <Button
        variant={top ? 'outline' : 'default'}
        intent={top ? 'neutral' : 'brand'}
        size={top ? 'xs' : 'sm'}
        shape={top ? 'default' : 'pill'}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    ))

  if (top) {
    return (
      <Alert
        data-slot="announcement-bar"
        data-position="top"
        role="status"
        tone={tone}
        size="sm"
        onDismiss={onDismiss}
        action={
          (actionButton || onSnooze) && (
            <>
              {actionButton}
              {onSnooze && (
                <Button variant="ghost" intent="neutral" size="xs" onClick={onSnooze}>
                  {snoozeLabel}
                </Button>
              )}
            </>
          )
        }
        shape="full-bleed"
        className={cn('border-t-0 ps-(--space-lg) pe-4', className)}
        {...props}
      >
        <Icon icon={glyph} />
        <AlertTitle>{children}</AlertTitle>
      </Alert>
    )
  }

  return (
    <div
      data-slot="announcement-bar"
      data-position="bottom"
      role="status"
      className={cn(
        'flex w-full max-w-180 items-center gap-3 rounded-full border border-border bg-popover p-2 text-popover-foreground shadow-elevation-raised',
        className,
      )}
      {...props}
    >
      <IconTile icon={glyph} tone={tone} size="sm" shape="circle" />
      <p className="min-w-0 flex-1 type-text-sm-medium text-foreground">{children}</p>
      {actionButton}
      {onSnooze && (
        <Button variant="ghost" intent="neutral" size="sm" shape="pill" onClick={onSnooze}>
          {snoozeLabel}
        </Button>
      )}
      {onDismiss && (
        <Button
          variant="ghost"
          intent="neutral"
          size="icon-sm"
          shape="circle"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <Icon icon={XIcon} />
        </Button>
      )}
    </div>
  )
}

export { AnnouncementBar, type AnnouncementPosition, type AnnouncementTone }
