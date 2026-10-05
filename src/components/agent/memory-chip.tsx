import * as React from 'react'

import { cn } from '@/lib/utils'
import { CheckIcon, Icon, PencilIcon, XIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › memory chip (10730:2778): an inline notice under a message when
// the assistant saves, updates or forgets something. --muted pill, 8/4px (4px right for the
// action), 6px gap: 14px status icon, label text/xs/medium, the memory text/xs --muted-foreground
// after a middle dot, then `action` (ghost xs pill Button, e.g. Manage). Figma `state` → `status`
// saved (check) · updated (pencil, --primary) · forgotten (x, --muted-foreground).

type MemoryStatus = 'saved' | 'updated' | 'forgotten'

const STATUS: Record<MemoryStatus, { icon: LucideIcon; label: string; className: string }> = {
  saved: { icon: CheckIcon, label: 'Saved to memory', className: 'text-foreground' },
  updated: { icon: PencilIcon, label: 'Memory updated', className: 'text-primary dark:text-foreground' },
  forgotten: { icon: XIcon, label: 'Forgotten', className: 'text-muted-foreground' },
}

function MemoryChip({
  status = 'saved',
  label,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  status?: MemoryStatus
  /** Overrides the status label. */
  label?: React.ReactNode
  /** e.g. Manage (ghost xs pill Button). */
  action?: React.ReactNode
}) {
  const { icon, label: statusLabel, className: iconClassName } = STATUS[status]
  return (
    <div
      role="status"
      data-slot="memory-chip"
      data-status={status}
      className={cn(
        'inline-flex max-w-160 items-center gap-1.5 rounded-full bg-muted py-1 pl-2 type-text-xs-normal',
        action ? 'pr-1' : 'pr-2.5',
        className,
      )}
      {...props}
    >
      <Icon icon={icon} size="xs" className={cn('size-3.5', iconClassName)} />
      <span className="shrink-0 type-text-xs-medium text-foreground">{label ?? statusLabel}</span>
      {children && (
        <span className="min-w-0 truncate text-muted-foreground">
          <span aria-hidden>· </span>
          {children}
        </span>
      )}
      {action}
    </div>
  )
}

export { MemoryChip, type MemoryStatus }
