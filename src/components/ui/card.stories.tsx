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
  title = 'Title',
  description = 'Subtitle',
  footer = true,
}: DemoProps) {
  const body = (
    <>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="type-text-sm-normal text-muted-foreground">Value</CardContent>
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
            Cancel
          </Button>
          <Button size="sm">Continue</Button>
        </CardFooter>
      )}
    </Card>
  )
}

const meta = preview.meta({
  title: 'UI Components/Card',
  tags: ['ui-component'],
  component: DemoCard,
  parameters: {
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
    docs: {
      description: {
        component:
          'A flat container for related content (shadcn/ui Card): `CardHeader` (title, description, optional `CardAction`) → `CardContent` (a Figma slot) → `CardFooter` (actions), on the inline shell parts. Figma `size` sm · default · lg → `size` (8 / 16 / 24 padding and gap). Interactive card: render it as a link or button with `asChild` — it gets the stronger stroke, shadow/sm, shadow/md on hover and a focus ring. Card is flat; for a floating preview use Hover Card.',
      },
    },
  },
  args: { size: 'default', interactive: false, title: 'Title', description: 'Subtitle', footer: true },
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
            <CardTitle>Title</CardTitle>
            <CardDescription>Subtitle</CardDescription>
          </CardHeader>
        </button>
      </Card>
    </div>
  ),
})

Interactive.test(
  'link and button cards are reachable and named by their content',
  async ({ canvas, args }) => {
    const link = canvas.getByRole('link', { name: /Title/ })
    await expect(link).toHaveAttribute('data-slot', 'card')
    await userEvent.tab()
    await expect(link).toHaveFocus()
    await userEvent.click(canvas.getByRole('button', { name: /Title/ }))
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
        <CardTitle>Title</CardTitle>
        <CardDescription>Subtitle</CardDescription>
        <CardAction>
          <Button size="icon-sm" variant="ghost" intent="neutral" aria-label="More actions">
            <Icon icon={EllipsisIcon} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 type-text-sm-normal">
        <p>Value</p>
        <p className="text-muted-foreground">Subtitle</p>
      </CardContent>
      <CardFooter className="justify-between border-t border-border">
        <Button size="sm" variant="ghost" intent="neutral">
          Cancel
        </Button>
        <Button size="sm">Continue</Button>
      </CardFooter>
    </Card>
  ),
})

Composition.test('the action sits in the header', async ({ canvasElement }) => {
  const header = canvasElement.querySelector('[data-slot=card-header]') as HTMLElement
  await expect(within(header).getByRole('button', { name: 'More actions' })).toBeInTheDocument()
})
