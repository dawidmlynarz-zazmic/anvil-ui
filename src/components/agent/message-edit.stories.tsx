import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { MessageBubble, MessageBubbleContent } from '@/components/ui/message-bubble'
import { Message, MessageContent } from '@/components/ui/message'

import { MessageBranch, MessageEditor } from './message-edit'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10728-2229'

/** Three versions of one prompt, as the user refined it. */
const VERSIONS = [
  'Summarize the Q3 launch plan',
  'Summarize the Q3 launch plan in 5 bullets',
  'Summarize the Q3 launch plan in 5 bullets, with owners and dates',
]

const meta = preview.meta({
  title: 'Molecules/Message Edit',
  tags: ['molecule', 'messages'],
  component: MessageEditor,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'message', values: 'text', code: '`defaultValue` prop on `MessageEditor`' },
      { property: 'position', values: 'text', code: '`index` / `count` props on `MessageBranch`' },
      { property: 'state', values: 'editing · branched', code: '`MessageEditor` · `MessageBranch`' },
    ],
    guide: {
      use: [
        'Letting the user edit a prompt they already sent; sending the edit creates a new version and a new answer.',
        '`MessageBranch` under the edited message to move between versions (“Version 2 of 3”), with Edit and Copy.',
      ],
      avoid: [
        'Writing a new prompt: use Prompt Input. Editing a draft the agent wrote (an email, a doc): use the artifact’s own editor or Textarea.',
        'Retrying the same prompt: use Retry in Message Actions.',
      ],
      content: [
        'Keep the original text in the field; the default `hint` explains the effect (“Editing creates a new branch; the original is kept.”).',
        'Actions: “Cancel” and “Send”. Mark edited messages with “Edited”.',
      ],
      a11y: [
        'The field is a named Textarea (“Edit message”) and takes focus when the editor opens (`autoFocus`, cursor at the end). Escape cancels, ⌘/Ctrl+Enter sends.',
        'Previous / Next version are named buttons, disabled at the ends; the position is text (“Version 3 of 3”).',
        'After cancel or send, return focus to the message’s Edit button.',
      ],
    },
    docs: {
      description: {
        component:
          'Editing a sent user message and moving between its versions (`@/components/agent/message-edit`). `MessageEditor` (Figma editing): `defaultValue`, `hint`, `onCancel`, `onSend(value)`; Escape cancels, ⌘/Ctrl+Enter sends. `MessageBranch` (Figma branched): `index` / `count`, `onPrevious` / `onNext`, `onEdit`, `onCopy`; previous / next disable at the ends.',
      },
    },
  },
  // Stories open at rest: no focus on load (the component focuses the field by default).
  args: { defaultValue: 'Summarize the Q3 launch plan', autoFocus: false, onCancel: fn(), onSend: fn() },
  argTypes: {
    autoFocus: { control: 'boolean' },
    defaultValue: { control: 'text' },
    hint: { control: 'text' },
    onCancel: { control: false, table: { category: 'Events' } },
    onSend: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="flex max-w-(--shell-widget-max) justify-end">
      <MessageEditor {...args} />
    </div>
  ),
})

/** Figma state editing. */
export const Editing = meta.story()

Editing.test('sends the edited text; Escape cancels', async ({ canvas, args }) => {
  const field = canvas.getByRole('textbox', { name: 'Edit message' })
  await userEvent.clear(field)
  await userEvent.type(field, 'Summarize the Q3 launch plan in 5 bullets')
  await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
  await expect(args.onSend).toHaveBeenCalledWith('Summarize the Q3 launch plan in 5 bullets')
  await userEvent.type(field, '{Escape}')
  await expect(args.onCancel).toHaveBeenCalledOnce()
})

/** Figma state branched: the edited message with its version navigation. */
export const Branched = meta.story({
  render: function Render() {
    const [index, setIndex] = useState(2)
    return (
      <div className="max-w-(--shell-widget-max)">
        <Message align="end">
          <MessageContent>
            <MessageBubble variant="muted">
              <MessageBubbleContent>{VERSIONS[index - 1]}</MessageBubbleContent>
            </MessageBubble>
            <MessageBranch
              className="self-end"
              index={index}
              count={3}
              onPrevious={() => setIndex((i) => i - 1)}
              onNext={() => setIndex((i) => i + 1)}
              onEdit={() => {}}
              onCopy={() => {}}
            />
          </MessageContent>
        </Message>
      </div>
    )
  },
})

Branched.test('steps between versions and stops at the ends', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Next version' }))
  await expect(canvas.getByText('Version 3 of 3')).toBeInTheDocument()
  await expect(canvas.getByRole('button', { name: 'Next version' })).toBeDisabled()
})

/** Edit → send → a new version appears. */
export const Flow = meta.story({
  render: function Render() {
    const [versions, setVersions] = useState(['Summarize the Q3 launch plan'])
    const [index, setIndex] = useState(1)
    const [editing, setEditing] = useState(false)
    return (
      <div className="max-w-(--shell-widget-max)">
        <Message align="end">
          <MessageContent>
            {editing ? (
              <MessageEditor
                defaultValue={versions[index - 1]}
                onCancel={() => setEditing(false)}
                onSend={(value) => {
                  setVersions((all) => [...all, value])
                  setIndex(versions.length + 1)
                  setEditing(false)
                }}
              />
            ) : (
              <>
                <MessageBubble variant="muted">
                  <MessageBubbleContent>{versions[index - 1]}</MessageBubbleContent>
                </MessageBubble>
                <MessageBranch
                  className="self-end"
                  label={versions.length > 1 ? 'Edited' : null}
                  index={index}
                  count={versions.length}
                  onPrevious={() => setIndex((i) => i - 1)}
                  onNext={() => setIndex((i) => i + 1)}
                  onEdit={() => setEditing(true)}
                />
              </>
            )}
          </MessageContent>
        </Message>
      </div>
    )
  },
})

Flow.test('Edit moves focus into the field, cursor at the end', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Edit/ }))
  const field = canvas.getByRole('textbox', { name: 'Edit message' })
  await expect(field).toHaveFocus()
  await expect((field as HTMLTextAreaElement).selectionStart).toBe(
    (field as HTMLTextAreaElement).value.length,
  )
})
