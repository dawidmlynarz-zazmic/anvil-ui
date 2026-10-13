import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard } from '@/components/agent/task-card'
import { ShellFooter } from '@/components/anvil/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { CheckIcon, Icon, RotateCcwIcon, ScaleIcon, SparklesIcon } from '@/components/ui/icon'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Figma Agent Patterns › Evidence & decisions · conflict resolver (10724:1863): two values disagree:
// side-by-side options, the agent's recommendation and a combined option. Built on Task Card + the Field
// choice-card pattern + Radio Group + Alert + Badge + Button, nothing re-drawn. Figma state open ·
// resolved → `status`; size default · compact → the options sit side by side from 560px, stacked below
// (container query).
// - Options (`options`): each a selectable card (Field choice card: a radio, the source name text/sm/medium,
//   the value in heading/2xl, its `detail` text/xs muted and a credibility line with a dot). The
//   recommended one carries a “Recommended” Badge while open; the chosen one a “Chosen” Badge and the
//   --info-subtle fill with the action stroke once resolved (shadcn's primary/5 is replaced).
// - `recommendation`: a full-bleed agent note (sparkles, role note) with the agent's reasoning.
// - The combined option (`rangeLabel`, “Report both as a range…”) is a radio row of its own (value `range`).
// - Footer, open: Report as range (outline, `onReportRange`) and Use recommendation (brand + check,
//   `onUseRecommendation`). resolved: `resolvedNote` and Undo (ghost, `onUndo`).
// Controlled (`value`) or uncontrolled (`defaultValue`): the id of the chosen option, or `range`.

type Credibility = 'high' | 'medium' | 'low'
type ConflictOption = {
  id: string
  source: React.ReactNode
  value: React.ReactNode
  detail?: React.ReactNode
  credibility?: Credibility
  /** “High credibility · May 2026”. */
  credibilityLabel?: React.ReactNode
  recommended?: boolean
}

const DOT = { high: 'bg-success', medium: 'bg-warning', low: 'bg-danger' } as const

function ConflictResolver({
  status = 'open',
  title,
  subtitle,
  options,
  value,
  defaultValue,
  onValueChange,
  recommendation,
  rangeLabel,
  onUseRecommendation,
  onReportRange,
  resolvedNote,
  onUndo,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children' | 'defaultValue'> & {
  status?: 'open' | 'resolved'
  options: ConflictOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  recommendation?: React.ReactNode
  rangeLabel?: React.ReactNode
  onUseRecommendation?: () => void
  onReportRange?: () => void
  resolvedNote?: React.ReactNode
  onUndo?: () => void
}) {
  const recommended = options.find((o) => o.recommended)?.id
  const [inner, setInner] = React.useState(defaultValue ?? recommended ?? '')
  const current = value ?? inner
  const open = status === 'open'
  return (
    <TaskCard
      data-slot="conflict-resolver"
      data-status={status}
      icon={ScaleIcon}
      title={title}
      subtitle={subtitle}
      badge={
        <Badge variant="subtle" tone={open ? 'warning' : 'success'} size="xs" indicator>
          {open ? 'Needs a decision' : 'Resolved'}
        </Badge>
      }
      className={cn('@container', className)}
      footer={
        open ? (
          <ShellFooter variant="card" align="between">
            <Button variant="outline" intent="neutral" size="sm" onClick={onReportRange}>
              Report as range
            </Button>
            <Button intent="brand" size="sm" onClick={onUseRecommendation}>
              <Icon icon={CheckIcon} />
              Use recommendation
            </Button>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between" note={resolvedNote}>
            <Button variant="ghost" intent="neutral" size="sm" onClick={onUndo}>
              <Icon icon={RotateCcwIcon} />
              Undo
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      <RadioGroup
        value={current}
        onValueChange={(next) => {
          setInner(next)
          onValueChange?.(next)
        }}
        disabled={!open}
        aria-label="Which value to use"
        className="gap-0"
      >
        <div className="grid gap-3 p-4 @xl:grid-cols-2">
          {options.map((option) => {
            const checked = current === option.id
            return (
              <FieldLabel
                key={option.id}
                htmlFor={`${props.id ?? 'conflict'}-${option.id}`}
                className="has-data-[state=checked]:border-border-action has-data-[state=checked]:bg-info-subtle dark:has-data-[state=checked]:bg-info-subtle"
              >
                <Field orientation="horizontal" className="items-start gap-3">
                  <RadioGroupItem
                    value={option.id}
                    id={`${props.id ?? 'conflict'}-${option.id}`}
                    aria-labelledby={`${props.id ?? 'conflict'}-${option.id}-source ${props.id ?? 'conflict'}-${option.id}-value`}
                    className="mt-0.5"
                  />
                  <FieldContent className="gap-2">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        id={`${props.id ?? 'conflict'}-${option.id}-source`}
                        className="type-text-sm-medium text-foreground"
                      >
                        {option.source}
                      </span>
                      {open && option.recommended && (
                        <Badge variant="outline" tone="neutral" size="xs">
                          Recommended
                        </Badge>
                      )}
                      {!open && checked && (
                        <Badge variant="outline" tone="info" size="xs">
                          Chosen
                        </Badge>
                      )}
                    </span>
                    <span
                      id={`${props.id ?? 'conflict'}-${option.id}-value`}
                      className="type-heading-2xl text-foreground"
                    >
                      {option.value}
                    </span>
                    {option.detail && (
                      <span className="type-text-xs-normal text-muted-foreground">{option.detail}</span>
                    )}
                    {option.credibility && (
                      <span className="flex items-center gap-1.5 type-text-xs-normal text-foreground">
                        <span aria-hidden className={cn('size-1.5 rounded-full', DOT[option.credibility])} />
                        {option.credibilityLabel}
                      </span>
                    )}
                  </FieldContent>
                </Field>
              </FieldLabel>
            )
          })}
        </div>
        {recommendation && (
          <Alert role="note" tone="agent" size="xs" shape="full-bleed" className="px-4">
            <Icon icon={SparklesIcon} />
            <AlertDescription>{recommendation}</AlertDescription>
          </Alert>
        )}
        {rangeLabel && (
          <label
            htmlFor={`${props.id ?? 'conflict'}-range`}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 type-text-sm-normal text-foreground"
          >
            <RadioGroupItem value="range" id={`${props.id ?? 'conflict'}-range`} />
            {rangeLabel}
          </label>
        )}
      </RadioGroup>
    </TaskCard>
  )
}

export { ConflictResolver, type ConflictOption }
