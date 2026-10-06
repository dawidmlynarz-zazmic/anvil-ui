import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { StepStatusIcon } from './step-status'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13166'

const STATUSES = ['running', 'done', 'failed'] as const

const meta = preview.meta({
  title: 'Atoms/Step Status Icon',
  tags: ['atom', 'agent-status'],
  component: StepStatusIcon,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // No Figma component of its own: the status indicator inside thinking panel, tool call item and
    // tool log line (their `status`).
    figmaProps: [],
    guide: {
      use: [
        'The status of an agent step: Thinking Panel, Tool Call Item, Tool Call Accordion, Tool Log Line.',
        '`appearance="subtle"` inside the Thinking Panel; `default` in tool rows.',
      ],
      avoid: [
        'A status label with text: use Badge. The result of an action: use Action Status.',
        'General loading: use Spinner.',
      ],
      content: [
        'The step text carries the status: “Searched 6 sites” when done, an error with a next step when failed.',
      ],
      a11y: [
        'Decorative (`aria-hidden`): the step text must say running, done or failed.',
        'Success and danger colors only repeat what the text says.',
      ],
    },
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
