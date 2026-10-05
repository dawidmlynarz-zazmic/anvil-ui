import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Skeleton } from '@/components/ui/skeleton'

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
    figmaProps: [
      {
        property: 'label / show label',
        values: 'text · boolean',
        code: 'pass `label` or not (`showLabel` in this story)',
      },
      {
        property: 'suggestion 1 – 4',
        values: 'text',
        code: '`FollowUpSuggestion` children',
      },
      {
        property: 'show suggestion 3 / 4',
        values: 'boolean',
        code: 'how many `FollowUpSuggestion`s you render (`count` in this story)',
      },
      { property: 'layout', values: 'chips · list', code: '`layout` prop' },
    ],
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
    showLabel: { control: 'boolean' },
    onSelect: { control: false, table: { category: 'Events' } },
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

/** While the answer is still streaming: skeleton chips hold the space until the suggestions arrive. */
export const Loading = meta.story({
  render: () => (
    <FollowUpSuggestions label="Title" aria-busy="true">
      {['w-28', 'w-36', 'w-24'].map((width) => (
        <li key={width}>
          <Skeleton className={`h-8 ${width} rounded-full`} />
        </li>
      ))}
    </FollowUpSuggestions>
  ),
})

Loading.test('is marked busy and offers nothing to click yet', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=follow-up-suggestions]')).toHaveAttribute(
    'aria-busy',
    'true',
  )
  await expect(canvas.queryAllByRole('button')).toHaveLength(0)
})

/** After one is sent the set is disabled, so the same follow-up can't be sent twice. */
export const AfterChoice = meta.story({
  render: (args) => (
    <FollowUpSuggestions layout={args.layout} label="Title">
      {['Label 1', 'Label 2', 'Label 3'].map((label) => (
        <FollowUpSuggestion key={label} disabled>
          {label}
        </FollowUpSuggestion>
      ))}
    </FollowUpSuggestions>
  ),
})

AfterChoice.test('every suggestion is disabled', async ({ canvas }) => {
  for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled()
})

const LONG = 'A long follow-up question that wraps onto a second line in a narrow column'

/** Stress test: long suggestions in a narrow column wrap instead of overflowing. */
export const LongContent = meta.story({
  render: (args) => (
    <FollowUpSuggestions layout={args.layout} label="Title" className="max-w-80">
      <FollowUpSuggestion>{LONG}</FollowUpSuggestion>
      <FollowUpSuggestion>Label</FollowUpSuggestion>
    </FollowUpSuggestions>
  ),
})

LongContent.test('long suggestions stay inside the column', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=follow-up-suggestions]')!
  for (const button of root.querySelectorAll<HTMLElement>('button')) {
    await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
      root.getBoundingClientRect().right + 1,
    )
  }
})
