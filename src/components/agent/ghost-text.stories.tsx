import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { GhostText } from './ghost-text'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10748-5716'

const TYPED = 'Thanks for the update. I’ll review the draft '
const COMPLETION = 'and send comments by Thursday.'

const onAccept = fn()

/** Keeps the suggestion until it is accepted or dismissed, like a host would. */
function Demo({
  defaultValue = TYPED,
  suggestion: initial = COMPLETION,
  ...props
}: Partial<React.ComponentProps<typeof GhostText>>) {
  const [suggestion, setSuggestion] = useState<string | undefined>(initial)
  return (
    <GhostText
      aria-label="Reply"
      defaultValue={defaultValue}
      suggestion={suggestion}
      onAccept={(s) => {
        onAccept(s)
        setSuggestion(undefined)
      }}
      onDismiss={() => setSuggestion(undefined)}
      className="max-w-140"
      {...props}
    />
  )
}

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Ghost Text',
  tags: ['agent-builder'],
  component: GhostText,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'suggesting · accepted',
        code: '`suggestion` set · after accepting (“Accepted” until the next edit)',
      },
      { property: 'completion', values: 'text', code: '`suggestion` prop (drawn in --foreground-subtle)' },
      {
        property: 'hint',
        values: 'shortcut hint',
        code: 'Kbd “Tab” + “to accept” (built in); `acceptedLabel`',
      },
    ],
    guide: {
      use: [
        'In a message, comment or document field, to complete what the user is typing: one short continuation, shown after the caret.',
        'Offer it only when the caret is at the end of the text; Tab accepts, Escape dismisses, and any typing replaces it.',
      ],
      avoid: [
        'A rewrite of text that is already there: use Inline Suggestion.',
        'Search or command suggestions: use Combobox or Command Palette.',
      ],
      content: [
        'Keep the completion to a clause or a sentence; it continues the user’s words, it doesn’t restart them.',
        'The hint is always “Tab to accept”; after accepting, “Accepted”.',
      ],
      a11y: [
        'The completion is a visual overlay and isn’t in the field’s value until it is accepted, so assistive tech reads only what the user typed.',
        'Tab only accepts at the end of the text; elsewhere it moves focus as usual. The accepted confirmation is announced.',
      ],
    },
    docs: {
      description: {
        component:
          'Inline autocomplete (`@/components/agent/ghost-text`), on Input Group (a Textarea and a hint addon) + Kbd: `value` / `defaultValue` / `onValueChange`, the `suggestion` after the caret, `onAccept` (Tab) and `onDismiss` (Escape), `acceptedLabel`. The text is text/sm, like Input and Textarea.',
      },
    },
  },
  args: { disabled: false },
  argTypes: {
    suggestion: { control: 'text' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    acceptedLabel: { control: 'text' },
    value: { control: false },
    onValueChange: { control: false, table: { category: 'Events' } },
    onAccept: { control: false, table: { category: 'Events' } },
    onDismiss: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <Demo {...args} />,
})

/** Figma state suggesting: the completion is shown. Focus the field and press Tab. */
export const Default = meta.story()

Default.test('Tab at the end accepts the completion', async ({ canvas }) => {
  const field = canvas.getByRole('textbox', { name: 'Reply' })
  field.focus()
  await userEvent.keyboard('{Control>}{End}{/Control}')
  await expect(canvas.getByText('to accept')).toBeVisible()
  await userEvent.tab()
  await expect(field).toHaveValue(`${TYPED}${COMPLETION}`)
  await expect(onAccept).toHaveBeenCalledWith(COMPLETION)
  await expect(canvas.getByRole('status')).toHaveTextContent('Accepted')
})

Default.test('typing again clears “Accepted”; Escape dismisses a suggestion', async ({ canvas }) => {
  const field = canvas.getByRole('textbox', { name: 'Reply' })
  field.focus()
  await userEvent.keyboard('{Control>}{End}{/Control}{Escape}')
  await expect(canvas.queryByText('to accept')).toBeNull()
})

/** Figma state accepted: the completion is part of the text. */
export const Accepted = meta.story({
  render: () => {
    return <Demo defaultValue={`${TYPED}${COMPLETION}`} suggestion={undefined} />
  },
})

/** No suggestion: an ordinary field. */
export const NoSuggestion = meta.story({
  render: () => <Demo suggestion={undefined} defaultValue="" placeholder="Write a reply…" />,
})

/** A long reply wraps; the completion wraps with it. */
export const Wrapping = meta.story({
  render: () => (
    <Demo
      defaultValue="Thanks for the update on the Q3 launch plan. I read the draft over the weekend and the pricing section looks right, but I have one question about the partner enablement dates, and "
      suggestion="I’ll send my comments and the open questions to Maya Chen by Thursday afternoon."
    />
  ),
})
