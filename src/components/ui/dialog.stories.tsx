import type { Meta, StoryObj } from '@storybook/react-vite'
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
  title?: string
  description?: string
  align?: 'end' | 'between' | 'stretch'
  children?: ReactNode
}

/** A Dialog with the Figma anatomy: header bar, body, footer bar (Cancel + primary). */
function DemoDialog({
  size = 'default',
  open,
  title = 'Title',
  description,
  align = 'end',
  children,
}: DemoProps) {
  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </DialogTrigger>
      <DialogContent
        size={size}
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

const meta = {
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
  args: { open: true, size: 'default', description: 'Subtitle', align: 'end' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    align: { control: 'inline-radio', options: ['end', 'between', 'stretch'] },
    open: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoDialog>

export default meta
type Story = StoryObj<typeof meta>

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await body(canvasElement).findByRole('dialog', { name: 'Title' })
    await expect(dialog).toHaveAccessibleDescription('Subtitle')
    await expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
  },
}

export const Small: Story = { args: { size: 'sm', description: undefined } }

export const Large: Story = {
  args: { size: 'lg' },
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
}

/** Footer align between: secondary on the left. */
export const FooterBetween: Story = { args: { align: 'between' } }

/** Long content scrolls inside the body; header and footer stay put (footer casts shadow/top). */
export const Scrolling: Story = {
  args: { description: undefined },
  render: (args) => (
    <DemoDialog {...args}>
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i} className="type-text-sm-normal text-muted-foreground">
          Subtitle
        </p>
      ))}
    </DemoDialog>
  ),
}

/** Uncontrolled: the trigger opens it, Escape closes it and focus returns to the trigger. */
export const WithTrigger: Story = {
  args: { open: undefined },
  parameters: { docs: { story: { inline: true } } },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Label' })
    await userEvent.click(trigger)
    const dialog = await body(canvasElement).findByRole('dialog')
    await expect(within(dialog).getByLabelText('Label')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}
