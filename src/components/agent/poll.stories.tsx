import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Poll, type PollOption } from './poll'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-2310'

const OPTIONS: PollOption[] = [
  { value: 'offline', label: 'Offline mode', percent: 42 },
  { value: 'calendar', label: 'Calendar sync', percent: 23 },
  { value: 'sharing', label: 'Shared workspaces', percent: 21 },
  { value: 'export', label: 'Export to PDF', percent: 14 },
]

const meta = preview.meta({
  title: 'Agent Builder/Poll',
  tags: ['agent-builder', 'feedback'],
  component: Poll,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'vote · results', code: '`vote` / `defaultVote` / `onVote`' },
      { property: 'question', values: 'text', code: '`question` prop' },
      {
        property: 'options · results',
        values: 'label · percent',
        code: '`options` (`value`, `label`, `percent`)',
      },
      { property: 'meta', values: 'text', code: '`meta` prop' },
    ],
    guide: {
      use: [
        'One question with a few options where seeing what others chose is part of the value.',
        'Show results right after voting (`vote`), with the user’s choice marked.',
      ],
      avoid: [
        'Rating an answer or task: use Rating. Loyalty on 0–10: use NPS.',
        'Several questions: use Survey. Why an answer was bad: use Feedback Reason.',
        'The agent asking the user to choose how to proceed: use Clarifying Question.',
      ],
      content: [
        'Question: short and neutral (“Which feature should we build next?”).',
        'Two to five options, parallel in form and short (“Offline mode”, “Calendar sync”).',
        '`meta`: vote count and closing time (“128 votes · closes in 2 days”).',
      ],
      a11y: [
        'The poll is a `group` named by its question; options are buttons before voting.',
        'Results are a list named “Results”; the user’s choice says “(your vote)” in text, not only by colour.',
        'Percentages are text; the bars behind them are decorative.',
      ],
    },
    docs: {
      description: {
        component:
          'A single question with options (`@/components/agent/poll`): `options` as outline Buttons; once voted (`vote` / `defaultVote` / `onVote`) each shows a bar to its `percent`, the user’s choice highlighted. `meta` for votes and closing time. Composed from Card, Icon Tile, Button and Icon.',
      },
    },
  },
  args: {
    question: 'Which feature should we build next?',
    options: OPTIONS,
    meta: '128 votes · closes in 2 days',
    onVote: fn(),
  },
  argTypes: {
    question: { control: 'text' },
    meta: { control: 'text' },
    vote: { control: 'inline-radio', options: OPTIONS.map((o) => o.value) },
    options: { control: false },
    onVote: { control: false, table: { category: 'Events' } },
  },
})

/** Vote to see the results. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-120">
      <Poll {...args} />
    </div>
  ),
})

Default.test('voting shows the results', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Offline mode' }))
  await expect(args.onVote).toHaveBeenCalledWith('offline')
  const results = canvas.getByRole('list', { name: 'Results' })
  await expect(results).toHaveTextContent('Offline mode (your vote)42%')
})

/** Figma state: vote and results. */
export const States = meta.story({
  render: (args) => (
    <div className="flex w-120 flex-col gap-4">
      <Poll {...args} />
      <Poll {...args} defaultVote="offline" />
    </div>
  ),
})
