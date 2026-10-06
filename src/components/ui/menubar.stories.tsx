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
            New file<MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Duplicate<MenubarShortcut>⌘D</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email</MenubarItem>
              <MenubarItem>Message</MenubarItem>
              <MenubarItem>Copy link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem intent="destructive">
            Delete<MenubarShortcut>⌫</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="2">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Copy<MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Paste<MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="3">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Show toolbar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show status bar</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="4">
        <MenubarTrigger>Layout</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="1">
            <MenubarRadioItem value="1">Top</MenubarRadioItem>
            <MenubarRadioItem value="2">Bottom</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const meta = preview.meta({
  title: 'UI Components/Menubar',
  tags: ['feature'],
  component: DemoMenubar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'open',
        values: 'false · true',
        code: 'Radix `value` / `defaultValue` on `Menubar` (the open menu); trigger `data-[state=open]:`',
      },
    ],
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
  await userEvent.click(within(menu).getByRole('menuitem', { name: /^New file/ }))
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
              Label
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      ))}
    </div>
  ),
})
