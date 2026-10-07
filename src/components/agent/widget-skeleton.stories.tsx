import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { WidgetSkeleton } from './widget-skeleton'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10814-3205'

const meta = preview.meta({
  title: 'Design System/Molecules/Widget Skeleton',
  tags: ['molecule', 'widgets'],
  component: WidgetSkeleton,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'shape', values: 'card · list · table · chart', code: '`shape` prop' },
      { property: 'text shimmer', values: 'instance', code: '`label` prop (default “Loading…”)' },
    ],
    guide: {
      use: [
        'While a widget the agent is building loads: pick the `shape` closest to what will appear, so the layout doesn’t jump.',
        'Say what is loading in `label` when you know it (“Loading orders…”).',
      ],
      avoid: [
        'The agent is still thinking about the answer: use Streaming Placeholder.',
        'A widget that has its own `loading` prop (Widget Table, Widget Metric Card, Widget Media): use that.',
        'A single line or block: use Skeleton.',
      ],
      content: ['`label`: “Loading…”, or “Loading” + what (“Loading flights…”). Keep it short.'],
      a11y: [
        'It is a `role="status"` region named by the label and marked `aria-busy`; the blocks are hidden from assistive tech.',
        'The pulse and shimmer stop with reduced motion.',
      ],
    },
    docs: {
      description: {
        component:
          'The loading placeholder of a widget (`@/components/agent/widget-skeleton`), built on Card, Text Shimmer and Skeleton: `shape` card · list · table · chart and the `label`.',
      },
    },
  },
  args: { shape: 'card' as const, label: 'Loading…' },
  argTypes: {
    shape: { control: 'inline-radio', options: ['card', 'list', 'table', 'chart'] },
    label: { control: 'text' },
  },
})

/** Shape and label are in Controls. */
export const Default = meta.story()

Default.test('is a busy status named by its label', async ({ canvas }) => {
  const status = canvas.getByRole('status', { name: 'Loading…' })
  await expect(status).toHaveAttribute('aria-busy', 'true')
})

/** Figma shapes: card, list, table, chart. */
export const Shapes = meta.story({
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <WidgetSkeleton {...args} shape="card" label="Loading the hotel…" />
      <WidgetSkeleton {...args} shape="list" label="Loading orders…" />
      <WidgetSkeleton {...args} shape="table" label="Loading the signups table…" />
      <WidgetSkeleton {...args} shape="chart" label="Loading weekly active users…" />
    </div>
  ),
})

/** In a narrow column (side panel): the blocks shrink with it. */
export const Narrow = meta.story({
  args: { shape: 'list' },
  decorators: [(Story) => <div className="max-w-80">{Story()}</div>],
})
