import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { OpenItem, OpenItems } from './open-items'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10714-943'
const FIGMA_ITEM = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10714-963'

const meta = preview.meta({
  title: 'Agent Builder/Evidence & decisions/Open Items',
  tags: ['agent-builder'],
  component: OpenItems,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state (card)', values: 'open · resolved', code: '`status` prop' },
      {
        property: 'state (item)',
        values: 'open · searching · accepted',
        code: '`OpenItem` `status` prop (hover and focus are selectors)',
      },
      {
        property: 'size',
        values: 'default · compact',
        code: '`OpenItem` `size` prop (compact stacks the actions)',
      },
      { property: 'footer', values: 'note · continue', code: '`note` · `onContinue`, `continueLabel`' },
    ],
    guide: {
      use: [
        'A list of things the agent could not settle: missing details, unverified data, blocked steps.',
        'Each item offers ways to resolve it (broaden the search, add a source) or to accept the gap.',
        'Let the user continue with gaps, and say that accepted gaps are listed as limitations.',
      ],
      avoid: [
        'A disagreement between two values: use Conflict Resolver.',
        'A list of tasks to do: use Task Plan.',
        'A single missing field in a form: use the Field error.',
      ],
      content: [
        'Titles name the unknown (“2030 cell capacity for Hungary and Poland”); the description says what is missing and what would resolve it.',
        'Accepted: “Accepted · noted in report”, with Undo.',
      ],
      a11y: [
        'Items are a named list; the state is in words (the search line is a status, accepted is a text Badge), not only the glyph.',
        'All actions are buttons with names.',
      ],
    },
    docs: {
      description: {
        component:
          'Unresolved items that need a decision (`@/components/agent/open-items`, on Task Card): `OpenItems` (`status` open · resolved, `note`, `onContinue`) with `OpenItem` rows (`status` open · searching · accepted, `size`, `title`, `description`, `progress`, actions).',
      },
    },
  },
  args: {
    status: 'open' as const,
    title: 'Knowledge gaps',
    subtitle: '3 things I couldn’t verify',
    note: 'Gaps you accept are listed as limitations in the report.',
    onContinue: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['open', 'resolved'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    note: { control: 'text' },
    continueLabel: { control: 'text' },
    children: { control: false },
    onContinue: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <OpenItems {...args}>
      <OpenItem
        title="Enterprise price for the largest vendor"
        description="Only list prices found; no independent source confirms the negotiated rates."
        onBroaden={fn()}
        onAddSource={fn()}
        onAccept={fn()}
      />
      <OpenItem
        status="searching"
        title="Storage limits on free plans after 2025"
        description="Vendors’ pages differ by more than 20%."
        progress="Searching 6 more sources…"
      />
      <OpenItem
        status="accepted"
        title="Effect of regional taxes on seat prices"
        description="Outside the agreed scope; flagged as a limitation in the report."
        onUndo={fn()}
      />
    </OpenItems>
  ),
})

/** Figma state open: one item in each state. */
export const Default = meta.story()

Default.test('each item acts on its own', async ({ canvas, args }) => {
  await expect(canvas.getByText('Needs a decision')).toBeVisible()
  await expect(canvas.getByRole('status')).toHaveTextContent('Searching 6 more sources…')
  await userEvent.click(canvas.getByRole('button', { name: 'Accept gap' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Continue with gaps' }))
  await expect(args.onContinue).toHaveBeenCalledOnce()
})

/** Figma state resolved: every gap accepted or closed. */
export const Resolved = meta.story({
  args: {
    status: 'resolved',
    subtitle: 'All gaps handled',
    note: '3 limitations will be listed in the report.',
  },
  render: (args) => (
    <OpenItems {...args}>
      {[
        'Enterprise price for the largest vendor',
        'Storage limits on free plans after 2025',
        'Effect of regional taxes on seat prices',
      ].map((title) => (
        <OpenItem
          key={title}
          status="accepted"
          title={title}
          description="Flagged as a limitation in the report."
          onUndo={fn()}
        />
      ))}
    </OpenItems>
  ),
})

Resolved.test('says resolved and continues', async ({ canvas }) => {
  await expect(canvas.getByText('Resolved')).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible()
})

/** Figma size compact: the actions stack (a narrow column). */
export const Compact = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_ITEM } },
  render: () => (
    <ul className="flex w-72 flex-col gap-3">
      <OpenItem
        size="compact"
        title="Enterprise price"
        description="Only list prices found."
        onBroaden={fn()}
        onAddSource={fn()}
        onAccept={fn()}
      />
      <OpenItem
        size="compact"
        status="searching"
        title="Storage limits"
        description="Vendors differ."
        progress="Searching 6 more sources…"
      />
      <OpenItem
        size="compact"
        status="accepted"
        title="Regional taxes"
        description="Outside the agreed scope."
        onUndo={fn()}
      />
    </ul>
  ),
})
