import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { DropOverlay } from './drop-overlay'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-3012'

const meta = preview.meta({
  title: 'Agent Builder/Input/Drop Overlay',
  tags: ['agent-builder', 'input'],
  component: DropOverlay,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'state', values: 'ready · invalid', code: '`status` prop' }],
    guide: {
      use: [
        'Over the thread or Prompt Input while the user drags files in, so they see where to drop.',
        'Switch `status` to invalid as soon as the dragged type or size can’t be accepted, before the drop.',
      ],
      avoid: [
        'Showing attached files: use the attachment chips in Prompt Input.',
        'Errors after an upload (failed, too large on the server): use an Alert or Toast, not this overlay.',
        'A permanent upload area: this appears only during a drag.',
      ],
      content: [
        'Title: keep the defaults (“Drop files to attach”, “This file type isn’t supported”) unless the target is specific.',
        '`detail`: the accepted types and size limit (“PDF, DOCX, XLSX up to 25 MB”); when invalid, say what is accepted.',
      ],
      a11y: [
        'It is a polite live region (`role="status"`), so the state change is announced.',
        'Dragging is pointer-only: keep the Attach button in Prompt Input as the keyboard path.',
        'Invalid uses an icon and text, not only the red tint.',
      ],
    },
    docs: {
      description: {
        component:
          "Shown over the chat while files are dragged in (`@/components/agent/drop-overlay`): `status` ready · invalid, `title` (defaults to Figma's copy), `detail`. A polite live region. Place it over the drop target and drive `status` from your drag handlers.",
      },
    },
  },
  args: { status: 'ready', detail: 'PDF, DOCX, XLSX up to 25 MB' },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'invalid'] },
    title: { control: 'text' },
    detail: { control: 'text' },
  },
  render: (args) => (
    <div className="max-w-(--shell-thread-max)">
      <DropOverlay {...args} />
    </div>
  ),
})

/** Status and detail are in Controls. */
export const Default = meta.story()

Default.test('announces the drop target', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Drop files to attach')
})

/** Figma state: ready and invalid. */
export const States = meta.story({
  render: (args) => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-4">
      <DropOverlay {...args} status="ready" />
      <DropOverlay
        {...args}
        status="invalid"
        detail="Only PDF, DOCX and XLSX files up to 25 MB can be attached"
      />
    </div>
  ),
})
