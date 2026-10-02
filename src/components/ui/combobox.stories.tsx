import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from './combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from './command'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-270'
const OPTIONS = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5']

type DemoProps = {
  defaultOpen?: boolean
  defaultValue?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  describedBy?: string
}

function Demo({ defaultOpen = false, defaultValue = '', disabled, invalid, id, describedBy }: DemoProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [value, setValue] = useState(defaultValue)
  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger
        id={id}
        placeholder="Placeholder"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={id ? undefined : 'Label'}
      >
        {value}
      </ComboboxTrigger>
      <ComboboxContent>
        <Command>
          <CommandInput placeholder="Placeholder" />
          <CommandList>
            <CommandGroup heading="Title">
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

const meta = {
  title: 'Components/Combobox',
  component: ComboboxTrigger,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Pick one value from a long or searchable list: shadcn/ui’s Combobox pattern (Popover + Command). Use Select for a short fixed list. The trigger is a bare control; give it a label with `Field` + `FieldLabel`.',
      },
      story: { inline: false, height: '360px' },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  render: () => <Demo />,
} satisfies Meta<typeof ComboboxTrigger>

export default meta
type Story = StoryObj<typeof meta>

/** Figma open=false: click to open, type to filter, pick with Enter. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('combobox', { name: 'Label' })
    await userEvent.click(trigger)
    const search = await body.findByPlaceholderText('Placeholder')
    await waitFor(() => expect(search).toHaveFocus())
    await userEvent.type(search, 'Label 3')
    await waitFor(() => expect(body.getAllByRole('option')).toHaveLength(1))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent('Label 3')
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** Figma open=true: the list with the selected option checked. */
export const Open: Story = {
  render: () => <Demo defaultOpen defaultValue="Label 1" />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByRole('option', { name: 'Label 1' })).toHaveAttribute('data-checked', 'true')
  },
}

/** Figma empty=true: no option matches the search. */
export const Empty: Story = {
  render: () => <Demo defaultOpen />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await body.findAllByRole('option')
    await userEvent.type(body.getByPlaceholderText('Placeholder'), 'zzz')
    const empty = await body.findByText('Subtitle')
    await waitFor(() => expect(empty).toBeVisible())
  },
}

/** Figma state=disabled · invalid. */
export const States: Story = {
  parameters: { docs: { story: { inline: true } } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Demo defaultValue="Label 1" disabled />
      <Demo defaultValue="Label 1" invalid />
    </div>
  ),
}

/** Figma state=focus (pseudo-state). */
export const Focus: Story = {
  parameters: { pseudo: { focusVisible: true }, docs: { story: { inline: true } } },
  render: () => <Demo defaultValue="Label 1" />,
}

/** With a label: Field + FieldLabel + trigger + FieldDescription / FieldError. */
export const InField: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="combobox-field">Label</FieldLabel>
        <Demo id="combobox-field" describedBy="combobox-field-hint" />
        <FieldDescription id="combobox-field-hint">Subtitle</FieldDescription>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="combobox-field-invalid">Label</FieldLabel>
        <Demo id="combobox-field-invalid" invalid describedBy="combobox-field-error" />
        <FieldError id="combobox-field-error">Subtitle</FieldError>
      </Field>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('combobox', { name: 'Label' })[0]).toHaveAccessibleDescription(
      'Subtitle',
    )
  },
}
