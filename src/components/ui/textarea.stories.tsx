import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Textarea } from './textarea'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10939-229'

const meta = preview.meta({
  title: 'Components/Textarea',
  tags: ['ui-component'],
  component: Textarea,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'show label', values: 'boolean', code: 'pass `label` or not' },
      { property: 'value', values: 'text', code: '`value` / `defaultValue`' },
      { property: 'hint / show hint', values: 'text · boolean', code: 'pass `hint` or not' },
      {
        property: 'state',
        values: 'default · hover · focus · disabled · invalid',
        code: 'selectors: `hover:` · `focus-visible:` · `disabled:` · `aria-invalid` (not a prop)',
      },
      {
        property: 'empty',
        values: 'on · off',
        code: 'nothing (design-only): the placeholder shows while it is empty',
      },
    ],
    docs: {
      description: {
        component:
          'Multi-line input with the field anatomy built in (Figma `textarea`; shadcn/ui Textarea). Same rules as Input: with `label` it renders Field + FieldLabel + Textarea + FieldDescription (FieldError when `aria-invalid`); without one it is the bare control. Minimum height 80, grows with content.',
      },
    },
  },
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    hint: 'Subtitle',
    marker: 'none',
    disabled: false,
    'aria-invalid': false,
  },
  argTypes: {
    marker: { control: 'inline-radio', options: ['none', 'required', 'optional'] },
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    'aria-invalid': { control: 'boolean', description: 'Invalid state (Figma state=invalid)' },
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

Default.test('is labelled, described and takes multi-line typing', async ({ canvas }) => {
  const textarea = canvas.getByLabelText('Label')
  await expect(textarea).toHaveAccessibleDescription('Subtitle')
  await userEvent.type(textarea, 'Value{Shift>}{Enter}{/Shift}Value')
  await expect(textarea).toHaveValue('Value\nValue')
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByLabelText('Label')).toBeDisabled()
})

export const Bare = meta.story({
  args: { label: undefined, hint: undefined, 'aria-label': 'Label' },
})

/** Figma states side by side (rows: default · filled · hover · focus · invalid · disabled). For one field, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Textarea label="Label" placeholder="Placeholder" />
      <Textarea label="Label" defaultValue="Value" />
      <span className="pseudo-hover-all contents">
        <Textarea label="Label" defaultValue="Value" />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <Textarea label="Label" defaultValue="Value" />
      </span>
      <Textarea label="Label" defaultValue="Value" aria-invalid hint="Subtitle" />
      <Textarea label="Label" defaultValue="Value" disabled />
    </div>
  ),
})

export const Invalid = meta.story({
  args: { 'aria-invalid': true, defaultValue: 'Value', hint: 'Subtitle' },
})

Invalid.test('shows the hint as an error', async ({ canvas }) => {
  await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
})

/** Grows with its content (field-sizing: content) from the 80px minimum. */
export const AutoGrow = meta.story({
  args: {
    label: 'Label',
    defaultValue: 'Value\nValue\nValue\nValue\nValue',
  },
})
