import preview from '#.storybook/preview'
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
import { ArchiveIcon, CopyIcon, FilePlusIcon, Icon, ShareIcon, Trash2Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8257-3156'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  modal?: boolean
}

function DemoMenu({ open, onOpenChange, side = 'bottom', align = 'start', modal = false }: DemoProps) {
  const [radio, setRadio] = useState('1')
  const [checked, setChecked] = useState(true)
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" intent="neutral">
          Open menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align}>
        <DropdownMenuLabel>Title</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon={FilePlusIcon} />
            New file<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={CopyIcon} />
            Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon icon={ShareIcon} />
              Share
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem disabled>
            <Icon icon={ArchiveIcon} />
            Archive
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Title</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={radio} onValueChange={setRadio}>
          <DropdownMenuRadioItem value="1">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="2">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
          Show toolbar
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem intent="destructive">
          <Icon icon={Trash2Icon} />
          Delete<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const meta = preview.meta({
  title: 'UI Components/Dropdown Menu',
  tags: ['ui-component'],
  component: DemoMenu,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'dropdown menu · variant', values: 'default', code: 'nothing (single variant)' },
      {
        property: 'dropdown menu · show title / title',
        values: 'boolean · text',
        code: 'a `DropdownMenuLabel` or not',
      },
      {
        property: 'dropdown menu · show slot 1–3 / slot 1–3',
        values: 'boolean · slot',
        code: '`DropdownMenuContent` children (items, groups, separators)',
      },
      {
        property: 'dropdown item · type',
        values: 'default · radio · checkbox · destructive',
        code: '`DropdownMenuItem` · `DropdownMenuRadioItem` · `DropdownMenuCheckboxItem` · `DropdownMenuItem intent="destructive"`',
      },
      {
        property: 'dropdown item · state',
        values: 'default · highlighted · disabled',
        code: 'selectors: `data-[highlighted]:` · `data-[disabled]:` (not a prop; `disabled` prop on the item)',
      },
      { property: 'dropdown item · label', values: 'text', code: 'children' },
      {
        property: 'dropdown item · show prefix / prefix',
        values: 'boolean · slot',
        code: 'an `<Icon>` child before the label',
      },
      {
        property: 'dropdown item · show suffix / suffix',
        values: 'boolean · slot',
        code: 'a `DropdownMenuShortcut` (or the radio check / checkbox switch) after the label',
      },
      { property: 'dropdown item · help', values: 'boolean', code: 'nothing (no help part in code)' },
    ],
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Menu of actions and options from a trigger (shadcn/ui DropdownMenu on Radix); the same items build the Context Menu. Figma item `type` → sub-component: default → `DropdownMenuItem`, radio → `DropdownMenuRadioItem` (check at the end), checkbox → `DropdownMenuCheckboxItem` (small switch at the end), destructive → `DropdownMenuItem intent="destructive"`. `DropdownMenuLabel` = Figma dropdown title.',
      },
    },
  },
  args: { open: false, side: 'bottom', align: 'start', modal: false },
  argTypes: {
    open: { control: 'boolean' },
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    modal: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

const body = (el: HTMLElement) => within(el.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test(
  'trigger opens, arrow keys move the highlight, Escape closes',
  async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Open menu' })
    await userEvent.click(trigger)
    const menu = await body(canvasElement).findByRole('menu')
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(within(menu).getAllByRole('menuitem')[0]).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
)

/**
 * Open on load (Figma reference). Radix focuses the menu container (not an item) when a menu
 * opens without the keyboard, so nothing is highlighted until you interact.
 */
export const Open = meta.story({ args: { open: true } })

Open.test('shows radio and checkbox items checked, nothing highlighted', async ({ canvasElement }) => {
  const menu = await body(canvasElement).findByRole('menu')
  await expect(within(menu).getByRole('menuitemradio', { name: 'Top' })).toHaveAttribute(
    'data-state',
    'checked',
  )
  await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Show toolbar' })).toBeChecked()
  await expect(menu.querySelector('[data-highlighted]')).toBeNull()
})
