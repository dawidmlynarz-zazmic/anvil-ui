import * as React from 'react'

import { cn } from '@/lib/utils'
import { QuickReply, QuickReplyGroup } from '@/components/agent/quick-reply'
import { TaskCard, TaskCardBody } from '@/components/agent/task-card'
import { IconTile } from '@/components/anvil/icon-tile'
import { ValueStack } from '@/components/anvil/value-stack'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRightIcon,
  CircleCheckIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Icon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

// Figma Agent Patterns › Tasks · task summary (10715:1193): the outcome of a task: metrics, takeaways, the
// deliverable and follow-ups. Built on Task Card + Value Stack + Badge + Item + Button + Quick Reply,
// nothing re-drawn.
// - Header: a success Icon Tile (check), the title (“Task complete”) and `subtitle`; no status Badge.
// - `stats`: a --muted strip of Value Stacks (value text/base/semibold, label under, `order` value-first).
// - `takeaways`: a heading and a numbered list: the number in an agent-subtle disc, the text (text/sm), and
//   a confidence Badge (subtle, xs, indicator: High success · Medium warning · Low destructive).
// - `deliverable`: an Item (outline) with a glyph tile, title, meta, Export (ghost, `onExport`) and Open
//   (outline, `onOpen`).
// - `followUps`: “Suggested follow-ups” (sparkles, text/xs) and Quick Reply chips (`onFollowUp`).

type Confidence = 'high' | 'medium' | 'low'
type Takeaway = { text: React.ReactNode; confidence: Confidence }

const CONFIDENCE = {
  high: { label: 'High', tone: 'success' },
  medium: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'destructive' },
} as const

function TaskSummary({
  title = 'Task complete',
  subtitle,
  stats,
  takeawaysLabel = 'Key takeaways',
  takeaways,
  deliverable,
  onExport,
  onOpen,
  openLabel = 'Open report',
  followUps,
  followUpsLabel = 'Suggested follow-ups',
  onFollowUp,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children' | 'tone'> & {
  stats?: { label: React.ReactNode; value: React.ReactNode }[]
  takeawaysLabel?: React.ReactNode
  takeaways?: Takeaway[]
  deliverable?: { title: React.ReactNode; meta?: React.ReactNode; icon?: LucideIcon }
  onExport?: () => void
  onOpen?: () => void
  openLabel?: React.ReactNode
  followUps?: string[]
  followUpsLabel?: React.ReactNode
  onFollowUp?: (followUp: string) => void
}) {
  return (
    <TaskCard
      data-slot="task-summary"
      icon={CircleCheckIcon}
      tone="success"
      title={title}
      subtitle={subtitle}
      className={cn(className)}
      {...props}
    >
      <TaskCardBody className="gap-5">
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg bg-muted p-3 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <ValueStack
                key={index}
                variant="tile"
                order="value-first"
                label={stat.label}
                className="bg-transparent p-0"
              >
                {stat.value}
              </ValueStack>
            ))}
          </div>
        )}
        {takeaways && takeaways.length > 0 && (
          <section className="flex flex-col gap-2">
            <h4 className="type-text-sm-semibold text-foreground">{takeawaysLabel}</h4>
            <ol className="flex flex-col gap-2.5">
              {takeaways.map((takeaway, index) => {
                const confidence = CONFIDENCE[takeaway.confidence]
                return (
                  <li key={index} className="flex flex-wrap items-start gap-x-2.5 gap-y-1">
                    <span
                      aria-hidden
                      className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-agent-subtle type-text-2xs-medium text-agent-strong dark:text-foreground"
                    >
                      {index + 1}
                    </span>
                    <p className="min-w-40 flex-1 type-text-sm-normal text-foreground">{takeaway.text}</p>
                    <Badge variant="subtle" tone={confidence.tone} size="xs" indicator className="shrink-0">
                      {confidence.label}
                      <span className="sr-only"> confidence</span>
                    </Badge>
                  </li>
                )
              })}
            </ol>
          </section>
        )}
        {deliverable && (
          <Item variant="outline" size="sm">
            <ItemMedia>
              <IconTile icon={deliverable.icon ?? FileTextIcon} tone="neutral" size="sm" />
            </ItemMedia>
            <ItemContent className="min-w-40 gap-0">
              <ItemTitle>{deliverable.title}</ItemTitle>
              {deliverable.meta && <ItemDescription>{deliverable.meta}</ItemDescription>}
            </ItemContent>
            <ItemActions>
              {onExport && (
                <Button variant="ghost" intent="neutral" size="sm" onClick={onExport}>
                  <Icon icon={DownloadIcon} />
                  Export
                </Button>
              )}
              {onOpen && (
                <Button variant="outline" intent="neutral" size="sm" onClick={onOpen}>
                  <Icon icon={ExternalLinkIcon} />
                  {openLabel}
                </Button>
              )}
            </ItemActions>
          </Item>
        )}
        {followUps && followUps.length > 0 && (
          <QuickReplyGroup label={followUpsLabel}>
            {followUps.map((followUp) => (
              <QuickReply key={followUp} icon={ArrowRightIcon} onClick={() => onFollowUp?.(followUp)}>
                {followUp}
              </QuickReply>
            ))}
          </QuickReplyGroup>
        )}
      </TaskCardBody>
    </TaskCard>
  )
}

export { TaskSummary, type Takeaway, type Confidence }
