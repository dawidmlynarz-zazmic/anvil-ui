import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { MessageBubble, MessageBubbleContent, MessageBubbleGroup } from './message-bubble'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

const VARIANTS = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const

const meta = preview.meta({
  title: 'Agent Primitives/Messages/Message Bubble',
  tags: ['element'],
  component: MessageBubble,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // No Figma message bubble component: the bubble frame inside Core Kit `message row`.
    figmaProps: [
      {
        property: 'message row · role',
        values: 'user · assistant · system · tool',
        code: '`variant` prop: user → `muted`, assistant → `ghost` (system → `Marker`, tool → a MessageRow card)',
      },
      {
        property: 'message row · state',
        values: 'queued · complete · invalid · streaming',
        code: 'invalid → `aria-invalid` on `MessageBubbleContent`; the rest is MessageRow `status`',
      },
      { property: 'message row · message text', values: 'text', code: '`MessageBubbleContent` children' },
    ],
    docs: {
      description: {
        component:
          'The surface of one chat message (shadcn/ui Bubble, named Message Bubble in Anvil). `MessageBubble` sets `variant` and `align`; `MessageBubbleContent` holds the text (`asChild` makes it a button or link); `MessageBubbleGroup` stacks consecutive bubbles. Figma (Agent Builder › message row): user messages are `muted`, assistant text is `ghost`, a failed send adds `aria-invalid` to the content (danger border).',
      },
    },
  },
  args: { variant: 'muted', align: 'start' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    align: { control: 'inline-radio', options: ['start', 'end'] },
    children: { control: false },
  },
  render: (args) => (
    <div className="flex w-120 flex-col">
      <MessageBubble {...args}>
        <MessageBubbleContent>Subtitle</MessageBubbleContent>
      </MessageBubble>
    </div>
  ),
})

/** Variant and alignment are in Controls. */
export const Default = meta.story()

Default.test('renders the variant and alignment', async ({ canvasElement }) => {
  const bubble = canvasElement.querySelector('[data-slot=message-bubble]')
  await expect(bubble).toHaveAttribute('data-variant', 'muted')
  await expect(bubble).toHaveAttribute('data-align', 'start')
  await expect(bubble).toHaveTextContent('Subtitle')
})

/** shadcn's variants on Anvil tokens. Figma draws `muted` (user) and `ghost` (assistant). */
export const Variants = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-3">
      {VARIANTS.map((variant) => (
        <MessageBubble key={variant} variant={variant}>
          <MessageBubbleContent>{variant}</MessageBubbleContent>
        </MessageBubble>
      ))}
    </div>
  ),
})

/** `align="end"` for the user's messages, `start` for the assistant's. */
export const Alignment = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-3">
      <MessageBubble variant="muted" align="end">
        <MessageBubbleContent>Subtitle</MessageBubbleContent>
      </MessageBubble>
      <MessageBubble variant="ghost">
        <MessageBubbleContent>Subtitle</MessageBubbleContent>
      </MessageBubble>
    </div>
  ),
})

/** Consecutive messages from one sender. */
export const Group = meta.story({
  render: () => (
    <MessageBubbleGroup className="w-120">
      <MessageBubble variant="muted" align="end">
        <MessageBubbleContent>Subtitle</MessageBubbleContent>
      </MessageBubble>
      <MessageBubble variant="muted" align="end">
        <MessageBubbleContent>Subtitle</MessageBubbleContent>
      </MessageBubble>
    </MessageBubbleGroup>
  ),
})

/** Figma message row state invalid (failed send): `aria-invalid` on the content. */
export const Invalid = meta.story({
  render: () => (
    <div className="flex w-120 flex-col">
      <MessageBubble variant="muted" align="end">
        <MessageBubbleContent aria-invalid>Subtitle</MessageBubbleContent>
      </MessageBubble>
    </div>
  ),
})

Invalid.test('draws the danger border', async ({ canvasElement }) => {
  const content = canvasElement.querySelector('[data-slot=message-bubble-content]')!
  const danger = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim()
  const probe = document.createElement('div')
  probe.style.color = danger
  document.body.append(probe)
  const expected = getComputedStyle(probe).color
  probe.remove()
  await expect(getComputedStyle(content).borderTopColor).toBe(expected)
})

/** `asChild` turns the content into a button or link: hover and focus come from the State control. */
export const Interactive = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-3">
      <MessageBubble variant="muted" align="end">
        <MessageBubbleContent asChild>
          <button type="button">Edit</button>
        </MessageBubbleContent>
      </MessageBubble>
      <MessageBubble variant="outline">
        <MessageBubbleContent asChild>
          <a href="#open">Open</a>
        </MessageBubbleContent>
      </MessageBubble>
    </div>
  ),
})

Interactive.test('the content is a focusable button', async ({ canvas }) => {
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Edit' })).toHaveFocus()
})
