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

// Native stand-in controls (Figma's default control is a Combobox, not built yet).
const selectClass =
  'h-10 w-full rounded-md bg-background px-3 type-text-sm-normal text-foreground inset-ring inset-ring-overlay-16 aria-invalid:inset-ring-danger'
const OPTIONS = ['Label 1', 'Label 2', 'Label 3']

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
      <FieldLabel htmlFor="field-1">Label</FieldLabel>
      <select id="field-1" className={selectClass}>
        {OPTIONS.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <FieldDescription>Subtitle</FieldDescription>
    </Field>
  ),
}

/** Figma state=invalid: label and error turn destructive; the description stays. */
export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-invalid">Label</FieldLabel>
      <select id="field-invalid" aria-invalid="true" className={selectClass}>
        {OPTIONS.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <FieldDescription>Subtitle</FieldDescription>
      <FieldError>Subtitle</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
  },
}

/** Figma orientation=horizontal: control first, then label and description (Switch / Checkbox rows). */
export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Field orientation="horizontal">
        <input id="field-horizontal" type="checkbox" defaultChecked className="size-4 accent-primary" />
        <FieldContent>
          <FieldLabel htmlFor="field-horizontal">Label</FieldLabel>
          <FieldDescription>Subtitle</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-invalid="true">
        <input
          id="field-horizontal-invalid"
          type="checkbox"
          aria-invalid="true"
          className="size-4 accent-primary"
        />
        <FieldContent>
          <FieldLabel htmlFor="field-horizontal-invalid">Label</FieldLabel>
          <FieldDescription>Subtitle</FieldDescription>
          <FieldError>Subtitle</FieldError>
        </FieldContent>
      </Field>
    </div>
  ),
}

/** Disabled: data-disabled on Field dims the label (Label follows the control). */
export const Disabled: Story = {
  render: () => (
    <Field data-disabled="true">
      <FieldLabel htmlFor="field-disabled">Label</FieldLabel>
      <select id="field-disabled" disabled className={`${selectClass} opacity-50`}>
        <option>{OPTIONS[0]}</option>
      </select>
      <FieldDescription>Subtitle</FieldDescription>
    </Field>
  ),
}

/** Groups (not drawn in Figma): FieldSet + FieldLegend for a set of related controls. */
export const Group: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Title</FieldLegend>
      <FieldDescription>Subtitle</FieldDescription>
      <FieldGroup data-slot="checkbox-group">
        {OPTIONS.map((tool) => (
          <Field key={tool} orientation="horizontal">
            <input id={tool} type="checkbox" className="size-4 accent-primary" />
            <FieldLabel htmlFor={tool}>{tool}</FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  ),
}
