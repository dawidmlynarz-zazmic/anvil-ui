import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Input } from './input'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=57-154'
const sizes = ['sm', 'default', 'lg'] as const

const meta = preview.meta({
  title: 'Atoms/Input',
  tags: ['atom'],
  component: Input,
  parameters: {
    shadcn: 'input',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'size', values: 'lg · default · sm', code: '`size` prop' },
      {
        property: 'state',
        values: 'default · hover · disabled · focus · invalid',
        code: 'selectors: `hover:` · `disabled:` · `focus-visible:` · `aria-invalid` (not a prop)',
      },
      {
        property: 'show label',
        values: 'boolean',
        code: 'pass `label` or not (with it, the field anatomy renders)',
      },
      {
        property: 'input text',
        values: 'text',
        code: '`value` / `defaultValue` (or `placeholder` when empty)',
      },
      { property: 'show hint / hint', values: 'boolean · text', code: 'pass `hint` or not' },
      { property: 'show tag', values: 'boolean', code: 'not implemented (no clear spec)' },
      {
        property: 'show highlight / show beamer / empty',
        values: 'boolean · off · on',
        code: 'nothing (design-only)',
      },
    ],
    guide: {
      use: [
        'Single-line text: names, emails, URLs, numbers, short answers.',
        'Pass `label` (and `hint`) to get the full field anatomy; `marker` shows required or optional.',
        'The bare control (no `label`) only where the context names it, e.g. a table cell or a toolbar.',
      ],
      avoid: [
        'Several lines of text: use Textarea. A message to the assistant: use Prompt Input.',
        'A choice from a known list: use Select or Combobox. Icons or buttons inside the field: use Input Group.',
        'Wrapping it in another Field: with `label` it already is one.',
      ],
      content: [
        'The label is a short noun (“Email”); the placeholder shows an example format, not instructions.',
        'The hint states the constraint; an error says what is wrong and how to fix it.',
      ],
      a11y: [
        'A bare input needs `aria-label` or `aria-labelledby`; a placeholder is not a label.',
        '`aria-invalid` turns the hint into a FieldError (`role="alert"`), linked by `aria-describedby`.',
        'Set the right `type` and `autoComplete` so browsers and assistive tech can help fill it.',
      ],
    },
    docs: {
      description: {
        component:
          'Single-line text field (Figma `text field`; shadcn/ui Input). With `label` it renders the field anatomy — Field + FieldLabel + Input + FieldDescription, or FieldError when `aria-invalid` — so never wrap it in a Field. Without `label` it is the bare control (then label it another way).',
      },
    },
  },
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    hint: 'Subtitle',
    size: 'default',
    marker: 'none',
    disabled: false,
    'aria-invalid': false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    marker: { control: 'inline-radio', options: ['none', 'required', 'optional'] },
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    disabled: { control: 'boolean' },
    'aria-invalid': { control: 'boolean', description: 'Invalid state (Figma state=invalid)' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'] },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
})

/** Every prop and the interaction state are in Controls. */
export const Default = meta.story()

Default.test('is labelled, described and takes typing', async ({ canvas }) => {
  const input = canvas.getByLabelText('Label')
  await expect(input).toHaveAccessibleDescription('Subtitle')
  await userEvent.type(input, 'Value')
  await expect(input).toHaveValue('Value')
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByLabelText('Label')).toBeDisabled()
})

/** Without a label: the bare control (show label off in Figma). Give it an accessible name. */
export const Bare = meta.story({
  args: { label: undefined, hint: undefined, 'aria-label': 'Label', placeholder: 'Placeholder' },
})

/** 32 / 40 / 48 px. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <Input key={size} size={size} label="Label" placeholder="Placeholder" />
      ))}
    </div>
  ),
})

/** Figma states side by side (rows: default · filled · hover · focus · invalid · disabled). For one field, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Label" placeholder="Placeholder" />
      <Input label="Label" defaultValue="Value" />
      <span className="pseudo-hover-all contents">
        <Input label="Label" defaultValue="Value" />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <Input label="Label" defaultValue="Value" />
      </span>
      <Input label="Label" defaultValue="Value" aria-invalid hint="Subtitle" />
      <Input label="Label" defaultValue="Value" disabled hint="Subtitle" />
    </div>
  ),
})

/** Invalid: hint becomes a FieldError (role=alert) and the label turns destructive. */
export const Invalid = meta.story({
  args: { 'aria-invalid': true, defaultValue: 'Value', hint: 'Subtitle' },
})

Invalid.test('shows the hint as an error', async ({ canvas }) => {
  await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
  await expect(canvas.getByLabelText('Label')).toHaveAccessibleDescription('Subtitle')
})

export const Markers = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Label" marker="required" required placeholder="Placeholder" />
      <Input label="Label" marker="optional" placeholder="Placeholder" />
    </div>
  ),
})

/** A small form: two required fields and a file input. */
export const Composition = meta.story({
  render: () => (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Input label="Label" type="email" marker="required" required autoComplete="email" />
      <Input label="Label" type="password" marker="required" required autoComplete="current-password" />
      <Input type="file" aria-label="Label" />
    </form>
  ),
})
