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

/** Figma example: avatar, title, one or two lines, and a meta row (here a cited source). */
function Preview() {
  return (
    <div className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted type-text-sm-medium text-foreground">
        M
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="type-text-sm-semibold">Mid-market SaaS pricing report</p>
        <p className="type-text-sm-normal text-muted-foreground">
          Team plans rose 6% year over year; most competitors now bill per seat.
        </p>
        <p className="flex items-center gap-2 type-text-xs-normal text-muted-foreground">
          <Icon icon={CalendarIcon} />
          Published Sep 12, 2026
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
          marketpulse.example
        </a>
      </HoverCardTrigger>
      <HoverCardContent side={side}>
        <Preview />
      </HoverCardContent>
    </HoverCard>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Hover Card',
  tags: ['molecule'],
  component: DemoHoverCard,
  parameters: {
    shadcn: 'hover-card',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // Figma: hover card is an example on the Cards page (a card static inside HoverCard); no component properties.
    figmaProps: [],
    guide: {
      use: [
        'A read-only preview behind a link or avatar: a cited source, a person, a file, a connected app.',
        'Extra context people may want while scanning, without leaving the thread.',
      ],
      avoid: [
        'Anything interactive (buttons, forms, links to act on): use Popover. A one-line label for an icon: use Tooltip.',
        'Information people need to complete a task: show it inline; hover is easy to miss and absent on touch.',
        'A list of actions: use Dropdown Menu.',
      ],
      content: [
        'Title, one or two lines of summary and a meta row (date, domain, size); keep it under ~40 words.',
        'Repeat the trigger’s identity in the title so the preview confirms what was hovered.',
      ],
      a11y: [
        'Opens on hover and on keyboard focus of the trigger; Escape closes it.',
        'The trigger must be a real link or button that works on its own; the card is supplementary and not announced.',
        'Touch devices never see it, so nothing essential should live only here.',
      ],
    },
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
  await expect(canvas.getByRole('link', { name: 'marketpulse.example' })).toHaveFocus()
  const title = await body(canvasElement).findByText('Mid-market SaaS pricing report', {}, { timeout: 2000 })
  await waitFor(() => expect(title).toBeVisible())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByText('Mid-market SaaS pricing report')).toBeNull())
})

/** Figma example: open (reading content only, so nothing takes focus). */
export const Open = meta.story({ args: { open: true } })
