import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { TaskCard } from '@/components/agent/task-card'
import { ShellFooter } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRightIcon,
  CheckIcon,
  CircleHelpIcon,
  Icon,
  LinkIcon,
  RotateCcwIcon,
  SearchIcon,
} from '@/components/ui/icon'

// Figma Agent Patterns › Evidence & decisions · open items (10714:943): a list of unresolved items, each
// needing a decision (missing details, unverified data, blocked steps). Built on Task Card + Badge +
// Button + Pulse Dot, nothing re-drawn. Figma state open · resolved → the card's `status`; the item's own
// state open · searching · accepted → `OpenItem` `status`; size default · compact → `size`.
// - OpenItem: a bordered row (radius lg, 12px; --muted while accepted): a leading glyph (open: a help
//   circle, warning · searching: a Pulse Dot · accepted: a check, muted), the title (text/sm/medium), the
//   `description` (what is unresolved and what would resolve it, text/xs muted) and the actions.
//   open: Broaden search (outline xs + search), Add a source (ghost xs + link), Accept gap (ghost xs +
//   check). searching: the `progress` line in the agent colour (“Searching 6 more sources…”).
//   accepted: an outline xs Badge (`acceptedLabel`) and Undo (ghost xs). `compact` stacks the actions.
// - OpenItems: the card: a help-circle tile, title, subtitle, a status Badge (open: warning “Needs a
//   decision” · resolved: success “Resolved”), the items, and the footer: `note` and Continue (brand + arrow;
//   `continueLabel` “Continue with gaps” while open).

type OpenItemStatus = 'open' | 'searching' | 'accepted'

function OpenItem({
  status = 'open',
  size = 'default',
  title,
  description,
  progress,
  acceptedLabel = 'Accepted · noted in report',
  onBroaden,
  onAddSource,
  onAccept,
  onUndo,
  className,
  ...props
}: Omit<React.ComponentProps<'li'>, 'title'> & {
  status?: OpenItemStatus
  size?: 'default' | 'compact'
  title: React.ReactNode
  description?: React.ReactNode
  /** While searching: “Searching 6 more sources…”. */
  progress?: React.ReactNode
  acceptedLabel?: React.ReactNode
  onBroaden?: () => void
  onAddSource?: () => void
  onAccept?: () => void
  onUndo?: () => void
}) {
  const compact = size === 'compact'
  return (
    <li
      data-slot="open-item"
      data-status={status}
      data-size={size}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border bg-card p-3',
        status === 'accepted' && 'bg-muted',
        className,
      )}
      {...props}
    >
      <span aria-hidden className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        {status === 'open' && <Icon icon={CircleHelpIcon} className="text-warning-medium" />}
        {status === 'searching' && <PulseDot />}
        {status === 'accepted' && <Icon icon={CheckIcon} className="text-muted-foreground" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <p
            className={cn(
              'type-text-sm-medium',
              status === 'accepted' ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {title}
          </p>
          {description && <p className="type-text-xs-normal text-muted-foreground">{description}</p>}
        </div>
        {status === 'searching' && progress && (
          <p role="status" className="type-text-xs-normal text-agent dark:text-agent-medium">
            {progress}
          </p>
        )}
        {status === 'open' && (
          <div className={cn('flex gap-1.5', compact ? 'flex-col items-stretch' : 'flex-wrap items-center')}>
            <Button variant="outline" intent="neutral" size="xs" onClick={onBroaden}>
              <Icon icon={SearchIcon} />
              Broaden search
            </Button>
            <Button variant="ghost" intent="neutral" size="xs" onClick={onAddSource}>
              <Icon icon={LinkIcon} />
              Add a source
            </Button>
            <Button variant="ghost" intent="neutral" size="xs" onClick={onAccept}>
              <Icon icon={CheckIcon} />
              Accept gap
            </Button>
          </div>
        )}
        {status === 'accepted' && (
          <div className={cn('flex gap-1.5', compact ? 'flex-col items-stretch' : 'flex-wrap items-center')}>
            <Badge
              variant="outline"
              tone="neutral"
              size="xs"
              className={compact ? 'w-full justify-center' : ''}
            >
              {acceptedLabel}
            </Badge>
            <Button variant="ghost" intent="neutral" size="xs" onClick={onUndo}>
              <Icon icon={RotateCcwIcon} />
              Undo
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}

function OpenItems({
  status = 'open',
  title,
  subtitle,
  note,
  onContinue,
  continueLabel,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer'> & {
  /** Figma state open · resolved. */
  status?: 'open' | 'resolved'
  /** The footer line: “Gaps you accept are listed as limitations in the report.” */
  note?: React.ReactNode
  onContinue?: () => void
  /** Defaults to “Continue with gaps” (open) or “Continue” (resolved). */
  continueLabel?: React.ReactNode
}) {
  return (
    <TaskCard
      data-slot="open-items"
      data-status={status}
      icon={CircleHelpIcon}
      title={title}
      subtitle={subtitle}
      badge={
        <Badge variant="subtle" tone={status === 'open' ? 'warning' : 'success'} size="xs" indicator>
          {status === 'open' ? 'Needs a decision' : 'Resolved'}
        </Badge>
      }
      className={cn(className)}
      footer={
        <ShellFooter variant="card" align="between" note={note}>
          <Button intent="brand" size="sm" onClick={onContinue}>
            <Icon icon={ArrowRightIcon} />
            {continueLabel ?? (status === 'open' ? 'Continue with gaps' : 'Continue')}
          </Button>
        </ShellFooter>
      }
      {...props}
    >
      <ul aria-label="Open items" className="flex flex-col gap-2 p-3">
        {children}
      </ul>
    </TaskCard>
  )
}

export { OpenItems, OpenItem, type OpenItemStatus }
