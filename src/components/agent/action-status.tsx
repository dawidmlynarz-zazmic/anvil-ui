import * as React from 'react'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { CircleCheckIcon, CircleXIcon, ClockIcon, Icon, RotateCcwIcon } from '@/components/ui/icon'
import { PulseDot } from '@/components/agent/pulse-dot'

// Figma Agent Patterns › action status (10814:3499): the lifecycle strip at the bottom of an action
// card, in place of the footer (Approval Card, Connector Card, payment and booking cards). Top
// border, 16 / 12 × 10px, 10px gap, message text/sm/medium. `status` (Figma state):
// executing (--agent-subtle, --agent-soft border, pulse dot, `progress` bar) · done (--success-*,
// circle-check) · failed (--danger-*, circle-x) · expired (--muted, clock) · undone (--muted,
// rotate-ccw). Tinted states use the -strong text tone, --foreground in dark. `action` is an xs
// Button (Cancel, Retry, Request again, Undo). role=status so the change is announced.

type ActionStatusValue = 'executing' | 'done' | 'failed' | 'expired' | 'undone'

const STATUS: Record<
  ActionStatusValue,
  { className: string; icon?: React.ComponentProps<typeof Icon>['icon'] }
> = {
  executing: { className: 'border-agent-soft bg-agent-subtle text-agent-strong dark:text-foreground' },
  done: {
    className:
      'border-success-soft bg-success-subtle text-success-strong dark:text-foreground [&>svg]:text-success dark:[&>svg]:text-success-medium',
    icon: CircleCheckIcon,
  },
  failed: {
    className:
      'border-danger-soft bg-danger-subtle text-danger-strong dark:text-foreground [&>svg]:text-danger dark:[&>svg]:text-danger-medium',
    icon: CircleXIcon,
  },
  expired: { className: 'bg-muted text-muted-foreground', icon: ClockIcon },
  undone: { className: 'bg-muted text-muted-foreground', icon: RotateCcwIcon },
}

function ActionStatus({
  status = 'executing',
  progress,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  status?: ActionStatusValue
  /** 0–100; shown while executing. */
  progress?: number
  /** An xs Button: Cancel, Retry, Request again, Undo. */
  action?: React.ReactNode
}) {
  const { className: tone, icon } = STATUS[status]
  return (
    <div
      data-slot="action-status"
      data-status={status}
      role="status"
      className={cn('flex items-center gap-2.5 border-t py-2.5 pr-3 pl-4 wrap-break-word', tone, className)}
      {...props}
    >
      {status === 'executing' ? <PulseDot /> : icon && <Icon icon={icon} />}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="type-text-sm-medium">{children}</p>
        {status === 'executing' && progress !== undefined && (
          <Progress tone="agent" size="sm" value={progress} aria-label="Progress" className="bg-agent-soft" />
        )}
      </div>
      {action}
    </div>
  )
}

export { ActionStatus, type ActionStatusValue }
