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

function DemoTooltip({ open, onOpenChange, side = 'top', text = 'New chat' }: DemoProps) {
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <Button size="icon" variant="outline" intent="neutral" aria-label="New chat">
          <Icon icon={PlusIcon} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  )
}

const meta = preview.meta({
  title: 'Molecules/Tooltip',
  tags: ['molecule'],
  component: DemoTooltip,
  parameters: {
    shadcn: 'tooltip',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'text', values: 'text', code: 'children of `TooltipContent` (story `text` control)' },
      { property: 'side', values: 'top · left · right · bottom', code: '`side` prop on `TooltipContent`' },
      {
        property: 'variant',
        values: 'default · fixed width · inline',
        code: 'nothing (layout only: width follows the content)',
      },
    ],
    guide: {
      use: [
        'Naming icon-only buttons (New chat, Copy, Regenerate) and adding their shortcut.',
        'A short hint about a truncated value or an unfamiliar control.',
      ],
      avoid: [
        'Anything interactive or longer than a sentence: use Popover. Previews of a link, person or source: use Hover Card.',
        'Essential information or errors: show them on the page (Field description, Alert); touch users never see tooltips.',
        'Repeating a visible text label.',
      ],
      content: [
        'A few words, sentence case, no trailing period for labels (“New chat”); match the button’s `aria-label`.',
        'Add the shortcut when there is one (“New chat ⌘N”).',
      ],
      a11y: [
        'Opens on hover and keyboard focus, closes on Escape; content is `role="tooltip"` and describes the trigger.',
        'It never takes focus and is not a substitute for `aria-label` on icon-only buttons.',
        'Disabled buttons don’t fire hover events: wrap them in a `span` if they need a tooltip.',
      ],
    },
    docs: {
      story: { inline: false, height: '200px' },
      description: {
        component:
          'Short, non-interactive label on hover or focus (shadcn/ui Tooltip on Radix). `side` top · right · bottom · left. Use Popover for interactive content. Storybook wraps every story in `TooltipProvider`; apps need one near the root.',
      },
    },
  },
  args: { open: false, side: 'top', text: 'New chat' },
  argTypes: {
    side: { control: 'inline-radio', options: sides },
    open: { control: 'boolean' },
    text: { control: 'text' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

const body = (el: HTMLElement) => within(el.ownerDocument.body)

/** Closed, like on a page: hover or focus the trigger (or use the `open` control) to show it. */
export const Default = meta.story()

Default.test('keyboard focus shows it, Escape hides it', async ({ canvasElement }) => {
  await userEvent.tab()
  await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('New chat')
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('tooltip')).toBeNull())
})

/** Open on load (Figma default). The trigger is not focused; Radix Tooltip never moves focus. */
export const Open = meta.story({ args: { open: true } })

Open.test('shows the label without focusing the trigger', async ({ canvas, canvasElement }) => {
  await expect(await body(canvasElement).findByRole('tooltip')).toHaveTextContent('New chat')
  await expect(canvas.getByRole('button', { name: 'New chat' })).not.toHaveFocus()
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
  args: {
    open: true,
    text: 'New chat. Starts a conversation in “Q3 launch plan” with your saved preferences.',
  },
})
