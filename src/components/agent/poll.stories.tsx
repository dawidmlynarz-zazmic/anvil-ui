import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Poll, type PollOption } from './poll'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-2310'

const OPTIONS: PollOption[] = [
  { value: '1', label: 'Label 1', percent: 42 },
  { value: '2', label: 'Label 2', percent: 23 },
  { value: '3', label: 'Label 3', percent: 21 },
  { value: '4', label: 'Label 4', percent: 14 },
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
    docs: {
      description: {
        component:
          'A single question with options (`@/components/agent/poll`): `options` as outline Buttons; once voted (`vote` / `defaultVote` / `onVote`) each shows a bar to its `percent`, the user’s choice highlighted. `meta` for votes and closing time. Composed from Card, Icon Tile, Button and Icon.',
      },
    },
  },
  args: { question: 'Title', options: OPTIONS, meta: 'Subtitle', onVote: fn() },
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
  await userEvent.click(canvas.getByRole('button', { name: 'Label 1' }))
  await expect(args.onVote).toHaveBeenCalledWith('1')
  const results = canvas.getByRole('list', { name: 'Results' })
  await expect(results).toHaveTextContent('Label 1 (your vote)42%')
})

/** Figma state: vote and results. */
export const States = meta.story({
  render: (args) => (
    <div className="flex w-120 flex-col gap-4">
      <Poll {...args} />
      <Poll {...args} defaultVote="1" />
    </div>
  ),
})
