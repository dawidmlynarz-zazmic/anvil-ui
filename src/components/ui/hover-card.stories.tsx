import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'
import { CalendarIcon, Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10951-40462'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  openDelay?: number
}

/** Figma example: avatar, title, one or two lines, and a meta row. */
function Preview() {
  return (
    <div className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted type-text-sm-medium text-foreground">
        L
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="type-text-sm-semibold">Title</p>
        <p className="type-text-sm-normal text-muted-foreground">Subtitle</p>
        <p className="flex items-center gap-2 type-text-xs-normal text-muted-foreground">
          <Icon icon={CalendarIcon} />
          Value
        </p>
      </div>
    </div>
  )
}

function DemoHoverCard({ open, onOpenChange, side = 'bottom', openDelay = 700 }: DemoProps) {
  return (
    <HoverCard open={open} onOpenChange={onOpenChange} openDelay={openDelay}>
      <HoverCardTrigger asChild>
        <a
          href="#source"
          className="rounded-sm type-text-sm-link text-foreground-link outline-none focus-visible:focus-ring"
        >
          Label
        </a>
      </HoverCardTrigger>
      <HoverCardContent side={side}>
        <Preview />
      </HoverCardContent>
    </HoverCard>
  )
}

const meta = preview.meta({
  title: 'Components/Hover Card',
  tags: ['ui-component'],
  component: DemoHoverCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // Figma: hover card is an example on the Cards page (a card static inside HoverCard); no component properties.
    figmaProps: [],
    docs: {
      story: { inline: false, height: '280px' },
      description: {
        component:
          'A compact Card shown on hover or keyboard focus of a link or avatar (shadcn/ui Hover Card on Radix), for people, citations and sources. Opens after `openDelay` (700ms) and floats with elevation/raised. Content is for reading only: use Popover when it is interactive.',
      },
    },
  },
  args: { open: false, side: 'bottom', openDelay: 700 },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    open: { control: 'boolean' },
    openDelay: { control: 'number' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** The trigger at rest: hover or focus it. */
export const Default = meta.story()

Default.test('keyboard focus opens it; Escape closes it', async ({ canvas, canvasElement }) => {
  await userEvent.tab()
  await expect(canvas.getByRole('link', { name: 'Label' })).toHaveFocus()
  const title = await body(canvasElement).findByText('Title', {}, { timeout: 2000 })
  await waitFor(() => expect(title).toBeVisible())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByText('Title')).toBeNull())
})

/** Figma example: open (reading content only, so nothing takes focus). */
export const Open = meta.story({ args: { open: true } })
