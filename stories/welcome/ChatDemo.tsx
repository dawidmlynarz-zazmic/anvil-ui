import { useEffect, useState, type ReactNode } from 'react'

import { ApprovalCard, ApprovalCardField } from '@/components/agent/approval-card'
import { CitationChip } from '@/components/agent/citation-chip'
import { ClarifyingQuestion } from '@/components/agent/clarifying-question'
import { FileOutputCard } from '@/components/agent/file-output-card'
import { ImageGenerationCard } from '@/components/agent/image-generation-card'
import { MemoryNotice } from '@/components/agent/memory-notice'
import { PromptInput } from '@/components/agent/prompt-input'
import { QuickReply, QuickReplyGroup } from '@/components/agent/quick-reply'
import { Rating } from '@/components/agent/rating'
import { StreamingPlaceholder } from '@/components/agent/streaming-placeholder'
import { ThinkingPanel, ThinkingPanelContent, ThinkingPanelTrigger } from '@/components/agent/thinking-panel'
import {
  ToolCallAccordion,
  ToolCallAccordionContent,
  ToolCallAccordionTrigger,
} from '@/components/agent/tool-call-accordion'
import { ToolCallItem, ToolCallItemTrigger } from '@/components/agent/tool-call-item'
import { WidgetMetricCard, WidgetMetricGroup } from '@/components/agent/widget-metric-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BotIcon, CheckIcon, Icon, type LucideIcon } from '@/components/ui/icon'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Message, MessageAvatar, MessageContent, MessageGroup } from '@/components/ui/message'
import { MessageBubble, MessageBubbleContent } from '@/components/ui/message-bubble'
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller'

// The Welcome hero's chat window: short, slightly silly conversations with an assistant, drawn with
// the real Agent Builder components and played in a loop. Each loop picks another of five
// scenarios at random. Under reduced motion (or the Motion toolbar off) it shows one finished
// conversation instead. The window is decorative: inert and hidden from assistive tech, with a text
// description next to it.

// ── The script language ────────────────────────────────────────────────────────────────────

type Tool = { name: string; summary: string; duration: string }

/** Rich content an agent turn can hold, as data (rendered by `Widget`). */
type WidgetSpec =
  | { kind: 'clarify'; question: string; options: string[]; picked?: number }
  | { kind: 'approval'; title: string; subtitle: string; fields: [string, string][]; approved?: boolean }
  | { kind: 'memory'; text: string }
  | {
      kind: 'metrics'
      items: { label: string; value: string; delta: string; trend: 'up' | 'down' | 'neutral' }[]
    }
  | { kind: 'file'; name: string; meta: string; ready?: boolean }
  | { kind: 'image'; prompt: string; ready?: boolean }
  | { kind: 'replies'; items: string[] }
  | { kind: 'rating'; value?: number }
  | { kind: 'sources'; domains: string[] }

type AgentTurn = {
  id: string
  kind: 'agent'
  typing?: boolean
  thinking?: { title: string; done?: string; body: string; finished?: boolean }
  tools?: { list: Tool[]; done: number }
  text?: string
  widgets?: WidgetSpec[]
}
type Turn =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'marker'; text: string; icon?: LucideIcon }
  | AgentTurn

type Step =
  | { do: 'say'; text: string }
  | { do: 'agent'; id: string }
  | { do: 'think'; id: string; title: string; done: string; body: string }
  | { do: 'tools'; id: string; list: Tool[] }
  | { do: 'stream'; id: string; text: string }
  /** Adds a widget to the turn, or replaces the one of the same kind. */
  | { do: 'widget'; id: string; widget: WidgetSpec }
  | { do: 'marker'; text: string; icon?: LucideIcon }
  | { do: 'pause'; ms: number }

type Scenario = { name: string; steps: Step[] }

// ── Five scenarios ─────────────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    name: 'Team offsite',
    steps: [
      { do: 'say', text: 'Plan a team offsite for 12. Anything but another escape room, please.' },
      { do: 'agent', id: 'a1' },
      {
        do: 'think',
        id: 'a1',
        title: 'Thinking about fun',
        done: 'Thought for 3s',
        body: 'Twelve people, a Friday, no puzzles involving locks. Food usually wins.',
      },
      {
        do: 'widget',
        id: 'a1',
        widget: {
          kind: 'clarify',
          question: 'What’s the vibe?',
          options: ['Outdoorsy', 'Food-focused', 'Creative'],
        },
      },
      { do: 'pause', ms: 1400 },
      {
        do: 'widget',
        id: 'a1',
        widget: {
          kind: 'clarify',
          question: 'What’s the vibe?',
          options: ['Outdoorsy', 'Food-focused', 'Creative'],
          picked: 1,
        },
      },
      { do: 'agent', id: 'a2' },
      {
        do: 'tools',
        id: 'a2',
        list: [
          { name: 'venues.search', summary: '9 venues nearby', duration: '1.2s' },
          { name: 'calendar.check', summary: 'Friday the 14th is free', duration: '0.8s' },
        ],
      },
      {
        do: 'stream',
        id: 'a2',
        text: 'A pasta-making class it is. Flour fights are optional but encouraged.',
      },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'approval',
          title: 'Book the pasta class',
          subtitle: 'Venues · venues.book',
          fields: [
            ['Where', 'Trattoria Nonna'],
            ['When', 'Fri 14th, 16:00'],
            ['Cost', '12 × $54'],
          ],
        },
      },
      { do: 'say', text: 'Approved! And Leo is gluten-free, don’t forget.' },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'approval',
          title: 'Book the pasta class',
          subtitle: 'Venues · venues.book',
          fields: [
            ['Where', 'Trattoria Nonna'],
            ['When', 'Fri 14th, 16:00'],
            ['Cost', '12 × $54'],
          ],
          approved: true,
        },
      },
      { do: 'agent', id: 'a3' },
      { do: 'stream', id: 'a3', text: 'Booked. I asked Nonna for one gluten-free station, just for Leo.' },
      { do: 'widget', id: 'a3', widget: { kind: 'memory', text: 'Leo is gluten-free' } },
    ],
  },
  {
    name: 'Office fern',
    steps: [
      { do: 'say', text: 'The office fern looks dramatically sad. Can you help?' },
      { do: 'agent', id: 'a1' },
      {
        do: 'think',
        id: 'a1',
        title: 'Diagnosing the drama',
        done: 'Thought for 2s',
        body: 'Brown tips, droopy fronds, a radiator nearby. Classic fern behaviour.',
      },
      {
        do: 'tools',
        id: 'a1',
        list: [{ name: 'plants.identify', summary: 'Boston fern, 92% sure', duration: '1.1s' }],
      },
      {
        do: 'stream',
        id: 'a1',
        text: 'That’s a Boston fern feeling thirsty, not tragic. Move it away from the radiator and mist it twice a week.',
      },
      {
        do: 'widget',
        id: 'a1',
        widget: { kind: 'sources', domains: ['plantcare.example', 'greenthumb.example'] },
      },
      {
        do: 'widget',
        id: 'a1',
        widget: { kind: 'replies', items: ['Set reminders', 'Give it a name', 'Is it toxic to cats?'] },
      },
      { do: 'say', text: 'Set reminders. And it’s called Fernando now.' },
      { do: 'agent', id: 'a2' },
      {
        do: 'stream',
        id: 'a2',
        text: 'Welcome to the team, Fernando. I’ll nudge you on Tuesdays and Fridays.',
      },
      { do: 'widget', id: 'a2', widget: { kind: 'memory', text: 'The office fern is called Fernando' } },
      { do: 'marker', text: 'Reminder set · Tue and Fri, 9:00', icon: CheckIcon },
    ],
  },
  {
    name: 'Launch numbers',
    steps: [
      { do: 'say', text: 'How did the launch go? Keep it short, my coffee is still loading.' },
      { do: 'agent', id: 'a1' },
      {
        do: 'tools',
        id: 'a1',
        list: [
          { name: 'query_database', summary: '3 metrics, last 7 days', duration: '1.6s' },
          { name: 'compare.period', summary: 'vs the week before', duration: '0.6s' },
        ],
      },
      { do: 'stream', id: 'a1', text: 'Short version: people like it. Signups are up, churn is behaving.' },
      {
        do: 'widget',
        id: 'a1',
        widget: {
          kind: 'metrics',
          items: [
            { label: 'Weekly active users', value: '12,480', delta: '+8.2%', trend: 'up' },
            { label: 'Churn', value: '2.1%', delta: '−0.4 pt', trend: 'neutral' },
          ],
        },
      },
      { do: 'say', text: 'Nice. Turn it into three slides for the team?' },
      { do: 'agent', id: 'a2' },
      { do: 'stream', id: 'a2', text: 'On it. Three slides, no clip art, I promise.' },
      {
        do: 'widget',
        id: 'a2',
        widget: { kind: 'file', name: 'launch-recap.pptx', meta: 'Building slide 2 of 3…' },
      },
      { do: 'pause', ms: 1800 },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'file',
          name: 'launch-recap.pptx',
          meta: 'PowerPoint · 3 slides · 1.2 MB',
          ready: true,
        },
      },
    ],
  },
  {
    name: 'Farewell email',
    steps: [
      { do: 'say', text: 'Draft a farewell email for Sam. Warm, one pun maximum.' },
      { do: 'agent', id: 'a1' },
      {
        do: 'think',
        id: 'a1',
        title: 'Choosing the pun',
        done: 'Thought for 4s',
        body: 'Sam loves sailing. “Fair winds” is sweet, “ship happens” is risky. Going with sweet.',
      },
      {
        do: 'stream',
        id: 'a1',
        text: 'Subject: Fair winds, Sam! Five years, countless good calls and one legendary standup. We’ll miss you.',
      },
      { do: 'say', text: 'Two puns. It’s Sam, they’d want two.' },
      { do: 'agent', id: 'a2' },
      { do: 'stream', id: 'a2', text: 'Fair. Added “we’re all a bit adrift without you”. Ready to send?' },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'approval',
          title: 'Send the farewell email',
          subtitle: 'Mail · send_email',
          fields: [
            ['To', 'Everyone (14)'],
            ['Subject', 'Fair winds, Sam!'],
          ],
        },
      },
      { do: 'pause', ms: 1200 },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'approval',
          title: 'Send the farewell email',
          subtitle: 'Mail · send_email',
          fields: [
            ['To', 'Everyone (14)'],
            ['Subject', 'Fair winds, Sam!'],
          ],
          approved: true,
        },
      },
      { do: 'marker', text: 'Sent to 14 people', icon: CheckIcon },
    ],
  },
  {
    name: 'Launch image',
    steps: [
      { do: 'say', text: 'Make a hero image for the launch. Calm, a bit cosmic, no handshakes.' },
      { do: 'agent', id: 'a1' },
      { do: 'stream', id: 'a1', text: 'No handshakes. Noted, and respected.' },
      {
        do: 'widget',
        id: 'a1',
        widget: { kind: 'image', prompt: 'Calm cosmic gradient, soft light, no handshakes' },
      },
      { do: 'pause', ms: 2200 },
      {
        do: 'widget',
        id: 'a1',
        widget: { kind: 'image', prompt: 'Calm cosmic gradient, soft light, no handshakes', ready: true },
      },
      { do: 'say', text: 'Oh, that’s lovely.' },
      { do: 'agent', id: 'a2' },
      { do: 'stream', id: 'a2', text: 'Glad it landed. Mind telling me how I did?' },
      { do: 'widget', id: 'a2', widget: { kind: 'rating' } },
      { do: 'pause', ms: 1200 },
      { do: 'widget', id: 'a2', widget: { kind: 'rating', value: 5 } },
    ],
  },
]

// ── Playing it ─────────────────────────────────────────────────────────────────────────────

type State = { turns: Turn[]; draft: string }

const agentTurn = (turns: Turn[], id: string, change: (turn: AgentTurn) => AgentTurn): Turn[] =>
  turns.map((t) => (t.id === id && t.kind === 'agent' ? change(t) : t))

/** The state after a step, all at once (used for the finished view and as each step's end). */
function apply(state: State, step: Step, n: number): State {
  switch (step.do) {
    case 'say':
      return { draft: '', turns: [...state.turns, { id: `u${n}`, kind: 'user', text: step.text }] }
    case 'agent':
      return { ...state, turns: [...state.turns, { id: step.id, kind: 'agent', typing: true }] }
    case 'think':
      return {
        ...state,
        turns: agentTurn(state.turns, step.id, (t) => ({
          ...t,
          typing: false,
          thinking: { title: step.title, done: step.done, body: step.body, finished: true },
        })),
      }
    case 'tools':
      return {
        ...state,
        turns: agentTurn(state.turns, step.id, (t) => ({
          ...t,
          typing: false,
          tools: { list: step.list, done: step.list.length },
        })),
      }
    case 'stream':
      return {
        ...state,
        turns: agentTurn(state.turns, step.id, (t) => ({ ...t, typing: false, text: step.text })),
      }
    case 'widget':
      return {
        ...state,
        turns: agentTurn(state.turns, step.id, (t) => {
          const others = (t.widgets ?? []).filter((w) => w.kind !== step.widget.kind)
          const at = (t.widgets ?? []).findIndex((w) => w.kind === step.widget.kind)
          const widgets =
            at === -1
              ? [...others, step.widget]
              : (t.widgets ?? []).map((w, i) => (i === at ? step.widget : w))
          return { ...t, typing: false, widgets }
        }),
      }
    case 'marker':
      return {
        ...state,
        turns: [...state.turns, { id: `m${n}`, kind: 'marker', text: step.text, icon: step.icon }],
      }
    case 'pause':
      return state
  }
}

const finished = (scenario: Scenario): State =>
  scenario.steps.reduce<State>((state, step, n) => apply(state, step, n), { turns: [], draft: '' })

/** True when the OS asks for reduced motion or the Storybook Motion toolbar is off. */
function useReducedMotion() {
  const read = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('no-motion')
  const [reduced, setReduced] = useState(read)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(read())
    media.addEventListener('change', update)
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      media.removeEventListener('change', update)
      observer.disconnect()
    }
  }, [])
  return reduced
}

/** Picks the next scenario at random, never the same one twice in a row. */
const nextScenario = (previous: number) => {
  const others = SCENARIOS.map((_, i) => i).filter((i) => i !== previous)
  return others[Math.floor(Math.random() * others.length)]
}

function useScript(reduced: boolean) {
  const [state, setState] = useState<State>({ turns: [], draft: '' })
  const [scenario, setScenario] = useState(() => Math.floor(Math.random() * SCENARIOS.length))

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (cancelled ? reject(new Error('cancelled')) : resolve()), ms),
      )
    const patch = (id: string, change: (turn: AgentTurn) => AgentTurn) =>
      setState((s) => ({ ...s, turns: agentTurn(s.turns, id, change) }))

    const play = async () => {
      let current = scenario
      for (;;) {
        setScenario(current)
        setState({ turns: [], draft: '' })
        await wait(700)
        const steps = SCENARIOS[current].steps
        for (const [n, step] of steps.entries()) {
          if (step.do === 'say') {
            for (let i = 1; i <= step.text.length; i++) {
              setState((s) => ({ ...s, draft: step.text.slice(0, i) }))
              await wait(26)
            }
            await wait(420)
          } else if (step.do === 'agent') {
            setState((s) => apply(s, step, n))
            await wait(900)
            continue
          } else if (step.do === 'think') {
            patch(step.id, (t) => ({ ...t, typing: false, thinking: { title: step.title, body: step.body } }))
            await wait(1700)
          } else if (step.do === 'tools') {
            for (let done = 0; done < step.list.length; done++) {
              patch(step.id, (t) => ({ ...t, typing: false, tools: { list: step.list, done } }))
              await wait(1000)
            }
          } else if (step.do === 'stream') {
            const words = step.text.split(' ')
            for (let i = 1; i <= words.length; i++) {
              patch(step.id, (t) => ({ ...t, typing: false, text: words.slice(0, i).join(' ') }))
              await wait(60)
            }
          } else if (step.do === 'pause') {
            await wait(step.ms)
            continue
          }
          setState((s) => apply(s, step, n))
          await wait(step.do === 'say' ? 500 : 650)
        }
        await wait(4200)
        current = nextScenario(current)
      }
    }
    play().catch(() => {})
    return () => {
      cancelled = true
    }
    // The loop owns the scenario after it starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return reduced ? { ...finished(SCENARIOS[0]), scenario: 0 } : { ...state, scenario }
}

// ── Rendering ──────────────────────────────────────────────────────────────────────────────

/** A soft local gradient for the generated image (no network). */
const COSMIC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><radialGradient id="g" cx="0.3" cy="0.3" r="1"><stop offset="0" stop-color="#e9d5ff"/><stop offset="0.5" stop-color="#a5b4fc"/><stop offset="1" stop-color="#1e1b4b"/></radialGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>',
  )

function Widget({ widget }: { widget: WidgetSpec }) {
  switch (widget.kind) {
    case 'clarify':
      return (
        <ClarifyingQuestion
          questions={[
            {
              id: 'q',
              title: widget.question,
              options: widget.options.map((label, i) => ({ value: String(i), label })),
            },
          ]}
          answers={widget.picked === undefined ? {} : { q: String(widget.picked) }}
          submitted={widget.picked !== undefined}
        />
      )
    case 'approval':
      return (
        <ApprovalCard
          status={widget.approved ? 'approved' : 'pending'}
          title={widget.title}
          subtitle={widget.subtitle}
        >
          {widget.fields.map(([label, value]) => (
            <ApprovalCardField key={label} label={label}>
              {value}
            </ApprovalCardField>
          ))}
        </ApprovalCard>
      )
    case 'memory':
      return <MemoryNotice status="saved">{widget.text}</MemoryNotice>
    case 'metrics':
      return (
        <WidgetMetricGroup>
          {widget.items.map((m) => (
            <WidgetMetricCard
              key={m.label}
              size="compact"
              label={m.label}
              value={m.value}
              delta={m.delta}
              trend={m.trend}
              className="min-w-0"
            />
          ))}
        </WidgetMetricGroup>
      )
    case 'file':
      return (
        <FileOutputCard
          kind="presentation"
          status={widget.ready ? 'ready' : 'generating'}
          name={widget.name}
          meta={widget.meta}
          progress={widget.ready ? undefined : 60}
        />
      )
    case 'image':
      return (
        <ImageGenerationCard
          status={widget.ready ? 'ready' : 'generating'}
          prompt={widget.prompt}
          statusText="Generating · 6s"
        >
          <img src={COSMIC} alt="" />
        </ImageGenerationCard>
      )
    case 'replies':
      return (
        <QuickReplyGroup label="Suggested replies">
          {widget.items.map((item) => (
            <QuickReply key={item}>{item}</QuickReply>
          ))}
        </QuickReplyGroup>
      )
    case 'rating':
      return <Rating kind="stars" question="How did I do?" value={widget.value} />
    case 'sources':
      return (
        <div className="flex flex-wrap gap-1">
          {widget.domains.map((domain, i) => (
            <CitationChip key={domain} index={i + 1} domain={domain} confidence="high" />
          ))}
        </div>
      )
  }
}

function AgentAvatar() {
  return (
    <MessageAvatar>
      <Avatar size="xs">
        <AvatarFallback tone="agent">
          <Icon icon={BotIcon} />
        </AvatarFallback>
      </Avatar>
    </MessageAvatar>
  )
}

function Agent({ turn }: { turn: AgentTurn }): ReactNode {
  const { tools, thinking } = turn
  const toolsDone = tools && tools.done >= tools.list.length
  return (
    <Message>
      <AgentAvatar />
      <MessageContent className="min-w-0 gap-3">
        {turn.typing && <StreamingPlaceholder variant="dots" label="Typing" />}
        {thinking && (
          <ThinkingPanel status={thinking.finished ? 'done' : 'running'}>
            <ThinkingPanelTrigger
              title={thinking.title}
              duration={thinking.finished ? thinking.done : 'Thinking…'}
            />
            <ThinkingPanelContent>
              <p>{thinking.body}</p>
            </ThinkingPanelContent>
          </ThinkingPanel>
        )}
        {tools && (
          <ToolCallAccordion status={toolsDone ? 'done' : 'running'} open={!toolsDone}>
            <ToolCallAccordionTrigger
              title={
                toolsDone
                  ? `Used ${tools.list.length} ${tools.list.length === 1 ? 'tool' : 'tools'}`
                  : `Using tools · ${tools.done + 1} of ${tools.list.length}`
              }
              summary={tools.list.map((t) => t.name).join(', ')}
            />
            <ToolCallAccordionContent>
              {tools.list.slice(0, tools.done + 1).map((tool, i) => (
                <ToolCallItem key={tool.name} status={i < tools.done ? 'done' : 'running'}>
                  <ToolCallItemTrigger
                    name={tool.name}
                    summary={i < tools.done ? tool.summary : 'Working…'}
                    duration={i < tools.done ? tool.duration : undefined}
                  />
                </ToolCallItem>
              ))}
            </ToolCallAccordionContent>
          </ToolCallAccordion>
        )}
        {turn.text && (
          <MessageBubble variant="ghost">
            <MessageBubbleContent>{turn.text}</MessageBubbleContent>
          </MessageBubble>
        )}
        {turn.widgets?.map((widget) => (
          <Widget key={widget.kind} widget={widget} />
        ))}
      </MessageContent>
    </Message>
  )
}

/** Keeps the latest turn in view as the script adds and streams messages. */
function FollowEnd({ turns }: { turns: Turn[] }) {
  const { scrollToEnd } = useMessageScroller()
  useEffect(() => {
    scrollToEnd({ behavior: 'smooth' })
  }, [turns, scrollToEnd])
  return null
}

export function ChatDemo() {
  const reduced = useReducedMotion()
  const { turns, draft, scenario } = useScript(reduced)

  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className="sr-only">
        An example assistant built with Anvil UI, playing short conversations in a loop: planning a team
        offsite, rescuing an office fern, summarising launch numbers, drafting a farewell email and making a
        launch image. It shows reasoning, tool calls, questions, approvals, memory and generated files.
      </figcaption>
      <div
        inert
        aria-hidden
        className="flex h-140 flex-col overflow-hidden rounded-2xl bg-background shadow-elevation-modal inset-ring inset-ring-border"
      >
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Avatar size="sm">
            <AvatarFallback tone="agent">
              <Icon icon={BotIcon} />
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="type-text-sm-semibold text-foreground">Assistant</span>
            <span className="truncate type-text-xs-normal text-muted-foreground">
              {SCENARIOS[scenario].name}
            </span>
          </div>
          <Badge variant="subtle" tone="success" shape="pill" size="sm" indicator className="ms-auto">
            Online
          </Badge>
        </header>
        <MessageScrollerProvider defaultScrollPosition="end">
          <FollowEnd turns={turns} />
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport className="px-4">
              <MessageScrollerContent className="gap-0 pt-4 pb-8">
                <MessageGroup className="gap-4">
                  {turns.map((turn) => (
                    <MessageScrollerItem key={turn.id} messageId={turn.id}>
                      {turn.kind === 'marker' && (
                        <Marker className="justify-center">
                          {turn.icon && (
                            <MarkerIcon>
                              <Icon icon={turn.icon} />
                            </MarkerIcon>
                          )}
                          <MarkerContent>{turn.text}</MarkerContent>
                        </Marker>
                      )}
                      {turn.kind === 'user' && (
                        <Message align="end">
                          <MessageContent>
                            <MessageBubble variant="muted">
                              <MessageBubbleContent>{turn.text}</MessageBubbleContent>
                            </MessageBubble>
                          </MessageContent>
                        </Message>
                      )}
                      {turn.kind === 'agent' && <Agent turn={turn} />}
                    </MessageScrollerItem>
                  ))}
                </MessageGroup>
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
        <div className="border-t p-3">
          <PromptInput size="compact" value={draft} placeholder="Ask Assistant anything…" />
        </div>
      </div>
    </figure>
  )
}
