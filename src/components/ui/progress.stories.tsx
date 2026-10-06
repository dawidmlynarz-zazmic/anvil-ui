import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Progress } from './progress'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10847-5203'
const tones = ['brand', 'agent', 'success', 'warning', 'destructive', 'neutral'] as const
const sizes = ['sm', 'default', 'lg'] as const

const meta = preview.meta({
  title: 'Design System/Atoms/Progress',
  tags: ['atom'],
  component: Progress,
  parameters: {
    shadcn: 'progress',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'tone',
        values: 'brand · agent · success · warning · destructive · neutral',
        code: '`tone` prop',
      },
      { property: 'thickness', values: '4 · 6 · 8', code: '`size` prop (sm · default · lg)' },
    ],
    guide: {
      use: [
        'Progress of a task with a known size: uploads, imports, steps completed.',
        'A share or quota (storage used, budget spent); `tone` for its meaning, e.g. warning near the limit.',
      ],
      avoid: [
        'Unknown duration: use Spinner (or leave `value` undefined). The agent at work: use Pulse Dot or Text Shimmer.',
        'Named steps people move through: use Stepper.',
      ],
      content: [
        'Show a label and the value in text beside it: “60%”, “3 of 5 files”.',
        'Keep `tone` for meaning (success when done, warning near a limit), not decoration.',
      ],
      a11y: [
        'It is a `progressbar`: name it with `aria-label` or `aria-labelledby` on a visible label.',
        'The value is exposed as `aria-valuenow`; announce completion separately (e.g. a Toast).',
        'Do not rely on the fill color alone: the text beside it says the value.',
      ],
    },
    docs: {
      description: {
        component:
          'A linear progress or share (shadcn/ui Progress on Radix): `value` of `max`, `tone` for the fill and `size` sm · default · lg (4 / 6 / 8px). It is a `progressbar`; give it a label (`aria-label` or a visible label with `aria-labelledby`). Leave `value` undefined for an indeterminate task.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
  args: { value: 60, tone: 'brand', size: 'default', 'aria-label': 'Label' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    tone: { control: 'select', options: tones },
    size: { control: 'inline-radio', options: sizes },
    max: { control: 'number' },
    'aria-label': { control: 'text' },
    asChild: { control: false },
  },
})

export const Default = meta.story()

Default.test('a named progressbar reporting its value', async ({ canvas }) => {
  const bar = canvas.getByRole('progressbar', { name: 'Label' })
  await expect(bar).toHaveAttribute('aria-valuenow', '60')
  await expect(bar).toHaveAttribute('aria-valuemax', '100')
})

/** Figma tone × thickness (4 · 6 · 8). */
export const Tones = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {tones.map((tone) => (
        <div key={tone} className="flex flex-col gap-2">
          {sizes.map((size) => (
            <Progress key={size} value={60} tone={tone} size={size} aria-label={`Label ${tone} ${size}`} />
          ))}
        </div>
      ))}
    </div>
  ),
})

/** With a visible label and value. */
export const WithLabel = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between type-text-sm-medium">
        <span id="progress-label">Label</span>
        <span className="text-muted-foreground">60%</span>
      </div>
      <Progress value={60} aria-labelledby="progress-label" />
    </div>
  ),
})
