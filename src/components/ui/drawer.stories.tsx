import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'
import { Input } from './input'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10935-40687'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  direction?: 'bottom' | 'top' | 'left' | 'right'
  title?: string
  description?: string
  align?: 'end' | 'between' | 'stretch'
  showCloseButton?: boolean
  /** Story-only: false for stories that open on load, so focus stays put until you interact. */
  focusOnOpen?: boolean
}

function DemoDrawer({
  open,
  onOpenChange,
  direction = 'bottom',
  title = 'Title',
  description,
  align = 'end',
  showCloseButton = true,
  focusOnOpen = true,
}: DemoProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerTrigger asChild>
        <Button variant="outline" intent="neutral">
          Open drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent
        showCloseButton={showCloseButton}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
        // No description: tell Radix explicitly so it doesn't warn about a missing one.
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <DrawerBody>
          <Input label="Label" defaultValue="Value" />
        </DrawerBody>
        <DrawerFooter align={align}>
          <DrawerClose asChild>
            <Button size="sm" variant="outline" intent="neutral">
              Cancel
            </Button>
          </DrawerClose>
          <Button size="sm">Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const meta = preview.meta({
  title: 'Components/Drawer',
  component: DemoDrawer,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '480px' },
      description: {
        component:
          'Bottom panel for the mobile shell (shadcn/ui Drawer on vaul): drag or swipe the handle down, press Escape, click outside or use the close button to dismiss. Use it instead of Dialog or Sheet below 768px. Anatomy: handle → `DrawerHeader` (ShellHeader bar) → `DrawerBody` → `DrawerFooter` (ShellFooter bar; `align="stretch"` for full-width mobile actions). `direction` comes from vaul (bottom by default).',
      },
    },
  },
  args: {
    open: false,
    direction: 'bottom',
    title: 'Title',
    description: 'Subtitle',
    align: 'end',
    showCloseButton: true,
  },
  argTypes: {
    open: { control: 'boolean' },
    direction: { control: 'inline-radio', options: ['bottom', 'top', 'left', 'right'] },
    align: { control: 'inline-radio', options: ['end', 'between', 'stretch'] },
    showCloseButton: { control: 'boolean' },
    onOpenChange: { table: { disable: true } },
    focusOnOpen: { table: { disable: true } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

// vaul's `autoFocus` defaults to false (no on-screen keyboard popping up on open), so focus stays on
// the trigger; pass `autoFocus` to Drawer to move it into the content like Dialog.
Default.test(
  'trigger opens, Escape closes and focus stays on the trigger',
  async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Open drawer' })
    await userEvent.click(trigger)
    const drawer = await body(canvasElement).findByRole('dialog', { name: 'Title' })
    await expect(drawer).toHaveAccessibleDescription('Subtitle')
    await expect(within(drawer).getByLabelText('Label')).not.toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  },
)

Default.test('the header close button closes it', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }))
  const drawer = await body(canvasElement).findByRole('dialog', { name: 'Title' })
  await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }))
  await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
})

/** Figma drawer: open from the bottom with the handle. */
export const Open = meta.story({ args: { open: true, focusOnOpen: false, description: undefined } })

/** Mobile actions: `DrawerFooter align="stretch"` makes them full width. */
export const StretchedFooter = meta.story({ args: { open: true, focusOnOpen: false, align: 'stretch' } })

/** vaul `direction`: top, left and right have no handle. */
export const Top = meta.story({ args: { open: true, focusOnOpen: false, direction: 'top' } })

export const Right = meta.story({ args: { open: true, focusOnOpen: false, direction: 'right' } })

export const Left = meta.story({ args: { open: true, focusOnOpen: false, direction: 'left' } })
