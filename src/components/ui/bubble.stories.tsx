import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from './bubble'
import { Icon, ThumbsUpIcon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

const VARIANTS = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const

const meta = preview.meta({
  title: 'Agent Builder/Primitives/Bubble',
  tags: ['agent-primitive'],
  component: Bubble,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'The surface of one chat message (shadcn/ui Bubble). `Bubble` sets `variant` and `align`; `BubbleContent` holds the text (`asChild` makes it a button or link); `BubbleGroup` stacks consecutive bubbles; `BubbleReactions` pins reactions to an edge. Figma (Agent Builder › message row): user messages are `muted`, assistant text is `ghost`, a failed send adds `aria-invalid` to the content (danger border).',
      },
    },
  },
  args: { variant: 'muted', align: 'start' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    align: { control: 'inline-radio', options: ['start', 'end'] },
  },
  render: (args) => (
    <div className="flex w-120 flex-col">
      <Bubble {...args}>
        <BubbleContent>Subtitle</BubbleContent>
      </Bubble>
    </div>
  ),
})

/** Variant and alignment are in Controls. */
export const Default = meta.story()

Default.test('renders the variant and alignment', async ({ canvasElement }) => {
  const bubble = canvasElement.querySelector('[data-slot=bubble]')
  await expect(bubble).toHaveAttribute('data-variant', 'muted')
  await expect(bubble).toHaveAttribute('data-align', 'start')
  await expect(bubble).toHaveTextContent('Subtitle')
})

/** shadcn's variants on Anvil tokens. Figma draws `muted` (user) and `ghost` (assistant). */
export const Variants = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-3">
      {VARIANTS.map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent>{variant}</BubbleContent>
        </Bubble>
      ))}
    </div>
  ),
})

/** `align="end"` for the user's messages, `start` for the assistant's. */
export const Alignment = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-3">
      <Bubble variant="muted" align="end">
        <BubbleContent>Subtitle</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>Subtitle</BubbleContent>
      </Bubble>
    </div>
  ),
})

/** Consecutive messages from one sender. */
export const Group = meta.story({
  render: () => (
    <BubbleGroup className="w-120">
      <Bubble variant="muted" align="end">
        <BubbleContent>Subtitle</BubbleContent>
      </Bubble>
      <Bubble variant="muted" align="end">
        <BubbleContent>Subtitle</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
})

/** Figma message row state invalid (failed send): `aria-invalid` on the content. */
export const Invalid = meta.story({
  render: () => (
    <div className="flex w-120 flex-col">
      <Bubble variant="muted" align="end">
        <BubbleContent aria-invalid>Subtitle</BubbleContent>
      </Bubble>
    </div>
  ),
})

Invalid.test('draws the danger border', async ({ canvasElement }) => {
  const content = canvasElement.querySelector('[data-slot=bubble-content]')!
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
      <Bubble variant="muted" align="end">
        <BubbleContent asChild>
          <button type="button">Edit</button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <a href="#open">Open</a>
        </BubbleContent>
      </Bubble>
    </div>
  ),
})

Interactive.test('the content is a focusable button', async ({ canvas }) => {
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Edit' })).toHaveFocus()
})

/** Reactions sit on the bottom (or top) edge, at the start or end. */
export const Reactions = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-8 py-4">
      <Bubble variant="muted" align="end">
        <BubbleContent>Subtitle</BubbleContent>
        <BubbleReactions align="start">
          <Icon icon={ThumbsUpIcon} size="xs" />2
        </BubbleReactions>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>Subtitle</BubbleContent>
        <BubbleReactions>
          <Icon icon={ThumbsUpIcon} size="xs" />1
        </BubbleReactions>
      </Bubble>
    </div>
  ),
})
