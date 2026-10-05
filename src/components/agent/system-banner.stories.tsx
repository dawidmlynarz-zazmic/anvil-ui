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
    figmaProps: [
      {
        property: 'type',
        values: 'usage limit · rate limit · offline · long chat · incomplete',
        code: '`tone` + `icon` props',
      },
    ],
    docs: {
      description: {
        component:
          'An inline notice in the thread (`@/components/agent/system-banner`): `tone` neutral · info · warning · destructive, `icon`, the message as children, an optional `action` and `onDismiss`. Figma type → tone + icon: usage limit (gauge) and rate limit (clock) warning, offline (wifi-off) neutral, long chat (info) info, incomplete (triangle-alert) destructive.',
      },
    },
  },
  args: { tone: 'warning', children: 'Subtitle', onDismiss: fn() },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'warning', 'destructive'] },
    children: { control: 'text' },
    icon: { control: false },
    action: { control: false },
    onDismiss: { control: false, table: { category: 'Events' } },
  },
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

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column wrap or truncate, never overflow. */
export const LongContent = meta.story({
  args: { children: `${LONG} ${UNBROKEN}` },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

LongContent.test('stays in its column and keeps text readable', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=system-banner]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
    // A text block squeezed by its neighbours wraps one character per line.
    if (el.childElementCount === 0 && (el.textContent ?? '').length > 20) {
      await expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    }
  }
})
