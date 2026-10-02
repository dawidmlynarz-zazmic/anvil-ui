import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'

import { Textarea } from './textarea'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10939-229'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
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
  },
  argTypes: {
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
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByLabelText('Label')
    await expect(textarea).toHaveAccessibleDescription('Subtitle')
    await userEvent.type(textarea, 'Value{Shift>}{Enter}{/Shift}Value')
    await expect(textarea).toHaveValue('Value\nValue')
  },
}

export const Bare: Story = {
  args: { label: undefined, hint: undefined, 'aria-label': 'Label' },
}

/** Figma states as selectors (rows: default · filled · hover · focus · invalid · disabled); hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Textarea label="Label" placeholder="Placeholder" />
      <Textarea label="Label" defaultValue="Value" />
      <Textarea label="Label" defaultValue="Value" data-demo="hover" />
      <Textarea label="Label" defaultValue="Value" data-demo="focus" />
      <Textarea label="Label" defaultValue="Value" aria-invalid hint="Subtitle" />
      <Textarea label="Label" defaultValue="Value" disabled />
    </div>
  ),
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Value', hint: 'Subtitle' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
  },
}

/** Grows with its content (field-sizing: content) from the 80px minimum. */
export const AutoGrow: Story = {
  args: {
    label: 'Label',
    defaultValue: 'Value\nValue\nValue\nValue\nValue',
  },
}
