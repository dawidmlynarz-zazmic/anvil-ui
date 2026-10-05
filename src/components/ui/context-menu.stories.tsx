import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu'
import { ArchiveIcon, CopyIcon, Icon, PencilIcon, ShareIcon, Trash2Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10951-40097'

type DemoProps = {
  modal?: boolean
  onSelect?: () => void
}

function DemoContextMenu({ modal = true, onSelect }: DemoProps) {
  return (
    <ContextMenu modal={modal}>
      <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-lg border border-dashed border-border-strong type-text-sm-normal text-muted-foreground">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onSelect}>
          <Icon icon={PencilIcon} />
          Edit<ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Icon icon={CopyIcon} />
          Duplicate<ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          <Icon icon={ArchiveIcon} />
          Archive
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Icon icon={ShareIcon} />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Message</ContextMenuItem>
            <ContextMenuItem>Copy link</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuLabel>Title</ContextMenuLabel>
        <ContextMenuRadioGroup value="1">
          <ContextMenuRadioItem value="1">Top</ContextMenuRadioItem>
          <ContextMenuRadioItem value="2">Bottom</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuCheckboxItem checked>Show toolbar</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem intent="destructive">
          <Icon icon={Trash2Icon} />
          Delete<ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const meta = preview.meta({
  title: 'UI Components/Context Menu',
  tags: ['ui-component'],
  component: DemoContextMenu,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // Figma `context menu` is an example, not a component; its items are Dropdown Menu `dropdown item`s.
    figmaProps: [
      {
        property: 'dropdown item · type',
        values: 'default · radio · checkbox · destructive',
        code: '`ContextMenuItem` / `ContextMenuRadioItem` / `ContextMenuCheckboxItem` / `ContextMenuItem intent="destructive"`',
      },
      {
        property: 'dropdown item · state',
        values: 'default · highlighted · disabled',
        code: 'selectors: `data-[highlighted]:` · `data-[disabled]:` (not a prop)',
      },
      { property: 'dropdown item · label', values: 'text', code: 'children' },
      { property: 'dropdown item · help', values: 'boolean', code: 'nothing (no help part in code)' },
      {
        property: 'dropdown item · show prefix · prefix',
        values: 'boolean · slot',
        code: 'an `<Icon>` child before the label',
      },
      {
        property: 'dropdown item · show suffix · suffix',
        values: 'boolean · slot',
        code: '`ContextMenuShortcut` (or the radio check / checkbox switch) after the label',
      },
    ],
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'A Dropdown Menu opened by right-click or long-press on an area instead of a button (shadcn/ui Context Menu on Radix). Same items, titles, separators, submenus, radio and checkbox items and `intent="destructive"` as Dropdown Menu, drawn with the shared menu styles. Radix opens it at the pointer; it has no `open` prop, so right-click the area to see it (Dropdown Menu shows the same items open).',
      },
    },
  },
  args: { modal: true, onSelect: fn() },
  argTypes: { modal: { control: 'boolean' }, onSelect: { control: false, table: { category: 'Events' } } },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** The area at rest: right-click (or long-press) it. */
export const Default = meta.story()

Default.test('right-click opens it; an item runs and closes it', async ({ canvas, canvasElement, args }) => {
  await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Right-click here') })
  const menu = await body(canvasElement).findByRole('menu')
  await expect(within(menu).getByRole('menuitem', { name: 'Archive' })).toHaveAttribute('data-disabled')
  await expect(within(menu).getByRole('menuitemradio', { name: 'Top' })).toBeChecked()
  await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Show toolbar' })).toBeChecked()
  await userEvent.click(within(menu).getByRole('menuitem', { name: /^Edit/ }))
  await expect(args.onSelect).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
})

Default.test('arrow keys open the submenu; Escape closes', async ({ canvas, canvasElement }) => {
  await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Right-click here') })
  const menu = await body(canvasElement).findByRole('menu')
  within(menu).getByRole('menuitem', { name: 'Share' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  const subItem = await body(canvasElement).findByRole('menuitem', { name: 'Email' })
  await waitFor(() => expect(subItem).toBeVisible())
  await userEvent.keyboard('{Escape}')
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
})
