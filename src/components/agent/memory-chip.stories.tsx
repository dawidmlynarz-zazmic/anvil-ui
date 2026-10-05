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
  title: 'Agent Builder/Core Kit/System & Context/Memory Chip',
  component: MemoryChip,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Inline notice under a message when memory changes (`@/components/agent/memory-chip`): `status` saved · updated · forgotten sets the icon and label (`label` overrides it), the memory is the children, `action` is a ghost xs pill Button. role=status, so the change is announced.',
      },
    },
  },
  args: { status: 'saved' as const, children: 'Subtitle' },
  argTypes: { status: { control: 'inline-radio', options: STATUSES } },
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
