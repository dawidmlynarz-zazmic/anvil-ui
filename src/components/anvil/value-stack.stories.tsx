import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ValueStack } from './value-stack'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10877-5984'
const FIGMA_TILE = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10847-5117'

const meta = preview.meta({
  title: 'Design System/Atoms/Value Stack',
  tags: ['atom'],
  component: ValueStack,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'align', values: 'start · end', code: '`align` prop' },
      {
        property: 'order',
        values: 'label first · value first',
        code: '`order` prop: label-first · value-first',
      },
      { property: 'size', values: 'sm · md · lg', code: '`size` prop: sm · default · lg' },
      { property: 'show label', values: 'boolean', code: 'pass `label` or not' },
      {
        property: 'stat tile · emphasis',
        values: 'default · positive · negative',
        code: '`variant="tile"` and `emphasis`',
      },
    ],
    guide: {
      use: [
        'A single figure with its caption: a balance, a time, a boarding-pass field, an impact number.',
        '`variant="tile"` for two or three figures in a row (impact, results, fit); `emphasis` for a good or bad change.',
        '`align="end"` for a column of figures that line up on the right.',
      ],
      avoid: [
        'A label and value on one line in a list: use Key Value Row.',
        'Several fields to compare: use a Table.',
        'A headline metric with a trend and chart: use Widget Metric Card.',
      ],
      content: [
        'Label: a short noun (“Balance”, “Departs”). Value: the figure with its unit (“$4,212.40”, “14:30”).',
        'Say the direction in the value (“+12%”, “−3%”) when you use `emphasis`.',
      ],
      a11y: [
        'Colour is never the only signal: positive and negative values carry a sign or a word.',
        'The label and value are plain text in reading order (label first by default); value-first only changes the look, keep the label close to the value.',
      ],
    },
    docs: {
      description: {
        component:
          'A label and a value stacked (`@/components/anvil/value-stack`): `size` sm · default · lg, `align` start · end, `order` label-first · value-first, `emphasis` default · positive · negative, `variant` default · tile (the Figma stat tile).',
      },
    },
  },
  args: {
    label: 'Label',
    children: 'Value',
    size: 'default' as const,
    align: 'start' as const,
    order: 'label-first' as const,
    emphasis: 'default' as const,
    variant: 'default' as const,
  },
  argTypes: {
    label: { control: 'text' },
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    align: { control: 'inline-radio', options: ['start', 'end'] },
    order: { control: 'inline-radio', options: ['label-first', 'value-first'] },
    emphasis: { control: 'inline-radio', options: ['default', 'positive', 'negative'] },
    variant: { control: 'inline-radio', options: ['default', 'tile'] },
  },
})

/** Size, alignment, order and emphasis are in Controls. */
export const Default = meta.story()

Default.test('label and value are both read', async ({ canvas }) => {
  await expect(canvas.getByText('Label')).toBeVisible()
  await expect(canvas.getByText('Value')).toBeVisible()
})

/** Figma size × align × order. */
export const Variants = meta.story({
  render: (args) => (
    <div className="grid grid-cols-4 gap-x-10 gap-y-6">
      {(['sm', 'default', 'lg'] as const).map((size) =>
        (['start', 'end'] as const).map((align) =>
          (['label-first', 'value-first'] as const).map((order) => (
            <ValueStack
              key={`${size}${align}${order}`}
              {...args}
              size={size}
              align={align}
              order={order}
              className="w-40"
            />
          )),
        ),
      )}
    </div>
  ),
})

/** Figma stat tile: the stack on a muted tile; emphasis colours the value. */
export const StatTiles = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_TILE } },
  render: () => (
    <div className="grid w-120 grid-cols-3 gap-3">
      <ValueStack variant="tile" label="Label">
        Value
      </ValueStack>
      <ValueStack variant="tile" label="Label" emphasis="positive">
        +12%
      </ValueStack>
      <ValueStack variant="tile" label="Label" emphasis="negative">
        −3%
      </ValueStack>
    </div>
  ),
})

StatTiles.test('the tiles show signed values', async ({ canvas }) => {
  await expect(canvas.getByText('+12%')).toBeVisible()
  await expect(canvas.getByText('−3%')).toBeVisible()
})
