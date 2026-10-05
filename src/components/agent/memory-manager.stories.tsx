import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'

import { MemoryManager, MemoryManagerItem, MemoryManagerSearch } from './memory-manager'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2779'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/System & Context/Memory Manager',
  tags: ['agent-block'],
  component: MemoryManager,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // Figma memory manager has no component properties.
    figmaProps: [],
    docs: {
      description: {
        component:
          'Review and manage what the assistant remembers (`@/components/agent/memory-manager`): `title`, `description`, the header Switch (`enabled` / `defaultEnabled` / `onEnabledChange`), `search` (`MemoryManagerSearch`), `MemoryManagerItem` rows (`tag`, `onEdit`, `onDelete`), and a footer `note` + `action`.',
      },
    },
  },
  args: {
    title: 'Title',
    description: 'Subtitle',
    note: 'Subtitle',
    onEnabledChange: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    note: { control: 'text' },
    enabled: { control: 'boolean' },
    defaultEnabled: { control: 'boolean' },
    search: { control: false },
    action: { control: false },
    onEnabledChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <MemoryManager
      {...args}
      className="max-w-130"
      search={<MemoryManagerSearch placeholder="Placeholder" />}
      action={
        <Button variant="ghost" intent="destructive" size="sm">
          Clear all
        </Button>
      }
    >
      {['Label 1', 'Label 2', 'Label 3', 'Label 4'].map((label) => (
        <MemoryManagerItem key={label} tag="Label" onEdit={() => {}} onDelete={() => {}}>
          {label}
        </MemoryManagerItem>
      ))}
    </MemoryManager>
  ),
})

/** Title, description, note and `enabled` are in Controls. */
export const Default = meta.story()

Default.test('the switch turns memory off', async ({ args, canvas }) => {
  const toggle = canvas.getByRole('switch', { name: 'Title' })
  await expect(toggle).toBeChecked()
  await userEvent.click(toggle)
  await expect(args.onEnabledChange).toHaveBeenCalledWith(false)
  await expect(canvas.getByRole('article')).toHaveAttribute('data-enabled', 'false')
})

Default.test('each memory has edit and delete', async ({ canvas }) => {
  await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
  await expect(canvas.getAllByRole('button', { name: 'Delete' })).toHaveLength(4)
  await expect(canvas.getByRole('searchbox', { name: 'Search memories' })).toBeVisible()
})

/** Memory off: the list stays readable in a muted tone. */
export const Off = meta.story({ args: { defaultEnabled: false } })
