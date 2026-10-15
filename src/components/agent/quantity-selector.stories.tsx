import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { QuantitySelector } from './quantity-selector'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-16339'

const TYPES = [
  { id: 'adult', label: 'Adult', detail: '16+', price: 45 },
  { id: 'child', label: 'Child', detail: 'Under 16, with an adult', price: 30 },
  { id: 'concession', label: 'Concession', detail: 'Students, 65+, with ID', price: 38 },
]

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Quantity Selector',
  tags: ['agent-builder'],
  component: QuantitySelector,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'title · subtitle', values: 'text', code: '`title` · `subtitle`' },
      {
        property: 'rows (type, detail, price, stepper)',
        values: 'rows',
        code: '`types` (`label`, `detail`, `price`) with a Stepper each',
      },
      {
        property: 'summary · note · action',
        values: 'footer',
        code: 'the running total · `note` · `actionLabel` + `onAction`',
      },
    ],
    guide: {
      use: [
        'Choosing how many of each type before the next step: tickets by age, guests and rooms, party size, cart quantities.',
        'Set `maxTotal` for a per-order limit; steppers stop at what is left and the note says why.',
        'The action leads to the next step (“Find seats”) and stays off until something is chosen.',
      ],
      avoid: [
        'One plain number: use Stepper beside its label.',
        'Choosing a variant such as size or colour: use Choice Card or Select.',
        'Editing a basket with images and remove actions: use Order Summary.',
      ],
      content: [
        'The title is the question (“How many tickets?”); the subtitle says what, when and where.',
        'Each type has a short detail (“16+”, “Under 16, with an adult”) and its unit price.',
        'The note carries the limit and what is added later (“Max 8 per order · fees shown at checkout”).',
      ],
      a11y: [
        'Each stepper is a group named by its type (“Decrease Adult”, “Increase Adult”); the running total is a polite status region.',
        'The action is disabled, not hidden, until something is chosen.',
      ],
    },
    docs: {
      description: {
        component:
          'Types with steppers and a running total (`@/components/agent/quantity-selector`): `types` (label, detail, unit price) each with a Stepper, `maxTotal`, a footer summary, `note` and a primary action. `values` / `defaultValues` / `onValuesChange` hold the counts by type id. Built on Card, Shell Header / Footer, Stepper and Button.',
      },
    },
  },
  args: {
    title: 'How many tickets?',
    subtitle: 'Paper Kingdoms · Sat 17 Oct · 19:30',
    types: TYPES,
    defaultValues: { adult: 2 },
    maxTotal: 8,
    unit: 'ticket',
    note: 'Max 8 per order · fees shown at checkout',
    actionLabel: 'Find seats',
    onValuesChange: fn(),
    onAction: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    maxTotal: { control: 'number' },
    unit: { control: 'text' },
    currency: { control: 'text' },
    note: { control: 'text' },
    actionLabel: { control: 'text' },
    emptySummary: { control: 'text' },
    types: { control: false },
    values: { control: false },
    defaultValues: { control: false },
    onValuesChange: { control: false, table: { category: 'Events' } },
    onAction: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-145 max-w-full">
        <Story />
      </div>
    ),
  ],
})

export const Default = meta.story()

Default.test('counts, totals, respects the limit and acts', async ({ canvas, args }) => {
  await expect(canvas.getByText('2 tickets · $90.00')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Increase Child' }))
  await expect(canvas.getByText('3 tickets · $120.00')).toBeVisible()
  await expect(args.onValuesChange).toHaveBeenLastCalledWith({ adult: 2, child: 1 })
  await userEvent.click(canvas.getByRole('button', { name: 'Find seats' }))
  await expect(args.onAction).toHaveBeenCalledWith({ adult: 2, child: 1 })
})

/** Nothing chosen: the action waits. */
export const Empty = meta.story({ args: { defaultValues: {} } })

Empty.test('the action is disabled until something is chosen', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Find seats' })).toBeDisabled()
  await expect(canvas.getByText('Select tickets')).toBeVisible()
})

/** At the limit every “plus” is disabled. */
export const AtLimit = meta.story({ args: { defaultValues: { adult: 4, child: 2, concession: 2 } } })

AtLimit.test('no stepper can add more than the limit', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Increase Adult' })).toBeDisabled()
  await expect(canvas.getByRole('button', { name: 'Increase Concession' })).toBeDisabled()
  await expect(canvas.getByRole('button', { name: 'Decrease Adult' })).toBeEnabled()
})

/** Prices follow the locale, and `summary` writes the total for your language. */
export const German = meta.story({
  args: {
    locale: 'de-DE',
    currency: 'EUR',
    title: 'Wie viele Tickets?',
    subtitle: 'Paper Kingdoms · Sa 17. Okt · 19:30',
    note: 'Höchstens 8 pro Bestellung',
    actionLabel: 'Plätze suchen',
    emptySummary: 'Tickets wählen',
    summary: (count: number, total: string) => `${count} ${count === 1 ? 'Ticket' : 'Tickets'} · ${total}`,
    defaultValues: { adult: 2 },
  },
})

German.test('prices and the summary use German formatting', async ({ canvas }) => {
  await expect(canvas.getByText(/45,00\s€/)).toBeVisible()
  await expect(canvas.getByText(/2 Tickets · 90,00\s€/)).toBeVisible()
})
