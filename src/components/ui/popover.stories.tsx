import preview from '#.storybook/preview'
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
  onOpenChange?: (open: boolean) => void
  /** Story-only: false for stories that open on load, so focus stays put until you interact. */
  focusOnOpen?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  showFooter?: boolean
}

function DemoPopover({
  open,
  onOpenChange,
  focusOnOpen = true,
  side = 'bottom',
  align = 'center',
  showFooter = true,
}: DemoProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" intent="neutral">
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
      >
        <PopoverHeader showCloseButton>
          <PopoverTitle>Title</PopoverTitle>
          <PopoverDescription>Subtitle</PopoverDescription>
        </PopoverHeader>
        <Input label="Label" defaultValue="Value" />
        {showFooter && (
          <PopoverFooter>
            <PopoverClose asChild>
              <Button size="sm" variant="outline" intent="neutral">
                Cancel
              </Button>
            </PopoverClose>
            <Button size="sm">Save</Button>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  )
}

const meta = preview.meta({
  title: 'UI Components/Popover',
  tags: ['ui-component'],
  component: DemoPopover,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'show header', values: 'boolean', code: 'render `PopoverHeader` or not' },
      { property: 'content', values: 'slot', code: '`PopoverContent` children' },
      {
        property: 'show footer',
        values: 'boolean',
        code: 'render `PopoverFooter` or not (story `showFooter`)',
      },
    ],
    docs: {
      story: { inline: false, height: '360px' },
      description: {
        component:
          'Floating panel anchored to a trigger for interactive content (shadcn/ui Popover on Radix). `PopoverHeader` (ShellHeader inline: title, description, close) → content → optional `PopoverFooter` (ShellFooter inline). 288px wide, 16px padding, elevation/raised. `side` / `align` place it. Use Tooltip for short labels.',
      },
    },
  },
  args: { open: false, side: 'bottom', align: 'center', showFooter: true },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    open: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
    focusOnOpen: { table: { disable: true } },
  },
})

const body = (el: HTMLElement) => within(el.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test('trigger opens, Escape closes and focus returns', async ({ canvas, canvasElement }) => {
  const trigger = canvas.getByRole('button', { name: 'Open popover' })
  await userEvent.click(trigger)
  const dialog = await body(canvasElement).findByRole('dialog', { name: 'Title' })
  await expect(dialog).toHaveAccessibleDescription('Subtitle')
  // Radix moves focus into the popover (first focusable: the header close, as drawn).
  await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true))
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
  await expect(trigger).toHaveFocus()
})

/** Figma default: open (focus stays put until you interact). */
export const Open = meta.story({ args: { open: true, focusOnOpen: false } })

Open.test('opens on load without moving focus', async ({ canvasElement }) => {
  const dialog = await body(canvasElement).findByRole('dialog', { name: 'Title' })
  await expect(dialog).toHaveAccessibleDescription('Subtitle')
  await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(false)
})

/** Without a footer (Figma `show footer` off). */
export const WithoutFooter = meta.story({ args: { open: true, focusOnOpen: false, showFooter: false } })

export const SideTop = meta.story({ args: { open: true, focusOnOpen: false, side: 'top' } })
export const AlignStart = meta.story({ args: { open: true, focusOnOpen: false, align: 'start' } })
