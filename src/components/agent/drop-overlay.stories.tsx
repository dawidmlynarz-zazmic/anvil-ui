import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { DropOverlay } from './drop-overlay'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-3012'

const meta = preview.meta({
  title: 'Agent Builder/Drop Overlay',
  tags: ['agent-builder', 'input'],
  component: DropOverlay,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'state', values: 'ready · invalid', code: '`status` prop' }],
    docs: {
      description: {
        component:
          "Shown over the chat while files are dragged in (`@/components/agent/drop-overlay`): `status` ready · invalid, `title` (defaults to Figma's copy), `detail`. A polite live region. Place it over the drop target and drive `status` from your drag handlers.",
      },
    },
  },
  args: { status: 'ready', detail: 'Subtitle' },
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
      <DropOverlay {...args} status="invalid" />
    </div>
  ),
})
