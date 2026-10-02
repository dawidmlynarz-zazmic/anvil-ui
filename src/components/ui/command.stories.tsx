import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
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
import { FolderIcon, FolderPlusIcon, Icon, SettingsIcon } from './icon'
import { Kbd } from './kbd'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10942-147'

function Items() {
  return (
    <>
      <CommandGroup heading="Title">
        <CommandItem>
          <Icon icon={FolderPlusIcon} />
          Label 1<CommandShortcut>⌘N</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Icon icon={FolderIcon} />
          Label 2
        </CommandItem>
        <CommandItem disabled>
          <Icon icon={FolderIcon} />
          Label 3
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Title">
        <CommandItem>
          <Icon icon={SettingsIcon} />
          Label 4
        </CommandItem>
        <CommandItem>Label 5</CommandItem>
      </CommandGroup>
    </>
  )
}

const meta = {
  title: 'Components/Command',
  component: Command,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Search input + grouped, filterable items (shadcn/ui Command on cmdk). Items, headings and separators match the Dropdown Menu. In a Dialog it is the command palette (`CommandDialog`); in a Popover it is the Combobox.',
      },
    },
  },
  render: () => (
    <Command className="w-80 inset-ring inset-ring-border">
      <CommandInput placeholder="Placeholder" />
      <CommandList>
        <Items />
      </CommandList>
      <CommandEmpty>Subtitle</CommandEmpty>
    </Command>
  ),
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

/** Figma empty=false. Typing filters; arrow keys move the highlight. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'Label 4')
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1))
    await expect(canvas.getByRole('option', { name: 'Label 4' })).toHaveAttribute('data-selected', 'true')
  },
}

/** Figma empty=true: no results. */
export const Empty: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'zzz')
    await expect(await canvas.findByText('Subtitle')).toBeVisible()
  },
}

/** The command palette: a Dialog with a Command, opened with ⌘K or the trigger. */
export const Palette: Story = {
  parameters: { docs: { story: { inline: false, height: '480px' } } },
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false)
      useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [])
      return (
        <>
          <Button variant="outline" intent="neutral" onClick={() => setOpen(true)}>
            Label <Kbd>⌘K</Kbd>
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen} title="Title" description="Subtitle">
            <CommandInput placeholder="Placeholder" />
            <CommandList>
              <Items />
            </CommandList>
            <CommandEmpty>Subtitle</CommandEmpty>
          </CommandDialog>
        </>
      )
    }
    return <Demo />
  },
  play: async ({ canvasElement }) => {
    await userEvent.keyboard('{Meta>}k{/Meta}')
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Title' })
    await expect(within(dialog).getByRole('combobox')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull())
  },
}
