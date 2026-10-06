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

const meta = preview.meta({
  title: 'Agent Primitives/System & Context/Action Status',
  tags: ['composite'],
  component: ActionStatus,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'executing · done · failed · expired · undone', code: '`status` prop' },
      { property: 'message', values: 'text', code: 'children' },
    ],
    docs: {
      description: {
        component:
          'The lifecycle strip at the bottom of an action card, in place of its footer (`@/components/agent/action-status`): Approval Card, Connector Card, and later payment and booking cards. `status` executing (pulse and `progress`) · done · failed · expired · undone, the message as children, `action` an xs Button. role=status, so the change is announced.',
      },
    },
  },
  args: { status: 'executing' as const, progress: 40, children: 'Subtitle' },
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
  await expect(canvas.getByRole('status')).toHaveTextContent('Subtitle')
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
