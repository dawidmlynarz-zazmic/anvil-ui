import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskCardBody } from '@/components/agent/task-card'
import { ShellFooter } from '@/components/anvil/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  GaugeIcon,
  Icon,
  PlusIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  ZapIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'

// Figma Agent Patterns › Tasks · run limits (10720:1245): time, volume, tool-call and cost caps, with a
// near-limit warning. Built on Task Card + Slider + Progress + Alert + Button, nothing re-drawn. Figma
// state review · near limit → `status`.
// - review: each limit is a row: a 14px glyph, the label (text/sm/medium), the value at the end
//   (`display`, “15 min”) and a Slider (agent tone) to set it, then a hint (text/xs muted). The header
//   Badge says the depth (outline); the footer is Reset to defaults (ghost) and Save limits (brand).
// - near-limit: the run is going. Each row shows `used` against the cap in `display` (“11m 40s / 15 min”)
//   as a Progress (agent; warning on a limit that is `near`), the header Badge says what is close (warning),
//   a full-bleed Alert (size xs, role note) gives the `warning` (“At this rate the run needs…”), and the
//   footer is Wrap up now (outline) and Extend (brand + plus).
// Values are numbers (`value` for the cap, `used` for the progress, both on the Slider / Progress `min`·`max`
// scale); `display` and `usedDisplay` are the formatted text, because units differ per limit.

type Limit = {
  id: string
  icon: LucideIcon
  label: React.ReactNode
  /** The cap: the Slider's value. */
  value: number
  min: number
  max: number
  step?: number
  /** The cap, formatted: “15 min”, “$10.00”. */
  display: React.ReactNode
  /** Under the control: “Estimated 12–15 min”. */
  hint?: React.ReactNode
  /** While running: what has been used (same scale as `value`). */
  used?: number
  /** While running: “11m 40s / 15 min”. */
  usedDisplay?: React.ReactNode
  /** This limit is close to its cap (the Progress turns warning). */
  near?: boolean
}

function RunLimits({
  status = 'review',
  title,
  subtitle,
  badge,
  limits,
  onLimitChange,
  warning,
  onReset,
  onSave,
  onWrapUp,
  onExtend,
  extendLabel = 'Extend',
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children'> & {
  /** Figma state review · near limit. */
  status?: 'review' | 'near-limit'
  /** The header text: “Standard depth” (review) or what is close (“90% of cost cap”). */
  badge?: React.ReactNode
  limits: Limit[]
  onLimitChange?: (id: string, value: number) => void
  /** The near-limit note: “At this rate the run needs about $1.40 more to finish all steps.” */
  warning?: React.ReactNode
  onReset?: () => void
  onSave?: () => void
  onWrapUp?: () => void
  onExtend?: () => void
  /** The Extend button, e.g. “Extend by $5”. */
  extendLabel?: React.ReactNode
}) {
  const running = status === 'near-limit'
  return (
    <TaskCard
      data-slot="run-limits"
      data-status={status}
      icon={GaugeIcon}
      title={title}
      subtitle={subtitle}
      badge={
        badge && (
          <Badge
            variant={running ? 'subtle' : 'outline'}
            tone={running ? 'warning' : 'neutral'}
            size="xs"
            indicator={running}
          >
            {badge}
          </Badge>
        )
      }
      className={cn(className)}
      footer={
        running ? (
          <ShellFooter variant="card" align="between">
            <Button variant="outline" intent="neutral" size="sm" onClick={onWrapUp}>
              <Icon icon={ZapIcon} />
              Wrap up now
            </Button>
            <Button intent="brand" size="sm" onClick={onExtend}>
              <Icon icon={PlusIcon} />
              {extendLabel}
            </Button>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between">
            <Button variant="ghost" intent="neutral" size="sm" onClick={onReset}>
              <Icon icon={RotateCcwIcon} />
              Reset to defaults
            </Button>
            <Button intent="brand" size="sm" onClick={onSave}>
              <Icon icon={CheckIcon} />
              Save limits
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      <TaskCardBody className="gap-4">
        {limits.map((limit) => {
          const labelId = `${props.id ?? 'limits'}-${limit.id}`
          return (
            <div key={limit.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span id={labelId} className="flex items-center gap-2 type-text-sm-medium text-foreground">
                  <Icon icon={limit.icon} className="size-3.5 text-muted-foreground" />
                  {limit.label}
                </span>
                <span className="type-text-sm-medium text-foreground">
                  {running ? (limit.usedDisplay ?? limit.display) : limit.display}
                </span>
              </div>
              {running ? (
                <Progress
                  aria-labelledby={labelId}
                  value={limit.used ?? 0}
                  max={limit.max}
                  size="sm"
                  tone={limit.near ? 'warning' : 'agent'}
                />
              ) : (
                <Slider
                  tone="agent"
                  aria-labelledby={labelId}
                  value={[limit.value]}
                  min={limit.min}
                  max={limit.max}
                  step={limit.step}
                  onValueChange={([next]) => onLimitChange?.(limit.id, next)}
                />
              )}
              {limit.hint && <p className="type-text-xs-normal text-muted-foreground">{limit.hint}</p>}
            </div>
          )
        })}
      </TaskCardBody>
      {running && warning && (
        <Alert role="note" tone="warning" size="xs" shape="full-bleed" className="px-4">
          <Icon icon={TriangleAlertIcon} />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
    </TaskCard>
  )
}

export { RunLimits, type Limit }
