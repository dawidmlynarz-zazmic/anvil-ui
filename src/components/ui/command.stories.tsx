import preview from '#.storybook/preview'
import { useEffect, useState, type ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command'
import {
  ArchiveIcon,
  Icon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  PaperclipIcon,
  PlugIcon,
  SearchIcon,
  SettingsIcon,
} from './icon'
import { Kbd } from './kbd'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10942-147'

function Items() {
  return (
    <>
      <CommandGroup heading="Actions">
        <CommandItem>
          <Icon icon={MessageSquarePlusIcon} />
          New chat<CommandShortcut>⌘N</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Icon icon={SearchIcon} />
          Search conversations<CommandShortcut>⌘F</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Icon icon={PaperclipIcon} />
          Attach file
        </CommandItem>
        <CommandItem disabled>
          <Icon icon={ArchiveIcon} />
          Archive conversation
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Recent conversations">
        <CommandItem>
          <Icon icon={MessageSquareIcon} />
          Q3 launch plan
        </CommandItem>
        <CommandItem>
          <Icon icon={MessageSquareIcon} />
          Competitor pricing research
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem>
          <Icon icon={SettingsIcon} />
          Open settings<CommandShortcut>⌘,</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Icon icon={PlugIcon} />
          Connect an app
        </CommandItem>
      </CommandGroup>
    </>
  )
}

type DemoProps = Pick<ComponentProps<typeof Command>, 'loop' | 'shouldFilter' | 'disablePointerSelection'> & {
  placeholder?: string
  /** Story-only: the search text the input starts with (Figma `empty=true` → a query with no results). */
  search?: string
}

/** A standalone Command; the input is controlled so a story can start with a query. */
function DemoCommand({
  placeholder = 'Search commands and conversations…',
  search: initialSearch = '',
  ...props
}: DemoProps) {
  const [search, setSearch] = useState(initialSearch)
  // The control changed: follow it (state adjusted during render, not in an effect).
  const [prev, setPrev] = useState(initialSearch)
  if (prev !== initialSearch) {
    setPrev(initialSearch)
    setSearch(initialSearch)
  }
  return (
    <Command className="w-80 inset-ring inset-ring-border" {...props}>
      <CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} />
      <CommandList>
        <Items />
      </CommandList>
      <CommandEmpty>No results. Try a different search.</CommandEmpty>
    </Command>
  )
}

type PaletteProps = { open?: boolean; onOpenChange?: (open: boolean) => void }

/** The command palette: a Dialog with a Command, toggled with ⌘K / Ctrl+K or the trigger. */
function DemoPalette({ open = false, onOpenChange }: PaletteProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange?.(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])
  return (
    <>
      <Button variant="outline" intent="neutral" onClick={() => onOpenChange?.(true)}>
        Open command palette <Kbd>⌘K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Command palette"
        description="Search for a command or a conversation"
      >
        <CommandInput placeholder="Search commands and conversations…" />
        <CommandList>
          <Items />
        </CommandList>
        <CommandEmpty>No results. Try a different search.</CommandEmpty>
      </CommandDialog>
    </>
  )
}

// `open` / `onOpenChange` are args of the Palette story only (the palette's Dialog).
const meta = preview.type<{ args: PaletteProps }>().meta({
  title: 'Organisms/Command',
  tags: ['organism'],
  component: DemoCommand,
  parameters: {
    shadcn: 'command',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'placeholder', values: 'text', code: '`CommandInput` `placeholder` prop' },
      {
        property: 'empty',
        values: 'false · true',
        code: '`CommandEmpty` shows when the search matches nothing (not a prop)',
      },
    ],
    guide: {
      use: [
        'The command palette (`CommandDialog`, ⌘K): jump to any action or conversation by typing.',
        'A searchable list of many options inside another surface; in a Popover it becomes the Combobox.',
        'Group items by kind (“Actions”, “Recent conversations”, “Settings”) and show shortcuts with `CommandShortcut`.',
      ],
      avoid: [
        'A short, fixed list of actions on a trigger: use Dropdown Menu. Picking one value in a form: use Select or Combobox.',
        'The app’s main navigation: use Sidebar. Filtering results shown on the page: use a search field (Input Group).',
      ],
      content: [
        'Items are verbs or the object’s name: “New chat”, “Search conversations”, “Open settings”, “Q3 launch plan”.',
        'Placeholder says what can be searched (“Search commands and conversations…”). Empty: “No results. Try a different search.”',
      ],
      a11y: [
        'cmdk gives the input `role="combobox"` and the items `role="option"`; arrow keys move the highlight, Enter runs it.',
        '`CommandDialog` needs a `title` (visually hidden) so the dialog is named; focus starts in the input and Escape closes it.',
        'Disabled items are skipped by the keyboard; don’t rely on the shortcut alone to describe an item.',
      ],
    },
    docs: {
      description: {
        component:
          'Search input + grouped, filterable items (shadcn/ui Command on cmdk). Items, headings and separators match the Dropdown Menu. In a Dialog it is the command palette (`CommandDialog`); in a Popover it is the Combobox.',
      },
    },
  },
  args: {
    placeholder: 'Search commands and conversations…',
    search: '',
    loop: false,
    shouldFilter: true,
    disablePointerSelection: false,
  },
  argTypes: {
    placeholder: { control: 'text' },
    search: { control: 'text', description: 'Search text in the input (story-only)' },
    loop: { control: 'boolean' },
    shouldFilter: { control: 'boolean' },
    disablePointerSelection: { control: 'boolean' },
  },
})

/** Figma empty=false. Typing filters; arrow keys move the highlight. */
export const Default = meta.story()

Default.test('typing filters and highlights the match', async ({ canvas }) => {
  const input = canvas.getByRole('combobox')
  await userEvent.type(input, 'Open settings')
  await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1))
  await expect(canvas.getByRole('option', { name: /^Open settings/ })).toHaveAttribute('data-selected', 'true')
})

/** Figma empty=true: a query with no results. */
export const Empty = meta.story({ args: { search: 'roadmap' } })

Empty.test('shows the empty state on load', async ({ canvas }) => {
  await expect(canvas.getByRole('combobox')).toHaveValue('roadmap')
  await expect(await canvas.findByText('No results. Try a different search.')).toBeVisible()
  await expect(canvas.queryAllByRole('option')).toHaveLength(0)
})

/** The command palette: a Dialog with a Command, opened with ⌘K or the trigger. */
export const Palette = meta.story({
  parameters: { docs: { story: { inline: false, height: '480px' } } },
  args: { open: false },
  argTypes: {
    open: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <DemoPalette open={args.open} onOpenChange={args.onOpenChange} />,
})

Palette.test('⌘K opens it with focus in the search, Escape closes it', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.keyboard('{Meta>}k{/Meta}')
  const dialog = await body.findByRole('dialog', { name: 'Command palette' })
  await waitFor(() => expect(within(dialog).getByRole('combobox')).toHaveFocus())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
})
