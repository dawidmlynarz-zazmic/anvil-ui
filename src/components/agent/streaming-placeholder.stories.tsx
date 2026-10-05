import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { StreamingPlaceholder } from './streaming-placeholder'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-2952'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Messages/Streaming Placeholder',
  tags: ['agent-primitive'],
  component: StreamingPlaceholder,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          "Holds the assistant's place before the first token arrives (`@/components/agent/streaming-placeholder`, on Skeleton): the agent avatar, a shimmering `label` and skeleton lines; `length` short · medium · long. A status named by its label. Replace it with the message once it starts streaming.",
      },
    },
  },
  args: { length: 'short', label: 'Subtitle' },
  argTypes: { length: { control: 'inline-radio', options: ['short', 'medium', 'long'] } },
})

/** Length and label are in Controls. */
export const Default = meta.story()

Default.test('is a status named by its label', async ({ canvas }) => {
  await expect(canvas.getByRole('status', { name: 'Subtitle' })).toBeVisible()
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
