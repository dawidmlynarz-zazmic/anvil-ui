import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Avatar, AvatarFallback } from './avatar'
import { MessageBubble, MessageBubbleContent } from './message-bubble'
import { Button } from './button'
import { BotIcon, CircleAlertIcon, CopyIcon, Icon, RotateCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from './icon'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from './message'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

const USER_PROMPT = 'Summarize the Q3 launch plan'
const ANSWER =
  'The Q3 launch plan ships Northwind Sync on September 14. A private beta for 200 teams runs through August, then pricing goes live with the launch.'

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

/** Figma message actions: copy, retry, good and bad response (ghost icon buttons). */
function Actions() {
  return (
    <MessageFooter>
      {[
        { icon: CopyIcon, label: 'Copy' },
        { icon: RotateCcwIcon, label: 'Retry' },
        { icon: ThumbsUpIcon, label: 'Good response' },
        { icon: ThumbsDownIcon, label: 'Bad response' },
      ].map(({ icon, label }) => (
        <Button key={label} variant="ghost" intent="neutral" size="icon-sm" aria-label={label}>
          <Icon icon={icon} />
        </Button>
      ))}
    </MessageFooter>
  )
}

const meta = preview.meta({
  title: 'Molecules/Message',
  tags: ['molecule', 'messages'],
  component: Message,
  parameters: {
    shadcn: 'message',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'message row · role',
        values: 'user · assistant · system · tool',
        code: '`align` end (user) · start (assistant); system → `Marker`; the full row is Message Row',
      },
    ],
    guide: {
      use: [
        'Every turn in a conversation: the user’s prompt (`align="end"`, muted bubble) and the assistant’s answer (`align="start"`, avatar, ghost bubble).',
        'Stack turns in `MessageGroup`; consecutive bubbles from the same author share one `MessageHeader`.',
        '`MessageFooter` for what follows a turn: Message Actions on the assistant’s answer, a failed-to-send line on the user’s.',
      ],
      avoid: [
        'System notices in the thread (“Maya joined”, “Context cleared”): use Marker.',
        'Tool activity and reasoning: use Tool Log Line, Tool Call Item or Thinking Panel, not a message bubble.',
        'Scrolling and auto-follow of a long thread: wrap the group in Message Scroller.',
      ],
      content: [
        'Header: the author (“Assistant”, “Maya Chen”) in `<strong>`, then the time (“14:02”).',
        'Assistant copy is first person and brief; long answers use Content Blocks inside the bubble.',
        'A failed turn says what happened and offers Retry.',
      ],
      a11y: [
        'Author and time are text, so screen readers read who said what; the avatar is decorative.',
        'Icon-only actions in the footer need `aria-label` (“Copy”, “Retry”).',
        'A failed bubble sets `aria-invalid`; the footer repeats the failure in text, not only in color.',
      ],
    },
    docs: {
      description: {
        component:
          'One turn in a conversation (shadcn/ui Message): `Message` (`align` start for the assistant, end for the user) › `MessageAvatar`, `MessageContent` › `MessageHeader` (author in `<strong>`, then the time), a `MessageBubble`, `MessageFooter` (actions or status). `MessageGroup` stacks turns. Figma draws it as the Agent Builder › Core Kit message row; the Core Kit component composes these parts.',
      },
    },
  },
  args: { align: 'start' },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
  render: (args) => (
    <div className="max-w-(--shell-thread-max)">
      <Message {...args}>
        {args.align === 'start' && <AgentAvatar />}
        <MessageContent>
          <MessageHeader>
            <strong>{args.align === 'end' ? 'Maya Chen' : 'Assistant'}</strong>
            <span>14:02</span>
          </MessageHeader>
          <MessageBubble variant={args.align === 'end' ? 'muted' : 'ghost'}>
            <MessageBubbleContent>{args.align === 'end' ? USER_PROMPT : ANSWER}</MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
    </div>
  ),
})

/** Alignment is in Controls: start (assistant, ghost bubble, avatar) or end (user, muted bubble). */
export const Default = meta.story()

Default.test('renders the author, time and content', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=message]')).toHaveAttribute('data-align', 'start')
  await expect(canvas.getByText('Assistant')).toBeVisible()
  await expect(canvas.getByText('14:02')).toBeVisible()
  await expect(canvas.getByText(ANSWER)).toBeVisible()
})

/** The user's turn: right-aligned, muted bubble, no avatar. */
export const User = meta.story({ args: { align: 'end' } })

/** The assistant's turn with the Figma action row (copy, retry, good / bad response). */
export const WithActions = meta.story({
  render: () => (
    <div className="max-w-(--shell-thread-max)">
      <Message>
        <AgentAvatar />
        <MessageContent>
          <MessageHeader>
            <strong>Assistant</strong>
            <span>14:02</span>
          </MessageHeader>
          <MessageBubble variant="ghost">
            <MessageBubbleContent>{ANSWER}</MessageBubbleContent>
          </MessageBubble>
          <Actions />
        </MessageContent>
      </Message>
    </div>
  ),
})

WithActions.test('the actions are named buttons', async ({ canvas }) => {
  for (const name of ['Copy', 'Retry', 'Good response', 'Bad response']) {
    await expect(canvas.getByRole('button', { name })).toBeEnabled()
  }
})

/** Figma state invalid on the user's turn: danger border and a retry line in the footer. */
export const Failed = meta.story({
  render: () => (
    <div className="max-w-(--shell-thread-max)">
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <strong>Maya Chen</strong>
            <span>14:02</span>
          </MessageHeader>
          <MessageBubble variant="muted">
            <MessageBubbleContent aria-invalid>Draft the onboarding email</MessageBubbleContent>
          </MessageBubble>
          <MessageFooter className="text-danger-medium">
            <Icon icon={CircleAlertIcon} size="xs" />
            Failed to send ·
            <button
              type="button"
              className="rounded-sm type-text-xs-medium underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
            >
              Retry
            </button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  ),
})

Failed.test('offers a retry', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Retry' })).toBeEnabled()
})

/** A short thread: `MessageGroup` stacks turns; consecutive bubbles share one header. */
export const Thread = meta.story({
  render: () => (
    <MessageGroup className="max-w-(--shell-thread-max) gap-6">
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <strong>Maya Chen</strong>
            <span>14:02</span>
          </MessageHeader>
          <MessageBubble variant="muted">
            <MessageBubbleContent>{USER_PROMPT}</MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
      <Message>
        <AgentAvatar />
        <MessageContent>
          <MessageHeader>
            <strong>Assistant</strong>
            <span>14:02</span>
          </MessageHeader>
          <MessageBubble variant="ghost">
            <MessageBubbleContent>{ANSWER}</MessageBubbleContent>
          </MessageBubble>
          <Actions />
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <strong>Maya Chen</strong>
            <span>14:03</span>
          </MessageHeader>
          <MessageBubble variant="muted">
            <MessageBubbleContent>Make it shorter</MessageBubbleContent>
          </MessageBubble>
          <MessageBubble variant="muted">
            <MessageBubbleContent>And add the beta dates as a timeline</MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
})
