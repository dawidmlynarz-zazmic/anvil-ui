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
          Rename
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
      >
        <PopoverHeader showCloseButton>
          <PopoverTitle>Rename conversation</PopoverTitle>
          <PopoverDescription>Shown in the sidebar and in shared links.</PopoverDescription>
        </PopoverHeader>
        <Input label="Name" defaultValue="Q3 launch plan" />
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
  title: 'Design System/Molecules/Popover',
  tags: ['molecule'],
  component: DemoPopover,
  parameters: {
    shadcn: 'popover',
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
    guide: {
      use: [
        'A small, interactive task anchored to its trigger: renaming a conversation, filtering sources, adjusting a setting in place.',
        'Content that needs a few controls but not the whole screen; it closes on outside click or Escape.',
      ],
      avoid: [
        'A list of actions: use Dropdown Menu. A read-only preview on hover: use Hover Card. A short label: use Tooltip.',
        'Long forms or decisions that need full attention: use Dialog (or Sheet for side tasks).',
        'Picking one value from a list: use Select or Combobox (they are popovers already).',
      ],
      content: [
        'Title says the task (“Rename conversation”); the description, when needed, adds one line of context.',
        'Footer actions say what they do (“Cancel”, “Save”); skip the footer when changes apply immediately.',
      ],
      a11y: [
        'Content is a `dialog` named by `PopoverTitle` and described by `PopoverDescription`.',
        'Focus moves into the popover on open and returns to the trigger on close; Escape closes it.',
        'It does not trap focus: keep it short so Tab doesn’t wander far from the trigger.',
      ],
    },
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
  const trigger = canvas.getByRole('button', { name: 'Rename' })
  await userEvent.click(trigger)
  const dialog = await body(canvasElement).findByRole('dialog', { name: 'Rename conversation' })
  await expect(dialog).toHaveAccessibleDescription('Shown in the sidebar and in shared links.')
  // Radix moves focus into the popover (first focusable: the header close, as drawn).
  await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true))
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).toBeNull())
  await expect(trigger).toHaveFocus()
})

/** Figma default: open (focus stays put until you interact). */
export const Open = meta.story({ args: { open: true, focusOnOpen: false } })

Open.test('opens on load without moving focus', async ({ canvasElement }) => {
  const dialog = await body(canvasElement).findByRole('dialog', { name: 'Rename conversation' })
  await expect(dialog).toHaveAccessibleDescription('Shown in the sidebar and in shared links.')
  await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(false)
})

/** Without a footer (Figma `show footer` off). */
export const WithoutFooter = meta.story({ args: { open: true, focusOnOpen: false, showFooter: false } })

export const SideTop = meta.story({ args: { open: true, focusOnOpen: false, side: 'top' } })
export const AlignStart = meta.story({ args: { open: true, focusOnOpen: false, align: 'start' } })
