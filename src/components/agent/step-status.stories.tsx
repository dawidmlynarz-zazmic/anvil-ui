import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { StepStatusIcon } from './step-status'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13166'

const STATUSES = ['running', 'done', 'failed'] as const

const meta = preview.meta({
  title: 'Agent Primitives/Agent States/Step Status Icon',
  tags: ['element'],
  component: StepStatusIcon,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // No Figma component of its own: the status indicator inside thinking panel, tool call item and
    // tool log line (their `status`).
    figmaProps: [],
    docs: {
      description: {
        component:
          'The status of an agent step (`@/components/agent/step-status`): running = pulse dot, done, failed. One vocabulary for Thinking Panel, Tool Call Item, Tool Call Accordion and Tool Log Line (audit M7). `appearance` default (success circle-check · danger circle-x) · subtle (muted check · danger circle-alert). Decorative.',
      },
    },
  },
  args: { status: 'done' as const, appearance: 'default' as const },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    appearance: { control: 'inline-radio', options: ['default', 'subtle'] },
  },
})

/** Status and appearance are in Controls. */
export const Default = meta.story()

Default.test('is decorative', async ({ canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=step-status-icon]')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
})

/** Every status in both appearances. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      {(['default', 'subtle'] as const).map((appearance) => (
        <div key={appearance} className="flex items-center gap-4">
          {STATUSES.map((status) => (
            <StepStatusIcon key={status} status={status} appearance={appearance} />
          ))}
        </div>
      ))}
    </div>
  ),
})
