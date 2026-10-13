import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { KeyValueList, KeyValueRow } from './key-value-row'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10847-4910'

const meta = preview.meta({
  title: 'Design System/Atoms/Key Value Row',
  tags: ['atom'],
  component: KeyValueRow,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'layout', values: 'spread · aligned', code: '`layout` prop' },
      { property: 'emphasis', values: 'default · strong', code: '`emphasis` prop' },
      { property: 'key · value', values: 'text', code: '`label` prop · `children`' },
      { property: 'show lead · lead', values: 'boolean · text', code: '`lead` prop (a quantity column)' },
    ],
    guide: {
      use: [
        '`layout="spread"` for totals and summaries (the value at the end); `aligned` for details lists with a fixed label column.',
        '`emphasis="strong"` on the final line (a total).',
        '`lead` for quantities (“2 ×”) in an order or basket.',
      ],
      avoid: [
        'A figure with its caption stacked: use Value Stack.',
        'A list of things with title, description and actions: use Item.',
        'Tabular data with several columns: use Table.',
      ],
      content: [
        'Key: a short noun (“Subtotal”, “Hold expires”). Value: the figure with its unit, formatted.',
        'Keep rows in a `KeyValueList` so they read as a description list.',
      ],
      a11y: [
        'Rows are `<dt>` / `<dd>` pairs inside a `<dl>`, so screen readers announce key and value together.',
        'Totals are marked by weight and position as well as by the word (“Total”).',
      ],
    },
    docs: {
      description: {
        component:
          'A label and its value on one line (`@/components/anvil/key-value-row`): `KeyValueList` (`<dl>`) and `KeyValueRow` with `label`, `lead`, `layout` spread · aligned, `emphasis` default · strong; the value is `children`.',
      },
    },
  },
  args: { label: 'Key', children: 'Value', layout: 'spread' as const, emphasis: 'default' as const },
  argTypes: {
    label: { control: 'text' },
    children: { control: 'text' },
    lead: { control: 'text' },
    layout: { control: 'inline-radio', options: ['spread', 'aligned'] },
    emphasis: { control: 'inline-radio', options: ['default', 'strong'] },
  },
  render: (args) => (
    <KeyValueList className="w-110">
      <KeyValueRow {...args} />
    </KeyValueList>
  ),
})

/** Layout, emphasis and the lead are in Controls. */
export const Default = meta.story()

Default.test('is a description list row', async ({ canvas }) => {
  await expect(canvas.getByText('Key').tagName).toBe('SPAN')
  await expect(canvas.getByText('Key').closest('dt')).not.toBeNull()
  await expect(canvas.getByText('Value').tagName).toBe('DD')
})

/** Figma layout × emphasis. */
export const Variants = meta.story({
  render: () => (
    <div className="flex w-110 flex-col gap-6">
      {(['spread', 'aligned'] as const).map((layout) => (
        <KeyValueList key={layout}>
          <KeyValueRow layout={layout} label="Key">
            Value
          </KeyValueRow>
          <KeyValueRow layout={layout} label="Key" emphasis="strong">
            Value
          </KeyValueRow>
        </KeyValueList>
      ))}
    </div>
  ),
})

/** The optional lead column for quantities. */
export const WithLead = meta.story({
  render: () => (
    <KeyValueList className="w-110">
      <KeyValueRow lead="2 ×" label="Item">
        $78.00
      </KeyValueRow>
      <KeyValueRow lead="1 ×" label="Item">
        $12.00
      </KeyValueRow>
      <KeyValueRow label="Total" emphasis="strong">
        $90.00
      </KeyValueRow>
    </KeyValueList>
  ),
})

WithLead.test('the lead stays with its key', async ({ canvas }) => {
  await expect(canvas.getByText('2 ×').closest('dt')).toHaveTextContent('Item')
})
