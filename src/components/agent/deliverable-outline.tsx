import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskStatusBadge } from '@/components/agent/task-card'
import { Chip } from '@/components/anvil/chip'
import { ShellFooter } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, FileTextIcon, Icon, PencilIcon, PlusIcon, XIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Evidence & decisions · deliverable outline (10714:1167): the structure and format
// of a deliverable before the agent writes it. Built on Task Card + Chip + Badge + Button, and the Task
// Plan's numbered step (`TaskPlanStep`: title, description, tag Badges for words and visuals). Figma state
// review · approved → `status` review · writing (once approved the agent is writing it).
// - Header: the title, a subtitle (“6 sections · ~2,800 words · 3 visuals”) and a status Badge (review:
//   “Needs approval” · writing: info “Writing”).
// - Options: a muted label and a row of outline pill toggle Chips each for `format` and `length`
//   (the chosen one is filled with a ×; pressing it again clears it), controlled or uncontrolled.
// - Sections: the children, `TaskPlanStep` rows (edit and remove on hover while in review).
// - Footer, review: Add section (ghost + plus, `onAddSection`) · Edit outline (outline, `onEdit`) · Start
//   writing (brand + pencil, `onStart`). writing: the progress line (`progress`, agent colour) and View draft
//   (ghost + arrow, `onViewDraft`).

type Option = { value: string; label: string }

function OptionRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Option[]
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-14 shrink-0 type-text-xs-normal text-muted-foreground">{label}</span>
      {options.map((option) => {
        const pressed = option.value === value
        return (
          <Chip
            key={option.value}
            variant="outline"
            shape="pill"
            pressed={pressed}
            onPressedChange={() => onChange(pressed ? '' : option.value)}
          >
            {option.label}
            {pressed && <Icon icon={XIcon} />}
          </Chip>
        )
      })}
    </div>
  )
}

function DeliverableOutline({
  status = 'review',
  title,
  subtitle,
  formats,
  format,
  defaultFormat,
  onFormatChange,
  lengths,
  length,
  defaultLength,
  onLengthChange,
  onAddSection,
  onEdit,
  onStart,
  progress,
  onViewDraft,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer'> & {
  /** Figma state review · approved (writing). */
  status?: 'review' | 'writing'
  formats?: Option[]
  format?: string
  defaultFormat?: string
  onFormatChange?: (format: string) => void
  lengths?: Option[]
  length?: string
  defaultLength?: string
  onLengthChange?: (length: string) => void
  onAddSection?: () => void
  onEdit?: () => void
  onStart?: () => void
  /** While writing: “Writing section 2 of 6 · about 4 min left”. */
  progress?: React.ReactNode
  onViewDraft?: () => void
}) {
  const [innerFormat, setInnerFormat] = React.useState(defaultFormat)
  const [innerLength, setInnerLength] = React.useState(defaultLength)
  return (
    <TaskCard
      data-slot="deliverable-outline"
      data-status={status}
      icon={FileTextIcon}
      title={title}
      subtitle={subtitle}
      badge={
        status === 'review' ? (
          <TaskStatusBadge status="review" />
        ) : (
          <Badge variant="subtle" tone="info" size="xs" indicator>
            Writing
          </Badge>
        )
      }
      className={cn(className)}
      footer={
        status === 'review' ? (
          <ShellFooter variant="card" align="between">
            <Button variant="ghost" intent="neutral" size="sm" onClick={onAddSection}>
              <Icon icon={PlusIcon} />
              Add section
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" intent="neutral" size="sm" onClick={onEdit}>
                <Icon icon={PencilIcon} />
                Edit outline
              </Button>
              <Button intent="brand" size="sm" onClick={onStart}>
                <Icon icon={PencilIcon} />
                Start writing
              </Button>
            </div>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between">
            <p
              role="status"
              className="min-w-30 flex-1 type-text-xs-normal text-agent dark:text-agent-medium"
            >
              {progress}
            </p>
            <Button variant="ghost" intent="neutral" size="sm" onClick={onViewDraft}>
              View draft
              <Icon icon={ArrowRightIcon} />
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      {(formats || lengths) && (
        <div className="flex flex-col gap-2 border-b p-4">
          {formats && (
            <OptionRow
              label="Format"
              options={formats}
              value={format ?? innerFormat}
              onChange={(next) => {
                setInnerFormat(next)
                onFormatChange?.(next)
              }}
            />
          )}
          {lengths && (
            <OptionRow
              label="Length"
              options={lengths}
              value={length ?? innerLength}
              onChange={(next) => {
                setInnerLength(next)
                onLengthChange?.(next)
              }}
            />
          )}
        </div>
      )}
      <ol aria-label="Sections" className="flex flex-col p-2">
        {children}
      </ol>
    </TaskCard>
  )
}

export { DeliverableOutline }
