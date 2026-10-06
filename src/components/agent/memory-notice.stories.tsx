import preview from '#.storybook/preview'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, PencilIcon, RotateCcwIcon, Trash2Icon } from '@/components/ui/icon'

import { MemoryNotice, type MemoryNoticeStatus } from './memory-notice'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10737-3110'

const STATUSES = ['used', 'not-used', 'saved', 'updated', 'forgotten'] as const

const MEMORY = 'Prefers concise answers with bullet points'

const details = (
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

const manage = (
  <Button variant="ghost" intent="neutral" size="xs" shape="pill">
    Manage
  </Button>
)

const undo = (
  <Button variant="ghost" intent="neutral" size="xs">
    <Icon icon={RotateCcwIcon} />
    Undo
  </Button>
)

/** The action each status shows: Manage inside the pill, Undo beside the not-used badge. */
const actionFor = (status: MemoryNoticeStatus) =>
  status === 'not-used' ? undo : status === 'used' ? undefined : manage

const meta = preview.meta({
  title: 'Agent Builder/Memory/Memory Notice',
  tags: ['agent-builder', 'memory'],
  component: MemoryNotice,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'memory', values: 'text', code: 'children' },
      {
        property: 'memory in use · state',
        values: 'inline · details · not used',
        code: '`status` used (details = the popover: `title`, `description`, `actions`, `open`) · not-used',
      },
      {
        property: 'memory chip (10730:2778) · state',
        values: 'saved · updated · forgotten',
        code: '`status` saved · updated · forgotten; `label` overrides the label',
      },
      { property: 'action', values: 'button', code: '`action` (Manage in the pill, Undo beside not-used)' },
    ],
    guide: {
      use: [
        'Under an answer, when a remembered fact shaped it (used) or the user chose to answer without it (not-used).',
        'Right after the assistant saves, updates or forgets a memory, so the change is never silent.',
        'Give used a `title`, `description` and `actions` (Skip, Edit, Forget) so the user can correct it in place.',
      ],
      avoid: [
        'Reviewing or clearing all memories: use Memory Manager (link to it with Manage).',
        'Instructions that apply to the whole thread or project: use Instructions Banner.',
        'Generic success messages: use Sonner (Toast).',
      ],
      content: [
        'The memory: one fact as a short phrase about the user (“Prefers concise answers with bullet points”).',
        'Popover description: first person and specific (“I kept this answer short because you prefer…”).',
        'Status labels stay as built (“Saved to memory”, “Memory updated”, “Forgotten”); actions are Manage or Undo.',
      ],
      a11y: [
        'Saved, updated and forgotten are `role="status"`, so the change is announced.',
        'The used pill is a button that opens a Popover dialog named by `title` and described by `description`.',
        'The memory text truncates visually but is read in full.',
      ],
    },
    docs: {
      description: {
        component:
          'The inline memory line under an answer (`@/components/agent/memory-notice`; Figma memory in use + memory chip, merged): `status` used (agent pill; with `title` / `description` / `actions` it opens a Popover) · not-used (neutral Badge + `action`) · saved · updated · forgotten (a muted status pill with the memory and an `action`, announced as a status). `open` is a live control.',
      },
      story: { inline: false, height: '240px' },
    },
  },
  args: {
    status: 'used' as const,
    open: false,
    title: 'Memory used',
    description: 'I kept this answer short because you prefer concise answers with bullet points.',
    children: MEMORY,
  },
  argTypes: {
    status: { control: 'select', options: STATUSES },
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
    label: { control: 'text' },
    children: { control: 'text' },
    actions: { control: false },
    action: { control: false },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onOpenAutoFocus: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <MemoryNotice {...args} actions={details} action={actionFor(args.status ?? 'used')} />,
})

/** Status and open are in Controls. */
export const Default = meta.story()

Default.test('the used pill opens the memory details', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: MEMORY }))
  const body = within(canvasElement.ownerDocument.body)
  const dialog = await body.findByRole('dialog', { name: 'Memory used' })
  await expect(dialog).toHaveAccessibleDescription(
    'I kept this answer short because you prefer concise answers with bullet points.',
  )
  await expect(within(dialog).getByRole('button', { name: 'Forget' })).toBeInTheDocument()
})

/** Figma memory in use · details: the popover open on load. */
export const Details = meta.story({
  args: { open: true },
  render: (args) => (
    <MemoryNotice {...args} actions={details} onOpenAutoFocus={(e) => e.preventDefault()}>
      {MEMORY}
    </MemoryNotice>
  ),
})

/** Every status: used, not used, saved, updated, forgotten. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      {STATUSES.map((status) => (
        <MemoryNotice
          key={status}
          {...args}
          title={undefined}
          description={undefined}
          status={status}
          action={actionFor(status)}
        />
      ))}
    </div>
  ),
})

Statuses.test('changes are announced; not used offers Undo', async ({ canvas }) => {
  const notices = canvas.getAllByRole('status')
  await expect(notices).toHaveLength(3)
  await expect(notices[0]).toHaveTextContent(`Saved to memory· ${MEMORY}`)
  await expect(canvas.getByRole('button', { name: 'Undo' })).toBeVisible()
})

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column truncate, never overflow. */
export const LongContent = meta.story({
  args: { status: 'saved', children: `${LONG} ${UNBROKEN}` },
  render: (args) => (
    <div className="w-80">
      <MemoryNotice {...args} action={manage} />
    </div>
  ),
})

LongContent.test('stays in its column', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=memory-notice]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
  }
})
