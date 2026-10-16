import { ApprovalCard, ApprovalCardField } from '@/components/agent/approval-card'
import { ImageGenerationCard } from '@/components/agent/image-generation-card'
import { FileOutputCard } from '@/components/agent/file-output-card'
import { AvailabilityCalendar, type AvailabilityMap } from '@/components/agent/availability-calendar'
import { MemoryNotice } from '@/components/agent/memory-notice'
import { OfferCard } from '@/components/agent/offer-card'
import { OfferCarousel } from '@/components/agent/offer-carousel'
import { QuantitySelector } from '@/components/agent/quantity-selector'
import { SlotList, type Slot } from '@/components/agent/slot-list'
import { ProgressTimeline, type TimelineStep } from '@/components/agent/progress-timeline'
import { QuestionSet, type Answers, type Question } from '@/components/agent/question-set'
import { QuickReply, QuickReplyGroup } from '@/components/agent/quick-reply'
import { Rating } from '@/components/agent/rating'
import { RunLimits, type Limit } from '@/components/agent/run-limits'
import { TaskBrief, type BriefField } from '@/components/agent/task-brief'
import { TaskCard } from '@/components/agent/task-card'
import { TaskPlan, TaskPlanStep } from '@/components/agent/task-plan'
import { TaskSummary, type Takeaway } from '@/components/agent/task-summary'
import { WidgetMetricCard, WidgetMetricGroup } from '@/components/agent/widget-metric-card'
import { CheckRow } from '@/components/anvil/check-row'
import { IconTile } from '@/components/anvil/icon-tile'
import { Price } from '@/components/anvil/price'
import { ProgressStep, ProgressSteps } from '@/components/anvil/progress-steps'
import { RatingDisplay } from '@/components/anvil/rating-display'
import { ShellFooter } from '@/components/anvil/shell'
import { Timeline, TimelineItem } from '@/components/anvil/timeline'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BackpackIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CircleDashedIcon,
  HeadsetIcon,
  Icon,
  LoaderCircleIcon,
  TicketIcon,
} from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

import type { WidgetEntry } from './engine'

// Maps a widget `kind` (a flow's data) to a real Anvil component. Interactive widgets call `emit`:
// `resolve` answers an `ask`; any other event (pause, resume, stop…) goes to the flow's listener. A widget
// the user has already answered (`entry.done`) is shown read-only. Add a kind here, then use it in a flow.

type Emit = (event: string, payload?: unknown) => void

/** A soft local gradient for the generated image (no network). */
const COSMIC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><radialGradient id="g" cx="0.3" cy="0.3" r="1"><stop offset="0" stop-color="#e9d5ff"/><stop offset="0.5" stop-color="#a5b4fc"/><stop offset="1" stop-color="#1e1b4b"/></radialGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>',
  )

/** October 2026 for the booking demo: sold out on the 10th and 24th, filling up before some weekends. */
const OCTOBER: AvailabilityMap = (() => {
  const map: AvailabilityMap = {}
  for (let day = 3; day <= 31; day += 1) {
    const key = `2026-10-${String(day).padStart(2, '0')}`
    if (day === 10 || day === 24) map[key] = { level: 'unavailable' }
    else if (day % 7 === 2 || day === 9 || day === 16 || day === 30)
      map[key] = { level: 'limited', price: day === 16 || day === 30 ? '$45' : '$39' }
    else map[key] = { level: 'available', price: '$29' }
  }
  return map
})()

type Spec = Record<string, unknown>
const get = <T,>(spec: Spec, key: string, fallback?: T) => (spec[key] ?? fallback) as T

export function Widget({ entry, emit }: { entry: WidgetEntry; emit: Emit }) {
  const spec = entry.spec as Spec
  const live = !entry.done
  switch (entry.spec.kind) {
    case 'chips':
      return (
        <QuickReplyGroup label={get<string | undefined>(spec, 'label')}>
          {get<string[]>(spec, 'items').map((item) => (
            <QuickReply key={item} disabled={!live} onClick={() => emit('resolve', item)}>
              {item}
            </QuickReply>
          ))}
        </QuickReplyGroup>
      )
    case 'questions':
      return (
        <QuestionSet
          title={get(spec, 'title', 'Before I start')}
          subtitle={get(spec, 'subtitle')}
          questions={get<Question[]>(spec, 'questions')}
          {...(entry.done ? { value: get<Answers>(spec, 'answers', {}) } : {})}
          onSkip={live ? () => emit('resolve', null) : undefined}
          onSubmit={live ? (answers) => emit('resolve', answers) : undefined}
          submitLabel="Continue"
          answeredSubmitLabel="Update brief"
        />
      )
    case 'brief':
      return (
        <TaskBrief
          status={get(spec, 'status', 'review')}
          title={get(spec, 'title', 'Research brief')}
          subtitle={get(spec, 'subtitle')}
          questionLabel="Research question"
          question={get(spec, 'question')}
          fields={get<BriefField[]>(spec, 'fields')}
          approvedNote={get(spec, 'approvedNote')}
          onEdit={live ? () => emit('resolve', 'edit') : undefined}
          onRefine={live ? () => emit('resolve', 'refine') : undefined}
          onApprove={live ? () => emit('resolve', 'approve') : undefined}
        />
      )
    case 'plan':
      return (
        <TaskPlan
          status={get(spec, 'status', 'review')}
          title={get(spec, 'title', 'Research plan')}
          subtitle={get(spec, 'subtitle')}
          note={get(spec, 'note')}
          approvedNote={get(spec, 'approvedNote')}
          onEdit={live ? () => emit('resolve', 'edit') : undefined}
          onApprove={live ? () => emit('resolve', 'approve') : undefined}
          onViewProgress={() => {}}
        >
          {get<{ title: string; description: string; tags: string[] }[]>(spec, 'steps').map((step, i) => (
            <TaskPlanStep key={step.title} index={i + 1} {...step} />
          ))}
        </TaskPlan>
      )
    case 'progress':
      return (
        <ProgressTimeline
          status={get(spec, 'status', 'running')}
          title={get(spec, 'title', 'Researching')}
          subtitle={get(spec, 'subtitle')}
          badge={get(spec, 'badge')}
          progress={get(spec, 'progress', 0)}
          summary={get(spec, 'summary')}
          pausedNote={get(spec, 'pausedNote')}
          steps={get<TimelineStep[]>(spec, 'steps')}
          onPause={() => emit('pause')}
          onResume={() => emit('resume')}
          onStop={() => emit('stop')}
          onWrapUp={() => emit('wrap')}
          onSummary={() => emit('summary')}
          onReview={() => emit('review')}
        />
      )
    case 'summary':
      return (
        <TaskSummary
          subtitle={get(spec, 'subtitle')}
          stats={get(spec, 'stats')}
          takeaways={get<Takeaway[]>(spec, 'takeaways')}
          deliverable={get(spec, 'deliverable')}
          onExport={() => {}}
          onOpen={() => {}}
          followUps={get(spec, 'followUps')}
          onFollowUp={live ? (text) => emit('resolve', text) : undefined}
        />
      )
    case 'approval': {
      const status = get<'pending' | 'approved' | 'denied'>(spec, 'status', 'pending')
      return (
        <ApprovalCard
          status={status}
          title={get(spec, 'title')}
          subtitle={get(spec, 'subtitle')}
          note={get(spec, 'note')}
          footer={
            status === 'pending' ? (
              <ShellFooter variant="card" align="end">
                <Button
                  variant="outline"
                  intent="neutral"
                  size="sm"
                  disabled={!live}
                  onClick={() => emit('resolve', 'deny')}
                >
                  Deny
                </Button>
                <Button intent="brand" size="sm" disabled={!live} onClick={() => emit('resolve', 'approve')}>
                  <Icon icon={CheckIcon} />
                  Approve
                </Button>
              </ShellFooter>
            ) : (
              <ShellFooter
                variant="card"
                note={get(
                  spec,
                  'resultNote',
                  status === 'approved' ? 'Approved just now' : 'Denied just now',
                )}
              />
            )
          }
        >
          {get<[string, string][]>(spec, 'fields').map(([label, value]) => (
            <ApprovalCardField key={label} label={label}>
              {value}
            </ApprovalCardField>
          ))}
        </ApprovalCard>
      )
    }
    case 'offer':
      return (
        <Item variant="outline" size="sm" className="flex-nowrap items-start">
          <ItemMedia>
            <IconTile icon={BackpackIcon} tone="info" size="default" />
          </ItemMedia>
          <ItemContent className="gap-2">
            <ItemTitle>{get(spec, 'name', 'Trailhead 28L daypack')}</ItemTitle>
            <ItemDescription className="line-clamp-none">
              <RatingDisplay
                display="compact"
                value={get(spec, 'rating', 4.6)}
                label={get(spec, 'reviews', '4.6 · 1,204 reviews')}
              />
            </ItemDescription>
            <div className="flex flex-col gap-1">
              {get<[string, 'included' | 'excluded' | 'fee'][]>(spec, 'perks').map(([text, status]) => (
                <CheckRow key={text} status={status}>
                  {text}
                </CheckRow>
              ))}
            </div>
            <Price
              size="default"
              emphasis="sale"
              current={get(spec, 'price', '$119')}
              was={get(spec, 'was', '$148')}
              discount={get(spec, 'discount', '−20%')}
            />
          </ItemContent>
        </Item>
      )
    case 'tracker':
      return (
        <div className="rounded-xl border bg-card p-4">
          <ProgressSteps aria-label="Delivery progress">
            {get<{ label: string; meta: string }[]>(spec, 'steps').map((step, i) => {
              const at = get<number>(spec, 'step', 0)
              return (
                <ProgressStep
                  key={step.label}
                  label={step.label}
                  meta={step.meta}
                  status={i < at ? 'done' : i === at ? 'current' : 'upcoming'}
                />
              )
            })}
          </ProgressSteps>
        </div>
      )
    case 'metrics':
      return (
        <WidgetMetricGroup>
          {get<{ label: string; value: string; delta: string; trend: 'up' | 'down' | 'neutral' }[]>(
            spec,
            'items',
          ).map((m) => (
            <WidgetMetricCard key={m.label} size="compact" className="min-w-0" {...m} />
          ))}
        </WidgetMetricGroup>
      )
    case 'rating':
      return (
        <Rating
          kind="stars"
          question={get(spec, 'question', 'How did I do?')}
          value={get<number | undefined>(spec, 'value')}
          onValueChange={live ? (value) => emit('resolve', value) : undefined}
        />
      )
    case 'handoff': {
      const status = get<'queued' | 'connecting' | 'connected'>(spec, 'status', 'queued')
      const position = get<number>(spec, 'position', 3)
      return (
        <TaskCard
          icon={HeadsetIcon}
          title={status === 'connected' ? 'You’re connected' : 'Getting you to a person'}
          subtitle={
            status === 'queued'
              ? `You’re number ${position} in the queue · about ${position} min`
              : status === 'connecting'
                ? 'Connecting you now…'
                : 'Maya Chen · Support'
          }
        >
          <div className="p-4">
            <Timeline aria-label="Handoff progress">
              <TimelineItem
                marker="tile"
                tone="success"
                icon={CheckIcon}
                title="Conversation summarised"
                detail="Maya will see what we talked about"
              />
              <TimelineItem
                marker="tile"
                tone={status === 'queued' ? 'agent' : 'success'}
                icon={status === 'queued' ? LoaderCircleIcon : CheckIcon}
                title="In the queue"
                detail={status === 'queued' ? `Position ${position}` : 'Next in line'}
              />
              <TimelineItem
                marker="tile"
                tone={status === 'connected' ? 'success' : status === 'connecting' ? 'agent' : 'neutral'}
                icon={
                  status === 'connected'
                    ? CheckIcon
                    : status === 'connecting'
                      ? LoaderCircleIcon
                      : CircleDashedIcon
                }
                title={status === 'connected' ? 'Maya Chen joined' : 'A person joins'}
                last
              />
            </Timeline>
            {status === 'connected' && (
              <Item size="xs" className="mt-2">
                <ItemMedia>
                  <Avatar size="default">
                    <AvatarFallback tone="warning">MC</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0">
                  <ItemTitle>Maya Chen</ItemTitle>
                  <ItemDescription>Support · usually replies in under a minute</ItemDescription>
                </ItemContent>
              </Item>
            )}
          </div>
        </TaskCard>
      )
    }
    case 'limits':
      return (
        <RunLimits
          status="near-limit"
          title={get(spec, 'title', 'Budget & limits')}
          subtitle={get(spec, 'subtitle')}
          badge={get(spec, 'badge')}
          limits={get<Limit[]>(spec, 'limits')}
          warning={get(spec, 'warning')}
          extendLabel={get(spec, 'extendLabel', 'Extend')}
        />
      )
    case 'memory':
      return <MemoryNotice status="saved">{get<string>(spec, 'text')}</MemoryNotice>
    case 'file':
      return (
        <FileOutputCard
          kind={get(spec, 'fileKind', 'presentation')}
          status={get(spec, 'status', 'ready')}
          name={get(spec, 'name')}
          meta={get(spec, 'meta')}
          progress={get(spec, 'progress')}
        />
      )
    case 'image':
      return (
        <ImageGenerationCard
          status={get(spec, 'status', 'ready')}
          prompt={get(spec, 'prompt')}
          statusText="Generating · 6s"
        >
          <img src={COSMIC} alt="" />
        </ImageGenerationCard>
      )
    case 'offers': {
      const shows = get<
        {
          id: string
          title: string
          badge: string
          tone: 'info' | 'success' | 'warning'
          subtitle: string
          price: string
        }[]
      >(spec, 'shows')
      const chosen = get<string | undefined>(spec, 'chosen')
      const picked = shows.find((show) => show.id === chosen)
      if (picked)
        return (
          <OfferCard
            layout="compact"
            selected
            title={picked.title}
            subtitle={picked.subtitle}
            price={picked.price}
          />
        )
      return (
        <OfferCarousel title="Shows this weekend" count="3 results">
          {shows.map((show) => (
            <OfferCard
              key={show.id}
              title={show.title}
              badge={
                <Badge variant="subtle" tone={show.tone} size="sm">
                  {show.badge}
                </Badge>
              }
              subtitle={show.subtitle}
              meta="This weekend"
              rating={{ value: 4.8, label: '4.8 · 2.3k reviews' }}
              price={show.price}
              ctaLabel="View dates"
              onCta={() => emit('resolve', show.id)}
              onSelect={() => emit('resolve', show.id)}
            />
          ))}
        </OfferCarousel>
      )
    }
    case 'calendar': {
      const chosen = get<string | undefined>(spec, 'chosen')
      if (chosen)
        return (
          <Item variant="outline" size="sm" className="flex-nowrap">
            <ItemMedia>
              <IconTile icon={CalendarIcon} tone="info" size="sm" />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>
                {new Date(`${chosen}T12:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </ItemTitle>
              <ItemDescription>Date chosen</ItemDescription>
            </ItemContent>
          </Item>
        )
      return (
        <AvailabilityCalendar
          defaultMonth={new Date(2026, 9, 1)}
          today={new Date(2026, 9, 1)}
          availability={OCTOBER}
          subtitle={get<string>(spec, 'show')}
          legendNote="Prices from, per ticket"
          onSelect={(date) => {
            if (date && live)
              emit(
                'resolve',
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
              )
          }}
        />
      )
    }
    case 'slots': {
      const slots = get<Slot[]>(spec, 'slots')
      const chosen = get<string | undefined>(spec, 'chosen')
      const day = get<string>(spec, 'day')
      const title = new Date(`${day}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
      const picked = slots.find((slot) => slot.id === chosen)
      if (picked)
        return (
          <Item variant="outline" size="sm" className="flex-nowrap">
            <ItemMedia>
              <IconTile icon={ClockIcon} tone="info" size="sm" />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>
                {picked.time} · {picked.label}
              </ItemTitle>
              <ItemDescription>Time chosen</ItemDescription>
            </ItemContent>
          </Item>
        )
      return (
        <SlotList
          title={title}
          subtitle={get<string>(spec, 'subtitle')}
          note="The 14:30 matinee is captioned. Relaxed performance on 1 Nov."
          slots={slots}
          onValueChange={(value) => live && emit('resolve', value)}
        />
      )
    }
    case 'quantity': {
      const chosen = get<Record<string, number> | undefined>(spec, 'chosen')
      const types = get<{ id: string; label: string; detail?: string; price: number }[]>(spec, 'types')
      if (chosen) {
        const count = Object.values(chosen).reduce((sum, n) => sum + n, 0)
        const total = types.reduce((sum, type) => sum + (chosen[type.id] ?? 0) * type.price, 0)
        return (
          <Item variant="outline" size="sm" className="flex-nowrap">
            <ItemMedia>
              <IconTile icon={TicketIcon} tone="info" size="sm" />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>
                {count} {count === 1 ? 'ticket' : 'tickets'} · ${total}.00
              </ItemTitle>
              <ItemDescription>Tickets chosen</ItemDescription>
            </ItemContent>
          </Item>
        )
      }
      return (
        <QuantitySelector
          title="How many tickets?"
          subtitle={get<string>(spec, 'subtitle')}
          types={types}
          defaultValues={{ adult: 2 }}
          maxTotal={8}
          note="Max 8 per order · fees shown at checkout"
          actionLabel="Continue"
          onAction={(values) => live && emit('resolve', values)}
        />
      )
    }
    default:
      return null
  }
}
