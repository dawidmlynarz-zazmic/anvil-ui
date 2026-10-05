import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from '@/components/ui/button'

import { MemoryChip } from './memory-chip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2778'

const STATUSES = ['saved', 'updated', 'forgotten'] as const

const manage = (
  <Button variant="ghost" intent="neutral" size="xs" shape="pill">
    Manage
  </Button>
)

const meta = preview.meta({
  title: 'Agent Primitives/System & Context/Memory Chip',
  tags: ['agent-primitive'],
  component: MemoryChip,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'memory', values: 'text', code: 'children' },
      { property: 'state', values: 'saved · updated · forgotten', code: '`status` prop' },
    ],
    docs: {
      description: {
        component:
          'Inline notice under a message when memory changes (`@/components/agent/memory-chip`): `status` saved · updated · forgotten sets the icon and label (`label` overrides it), the memory is the children, `action` is a ghost xs pill Button. role=status, so the change is announced.',
      },
    },
  },
  args: { status: 'saved' as const, children: 'Subtitle' },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    children: { control: 'text' },
    label: { control: 'text' },
    action: { control: false },
  },
  render: (args) => <MemoryChip {...args} action={manage} />,
})

/** Status and memory are in Controls. */
export const Default = meta.story()

Default.test('announces the change', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Saved to memory· Subtitle')
  await expect(canvas.getByRole('button', { name: 'Manage' })).toBeVisible()
})

/** Figma states: saved, updated, forgotten. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {STATUSES.map((status) => (
        <MemoryChip key={status} {...args} status={status} action={manage} />
      ))}
    </div>
  ),
})

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column wrap or truncate, never overflow. */
export const LongContent = meta.story({
  args: { children: `${LONG} ${UNBROKEN}` },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

LongContent.test('stays in its column and keeps text readable', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=memory-chip]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
    // A text block squeezed by its neighbours wraps one character per line.
    if (el.childElementCount === 0 && (el.textContent ?? '').length > 20) {
      await expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    }
  }
})
