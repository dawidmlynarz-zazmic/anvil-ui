import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'

import { MemoryManager, MemoryManagerItem, MemoryManagerSearch } from './memory-manager'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2779'

const MEMORIES = [
  { text: 'Prefers concise answers with bullet points', tag: 'Preference' },
  { text: 'Works in Pacific Time', tag: 'Preference' },
  { text: 'Team uses Issue Tracker for launch tasks', tag: 'Workspace' },
  { text: 'Leads the Northwind Sync launch at Northwind Labs', tag: 'Work' },
]

const meta = preview.meta({
  title: 'Agent Builder/Memory Manager',
  tags: ['agent-builder', 'memory'],
  component: MemoryManager,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // Figma memory manager has no component properties.
    figmaProps: [],
    guide: {
      use: [
        'In settings or a side panel, where the user reviews, edits and deletes what the assistant remembers about them.',
        'The header Switch turns memory off for future chats without deleting anything.',
        'Add `MemoryManagerSearch` once the list can grow past a screen.',
      ],
      avoid: [
        'Telling the user a memory was used, saved or forgotten in a chat: use Memory Notice inline.',
        'Project or persona instructions: show them in Instructions Banner and edit them in the project settings.',
      ],
      content: [
        'Title: “Memory”; description: what memory does in one sentence.',
        'Each item: one fact about the user in plain words, with a one-word `tag` (“Preference”, “Workspace”).',
        '`note`: the count and who can see it; the destructive `action` names the scope (“Clear all”), confirmed with Alert Dialog.',
      ],
      a11y: [
        'The Switch is labelled by the title, so it reads “Memory, on”.',
        'Memories are a list; the search field is a searchbox named “Search memories”.',
        'Rows keep `--muted-foreground` while memory is off instead of dropping opacity.',
      ],
    },
    docs: {
      description: {
        component:
          'Review and manage what the assistant remembers (`@/components/agent/memory-manager`): `title`, `description`, the header Switch (`enabled` / `defaultEnabled` / `onEnabledChange`), `search` (`MemoryManagerSearch`), `MemoryManagerItem` rows (`tag`, `onEdit`, `onDelete`), and a footer `note` + `action`.',
      },
    },
  },
  args: {
    title: 'Memory',
    description: 'Assistant remembers details from your chats to make answers more useful.',
    note: '4 memories · Only you can see them',
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
      search={<MemoryManagerSearch placeholder="Search memories" />}
      action={
        <Button variant="ghost" intent="destructive" size="sm">
          Clear all
        </Button>
      }
    >
      {MEMORIES.map((memory) => (
        <MemoryManagerItem key={memory.text} tag={memory.tag} onEdit={() => {}} onDelete={() => {}}>
          {memory.text}
        </MemoryManagerItem>
      ))}
    </MemoryManager>
  ),
})

/** Title, description, note and `enabled` are in Controls. */
export const Default = meta.story()

Default.test('the switch turns memory off', async ({ args, canvas }) => {
  const toggle = canvas.getByRole('switch', { name: 'Memory' })
  await expect(toggle).toBeChecked()
  await userEvent.click(toggle)
  await expect(args.onEnabledChange).toHaveBeenCalledWith(false)
  await expect(canvas.getByRole('article')).toHaveAttribute('data-enabled', 'false')
})

Default.test('each memory has edit and delete', async ({ canvas }) => {
  await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
  await expect(canvas.getAllByRole('button', { name: /^Delete / })).toHaveLength(4)
  await expect(canvas.getByRole('searchbox', { name: 'Search memories' })).toBeVisible()
})

/** Memory off: the list stays readable in a muted tone. */
export const Off = meta.story({ args: { defaultEnabled: false } })

Default.test('each row’s buttons are named after the memory', async ({ canvas }) => {
  await expect(
    canvas.getByRole('button', { name: 'Edit Prefers concise answers with bullet points' }),
  ).toBeInTheDocument()
})
