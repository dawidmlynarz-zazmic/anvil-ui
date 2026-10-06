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
import { ArchiveIcon, FilePlusIcon, Icon, LinkIcon, SettingsIcon } from './icon'
import { Kbd } from './kbd'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10942-147'

function Items() {
  return (
    <>
      <CommandGroup heading="Title">
        <CommandItem>
          <Icon icon={FilePlusIcon} />
          New file<CommandShortcut>⌘N</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Icon icon={LinkIcon} />
          Copy link
        </CommandItem>
        <CommandItem disabled>
          <Icon icon={ArchiveIcon} />
          Archive
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Title">
        <CommandItem>
          <Icon icon={SettingsIcon} />
          Settings
        </CommandItem>
        <CommandItem>Log out</CommandItem>
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
function DemoCommand({ placeholder = 'Placeholder', search: initialSearch = '', ...props }: DemoProps) {
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
      <CommandEmpty>Subtitle</CommandEmpty>
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
      <CommandDialog open={open} onOpenChange={onOpenChange} title="Title" description="Subtitle">
        <CommandInput placeholder="Placeholder" />
        <CommandList>
          <Items />
        </CommandList>
        <CommandEmpty>Subtitle</CommandEmpty>
      </CommandDialog>
    </>
  )
}

// `open` / `onOpenChange` are args of the Palette story only (the palette's Dialog).
const meta = preview.type<{ args: PaletteProps }>().meta({
  title: 'UI Components/Command',
  tags: ['feature'],
  component: DemoCommand,
  parameters: {
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
    docs: {
      description: {
        component:
          'Search input + grouped, filterable items (shadcn/ui Command on cmdk). Items, headings and separators match the Dropdown Menu. In a Dialog it is the command palette (`CommandDialog`); in a Popover it is the Combobox.',
      },
    },
  },
  args: {
    placeholder: 'Placeholder',
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
  await userEvent.type(input, 'Settings')
  await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1))
  await expect(canvas.getByRole('option', { name: 'Settings' })).toHaveAttribute('data-selected', 'true')
})

/** Figma empty=true: a query with no results. */
export const Empty = meta.story({ args: { search: 'zzz' } })

Empty.test('shows the empty state on load', async ({ canvas }) => {
  await expect(canvas.getByRole('combobox')).toHaveValue('zzz')
  await expect(await canvas.findByText('Subtitle')).toBeVisible()
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
  const dialog = await body.findByRole('dialog', { name: 'Title' })
  await waitFor(() => expect(within(dialog).getByRole('combobox')).toHaveFocus())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
})
