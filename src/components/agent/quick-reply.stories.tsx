import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Skeleton } from '@/components/ui/skeleton'

import { QuickReply, QuickReplyFilter, QuickReplyGroup } from './quick-reply'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15632'
const FIGMA_FOLLOW_UPS = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15663'

const meta = preview.meta({
  title: 'Agent Primitives/Input/Quick Reply',
  tags: ['element'],
  component: QuickReply,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // quick reply group has no properties (`QuickReplyGroup`); follow up suggestions is the group
    // with a label and a layout (audit M1).
    figmaProps: [
      { property: 'label', values: 'text', code: 'children' },
      { property: 'show icon', values: 'boolean', code: '`icon` prop (`null` hides it)' },
      {
        property: 'type',
        values: 'suggestion · filter · applied',
        code: '`QuickReply` / `QuickReplyFilter` (applied is `pressed`)',
      },
      {
        property: 'state',
        values: 'default · hover · focus · disabled',
        code: 'selectors: `hover:` · `focus-visible:` · `disabled:` (not a prop)',
      },
      {
        property: 'follow up suggestions · label / show label',
        values: 'text · boolean',
        code: '`QuickReplyGroup` `label` (omit it to hide)',
      },
      {
        property: 'follow up suggestions · layout',
        values: 'chips · list',
        code: '`QuickReplyGroup` `layout`',
      },
      {
        property: 'follow up suggestions · suggestion 1–4 · show suggestion 3 / 4',
        values: 'text · boolean',
        code: '`QuickReply` children; render as many as you need',
      },
    ],
    docs: {
      description: {
        component:
          'One-tap replies and follow-up questions under a message (`@/components/agent/quick-reply`, built on Chip; Figma quick reply and follow up suggestions are one family in code, audit M1). Figma type → sub-component: suggestion = `QuickReply` (sends it; an outline pill chip), filter / applied = `QuickReplyFilter` (a toggle Chip; pressed is applied, with an agent tint and a remove ×). `icon` swaps the leading icon (`null` hides it). `QuickReplyGroup` holds them: an optional `label` and `layout` chips · list. After one is sent, disable the set. Hover and focus come from the State control.',
      },
    },
  },
  args: { children: 'Label', disabled: false, onClick: fn() },
  argTypes: {
    children: { control: 'text' },
    disabled: { control: 'boolean' },
    icon: { control: false },
    onClick: { control: false, table: { category: 'Events' } },
  },
})

/** A suggestion; the label and disabled are in Controls. */
export const Default = meta.story()

Default.test('sends on click', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Label' }))
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** Figma type × state: suggestion, filter and applied; default, hover, focus, disabled. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      {(['suggestion', 'filter', 'applied'] as const).map((type) => (
        <div key={type} className="flex items-center gap-3">
          {(['default', 'hover', 'focus', 'disabled'] as const).map((state) => (
            <span
              key={state}
              className={
                state === 'hover' ? 'pseudo-hover-all' : state === 'focus' ? 'pseudo-focus-visible-all' : ''
              }
            >
              {type === 'suggestion' ? (
                <QuickReply disabled={state === 'disabled'}>Label</QuickReply>
              ) : (
                <QuickReplyFilter pressed={type === 'applied'} disabled={state === 'disabled'}>
                  Label
                </QuickReplyFilter>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
})

/** Filters toggle between filter and applied. */
export const Filters = meta.story({
  render: () => (
    <QuickReplyGroup label="Title">
      <QuickReplyFilter defaultPressed>Label 1</QuickReplyFilter>
      <QuickReplyFilter>Label 2</QuickReplyFilter>
      <QuickReplyFilter>Label 3</QuickReplyFilter>
    </QuickReplyGroup>
  ),
})

Filters.test('a filter toggles applied', async ({ canvas }) => {
  const filter = canvas.getByRole('button', { name: 'Label 2' })
  await userEvent.click(filter)
  await expect(filter).toHaveAttribute('aria-pressed', 'true')
})

/** Figma quick reply group: up to six, wrapping. */
export const Group = meta.story({
  render: () => (
    <div className="w-120">
      <QuickReplyGroup label="Title">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <QuickReply key={i}>Label {i}</QuickReply>
        ))}
      </QuickReplyGroup>
    </div>
  ),
})

/** Figma follow up suggestions: a labelled group of next questions, chips or a list. */
export const FollowUps = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_FOLLOW_UPS } },
  render: (args) => (
    <div className="flex w-120 flex-col gap-6">
      {(['chips', 'list'] as const).map((layout) => (
        <QuickReplyGroup key={layout} label="Title" layout={layout}>
          {['Label 1', 'Label 2', 'Label 3'].map((label) => (
            <QuickReply key={label} onClick={args.onClick}>
              {label}
            </QuickReply>
          ))}
        </QuickReplyGroup>
      ))}
    </div>
  ),
})

FollowUps.test('a labelled list of follow-ups that send on click', async ({ canvas, args }) => {
  await expect(canvas.getAllByRole('list', { name: 'Title' })).toHaveLength(2)
  await userEvent.click(canvas.getAllByRole('button', { name: 'Label 2' })[1])
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** While the answer is still streaming: skeleton chips hold the space until the follow-ups arrive. */
export const Loading = meta.story({
  render: () => (
    <QuickReplyGroup label="Title" aria-busy="true" className="w-120">
      {['w-28', 'w-36', 'w-24'].map((width) => (
        <li key={width}>
          <Skeleton className={`h-8 ${width} rounded-full`} />
        </li>
      ))}
    </QuickReplyGroup>
  ),
})

Loading.test('is marked busy and offers nothing to click yet', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=quick-reply-group]')).toHaveAttribute(
    'aria-busy',
    'true',
  )
  await expect(canvas.queryAllByRole('button')).toHaveLength(0)
})

/** After one is sent the set is disabled, so the same reply can't be sent twice. */
export const AfterChoice = meta.story({
  render: () => (
    <QuickReplyGroup label="Title" className="w-120">
      {['Label 1', 'Label 2', 'Label 3'].map((label) => (
        <QuickReply key={label} disabled>
          {label}
        </QuickReply>
      ))}
    </QuickReplyGroup>
  ),
})

AfterChoice.test('every reply is disabled', async ({ canvas }) => {
  for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled()
})

const LONG = 'A long follow-up question that wraps onto a second line in a narrow column'

/** Stress test: long replies in a narrow column wrap instead of overflowing, in both layouts. */
export const LongContent = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      {(['chips', 'list'] as const).map((layout) => (
        <QuickReplyGroup key={layout} label="Title" layout={layout}>
          <QuickReply>{LONG}</QuickReply>
          <QuickReply>Label</QuickReply>
        </QuickReplyGroup>
      ))}
    </div>
  ),
})

LongContent.test('long replies stay inside the column', async ({ canvasElement }) => {
  for (const root of canvasElement.querySelectorAll<HTMLElement>('[data-slot=quick-reply-group]')) {
    for (const button of root.querySelectorAll<HTMLElement>('button')) {
      await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
        root.getBoundingClientRect().right + 1,
      )
    }
  }
})
