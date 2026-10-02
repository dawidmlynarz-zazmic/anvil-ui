import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'

import { Checkbox } from './checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from './field'
import { Input } from './input'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Switch } from './switch'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10940-109'
const OPTIONS = ['Label 1', 'Label 2', 'Label 3']

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component: [
          '**What it is:** shadcn/ui Field — the form layout primitive. It lays out a label, a control, a description and an error with consistent spacing, and carries the state: `data-invalid` turns the label and error destructive, `data-disabled` dims the label.',
          '**When to use it:** for controls that have no label of their own — horizontal Switch / Checkbox rows, radio and checkbox groups (with `FieldSet` + `FieldLegend`), and later Combobox, Slider and Input OTP.',
          '**When not to:** Input, Textarea and Select already render a Field when you pass `label` (see *Built into Input*). Never wrap those in another Field.',
        ].join('\n\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

/** Figma orientation=horizontal (its default control here is a Switch): control first, then label and description. */
export const Default: Story = {
  render: () => (
    <Field orientation="horizontal">
      <Switch id="field-switch" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="field-switch">Label</FieldLabel>
        <FieldDescription>Subtitle</FieldDescription>
      </FieldContent>
    </Field>
  ),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('switch', { name: 'Label' })
    await userEvent.click(canvas.getByText('Label'))
    await expect(toggle).not.toBeChecked()
  },
}

/** Figma state=invalid: `data-invalid` on Field turns the label and error destructive; the description stays. */
export const Invalid: Story = {
  render: () => (
    <Field orientation="horizontal" data-invalid="true">
      <Checkbox id="field-checkbox" aria-invalid aria-describedby="field-checkbox-error" />
      <FieldContent>
        <FieldLabel htmlFor="field-checkbox">Label</FieldLabel>
        <FieldDescription>Subtitle</FieldDescription>
        <FieldError id="field-checkbox-error">Subtitle</FieldError>
      </FieldContent>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
    await expect(canvas.getByRole('checkbox', { name: 'Label' })).toHaveAccessibleDescription('Subtitle')
  },
}

/** `data-disabled` on Field dims the label; disable the control itself too. */
export const Disabled: Story = {
  render: () => (
    <Field orientation="horizontal" data-disabled="true">
      <Switch id="field-disabled" disabled />
      <FieldContent>
        <FieldLabel htmlFor="field-disabled">Label</FieldLabel>
        <FieldDescription>Subtitle</FieldDescription>
      </FieldContent>
    </Field>
  ),
}

/** A radio group: FieldSet + FieldLegend label the group, each option is a horizontal Field. */
export const RadioGroupInFieldSet: Story = {
  name: 'Radio group',
  render: () => (
    <FieldSet>
      <FieldLegend variant="label">Title</FieldLegend>
      <FieldDescription>Subtitle</FieldDescription>
      <RadioGroup defaultValue="1">
        {OPTIONS.map((label, i) => (
          <Field key={label} orientation="horizontal">
            <RadioGroupItem id={`field-radio-${i}`} value={String(i + 1)} />
            <FieldLabel htmlFor={`field-radio-${i}`}>{label}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  ),
}

/** A checkbox group with a group-level error. */
export const CheckboxGroup: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend variant="label">Title</FieldLegend>
      <FieldDescription>Subtitle</FieldDescription>
      <FieldGroup data-slot="checkbox-group">
        {OPTIONS.map((label, i) => (
          <Field key={label} orientation="horizontal">
            <Checkbox id={`field-check-${i}`} defaultChecked={i === 0} />
            <FieldLabel htmlFor={`field-check-${i}`}>{label}</FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  ),
}

/** Sections of a settings form: FieldGroup stacks Fields, FieldSeparator divides them. */
export const Group: Story = {
  render: () => (
    <FieldGroup>
      <Field orientation="horizontal">
        <Switch id="field-group-1" />
        <FieldContent>
          <FieldLabel htmlFor="field-group-1">Label 1</FieldLabel>
          <FieldDescription>Subtitle</FieldDescription>
        </FieldContent>
      </Field>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Switch id="field-group-2" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="field-group-2">Label 2</FieldLabel>
          <FieldDescription>Subtitle</FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
}

/**
 * Figma orientation=vertical (label, control, description, error) is what Input, Textarea and
 * Select render for you with `label`: this is a Field — don't wrap it in another one.
 */
export const BuiltIntoInput: Story = {
  name: 'Built into Input',
  render: () => (
    <div className="flex flex-col gap-6">
      <Input label="Label" hint="Subtitle" placeholder="Placeholder" />
      <Input label="Label" hint="Subtitle" defaultValue="Value" aria-invalid />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fields = canvasElement.querySelectorAll('[data-slot=field]')
    await expect(fields).toHaveLength(2)
    await expect(fields[1]).toHaveAttribute('data-invalid', 'true')
  },
}
