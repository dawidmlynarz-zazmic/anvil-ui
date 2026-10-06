import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from '@/components/ui/button'

import { ActionStatus, type ActionStatusValue } from './action-status'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10814-3499'

const STATUSES = ['executing', 'done', 'failed', 'expired', 'undone'] as const
const ACTION: Record<ActionStatusValue, string> = {
  executing: 'Cancel',
  done: 'Undo',
  failed: 'Retry',
  expired: 'Request again',
  undone: 'Redo',
}
/** The beta invite email (send_email) through its lifecycle. */
const MESSAGE: Record<ActionStatusValue, string> = {
  executing: 'Sending to 24 recipients…',
  done: 'Sent to 24 recipients',
  failed: 'Couldn’t reach Mail. Check the connection and try again.',
  expired: 'Approval expired after 24 hours',
  undone: 'Email unsent',
}

const meta = preview.meta({
  title: 'Molecules/Action Status',
  tags: ['molecule', 'actions'],
  component: ActionStatus,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'executing · done · failed · expired · undone', code: '`status` prop' },
      { property: 'message', values: 'text', code: 'children' },
    ],
    guide: {
      use: [
        'The bottom strip of an action card (Approval Card, Connector Card) once the user has decided: executing with `progress`, then done, failed, expired or undone.',
        'One follow-up `action` per state: Cancel while running, Undo when done, Retry when failed, Request again when expired.',
      ],
      avoid: [
        'Progress of the agent’s own steps: use Tool Log Line or Tool Call Accordion. A page-level notice: use Alert or a Toast (Sonner).',
        'A standalone progress indicator with no card: use Progress.',
      ],
      content: [
        'Present participle while running (“Sending to 24 recipients…”), past tense when done (“Sent to 24 recipients”).',
        'Failures say what went wrong and what to do (“Couldn’t reach Mail. Check the connection and try again.”).',
      ],
      a11y: [
        '`role="status"`: each change is announced politely without moving focus.',
        'The state is carried by the icon and the message text, not only the tint.',
        'The progress bar is a named `progressbar`; the xs action is a real Button.',
      ],
    },
    docs: {
      description: {
        component:
          'The lifecycle strip at the bottom of an action card, in place of its footer (`@/components/agent/action-status`): Approval Card, Connector Card, and later payment and booking cards. `status` executing (pulse and `progress`) · done · failed · expired · undone, the message as children, `action` an xs Button. role=status, so the change is announced.',
      },
    },
  },
  args: { status: 'executing' as const, progress: 40, children: MESSAGE.executing },
  argTypes: {
    status: { control: 'select', options: STATUSES },
    progress: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    children: { control: 'text' },
    action: { control: false },
  },
  render: (args) => (
    <div className="max-w-140 overflow-hidden rounded-xl border bg-card">
      <ActionStatus
        {...args}
        action={
          <Button variant="ghost" intent="neutral" size="xs">
            {ACTION[args.status ?? 'executing']}
          </Button>
        }
      />
    </div>
  ),
})

/** Status, progress and message are in Controls. */
export const Default = meta.story()

Default.test('announces the status', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Sending to 24 recipients…')
  await expect(canvas.getByRole('progressbar')).toBeInTheDocument()
})

/** Figma states: executing, done, failed, expired, undone. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="flex max-w-140 flex-col gap-4">
      {STATUSES.map((status) => (
        <div key={status} className="overflow-hidden rounded-xl border bg-card">
          <ActionStatus
            {...args}
            status={status}
            children={MESSAGE[status]}
            action={
              <Button variant="ghost" intent="neutral" size="xs">
                {ACTION[status]}
              </Button>
            }
          />
        </div>
      ))}
    </div>
  ),
})
