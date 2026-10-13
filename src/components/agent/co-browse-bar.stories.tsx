import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { CoBrowseBar } from './co-browse-bar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10752-6787'

const MESSAGES = {
  working: 'Northwind Labs is filling your booking details · 3 of 5',
  paused: 'Paused · nothing is submitted',
  done: 'Details filled · review and submit when ready',
} as const

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Co-browse Bar',
  tags: ['agent-builder'],
  component: CoBrowseBar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'working · paused · done', code: '`status` prop' },
      { property: 'message', values: 'text', code: '`children`' },
    ],
    guide: {
      use: [
        'Whenever the assistant acts on the host page (filling a form, clicking through steps): it keeps the person in control.',
        'Show progress in the message (“3 of 5”), and always offer Pause, Take over and Stop while it works.',
        'End in `done` with a clear next step (Review); the assistant never submits for the person.',
      ],
      avoid: [
        'A short answer or suggestion: use Announcement Bar.',
        'Progress inside the chat: use Action Status or Tool Log Line.',
        'Hiding Stop. People must be able to end an action on their page at any time.',
      ],
      content: [
        'Working: what is being done and how far (“Filling your booking details · 3 of 5”).',
        'Paused: reassure (“Paused · nothing is submitted”). Done: say what is left (“review and submit when ready”).',
      ],
      a11y: [
        'The message is a polite status, so each state is announced; the bar is a named group of real buttons.',
        'The pulse and glyphs are decorative; the words carry the state.',
        'Colours pass 4.5:1 on the inverse surface; Stop is destructive and labelled, not colour alone.',
      ],
    },
    docs: {
      description: {
        component:
          'The agent’s control bar while it acts on the page (`@/components/agent/co-browse-bar`), an inverse pill with pill Buttons: `status` working (Pause · Take over · Stop) · paused (Resume · Stop) · done (Review · dismiss); the message is `children`; callbacks `onPause`, `onResume`, `onTakeOver`, `onStop`, `onReview`, `onDismiss`.',
      },
    },
  },
  args: {
    status: 'working',
    children: MESSAGES.working,
    onPause: fn(),
    onResume: fn(),
    onTakeOver: fn(),
    onStop: fn(),
    onReview: fn(),
    onDismiss: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['working', 'paused', 'done'] },
    children: { control: 'text' },
    onPause: { control: false, table: { category: 'Events' } },
    onResume: { control: false, table: { category: 'Events' } },
    onTakeOver: { control: false, table: { category: 'Events' } },
    onStop: { control: false, table: { category: 'Events' } },
    onReview: { control: false, table: { category: 'Events' } },
    onDismiss: { control: false, table: { category: 'Events' } },
  },
})

/** Status and the message are in Controls. */
export const Default = meta.story()

Default.test('pauses, takes over and stops', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Pause' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Take over' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
  await expect(args.onPause).toHaveBeenCalledOnce()
  await expect(args.onTakeOver).toHaveBeenCalledOnce()
  await expect(args.onStop).toHaveBeenCalledOnce()
})

/** Figma state: working, paused, done. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      {(['working', 'paused', 'done'] as const).map((status) => (
        <CoBrowseBar key={status} {...args} status={status}>
          {MESSAGES[status]}
        </CoBrowseBar>
      ))}
    </div>
  ),
})

Statuses.test('paused resumes; done reviews and dismisses', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Resume' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Review' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
  await expect(args.onResume).toHaveBeenCalledOnce()
  await expect(args.onReview).toHaveBeenCalledOnce()
  await expect(args.onDismiss).toHaveBeenCalledOnce()
})
