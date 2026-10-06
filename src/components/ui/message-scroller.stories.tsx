import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent, waitFor } from 'storybook/test'

import { MessageBubble, MessageBubbleContent } from './message-bubble'
import { Button } from './button'
import { Message, MessageContent } from './message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './message-scroller'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10738-11'

function Turn({ index }: { index: number }) {
  const user = index % 2 === 0
  return (
    <Message align={user ? 'end' : 'start'}>
      <MessageContent>
        <MessageBubble variant={user ? 'muted' : 'ghost'}>
          <MessageBubbleContent>
            {user ? 'Subtitle' : 'Subtitle. Subtitle. Subtitle. Subtitle. Subtitle. Subtitle.'}
          </MessageBubbleContent>
        </MessageBubble>
      </MessageContent>
    </Message>
  )
}

type DemoProps = Omit<React.ComponentProps<typeof MessageScrollerProvider>, 'children'> & {
  count?: number
}

function Demo({ count = 12, ...props }: DemoProps) {
  return (
    <MessageScrollerProvider {...props}>
      <MessageScroller className="h-100 w-full max-w-(--shell-thread-max) rounded-lg border">
        <MessageScrollerViewport aria-label="Label" className="px-4">
          <MessageScrollerContent className="gap-6 py-4">
            {Array.from({ length: count }, (_, i) => (
              <MessageScrollerItem key={i} messageId={String(i)} scrollAnchor={i % 2 === 0}>
                <Turn index={i} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

const meta = preview.meta({
  title: 'Organisms/Message Scroller',
  tags: ['organism', 'messages'],
  component: Demo,
  parameters: {
    shadcn: 'message-scroller',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // Figma: no scroller component; the thread is drawn on Agent Builder › Surfaces.
    figmaProps: [],
    docs: {
      description: {
        component:
          'The scrolling thread (shadcn/ui Message Scroller on `@shadcn/react`): it opens at the latest message, follows new ones while you are at the end, keeps your place when you scroll up, and shows a jump button. `MessageScrollerProvider` (`autoScroll`, `defaultScrollPosition`, …) › `MessageScroller` › `MessageScrollerViewport` (named region, keyboard scrollable) › `MessageScrollerContent` › `MessageScrollerItem`s (`messageId`, `scrollAnchor` on the user turns), plus `MessageScrollerButton` (`direction` end · start). `useMessageScroller()` scrolls from code. Figma has no scroller part: the thread width is `--shell-thread-max` (Agent Builder › Surfaces).',
      },
    },
  },
  args: { count: 12, autoScroll: true, defaultScrollPosition: 'end' },
  argTypes: {
    count: { control: { type: 'range', min: 1, max: 40 } },
    autoScroll: { control: 'boolean' },
    scrollEdgeThreshold: { control: 'number' },
    scrollPreviousItemPeek: { control: 'number' },
    scrollMargin: { control: 'number' },
    defaultScrollPosition: { control: 'inline-radio', options: ['end', 'start', 'last-anchor'] },
  },
})

/** Opens at the latest message. Scroll up to show the jump button. */
export const Default = meta.story()

Default.test('opens at the end; the button jumps back after scrolling up', async ({ canvas }) => {
  const viewport = canvas.getByRole('region', { name: 'Label' })
  const atEnd = () => viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 8
  await waitFor(() => expect(atEnd()).toBe(true))
  // A user scroll: the wheel marks it as the reader's intent, then the position changes.
  viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }))
  viewport.scrollTop = 0
  viewport.dispatchEvent(new Event('scroll', { bubbles: true }))
  const jump = await canvas.findByRole('button', { name: 'Scroll to end' })
  await waitFor(() => expect(jump).toHaveAttribute('data-active', 'true'))
  await userEvent.click(jump)
  await waitFor(() => expect(atEnd()).toBe(true))
})

/** `defaultScrollPosition="start"` opens at the first message; the button points up when there is more above. */
export const FromStart = meta.story({
  args: { defaultScrollPosition: 'start' },
  render: (args) => (
    <MessageScrollerProvider {...args}>
      <MessageScroller className="h-100 w-full max-w-(--shell-thread-max) rounded-lg border">
        <MessageScrollerViewport aria-label="Label" className="px-4">
          <MessageScrollerContent className="gap-6 py-4">
            {Array.from({ length: args.count ?? 12 }, (_, i) => (
              <MessageScrollerItem key={i} messageId={String(i)}>
                <Turn index={i} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="start" />
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
})

/** New messages follow the end while you are there. Send adds a turn. */
export const Live = meta.story({
  render: function Render() {
    const [count, setCount] = useState(6)
    return (
      <div className="flex w-full max-w-(--shell-thread-max) flex-col gap-3">
        <Demo count={count} />
        <Button className="self-end" onClick={() => setCount((c) => c + 1)}>
          Send
        </Button>
      </div>
    )
  },
})

Live.test('stays at the end when a message arrives', async ({ canvas }) => {
  const viewport = canvas.getByRole('region', { name: 'Label' })
  const atEnd = () => viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 8
  await waitFor(() => expect(atEnd()).toBe(true))
  await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
  await waitFor(() => expect(atEnd()).toBe(true))
})
