import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon, FolderIcon, FolderPlusIcon, Trash2Icon } from './icon'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8257-3156'

function DemoMenu({ open }: { open?: boolean }) {
  const [radio, setRadio] = useState('1')
  const [checked, setChecked] = useState(true)
  return (
    <DropdownMenu open={open} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Title</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon={FolderPlusIcon} />
            Label 1<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={FolderIcon} />
            Label 2
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon icon={FolderIcon} />
              Label 3
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Label 1</DropdownMenuItem>
              <DropdownMenuItem>Label 2</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem disabled>
            <Icon icon={FolderIcon} />
            Label 4
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Title</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={radio} onValueChange={setRadio}>
          <DropdownMenuRadioItem value="1">Label 1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="2">Label 2</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
          Label
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem intent="destructive">
          <Icon icon={Trash2Icon} />
          Label
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const meta = {
  title: 'Components/Dropdown Menu',
  component: DemoMenu,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Menu of actions and options from a trigger (shadcn/ui DropdownMenu on Radix); the same items build the Context Menu. Figma item `type` → sub-component: default → `DropdownMenuItem`, radio → `DropdownMenuRadioItem` (check at the end), checkbox → `DropdownMenuCheckboxItem` (small switch at the end), destructive → `DropdownMenuItem intent="destructive"`. `DropdownMenuLabel` = Figma dropdown title.',
      },
    },
  },
  args: { open: true },
  argTypes: { open: { control: 'boolean' } },
} satisfies Meta<typeof DemoMenu>

export default meta
type Story = StoryObj<typeof meta>

const body = (el: HTMLElement) => within(el.ownerDocument.body)

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const menu = await body(canvasElement).findByRole('menu')
    await expect(within(menu).getByRole('menuitemradio', { name: 'Label 1' })).toHaveAttribute(
      'data-state',
      'checked',
    )
    await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Label' })).toBeChecked()
  },
}

/** Uncontrolled: opens from the trigger, arrow keys move the highlight, Escape closes. */
export const WithTrigger: Story = {
  args: { open: undefined },
  parameters: { docs: { story: { inline: true } } },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Label' })
    await userEvent.click(trigger)
    const menu = await body(canvasElement).findByRole('menu')
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(within(menu).getAllByRole('menuitem')[0]).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}
