import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

import { ProactiveDrawer } from './proactive-drawer'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10752-6492'

const BODY = (
  <>
    <p>
      Two aisle seats together in row F for the 19:30 evening show are now $39 each, down from $46. They were
      the seats you looked at yesterday.
    </p>
    <Item variant="outline" size="sm" className="flex-nowrap">
      <ItemContent className="gap-0">
        <ItemTitle className="type-text-base-semibold">19:30</ItemTitle>
        <ItemDescription>Evening</ItemDescription>
      </ItemContent>
      <div className="text-right type-text-xs-normal">
        <div className="type-text-xs-medium text-foreground">$39 each</div>
        <div className="text-success-medium">Good availability</div>
      </div>
    </Item>
  </>
)

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Proactive Drawer',
  tags: ['agent-builder'],
  component: ProactiveDrawer,
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component:
          'An expandable proactive preview (`@/components/agent/proactive-drawer`), on Drawer + Announcement Bar: peek is the floating bar with a “Show me” button; expanded is a non-modal bottom Drawer with a header (`title`, `meta`), the preview as `children`, and a footer with `onMute`, `onDismiss` and the primary action (`primaryLabel`, `onPrimary`). `expanded` / `onExpandedChange` control it.',
      },
    },
    figmaProps: [
      { property: 'state', values: 'peek · expanded', code: '`expanded` prop' },
      {
        property: 'time slot (preview)',
        values: 'instance',
        code: '`children` (the preview of what the message is about)',
      },
      {
        property: 'actions',
        values: 'mute · dismiss · primary',
        code: '`onMute` · `onDismiss` · `primaryLabel` + `onPrimary`',
      },
    ],
    guide: {
      use: [
        'When the agent has found something useful but the user shouldn’t be pulled out of what they’re doing: show the peek bar first, expand on request.',
        'In the expanded drawer show enough to decide (what changed, one preview) and the next step as the primary action.',
        'Offer “Don’t suggest this” so the user can switch this kind of nudge off.',
      ],
      avoid: [
        'A message with no detail to show: use Announcement Bar.',
        'Something that needs a full task: open the Chat Shell or Split Canvas instead.',
        'Showing it while the user is typing or checking out.',
      ],
      content: [
        'Peek: one sentence (“Seats you viewed for Sat 17 Oct dropped to $39”).',
        'Title names the event (“Price drop on seats you viewed”); the meta line says who, when and what about.',
        'The primary action says what happens (“Review & hold seats”).',
      ],
      a11y: [
        'Expanding opens a Drawer without trapping focus (non-modal); Escape or the collapse button closes it and focus returns to the peek bar.',
        'The title and meta name the drawer for screen readers. The peek bar is a polite status region.',
      ],
    },
  },
  args: {
    expanded: false,
    message: 'Seats you viewed for Sat 17 Oct dropped to $39',
    title: 'Price drop on seats you viewed',
    meta: 'Assistant · just now · Paper Kingdoms, Sat 17 Oct',
    primaryLabel: 'Review & hold seats',
    onPrimary: fn(),
    onMute: fn(),
    onDismiss: fn(),
    onExpandedChange: fn(),
  },
  argTypes: {
    expanded: { control: 'boolean' },
    tone: { control: 'inline-radio', options: ['agent', 'warning', 'success'] },
    message: { control: 'text' },
    expandLabel: { control: 'text' },
    title: { control: 'text' },
    meta: { control: 'text' },
    muteLabel: { control: 'text' },
    dismissLabel: { control: 'text' },
    primaryLabel: { control: 'text' },
    icon: { control: false },
    primaryIcon: { control: false },
    children: { control: false },
    onPrimary: { control: false, table: { category: 'Events' } },
    onMute: { control: false, table: { category: 'Events' } },
    onDismiss: { control: false, table: { category: 'Events' } },
    onExpandedChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="relative h-130 bg-muted p-6">
      <div className="absolute inset-x-6 bottom-6 mx-auto max-w-180">
        <ProactiveDrawer {...args}>{BODY}</ProactiveDrawer>
      </div>
    </div>
  ),
})

/** Figma state peek. Expanded is in Controls. */
export const Default = meta.story()

/** Uncontrolled: “Show me” expands it, the collapse button returns to the peek bar. */
export const Interactive = meta.story({ args: { expanded: undefined } })

Interactive.test('expands from the peek bar and collapses again', async ({ canvas, canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Show me' }))
  await expect(await body.findByRole('dialog', { name: 'Price drop on seats you viewed' })).toBeVisible()
  await expect(args.onExpandedChange).toHaveBeenCalledWith(true)
  await userEvent.click(body.getByRole('button', { name: 'Collapse' }))
  await waitFor(() => expect(args.onExpandedChange).toHaveBeenLastCalledWith(false))
  await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
})

/** Figma state expanded. */
export const Expanded = meta.story({ args: { expanded: true } })

Expanded.test('has the mute, dismiss and primary actions', async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(await body.findByRole('button', { name: 'Don’t suggest this' }))
  await userEvent.click(body.getByRole('button', { name: 'Review & hold seats' }))
  await expect(args.onMute).toHaveBeenCalledOnce()
  await expect(args.onPrimary).toHaveBeenCalledOnce()
})
