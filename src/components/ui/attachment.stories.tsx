import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from './attachment'
import { FileTextIcon, Icon, ImageIcon, MicIcon, XIcon, type LucideIcon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10664-11958'

const STATES = ['idle', 'uploading', 'processing', 'error', 'done'] as const
const TYPES: { name: string; icon: LucideIcon }[] = [
  { name: 'Image', icon: ImageIcon },
  { name: 'Document', icon: FileTextIcon },
  { name: 'Audio', icon: MicIcon },
]

function Demo({
  icon = ImageIcon,
  onRemove,
  ...props
}: React.ComponentProps<typeof Attachment> & { icon?: LucideIcon; onRemove?: () => void }) {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <Icon icon={icon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>Title</AttachmentTitle>
        <AttachmentDescription>Subtitle</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove" onClick={onRemove}>
          <Icon icon={XIcon} />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Primitives/Attachment',
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A file attached to a prompt or message (shadcn/ui Attachment; Figma Core Kit › prompt attachment). `Attachment` (`state`, `size`, `orientation`) › `AttachmentMedia` (icon or image tile), `AttachmentContent` › `AttachmentTitle` + `AttachmentDescription`, `AttachmentActions` › `AttachmentAction` (ghost icon button). `AttachmentTrigger` makes the whole card open the file; `AttachmentGroup` scrolls a row of them. Figma state uploading · ready · invalid = `state` uploading · done · error; the title shimmers while uploading or processing.',
      },
    },
  },
  args: { state: 'done', size: 'default', orientation: 'horizontal', onRemove: fn() },
  argTypes: {
    state: { control: 'select', options: STATES },
    size: { control: 'inline-radio', options: ['default', 'sm', 'xs'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: (args) => <Demo {...args} />,
})

/** State, size and orientation are in Controls. */
export const Default = meta.story()

Default.test('remove is a named button', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Remove' }))
  await expect(args.onRemove).toHaveBeenCalledOnce()
})

/** Figma types (image, document, audio) × states (uploading, ready, invalid). */
export const States = meta.story({
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(['uploading', 'done', 'error'] as const).map((state) =>
        TYPES.map(({ name, icon }) => <Demo key={`${state}-${name}`} state={state} icon={icon} />),
      )}
    </div>
  ),
})

States.test('error and uploading are marked on the card', async ({ canvasElement }) => {
  await expect(canvasElement.querySelectorAll('[data-slot=attachment][data-state=error]')).toHaveLength(3)
  await expect(canvasElement.querySelectorAll('[data-slot=attachment][data-state=uploading]')).toHaveLength(3)
})

/** shadcn's other states: idle (dashed, not yet uploaded) and processing (shimmering title). */
export const IdleAndProcessing = meta.story({
  render: () => (
    <div className="flex gap-4">
      <Demo state="idle" icon={FileTextIcon} />
      <Demo state="processing" icon={FileTextIcon} />
    </div>
  ),
})

/** `default` is the Figma size; `sm` and `xs` step down. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
})

/** Vertical cards: a large tile with the actions over its corner. */
export const Vertical = meta.story({
  render: () => (
    <div className="flex gap-4">
      {TYPES.map(({ name, icon }) => (
        <Demo key={name} orientation="vertical" icon={icon} />
      ))}
    </div>
  ),
})

/** `AttachmentTrigger` covers the card so it opens the file; the remove action stays on top. */
export const Interactive = meta.story({
  render: () => (
    <Attachment>
      <AttachmentTrigger aria-label="Open" />
      <AttachmentMedia>
        <Icon icon={FileTextIcon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>Title</AttachmentTitle>
        <AttachmentDescription>Subtitle</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove">
          <Icon icon={XIcon} />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
})

Interactive.test('open, then remove, in tab order', async ({ canvas }) => {
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus()
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Remove' })).toHaveFocus()
})

/** A scrolling row (Figma attachment tray in the prompt input); the edges fade. */
export const Group = meta.story({
  render: () => (
    <AttachmentGroup className="w-120">
      {Array.from({ length: 6 }, (_, i) => (
        <Demo key={i} icon={TYPES[i % 3].icon} state={i === 0 ? 'uploading' : 'done'} />
      ))}
    </AttachmentGroup>
  ),
})
