import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { FileSpreadsheetIcon, FileTextIcon, Icon, XIcon } from '@/components/ui/icon'

import { ProjectSetup } from './project-setup'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2624'

const FILES = [
  { name: 'q3-kpis.xlsx', meta: 'Spreadsheet · 96 KB', icon: FileSpreadsheetIcon },
  { name: 'launch-deck-q2.pdf', meta: 'PDF · 2.4 MB', icon: FileTextIcon },
  { name: 'launch-memo.docx', meta: 'Document · 64 KB', icon: FileTextIcon },
]

const onRemove = fn()

const FILE_LIST = FILES.map((file) => (
  <Attachment key={file.name}>
    <AttachmentMedia>
      <Icon icon={file.icon} />
    </AttachmentMedia>
    <AttachmentContent>
      <AttachmentTitle>{file.name}</AttachmentTitle>
      <AttachmentDescription>{file.meta}</AttachmentDescription>
    </AttachmentContent>
    <AttachmentActions>
      <AttachmentAction aria-label={`Remove ${file.name}`} onClick={() => onRemove(file.name)}>
        <Icon icon={XIcon} />
      </AttachmentAction>
    </AttachmentActions>
  </Attachment>
))

const meta = preview.meta({
  title: 'Agent Builder/Shell/Project Setup',
  tags: ['agent-builder'],
  component: ProjectSetup,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'name', values: 'text field', code: 'Input `label="Name"` (`defaultValues.name`)' },
      {
        property: 'instructions',
        values: 'textarea',
        code: 'Textarea `label="Instructions"` (`defaultValues.instructions`)',
      },
      {
        property: 'knowledge files',
        values: 'file rows',
        code: '`children` (Attachments with a remove action)',
      },
      { property: 'dropzone', values: 'meta item', code: '`uploadHint` and `onBrowse`' },
      {
        property: 'card footer',
        values: 'Cancel · Create project',
        code: '`onCancel`, `submitLabel`, `onSubmit`',
      },
    ],
    guide: {
      use: [
        'To create a project or edit its settings: a name, instructions every chat in it follows, and the files it can use.',
        'Put it in a Dialog or a page; pass `submitLabel="Save changes"` and `defaultValues` when editing.',
      ],
      avoid: [
        'Showing a project’s instructions in a chat: use Instructions Banner.',
        'The header above a project’s chats: use Project Header.',
      ],
      content: [
        'Name: what the team calls the work (“Q3 launch plan”).',
        'Instructions: how the assistant should work here, in the user’s words (“Lead with the numbers, cite the source file.”).',
        '`uploadHint`: accepted types and the size limit.',
      ],
      a11y: [
        'It is a `<form>` named by its title; Name is required, and submitting with Enter works from the Name field.',
        'Each file’s remove button is named after the file (“Remove q3-kpis.xlsx”).',
      ],
    },
    docs: {
      description: {
        component:
          'Create or edit a project (`@/components/agent/project-setup`): a form on Card with the card Shell Header (agent Icon Tile), Name (Input), Instructions (Textarea), Knowledge files (`children`, Attachments) with the upload hint (`onBrowse`), and the card Shell Footer (Cancel + `submitLabel`).',
      },
    },
  },
  args: {
    title: 'New project',
    description: 'Chats in a project share instructions and files',
    submitLabel: 'Create project',
    uploadHint: 'PDF, DOCX, XLSX, up to 30 MB',
    defaultValues: {
      name: 'Q3 launch plan',
      instructions:
        'You help the launch team prepare the Q3 launch review. Be concise, lead with the numbers, and cite the source file for every figure.',
    },
    onSubmit: fn(),
    onCancel: fn(),
    onBrowse: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    submitLabel: { control: 'text' },
    uploadHint: { control: 'text' },
    defaultValues: { control: 'object' },
    children: { control: false },
    onSubmit: { control: false, table: { category: 'Events' } },
    onCancel: { control: false, table: { category: 'Events' } },
    onBrowse: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <ProjectSetup {...args} className="w-140">
      {FILE_LIST}
    </ProjectSetup>
  ),
})

/** Title, labels and the starting values are in Controls. */
export const Default = meta.story()

Default.test('submits the name and instructions', async ({ canvas, args }) => {
  const name = canvas.getByRole('textbox', { name: 'Name' })
  await userEvent.clear(name)
  await userEvent.type(name, 'Northwind Sync launch')
  await userEvent.click(canvas.getByRole('button', { name: 'Create project' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({
    name: 'Northwind Sync launch',
    instructions: args.defaultValues?.instructions,
  })
})

Default.test('removes a file and opens the file picker', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Remove q3-kpis.xlsx' }))
  await expect(onRemove).toHaveBeenCalledWith('q3-kpis.xlsx')
  await userEvent.click(canvas.getByRole('button', { name: 'browse' }))
  await expect(args.onBrowse).toHaveBeenCalledOnce()
})

/** A new, empty project: no files yet. */
export const Empty = meta.story({
  args: { defaultValues: { name: '', instructions: '' } },
  render: (args) => <ProjectSetup {...args} className="w-140" />,
})

/** Editing an existing project. */
export const Edit = meta.story({
  args: {
    title: 'Project settings',
    description: 'Changes apply to every chat in Q3 launch plan',
    submitLabel: 'Save changes',
  },
})
