import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { CircleDollarSignIcon, PercentIcon, UserMinusIcon, UsersIcon } from '@/components/ui/icon'

import { WidgetMetricCard, WidgetMetricGroup } from './widget-metric-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2929'
const FIGMA_GROUP = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3065'

// Weekly active users over the last 8 weeks.

// One real metric per trend (the Variants grid).
const BY_TREND = {
  up: { label: 'Weekly active users', value: '12,480', delta: '+8.2%', icon: UsersIcon },
  down: { label: 'Trial conversion', value: '4.6%', delta: '−0.3 pt', icon: PercentIcon },
  neutral: { label: 'Churn', value: '2.1%', delta: '0.0 pt', icon: UserMinusIcon },
} as const

const METRICS = [
  { ...BY_TREND.up, trend: 'up' },
  { ...BY_TREND.down, trend: 'down' },
  { ...BY_TREND.neutral, trend: 'neutral' },
  { label: 'Revenue', value: '$48.2k', delta: '+5.4%', icon: CircleDollarSignIcon, trend: 'up' },
] as const

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/Widget Metric Card',
  tags: ['agent-builder', 'widgets'],
  component: WidgetMetricCard,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'label', values: 'text', code: '`label` prop' },
      { property: 'value', values: 'text', code: '`value` prop' },
      { property: 'delta · show delta', values: 'text · boolean', code: '`delta` prop (a subtle Badge)' },
      { property: 'period', values: 'text', code: '`period` prop' },
      { property: 'show icon · icon', values: 'boolean · instance', code: '`icon` prop' },
      { property: 'trend', values: 'up · down · neutral', code: '`trend` prop (delta tone)' },
      { property: 'size', values: 'default · compact', code: '`size` prop' },
      { property: 'state', values: 'loaded · loading', code: '`loading` prop (Skeletons)' },
      { property: 'widget metric group', values: '—', code: '`WidgetMetricGroup` (no properties)' },
    ],
    guide: {
      use: [
        'When the answer is a number: one key metric with its change and what it compares to.',
        'Several related metrics side by side: put the cards in a `WidgetMetricGroup` with an `aria-label`.',
      ],
      avoid: [
        'Many rows of numbers to compare: use Widget Table.',
        'A trend over time: describe it in the message or attach a chart artifact.',
        'Numbers inside a running sentence: keep them in the message text.',
      ],
      content: [
        '`label`: the metric in sentence case (“Weekly active users”). `value`: formatted and rounded (“12,480”, “$48.2k”).',
        '`delta` with its sign and unit (“+8.2%”, “−0.3 pt”); `period` says what it compares to (“vs last week”).',
        'Set `trend` by direction, not by good or bad, so up is always the same colour.',
      ],
      a11y: [
        'The delta Badge carries its sign in text, so the trend isn’t told by colour alone.',
        'While `loading`, the card is `aria-busy`.',
        '`WidgetMetricGroup` is a `group`: name it with `aria-label` (“Northwind Sync this week”).',
      ],
    },
    docs: {
      description: {
        component:
          'One number in an answer (`@/components/agent/widget-metric-card`), built from Card, a subtle Badge (the delta), and Skeleton (loading). `label`, `value`, `delta`, `period`, `trend` up · down · neutral, `icon`, `size` default · compact, `loading`. `WidgetMetricGroup` lays several out in a wrapping row.',
      },
    },
  },
  args: {
    label: 'Weekly active users',
    value: '12,480',
    delta: '+8.2%',
    period: 'vs last week',
    trend: 'up' as const,
    icon: UsersIcon,
    size: 'default' as const,
    loading: false,
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    delta: { control: 'text' },
    period: { control: 'text' },
    trend: { control: 'inline-radio', options: ['up', 'down', 'neutral'] },
    icon: { control: false },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    loading: { control: 'boolean' },
  },
  decorators: [(Story) => <div className="w-60">{Story()}</div>],
})

/** Every prop is in Controls. */
export const Default = meta.story()

Default.test('shows the value and the delta badge', async ({ canvas }) => {
  await expect(canvas.getByText('12,480')).toBeVisible()
  await expect(canvas.getByText('+8.2%')).toHaveAttribute('data-tone', 'success')
})

/** Figma trend × size, loaded and loading. */
export const Variants = meta.story({
  decorators: [(Story) => <div className="w-200">{Story()}</div>],
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['default', 'compact'] as const).map((size) => (
        <div key={size} className="flex flex-wrap gap-3">
          {(['up', 'down', 'neutral'] as const).map((trend) => (
            <WidgetMetricCard
              key={trend}
              {...args}
              {...BY_TREND[trend]}
              size={size}
              trend={trend}
              className="w-56"
            />
          ))}
          <WidgetMetricCard {...args} size={size} loading className="w-56" />
        </div>
      ))}
    </div>
  ),
})

/** Figma state loading: Skeletons hold the value and delta, and the card is busy. */
export const Loading = meta.story({ args: { loading: true } })

Loading.test('is busy with skeletons', async ({ canvasElement }) => {
  const card = canvasElement.querySelector('[data-slot=widget-metric-card]')!
  await expect(card).toHaveAttribute('aria-busy', 'true')
  await expect(card.querySelectorAll('[data-slot=skeleton]')).toHaveLength(2)
})

/** Figma widget metric group: a wrapping row, 12px apart, each card filling its share. */
export const Group = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_GROUP } },
  decorators: [(Story) => <div className="w-200">{Story()}</div>],
  render: (args) => (
    <WidgetMetricGroup aria-label="Northwind Sync this week">
      {METRICS.map((metric) => (
        <WidgetMetricCard key={metric.label} {...args} {...metric} size="compact" />
      ))}
    </WidgetMetricGroup>
  ),
})
