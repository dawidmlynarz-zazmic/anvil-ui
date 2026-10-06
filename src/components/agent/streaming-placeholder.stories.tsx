import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { StreamingPlaceholder } from './streaming-placeholder'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-2952'

const meta = preview.meta({
  title: 'Agent Builder/Agent status/Streaming Placeholder',
  tags: ['agent-builder', 'agent-status'],
  component: StreamingPlaceholder,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'length', values: 'short · medium · long', code: '`length` prop' },
      {
        property: 'typing indicator (10734:2807) · frame',
        values: '1 · 2 · 3',
        code: '`variant="dots"`; the frames are the `animate-typing-dot` animation',
      },
    ],
    guide: {
      use: [
        'In the assistant’s place in the thread from send until the first token arrives; replace it with the Message Row as soon as text streams.',
        '`variant="dots"` in compact shells (popover, side panel) or chat-style threads; skeleton when the answer will be long.',
        'Pick `length` to match the expected answer, so the thread doesn’t jump when it arrives.',
      ],
      avoid: [
        'Showing the reasoning: use Thinking Panel. Showing a running tool: use Tool Log Line or Tool Call Item.',
        'Loading a page or a list: use Skeleton.',
        'Keeping it on screen after streaming starts: the streaming caret in Message Row takes over.',
      ],
      content: [
        '`label`: what the agent is doing right now, as a present participle (“Reading q3-launch-plan.pdf…”, “Searching the web…”).',
        'Dots: the label is not shown but still names the status (“Assistant is typing”).',
      ],
      a11y: [
        'It is a `role="status"` named by `label`, so the wait is announced once, not every frame.',
        'The shimmer and dots stop under reduced motion.',
      ],
    },
    docs: {
      description: {
        component:
          "Holds the assistant's place before the first token arrives (`@/components/agent/streaming-placeholder`, on Skeleton): `variant` skeleton (the agent avatar, a shimmering `label` and skeleton lines; `length` short · medium · long) or dots (the typing pill; Figma typing indicator). A status named by its label. Replace it with the message once it starts streaming.",
      },
    },
  },
  args: { variant: 'skeleton' as const, length: 'short' as const, label: 'Reading q3-launch-plan.pdf…' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['skeleton', 'dots'] },
    length: { control: 'inline-radio', options: ['short', 'medium', 'long'] },
    label: { control: 'text' },
    icon: { control: false },
  },
})

/** Length and label are in Controls. */
export const Default = meta.story()

Default.test('is a status named by its label', async ({ canvas }) => {
  await expect(canvas.getByRole('status', { name: 'Reading q3-launch-plan.pdf…' })).toBeVisible()
})

/** Figma length: short, medium, long. */
export const Lengths = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-8">
      <StreamingPlaceholder {...args} length="short" />
      <StreamingPlaceholder {...args} length="medium" />
      <StreamingPlaceholder {...args} length="long" />
    </div>
  ),
})

/** `variant="dots"` (Figma typing indicator): three dots in a muted pill. */
export const Dots = meta.story({ args: { variant: 'dots', label: 'Assistant is typing' } })

Dots.test('is a named status with three dots', async ({ canvas }) => {
  const status = canvas.getByRole('status', { name: 'Assistant is typing' })
  await expect(status.children).toHaveLength(3)
})
