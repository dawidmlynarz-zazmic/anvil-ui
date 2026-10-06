import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Avatar, AvatarFallback } from './avatar'
import { Bubble, BubbleContent } from './bubble'
import { Button } from './button'
import { BotIcon, CircleAlertIcon, CopyIcon, Icon, RotateCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from './icon'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from './message'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

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
  title: 'Agent Primitives/Messages/Message',
  tags: ['composite'],
  component: Message,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'message row · role',
        values: 'user · assistant · system · tool',
        code: '`align` end (user) · start (assistant); system → `Marker`; the full row is Message Row',
      },
    ],
    docs: {
      description: {
        component:
          'One turn in a conversation (shadcn/ui Message): `Message` (`align` start for the assistant, end for the user) › `MessageAvatar`, `MessageContent` › `MessageHeader` (author in `<strong>`, then the time), a `Bubble`, `MessageFooter` (actions or status). `MessageGroup` stacks turns. Figma draws it as the Agent Builder › Core Kit message row; the Core Kit component composes these parts.',
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
            <strong>Title</strong>
            <span>14:02</span>
          </MessageHeader>
          <Bubble variant={args.align === 'end' ? 'muted' : 'ghost'}>
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  ),
})

/** Alignment is in Controls: start (assistant, ghost bubble, avatar) or end (user, muted bubble). */
export const Default = meta.story()

Default.test('renders the author, time and content', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=message]')).toHaveAttribute('data-align', 'start')
  await expect(canvas.getByText('Title')).toBeVisible()
  await expect(canvas.getByText('14:02')).toBeVisible()
  await expect(canvas.getByText('Subtitle')).toBeVisible()
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
            <strong>Title</strong>
            <span>14:02</span>
          </MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
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
            <strong>Title</strong>
            <span>14:02</span>
          </MessageHeader>
          <Bubble variant="muted">
            <BubbleContent aria-invalid>Subtitle</BubbleContent>
          </Bubble>
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
            <strong>Title</strong>
            <span>14:02</span>
          </MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <AgentAvatar />
        <MessageContent>
          <MessageHeader>
            <strong>Title</strong>
            <span>14:02</span>
          </MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
          <Actions />
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <strong>Title</strong>
            <span>14:03</span>
          </MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
          <Bubble variant="muted">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
})
