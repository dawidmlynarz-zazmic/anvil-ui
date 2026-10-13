import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ProgressStep, ProgressSteps } from './progress-steps'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10851-5335'

const STATUSES = ['done', 'current', 'warning', 'failed', 'upcoming'] as const

function Steps({ variant }: { variant: 'dots' | 'bars' }) {
  return (
    <ProgressSteps variant={variant} className="w-120">
      <ProgressStep status="done" label="Stage" meta="Mon 28 Sep" />
      <ProgressStep status="done" label="Stage" meta="Tue 29 Sep" />
      <ProgressStep status="current" label="Stage" meta="Wed 30 Sep" />
      <ProgressStep status="upcoming" label="Stage" meta="Thu 1 Oct" />
    </ProgressSteps>
  )
}

const meta = preview.meta({
  title: 'Design System/Atoms/Progress Steps',
  tags: ['atom'],
  component: Steps,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'style', values: 'dots · bars', code: '`ProgressSteps` `variant` prop' },
      {
        property: 'state',
        values: 'done · current · warning · failed · upcoming',
        code: '`ProgressStep` `status` prop',
      },
      {
        property: 'position',
        values: 'first · middle · last',
        code: 'not a prop: `:first-child` / `:last-child` drop the outer line',
      },
      {
        property: 'label · meta · show meta',
        values: 'text · text · boolean',
        code: '`label` · `meta` (pass it or not)',
      },
    ],
    guide: {
      use: [
        'The stages of one process that the user follows: an order (placed → shipped → delivered), a claim, a booking.',
        '3–5 steps in a row; dots with connectors for a journey, bars for a compact, segmented progress.',
        'Show dates or notes as `meta` when stages have them.',
      ],
      avoid: [
        'A quantity control (the numeric stepper): use Input Group with Buttons.',
        'A list of dated events: use Timeline.',
        'A single percentage: use Progress.',
      ],
      content: [
        'Labels are short nouns or past participles (“Booked”, “Shipped”); meta is a date or short time.',
        'Only one step is `current`; use `warning` or `failed` for the stage that needs attention.',
      ],
      a11y: [
        'It is an ordered list; the current step is `aria-current="step"`.',
        'Each step also says its status in words (visually hidden), so colour and glyph are never the only signal.',
      ],
    },
    docs: {
      description: {
        component:
          'The stages of a process (`@/components/anvil/progress-steps`): `ProgressSteps` (`variant` dots · bars) of `ProgressStep` (`status` done · current · warning · failed · upcoming, `label`, `meta`). Not the numeric stepper control.',
      },
    },
  },
  args: { variant: 'dots' as const },
  argTypes: { variant: { control: 'inline-radio', options: ['dots', 'bars'] } },
  render: (args) => <Steps {...args} />,
})

/** Dots or bars is in Controls. */
export const Default = meta.story()

Default.test('the current step is marked and every step says its status', async ({ canvas }) => {
  await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
  await expect(canvas.getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'step')
  await expect(canvas.getAllByText('(completed)')).toHaveLength(2)
})

/** Figma state × position: every status as dots (first, middle, last) and as bars. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-8">
      {STATUSES.map((status) => (
        <div key={status} className="flex flex-col gap-4">
          <ProgressSteps className="w-90">
            <ProgressStep status={status} label={status} meta="Mon 28 Sep" />
            <ProgressStep status={status} label={status} meta="Mon 28 Sep" />
            <ProgressStep status={status} label={status} meta="Mon 28 Sep" />
          </ProgressSteps>
          <ProgressSteps variant="bars" className="w-90">
            <ProgressStep status={status} label={status} meta="Mon 28 Sep" />
          </ProgressSteps>
        </div>
      ))}
    </div>
  ),
})

/** Without meta. */
export const WithoutMeta = meta.story({
  render: () => (
    <ProgressSteps className="w-120">
      <ProgressStep status="done" label="Placed" />
      <ProgressStep status="current" label="Shipped" />
      <ProgressStep status="upcoming" label="Delivered" />
    </ProgressSteps>
  ),
})
