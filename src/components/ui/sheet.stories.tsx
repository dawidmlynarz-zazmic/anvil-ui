import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Input } from './input'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  type SheetContentProps,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10935-40686'

type DemoProps = { side?: SheetContentProps['side']; open?: boolean; description?: string }

function DemoSheet({ side = 'right', open, description = 'Subtitle' }: DemoProps) {
  return (
    <Sheet open={open}>
      <SheetTrigger asChild>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <SheetBody>
          <Input label="Label" defaultValue="Value" />
          <Input label="Label" placeholder="Placeholder" />
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button size="sm" variant="outline" intent="neutral">
              Label
            </Button>
          </SheetClose>
          <Button size="sm">Label</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const meta = {
  title: 'Components/Sheet',
  component: DemoSheet,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component:
          'Panel that slides in from a screen edge for secondary tasks, filters and settings (shadcn/ui Sheet on Radix Dialog). Same anatomy as Dialog: `SheetHeader` (ShellHeader bar) → `SheetBody` → `SheetFooter` (ShellFooter bar). `side` right · left (400px) · top · bottom (full width).',
      },
    },
  },
  args: { open: true, side: 'right' },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left', 'top', 'bottom'] },
    open: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoSheet>

export default meta
type Story = StoryObj<typeof meta>

const body = (el: HTMLElement) => within(el.ownerDocument.body)

export const Right: Story = {
  play: async ({ canvasElement }) => {
    const sheet = await body(canvasElement).findByRole('dialog', { name: 'Title' })
    await expect(sheet).toHaveAttribute('data-side', 'right')
    await expect(sheet).toHaveAccessibleDescription('Subtitle')
  },
}
export const Left: Story = { args: { side: 'left' } }
export const Top: Story = { args: { side: 'top' } }
export const Bottom: Story = { args: { side: 'bottom' } }

/** Uncontrolled: the trigger opens it, the header close closes it and focus returns. */
export const WithTrigger: Story = {
  args: { open: undefined },
  parameters: { docs: { story: { inline: true } } },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Label' })
    await userEvent.click(trigger)
    const sheet = await body(canvasElement).findByRole('dialog')
    await expect(within(sheet).getAllByLabelText('Label')[0]).toHaveFocus()
    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}
