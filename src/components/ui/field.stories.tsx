import preview from '#.storybook/preview'
import { useId, useState } from 'react'
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

function FieldCombobox({
  id,
  invalid,
  disabled,
  describedBy,
}: {
  id: string
  invalid?: boolean
  disabled?: boolean
  describedBy?: string
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger
        id={id}
        placeholder="Placeholder"
        disabled={disabled}
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

type DemoProps = {
  /** Figma orientation: vertical (control Combobox) · horizontal (control Switch). */
  orientation?: 'vertical' | 'horizontal'
  label?: string
  description?: string
  /** Figma state=invalid: `data-invalid` on Field; the error replaces the description (vertical). */
  invalid?: boolean
  error?: string
  /** `data-disabled` on Field dims the label; the control is disabled too. */
  disabled?: boolean
}

/** A Field with the Figma anatomy: vertical → label, Combobox, description / error; horizontal → Switch, label, description. */
function DemoField({
  orientation = 'vertical',
  label = 'Label',
  description = 'Subtitle',
  invalid = false,
  error = 'Subtitle',
  disabled = false,
}: DemoProps) {
  const id = useId()
  const state = {
    'data-invalid': invalid || undefined,
    'data-disabled': disabled || undefined,
  }
  if (orientation === 'horizontal') {
    return (
      <Field orientation="horizontal" {...state}>
        <Switch
          id={id}
          defaultChecked
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
        />
        <FieldContent>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <FieldDescription>{description}</FieldDescription>
          {invalid && <FieldError id={`${id}-error`}>{error}</FieldError>}
        </FieldContent>
      </Field>
    )
  }
  return (
    <Field {...state}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldCombobox id={id} invalid={invalid} disabled={disabled} describedBy={`${id}-hint`} />
      {invalid ? (
        <FieldError id={`${id}-hint`}>{error}</FieldError>
      ) : (
        <FieldDescription id={`${id}-hint`}>{description}</FieldDescription>
      )}
    </Field>
  )
}

const meta = preview.meta({
  title: 'Components/Field',
  tags: ['ui-component'],
  component: DemoField,
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
  args: {
    orientation: 'vertical',
    label: 'Label',
    description: 'Subtitle',
    invalid: false,
    error: 'Subtitle',
    disabled: false,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    label: { control: 'text' },
    description: { control: 'text' },
    invalid: {
      control: 'boolean',
      description: 'Invalid state (Figma state=invalid): `data-invalid` on Field',
    },
    error: { control: 'text' },
    disabled: { control: 'boolean', description: '`data-disabled` on Field, `disabled` on the control' },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
})

/** Figma default (orientation=vertical, control Combobox): label, control, description. Every prop is in Controls. */
export const Default = meta.story()

Default.test('the label names the control and the description describes it', async ({ canvas }) => {
  await expect(canvas.getByRole('combobox', { name: 'Label' })).toHaveAccessibleDescription('Subtitle')
})

Default.test('invalid shows the error', { args: { invalid: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('group')).toHaveAttribute('data-invalid', 'true')
  await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
  await expect(canvas.getByRole('combobox', { name: 'Label' })).toHaveAttribute('aria-invalid', 'true')
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('group')).toHaveAttribute('data-disabled', 'true')
  await expect(canvas.getByRole('combobox', { name: 'Label' })).toBeDisabled()
})

/** Figma orientation=vertical, state=invalid: the label and error turn destructive. */
export const VerticalInvalid = meta.story({
  name: 'Vertical invalid',
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-combobox-invalid">Label</FieldLabel>
      <FieldCombobox id="field-combobox-invalid" invalid describedBy="field-combobox-error" />
      <FieldError id="field-combobox-error">Subtitle</FieldError>
    </Field>
  ),
})

/** Figma orientation=horizontal (control Switch): control first, then label and description. */
export const Horizontal = meta.story({
  render: () => (
    <Field orientation="horizontal">
      <Switch id="field-switch" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="field-switch">Label</FieldLabel>
        <FieldDescription>Subtitle</FieldDescription>
      </FieldContent>
    </Field>
  ),
})

Horizontal.test('clicking the label toggles the switch', async ({ canvas }) => {
  const toggle = canvas.getByRole('switch', { name: 'Label' })
  await userEvent.click(canvas.getByText('Label'))
  await expect(toggle).not.toBeChecked()
})

/** Figma state=invalid: `data-invalid` on Field turns the label and error destructive; the description stays. */
export const Invalid = meta.story({
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
})

Invalid.test('the error is announced and describes the control', async ({ canvas }) => {
  await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
  await expect(canvas.getByRole('checkbox', { name: 'Label' })).toHaveAccessibleDescription('Subtitle')
})

/** `data-disabled` on Field dims the label; disable the control itself too. */
export const Disabled = meta.story({
  render: () => (
    <Field orientation="horizontal" data-disabled="true">
      <Switch id="field-disabled" disabled />
      <FieldContent>
        <FieldLabel htmlFor="field-disabled">Label</FieldLabel>
        <FieldDescription>Subtitle</FieldDescription>
      </FieldContent>
    </Field>
  ),
})

/** A radio group: FieldSet + FieldLegend label the group, each option is a horizontal Field. */
export const RadioGroupInFieldSet = meta.story({
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
})

/** A checkbox group with a group-level error. */
export const CheckboxGroup = meta.story({
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
})

/** Slider: FieldLabel names it (the label is forwarded to the thumb). */
export const WithSlider = meta.story({
  render: () => (
    <Field>
      <FieldLabel id="field-slider-label">Label</FieldLabel>
      <Slider aria-labelledby="field-slider-label" defaultValue={[50]} max={100} step={1} />
      <FieldDescription>Subtitle</FieldDescription>
    </Field>
  ),
})

WithSlider.test('the label names the slider', async ({ canvas }) => {
  await expect(canvas.getByRole('slider', { name: 'Label' })).toHaveAttribute('aria-valuenow', '50')
})

/** Input OTP: FieldLabel points at the hidden input that drives the slots. */
export const WithInputOTP = meta.story({
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
})

WithInputOTP.test('the label names the input', async ({ canvas }) => {
  await expect(canvas.getByRole('textbox', { name: 'Label' })).toHaveAccessibleDescription('Subtitle')
})

/** Sections of a settings form: FieldGroup stacks Fields, FieldSeparator divides them. */
export const Group = meta.story({
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
})

/**
 * Figma orientation=vertical (label, control, description, error) is what Input, Textarea and
 * Select render for you with `label`: this is a Field — don't wrap it in another one.
 */
export const BuiltIntoInput = meta.story({
  name: 'Built into Input',
  render: () => (
    <div className="flex flex-col gap-6">
      <Input label="Label" hint="Subtitle" placeholder="Placeholder" />
      <Input label="Label" hint="Subtitle" defaultValue="Value" aria-invalid />
    </div>
  ),
})

BuiltIntoInput.test('Input renders its own Field', async ({ canvasElement }) => {
  const fields = canvasElement.querySelectorAll('[data-slot=field]')
  await expect(fields).toHaveLength(2)
  await expect(fields[1]).toHaveAttribute('data-invalid', 'true')
})
