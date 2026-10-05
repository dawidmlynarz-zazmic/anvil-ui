import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ClarifyingQuestion } from './clarifying-question'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10732-2911'

const OPTIONS = [1, 2, 3, 4].map((i) => ({ value: `label-${i}`, label: `Label ${i}` }))

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Input/Clarifying Question',
  tags: ['agent-block'],
  component: ClarifyingQuestion,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'unanswered · answered',
        code: '`value` / `defaultValue` set or not (not a prop)',
      },
    ],
    docs: {
      description: {
        component:
          'One tappable question from the agent (`@/components/agent/clarifying-question`): `title`, `description`, `options` ({ value, label }), `value` / `defaultValue` / `onValueChange`, `onSkip`, `hint`. Number keys pick an option while focus is in the card. Once answered (Figma state answered) it collapses to the answer with Change.',
      },
    },
  },
  args: { title: 'Title', description: 'Subtitle', options: OPTIONS, onValueChange: fn(), onSkip: fn() },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    hint: { control: 'text' },
    options: { control: 'object' },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
    onValueChange: { control: false, table: { category: 'Events' } },
    onSkip: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="w-140">
      <ClarifyingQuestion {...args} />
    </div>
  ),
})

/** Figma state unanswered. */
export const Default = meta.story()

Default.test('choosing an option answers; Change reopens', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Label 2/ }))
  await expect(args.onValueChange).toHaveBeenCalledWith('label-2')
  await expect(canvas.getByText('Answered')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Change' }))
  await expect(canvas.getByRole('button', { name: /Label 3/ })).toBeVisible()
})

Default.test('number keys pick an option', async ({ args }) => {
  await userEvent.tab()
  await userEvent.keyboard('3')
  await expect(args.onValueChange).toHaveBeenCalledWith('label-3')
})

/** Figma state answered. */
export const Answered = meta.story({ args: { defaultValue: 'label-2' } })
