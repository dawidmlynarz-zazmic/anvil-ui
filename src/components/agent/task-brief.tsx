import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskCardBody, TaskStatusBadge } from '@/components/agent/task-card'
import { ValueStack } from '@/components/anvil/value-stack'
import { ShellFooter } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  Icon,
  PencilIcon,
  SparklesIcon,
  TelescopeIcon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Patterns › Tasks · task brief (10711:3): the agent restates the task and its scope before
// acting; nothing runs until it is approved. Built on Task Card + Value Stack + Button, nothing
// re-drawn. Figma state review · approved → `status`.
// - Body: the `question` (the task in one sentence, text/sm/medium under a muted `questionLabel`) and
//   `fields` (label + value pairs) in two columns (one on narrow cards), each a Value Stack.
// - review footer: Edit (outline, `onEdit`) · Refine (ghost + sparkles, `onRefine`) · Approve & start
//   (brand + check, `onApprove`). approved footer: `approvedNote` and Edit brief (ghost, `onEdit`):
//   the brief stays editable while it runs.

type BriefField = { label: React.ReactNode; value: React.ReactNode }

function TaskBrief({
  status = 'review',
  icon = TelescopeIcon,
  title,
  subtitle,
  questionLabel,
  question,
  fields,
  onEdit,
  onRefine,
  onApprove,
  approveLabel = 'Approve & start',
  approvedNote,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children'> & {
  /** Figma state review · approved. */
  status?: 'review' | 'approved'
  icon?: LucideIcon
  questionLabel?: React.ReactNode
  /** The task, stated in one sentence for approval. */
  question: React.ReactNode
  fields: BriefField[]
  onEdit?: () => void
  onRefine?: () => void
  onApprove?: () => void
  approveLabel?: React.ReactNode
  /** The footer line once approved: “Approved · 14:02 · you can still edit while it runs”. */
  approvedNote?: React.ReactNode
}) {
  return (
    <TaskCard
      data-slot="task-brief"
      data-status={status}
      icon={icon}
      title={title}
      subtitle={subtitle}
      badge={<TaskStatusBadge status={status} />}
      className={cn('@container', className)}
      footer={
        status === 'review' ? (
          <ShellFooter variant="card" align="between">
            <div className="flex items-center gap-2">
              <Button variant="outline" intent="neutral" size="sm" onClick={onEdit}>
                <Icon icon={PencilIcon} />
                Edit
              </Button>
              <Button variant="ghost" intent="neutral" size="sm" onClick={onRefine}>
                <Icon icon={SparklesIcon} />
                Refine
              </Button>
            </div>
            <Button intent="brand" size="sm" onClick={onApprove}>
              <Icon icon={CheckIcon} />
              {approveLabel}
            </Button>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between" note={approvedNote}>
            <Button variant="ghost" intent="neutral" size="sm" onClick={onEdit}>
              <Icon icon={PencilIcon} />
              Edit brief
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      <TaskCardBody>
        <div className="flex flex-col gap-0.5">
          {questionLabel && (
            <span className="type-text-xs-normal text-muted-foreground">{questionLabel}</span>
          )}
          <p className="type-text-sm-medium text-foreground">{question}</p>
        </div>
        <div className="grid gap-x-6 gap-y-3 @md:grid-cols-2">
          {fields.map((field, index) => (
            <ValueStack key={index} label={field.label} size="sm" className="max-w-none">
              {field.value}
            </ValueStack>
          ))}
        </div>
      </TaskCardBody>
    </TaskCard>
  )
}

export { TaskBrief, type BriefField }
