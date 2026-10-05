import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { FollowUpSuggestion, FollowUpSuggestions } from './follow-up-suggestions'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15663'

function Demo({
  layout = 'chips',
  count = 3,
  showLabel = true,
  onSelect,
}: {
  layout?: 'chips' | 'list'
  count?: number
  showLabel?: boolean
  onSelect?: (value: string) => void
}) {
  return (
    <FollowUpSuggestions layout={layout} label={showLabel ? 'Title' : null}>
      {Array.from({ length: count }, (_, i) => `Label ${i + 1}`).map((label) => (
        <FollowUpSuggestion key={label} onClick={() => onSelect?.(label)}>
          {label}
        </FollowUpSuggestion>
      ))}
    </FollowUpSuggestions>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Input/Follow-up Suggestions',
  tags: ['agent-block'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Next questions the user can send in one tap (`@/components/agent/follow-up-suggestions`). `FollowUpSuggestions` (`label`, `layout` chips · list) › `FollowUpSuggestion` buttons. A labelled list: screen readers hear the label and the count.',
      },
    },
  },
  args: { layout: 'chips', count: 3, showLabel: true, onSelect: fn() },
  argTypes: {
    layout: { control: 'inline-radio', options: ['chips', 'list'] },
    count: { control: { type: 'range', min: 1, max: 4 } },
  },
})

/** Layout, count and label are in Controls. */
export const Default = meta.story()

Default.test('a labelled list of suggestions that send on click', async ({ canvas, args }) => {
  await expect(canvas.getByRole('list', { name: 'Title' })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Label 2' }))
  await expect(args.onSelect).toHaveBeenCalledWith('Label 2')
})

/** Figma layout list. */
export const List = meta.story({ args: { layout: 'list' } })

/** Both Figma layouts. */
export const Layouts = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Demo {...args} layout="chips" />
      <Demo {...args} layout="list" />
    </div>
  ),
})
