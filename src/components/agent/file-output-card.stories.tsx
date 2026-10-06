import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { FileOutputCard } from './file-output-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10729-2552'

const KINDS = ['document', 'presentation', 'spreadsheet', 'pdf'] as const

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/File Output Card',
  tags: ['agent-builder', 'widgets'],
  component: FileOutputCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'file name', values: 'text', code: '`name` prop' },
      { property: 'file meta', values: 'text', code: '`meta` prop' },
      { property: 'type', values: 'document · presentation · spreadsheet · pdf', code: '`kind` prop' },
      {
        property: 'state',
        values: 'generating · ready',
        code: '`status` prop (adds failed); built on Attachment size lg',
      },
    ],
    guide: {
      use: [
        'When the agent creates a file as the result of a task: a deck, a document, a spreadsheet, a PDF.',
        'Show it while it’s being made (`status` generating with `progress`), then swap to ready in place.',
        'Offer the next step on the card: Preview, Download, or Open in the app it lives in (`href`).',
      ],
      avoid: [
        'Files the user attached to a message: use Attachment.',
        'Images and audio shown inline in the answer: use Widget Media (or Image Generation Card for images the agent makes).',
        'A long document the user will read and edit next to the chat: use Artifact Panel.',
      ],
      content: [
        '`name`: the real file name with its extension (`launch-deck.pptx`).',
        '`meta` when ready: type and size (“PowerPoint · 8.1 MB”); while generating, what the agent is doing (“Building slides 6 of 12…”).',
        'Failed: what went wrong and that Retry is possible (“Couldn’t finish the deck. Try again.”).',
      ],
      a11y: [
        'The progress bar is named “Generating”; Cancel, Preview, Download and Retry are labelled buttons.',
        'Open is a real link (`href`), so it can be opened in a new tab and is announced as a link.',
        'The `kind` icon is decorative; the extension in `name` says the file type in text.',
      ],
    },
    docs: {
      description: {
        component:
          'A file the agent generated (`@/components/agent/file-output-card`): `kind` document · presentation · spreadsheet · pdf (Figma type), `status` generating (`meta` says what it is doing, `progress`, `onCancel`) · ready (`meta` describes the file; `onPreview`, `onDownload`, `href` for Open).',
      },
    },
  },
  args: {
    kind: 'presentation' as const,
    status: 'ready' as const,
    name: 'launch-deck.pptx',
    meta: 'PowerPoint · 8.1 MB',
    progress: 60,
    href: '#file',
    onCancel: fn(),
    onPreview: fn(),
    onDownload: fn(),
  },
  argTypes: {
    kind: { control: 'inline-radio', options: KINDS },
    status: { control: 'inline-radio', options: ['generating', 'ready', 'failed'] },
    onRetry: { control: false, table: { category: 'Events' } },
    progress: { control: { type: 'range', min: 0, max: 100 } },
    name: { control: 'text' },
    meta: { control: 'text' },
    href: { control: 'text' },
    onCancel: { control: false, table: { category: 'Events' } },
    onPreview: { control: false, table: { category: 'Events' } },
    onDownload: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="w-110">
      <FileOutputCard {...args} />
    </div>
  ),
})

/** Kind, status, progress and the text are in Controls. */
export const Default = meta.story()

Default.test('a ready file offers Preview, Download and Open', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Download' }))
  await expect(args.onDownload).toHaveBeenCalledOnce()
  await expect(canvas.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '#file')
})

const FILES = {
  document: { name: 'onboarding-email.docx', ready: 'Word · 42 KB', generating: 'Drafting the email…' },
  presentation: {
    name: 'launch-deck.pptx',
    ready: 'PowerPoint · 8.1 MB',
    generating: 'Building slides 6 of 12…',
  },
  spreadsheet: {
    name: 'pricing-research.xlsx',
    ready: 'Excel · 380 KB',
    generating: 'Adding competitor prices…',
  },
  pdf: { name: 'q3-launch-plan.pdf', ready: 'PDF · 2.4 MB', generating: 'Exporting to PDF…' },
} as const

/** Figma type × state. */
export const Variants = meta.story({
  render: (args) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {KINDS.map((kind) =>
        (['generating', 'ready'] as const).map((status) => (
          <div key={`${kind}-${status}`} className="w-110">
            <FileOutputCard
              {...args}
              kind={kind}
              status={status}
              name={FILES[kind].name}
              meta={FILES[kind][status]}
            />
          </div>
        )),
      )}
    </div>
  ),
})

/** Generating: status, progress and Cancel. */
export const Generating = meta.story({ args: { status: 'generating', meta: 'Building slides 6 of 12…' } })

/**
 * Generation failed: Attachment's error look and Retry. Figma draws no failed file output card;
 * the look is the prompt attachment's invalid state (audit M8).
 */
export const Failed = meta.story({
  args: { status: 'failed', meta: 'Couldn’t finish the deck. Try again.', onRetry: fn() },
})

Failed.test('offers Retry', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
})

Generating.test('shows progress and can be cancelled', async ({ canvas, args }) => {
  await expect(canvas.getByRole('progressbar', { name: 'Generating' })).toBeInTheDocument()
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
  await expect(args.onCancel).toHaveBeenCalledOnce()
})
