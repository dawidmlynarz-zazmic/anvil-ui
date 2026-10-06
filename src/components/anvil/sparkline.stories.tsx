import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Sparkline } from './sparkline'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2920'

const UP = [4, 6, 5, 7, 8, 7, 10, 12]
const DOWN = [12, 11, 12, 9, 8, 8, 6, 5]
const FLAT = [6, 7, 6, 7, 6, 7, 6, 6]

const meta = preview.meta({
  title: 'Atoms/Sparkline',
  tags: ['atom'],
  component: Sparkline,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'trend',
        values: 'up · down · neutral',
        code: '`trend` prop (derived from `values` when omitted)',
      },
    ],
    guide: {
      use: [
        'A trend at a glance next to a metric value, e.g. in a Widget Metric Card.',
        '`values` oldest first; `trend` is derived from the first and last value unless you set it.',
      ],
      avoid: ['Exact values, axes or comparisons: use a full chart. Progress toward a goal: use Progress.'],
      content: [
        'Pair it with the value and the change in text: “12,480 · +8.2%”.',
        'Use `trend="neutral"` when the change is not meaningful, so color does not imply good or bad.',
      ],
      a11y: [
        'Decorative by default; pass `label` (“Up 8% over 8 weeks”) when it is the only place the trend appears.',
        'Color is not enough: the text beside it states the direction.',
      ],
    },
    docs: {
      description: {
        component:
          'A small trend line (`@/components/anvil/sparkline`): `values` (oldest first), `trend` up (--success-strong) · down (--danger-strong) · neutral (--muted-foreground), derived from the first and last value when omitted. 2px line, fills its box (32px tall). Decorative unless `label` names it.',
      },
    },
  },
  args: { values: UP, trend: undefined, label: undefined },
  argTypes: {
    values: { control: 'object' },
    trend: { control: 'inline-radio', options: ['up', 'down', 'neutral'] },
    label: { control: 'text' },
  },
  decorators: [(Story) => <div className="w-50">{Story()}</div>],
})

/** Values, trend and label are in Controls. */
export const Default = meta.story()

Default.test('derives the trend and is decorative without a label', async ({ canvasElement }) => {
  const svg = canvasElement.querySelector('[data-slot=sparkline]')!
  await expect(svg).toHaveAttribute('data-trend', 'up')
  await expect(svg).toHaveAttribute('aria-hidden', 'true')
})

/** Figma trend: up, down, neutral. */
export const Trends = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Sparkline values={UP} />
      <Sparkline values={DOWN} />
      <Sparkline values={FLAT} trend="neutral" />
    </div>
  ),
})

/** With `label` it is an image with a name. */
export const Labelled = meta.story({ args: { label: 'Subtitle' } })

Labelled.test('is a named image', async ({ canvas }) => {
  await expect(canvas.getByRole('img', { name: 'Subtitle' })).toBeVisible()
})
