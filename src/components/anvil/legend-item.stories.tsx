import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Icon, MapPinIcon } from '@/components/ui/icon'

import { LegendItem } from './legend-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10855-5814'

const meta = preview.meta({
  title: 'Design System/Atoms/Legend Item',
  tags: ['atom'],
  component: LegendItem,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'swatch',
        values: 'bar · square · dot · custom',
        code: '`swatch` prop; `custom` takes your own node',
      },
      { property: 'label', values: 'text', code: '`children`' },
    ],
    guide: {
      use: [
        'Naming the series, categories or markers of a chart, grid or map.',
        'Several legend items in a row under or beside what they describe.',
        '`custom` for a swatch that is itself a symbol (a seat, a pin).',
      ],
      avoid: [
        'Statuses or filters: use Badge or Chip.',
        'Relying on colour alone to tell series apart: add direct labels, patterns or a table.',
      ],
      content: [
        'Label: the name of the series or category, as short as the chart’s own label (“Signups”, “Available”).',
      ],
      a11y: [
        'The swatch is decorative; the label carries the meaning.',
        'A legend does not make a chart accessible: give the chart a text alternative or a table too.',
      ],
    },
    docs: {
      description: {
        component:
          'A swatch and a label (`@/components/anvil/legend-item`): `swatch` bar · square · dot · custom, `color` (any CSS colour, default `var(--chart-1)`), the label as `children`.',
      },
    },
  },
  args: { swatch: 'bar' as const, color: 'var(--chart-1)', children: 'Series' },
  argTypes: {
    swatch: { control: 'inline-radio', options: ['bar', 'square', 'dot', 'custom'] },
    color: { control: 'text' },
    custom: { control: false },
    children: { control: 'text' },
  },
})

/** Swatch, colour and label are in Controls. */
export const Default = meta.story()

Default.test('the label is read; the swatch is decorative', async ({ canvas, canvasElement }) => {
  await expect(canvas.getByText('Series')).toBeVisible()
  await expect(canvasElement.querySelector('[aria-hidden]')).not.toBeNull()
})

/** Figma swatch: bar, square, dot and a custom one. */
export const Swatches = meta.story({
  render: () => (
    <div className="flex items-center gap-6">
      <LegendItem swatch="bar" color="var(--chart-1)">
        Series
      </LegendItem>
      <LegendItem swatch="square" color="var(--chart-2)">
        Series
      </LegendItem>
      <LegendItem swatch="dot" color="var(--chart-3)">
        Series
      </LegendItem>
      <LegendItem swatch="custom" custom={<Icon icon={MapPinIcon} className="text-destructive" />}>
        Series
      </LegendItem>
    </div>
  ),
})
