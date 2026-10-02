import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'

import { Input } from './input'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=57-154'
const sizes = ['sm', 'default', 'lg'] as const

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Single-line text field (Figma `text field`; shadcn/ui Input). With `label` it renders the field anatomy — Field + FieldLabel + Input + FieldDescription, or FieldError when `aria-invalid` — so never wrap it in a Field. Without `label` it is the bare control (then label it another way).',
      },
    },
  },
  args: {
    label: 'Email',
    placeholder: 'name@company.com',
    hint: 'We only use it for sign-in.',
    size: 'default',
    marker: 'none',
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    marker: { control: 'inline-radio', options: ['none', 'required', 'optional'] },
    label: { control: 'text' },
    hint: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Email')
    await expect(input).toHaveAccessibleDescription('We only use it for sign-in.')
    await userEvent.type(input, 'ada@zazmic.ai')
    await expect(input).toHaveValue('ada@zazmic.ai')
  },
}

/** Without a label: the bare control (show label off in Figma). Give it an accessible name. */
export const Bare: Story = {
  args: { label: undefined, hint: undefined, 'aria-label': 'Search conversations', placeholder: 'Search…' },
}

/** 32 / 40 / 48 px. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <Input key={size} size={size} label={`Size ${size}`} placeholder="Sample text" />
      ))}
    </div>
  ),
}

/** Figma states as selectors; hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Default" placeholder="Sample text" />
      <Input label="Filled" defaultValue="Sample text" />
      <Input label="Hover" defaultValue="Sample text" data-demo="hover" />
      <Input label="Focus" defaultValue="Sample text" data-demo="focus" />
      <Input label="Invalid" defaultValue="Sample text" aria-invalid hint="Explain what to fix." />
      <Input label="Disabled" defaultValue="Sample text" disabled hint="Helpful description." />
    </div>
  ),
}

/** Invalid: hint becomes a FieldError (role=alert) and the label turns destructive. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'ada@', hint: 'Enter a complete email address.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a complete email address.')
    await expect(canvas.getByLabelText('Email')).toHaveAccessibleDescription(
      'Enter a complete email address.',
    )
  },
}

export const Markers: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Workspace name" marker="required" required placeholder="Acme" />
      <Input label="Team" marker="optional" placeholder="Support" />
    </div>
  ),
}

/** Typical sign-in form. */
export const Composition: Story = {
  render: () => (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Input label="Email" type="email" marker="required" required autoComplete="email" />
      <Input label="Password" type="password" marker="required" required autoComplete="current-password" />
      <Input type="file" aria-label="Attachment" />
    </form>
  ),
}
