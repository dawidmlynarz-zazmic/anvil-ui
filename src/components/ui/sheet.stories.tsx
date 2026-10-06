import preview from '#.storybook/preview'
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

type DemoProps = {
  side?: SheetContentProps['side']
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Story-only: false for stories that open on load, so focus stays put until you interact. */
  focusOnOpen?: boolean
  description?: string
}

function DemoSheet({
  side = 'right',
  open,
  onOpenChange,
  focusOnOpen = true,
  description = 'Subtitle',
}: DemoProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" intent="neutral">
          Open sheet
        </Button>
      </SheetTrigger>
      <SheetContent
        side={side}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
        // No description: tell Radix explicitly so it doesn't warn about a missing one.
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
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
              Cancel
            </Button>
          </SheetClose>
          <Button size="sm">Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const meta = preview.meta({
  title: 'Organisms/Sheet',
  tags: ['organism'],
  component: DemoSheet,
  parameters: {
    shadcn: 'sheet',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'show title bar', values: 'boolean', code: 'render `SheetHeader` or not' },
      { property: 'show action bar', values: 'boolean', code: 'render `SheetFooter` or not' },
      { property: 'content', values: 'slot', code: '`SheetBody` children' },
      { property: 'side', values: 'right · left · top · bottom', code: '`side` prop on `SheetContent`' },
    ],
    guide: {
      use: [
        'Secondary tasks that keep the page in view: filters, conversation settings, source details, memory.',
        'Panels the user opens and closes repeatedly while working in the thread.',
      ],
      avoid: [
        'A focused task that should block the page: use Dialog. Destructive confirmations: use Alert Dialog.',
        'Below 768px: use Drawer. Persistent navigation: use Sidebar.',
      ],
      content: [
        'Title names the panel (“Conversation settings”, “Sources”); the description is optional.',
        'Footer actions say what they do (“Apply filters”, “Save”); omit the footer for read-only panels.',
      ],
      a11y: [
        'Built on Radix Dialog: focus trap, Escape and outside click close it, focus returns to the trigger.',
        'The close button is last in the DOM so initial focus lands on the first control.',
        'Always render `SheetTitle`, even when hidden visually.',
      ],
    },
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component:
          'Panel that slides in from a screen edge for secondary tasks, filters and settings (shadcn/ui Sheet on Radix Dialog). Same anatomy as Dialog: `SheetHeader` (ShellHeader bar) → `SheetBody` → `SheetFooter` (ShellFooter bar). `side` right · left (400px) · top · bottom (full width).',
      },
    },
  },
  args: { open: false, side: 'right', description: 'Subtitle' },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left', 'top', 'bottom'] },
    open: { control: 'boolean' },
    description: { control: 'text' },
    onOpenChange: { control: false, table: { category: 'Events' } },
    focusOnOpen: { table: { disable: true } },
  },
})

const body = (el: HTMLElement) => within(el.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test(
  'trigger opens, the header close closes and focus returns',
  async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Open sheet' })
    await userEvent.click(trigger)
    const sheet = await body(canvasElement).findByRole('dialog', { name: 'Title' })
    await waitFor(() => expect(within(sheet).getAllByLabelText('Label')[0]).toHaveFocus())
    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
)

/** Open on load from the right (focus stays put until you interact). */
export const Right = meta.story({ args: { open: true, focusOnOpen: false } })

Right.test('slides in from the right with its description', async ({ canvasElement }) => {
  const sheet = await body(canvasElement).findByRole('dialog', { name: 'Title' })
  await expect(sheet).toHaveAttribute('data-side', 'right')
  await expect(sheet).toHaveAccessibleDescription('Subtitle')
})

export const Left = meta.story({ args: { open: true, focusOnOpen: false, side: 'left' } })
export const Top = meta.story({ args: { open: true, focusOnOpen: false, side: 'top' } })
export const Bottom = meta.story({ args: { open: true, focusOnOpen: false, side: 'bottom' } })
