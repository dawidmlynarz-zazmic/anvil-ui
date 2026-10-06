import preview from '#.storybook/preview'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { expect, userEvent } from 'storybook/test'

import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10855-5813'

function Slots({ count = 6 }: { count?: number }) {
  return (
    <InputOTPGroup>
      {Array.from({ length: count }, (_, i) => (
        <InputOTPSlot key={i} index={i} />
      ))}
    </InputOTPGroup>
  )
}

const meta = preview.meta({
  title: 'UI Components/Input OTP',
  tags: ['ui-component'],
  component: InputOTP,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'empty · partial · filled · invalid',
        code: '`value` length (empty · partial · filled) and `aria-invalid` (not a prop)',
      },
    ],
    docs: {
      description: {
        component:
          'One-time code entry (shadcn/ui Input OTP on input-otp). Six slots by default; the active slot is outlined. Label it with a Field; on error keep the digits, set `aria-invalid` and show the message in a FieldError.',
      },
    },
  },
  args: {
    maxLength: 6,
    pattern: REGEXP_ONLY_DIGITS,
    children: <Slots />,
    'aria-label': 'Label',
    disabled: false,
    'aria-invalid': false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    'aria-invalid': { control: 'boolean', description: 'Invalid state (Figma state=invalid)' },
    defaultValue: { control: 'text' },
    maxLength: { control: { type: 'number', min: 1, max: 6 } },
    onChange: { control: false, table: { category: 'Events' } },
    onComplete: { control: false, table: { category: 'Events' } },
    children: { table: { disable: true } },
    pattern: { table: { disable: true } },
    render: { table: { disable: true } },
    className: { table: { disable: true } },
    containerClassName: { table: { disable: true } },
  },
})

/** Figma state=empty: the first slot is active once focused. */
export const Default = meta.story()

Default.test('typing fills the slots and moves the active slot', async ({ canvas, canvasElement }) => {
  const input = canvas.getByRole('textbox', { name: 'Label' })
  await userEvent.click(input)
  await userEvent.keyboard('294')
  await expect(input).toHaveValue('294')
  await expect(canvasElement.querySelectorAll('[data-slot=input-otp-slot]')[3]).toHaveAttribute(
    'data-active',
    'true',
  )
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('textbox', { name: 'Label' })).toBeDisabled()
})

/** Figma state=filled. */
export const Filled = meta.story({ args: { defaultValue: '294170' } })

/** Figma state=invalid: every slot gets the danger stroke; the digits stay. */
export const Invalid = meta.story({
  render: () => (
    <Field data-invalid="true" className="w-fit">
      <FieldLabel htmlFor="otp-invalid">Label</FieldLabel>
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        id="otp-invalid"
        defaultValue="294170"
        aria-invalid
        aria-describedby="otp-error"
      >
        <Slots />
      </InputOTP>
      <FieldError id="otp-error">Subtitle</FieldError>
    </Field>
  ),
})

export const Disabled = meta.story({ args: { disabled: true, defaultValue: '294' } })

/** Two groups with a separator (shadcn pattern). */
export const WithSeparator = meta.story({
  args: {
    children: (
      <>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </>
    ),
  },
})

/** In a Field: label and description around the slots. */
export const WithField = meta.story({
  render: () => (
    <Field className="w-fit">
      <FieldLabel htmlFor="otp-field">Label</FieldLabel>
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} id="otp-field" aria-describedby="otp-hint">
        <Slots />
      </InputOTP>
      <FieldDescription id="otp-hint">Subtitle</FieldDescription>
    </Field>
  ),
})
