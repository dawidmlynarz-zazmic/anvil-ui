import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Icon, PlusIcon } from './icon'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=27-95'
const sides = ['top', 'right', 'bottom', 'left'] as const

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: (typeof sides)[number]
  text?: string
}

function DemoTooltip({ open, onOpenChange, side = 'top', text = 'Add' }: DemoProps) {
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <Button size="icon" variant="outline" intent="neutral" aria-label="Add">
          <Icon icon={PlusIcon} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  )
}

const meta = preview.meta({
  title: 'Components/Tooltip',
  tags: ['ui-component'],
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
  args: { open: false, side: 'top', text: 'Add' },
  argTypes: {
    side: { control: 'inline-radio', options: sides },
    open: { control: 'boolean' },
    text: { control: 'text' },
    onOpenChange: { table: { disable: true } },
  },
})

const body = (el: HTMLElement) => within(el.ownerDocument.body)

/** Closed, like on a page: hover or focus the trigger (or use the `open` control) to show it. */
export const Default = meta.story()

Default.test('keyboard focus shows it, Escape hides it', async ({ canvasElement }) => {
  await userEvent.tab()
  await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Add')
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('tooltip')).toBeNull())
})

/** Open on load (Figma default). The trigger is not focused; Radix Tooltip never moves focus. */
export const Open = meta.story({ args: { open: true } })

Open.test('shows the label without focusing the trigger', async ({ canvas, canvasElement }) => {
  await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('Add')
  await expect(canvas.getByRole('button', { name: 'Add' })).not.toHaveFocus()
})

/** Every `side`. */
export const Sides = meta.story({
  render: () => (
    <div className="grid grid-cols-2 gap-x-24 gap-y-16 p-12">
      {sides.map((side) => (
        <DemoTooltip key={side} open side={side} />
      ))}
    </div>
  ),
  parameters: { docs: { story: { inline: false, height: '320px' } } },
})

/** Longer text wraps at max-w-xs (Figma variant `fixed width`). */
export const LongText = meta.story({
  args: { open: true, text: 'Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle' },
})
