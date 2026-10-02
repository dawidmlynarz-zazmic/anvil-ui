import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './field'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10940-109'

// Stand-in controls until Combobox / Switch / Checkbox land; Figma's default control is a Combobox.
const selectClass =
  'h-10 w-full rounded-md bg-background px-3 type-text-sm-normal text-foreground inset-ring inset-ring-overlay-16 aria-invalid:inset-ring-danger'
const MODELS = ['Claude Sonnet 4.6', 'Claude Opus 4.6', 'Claude Haiku 4.5']

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Label + control + description + error for controls without a built-in label: Combobox, Input OTP, Slider, radio and checkbox groups, horizontal Switch / Checkbox rows. Text field (Input), Textarea and Select render this anatomy themselves — never wrap them in a Field. Invalid: `data-invalid` on Field and `aria-invalid` on the control.',
      },
    },
  },
  args: { orientation: 'vertical' },
  argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="model">Model</FieldLabel>
      <select id="model" className={selectClass}>
        {MODELS.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <FieldDescription>Helpful description of this setting.</FieldDescription>
    </Field>
  ),
}

/** Figma state=invalid: label and error turn destructive; the description stays. */
export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="model-invalid">Model</FieldLabel>
      <select id="model-invalid" aria-invalid="true" className={selectClass}>
        {MODELS.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <FieldDescription>Helpful description of this setting.</FieldDescription>
      <FieldError>Explain what to fix.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Explain what to fix.')
  },
}

/** Figma orientation=horizontal: control first, then label and description (Switch / Checkbox rows). */
export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Field orientation="horizontal">
        <input id="notify" type="checkbox" defaultChecked className="size-4 accent-primary" />
        <FieldContent>
          <FieldLabel htmlFor="notify">Email notifications</FieldLabel>
          <FieldDescription>Helpful description of this setting.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-invalid="true">
        <input id="notify-invalid" type="checkbox" aria-invalid="true" className="size-4 accent-primary" />
        <FieldContent>
          <FieldLabel htmlFor="notify-invalid">Accept the data policy</FieldLabel>
          <FieldDescription>Helpful description of this setting.</FieldDescription>
          <FieldError>Explain what to fix.</FieldError>
        </FieldContent>
      </Field>
    </div>
  ),
}

/** Disabled: data-disabled on Field dims the label (Label follows the control). */
export const Disabled: Story = {
  render: () => (
    <Field data-disabled="true">
      <FieldLabel htmlFor="model-disabled">Model</FieldLabel>
      <select id="model-disabled" disabled className={`${selectClass} opacity-50`}>
        <option>{MODELS[0]}</option>
      </select>
      <FieldDescription>Helpful description of this setting.</FieldDescription>
    </Field>
  ),
}

/** Groups (not drawn in Figma): FieldSet + FieldLegend for a set of related controls. */
export const Group: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Agent tools</FieldLegend>
      <FieldDescription>Choose what the agent may use.</FieldDescription>
      <FieldGroup data-slot="checkbox-group">
        {['Web search', 'Code execution', 'File access'].map((tool) => (
          <Field key={tool} orientation="horizontal">
            <input id={tool} type="checkbox" className="size-4 accent-primary" />
            <FieldLabel htmlFor={tool}>{tool}</FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  ),
}
