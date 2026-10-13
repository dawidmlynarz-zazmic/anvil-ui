import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { InlineSuggestion } from './inline-suggestion'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10748-5681'

const ORIGINAL = 'Churn increased slightly this quarter for reasons we are still investigating.'
const SUGGESTION =
  'Churn rose 0.6 points to 4.8%, driven by annual customers who didn’t renew after the 12 Aug price change.'

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Inline Suggestion',
  tags: ['agent-builder'],
  component: InlineSuggestion,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'mode', values: 'replace · insert', code: '`mode` prop' },
      { property: 'suggestion', values: 'text', code: '`children`' },
      {
        property: 'text above (original)',
        values: 'text',
        code: '`original` prop (struck through when replacing)',
      },
      {
        property: 'actions',
        values: 'accept · discard · try again · edit prompt',
        code: '`onAccept` · `onDiscard` · `onRetry` · `onEditPrompt`',
      },
    ],
    guide: {
      use: [
        'Where the assistant proposes a change to text in place: show it next to the original, with Replace (or Insert), Discard, Try again and Edit prompt.',
        '`mode="replace"` when it rewrites the text; `mode="insert"` when it adds new text after it.',
        'Enter accepts and Escape discards when the block has focus; the Kbds say so.',
      ],
      avoid: [
        'Several small changes in a document to review one by one: use Document Canvas lines (Accept / Reject).',
        'Completion as the user types: use Ghost Text.',
        'Output that has no original to compare: just insert it and offer Undo.',
      ],
      content: [
        'The suggestion is the exact text that would replace or follow the original.',
        'Buttons name the result: Replace or Insert, not “OK”.',
      ],
      a11y: [
        'The block is a labelled group (“Suggested edit”); the original is a `<del>` and the suggestion an `<ins>`, so the change is announced, not just coloured.',
        'The Kbds are hidden from assistive tech; the buttons carry `aria-keyshortcuts`.',
      ],
    },
    docs: {
      description: {
        component:
          'An in-place preview of an AI edit (`@/components/agent/inline-suggestion`), on Toolbar (`size="compact"`) + Button + Kbd: `mode` replace · insert, `original`, the suggestion as `children`, and `onAccept`, `onDiscard`, `onRetry`, `onEditPrompt`.',
      },
    },
  },
  args: {
    mode: 'replace' as const,
    original: ORIGINAL,
    children: SUGGESTION,
    onAccept: fn(),
    onDiscard: fn(),
    onRetry: fn(),
    onEditPrompt: fn(),
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['replace', 'insert'] },
    original: { control: 'text' },
    children: { control: 'text' },
    onAccept: { control: false, table: { category: 'Events' } },
    onDiscard: { control: false, table: { category: 'Events' } },
    onRetry: { control: false, table: { category: 'Events' } },
    onEditPrompt: { control: false, table: { category: 'Events' } },
  },
})

/** Figma mode replace. Mode and the texts are in Controls. */
export const Default = meta.story()

Default.test('accepts, discards, retries and edits the prompt', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Replace' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Discard' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Edit prompt' }))
  await expect(args.onAccept).toHaveBeenCalledOnce()
  await expect(args.onDiscard).toHaveBeenCalledOnce()
  await expect(args.onRetry).toHaveBeenCalledOnce()
  await expect(args.onEditPrompt).toHaveBeenCalledOnce()
})

Default.test('Enter accepts and Escape discards from the block', async ({ canvas, args }) => {
  const block = canvas.getByRole('group', { name: 'Suggested edit' })
  block.focus()
  await userEvent.keyboard('{Enter}')
  await expect(args.onAccept).toHaveBeenCalled()
  await userEvent.keyboard('{Escape}')
  await expect(args.onDiscard).toHaveBeenCalled()
})

/** Figma mode insert: the paragraph stays; the suggestion follows it. */
export const Insert = meta.story({
  args: {
    mode: 'insert',
    original: ORIGINAL,
    children: 'The May cohort is the outlier, retaining 84.1% against an 88% baseline.',
  },
})

Insert.test('says Insert and keeps the original readable', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Insert' })).toBeVisible()
  await expect(canvas.queryByText(ORIGINAL)?.closest('del')).toBeNull()
})

/** No original: only the suggestion and what to do with it. */
export const SuggestionOnly = meta.story({ args: { original: undefined } })
