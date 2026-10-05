import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { ClockIcon, GaugeIcon, InfoIcon, TriangleAlertIcon, WifiOffIcon } from '@/components/ui/icon'

import { SystemBanner } from './system-banner'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10728-2505'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/System & Context/System Banner',
  tags: ['agent-primitive'],
  component: SystemBanner,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'An inline notice in the thread (`@/components/agent/system-banner`): `tone` neutral · info · warning · destructive, `icon`, the message as children, an optional `action` and `onDismiss`. Figma type → tone + icon: usage limit (gauge) and rate limit (clock) warning, offline (wifi-off) neutral, long chat (info) info, incomplete (triangle-alert) destructive.',
      },
    },
  },
  args: { tone: 'warning', children: 'Subtitle', onDismiss: fn() },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'info', 'warning', 'destructive'] } },
})

/** Tone and message are in Controls. */
export const Default = meta.story({ args: { icon: GaugeIcon } })

Default.test('dismisses', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Subtitle')
  await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
  await expect(args.onDismiss).toHaveBeenCalledOnce()
})

/** Figma types: usage limit, rate limit, offline, long chat, incomplete. */
export const Types = meta.story({
  render: (args) => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-3">
      <SystemBanner
        {...args}
        tone="warning"
        icon={GaugeIcon}
        action={
          <Button variant="outline" intent="neutral" size="xs">
            Upgrade
          </Button>
        }
      />
      <SystemBanner
        {...args}
        tone="warning"
        icon={ClockIcon}
        action={
          <Button variant="outline" intent="neutral" size="xs" disabled>
            Retry
          </Button>
        }
      />
      <SystemBanner {...args} tone="neutral" icon={WifiOffIcon} />
      <SystemBanner
        {...args}
        tone="info"
        icon={InfoIcon}
        action={
          <Button variant="outline" intent="neutral" size="xs">
            New chat
          </Button>
        }
      />
      <SystemBanner
        {...args}
        tone="destructive"
        icon={TriangleAlertIcon}
        action={
          <Button variant="outline" intent="neutral" size="xs">
            Continue
          </Button>
        }
      />
    </div>
  ),
})
