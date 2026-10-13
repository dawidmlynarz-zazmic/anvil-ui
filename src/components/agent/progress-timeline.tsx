import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard } from '@/components/agent/task-card'
import { ShellFooter } from '@/components/anvil/shell'
import { Timeline, TimelineItem, type TimelineTone } from '@/components/anvil/timeline'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleDashedIcon,
  Icon,
  ListChecksIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  XIcon,
  ZapIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

// Figma Agent Patterns › Tasks · progress timeline (10713:365): live step-by-step execution with pause,
// stop and wrap up. Built on Task Card + Progress + Timeline (tile markers) + Alert + Button, nothing
// re-drawn. Figma state running · paused · complete → `status`.
// - Header: the title and subtitle, and a Badge with the elapsed time (running: info, indicator ·
//   paused: warning · complete: success).
// - Under it: a Progress (4px; agent while running, warning paused, success complete) and the `summary`
//   line (“Step 3 of 5 · 27 sources read · 8 findings”). Paused adds a full-bleed warning note
//   (`pausedNote`, role note).
// - The steps (`steps`) are Timeline items with a circle tile marker: done (check, success) · running
//   (a spinning loader, agent) · failed (cross, destructive) · waiting (dashed circle, neutral, a muted
//   title); title, `detail`, and the duration at the end (“2m 05s”, or a dash).
// - Footers: running: Pause (outline) · Stop (ghost, destructive) · Wrap up now (outline, at the end);
//   paused: Resume (brand) · Stop · Wrap up now; complete: Run summary (ghost) · the review button (brand
//   + arrow, `reviewLabel`).
// The spinner keeps turning under reduced motion: it says “working”.

type RunStatus = 'running' | 'paused' | 'complete'
type StepState = 'done' | 'running' | 'failed' | 'waiting'
type TimelineStep = {
  id: string
  title: React.ReactNode
  detail?: React.ReactNode
  /** “2m 05s”; waiting steps show a dash. */
  duration?: React.ReactNode
  status: StepState
}

const MARKER: Record<StepState, { icon: LucideIcon; tone: TimelineTone }> = {
  done: { icon: CheckIcon, tone: 'success' },
  running: { icon: LoaderCircleIcon, tone: 'agent' },
  failed: { icon: XIcon, tone: 'destructive' },
  waiting: { icon: CircleDashedIcon, tone: 'neutral' },
}

const BADGE = { running: 'info', paused: 'warning', complete: 'success' } as const
const BAR = { running: 'agent', paused: 'warning', complete: 'success' } as const

function ProgressTimeline({
  status = 'running',
  title,
  subtitle,
  badge,
  progress,
  summary,
  pausedNote,
  steps,
  onPause,
  onResume,
  onStop,
  onWrapUp,
  onSummary,
  onReview,
  reviewLabel = 'Review outline',
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children'> & {
  /** Figma state running · paused · complete. */
  status?: RunStatus
  /** The elapsed time in the header Badge: “6m 12s”, “Paused · 6m 12s”, “Complete · 12m 33s”. */
  badge?: React.ReactNode
  /** 0–100. */
  progress: number
  summary?: React.ReactNode
  /** The note when paused: “Paused by you at 14:09. Nothing is lost; resume any time.” */
  pausedNote?: React.ReactNode
  steps: TimelineStep[]
  onPause?: () => void
  onResume?: () => void
  onStop?: () => void
  onWrapUp?: () => void
  onSummary?: () => void
  onReview?: () => void
  reviewLabel?: React.ReactNode
}) {
  return (
    <TaskCard
      data-slot="progress-timeline"
      data-status={status}
      icon={ActivityIcon}
      title={title}
      subtitle={subtitle}
      badge={
        badge && (
          <Badge variant="subtle" tone={BADGE[status]} size="xs" indicator>
            {badge}
          </Badge>
        )
      }
      className={cn(className)}
      footer={
        status === 'complete' ? (
          <ShellFooter variant="card" align="between">
            <Button variant="ghost" intent="neutral" size="sm" onClick={onSummary}>
              <Icon icon={ListChecksIcon} />
              Run summary
            </Button>
            <Button intent="brand" size="sm" onClick={onReview}>
              <Icon icon={ArrowRightIcon} />
              {reviewLabel}
            </Button>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between">
            <div className="flex items-center gap-2">
              {status === 'running' ? (
                <Button variant="outline" intent="neutral" size="sm" onClick={onPause}>
                  <Icon icon={PauseIcon} />
                  Pause
                </Button>
              ) : (
                <Button intent="brand" size="sm" onClick={onResume}>
                  <Icon icon={PlayIcon} />
                  Resume
                </Button>
              )}
              <Button variant="ghost" intent="destructive" size="sm" onClick={onStop}>
                <Icon icon={SquareIcon} />
                Stop
              </Button>
            </div>
            <Button variant="outline" intent="neutral" size="sm" onClick={onWrapUp}>
              <Icon icon={ZapIcon} />
              Wrap up now
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      <div className="flex flex-col gap-2 px-4 pt-3 pb-2">
        <Progress aria-label="Progress" value={progress} size="sm" tone={BAR[status]} />
        {summary && <p className="type-text-xs-normal text-muted-foreground">{summary}</p>}
      </div>
      {status === 'paused' && pausedNote && (
        <Alert role="note" tone="warning" size="xs" shape="full-bleed" className="px-4">
          <Icon icon={PauseIcon} />
          <AlertDescription>{pausedNote}</AlertDescription>
        </Alert>
      )}
      <Timeline className="px-4 pt-3" aria-label="Steps">
        {steps.map((step, index) => {
          const marker = MARKER[step.status]
          return (
            <TimelineItem
              key={step.id}
              marker="tile"
              icon={marker.icon}
              tone={marker.tone}
              title={
                step.status === 'waiting' ? (
                  <span className="text-muted-foreground">{step.title}</span>
                ) : (
                  step.title
                )
              }
              detail={step.detail}
              actor={step.duration ?? (step.status === 'waiting' ? '—' : undefined)}
              last={index === steps.length - 1}
              className={cn(step.status === 'running' && '[&_[data-slot=icon-tile]_svg]:animate-spin')}
            />
          )
        })}
      </Timeline>
    </TaskCard>
  )
}

export { ProgressTimeline, type RunStatus, type TimelineStep, type StepState }
