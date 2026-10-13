import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { InsightCard } from './insight-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10714-605'

const meta = preview.meta({
  title: 'Agent Builder/Evidence & decisions/Insight Card',
  tags: ['agent-builder'],
  component: InsightCard,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'confidence', values: 'high · medium · low', code: '`confidence` prop' },
      {
        property: 'state',
        values: 'default · conflicting',
        code: 'conflicting = `conflict` is set (the note, and Compare sources instead of Exclude)',
      },
      {
        property: 'supported by · contradicted by',
        values: 'citation chips',
        code: '`supports` · `contradicts` props',
      },
      {
        property: 'footer',
        values: 'dig deeper · exclude / compare · count',
        code: '`onDigDeeper` · `onExclude` / `onCompare` · `count`',
      },
    ],
    guide: {
      use: [
        'A single claim the agent is making, with how sure it is and the sources behind it: findings, anomalies, review summaries.',
        'Show contradicting sources next to supporting ones, and say how the agent weighed them.',
        'Give the user a way to look closer (Dig deeper) or remove the claim (Exclude).',
      ],
      avoid: [
        'A decision between two values: use Conflict Resolver.',
        'A list of claims across sources: use Criteria Matrix.',
        'A source with its own excerpt: use Source Card.',
      ],
      content: [
        'The statement is one plain sentence with the figure in it. The context line says what kind of insight it is.',
        'The conflict note names the sources and the reason for the weighting (“I weighted the pricing page higher because it is current”).',
      ],
      a11y: [
        'Confidence is a Badge with words (“High confidence”); each citation chip also names its source and confidence.',
        'The conflict note is a note, not an alert, so it does not interrupt.',
      ],
    },
    docs: {
      description: {
        component:
          'A claim with its confidence and evidence (`@/components/agent/insight-card`): `context`, `confidence`, `statement`, `supports`, `contradicts`, `conflict`, `count`, `onDigDeeper`, `onExclude`, `onCompare`.',
      },
    },
  },
  args: {
    context: 'Insight · pricing',
    confidence: 'high' as const,
    statement: 'Annual billing lowers the per-seat price by about 20% at four of the five tools compared.',
    supports: [
      { index: 1, confidence: 'high' as const },
      { index: 4, confidence: 'high' as const },
      { index: 7, confidence: 'medium' as const },
    ],
    count: '3 sources',
    onDigDeeper: fn(),
    onExclude: fn(),
    onCompare: fn(),
  },
  argTypes: {
    context: { control: 'text' },
    confidence: { control: 'inline-radio', options: ['high', 'medium', 'low'] },
    statement: { control: 'text' },
    supports: { control: 'object' },
    contradicts: { control: 'object' },
    conflict: { control: 'text' },
    count: { control: 'text' },
    onDigDeeper: { control: false, table: { category: 'Events' } },
    onExclude: { control: false, table: { category: 'Events' } },
    onCompare: { control: false, table: { category: 'Events' } },
  },
})

/** Figma state default. */
export const Default = meta.story()

Default.test('says its confidence and offers Dig deeper and Exclude', async ({ canvas, args }) => {
  await expect(canvas.getByText('High confidence', { selector: '[data-slot=badge]' })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Dig deeper' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Exclude' }))
  await expect(args.onDigDeeper).toHaveBeenCalledOnce()
  await expect(args.onExclude).toHaveBeenCalledOnce()
})

/** Figma state conflicting: contradicting sources, the note, and Compare sources. */
export const Conflicting = meta.story({
  args: {
    confidence: 'medium',
    contradicts: [{ index: 12, confidence: 'medium' }],
    conflict:
      'Sources disagree: one comparison site puts the annual discount at 15%. I weighted the vendors’ own pricing pages higher because they are current.',
    count: '4 sources',
  },
})

Conflicting.test('shows the conflict and compares', async ({ canvas, args }) => {
  await expect(canvas.getByRole('note')).toHaveTextContent('Sources disagree')
  await expect(canvas.queryByRole('button', { name: 'Exclude' })).toBeNull()
  await userEvent.click(canvas.getByRole('button', { name: 'Compare sources' }))
  await expect(args.onCompare).toHaveBeenCalledOnce()
})

/** Figma confidence: high, medium, low. */
export const Confidence = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['high', 'medium', 'low'] as const).map((confidence) => (
        <InsightCard key={confidence} {...args} confidence={confidence} />
      ))}
    </div>
  ),
})
