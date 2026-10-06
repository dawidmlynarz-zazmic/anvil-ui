import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { FileOutputCard } from './file-output-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10729-2552'

const KINDS = ['document', 'presentation', 'spreadsheet', 'pdf'] as const

const meta = preview.meta({
  title: 'Agent Primitives/Messages/File Output Card',
  tags: ['composite'],
  component: FileOutputCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'file name', values: 'text', code: '`name` prop' },
      { property: 'file meta', values: 'text', code: '`meta` prop' },
      { property: 'type', values: 'document · presentation · spreadsheet · pdf', code: '`kind` prop' },
      { property: 'state', values: 'generating · ready', code: '`status` prop' },
    ],
    docs: {
      description: {
        component:
          'A file the agent generated (`@/components/agent/file-output-card`): `kind` document · presentation · spreadsheet · pdf (Figma type), `status` generating (`meta` says what it is doing, `progress`, `onCancel`) · ready (`meta` describes the file; `onPreview`, `onDownload`, `href` for Open).',
      },
    },
  },
  args: {
    kind: 'document' as const,
    status: 'ready' as const,
    name: 'Title',
    meta: 'Subtitle',
    progress: 60,
    href: '#file',
    onCancel: fn(),
    onPreview: fn(),
    onDownload: fn(),
  },
  argTypes: {
    kind: { control: 'inline-radio', options: KINDS },
    status: { control: 'inline-radio', options: ['generating', 'ready'] },
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

/** Figma type × state. */
export const Variants = meta.story({
  render: (args) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {KINDS.map((kind) =>
        (['generating', 'ready'] as const).map((status) => (
          <div key={`${kind}-${status}`} className="w-110">
            <FileOutputCard {...args} kind={kind} status={status} />
          </div>
        )),
      )}
    </div>
  ),
})

/** Generating: status, progress and Cancel. */
export const Generating = meta.story({ args: { status: 'generating' } })

Generating.test('shows progress and can be cancelled', async ({ canvas, args }) => {
  await expect(canvas.getByRole('progressbar', { name: 'Generating' })).toBeInTheDocument()
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
  await expect(args.onCancel).toHaveBeenCalledOnce()
})
