import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'

import { Checkbox } from './checkbox'
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from './combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from './command'
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Slider } from './slider'
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
          '**When to use it:** for controls that have no label of their own — horizontal Switch / Checkbox rows, radio and checkbox groups (with `FieldSet` + `FieldLegend`), Combobox, Slider and Input OTP.',
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

function FieldCombobox({
  id,
  invalid,
  describedBy,
}: {
  id: string
  invalid?: boolean
  describedBy?: string
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger
        id={id}
        placeholder="Placeholder"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      >
        {value}
      </ComboboxTrigger>
      <ComboboxContent>
        <Command>
          <CommandInput placeholder="Placeholder" />
          <CommandList>
            <CommandGroup>
              {OPTIONS.map((option) => (
                <ComboboxItem
                  key={option}
                  value={option}
                  selected={value === option}
                  onSelect={(next) => {
                    setValue(next === value ? '' : next)
                    setOpen(false)
                  }}
                >
                  {option}
                </ComboboxItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandEmpty>Subtitle</CommandEmpty>
        </Command>
      </ComboboxContent>
    </Combobox>
  )
}

/** Figma default (orientation=vertical, control Combobox): label, control, description. */
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="field-combobox">Label</FieldLabel>
      <FieldCombobox id="field-combobox" describedBy="field-combobox-hint" />
      <FieldDescription id="field-combobox-hint">Subtitle</FieldDescription>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Label' })).toHaveAccessibleDescription('Subtitle')
  },
}

/** Figma orientation=vertical, state=invalid: the label and error turn destructive. */
export const VerticalInvalid: Story = {
  name: 'Vertical invalid',
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-combobox-invalid">Label</FieldLabel>
      <FieldCombobox id="field-combobox-invalid" invalid describedBy="field-combobox-error" />
      <FieldError id="field-combobox-error">Subtitle</FieldError>
    </Field>
  ),
}

/** Figma orientation=horizontal (control Switch): control first, then label and description. */
export const Horizontal: Story = {
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

/** Slider: FieldLabel names it (the label is forwarded to the thumb). */
export const WithSlider: Story = {
  render: () => (
    <Field>
      <FieldLabel id="field-slider-label">Label</FieldLabel>
      <Slider aria-labelledby="field-slider-label" defaultValue={[50]} max={100} step={1} />
      <FieldDescription>Subtitle</FieldDescription>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider', { name: 'Label' })).toHaveAttribute('aria-valuenow', '50')
  },
}

/** Input OTP: FieldLabel points at the hidden input that drives the slots. */
export const WithInputOTP: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="field-otp">Label</FieldLabel>
      <InputOTP id="field-otp" maxLength={6} aria-describedby="field-otp-hint">
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription id="field-otp-hint">Subtitle</FieldDescription>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Label' })).toHaveAccessibleDescription('Subtitle')
  },
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
