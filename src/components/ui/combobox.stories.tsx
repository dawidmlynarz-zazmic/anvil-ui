import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from './combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from './command'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-270'
const OPTIONS = ['Maya Chen', 'Leo Park', 'Priya Shah', 'Sam Ortiz']

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
  placeholder = 'Select a person',
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
        aria-label={id ? undefined : 'Assignee'}
      >
        {value.current}
      </ComboboxTrigger>
      <ComboboxContent onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}>
        <Command>
          <CommandInput
            placeholder="Search people…"
            value={search.current}
            onValueChange={(next) => setSearch({ current: next, arg: searchProp })}
          />
          <CommandList>
            <CommandGroup heading="Northwind Labs">
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
          <CommandEmpty>No people found.</CommandEmpty>
        </Command>
      </ComboboxContent>
    </Combobox>
  )
}

const meta = preview.meta({
  title: 'Molecules/Combobox',
  tags: ['molecule'],
  component: DemoCombobox,
  parameters: {
    shadcn: 'combobox',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'open',
        values: 'false · true',
        code: '`open` prop on `Combobox` (selector `data-[state=open]:`)',
      },
      {
        property: 'empty',
        values: 'false · true',
        code: '`CommandEmpty` shows when the search matches nothing (not a prop)',
      },
      {
        property: 'state',
        values: 'default · disabled · focus · invalid',
        code: 'selectors: `disabled:` · `focus-visible:` · `aria-invalid` on `ComboboxTrigger` (not a prop)',
      },
    ],
    guide: {
      use: [
        'Choosing one value from a long or growing list where typing is faster than scrolling: people, projects, files, connected apps.',
        'When the options come from data (a workspace’s members, a search) rather than a fixed set.',
      ],
      avoid: [
        'Fewer than ~7 fixed options: use Select. 2–4 options that should all be visible: use Radio Group or Toggle Group.',
        'Free-text search with results on a page: use Search. A command palette of actions: use Command.',
        'Several values: use a multi-select pattern with Chips.',
      ],
      content: [
        'Trigger placeholder names the choice (“Select a person”); search placeholder says what is searched (“Search people…”).',
        'The empty message says nothing matched (“No people found.”); group headings only when they help scanning.',
      ],
      a11y: [
        'The trigger is a `combobox` button; label it with `Field` + `FieldLabel` (or `aria-label`).',
        'Focus moves to the search on open; arrow keys move, Enter picks, Escape closes and returns focus.',
        'Invalid state uses `aria-invalid` plus a `FieldError` linked with `aria-describedby`.',
      ],
    },
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
    placeholder: 'Select a person',
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
    onOpenChange: { control: false, table: { category: 'Events' } },
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
    const trigger = canvas.getByRole('combobox', { name: 'Assignee' })
    await userEvent.click(trigger)
    const search = await body(canvasElement).findByPlaceholderText('Search people…')
    await waitFor(() => expect(search).toHaveFocus())
    await userEvent.type(search, 'Priya')
    await waitFor(() => expect(body(canvasElement).getAllByRole('option')).toHaveLength(1))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent('Priya Shah')
    await waitFor(() => expect(trigger).toHaveFocus())
  },
)

Default.test('disabled does not open', { args: { disabled: true } }, async ({ canvas }) => {
  const trigger = canvas.getByRole('combobox', { name: 'Assignee' })
  await expect(trigger).toBeDisabled()
  await userEvent.click(trigger, { pointerEventsCheck: 0 })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

/** Figma open=true: the list with the selected option checked. */
export const Open = meta.story({ args: { open: true, focusOnOpen: false, value: 'Maya Chen' } })

Open.test('the selected option is checked', async ({ canvasElement }) => {
  await expect(await body(canvasElement).findByRole('option', { name: 'Maya Chen' })).toHaveAttribute(
    'data-checked',
    'true',
  )
})

/** Figma empty=true: no option matches the search. */
export const Empty = meta.story({ args: { open: true, focusOnOpen: false, search: 'zzz' } })

Empty.test('shows the empty message', async ({ canvasElement }) => {
  const empty = await body(canvasElement).findByText('No people found.')
  await waitFor(() => expect(empty).toBeVisible())
  await expect(body(canvasElement).queryAllByRole('option')).toHaveLength(0)
})

/** Figma state=disabled · invalid. */
export const States = meta.story({
  parameters: { docs: { story: { inline: true } } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DemoCombobox value="Maya Chen" disabled />
      <DemoCombobox value="Maya Chen" aria-invalid />
    </div>
  ),
})

/** Figma state=focus (reference). For one combobox, use the State control on Default. */
export const Focus = meta.story({
  parameters: { docs: { story: { inline: true } } },
  render: () => (
    <span className="pseudo-focus-visible-all contents">
      <DemoCombobox value="Maya Chen" />
    </span>
  ),
})

/** With a label: Field + FieldLabel + trigger + FieldDescription / FieldError. */
export const InField = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="combobox-field">Assignee</FieldLabel>
        <DemoCombobox id="combobox-field" describedBy="combobox-field-hint" />
        <FieldDescription id="combobox-field-hint">The assistant notifies them in Chat.</FieldDescription>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="combobox-field-invalid">Reviewer</FieldLabel>
        <DemoCombobox id="combobox-field-invalid" aria-invalid describedBy="combobox-field-error" />
        <FieldError id="combobox-field-error">Choose who reviews the launch plan.</FieldError>
      </Field>
    </div>
  ),
})

InField.test('the label names the trigger and the description describes it', async ({ canvas }) => {
  await expect(canvas.getByRole('combobox', { name: 'Assignee' })).toHaveAccessibleDescription(
    'The assistant notifies them in Chat.',
  )
})
