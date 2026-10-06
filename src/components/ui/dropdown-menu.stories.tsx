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
import { ArchiveIcon, EllipsisIcon, FolderInputIcon, Icon, PencilIcon, ShareIcon, Trash2Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8257-3156'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  modal?: boolean
}

function DemoMenu({ open, onOpenChange, side = 'bottom', align = 'start', modal = false }: DemoProps) {
  const [style, setStyle] = useState('concise')
  const [checked, setChecked] = useState(true)
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" intent="neutral" size="icon-sm" aria-label="Conversation actions">
          <Icon icon={EllipsisIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align}>
        <DropdownMenuLabel>Q3 launch plan</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon={PencilIcon} />
            Rename<DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon icon={ShareIcon} />
              Share
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Mail</DropdownMenuItem>
              <DropdownMenuItem>Chat</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem disabled>
            <Icon icon={FolderInputIcon} />
            Move to project
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={ArchiveIcon} />
            Archive
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Response style</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={style} onValueChange={setStyle}>
          <DropdownMenuRadioItem value="concise">Concise</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="detailed">Detailed</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
          Pin to sidebar
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem intent="destructive">
          <Icon icon={Trash2Icon} />
          Delete<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const meta = preview.meta({
  title: 'Molecules/Dropdown Menu',
  tags: ['molecule'],
  component: DemoMenu,
  parameters: {
    shadcn: 'dropdown-menu',
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
    guide: {
      use: [
        'Secondary actions on one object behind a “More actions” button: Rename, Share, Archive, Delete on a conversation.',
        'A few view options next to those actions: radio items for one choice, checkbox items for toggles.',
        'The menu half of a split button (Button Group).',
      ],
      avoid: [
        'Picking a form value: use Select (short list) or Combobox (searchable).',
        'Rich content or forms in the layer: use Popover. A searchable list of commands: use Command.',
        'The only, primary action of a view: show it as a Button.',
      ],
      content: [
        'Items are short verbs in sentence case; group related items and put destructive ones last, after a separator.',
        'A `DropdownMenuLabel` names the object or the group (“Q3 launch plan”, “Response style”).',
        'Disable items that don’t apply right now instead of hiding them, so the menu stays predictable.',
      ],
      a11y: [
        'The trigger gets `aria-haspopup` and `aria-expanded`; icon-only triggers need an `aria-label`.',
        'Arrow keys move, typing jumps to an item, Right / Left open and close submenus, Escape returns focus to the trigger.',
        'Radio and checkbox items announce their state; shortcuts are visual hints only.',
      ],
    },
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
    const trigger = canvas.getByRole('button', { name: 'Conversation actions' })
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
  await expect(within(menu).getByRole('menuitemradio', { name: 'Concise' })).toHaveAttribute(
    'data-state',
    'checked',
  )
  await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Pin to sidebar' })).toBeChecked()
  await expect(menu.querySelector('[data-highlighted]')).toBeNull()
})
