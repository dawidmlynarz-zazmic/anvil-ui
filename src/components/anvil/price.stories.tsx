import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Price } from './price'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10855-5558'

const meta = preview.meta({
  title: 'Design System/Molecules/Price',
  tags: ['molecule'],
  component: Price,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'size', values: 'sm · md · lg', code: '`size` prop: sm · default · lg' },
      { property: 'emphasis', values: 'default · sale', code: '`emphasis` prop' },
      { property: 'current · was · discount', values: 'text', code: '`current` · `was` · `discount` props' },
      { property: 'show was · show discount', values: 'boolean', code: 'pass `was` / `discount` or not' },
    ],
    guide: {
      use: [
        'The price of an offer or an order line, with the previous price and the saving when there is a sale.',
        '`emphasis="sale"` together with `was` and `discount`, so the sale is stated, not only coloured.',
      ],
      avoid: [
        'A figure that is not money: use Value Stack.',
        'Totals in an order summary: use Key Value Row (strong) so the labels line up.',
      ],
      content: [
        'Format prices for the user’s locale and currency (“$119”); the discount carries its sign (“−20%”).',
        'Don’t show `was` unless the offer really was that price.',
      ],
      a11y: [
        'Screen readers hear “Now $119 Was $148 −20%”; the struck-through price is a `<del>`.',
        'Sale colour (--danger-strong) is never the only signal.',
      ],
    },
    docs: {
      description: {
        component:
          'A price with an optional was-price and discount (`@/components/anvil/price`, on Badge): `current`, `was`, `discount`, `size` sm · default · lg, `emphasis` default · sale.',
      },
    },
  },
  args: {
    current: '$119',
    was: '$148',
    discount: '−20%',
    size: 'default' as const,
    emphasis: 'sale' as const,
  },
  argTypes: {
    current: { control: 'text' },
    was: { control: 'text' },
    discount: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    emphasis: { control: 'inline-radio', options: ['default', 'sale'] },
  },
})

/** Size, emphasis and the three texts are in Controls. */
export const Default = meta.story()

Default.test('says the sale in words', async ({ canvas }) => {
  await expect(canvas.getByText('$148').tagName).toBe('DEL')
  await expect(canvas.getByText('Now', { exact: false })).toBeInTheDocument()
  await expect(canvas.getByText('−20%')).toBeVisible()
})

/** Figma size × emphasis. */
export const Variants = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-10">
          <Price {...args} size={size} emphasis="default" />
          <Price {...args} size={size} emphasis="sale" />
        </div>
      ))}
    </div>
  ),
})

/** Just the price: no was-price or discount. */
export const Plain = meta.story({ args: { was: undefined, discount: undefined, emphasis: 'default' } })
