import { useEffect, useState } from 'react'

import {
  ThinkingPanel,
  ThinkingPanelContent,
  ThinkingPanelDuration,
  ThinkingPanelTitle,
  ThinkingPanelTrigger,
} from '@/components/agent/thinking-panel'
import {
  ToolCallAccordion,
  ToolCallAccordionContent,
  ToolCallAccordionSummary,
  ToolCallAccordionTitle,
  ToolCallAccordionTrigger,
} from '@/components/agent/tool-call-accordion'
import {
  ToolCallItem,
  ToolCallItemDuration,
  ToolCallItemName,
  ToolCallItemSummary,
  ToolCallItemTrigger,
} from '@/components/agent/tool-call-item'
import { TypingIndicator } from '@/components/agent/typing-indicator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, BotIcon, Icon, TicketIcon } from '@/components/ui/icon'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Message, MessageAvatar, MessageContent, MessageGroup } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller'

// The Welcome hero's chat window: a scripted conversation, drawn with the real Agent Builder
// components, playing in a loop. Under reduced motion (or the Motion toolbar off) it shows the
// finished conversation instead. The window is decorative: inert and hidden from assistive tech,
// with a text description next to it.

type Tool = { name: string; summary: string; duration: string }
type Turn =
  | { id: string; kind: 'marker'; text: string; icon?: boolean }
  | { id: string; kind: 'user'; text: string }
  | {
      id: string
      kind: 'agent'
      typing?: boolean
      thinking?: 'active' | 'done'
      tools?: { list: Tool[]; done: number }
      text?: string
    }

const Q1 = 'Find me a flight to New York next Tuesday, under $500.'
const A1 =
  'I found 3 flights under $500. The best fit is Virgin Atlantic at $412, leaving at 9:40 with one short stop.'
const Q2 = 'Book the 9:40 one with an aisle seat.'
const A2 = 'Done. Aisle seat 23C is on hold. Want me to check out with your saved card?'
const TOOLS_1: Tool[] = [
  { name: 'flights.search', summary: '42 flights found', duration: '1.4s' },
  { name: 'fares.compare', summary: '5 airlines compared', duration: '1.7s' },
]
const TOOLS_2: Tool[] = [{ name: 'seats.hold', summary: 'Seat 23C held', duration: '0.9s' }]

const START: Turn[] = [{ id: 'today', kind: 'marker', text: 'Today' }]
const FINAL: Turn[] = [
  ...START,
  { id: 'q1', kind: 'user', text: Q1 },
  { id: 'a1', kind: 'agent', thinking: 'done', tools: { list: TOOLS_1, done: 2 }, text: A1 },
  { id: 'q2', kind: 'user', text: Q2 },
  { id: 'a2', kind: 'agent', tools: { list: TOOLS_2, done: 1 }, text: A2 },
  { id: 'held', kind: 'marker', text: 'Seat 23C held for 15 minutes', icon: true },
]

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

/** Plays the script; returns the turns and the composer text. */
function useScript(reduced: boolean) {
  const [turns, setTurns] = useState<Turn[]>(START)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (cancelled ? reject(new Error('cancelled')) : resolve()), ms),
      )
    const push = (turn: Turn) => setTurns((t) => [...t, turn])
    const patch = (id: string, change: Partial<Extract<Turn, { kind: 'agent' }>>) =>
      setTurns((t) =>
        t.map((turn) => (turn.id === id && turn.kind === 'agent' ? { ...turn, ...change } : turn)),
      )

    const type = async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        setDraft(text.slice(0, i))
        await wait(28)
      }
      await wait(450)
      setDraft('')
    }
    const stream = async (id: string, text: string) => {
      const words = text.split(' ')
      for (let i = 1; i <= words.length; i++) {
        patch(id, { text: words.slice(0, i).join(' ') })
        await wait(70)
      }
    }
    const runTools = async (id: string, list: Tool[]) => {
      for (let done = 0; done <= list.length; done++) {
        patch(id, { tools: { list, done } })
        if (done < list.length) await wait(1100)
      }
    }

    const play = async () => {
      for (;;) {
        await wait(0)
        setTurns(START)
        setDraft('')
        await wait(900)

        await type(Q1)
        push({ id: 'q1', kind: 'user', text: Q1 })
        await wait(500)
        push({ id: 'a1', kind: 'agent', typing: true })
        await wait(1000)
        patch('a1', { typing: false, thinking: 'active' })
        await wait(1800)
        patch('a1', { thinking: 'done' })
        await wait(300)
        await runTools('a1', TOOLS_1)
        await wait(300)
        await stream('a1', A1)
        await wait(1800)

        await type(Q2)
        push({ id: 'q2', kind: 'user', text: Q2 })
        await wait(500)
        push({ id: 'a2', kind: 'agent', typing: true })
        await wait(900)
        patch('a2', { typing: false })
        await runTools('a2', TOOLS_2)
        await wait(300)
        await stream('a2', A2)
        await wait(600)
        push({ id: 'held', kind: 'marker', text: 'Seat 23C held for 15 minutes', icon: true })
        await wait(4500)
      }
    }
    play().catch(() => {})
    return () => {
      cancelled = true
    }
  }, [reduced])

  return reduced ? { turns: FINAL, draft: '' } : { turns, draft }
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

function AgentTurn({ turn }: { turn: Extract<Turn, { kind: 'agent' }> }) {
  const { tools } = turn
  const toolsDone = tools && tools.done >= tools.list.length
  return (
    <Message>
      <AgentAvatar />
      <MessageContent>
        {turn.typing && <TypingIndicator />}
        {turn.thinking && (
          <ThinkingPanel status={turn.thinking === 'active' ? 'active' : 'completed'}>
            <ThinkingPanelTrigger>
              <ThinkingPanelTitle>
                {turn.thinking === 'active' ? 'Planning the search' : 'Planned the search'}
              </ThinkingPanelTitle>
              <ThinkingPanelDuration>
                {turn.thinking === 'active' ? 'Thinking…' : 'Thought for 1.8s'}
              </ThinkingPanelDuration>
            </ThinkingPanelTrigger>
            <ThinkingPanelContent>
              <p>Search direct and one-stop flights, then compare fares across airlines.</p>
            </ThinkingPanelContent>
          </ThinkingPanel>
        )}
        {tools && (
          <ToolCallAccordion status={toolsDone ? 'done' : 'running'} open={!toolsDone}>
            <ToolCallAccordionTrigger>
              <ToolCallAccordionTitle>
                {toolsDone
                  ? `Used ${tools.list.length} ${tools.list.length === 1 ? 'tool' : 'tools'}`
                  : `Using tools · ${tools.done + 1} of ${tools.list.length}`}
              </ToolCallAccordionTitle>
              <ToolCallAccordionSummary>{tools.list.map((t) => t.name).join(', ')}</ToolCallAccordionSummary>
            </ToolCallAccordionTrigger>
            <ToolCallAccordionContent>
              {tools.list.slice(0, tools.done + 1).map((tool, i) => (
                <ToolCallItem key={tool.name} status={i < tools.done ? 'done' : 'running'}>
                  <ToolCallItemTrigger>
                    <ToolCallItemName>{tool.name}</ToolCallItemName>
                    <ToolCallItemSummary>{i < tools.done ? tool.summary : 'Working…'}</ToolCallItemSummary>
                    {i < tools.done && <ToolCallItemDuration>{tool.duration}</ToolCallItemDuration>}
                  </ToolCallItemTrigger>
                </ToolCallItem>
              ))}
            </ToolCallAccordionContent>
          </ToolCallAccordion>
        )}
        {turn.text && (
          <Bubble variant="ghost">
            <BubbleContent>{turn.text}</BubbleContent>
          </Bubble>
        )}
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
  const { turns, draft } = useScript(reduced)

  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className="sr-only">
        An example conversation built with Anvil UI: a travel assistant searches flights to New York, shows
        its reasoning and tool calls, recommends a $412 flight, then holds aisle seat 23C.
      </figcaption>
      <div
        inert
        aria-hidden
        className="flex h-128 flex-col overflow-hidden rounded-xl bg-background shadow-elevation-raised inset-ring inset-ring-border"
      >
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Avatar size="sm">
            <AvatarFallback tone="agent">
              <Icon icon={BotIcon} />
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="type-text-sm-semibold text-foreground">Travel assistant</span>
            <span className="type-text-xs-normal text-muted-foreground">Powered by Anvil UI</span>
          </div>
          <Badge variant="subtle" intent="neutral" size="sm" className="ms-auto">
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
                        <Marker
                          variant={turn.icon ? 'default' : 'separator'}
                          className={turn.icon ? 'justify-center' : undefined}
                        >
                          {turn.icon && (
                            <MarkerIcon>
                              <Icon icon={TicketIcon} />
                            </MarkerIcon>
                          )}
                          <MarkerContent>{turn.text}</MarkerContent>
                        </Marker>
                      )}
                      {turn.kind === 'user' && (
                        <Message align="end">
                          <MessageContent>
                            <Bubble variant="muted">
                              <BubbleContent>{turn.text}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      )}
                      {turn.kind === 'agent' && <AgentTurn turn={turn} />}
                    </MessageScrollerItem>
                  ))}
                </MessageGroup>
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
        <div className="flex items-center gap-2 border-t px-4 py-3">
          <span
            className={
              draft
                ? 'min-w-0 flex-1 truncate type-text-sm-normal text-foreground'
                : 'min-w-0 flex-1 truncate type-text-sm-normal text-muted-foreground'
            }
          >
            {draft || 'Ask a follow-up…'}
          </span>
          <Button size="icon-sm" shape="circle" disabled={!draft}>
            <Icon icon={ArrowUpIcon} />
          </Button>
        </div>
      </div>
    </figure>
  )
}
