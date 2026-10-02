import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Input } from './input'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10939-49'

type DemoProps = {
  open?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  showFooter?: boolean
}

function DemoPopover({ open, side = 'bottom', align = 'center', showFooter = true }: DemoProps) {
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align}>
        <PopoverHeader>
          <PopoverTitle>Title</PopoverTitle>
          <PopoverDescription>Subtitle</PopoverDescription>
        </PopoverHeader>
        <Input label="Label" defaultValue="Value" />
        {showFooter && (
          <PopoverFooter>
            <PopoverClose asChild>
              <Button size="sm" variant="outline" intent="neutral">
                Label
              </Button>
            </PopoverClose>
            <Button size="sm">Label</Button>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  )
}

const meta = {
  title: 'Components/Popover',
  component: DemoPopover,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '360px' },
      description: {
        component:
          'Floating panel anchored to a trigger for interactive content (shadcn/ui Popover on Radix). `PopoverHeader` (ShellHeader inline: title, description, close) → content → optional `PopoverFooter` (ShellFooter inline). 288px wide, 16px padding, elevation/raised. `side` / `align` place it. Use Tooltip for short labels.',
      },
    },
  },
  args: { open: true, side: 'bottom', align: 'center', showFooter: true },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    open: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoPopover>

export default meta
type Story = StoryObj<typeof meta>

const body = (el: HTMLElement) => within(el.ownerDocument.body)

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await body(canvasElement).findByRole('dialog', { name: 'Title' })
    await expect(dialog).toHaveAccessibleDescription('Subtitle')
  },
}

/** Without a footer (Figma `show footer` off). */
export const WithoutFooter: Story = { args: { showFooter: false } }

export const SideTop: Story = { args: { side: 'top' } }
export const AlignStart: Story = { args: { align: 'start' } }

/** Uncontrolled: the trigger opens it, Escape closes it and focus returns. */
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
