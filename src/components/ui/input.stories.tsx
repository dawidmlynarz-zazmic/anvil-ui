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
    label: 'Label',
    placeholder: 'Placeholder',
    hint: 'Subtitle',
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
    const input = canvas.getByLabelText('Label')
    await expect(input).toHaveAccessibleDescription('Subtitle')
    await userEvent.type(input, 'Value')
    await expect(input).toHaveValue('Value')
  },
}

/** Without a label: the bare control (show label off in Figma). Give it an accessible name. */
export const Bare: Story = {
  args: { label: undefined, hint: undefined, 'aria-label': 'Label', placeholder: 'Placeholder' },
}

/** 32 / 40 / 48 px. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <Input key={size} size={size} label="Label" placeholder="Placeholder" />
      ))}
    </div>
  ),
}

/** Figma states as selectors (rows: default · filled · hover · focus · invalid · disabled); hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Label" placeholder="Placeholder" />
      <Input label="Label" defaultValue="Value" />
      <Input label="Label" defaultValue="Value" data-demo="hover" />
      <Input label="Label" defaultValue="Value" data-demo="focus" />
      <Input label="Label" defaultValue="Value" aria-invalid hint="Subtitle" />
      <Input label="Label" defaultValue="Value" disabled hint="Subtitle" />
    </div>
  ),
}

/** Invalid: hint becomes a FieldError (role=alert) and the label turns destructive. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Value', hint: 'Subtitle' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
    await expect(canvas.getByLabelText('Label')).toHaveAccessibleDescription('Subtitle')
  },
}

export const Markers: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Label" marker="required" required placeholder="Placeholder" />
      <Input label="Label" marker="optional" placeholder="Placeholder" />
    </div>
  ),
}

/** A small form: two required fields and a file input. */
export const Composition: Story = {
  render: () => (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Input label="Label" type="email" marker="required" required autoComplete="email" />
      <Input label="Label" type="password" marker="required" required autoComplete="current-password" />
      <Input type="file" aria-label="Label" />
    </form>
  ),
}
