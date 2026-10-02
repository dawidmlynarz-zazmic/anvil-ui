import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  type SelectTriggerProps,
  SelectValue,
} from './select'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=56-121'
const MODELS = ['Claude Sonnet 4.6', 'Claude Opus 4.6', 'Claude Haiku 4.5']

type DemoProps = SelectTriggerProps & {
  defaultValue?: string
  disabled?: boolean
  open?: boolean
  placeholder?: string
}

/** One Select with the model list; trigger props (label, hint, size, aria-invalid) pass through. */
function ModelSelect({
  defaultValue,
  disabled,
  open,
  placeholder = 'Choose a model',
  ...trigger
}: DemoProps) {
  return (
    <Select defaultValue={defaultValue} disabled={disabled} open={open}>
      <SelectTrigger {...trigger}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// While the list is open, Radix hides the rest of the page from assistive tech (modal select), so
// the trigger is inside aria-hidden by design; axe's aria-hidden-focus does not apply to that.
const openListA11y = { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } }

const meta = {
  title: 'Components/Select',
  component: ModelSelect,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Pick one value from a short fixed list (about 10 or fewer); use Combobox for long or async lists (shadcn/ui Select on Radix). The built-in field anatomy lives on `SelectTrigger`: `label`, `hint`, `marker`, `aria-invalid`. `disabled` goes on the `Select` root.',
      },
    },
  },
  args: { label: 'Model', hint: 'Used for new conversations.', size: 'default', marker: 'none' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    marker: { control: 'inline-radio', options: ['none', 'required', 'optional'] },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModelSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Model' })
    await expect(trigger).toHaveAccessibleDescription('Used for new conversations.')
    await userEvent.click(trigger)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await body.findByRole('option', { name: 'Claude Opus 4.6' }))
    await expect(trigger).toHaveTextContent('Claude Opus 4.6')
    // Let the list finish its exit animation before the a11y check runs.
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
  },
}

/** Without a label: the bare trigger (show label off in Figma). */
export const Bare: Story = {
  args: { label: undefined, hint: undefined, 'aria-label': 'Model', defaultValue: MODELS[0] },
}

/** 32 / 40 / 48 px. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <ModelSelect key={size} size={size} label={`Size ${size}`} defaultValue={MODELS[0]} />
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
      <ModelSelect label="Empty (placeholder)" />
      <ModelSelect label="Default" defaultValue={MODELS[0]} />
      <ModelSelect label="Hover" defaultValue={MODELS[0]} data-demo="hover" />
      <ModelSelect label="Focus" defaultValue={MODELS[0]} data-demo="focus" />
      <ModelSelect label="Invalid" defaultValue={MODELS[0]} aria-invalid hint="Explain what to fix." />
      <ModelSelect label="Disabled" defaultValue={MODELS[0]} disabled />
    </div>
  ),
}

/** Figma open=true: controlled `open` so the list stays visible. */
export const Open: Story = {
  parameters: { docs: { story: { inline: false, height: '280px' } }, a11y: openListA11y },
  args: { open: true, defaultValue: MODELS[0] },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const listbox = await body.findByRole('listbox')
    await waitFor(() => expect(listbox).toBeVisible()) // after the fade-in
    await expect(body.getByRole('option', { name: MODELS[0] })).toHaveAttribute('data-state', 'checked')
  },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true, hint: 'Pick a model to continue.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Pick a model to continue.')
  },
}

/** Groups, labels and a separator inside the list. */
export const Groups: Story = {
  parameters: { docs: { story: { inline: false, height: '340px' } }, a11y: openListA11y },
  render: () => {
    function GroupedSelect() {
      const [value, setValue] = useState('sonnet')
      return (
        <Select value={value} onValueChange={setValue} open>
          <SelectTrigger label="Model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Anthropic</SelectLabel>
              <SelectItem value="sonnet">Claude Sonnet 4.6</SelectItem>
              <SelectItem value="opus">Claude Opus 4.6</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Legacy</SelectLabel>
              <SelectItem value="haiku" disabled>
                Claude Haiku 3 (retired)
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    }
    return <GroupedSelect />
  },
}
