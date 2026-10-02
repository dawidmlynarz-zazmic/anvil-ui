import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from './combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from './command'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-270'
const OPTIONS = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5']

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Story-only: false for stories that open on load, so focus stays put until you interact. */
  focusOnOpen?: boolean
  /** The selected option (picking another one updates it). */
  value?: string
  /** Story-only: initial search text (Figma empty=true is a search that matches nothing). */
  search?: string
  placeholder?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  'aria-invalid'?: boolean
  id?: string
  describedBy?: string
}

/** Trigger + popover with a searchable list (Popover + Command), as in Figma. */
function DemoCombobox({
  open,
  onOpenChange,
  focusOnOpen = true,
  value: valueProp = '',
  search: searchProp = '',
  placeholder = 'Placeholder',
  size = 'default',
  disabled,
  'aria-invalid': invalid,
  id,
  describedBy,
}: DemoProps) {
  // Uncontrolled when `open` isn't passed (States, In Field).
  const [innerOpen, setInnerOpen] = useState(false)
  const isOpen = open ?? innerOpen
  const setOpen = (next: boolean) => {
    setInnerOpen(next)
    onOpenChange?.(next)
  }
  // Follow the `value` / `search` controls; local picks and typing update local state.
  const [value, setValue] = useState({ current: valueProp, arg: valueProp })
  if (value.arg !== valueProp) setValue({ current: valueProp, arg: valueProp })
  const [search, setSearch] = useState({ current: searchProp, arg: searchProp })
  if (search.arg !== searchProp) setSearch({ current: searchProp, arg: searchProp })

  return (
    <Combobox open={isOpen} onOpenChange={setOpen}>
      <ComboboxTrigger
        id={id}
        size={size}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={id ? undefined : 'Label'}
      >
        {value.current}
      </ComboboxTrigger>
      <ComboboxContent onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}>
        <Command>
          <CommandInput
            placeholder="Placeholder"
            value={search.current}
            onValueChange={(next) => setSearch({ current: next, arg: searchProp })}
          />
          <CommandList>
            <CommandGroup heading="Title">
              {OPTIONS.map((option) => (
                <ComboboxItem
                  key={option}
                  value={option}
                  selected={value.current === option}
                  onSelect={(next) => {
                    setValue({ current: next === value.current ? '' : next, arg: valueProp })
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

const meta = preview.meta({
  title: 'Components/Combobox',
  component: DemoCombobox,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Pick one value from a long or searchable list: shadcn/ui’s Combobox pattern (Popover + Command). Use Select for a short fixed list. `Combobox` is the Popover root (`open` / `onOpenChange`); `ComboboxTrigger` takes `size`, `placeholder`, `disabled` and `aria-invalid`. The trigger is a bare control; give it a label with `Field` + `FieldLabel`.',
      },
      story: { inline: false, height: '360px' },
    },
  },
  args: {
    open: false,
    value: '',
    placeholder: 'Placeholder',
    size: 'default',
    disabled: false,
    'aria-invalid': false,
  },
  argTypes: {
    open: { control: 'boolean' },
    value: { control: 'select', options: ['', ...OPTIONS] },
    placeholder: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    'aria-invalid': { control: 'boolean', description: 'Invalid state (Figma state=invalid)' },
    onOpenChange: { table: { disable: true } },
    focusOnOpen: { table: { disable: true } },
    search: { table: { disable: true } },
    id: { table: { disable: true } },
    describedBy: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Figma open=false: closed, like on a page. The trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test(
  'click opens, type filters, Enter picks and focus returns',
  async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Label' })
    await userEvent.click(trigger)
    const search = await body(canvasElement).findByPlaceholderText('Placeholder')
    await waitFor(() => expect(search).toHaveFocus())
    await userEvent.type(search, 'Label 3')
    await waitFor(() => expect(body(canvasElement).getAllByRole('option')).toHaveLength(1))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent('Label 3')
    await waitFor(() => expect(trigger).toHaveFocus())
  },
)

Default.test('disabled does not open', { args: { disabled: true } }, async ({ canvas }) => {
  const trigger = canvas.getByRole('combobox', { name: 'Label' })
  await expect(trigger).toBeDisabled()
  await userEvent.click(trigger, { pointerEventsCheck: 0 })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

/** Figma open=true: the list with the selected option checked. */
export const Open = meta.story({ args: { open: true, focusOnOpen: false, value: 'Label 1' } })

Open.test('the selected option is checked', async ({ canvasElement }) => {
  await expect(await body(canvasElement).findByRole('option', { name: 'Label 1' })).toHaveAttribute(
    'data-checked',
    'true',
  )
})

/** Figma empty=true: no option matches the search. */
export const Empty = meta.story({ args: { open: true, focusOnOpen: false, search: 'zzz' } })

Empty.test('shows the empty message', async ({ canvasElement }) => {
  const empty = await body(canvasElement).findByText('Subtitle')
  await waitFor(() => expect(empty).toBeVisible())
  await expect(body(canvasElement).queryAllByRole('option')).toHaveLength(0)
})

/** Figma state=disabled · invalid. */
export const States = meta.story({
  parameters: { docs: { story: { inline: true } } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DemoCombobox value="Label 1" disabled />
      <DemoCombobox value="Label 1" aria-invalid />
    </div>
  ),
})

/** Figma state=focus (reference). For one combobox, use the State control on Default. */
export const Focus = meta.story({
  parameters: { docs: { story: { inline: true } } },
  render: () => (
    <span className="pseudo-focus-visible-all contents">
      <DemoCombobox value="Label 1" />
    </span>
  ),
})

/** With a label: Field + FieldLabel + trigger + FieldDescription / FieldError. */
export const InField = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="combobox-field">Label</FieldLabel>
        <DemoCombobox id="combobox-field" describedBy="combobox-field-hint" />
        <FieldDescription id="combobox-field-hint">Subtitle</FieldDescription>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="combobox-field-invalid">Label</FieldLabel>
        <DemoCombobox id="combobox-field-invalid" aria-invalid describedBy="combobox-field-error" />
        <FieldError id="combobox-field-error">Subtitle</FieldError>
      </Field>
    </div>
  ),
})

InField.test('the label names the trigger and the description describes it', async ({ canvas }) => {
  await expect(canvas.getAllByRole('combobox', { name: 'Label' })[0]).toHaveAccessibleDescription('Subtitle')
})
