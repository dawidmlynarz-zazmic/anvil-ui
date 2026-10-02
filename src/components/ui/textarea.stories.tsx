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
    label: 'Message',
    placeholder: 'Type your message here.',
    hint: 'Shift + Enter for a new line.',
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
    const textarea = canvas.getByLabelText('Message')
    await expect(textarea).toHaveAccessibleDescription('Shift + Enter for a new line.')
    await userEvent.type(textarea, 'Hello{Shift>}{Enter}{/Shift}agent')
    await expect(textarea).toHaveValue('Hello\nagent')
  },
}

export const Bare: Story = {
  args: { label: undefined, hint: undefined, 'aria-label': 'Prompt' },
}

/** Figma states as selectors; hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Textarea label="Default" placeholder="Type your message here." />
      <Textarea label="Filled" defaultValue="Type your message here." />
      <Textarea label="Hover" defaultValue="Type your message here." data-demo="hover" />
      <Textarea label="Focus" defaultValue="Type your message here." data-demo="focus" />
      <Textarea label="Invalid" defaultValue="Too short" aria-invalid hint="Explain what to fix." />
      <Textarea label="Disabled" defaultValue="Type your message here." disabled />
    </div>
  ),
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Hi', hint: 'Write at least 20 characters.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Write at least 20 characters.')
  },
}

/** Grows with its content (field-sizing: content) from the 80px minimum. */
export const AutoGrow: Story = {
  args: {
    label: 'System prompt',
    defaultValue:
      'You are a helpful support agent for Zazmic.\nAnswer briefly.\nAsk a clarifying question when the request is ambiguous.\nNever share internal ticket ids.',
  },
}
