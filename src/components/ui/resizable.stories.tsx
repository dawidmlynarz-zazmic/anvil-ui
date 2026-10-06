import preview from '#.storybook/preview'
import { expect, userEvent, waitFor } from 'storybook/test'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-241'

type DemoProps = {
  orientation?: 'horizontal' | 'vertical'
  /** Figma `with handle`. */
  withHandle?: boolean
}

function DemoResizable({ orientation = 'horizontal', withHandle = true }: DemoProps) {
  return (
    <div className="h-60 w-120 overflow-hidden rounded-lg border border-border bg-background">
      <ResizablePanelGroup orientation={orientation}>
        <ResizablePanel defaultSize="50" minSize="20">
          <div className="flex h-full items-center justify-center type-text-sm-medium">Conversation</div>
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} aria-label="Resize preview" />
        <ResizablePanel defaultSize="50" minSize="20">
          <div className="flex h-full items-center justify-center type-text-sm-medium">
            Preview · q3-launch-plan.pdf
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

const meta = preview.meta({
  title: 'Molecules/Resizable',
  tags: ['molecule'],
  component: DemoResizable,
  parameters: {
    shadcn: 'resizable',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'orientation',
        values: 'horizontal · vertical',
        code: '`orientation` prop on `ResizablePanelGroup`',
      },
      { property: 'with handle', values: 'false · true', code: '`withHandle` prop on `ResizableHandle`' },
    ],
    guide: {
      use: [
        'Side-by-side work areas people size to the task: the conversation next to a file preview, an artifact or a code view.',
        'Set `minSize` so neither panel collapses into something unusable.',
      ],
      avoid: [
        'Temporary side content that comes and goes: use Sheet. Fixed app navigation: use Sidebar (it has its own collapse).',
        'Small screens: stack the panels or switch between them with Tabs.',
      ],
      content: [
        'Each panel has a visible heading so people know what they are resizing.',
        'Remember the user’s sizes between sessions when the layout is persistent.',
      ],
      a11y: [
        'The handle is a focusable `separator` with `aria-valuenow`; arrow keys resize.',
        'Give each handle an `aria-label` that names what it resizes (“Resize preview”).',
      ],
    },
    docs: {
      description: {
        component:
          'Resizable panels (shadcn/ui Resizable on react-resizable-panels): `ResizablePanelGroup` (`orientation`) › `ResizablePanel`s split by a `ResizableHandle` (`withHandle` shows the grip). Drag the handle or focus it and use the arrow keys. Panel sizes: strings are percentages, numbers pixels.',
      },
    },
  },
  args: { orientation: 'horizontal', withHandle: true },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    withHandle: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('the handle is a focusable separator that arrow keys move', async ({ canvas }) => {
  const handle = canvas.getByRole('separator', { name: 'Resize preview' })
  const before = Number(handle.getAttribute('aria-valuenow'))
  handle.focus()
  await userEvent.keyboard('{ArrowRight}')
  await waitFor(() => expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before))
})

/** Figma orientation × with handle. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <DemoResizable orientation="horizontal" withHandle={false} />
      <DemoResizable orientation="vertical" withHandle />
    </div>
  ),
})
