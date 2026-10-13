import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { CriteriaMark, CriteriaMatrix } from './criteria-matrix'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10724-2001'

const COLUMNS = [
  { id: 'a', label: 'Meridian', credibility: 'high' as const },
  { id: 'b', label: 'Compare', credibility: 'medium' as const },
  { id: 'c', label: 'Vendor B', credibility: 'high' as const },
  { id: 'd', label: 'Review site', credibility: 'medium' as const },
  { id: 'e', label: 'News', credibility: 'high' as const },
]

const ROWS = [
  {
    id: '1',
    label: 'Annual billing lowers the seat price by about 20%',
    values: { a: 'positive', b: 'negative', c: 'positive', d: 'partial', e: 'none' },
  },
  {
    id: '2',
    label: 'Free plans cap history at 30 days',
    values: { a: 'positive', b: 'positive', c: 'none', d: 'positive', e: 'positive' },
  },
  {
    id: '3',
    label: 'Admin controls are paid add-ons at most tools',
    values: { a: 'partial', b: 'positive', c: 'positive', d: 'negative', e: 'none' },
  },
  {
    id: '4',
    label: 'Storage is the main upgrade driver',
    values: { a: 'positive', b: 'positive', c: 'partial', d: 'positive', e: 'positive' },
  },
] as const

const meta = preview.meta({
  title: 'Agent Builder/Evidence & decisions/Criteria Matrix',
  tags: ['agent-builder'],
  component: CriteriaMatrix,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'value',
        values: 'positive · partial · negative · none',
        code: '`CriteriaMark` `value` prop (also the cell values)',
      },
      {
        property: 'columns (credibility dot)',
        values: 'sources',
        code: '`columns` prop (`credibility` high · medium · low)',
      },
      { property: 'rows', values: 'claims', code: '`rows` prop (`values` by column id)' },
      { property: 'badge · legend', values: 'text', code: '`badge` · `legend`' },
    ],
    guide: {
      use: [
        'To compare several claims, requirements or options against several sources or criteria at a glance: feature comparison, eligibility, evidence.',
        'Keep it to a handful of rows and columns; the mark says supports, partly, contradicts or not covered.',
        'Put the most credible sources first, and mark their credibility above the column.',
      ],
      avoid: [
        'Precise numbers per cell: use Table.',
        'Two values in conflict: use Conflict Resolver.',
        'A single claim and its evidence: use Insight Card.',
      ],
      content: [
        'Row labels are the claims, short and specific; column labels are the source names.',
        'The badge counts what needs attention (“2 conflicts”). The legend explains every mark that appears.',
      ],
      a11y: [
        'It is a real table with row and column headers; every mark has its meaning as hidden text (“Supports”), and credibility is said in the column heading.',
        'Shape and colour both vary (check, dot, cross, dash), so no mark depends on colour alone.',
      ],
    },
    docs: {
      description: {
        component:
          'Claims against sources (`@/components/agent/criteria-matrix`, on Task Card + Table): `columns`, `rows`, `badge`, `legend`, and `CriteriaMark` (`value` positive · partial · negative · none).',
      },
    },
  },
  args: {
    title: 'Evidence matrix',
    subtitle: '4 key claims × 5 most-cited sources',
    badge: '2 conflicts',
    rowHeading: 'Claim',
    columns: COLUMNS,
    rows: ROWS as never,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
    rowHeading: { control: 'text' },
    columns: { control: 'object' },
    rows: { control: 'object' },
    legend: { control: 'object' },
  },
})

/** The matrix with its legend. */
export const Default = meta.story()

Default.test('is a table whose marks say what they mean', async ({ canvas }) => {
  await expect(canvas.getByRole('table')).toBeVisible()
  await expect(canvas.getAllByText('Supports').length).toBeGreaterThan(3)
  await expect(canvas.getByRole('columnheader', { name: /Meridian/ })).toHaveTextContent('high credibility')
  await expect(canvas.getByText('2 conflicts')).toBeVisible()
})

/** Figma value: positive, partial, negative, none. */
export const Marks = meta.story({
  render: () => (
    <div className="flex items-center gap-8">
      {(['positive', 'partial', 'negative', 'none'] as const).map((value) => (
        <CriteriaMark key={value} value={value} />
      ))}
    </div>
  ),
})
