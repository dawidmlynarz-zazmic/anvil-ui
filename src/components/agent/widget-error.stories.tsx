import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, KeyRoundIcon, RotateCcwIcon } from '@/components/ui/icon'

import { WidgetError } from './widget-error'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10814-3371'

const onRetry = fn()

const RETRY = (
  <>
    <Button variant="outline" intent="neutral" size="sm" onClick={onRetry}>
      <Icon icon={RotateCcwIcon} />
      Try again
    </Button>
    <Button variant="ghost" intent="neutral" size="sm">
      Get help
    </Button>
  </>
)

const meta = preview.meta({
  title: 'Design System/Molecules/Widget Error',
  tags: ['molecule', 'widgets'],
  component: WidgetError,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'type',
        values: 'failed · offline · permission · timeout',
        code: '`type` prop (sets the glyph, tile tone and default copy)',
      },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'description', values: 'text', code: '`description` prop' },
      { property: 'actions', values: 'buttons', code: '`actions` slot (Buttons sm)' },
    ],
    guide: {
      use: [
        'In place of a widget that couldn’t load: say what happened and offer the way out (Try again, Request access, Keep waiting).',
        'Pick the `type` that matches the cause; override `title` and `description` with specifics when you have them.',
      ],
      avoid: [
        'A problem with the whole conversation: use Alert.',
        'Nothing to show because there is no data yet: use Empty State.',
        'An action the agent took that failed: use Action Status.',
      ],
      content: [
        '`title`: what happened, in plain words (“Couldn’t load flights”).',
        '`description`: what it means for the user and whether anything changed (“Nothing was changed.”).',
        'Actions say what they do: “Try again”, “Request access”, “Keep waiting”.',
      ],
      a11y: [
        'It is a `role="status"` region, so it is announced without interrupting.',
        'The tile is decorative; the title carries the meaning, so the error isn’t told by colour alone.',
      ],
    },
    docs: {
      description: {
        component:
          'A widget that couldn’t load (`@/components/agent/widget-error`), built on Card, Empty State and a circle Icon Tile: `type` failed · offline · permission · timeout (glyph, tone and default copy), `title`, `description`, `icon` and the `actions` slot.',
      },
    },
  },
  args: {
    type: 'failed' as const,
    title: 'Couldn’t load flights',
    description: 'Something went wrong. Nothing was changed.',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['failed', 'offline', 'permission', 'timeout'] },
    title: { control: 'text' },
    description: { control: 'text' },
    icon: { control: false },
    actions: { control: false },
  },
  render: (args) => <WidgetError {...args} actions={RETRY} />,
})

/** Type, title and description are in Controls. */
export const Default = meta.story()

Default.test('offers to try again', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Couldn’t load flights')
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  await expect(onRetry).toHaveBeenCalledOnce()
})

/** Figma types with their default glyph, tone and copy. */
export const Types = meta.story({
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <WidgetError type="failed" actions={RETRY} />
      <WidgetError
        type="offline"
        description="Showing what was saved at 09:14. Changes will sync when you reconnect."
        actions={
          <Button variant="outline" intent="neutral" size="sm">
            <Icon icon={RotateCcwIcon} />
            Retry
          </Button>
        }
      />
      <WidgetError
        type="permission"
        title="No access to Northwind Sync"
        description="The assistant needs read access to show the launch metrics."
        actions={
          <Button variant="outline" intent="neutral" size="sm">
            <Icon icon={KeyRoundIcon} />
            Request access
          </Button>
        }
      />
      <WidgetError
        type="timeout"
        description="The signups query is still running after 30 s."
        actions={
          <>
            <Button variant="outline" intent="neutral" size="sm">
              <Icon icon={RotateCcwIcon} />
              Keep waiting
            </Button>
            <Button variant="ghost" intent="neutral" size="sm">
              Cancel
            </Button>
          </>
        }
      />
    </div>
  ),
})

/** No actions: the message only. */
export const MessageOnly = meta.story({ render: (args) => <WidgetError {...args} /> })
