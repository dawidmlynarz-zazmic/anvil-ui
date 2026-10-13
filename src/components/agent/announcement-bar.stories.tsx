import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { AnnouncementBar } from './announcement-bar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10752-6398'

const MESSAGES = {
  agent: { message: 'Your 2 seats for Sat 17 Oct are held for 10 more minutes', action: 'Review & pay' },
  warning: { message: 'Your seat hold expires in 2 minutes', action: 'Keep my seats' },
  success: { message: 'Seats you viewed for Sat 17 Oct dropped to $39', action: 'Review seats' },
} as const

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Announcement Bar',
  tags: ['agent-builder'],
  component: AnnouncementBar,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'position', values: 'top · bottom', code: '`position` prop' },
      {
        property: 'tone',
        values: 'info · alert · opportunity',
        code: '`tone` prop: agent · warning · success (the contract’s tone names)',
      },
      { property: 'message', values: 'text', code: '`children`' },
    ],
    guide: {
      use: [
        'For a short, time-sensitive message from the agent on the host page that the user didn’t ask for: a hold expiring, a price drop, something that changed.',
        '`position="top"` as a banner across the page; `position="bottom"` as a floating pill when the page has no room at the top.',
        'Always give a way out: Dismiss, and Snooze when it can come back.',
      ],
      avoid: [
        'A system or product notice: use Alert.',
        'A message that needs a decision with detail: use Proactive Drawer, or Approval Card in the chat.',
        'Anything the user is in the middle of: don’t interrupt typing or a checkout step.',
      ],
      content: [
        'The message is one sentence with the fact and the time (“Your seat hold expires in 2 minutes”).',
        'The action is the next step (“Keep my seats”, “Review & pay”), not “OK”.',
      ],
      a11y: [
        'It is a polite status region: a new message is announced without moving focus.',
        'Tone is shown with an icon and the words, never colour alone. Dismiss and Snooze are real buttons.',
      ],
    },
    docs: {
      description: {
        component:
          'A proactive micro-announcement (`@/components/agent/announcement-bar`): `position` top (an Alert banner) · bottom (a floating pill), `tone` agent · warning · success, the message as `children`, `actionLabel` / `onAction` (or your own `action`), `onSnooze`, `onDismiss`.',
      },
    },
  },
  args: {
    position: 'top' as const,
    tone: 'agent' as const,
    children: MESSAGES.agent.message,
    actionLabel: MESSAGES.agent.action,
    onAction: fn(),
    onSnooze: fn(),
    onDismiss: fn(),
  },
  argTypes: {
    position: { control: 'inline-radio', options: ['top', 'bottom'] },
    tone: { control: 'inline-radio', options: ['agent', 'warning', 'success'] },
    children: { control: 'text' },
    actionLabel: { control: 'text' },
    snoozeLabel: { control: 'text' },
    icon: { control: false },
    action: { control: false },
    onAction: { control: false, table: { category: 'Events' } },
    onSnooze: { control: false, table: { category: 'Events' } },
    onDismiss: { control: false, table: { category: 'Events' } },
  },
})

/** Position, tone and the texts are in Controls. */
export const Default = meta.story()

Default.test('acts, snoozes and dismisses', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Your 2 seats for Sat 17 Oct')
  await userEvent.click(canvas.getByRole('button', { name: 'Review & pay' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Snooze' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
  await expect(args.onAction).toHaveBeenCalledOnce()
  await expect(args.onSnooze).toHaveBeenCalledOnce()
  await expect(args.onDismiss).toHaveBeenCalledOnce()
})

/** Figma position top × tone: info, alert, opportunity. */
export const Top = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['agent', 'warning', 'success'] as const).map((tone) => (
        <AnnouncementBar key={tone} {...args} position="top" tone={tone} actionLabel={MESSAGES[tone].action}>
          {MESSAGES[tone].message}
        </AnnouncementBar>
      ))}
    </div>
  ),
})

/** Figma position bottom × tone: a floating pill. */
export const Bottom = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['agent', 'warning', 'success'] as const).map((tone) => (
        <AnnouncementBar
          key={tone}
          {...args}
          position="bottom"
          tone={tone}
          actionLabel={MESSAGES[tone].action}
        >
          {MESSAGES[tone].message}
        </AnnouncementBar>
      ))}
    </div>
  ),
})

/** Without Snooze or Dismiss: only the message and its action. */
export const Minimal = meta.story({ args: { onSnooze: undefined, onDismiss: undefined } })

/** A long message stays on its row and truncates; the actions keep their size. */
export const LongContent = meta.story({
  args: {
    position: 'bottom',
    children:
      'Seats you viewed yesterday for the Saturday 17 October evening performance of Paper Kingdoms at the Lyric Hall dropped to $39 each, and only four are left together',
  },
  decorators: [(Story) => <div className="max-w-130">{Story()}</div>],
})
