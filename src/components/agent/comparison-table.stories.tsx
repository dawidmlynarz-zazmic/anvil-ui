import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ComparisonTable } from './comparison-table'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15952'

const THREE = [
  { id: 'paper', name: 'Paper Kingdoms', media: <span /> },
  { id: 'lantern', name: 'The Lantern Keeper', media: <span /> },
  { id: 'lights', name: 'Northern Lights', media: <span /> },
]
const ROWS = [
  { id: 'from', label: 'From', values: ['$29', '$24', '$35'], best: 1 },
  { id: 'next', label: 'Next date', values: ['Sat 17 Oct', 'Fri 16 Oct', 'Sun 18 Oct'], best: 1 },
  { id: 'time', label: 'Running time', values: ['2h 40m', '2h 10m', '2h 25m'] },
  { id: 'where', label: 'Where', values: ['Manchester · 2 mi', 'Glasgow · 214 mi', 'Liverpool · 34 mi'] },
  { id: 'rating', label: 'Rating', values: ['4.8', '4.6', '4.7'], best: 0 },
]

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Comparison Table',
  tags: ['agent-builder'],
  component: ComparisonTable,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'columns', values: '2 · 3', code: 'the number of `options` (two or three)' },
      { property: 'show-1 · show-2 · show-3', values: 'poster + name', code: '`options` (`media`, `name`)' },
      {
        property: 'rows (From, Next date…)',
        values: 'label + values',
        code: '`rows` (`label`, `values`, `best`)',
      },
      {
        property: 'actions-row',
        values: 'buttons',
        code: '`chooseLabel` + `onChoose`; `recommended` is the brand one',
      },
    ],
    guide: {
      use: [
        'Two or three options the user is deciding between, on the same few criteria: shows, flights, plans, providers.',
        'Mark the best value in a row with `best`, and the best overall match with `recommended`.',
        'Keep rows to about six: the facts that change the decision.',
      ],
      avoid: [
        'More than three options: use Offer Carousel and let the user pick two to compare.',
        'Yes / no feature grids: use Criteria Matrix.',
        'Long text per cell: link to Item Detail instead.',
      ],
      content: [
        'Row labels are short nouns (“From”, “Next date”); values are formatted the same way in every column.',
        'The button says the action (“Choose”, “Book this one”); each is named with its option for assistive tech.',
      ],
      a11y: [
        'It is a real table: column headers for the options, row headers for the criteria, and a hidden caption (`caption`).',
        'The best value is shown by colour and weight and also read as “(best)”.',
      ],
    },
    docs: {
      description: {
        component:
          'Two or three options on the same criteria (`@/components/agent/comparison-table`): `options` (name and media), `rows` (label, one value per option, the `best` index) and an actions row (`chooseLabel`, `onChoose`, `recommended`). Built on Table (contained, compact, striped) and Button.',
      },
    },
  },
  args: {
    options: THREE,
    rows: ROWS,
    caption: 'Comparing Paper Kingdoms, The Lantern Keeper and Northern Lights',
    chooseLabel: 'Choose',
    recommended: 'paper',
    onChoose: fn(),
  },
  argTypes: {
    cornerLabel: { control: 'text' },
    caption: { control: 'text' },
    chooseLabel: { control: 'text' },
    recommended: { control: 'text' },
    options: { control: false },
    rows: { control: false },
    onChoose: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-160 max-w-full">
        <Story />
      </div>
    ),
  ],
})

/** Three options; two is the Figma `columns` = 2. */
export const Default = meta.story()

Default.test('marks the best value and reports the choice', async ({ canvas, args }) => {
  await expect(canvas.getAllByText('(best)')).toHaveLength(3)
  await userEvent.click(canvas.getByRole('button', { name: 'Choose: Paper Kingdoms' }))
  await expect(args.onChoose).toHaveBeenCalledWith('paper')
})

/** Figma columns = 2. */
export const TwoColumns = meta.story({
  args: {
    options: THREE.slice(0, 2),
    rows: ROWS.map((row) => ({
      ...row,
      values: row.values.slice(0, 2),
      best: row.best === 2 ? undefined : row.best,
    })),
    caption: 'Comparing Paper Kingdoms and The Lantern Keeper',
  },
})
