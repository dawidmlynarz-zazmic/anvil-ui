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
const OPTIONS = ['Concise', 'Balanced', 'Detailed']

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
  placeholder = 'Choose a style',
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
  const [value, setValue] = useState('balanced')
  return (
    <Select value={value} onValueChange={setValue} open={open} onOpenChange={onOpenChange}>
      <SelectTrigger label="Model">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Included</SelectLabel>
          <SelectItem value="fast">Fast</SelectItem>
          <SelectItem value="balanced">Balanced</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Requires upgrade</SelectLabel>
          <SelectItem value="deep" disabled>
            Deep reasoning
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
  title: 'Design System/Molecules/Select',
  tags: ['molecule'],
  component: DemoSelect,
  parameters: {
    shadcn: 'select',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'show label', values: 'boolean', code: 'pass `label` (on `SelectTrigger`) or not' },
      { property: 'text', values: 'text', code: '`placeholder` on `SelectValue`, or the selected item' },
      { property: 'size', values: 'lg · default · sm', code: '`size` prop on `SelectTrigger`' },
      {
        property: 'state',
        values: 'default · disabled · hover · focus · invalid',
        code: 'selectors: `hover:` · `focus-visible:` · `disabled:` (`disabled` on `Select`) · `aria-invalid` (not a prop)',
      },
      {
        property: 'empty',
        values: 'on · off',
        code: 'nothing (design-only): the placeholder shows until a value is picked',
      },
      { property: 'open', values: 'false · true', code: '`open` prop on `Select` (`data-[state=open]`)' },
    ],
    guide: {
      use: [
        'Choosing one value from a short, fixed list in a form or settings: “Response style” (Concise · Balanced · Detailed), “Model”.',
        'When the current choice matters more than seeing every option at once.',
      ],
      avoid: [
        'Long or searchable lists (people, projects, files): use Combobox.',
        '2–4 options people should compare at a glance: use Radio Group, or Toggle Group for compact view switches.',
        'Triggering actions: use Dropdown Menu.',
      ],
      content: [
        'Label names the setting (“Response style”); the hint says what it changes.',
        'Options are short and parallel; group with `SelectLabel` only when it helps, and disable options people can’t pick yet with a reason in the group label.',
        'Use a placeholder (“Choose a style”) only when there is no sensible default.',
      ],
      a11y: [
        'The trigger is a `combobox` named by `label` (or `aria-label`) and described by `hint`.',
        'Arrow keys and typing move through options; Enter picks, Escape closes and returns focus.',
        'With `aria-invalid` the hint becomes the error and is announced.',
      ],
    },
    docs: {
      description: {
        component:
          'Pick one value from a short fixed list (about 10 or fewer); use Combobox for long or async lists (shadcn/ui Select on Radix). The built-in field anatomy lives on `SelectTrigger`: `label`, `hint`, `marker`, `aria-invalid`. `disabled` goes on the `Select` root.',
      },
    },
  },
  args: {
    open: false,
    label: 'Response style',
    hint: 'How long the assistant’s answers are.',
    placeholder: 'Choose a style',
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
    onOpenChange: { control: false, table: { category: 'Events' } },
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
  const trigger = canvas.getByRole('combobox', { name: 'Response style' })
  await expect(trigger).toHaveAccessibleDescription('How long the assistant’s answers are.')
  await userEvent.click(trigger)
  await userEvent.click(await body(canvasElement).findByRole('option', { name: 'Balanced' }))
  await expect(trigger).toHaveTextContent('Balanced')
  // Let the list finish its exit animation before the a11y check runs.
  await waitFor(() => expect(body(canvasElement).queryByRole('listbox')).toBeNull())
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('combobox', { name: 'Response style' })).toBeDisabled()
})

/** Without a label: the bare trigger (show label off in Figma). */
export const Bare = meta.story({
  args: { label: undefined, hint: undefined, 'aria-label': 'Response style', defaultValue: OPTIONS[0] },
})

/** 32 / 40 / 48 px. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <DemoSelect key={size} size={size} label="Response style" defaultValue={OPTIONS[0]} />
      ))}
    </div>
  ),
})

/** Figma states side by side (rows: empty · default · hover · focus · invalid · disabled). For one select, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <DemoSelect label="Response style" />
      <DemoSelect label="Response style" defaultValue={OPTIONS[0]} />
      <span className="pseudo-hover-all contents">
        <DemoSelect label="Response style" defaultValue={OPTIONS[0]} />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <DemoSelect label="Response style" defaultValue={OPTIONS[0]} />
      </span>
      <DemoSelect
        label="Response style"
        defaultValue={OPTIONS[0]}
        aria-invalid
        hint="Choose a response style."
      />
      <DemoSelect label="Response style" defaultValue={OPTIONS[0]} disabled />
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
  args: { 'aria-invalid': true, hint: 'Choose a response style.' },
})

Invalid.test('shows the hint as an error', async ({ canvas }) => {
  await expect(canvas.getByRole('alert')).toHaveTextContent('Choose a response style.')
})

/** Groups, labels and a separator inside the list. */
export const Groups = meta.story({
  parameters: { docs: { story: { inline: false, height: '340px' } }, a11y: openListA11y },
  args: { open: true },
  render: (args) => <GroupedSelect open={args.open} onOpenChange={args.onOpenChange} />,
})
