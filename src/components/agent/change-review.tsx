import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskCardBody, TaskStatusBadge } from '@/components/agent/task-card'
import { ValueStack } from '@/components/anvil/value-stack'
import { ShellFooter } from '@/components/anvil/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  GitPullRequestIcon,
  Icon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
} from '@/components/ui/icon'

// Figma Agent Patterns › Tasks · change review (10720:1735): a mid-task change for approval: why, what is
// added, changed or removed, and the impact. Built on Task Card + Alert + Value Stack + Button. Figma
// state review · accepted → `status`.
// - `reason`: a full-bleed Alert (agent, size xs, role note) with sparkles: why the agent suggests it.
// - The changes: `ChangeItem` rows (Figma change added · changed · removed · unchanged): a tinted row
//   (--success · --warning · --danger subtle) with a glyph (plus · pencil · minus), the title, the `detail`
//   (what changed and why) and a word at the end (“Added”, “Changed”, “Removed”), so colour is never the
//   only signal; unchanged is a plain muted row with a dot.
// - `impact`: label + value pairs (“Time +4 min”) as Value Stacks.
// - review footer: Keep original plan (ghost, `onKeep`) · Edit (outline, `onEdit`) · Accept changes (brand,
//   `onAccept`). accepted footer: `acceptedNote` and Undo (ghost + rotate, `onUndo`).

type Change = 'added' | 'changed' | 'removed' | 'unchanged'

const CHANGE = {
  added: {
    icon: PlusIcon,
    word: 'Added',
    row: 'bg-success-subtle text-success-strong',
    glyph: 'text-success-medium',
  },
  changed: {
    icon: PencilIcon,
    word: 'Changed',
    row: 'bg-warning-subtle text-warning-strong',
    glyph: 'text-warning-medium',
  },
  removed: {
    icon: MinusIcon,
    word: 'Removed',
    row: 'bg-danger-subtle text-danger-strong',
    glyph: 'text-danger-medium',
  },
  unchanged: { icon: null, word: null, row: 'text-muted-foreground', glyph: '' },
} as const

function ChangeItem({
  change = 'unchanged',
  title,
  detail,
  className,
  ...props
}: Omit<React.ComponentProps<'li'>, 'title'> & {
  /** Figma change added · changed · removed · unchanged. */
  change?: Change
  title: React.ReactNode
  /** What changed and why. */
  detail?: React.ReactNode
}) {
  const spec = CHANGE[change]
  return (
    <li
      data-slot="change-item"
      data-change={change}
      className={cn('flex items-start gap-3 rounded-md px-3 py-2.5', spec.row, className)}
      {...props}
    >
      <span aria-hidden className={cn('flex size-4 shrink-0 items-center justify-center', spec.glyph)}>
        {spec.icon ? <Icon icon={spec.icon} /> : <span className="size-1 rounded-full bg-current" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className={cn('type-text-sm-medium', change === 'unchanged' ? 'text-foreground-subtle' : '')}>
          {title}
        </p>
        {detail && <p className="type-text-xs-normal opacity-90">{detail}</p>}
      </div>
      {spec.word && <span className="shrink-0 type-text-2xs-medium">{spec.word}</span>}
    </li>
  )
}

function ChangeReview({
  status = 'review',
  title,
  subtitle,
  reason,
  impact,
  onKeep,
  keepLabel = 'Keep original plan',
  onEdit,
  onAccept,
  acceptLabel = 'Accept changes',
  acceptedNote,
  onUndo,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer'> & {
  /** Figma state review · accepted. */
  status?: 'review' | 'accepted'
  /** Why the agent suggests the change. */
  reason?: React.ReactNode
  /** The impact: label + value pairs (“Time” “+4 min”). */
  impact?: { label: React.ReactNode; value: React.ReactNode }[]
  onKeep?: () => void
  keepLabel?: React.ReactNode
  onEdit?: () => void
  onAccept?: () => void
  acceptLabel?: React.ReactNode
  /** The accepted footer line: “Accepted · 14:07 · step 3 starts next”. */
  acceptedNote?: React.ReactNode
  onUndo?: () => void
}) {
  return (
    <TaskCard
      data-slot="change-review"
      data-status={status}
      icon={GitPullRequestIcon}
      title={title}
      subtitle={subtitle}
      badge={<TaskStatusBadge status={status} />}
      className={cn(className)}
      footer={
        status === 'review' ? (
          <ShellFooter variant="card" align="between">
            <Button variant="ghost" intent="neutral" size="sm" onClick={onKeep}>
              {keepLabel}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" intent="neutral" size="sm" onClick={onEdit}>
                <Icon icon={PencilIcon} />
                Edit
              </Button>
              <Button intent="brand" size="sm" onClick={onAccept}>
                <Icon icon={CheckIcon} />
                {acceptLabel}
              </Button>
            </div>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between" note={acceptedNote}>
            <Button variant="ghost" intent="neutral" size="sm" onClick={onUndo}>
              <Icon icon={RotateCcwIcon} />
              Undo
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      {reason && (
        <Alert role="note" tone="agent" size="xs" shape="full-bleed" className="px-4">
          <Icon icon={SparklesIcon} />
          <AlertDescription>{reason}</AlertDescription>
        </Alert>
      )}
      <TaskCardBody className="gap-3 p-3">
        <ul aria-label="Changes" className="flex flex-col gap-1">
          {children}
        </ul>
        {impact && (
          <div className="flex gap-6 px-1 pt-1">
            {impact.map((item, index) => (
              <ValueStack key={index} label={item.label} size="sm">
                {item.value}
              </ValueStack>
            ))}
          </div>
        )}
      </TaskCardBody>
    </TaskCard>
  )
}

export { ChangeReview, ChangeItem, type Change }
