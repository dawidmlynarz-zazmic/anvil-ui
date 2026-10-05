import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent } from '@/components/ui/message'

import { MessageBranch, MessageEditor } from './message-edit'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10728-2229'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Messages/Message Edit',
  tags: ['agent-block'],
  component: MessageEditor,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'message', values: 'text', code: '`defaultValue` prop on `MessageEditor`' },
      { property: 'position', values: 'text', code: '`index` / `count` props on `MessageBranch`' },
      { property: 'state', values: 'editing · branched', code: '`MessageEditor` · `MessageBranch`' },
    ],
    docs: {
      description: {
        component:
          'Editing a sent user message and moving between its versions (`@/components/agent/message-edit`). `MessageEditor` (Figma editing): `defaultValue`, `hint`, `onCancel`, `onSend(value)`; Escape cancels, ⌘/Ctrl+Enter sends. `MessageBranch` (Figma branched): `index` / `count`, `onPrevious` / `onNext`, `onEdit`, `onCopy`; previous / next disable at the ends.',
      },
    },
  },
  args: { defaultValue: 'Subtitle', onCancel: fn(), onSend: fn() },
  argTypes: {
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
  await userEvent.type(field, 'Value')
  await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
  await expect(args.onSend).toHaveBeenCalledWith('Value')
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
            <Bubble variant="muted">
              <BubbleContent>Subtitle {index}</BubbleContent>
            </Bubble>
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
    const [versions, setVersions] = useState(['Subtitle'])
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
                <Bubble variant="muted">
                  <BubbleContent>{versions[index - 1]}</BubbleContent>
                </Bubble>
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
