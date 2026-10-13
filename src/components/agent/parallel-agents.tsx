import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { TaskCard } from '@/components/agent/task-card'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellFooter } from '@/components/anvil/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRightIcon,
  BotIcon,
  GitMergeIcon,
  Icon,
  NetworkIcon,
  PauseIcon,
  PlusIcon,
  RotateCcwIcon,
} from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// Figma Agent Patterns › Tasks · parallel agents (10722:1845): sub-agent lanes with a merge status. Built on
// Task Card + Icon Tile + Badge + Progress + Alert + Button + Pulse Dot, nothing re-drawn. Figma state
// running · merging → `status` of the card; each lane has its own `status` (Figma status running ·
// waiting · done · failed).
// - AgentLane: a bordered row (radius lg; a --muted fill while waiting, a --danger stroke when failed):
//   a 32px Icon Tile (agent while running or waiting, success done, destructive failed), the title
//   (text/sm/medium), the `current` action line (running: a Pulse Dot and the text in the agent colour;
//   otherwise muted), a 4px Progress in the lane's tone, and at the end a status Badge (subtle, xs,
//   indicator) over the counts (`counts`, text/xs muted).
// - ParallelAgents: the card: the lanes, a full-bleed agent note (`mergeNote`: how merging is going), and
//   the footer. running: Pause all (outline) · Retry failed (ghost) · Add sub-agent (ghost, at the end).
//   merging: `footerNote` and View findings (brand + arrow).

type LaneStatus = 'running' | 'waiting' | 'done' | 'failed'

const TILE = { running: 'agent', waiting: 'agent', done: 'success', failed: 'destructive' } as const
const BADGE = { running: 'info', waiting: 'agent', done: 'success', failed: 'destructive' } as const
const LABEL = { running: 'Running', waiting: 'Waiting', done: 'Done', failed: 'Failed' } as const
const BAR = { running: 'agent', waiting: 'agent', done: 'success', failed: 'destructive' } as const

function AgentLane({
  status = 'running',
  title,
  current,
  counts,
  progress = 0,
  className,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  status?: LaneStatus
  title: React.ReactNode
  /** What it is doing, or its result: “Extracting 2025 import shares from Eurostat”. */
  current?: React.ReactNode
  /** “14 sources · 5 findings”; a dash while waiting. */
  counts?: React.ReactNode
  /** 0–100. */
  progress?: number
}) {
  return (
    <article
      data-slot="agent-lane"
      data-status={status}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3',
        status === 'waiting' && 'bg-muted',
        status === 'failed' && 'border-danger-muted',
        className,
      )}
      {...props}
    >
      <IconTile icon={BotIcon} tone={TILE[status]} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h4 className="type-text-sm-medium text-foreground">{title}</h4>
        {current && (
          <p
            className={cn(
              'flex items-center gap-1.5 type-text-xs-normal',
              status === 'running' ? 'text-agent dark:text-agent-medium' : 'text-muted-foreground',
            )}
          >
            {status === 'running' && <PulseDot />}
            {current}
          </p>
        )}
        <Progress
          aria-label={`${typeof title === 'string' ? title : 'Sub-agent'} progress`}
          value={progress}
          size="sm"
          tone={BAR[status]}
        />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 self-stretch">
        <Badge variant="subtle" tone={BADGE[status]} size="xs" indicator>
          {LABEL[status]}
        </Badge>
        <span className="mt-auto type-text-xs-normal text-muted-foreground">{counts ?? '—'}</span>
      </div>
    </article>
  )
}

function ParallelAgents({
  status = 'running',
  title,
  subtitle,
  badge,
  mergeNote,
  footerNote,
  onPauseAll,
  onRetryFailed,
  onAddAgent,
  onViewFindings,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer'> & {
  /** Figma state running · merging. */
  status?: 'running' | 'merging'
  /** Header text: “1 running · 1 failed” (outline) while running; “Merging” (info) while merging. */
  badge?: React.ReactNode
  /** How the merge is going: “Findings merge into the report as each sub-agent finishes. 8 of 18 merged.” */
  mergeNote?: React.ReactNode
  /** The merging footer line: “All sub-agents finished in 9m 58s”. */
  footerNote?: React.ReactNode
  onPauseAll?: () => void
  onRetryFailed?: () => void
  onAddAgent?: () => void
  onViewFindings?: () => void
}) {
  return (
    <TaskCard
      data-slot="parallel-agents"
      data-status={status}
      icon={NetworkIcon}
      title={title}
      subtitle={subtitle}
      badge={
        badge && (
          <Badge
            variant={status === 'merging' ? 'subtle' : 'outline'}
            tone={status === 'merging' ? 'info' : 'neutral'}
            size="xs"
            indicator={status === 'merging'}
          >
            {badge}
          </Badge>
        )
      }
      className={cn(className)}
      footer={
        status === 'merging' ? (
          <ShellFooter variant="card" align="between" note={footerNote}>
            <Button intent="brand" size="sm" onClick={onViewFindings}>
              <Icon icon={ArrowRightIcon} />
              View findings
            </Button>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between">
            <div className="flex items-center gap-2">
              <Button variant="outline" intent="neutral" size="sm" onClick={onPauseAll}>
                <Icon icon={PauseIcon} />
                Pause all
              </Button>
              <Button variant="ghost" intent="neutral" size="sm" onClick={onRetryFailed}>
                <Icon icon={RotateCcwIcon} />
                Retry failed
              </Button>
            </div>
            <Button variant="ghost" intent="neutral" size="sm" onClick={onAddAgent}>
              <Icon icon={PlusIcon} />
              Add sub-agent
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      <div className="flex flex-col gap-2 p-3">{children}</div>
      {mergeNote && (
        <Alert role="note" tone="agent" size="xs" shape="full-bleed" className="px-4">
          <Icon icon={GitMergeIcon} />
          <AlertDescription>{mergeNote}</AlertDescription>
        </Alert>
      )}
    </TaskCard>
  )
}

export { ParallelAgents, AgentLane, type LaneStatus }
