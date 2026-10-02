import preview from '#.storybook/preview'
import type { ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  type DialogContentProps,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Textarea } from './textarea'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8255-1298'

type DemoProps = {
  size?: DialogContentProps['size']
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Story-only: false for stories that open on load, so focus stays put until you interact. */
  focusOnOpen?: boolean
  title?: string
  description?: string
  align?: 'end' | 'between' | 'stretch'
  children?: ReactNode
}

/** A Dialog with the Figma anatomy: header bar, body, footer bar (Cancel + primary). */
function DemoDialog({
  size = 'default',
  open,
  onOpenChange,
  focusOnOpen = true,
  title = 'Title',
  description,
  align = 'end',
  children,
}: DemoProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </DialogTrigger>
      <DialogContent
        size={size}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
        // No description: tell Radix explicitly so it doesn't warn about a missing one.
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody>{children ?? <Input label="Label" defaultValue="Value" />}</DialogBody>
        <DialogFooter align={align}>
          <DialogClose asChild>
            <Button size="sm" variant="outline" intent="neutral">
              Label
            </Button>
          </DialogClose>
          <Button size="sm">Label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const meta = preview.meta({
  title: 'Components/Dialog',
  component: DemoDialog,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'Centered modal for focused tasks (shadcn/ui Dialog on Radix). Anatomy: `DialogHeader` (ShellHeader bar: title, optional description, close) → `DialogBody` (16px padding and gap, scrolls) → `DialogFooter` (ShellFooter bar). `size` sm · default · lg = 400 / 480 / 640. Use Alert Dialog for destructive confirmations, Sheet for side tasks.',
      },
    },
  },
  args: { open: false, size: 'default', description: 'Subtitle', align: 'end' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    align: { control: 'inline-radio', options: ['end', 'between', 'stretch'] },
    open: { control: 'boolean' },
    onOpenChange: { table: { disable: true } },
    focusOnOpen: { table: { disable: true } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test('trigger opens, Escape closes and focus returns', async ({ canvas, canvasElement }) => {
  const trigger = canvas.getByRole('button', { name: 'Label' })
  await userEvent.click(trigger)
  const dialog = await body(canvasElement).findByRole('dialog', { name: 'Title' })
  await expect(dialog).toHaveAccessibleDescription('Subtitle')
  await expect(within(dialog).getByLabelText('Label')).toHaveFocus()
  await expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
  await expect(trigger).toHaveFocus()
})

/** Figma default: open (focus stays put until you interact). */
export const Open = meta.story({ args: { open: true, focusOnOpen: false } })

export const Small = meta.story({
  args: { open: true, focusOnOpen: false, size: 'sm', description: undefined },
})

export const Large = meta.story({
  args: { open: true, focusOnOpen: false, size: 'lg' },
  render: (args) => (
    <DemoDialog {...args}>
      <Select defaultValue="1">
        <SelectTrigger label="Label">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Label 1</SelectItem>
          <SelectItem value="2">Label 2</SelectItem>
        </SelectContent>
      </Select>
      <Textarea label="Label" defaultValue="Value" />
    </DemoDialog>
  ),
})

/** Footer align between: secondary on the left. */
export const FooterBetween = meta.story({ args: { open: true, focusOnOpen: false, align: 'between' } })

/** Long content scrolls inside the body; header and footer stay put (footer casts shadow/top). */
export const Scrolling = meta.story({
  args: { open: true, focusOnOpen: false, description: undefined },
  render: (args) => (
    <DemoDialog {...args}>
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i} className="type-text-sm-normal text-muted-foreground">
          Subtitle
        </p>
      ))}
    </DemoDialog>
  ),
})
