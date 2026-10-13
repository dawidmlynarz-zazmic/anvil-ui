import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ConflictResolver } from './conflict-resolver'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10724-1863'

const OPTIONS = [
  {
    id: 'vendor',
    source: 'Meridian pricing page',
    value: '20%',
    detail: 'Annual plans · current list prices',
    credibility: 'high' as const,
    credibilityLabel: 'High credibility · Oct 2026',
    recommended: true,
  },
  {
    id: 'compare',
    source: 'Compare-a-tool',
    value: '15%',
    detail: '12 plans · user-submitted data',
    credibility: 'medium' as const,
    credibilityLabel: 'Medium credibility · Mar 2026',
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Evidence & decisions/Conflict Resolver',
  tags: ['agent-builder'],
  component: ConflictResolver,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'open · resolved', code: '`status` prop' },
      {
        property: 'size',
        values: 'default · compact',
        code: 'responsive: side by side from 560px, stacked below (container query)',
      },
      { property: 'options', values: 'two sources', code: '`options` prop (`recommended`, `credibility`)' },
      {
        property: 'recommendation · range',
        values: 'text',
        code: '`recommendation` · `rangeLabel` (value `range`)',
      },
      {
        property: 'footer',
        values: 'range · use recommendation · undo',
        code: '`onReportRange` · `onUseRecommendation` · `onUndo`; `resolvedNote`',
      },
    ],
    guide: {
      use: [
        'When two sources give different values for the same thing and the user should decide which one to report.',
        'Put the agent’s recommendation and its reason between the options and the actions.',
        'Offer “report both as a range” for when neither is wrong.',
      ],
      avoid: [
        'Gaps with no value at all: use Open Items.',
        'A choice between actions: use Clarifying Question.',
        'More than two values: use Criteria Matrix, then decide.',
      ],
      content: [
        'Each option names the source, shows the value large and gives its basis and credibility.',
        'The recommendation says which value and why, in two sentences.',
        'Resolved: say what was chosen, when, and that the other figure is noted in the report.',
      ],
      a11y: [
        'The options are a radio group (arrow keys, one tab stop); the chosen option is also labelled “Chosen”.',
        'Credibility is a dot plus words, never colour alone. Undo is a button.',
      ],
    },
    docs: {
      description: {
        component:
          'A disagreement between sources, decided by the user (`@/components/agent/conflict-resolver`, on Task Card and the Field choice card): `status` open · resolved, `options`, `value` / `defaultValue` (an option id or `range`), `recommendation`, `rangeLabel`, `onUseRecommendation`, `onReportRange`, `resolvedNote`, `onUndo`.',
      },
    },
  },
  args: {
    status: 'open' as const,
    title: 'Sources disagree',
    subtitle: 'Annual-billing discount, 2026',
    options: OPTIONS,
    recommendation:
      'I recommend 20% (the vendor’s own page). It is current for all plan tiers; the comparison site mixes old and new prices.',
    rangeLabel: 'Report both as a range: 15–20%, with the methodology difference explained',
    resolvedNote: 'You chose the vendor’s page · 14:11 · the other figure is noted in the report',
    onUseRecommendation: fn(),
    onReportRange: fn(),
    onUndo: fn(),
    onValueChange: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['open', 'resolved'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    options: { control: 'object' },
    value: { control: false },
    defaultValue: { control: 'text' },
    recommendation: { control: 'text' },
    rangeLabel: { control: 'text' },
    resolvedNote: { control: 'text' },
    onUseRecommendation: { control: false, table: { category: 'Events' } },
    onReportRange: { control: false, table: { category: 'Events' } },
    onUndo: { control: false, table: { category: 'Events' } },
    onValueChange: { control: false, table: { category: 'Events' } },
  },
})

/** Figma state open: the recommended option starts chosen. */
export const Default = meta.story()

Default.test('chooses an option, a range, and uses the recommendation', async ({ canvas, args }) => {
  await expect(canvas.getByRole('radio', { name: /Meridian pricing page/ })).toBeChecked()
  await userEvent.click(canvas.getByRole('radio', { name: /Compare-a-tool/ }))
  await expect(args.onValueChange).toHaveBeenCalledWith('compare')
  await userEvent.click(canvas.getByRole('radio', { name: /Report both as a range/ }))
  await expect(args.onValueChange).toHaveBeenCalledWith('range')
  await userEvent.click(canvas.getByRole('button', { name: 'Use recommendation' }))
  await expect(args.onUseRecommendation).toHaveBeenCalledOnce()
})

/** Figma state resolved: the chosen option is marked, and Undo. */
export const Resolved = meta.story({ args: { status: 'resolved', defaultValue: 'vendor' } })

Resolved.test('marks the chosen option and can be undone', async ({ canvas, args }) => {
  await expect(canvas.getByText('Chosen')).toBeVisible()
  await expect(canvas.getByRole('radio', { name: /Compare-a-tool/ })).toBeDisabled()
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
  await expect(args.onUndo).toHaveBeenCalledOnce()
})
