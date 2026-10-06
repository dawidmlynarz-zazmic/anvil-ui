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
type File = { name: string; fileName: string; fileSize: string; icon: LucideIcon }

const TYPES: File[] = [
  { name: 'Image', fileName: 'hero-image.png', fileSize: '1.2 MB', icon: ImageIcon },
  { name: 'Document', fileName: 'q3-launch-plan.pdf', fileSize: '2.4 MB', icon: FileTextIcon },
  { name: 'Audio', fileName: 'launch-sync-notes.m4a', fileSize: '3.6 MB', icon: MicIcon },
]

/** The meta line follows the state: progress while it runs, the error and next step, else the size. */
function metaFor(state: (typeof STATES)[number] | null | undefined, fileSize: string) {
  if (state === 'uploading') return 'Uploading…'
  if (state === 'processing') return 'Reading file…'
  if (state === 'error') return 'Couldn’t upload. Try again.'
  if (state === 'idle') return `${fileSize} · Not uploaded`
  return fileSize
}

function Demo({
  file = TYPES[1],
  onRemove,
  ...props
}: React.ComponentProps<typeof Attachment> & { file?: File; onRemove?: () => void }) {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <Icon icon={file.icon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.fileName}</AttachmentTitle>
        <AttachmentDescription>{metaFor(props.state, file.fileSize)}</AttachmentDescription>
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
  title: 'Design System/Molecules/Attachment',
  tags: ['molecule', 'input'],
  component: Demo,
  parameters: {
    shadcn: 'attachment',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'uploading · ready · invalid',
        code: '`state` prop (uploading · done · error; code adds idle · processing)',
      },
      {
        property: 'type',
        values: 'image · document · audio',
        code: 'content: the `<Icon>` (or image) in `AttachmentMedia` (not a prop)',
      },
      { property: 'file name', values: 'text', code: '`AttachmentTitle` children' },
      { property: 'file size', values: 'text', code: '`AttachmentDescription` children' },
      { property: 'show remove', values: 'boolean', code: 'render `AttachmentAction` or not' },
    ],
    guide: {
      use: [
        'Files the user adds to a prompt (in the Prompt Input tray) or that appear in a sent message.',
        '`state` follows the upload: uploading → processing → done, or error with a retry path.',
        'Wrap several in `AttachmentGroup` (a scrolling row); add `AttachmentTrigger` when the card opens the file.',
      ],
      avoid: [
        'A file the agent produced: use File Output Card, not a prompt attachment.',
        'A cited web page: use Citation Source Item. Tags and filters: use Chip.',
      ],
      content: [
        'Title: the exact file name (“q3-launch-plan.pdf”). Meta: size (“2.4 MB”) or the current step (“Uploading…”).',
        'Errors say what went wrong and what to do (“Couldn’t upload. Try again.”).',
      ],
      a11y: [
        'Icon-only actions need `aria-label` (“Remove”); name the file when several are in view.',
        '`AttachmentTrigger` needs an accessible name (“Open q3-launch-plan.pdf”); it comes before the actions in tab order.',
        'The error state is shown by the meta text as well as the border color.',
      ],
    },
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
    file: { control: false },
    onRemove: { control: false, table: { category: 'Events' } },
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
        TYPES.map((file) => <Demo key={`${state}-${file.name}`} state={state} file={file} />),
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
      <Demo state="idle" file={TYPES[1]} />
      <Demo state="processing" file={TYPES[1]} />
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
      {TYPES.map((file) => (
        <Demo key={file.name} orientation="vertical" file={file} />
      ))}
    </div>
  ),
})

/** `AttachmentTrigger` covers the card so it opens the file; the remove action stays on top. */
export const Interactive = meta.story({
  render: () => (
    <Attachment>
      <AttachmentTrigger aria-label="Open q3-launch-plan.pdf" />
      <AttachmentMedia>
        <Icon icon={FileTextIcon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>q3-launch-plan.pdf</AttachmentTitle>
        <AttachmentDescription>2.4 MB</AttachmentDescription>
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
  await expect(canvas.getByRole('button', { name: 'Open q3-launch-plan.pdf' })).toHaveFocus()
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Remove' })).toHaveFocus()
})

const GROUP: File[] = [
  { name: 'Deck', fileName: 'launch-deck.pptx', fileSize: '8.1 MB', icon: FileTextIcon },
  TYPES[1],
  { name: 'Sheet', fileName: 'pricing-research.xlsx', fileSize: '380 KB', icon: FileTextIcon },
  { name: 'Email', fileName: 'onboarding-email.docx', fileSize: '42 KB', icon: FileTextIcon },
  TYPES[0],
  TYPES[2],
]

/** A scrolling row (Figma attachment tray in the prompt input); the edges fade. */
export const Group = meta.story({
  render: () => (
    <AttachmentGroup className="w-120">
      {GROUP.map((file, i) => (
        <Demo key={file.fileName} file={file} state={i === 0 ? 'uploading' : 'done'} />
      ))}
    </AttachmentGroup>
  ),
})
