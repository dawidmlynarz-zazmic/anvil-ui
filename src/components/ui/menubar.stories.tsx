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
        <MenubarTrigger>Label 1</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onSelect}>
            Label 1<MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Label 2</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Label 3</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Label 4</MenubarItem>
              <MenubarItem>Label 5</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem intent="destructive">Label 6</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="2">
        <MenubarTrigger>Label 2</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Label 1</MenubarItem>
          <MenubarItem disabled>Label 2</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="3">
        <MenubarTrigger>Label 3</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Label 1</MenubarCheckboxItem>
          <MenubarCheckboxItem>Label 2</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="4">
        <MenubarTrigger>Label 4</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="1">
            <MenubarRadioItem value="1">Label 1</MenubarRadioItem>
            <MenubarRadioItem value="2">Label 2</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const meta = preview.meta({
  title: 'Components/Menubar',
  component: DemoMenubar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
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
    onSelect: { table: { disable: true } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** The bar at rest (Figma open=false). */
export const Default = meta.story()

Default.test('click opens a menu and an item runs', async ({ canvas, canvasElement, args }) => {
  await userEvent.click(canvas.getByRole('menuitem', { name: 'Label 1' }))
  const menu = await body(canvasElement).findByRole('menu')
  await userEvent.click(within(menu).getByRole('menuitem', { name: /^Label 1/ }))
  await expect(args.onSelect).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(body(canvasElement).queryByRole('menu')).toBeNull())
})

Default.test(
  'keyboard: ArrowDown opens a menu, ArrowRight moves to the next trigger',
  async ({ canvas, canvasElement }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('menuitem', { name: 'Label 1' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await body(canvasElement).findByRole('menu')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Label 2' })).toHaveFocus())
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
