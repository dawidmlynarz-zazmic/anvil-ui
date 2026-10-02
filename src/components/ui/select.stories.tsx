import preview from '#.storybook/preview'
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
const OPTIONS = ['Label 1', 'Label 2', 'Label 3']

type DemoProps = SelectTriggerProps & {
  defaultValue?: string
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
}

/** One Select with three options; trigger props (label, hint, size, aria-invalid) pass through. */
function DemoSelect({
  defaultValue,
  disabled,
  open,
  onOpenChange,
  placeholder = 'Placeholder',
  ...trigger
}: DemoProps) {
  return (
    <Select defaultValue={defaultValue} disabled={disabled} open={open} onOpenChange={onOpenChange}>
      <SelectTrigger {...trigger}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Groups, labels and a separator inside the list. */
function GroupedSelect({ open, onOpenChange }: Pick<DemoProps, 'open' | 'onOpenChange'>) {
  const [value, setValue] = useState('1')
  return (
    <Select value={value} onValueChange={setValue} open={open} onOpenChange={onOpenChange}>
      <SelectTrigger label="Label">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Title</SelectLabel>
          <SelectItem value="1">Label 1</SelectItem>
          <SelectItem value="2">Label 2</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Title</SelectLabel>
          <SelectItem value="3" disabled>
            Label 3
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

// While the list is open, Radix hides the rest of the page from assistive tech (modal select), so
// the trigger is inside aria-hidden by design; axe's aria-hidden-focus does not apply to that.
const openListA11y = { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } }

const meta = preview.meta({
  title: 'Components/Select',
  component: DemoSelect,
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
  args: {
    open: false,
    label: 'Label',
    hint: 'Subtitle',
    placeholder: 'Placeholder',
    size: 'default',
    marker: 'none',
    disabled: false,
    'aria-invalid': false,
  },
  argTypes: {
    open: { control: 'boolean' },
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
    defaultValue: { control: 'select', options: [undefined, ...OPTIONS] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    marker: { control: 'inline-radio', options: ['none', 'required', 'optional'] },
    disabled: { control: 'boolean' },
    'aria-invalid': { control: 'boolean', description: 'Invalid state (Figma state=invalid)' },
    onOpenChange: { table: { disable: true } },
    asChild: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test('trigger opens the list and picks an option', async ({ canvas, canvasElement }) => {
  const trigger = canvas.getByRole('combobox', { name: 'Label' })
  await expect(trigger).toHaveAccessibleDescription('Subtitle')
  await userEvent.click(trigger)
  await userEvent.click(await body(canvasElement).findByRole('option', { name: 'Label 2' }))
  await expect(trigger).toHaveTextContent('Label 2')
  // Let the list finish its exit animation before the a11y check runs.
  await waitFor(() => expect(body(canvasElement).queryByRole('listbox')).toBeNull())
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('combobox', { name: 'Label' })).toBeDisabled()
})

/** Without a label: the bare trigger (show label off in Figma). */
export const Bare = meta.story({
  args: { label: undefined, hint: undefined, 'aria-label': 'Label', defaultValue: OPTIONS[0] },
})

/** 32 / 40 / 48 px. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <DemoSelect key={size} size={size} label="Label" defaultValue={OPTIONS[0]} />
      ))}
    </div>
  ),
})

/** Figma states side by side (rows: empty · default · hover · focus · invalid · disabled). For one select, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <DemoSelect label="Label" />
      <DemoSelect label="Label" defaultValue={OPTIONS[0]} />
      <span className="pseudo-hover-all contents">
        <DemoSelect label="Label" defaultValue={OPTIONS[0]} />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <DemoSelect label="Label" defaultValue={OPTIONS[0]} />
      </span>
      <DemoSelect label="Label" defaultValue={OPTIONS[0]} aria-invalid hint="Subtitle" />
      <DemoSelect label="Label" defaultValue={OPTIONS[0]} disabled />
    </div>
  ),
})

/** Figma open=true: the list is open on load. */
export const Open = meta.story({
  parameters: { docs: { story: { inline: false, height: '280px' } }, a11y: openListA11y },
  args: { open: true, defaultValue: OPTIONS[0] },
})

Open.test('shows the list with the value checked', async ({ canvasElement }) => {
  const listbox = await body(canvasElement).findByRole('listbox')
  await waitFor(() => expect(listbox).toBeVisible()) // after the fade-in
  await expect(body(canvasElement).getByRole('option', { name: OPTIONS[0] })).toHaveAttribute(
    'data-state',
    'checked',
  )
})

export const Invalid = meta.story({
  args: { 'aria-invalid': true, hint: 'Subtitle' },
})

Invalid.test('shows the hint as an error', async ({ canvas }) => {
  await expect(canvas.getByRole('alert')).toHaveTextContent('Subtitle')
})

/** Groups, labels and a separator inside the list. */
export const Groups = meta.story({
  parameters: { docs: { story: { inline: false, height: '340px' } }, a11y: openListA11y },
  args: { open: true },
  render: (args) => <GroupedSelect open={args.open} onOpenChange={args.onOpenChange} />,
})
