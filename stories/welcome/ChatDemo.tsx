import { useEffect, useState, type ReactNode } from 'react'

import { ApprovalCard, ApprovalCardField } from '@/components/agent/approval-card'
import { CitationChip } from '@/components/agent/citation-chip'
import { ClarifyingQuestion } from '@/components/agent/clarifying-question'
import { FileOutputCard } from '@/components/agent/file-output-card'
import { ImageGenerationCard } from '@/components/agent/image-generation-card'
import { MemoryNotice } from '@/components/agent/memory-notice'
import { ChangeItem, ChangeReview } from '@/components/agent/change-review'
import { PromptInput } from '@/components/agent/prompt-input'
import { QuestionSet, type Answers } from '@/components/agent/question-set'
import { QuickReply, QuickReplyGroup } from '@/components/agent/quick-reply'
import { Rating } from '@/components/agent/rating'
import { RunLimits } from '@/components/agent/run-limits'
import { StreamingPlaceholder } from '@/components/agent/streaming-placeholder'
import { TaskBrief } from '@/components/agent/task-brief'
import { TaskPlan, TaskPlanStep } from '@/components/agent/task-plan'
import { ThinkingPanel, ThinkingPanelContent, ThinkingPanelTrigger } from '@/components/agent/thinking-panel'
import {
  ToolCallAccordion,
  ToolCallAccordionContent,
  ToolCallAccordionTrigger,
} from '@/components/agent/tool-call-accordion'
import { ToolCallItem, ToolCallItemTrigger } from '@/components/agent/tool-call-item'
import { WidgetMetricCard, WidgetMetricGroup } from '@/components/agent/widget-metric-card'
import { CheckRow } from '@/components/anvil/check-row'
import { IconTile } from '@/components/anvil/icon-tile'
import { Price } from '@/components/anvil/price'
import { ProgressStep, ProgressSteps } from '@/components/anvil/progress-steps'
import { RatingDisplay } from '@/components/anvil/rating-display'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  BackpackIcon,
  BotIcon,
  CheckIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  Icon,
  WrenchIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
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
// the real Agent Builder components and played in a loop. Each loop picks another of eight
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
  | { kind: 'questions'; answers?: Answers }
  | { kind: 'brief'; approved?: boolean }
  | { kind: 'plan'; approved?: boolean }
  | { kind: 'limits' }
  | { kind: 'changes'; accepted?: boolean }
  | { kind: 'offer' }
  | { kind: 'tracker'; step: number }

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

// ── Eight scenarios ─────────────────────────────────────────────────────────────────────────

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
  {
    name: 'Research brief',
    steps: [
      { do: 'say', text: 'Research how competitors price team plans for sync tools.' },
      { do: 'agent', id: 'a1' },
      {
        do: 'think',
        id: 'a1',
        title: 'Scoping the research',
        done: 'Thought for 3s',
        body: 'Pricing is only half the story. A few answers now will save a lot of reading later.',
      },
      { do: 'stream', id: 'a1', text: 'Three quick questions first, so I read the right things.' },
      { do: 'widget', id: 'a1', widget: { kind: 'questions' } },
      { do: 'pause', ms: 1600 },
      {
        do: 'widget',
        id: 'a1',
        widget: {
          kind: 'questions',
          answers: { regions: ['EU'], plans: ['Yes'], sources: ['Pricing pages'] },
        },
      },
      { do: 'agent', id: 'a2' },
      {
        do: 'stream',
        id: 'a2',
        text: 'Thanks. Here’s the brief I’ll work from, nothing runs until you approve it.',
      },
      { do: 'widget', id: 'a2', widget: { kind: 'brief' } },
      { do: 'say', text: 'Looks right. Go ahead.' },
      { do: 'widget', id: 'a2', widget: { kind: 'brief', approved: true } },
      { do: 'agent', id: 'a3' },
      { do: 'stream', id: 'a3', text: 'Here’s how I’ll do it. Edit any step before I start.' },
      { do: 'widget', id: 'a3', widget: { kind: 'plan' } },
      { do: 'pause', ms: 1600 },
      { do: 'widget', id: 'a3', widget: { kind: 'plan', approved: true } },
      { do: 'marker', text: 'Research started · about 15 min', icon: ClockIcon },
    ],
  },
  {
    name: 'Research check-in',
    steps: [
      { do: 'say', text: 'How’s the research going? Don’t let it eat the budget.' },
      { do: 'agent', id: 'a1' },
      {
        do: 'tools',
        id: 'a1',
        list: [
          { name: 'sources.read', summary: '43 of 60 sources', duration: '0.9s' },
          { name: 'usage.check', summary: '$9.00 of $10.00', duration: '0.4s' },
        ],
      },
      { do: 'stream', id: 'a1', text: 'Past halfway, and the budget is nearly gone. Here’s where I am.' },
      { do: 'widget', id: 'a1', widget: { kind: 'limits' } },
      { do: 'agent', id: 'a2' },
      { do: 'stream', id: 'a2', text: 'Also, I found something that changes the plan. Your call.' },
      { do: 'widget', id: 'a2', widget: { kind: 'changes' } },
      { do: 'say', text: 'Accept it. And add a few dollars to the budget.' },
      { do: 'widget', id: 'a2', widget: { kind: 'changes', accepted: true } },
      { do: 'agent', id: 'a3' },
      { do: 'stream', id: 'a3', text: 'Done. Cost cap is now $15.00 and step 3 starts next.' },
      { do: 'marker', text: 'Budget extended · $15.00', icon: CheckIcon },
    ],
  },
  {
    name: 'Daypack hunt',
    steps: [
      { do: 'say', text: 'Find me a waterproof daypack under $150. I get rained on a lot.' },
      { do: 'agent', id: 'a1' },
      {
        do: 'tools',
        id: 'a1',
        list: [
          { name: 'catalog.search', summary: '12 packs under $150', duration: '1.3s' },
          { name: 'reviews.summarise', summary: '1,204 reviews read', duration: '1.0s' },
        ],
      },
      {
        do: 'stream',
        id: 'a1',
        text: 'One stands out: fully taped seams, a rain cover and a decent sale on.',
      },
      { do: 'widget', id: 'a1', widget: { kind: 'offer' } },
      { do: 'say', text: 'Order it. I need it by Friday.' },
      { do: 'agent', id: 'a2' },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'approval',
          title: 'Place the order',
          subtitle: 'Shop · place_order',
          fields: [
            ['Item', 'Trailhead 28L daypack'],
            ['Total', '$119.00'],
            ['Arrives', 'Thu 16th'],
          ],
        },
      },
      { do: 'pause', ms: 1400 },
      {
        do: 'widget',
        id: 'a2',
        widget: {
          kind: 'approval',
          title: 'Place the order',
          subtitle: 'Shop · place_order',
          fields: [
            ['Item', 'Trailhead 28L daypack'],
            ['Total', '$119.00'],
            ['Arrives', 'Thu 16th'],
          ],
          approved: true,
        },
      },
      { do: 'agent', id: 'a3' },
      { do: 'stream', id: 'a3', text: 'Ordered. It lands a day before your deadline. Here’s the tracker.' },
      { do: 'widget', id: 'a3', widget: { kind: 'tracker', step: 1 } },
      { do: 'pause', ms: 1800 },
      { do: 'widget', id: 'a3', widget: { kind: 'tracker', step: 2 } },
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

/** `?scenario=N` (0-based) pins one scenario: it plays on repeat, and the reduced-motion view shows it. */
const pinned = (): number | null => {
  const n = Number(new URLSearchParams(window.location.search).get('scenario'))
  return Number.isInteger(n) &&
    n >= 0 &&
    n < SCENARIOS.length &&
    new URLSearchParams(window.location.search).has('scenario')
    ? n
    : null
}

/** Picks the next scenario at random, never the same one twice in a row. */
const nextScenario = (previous: number) => {
  const others = SCENARIOS.map((_, i) => i).filter((i) => i !== previous)
  return others[Math.floor(Math.random() * others.length)]
}

function useScript(reduced: boolean) {
  const [state, setState] = useState<State>({ turns: [], draft: '' })
  const [scenario, setScenario] = useState(() => pinned() ?? Math.floor(Math.random() * SCENARIOS.length))

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
        current = pinned() ?? nextScenario(current)
      }
    }
    play().catch(() => {})
    return () => {
      cancelled = true
    }
    // The loop owns the scenario after it starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const first = pinned() ?? 0
  return reduced ? { ...finished(SCENARIOS[first]), scenario: first } : { ...state, scenario }
}

// ── Rendering ──────────────────────────────────────────────────────────────────────────────

/** A soft local gradient for the generated image (no network). */
const COSMIC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><radialGradient id="g" cx="0.3" cy="0.3" r="1"><stop offset="0" stop-color="#e9d5ff"/><stop offset="0.5" stop-color="#a5b4fc"/><stop offset="1" stop-color="#1e1b4b"/></radialGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>',
  )

const RESEARCH_QUESTIONS = [
  { id: 'regions', question: 'Which regions matter most?', options: ['US', 'EU', 'UK', 'All of them'] },
  { id: 'plans', question: 'Include free and trial plans?', options: ['Yes', 'No'] },
  {
    id: 'sources',
    question: 'Preferred source types?',
    options: ['Pricing pages', 'Analyst reports', 'News'],
    multiple: true,
  },
]

const BRIEF_FIELDS = [
  { label: 'Objective', value: 'Compare team-plan pricing and find where Northwind Sync can win' },
  { label: 'Audience', value: 'Launch team' },
  { label: 'Time range', value: 'Last 12 months' },
  { label: 'Geography', value: 'EU' },
  { label: 'Depth', value: 'Standard · 40–60 sources' },
  { label: 'Out of scope', value: 'Enterprise contracts' },
]

const PLAN_STEPS = [
  { title: 'Map the competitors', description: 'List the tools teams compare.', tags: ['Pricing pages'] },
  {
    title: 'Collect team-plan prices',
    description: 'Per-seat prices and annual discounts.',
    tags: ['Pricing pages'],
  },
  {
    title: 'Compare feature limits',
    description: 'Storage, history and admin controls.',
    tags: ['Pricing pages'],
  },
  { title: 'Recommend positioning', description: 'Where Northwind Sync can win.', tags: ['Analyst reports'] },
]

const LIMITS = [
  {
    id: 'time',
    icon: ClockIcon,
    label: 'Time',
    value: 15,
    min: 0,
    max: 15,
    used: 11.7,
    display: '15 min',
    usedDisplay: '11m 40s / 15 min',
  },
  {
    id: 'sources',
    icon: FileTextIcon,
    label: 'Sources',
    value: 60,
    min: 0,
    max: 60,
    used: 43,
    display: '60 max',
    usedDisplay: '43 / 60',
  },
  {
    id: 'calls',
    icon: WrenchIcon,
    label: 'Tool calls',
    value: 150,
    min: 0,
    max: 150,
    used: 92,
    display: '150 max',
    usedDisplay: '92 / 150',
  },
  {
    id: 'cost',
    icon: DollarSignIcon,
    label: 'Cost cap',
    value: 10,
    min: 0,
    max: 10,
    used: 9,
    display: '$10.00',
    usedDisplay: '$9.00 / $10.00',
    near: true,
    hint: 'You are close to the cost cap.',
  },
]

const TRACKER = [
  { label: 'Ordered', meta: 'Mon 13' },
  { label: 'Packed', meta: 'Tue 14' },
  { label: 'Shipped', meta: 'Wed 15' },
  { label: 'Delivered', meta: 'Thu 16' },
]

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
    case 'questions':
      return (
        <QuestionSet
          title="Before I start"
          subtitle="3 quick questions to sharpen the brief"
          questions={RESEARCH_QUESTIONS}
          value={widget.answers ?? {}}
          answeredSubmitLabel="Update brief"
        />
      )
    case 'brief':
      return (
        <TaskBrief
          status={widget.approved ? 'approved' : 'review'}
          title="Research brief"
          subtitle={widget.approved ? 'Approved · running' : 'Review before I start · ~15 min'}
          questionLabel="Research question"
          question="How do team plans for sync tools compare on price, and where can Northwind Sync win?"
          fields={BRIEF_FIELDS}
          approvedNote="Approved · 14:02 · you can still edit while it runs"
        />
      )
    case 'plan':
      return (
        <TaskPlan
          status={widget.approved ? 'approved' : 'review'}
          title="Research plan"
          subtitle="4 steps · ~15 min · 40–60 sources"
          note="Estimated 15 min · up to 60 sources"
          approvedNote="Approved · research running"
        >
          {PLAN_STEPS.map((step, i) => (
            <TaskPlanStep key={step.title} index={i + 1} {...step} />
          ))}
        </TaskPlan>
      )
    case 'limits':
      return (
        <RunLimits
          status="near-limit"
          title="Budget & limits"
          subtitle="Running · 11m 40s"
          badge="90% of cost cap"
          limits={LIMITS}
          warning="At this rate the run needs about $1.40 more to finish all steps."
          extendLabel="Extend by $5"
        />
      )
    case 'changes':
      return (
        <ChangeReview
          status={widget.accepted ? 'accepted' : 'review'}
          title="Plan update"
          subtitle={
            widget.accepted ? 'Plan updated · research continuing' : 'I found something that changes the plan'
          }
          reason="Two sources say annual plans drop the per-seat price by about 20%, so I suggest adding a step for it."
          impact={[
            { label: 'Time', value: '+4 min' },
            { label: 'Sources', value: '+8' },
            { label: 'Cost', value: '+$0.60' },
          ]}
          acceptedNote="Accepted · 14:07 · step 3 starts next"
        >
          <ChangeItem title="Map the competitors" detail="Done · 9 sources" />
          <ChangeItem
            change="added"
            title="Compare annual discounts"
            detail="Annual billing as a price lever."
          />
          <ChangeItem
            change="removed"
            title="Scan social media sentiment"
            detail="Low value; saves about 3 minutes."
          />
        </ChangeReview>
      )
    case 'offer':
      return (
        <Item variant="outline" size="sm" className="flex-nowrap items-start">
          <ItemMedia>
            <IconTile icon={BackpackIcon} tone="info" size="default" />
          </ItemMedia>
          <ItemContent className="gap-2">
            <ItemTitle>Trailhead 28L daypack</ItemTitle>
            <ItemDescription className="line-clamp-none">
              <RatingDisplay display="compact" value={4.6} label="4.6 · 1,204 reviews" />
            </ItemDescription>
            <div className="flex flex-col gap-1">
              <CheckRow status="included">Waterproof, taped seams</CheckRow>
              <CheckRow status="included">Rain cover</CheckRow>
              <CheckRow status="fee">Gift wrap · $4</CheckRow>
              <CheckRow status="excluded">Lifetime warranty</CheckRow>
            </div>
            <Price size="default" emphasis="sale" current="$119" was="$148" discount="−20%" />
          </ItemContent>
        </Item>
      )
    case 'tracker':
      return (
        <div className="rounded-xl border bg-card p-4">
          <ProgressSteps aria-label="Delivery progress">
            {TRACKER.map((step, i) => (
              <ProgressStep
                key={step.label}
                label={step.label}
                meta={step.meta}
                status={i < widget.step ? 'done' : i === widget.step ? 'current' : 'upcoming'}
              />
            ))}
          </ProgressSteps>
        </div>
      )
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
        offsite, rescuing an office fern, summarising launch numbers, drafting a farewell email, making a
        launch image, scoping and planning a research task, checking its budget mid-run, and ordering a
        daypack from a shop. It shows reasoning, tool calls, questions, approvals, memory, generated files,
        task plans, limits and order tracking.
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
