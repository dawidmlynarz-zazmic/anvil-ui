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
import { CopyIcon, Icon, PencilIcon, ShareIcon, Trash2Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10951-40097'

type DemoProps = {
  modal?: boolean
  onSelect?: () => void
}

function DemoContextMenu({ modal = true, onSelect }: DemoProps) {
  return (
    <ContextMenu modal={modal}>
      <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-lg border border-dashed border-border-strong type-text-sm-normal text-muted-foreground">
        Label
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onSelect}>
          <Icon icon={PencilIcon} />
          Label 1<ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Icon icon={CopyIcon} />
          Label 2
        </ContextMenuItem>
        <ContextMenuItem disabled>
          <Icon icon={CopyIcon} />
          Label 3
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Icon icon={ShareIcon} />
            Label 4
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Label 5</ContextMenuItem>
            <ContextMenuItem>Label 6</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuLabel>Title</ContextMenuLabel>
        <ContextMenuRadioGroup value="1">
          <ContextMenuRadioItem value="1">Label 7</ContextMenuRadioItem>
          <ContextMenuRadioItem value="2">Label 8</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuCheckboxItem checked>Label 9</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem intent="destructive">
          <Icon icon={Trash2Icon} />
          Label 10
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const meta = preview.meta({
  title: 'Components/Context Menu',
  component: DemoContextMenu,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'A Dropdown Menu opened by right-click or long-press on an area instead of a button (shadcn/ui Context Menu on Radix). Same items, titles, separators, submenus, radio and checkbox items and `intent="destructive"` as Dropdown Menu, drawn with the shared menu styles. Radix opens it at the pointer; it has no `open` prop, so right-click the area to see it (Dropdown Menu shows the same items open).',
      },
    },
  },
  args: { modal: true, onSelect: fn() },
  argTypes: { onSelect: { table: { disable: true } } },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** The area at rest: right-click (or long-press) it. */
export const Default = meta.story()

Default.test('right-click opens it; an item runs and closes it', async ({ canvas, canvasElement, args }) => {
  await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Label') })
  const menu = await body(canvasElement).findByRole('menu')
  await expect(within(menu).getByRole('menuitem', { name: /^Label 3/ })).toHaveAttribute('data-disabled')
  await expect(within(menu).getByRole('menuitemradio', { name: 'Label 7' })).toBeChecked()
  await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Label 9' })).toBeChecked()
  await userEvent.click(within(menu).getByRole('menuitem', { name: /^Label 1(?!0)/ }))
  await expect(args.onSelect).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
})

Default.test('arrow keys open the submenu; Escape closes', async ({ canvas, canvasElement }) => {
  await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Label') })
  const menu = await body(canvasElement).findByRole('menu')
  within(menu).getByRole('menuitem', { name: 'Label 4' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  const subItem = await body(canvasElement).findByRole('menuitem', { name: 'Label 5' })
  await waitFor(() => expect(subItem).toBeVisible())
  await userEvent.keyboard('{Escape}')
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
})
