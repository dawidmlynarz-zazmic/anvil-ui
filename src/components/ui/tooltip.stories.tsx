import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon, PlusIcon } from './icon'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=27-95'
const sides = ['top', 'right', 'bottom', 'left'] as const

type DemoProps = { open?: boolean; side?: (typeof sides)[number]; text?: string }

function DemoTooltip({ open, side = 'top', text = 'Label' }: DemoProps) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <Button size="icon" variant="outline" intent="neutral" aria-label="Label">
          <Icon icon={PlusIcon} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  )
}

const meta = {
  title: 'Components/Tooltip',
  component: DemoTooltip,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '200px' },
      description: {
        component:
          'Short, non-interactive label on hover or focus (shadcn/ui Tooltip on Radix). `side` top · right · bottom · left. Use Popover for interactive content. Storybook wraps every story in `TooltipProvider`; apps need one near the root.',
      },
    },
  },
  args: { open: true, side: 'top', text: 'Label' },
  argTypes: {
    side: { control: 'inline-radio', options: sides },
    open: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoTooltip>

export default meta
type Story = StoryObj<typeof meta>

const body = (el: HTMLElement) => within(el.ownerDocument.body)

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Label')
  },
}

/** Every `side`. */
export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-24 gap-y-16 p-12">
      {sides.map((side) => (
        <DemoTooltip key={side} open side={side} />
      ))}
    </div>
  ),
  parameters: { docs: { story: { inline: false, height: '320px' } } },
}

/** Longer text wraps at max-w-xs (Figma variant `fixed width`). */
export const LongText: Story = {
  args: { text: 'Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle' },
}

/** Uncontrolled: keyboard focus shows it, Escape hides it. */
export const OnFocus: Story = {
  args: { open: undefined },
  parameters: { docs: { story: { inline: true } } },
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Label')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body(canvasElement).queryByRole('tooltip')).toBeNull())
  },
}
