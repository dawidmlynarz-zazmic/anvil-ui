import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10948-83'
const FIGMA_TRIGGER = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10948-57'

type DemoProps = {
  /** Radix `defaultValue`: the menu open on load (Figma open=true shows the first). */
  defaultValue?: string
  onSelect?: () => void
}

function DemoMenubar({ defaultValue, onSelect }: DemoProps) {
  return (
    <Menubar defaultValue={defaultValue}>
      <MenubarMenu value="1">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onSelect}>
            New chat<MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Duplicate conversation<MenubarShortcut>⌘D</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Copy link</MenubarItem>
              <MenubarItem>Send by email</MenubarItem>
              <MenubarItem>Export as PDF</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem intent="destructive">
            Delete conversation<MenubarShortcut>⌫</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="2">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Copy last response<MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Edit last message<MenubarShortcut>↑</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="3">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Show sources panel</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show tool activity</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="4">
        <MenubarTrigger>Model</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="balanced">
            <MenubarRadioItem value="fast">Fast</MenubarRadioItem>
            <MenubarRadioItem value="balanced">Balanced</MenubarRadioItem>
            <MenubarRadioItem value="deep">Deep reasoning</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const meta = preview.meta({
  title: 'Design System/Organisms/Menubar',
  tags: ['organism'],
  component: DemoMenubar,
  parameters: {
    shadcn: 'menubar',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'open',
        values: 'false · true',
        code: 'Radix `value` / `defaultValue` on `Menubar` (the open menu); trigger `data-[state=open]:`',
      },
    ],
    guide: {
      use: [
        'A desktop app-style bar of menus over a workspace or editor: File, Edit, View, Model.',
        'When there are many commands that users expect in familiar places, each menu a short, grouped list.',
      ],
      avoid: [
        'A single menu on a button or row: use Dropdown Menu; right-click: Context Menu. Search-driven access: use Command (⌘K).',
        'A handful of always-visible actions: use Toolbar. Navigation between pages: use Tabs or Sidebar.',
        'Mobile layouts: there is no room for a bar; move the commands into a Drawer or Dropdown Menu.',
      ],
      content: [
        'Menu names are single nouns (“File”, “View”, “Model”); items name the action and object (“Duplicate conversation”).',
        'Show the shortcut with `MenubarShortcut` only when it really works; destructive items go last with `intent="destructive"`.',
      ],
      a11y: [
        'Radix gives the bar `role="menubar"` with roving focus: Tab reaches it once, arrow keys move along it and into menus.',
        'Checkbox and radio items expose `menuitemcheckbox` / `menuitemradio` with their checked state.',
        'Escape closes the menu and returns focus to its trigger.',
      ],
    },
    docs: {
      story: { inline: false, height: '360px' },
      description: {
        component:
          'A row of menus (shadcn/ui Menubar on Radix; Figma calls it Menu). Each `MenubarMenu` has a `MenubarTrigger` and a `MenubarContent` built from the Dropdown Menu items, separators, submenus and shortcuts. Arrow keys move along the bar and into the menus; once one menu is open, hovering another trigger opens it.',
      },
    },
  },
  args: { onSelect: fn() },
  argTypes: {
    defaultValue: { table: { disable: true } },
    onSelect: { control: false, table: { category: 'Events' } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** The bar at rest (Figma open=false). */
export const Default = meta.story()

Default.test('click opens a menu and an item runs', async ({ canvas, canvasElement, args }) => {
  await userEvent.click(canvas.getByRole('menuitem', { name: 'File' }))
  const menu = await body(canvasElement).findByRole('menu')
  await userEvent.click(within(menu).getByRole('menuitem', { name: /^New chat/ }))
  await expect(args.onSelect).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
})

Default.test(
  'keyboard: ArrowDown opens a menu, ArrowRight moves to the next trigger',
  async ({ canvas, canvasElement }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('menuitem', { name: 'File' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await body(canvasElement).findByRole('menu')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Edit' })).toHaveFocus())
    await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
  },
)

/** Figma open=true: the first menu open on load. */
export const Open = meta.story({ args: { defaultValue: '1' } })

/** Figma .menu trigger: default · hover · open · focus (reference; use the State control on Default). */
export const TriggerStates = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_TRIGGER } },
  render: () => (
    <div className="flex items-center gap-6">
      {(['default', 'hover', 'open', 'focus-visible'] as const).map((state) => (
        <Menubar key={state} className="border-0 p-0">
          <MenubarMenu>
            <MenubarTrigger
              className={state === 'hover' || state === 'focus-visible' ? `pseudo-${state}` : undefined}
              data-state={state === 'open' ? 'open' : undefined}
            >
              File
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      ))}
    </div>
  ),
})
