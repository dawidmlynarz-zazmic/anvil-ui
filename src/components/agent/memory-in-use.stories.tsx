import preview from '#.storybook/preview'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, PencilIcon, RotateCcwIcon, Trash2Icon } from '@/components/ui/icon'

import { MemoryInUse } from './memory-in-use'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10737-3110'

const actions = (
  <>
    <Button variant="outline" intent="neutral" size="xs">
      Skip
    </Button>
    <Button variant="ghost" intent="neutral" size="xs">
      <Icon icon={PencilIcon} />
      Edit
    </Button>
    <Button variant="ghost" intent="destructive" size="xs">
      <Icon icon={Trash2Icon} />
      Forget
    </Button>
  </>
)

const meta = preview.meta({
  title: 'Agent Primitives/System & Context/Memory In Use',
  tags: ['composite'],
  component: MemoryInUse,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'memory', values: 'text', code: 'children' },
      {
        property: 'state',
        values: 'inline · details · not used',
        code: '`used` prop + `open` prop (details = open popover; not used = `used={false}`)',
      },
    ],
    docs: {
      description: {
        component:
          'Marks an answer that used memory (`@/components/agent/memory-in-use`). The chip opens a Popover with `title`, `description` and `actions` (Figma details); `used={false}` shows the muted not-used chip with `undo`. `open` is a live control.',
      },
      story: { inline: false, height: '240px' },
    },
  },
  args: { used: true, open: false, title: 'Title', description: 'Subtitle', children: 'Label' },
  argTypes: {
    used: { control: 'boolean' },
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
    children: { control: 'text' },
    actions: { control: false },
    undo: { control: false },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onOpenAutoFocus: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <MemoryInUse
      {...args}
      actions={actions}
      undo={
        <Button variant="ghost" intent="neutral" size="xs">
          <Icon icon={RotateCcwIcon} />
          Undo
        </Button>
      }
    />
  ),
})

/** Used and open are in Controls. */
export const Default = meta.story()

Default.test('the chip opens the memory details', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Label' }))
  const body = within(canvasElement.ownerDocument.body)
  const dialog = await body.findByRole('dialog', { name: 'Title' })
  await expect(dialog).toHaveAccessibleDescription('Subtitle')
  await expect(within(dialog).getByRole('button', { name: 'Forget' })).toBeInTheDocument()
})

/** Figma details: the popover open on load. */
export const Details = meta.story({
  args: { open: true },
  render: (args) => (
    <MemoryInUse {...args} actions={actions} onOpenAutoFocus={(e) => e.preventDefault()}>
      Label
    </MemoryInUse>
  ),
})

/** Figma not used: left out of this answer, with Undo. */
export const NotUsed = meta.story({ args: { used: false } })

NotUsed.test('offers undo', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Undo' })).toBeVisible()
})
