import preview from '#.storybook/preview'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { EllipsisIcon, Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8568-1493'
const FIGMA_INTERACTIVE = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8553-1394'

type DemoProps = {
  size?: 'sm' | 'default' | 'lg'
  /** Story control: render the card as a link (Figma `card interactive`). */
  interactive?: boolean
  title?: string
  description?: string
  footer?: boolean
}

function DemoCard({
  size = 'default',
  interactive = false,
  title = 'Q3 launch plan',
  description = 'Updated 2 hours ago · 14 messages',
  footer = true,
}: DemoProps) {
  const body = (
    <>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="type-text-sm-normal text-muted-foreground">
        Launch Northwind Sync on September 30 with a beta invite email and new pricing.
      </CardContent>
    </>
  )
  if (interactive) {
    return (
      <Card size={size} asChild className="w-90">
        <a href="#card">{body}</a>
      </Card>
    )
  }
  return (
    <Card size={size} className="w-90">
      {body}
      {footer && (
        <CardFooter className="justify-end">
          <Button size="sm" variant="outline" intent="neutral">
            Share
          </Button>
          <Button size="sm">Open project</Button>
        </CardFooter>
      )}
    </Card>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Card',
  tags: ['molecule'],
  component: DemoCard,
  parameters: {
    shadcn: 'card',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'size',
        values: 'default · sm · lg',
        code: '`size` prop (card static and card interactive)',
      },
      {
        property: 'slot 1 / 2 / 3 · show slot 1 / 2 / 3',
        values: 'slot · boolean',
        code: 'children: stacked parts (`CardHeader`, `CardContent`, `CardFooter`); render each or not',
      },
      {
        property: 'card interactive · state',
        values: 'default · hover',
        code: 'selector: `hover:` on an `asChild` link or button (not a prop)',
      },
    ],
    guide: {
      use: [
        'Grouping content about one thing (a project, a report, a connected app) with its own header and actions.',
        'Interactive (`asChild` link or button) when the whole card opens that thing: a project or conversation in a grid.',
        'Agent output that stands apart from the thread: summaries, results, previews.',
      ],
      avoid: [
        'Floating previews on hover: use Hover Card. Content above the page: use Dialog or Popover.',
        'Rows in a dense list: use Item. Simple sections of a page: a heading and Separator are enough.',
        'Nesting cards inside cards.',
      ],
      content: [
        'Title names the object (“Q3 launch plan”); the description adds one line of context (updated, counts, source).',
        'Footer actions say what they do (“Open project”); one primary action per card.',
      ],
      a11y: [
        'Static cards are not focusable; interactive cards are one link or button named by their content.',
        'Don’t put other buttons inside an interactive card; use a static card with a `CardAction` instead.',
        'Icon-only `CardAction` buttons need an `aria-label`.',
      ],
    },
    docs: {
      description: {
        component:
          'A flat container for related content (shadcn/ui Card): `CardHeader` (title, description, optional `CardAction`) → `CardContent` (a Figma slot) → `CardFooter` (actions), on the inline shell parts. Figma `size` sm · default · lg → `size` (8 / 16 / 24 padding and gap). Interactive card: render it as a link or button with `asChild` — it gets the stronger stroke, shadow/sm, shadow/md on hover and a focus ring. Card is flat; for a floating preview use Hover Card.',
      },
    },
  },
  args: {
    size: 'default',
    interactive: false,
    title: 'Q3 launch plan',
    description: 'Updated 2 hours ago · 14 messages',
    footer: true,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    interactive: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
    footer: { control: 'boolean', if: { arg: 'interactive', truthy: false } },
  },
})

export const Default = meta.story()

Default.test('a static card is not focusable', async ({ canvasElement }) => {
  const card = canvasElement.querySelector('[data-slot=card]') as HTMLElement
  await expect(card.tagName).toBe('DIV')
  await userEvent.tab()
  await expect(card).not.toHaveFocus()
})

/** Figma card static: size sm · default · lg = `size`. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <DemoCard key={size} size={size} footer={false} />
      ))}
    </div>
  ),
})

/** Figma card interactive: a link (or button) card; hover lifts it to shadow/md. */
export const Interactive = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_INTERACTIVE } },
  args: { onClick: fn() } as DemoProps,
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DemoCard interactive />
      <Card asChild size="sm" className="w-90 text-left">
        <button type="button" onClick={(args as { onClick?: () => void }).onClick}>
          <CardHeader>
            <CardTitle>Competitor pricing research</CardTitle>
            <CardDescription>Updated yesterday · 6 sources</CardDescription>
          </CardHeader>
        </button>
      </Card>
    </div>
  ),
})

Interactive.test(
  'link and button cards are reachable and named by their content',
  async ({ canvas, args }) => {
    const link = canvas.getByRole('link', { name: /Q3 launch plan/ })
    await expect(link).toHaveAttribute('data-slot', 'card')
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await userEvent.click(canvas.getByRole('button', { name: /Competitor pricing research/ }))
    await expect((args as { onClick: () => void }).onClick).toHaveBeenCalled()
  },
)

/** Hover and focus of the interactive card side by side (reference; use the State control on one card). */
export const InteractiveStates = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_INTERACTIVE } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DemoCard interactive />
      <span className="pseudo-hover-all contents">
        <DemoCard interactive />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <DemoCard interactive />
      </span>
    </div>
  ),
})

/** Header with a CardAction, a content slot and a footer with actions. */
export const Composition = meta.story({
  render: () => (
    <Card className="w-100">
      <CardHeader className="border-b border-border">
        <CardTitle>Weekly metrics review</CardTitle>
        <CardDescription>Week of Oct 5 · from Analytics</CardDescription>
        <CardAction>
          <Button size="icon-sm" variant="ghost" intent="neutral" aria-label="More actions">
            <Icon icon={EllipsisIcon} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 type-text-sm-normal">
        <p>Weekly active users rose to 12,480 (+8.2%); trial conversion dipped to 4.6% (−0.3 pt).</p>
        <p className="text-muted-foreground">Churn held at 2.1%. Revenue reached $48.2k.</p>
      </CardContent>
      <CardFooter className="justify-between border-t border-border">
        <Button size="sm" variant="ghost" intent="neutral">
          Dismiss
        </Button>
        <Button size="sm">Open report</Button>
      </CardFooter>
    </Card>
  ),
})

Composition.test('the action sits in the header', async ({ canvasElement }) => {
  const header = canvasElement.querySelector('[data-slot=card-header]') as HTMLElement
  await expect(within(header).getByRole('button', { name: 'More actions' })).toBeInTheDocument()
})
