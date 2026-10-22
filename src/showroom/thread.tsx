import { useEffect } from 'react'

import { StreamingPlaceholder } from '@/components/agent/streaming-placeholder'
import { ThinkingPanel, ThinkingPanelContent, ThinkingPanelTrigger } from '@/components/agent/thinking-panel'
import {
  ToolCallAccordion,
  ToolCallAccordionContent,
  ToolCallAccordionTrigger,
} from '@/components/agent/tool-call-accordion'
import { ToolCallItem, ToolCallItemTrigger } from '@/components/agent/tool-call-item'
import { Icon } from '@/components/ui/icon'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Message, MessageContent, MessageGroup } from '@/components/ui/message'
import { MessageBubble, MessageBubbleContent } from '@/components/ui/message-bubble'
import { MessageScrollerItem, useMessageScroller } from '@/components/ui/message-scroller'

import type { AgentTurn, Turn } from './engine'
import { Widget } from './widgets'

type Emit = (widgetId: string, event: string, payload?: unknown) => void

function Agent({ turn, emit }: { turn: AgentTurn; emit: Emit }) {
  const { tools, thinking } = turn
  const toolsDone = tools && tools.done >= tools.list.length
  return (
    <Message>
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
        {turn.widgets.map((entry) => (
          <Widget key={entry.id} entry={entry} emit={(event, payload) => emit(entry.id, event, payload)} />
        ))}
      </MessageContent>
    </Message>
  )
}

/** The welcome screen starts at its top (the scroller opens at the end). */
export function ScrollToStart() {
  const { scrollToStart } = useMessageScroller()
  useEffect(() => {
    scrollToStart({ behavior: 'instant' })
  }, [scrollToStart])
  return null
}

/** Keeps the latest turn in view as the script adds and streams messages. */
function FollowEnd({ turns }: { turns: Turn[] }) {
  const { scrollToEnd } = useMessageScroller()
  useEffect(() => {
    scrollToEnd({ behavior: 'smooth' })
  }, [turns, scrollToEnd])
  return null
}

export function Thread({ turns, emit }: { turns: Turn[]; emit: Emit }) {
  return (
    <>
      <FollowEnd turns={turns} />
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
            {turn.kind === 'agent' && <Agent turn={turn} emit={emit} />}
          </MessageScrollerItem>
        ))}
      </MessageGroup>
    </>
  )
}
