import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { QuickReply, QuickReplyFilter, QuickReplyGroup } from './quick-reply'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15632'

const meta = preview.meta({
  title: 'Agent Primitives/Input/Quick Reply',
  tags: ['agent-primitive'],
  component: QuickReply,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // quick reply group has no properties (`QuickReplyGroup`).
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
    ],
    docs: {
      description: {
        component:
          'One-tap replies under a message (`@/components/agent/quick-reply`, a pill outline Button). Figma type → sub-component: suggestion = `QuickReply` (sends the reply), filter / applied = `QuickReplyFilter` (a toggle; pressed is applied, with an agent tint and a remove ×). `icon` swaps the leading icon (`null` hides it). `QuickReplyGroup` (Figma quick reply group) wraps up to six. Hover and focus come from the State control.',
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
    <QuickReplyGroup aria-label="Label">
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
      <QuickReplyGroup aria-label="Label">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <QuickReply key={i}>Label {i}</QuickReply>
        ))}
      </QuickReplyGroup>
    </div>
  ),
})
