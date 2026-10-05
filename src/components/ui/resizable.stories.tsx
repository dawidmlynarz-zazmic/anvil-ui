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
          <div className="flex h-full items-center justify-center type-text-sm-medium">Label 1</div>
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} aria-label="Label" />
        <ResizablePanel defaultSize="50" minSize="20">
          <div className="flex h-full items-center justify-center type-text-sm-medium">Label 2</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

const meta = preview.meta({
  title: 'Components/Resizable',
  component: DemoResizable,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Resizable panels (shadcn/ui Resizable on react-resizable-panels): `ResizablePanelGroup` (`orientation`) › `ResizablePanel`s split by a `ResizableHandle` (`withHandle` shows the grip). Drag the handle or focus it and use the arrow keys. Panel sizes: strings are percentages, numbers pixels.',
      },
    },
  },
  args: { orientation: 'horizontal', withHandle: true },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
})

export const Default = meta.story()

Default.test('the handle is a focusable separator that arrow keys move', async ({ canvas }) => {
  const handle = canvas.getByRole('separator', { name: 'Label' })
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
