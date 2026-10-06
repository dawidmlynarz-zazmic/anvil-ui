import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { BrainIcon, CheckIcon, Icon, PencilIcon, XIcon, type LucideIcon } from '@/components/ui/icon'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

// The inline memory line under an answer. One component for Figma memory in use (10737:3110) and
// memory chip (10730:2778), merged in the next phase (same place, same job):
// - used: an --agent-subtle pill (8/10px × 4px, 6px gap, 14px brain, text/xs/medium
//   --agent-strong). With `title` / `description` / `actions` it opens a Popover (12px padding,
//   10px gap, elevation/raised) explaining what was used.
// - not-used: a neutral pill Badge (subtle, sm) with `action` (e.g. Undo) beside it.
// - saved · updated · forgotten: a --muted pill (8/4px, 6px gap): 14px status icon (check ·
//   pencil --primary · x muted), the status label text/xs/medium, the memory text/xs
//   --muted-foreground after a middle dot, then `action` (ghost xs pill Button, e.g. Manage).
// role=status for the saved / updated / forgotten notices, so the change is announced.

type MemoryNoticeStatus = 'used' | 'not-used' | 'saved' | 'updated' | 'forgotten'

const CHANGE: Record<
  'saved' | 'updated' | 'forgotten',
  { icon: LucideIcon; label: string; className: string }
> = {
  saved: { icon: CheckIcon, label: 'Saved to memory', className: 'text-foreground' },
  updated: { icon: PencilIcon, label: 'Memory updated', className: 'text-primary dark:text-foreground' },
  forgotten: { icon: XIcon, label: 'Forgotten', className: 'text-muted-foreground' },
}

const usedPill =
  'inline-flex items-center gap-1.5 rounded-full bg-agent-subtle py-1 pr-2.5 pl-2 type-text-xs-medium text-agent-strong dark:text-foreground [&>svg]:size-3.5 [&>svg]:text-agent dark:[&>svg]:text-agent-medium'

function MemoryNotice({
  status = 'used',
  label,
  action,
  title,
  description,
  actions,
  open,
  defaultOpen,
  onOpenChange,
  onOpenAutoFocus,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  status?: MemoryNoticeStatus
  /** saved · updated · forgotten: overrides the status label. */
  label?: React.ReactNode
  /** A button: inside the pill (Manage) or, when not used, beside it (Undo). */
  action?: React.ReactNode
  /** used: the popover title, e.g. "I used this from memory". */
  title?: React.ReactNode
  /** used: the saved memory and when it was saved. */
  description?: React.ReactNode
  /** used: popover actions (xs Buttons). */
  actions?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenAutoFocus?: React.ComponentProps<typeof PopoverContent>['onOpenAutoFocus']
}) {
  if (status === 'used') {
    return (
      <div
        data-slot="memory-notice"
        data-status={status}
        className={cn('flex flex-col items-start gap-2', className)}
        {...props}
      >
        {title || description || actions ? (
          <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger
              className={cn(usedPill, 'outline-none hover:bg-agent-soft focus-visible:focus-ring')}
            >
              <Icon icon={BrainIcon} />
              {children}
            </PopoverTrigger>
            <PopoverContent
              align="start"
              onOpenAutoFocus={onOpenAutoFocus}
              className="w-90 max-w-160 gap-2.5 p-3"
            >
              {title && <PopoverTitle className="type-text-sm-semibold">{title}</PopoverTitle>}
              {description && (
                <PopoverDescription className="type-text-xs-normal">{description}</PopoverDescription>
              )}
              {actions && <div className="flex flex-wrap gap-1">{actions}</div>}
            </PopoverContent>
          </Popover>
        ) : (
          <span className={usedPill}>
            <Icon icon={BrainIcon} />
            {children}
          </span>
        )}
      </div>
    )
  }

  if (status === 'not-used') {
    return (
      <div
        data-slot="memory-notice"
        data-status={status}
        className={cn('flex flex-col items-start gap-2', className)}
        {...props}
      >
        <Badge variant="subtle" tone="neutral" shape="pill" size="sm">
          <Icon icon={BrainIcon} />
          {children}
        </Badge>
        {action}
      </div>
    )
  }

  const change = CHANGE[status]
  return (
    <div
      role="status"
      data-slot="memory-notice"
      data-status={status}
      className={cn(
        'inline-flex max-w-[min(100%,--spacing(160))] items-center gap-1.5 rounded-full bg-muted py-1 pl-2 type-text-xs-normal',
        action ? 'pr-1' : 'pr-2.5',
        className,
      )}
      {...props}
    >
      <Icon icon={change.icon} size="xs" className={cn('size-3.5', change.className)} />
      <span className="shrink-0 type-text-xs-medium text-foreground">{label ?? change.label}</span>
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

export { MemoryNotice, type MemoryNoticeStatus }
