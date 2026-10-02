import type { Meta, StoryObj } from '@storybook/react-vite'
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

const meta = {
  title: 'Components/Input OTP',
  component: InputOTP,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'One-time code entry (shadcn/ui Input OTP on input-otp). Six slots by default; the active slot is outlined. Label it with a Field; on error keep the digits, set `aria-invalid` and show the message in a FieldError.',
      },
    },
  },
  args: { maxLength: 6, pattern: REGEXP_ONLY_DIGITS, children: <Slots />, 'aria-label': 'Label' },
  argTypes: { children: { table: { disable: true } }, disabled: { control: 'boolean' } },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

/** Figma state=empty: the first slot is active once focused. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('textbox', { name: 'Label' })
    await userEvent.click(input)
    await userEvent.keyboard('294')
    await expect(input).toHaveValue('294')
    await expect(canvasElement.querySelectorAll('[data-slot=input-otp-slot]')[3]).toHaveAttribute(
      'data-active',
      'true',
    )
  },
}

/** Figma state=filled. */
export const Filled: Story = { args: { defaultValue: '294170' } }

/** Figma state=invalid: every slot gets the danger stroke; the digits stay. */
export const Invalid: Story = {
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
}

export const Disabled: Story = { args: { disabled: true, defaultValue: '294' } }

/** Two groups with a separator (shadcn pattern). */
export const WithSeparator: Story = {
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
}

/** In a Field: label and description around the slots. */
export const WithField: Story = {
  render: () => (
    <Field className="w-fit">
      <FieldLabel htmlFor="otp-field">Label</FieldLabel>
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} id="otp-field" aria-describedby="otp-hint">
        <Slots />
      </InputOTP>
      <FieldDescription id="otp-hint">Subtitle</FieldDescription>
    </Field>
  ),
}
