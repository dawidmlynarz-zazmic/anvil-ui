import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { UsersIcon } from '@/components/ui/icon'

import { WidgetMetricCard, WidgetMetricGroup } from './widget-metric-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2929'
const FIGMA_GROUP = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3065'

const SERIES = [4, 6, 5, 7, 8, 7, 10, 12]
const DELTA = { up: '+12%', down: '−3%', neutral: '0%' } as const

const meta = preview.meta({
  title: 'Agent Builder/Widget Metric Card',
  tags: ['agent-builder', 'widgets'],
  component: WidgetMetricCard,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'label', values: 'text', code: '`label` prop' },
      { property: 'value', values: 'text', code: '`value` prop' },
      { property: 'delta · show delta', values: 'text · boolean', code: '`delta` prop (a semantic Badge)' },
      { property: 'period', values: 'text', code: '`period` prop' },
      { property: 'show icon · icon', values: 'boolean · instance', code: '`icon` prop' },
      {
        property: 'show sparkline · sparkline',
        values: 'boolean · instance',
        code: '`sparkline` prop (the series; a Sparkline)',
      },
      { property: 'trend', values: 'up · down · neutral', code: '`trend` prop (delta tone + sparkline)' },
      { property: 'size', values: 'default · compact', code: '`size` prop' },
      { property: 'state', values: 'loaded · loading', code: '`loading` prop (Skeletons)' },
      { property: 'widget metric group', values: '—', code: '`WidgetMetricGroup` (no properties)' },
    ],
    docs: {
      description: {
        component:
          'One number in an answer (`@/components/agent/widget-metric-card`), built from Card, a semantic Badge (the delta), Skeleton (loading) and Sparkline. `label`, `value`, `delta`, `period`, `trend` up · down · neutral, `icon`, `sparkline` (a series), `size` default · compact, `loading`. `WidgetMetricGroup` lays several out in a wrapping row.',
      },
    },
  },
  args: {
    label: 'Label',
    value: 'Value',
    delta: '+12%',
    period: 'Subtitle',
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
    sparkline: { control: 'object' },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    loading: { control: 'boolean' },
  },
  decorators: [(Story) => <div className="w-60">{Story()}</div>],
})

/** Every prop is in Controls. */
export const Default = meta.story()

Default.test('shows the value and the delta badge', async ({ canvas }) => {
  await expect(canvas.getByText('Value')).toBeVisible()
  await expect(canvas.getByText('+12%')).toHaveAttribute('data-tone', 'success')
})

/** Figma trend × size, loaded and loading, with and without a sparkline. */
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
              size={size}
              trend={trend}
              delta={DELTA[trend]}
              sparkline={trend === 'up' ? SERIES : undefined}
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
    <WidgetMetricGroup aria-label="Title">
      {(['Label 1', 'Label 2', 'Label 3', 'Label 4'] as const).map((label, i) => (
        <WidgetMetricCard
          key={label}
          {...args}
          label={label}
          size="compact"
          trend={i === 1 ? 'down' : i === 3 ? 'neutral' : 'up'}
          delta={i === 1 ? DELTA.down : i === 3 ? DELTA.neutral : DELTA.up}
        />
      ))}
    </WidgetMetricGroup>
  ),
})
