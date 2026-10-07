import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { BrainIcon, GlobeIcon, TelescopeIcon } from '@/components/ui/icon'

import { ModelAndToolsPicker, type PickerModel, type PickerTool } from './model-and-tools-picker'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10727-2275'

const MODELS: PickerModel[] = [
  { value: 'pro', label: 'Assistant Pro', description: 'Best for complex, multi-step work' },
  { value: 'fast', label: 'Assistant Fast', description: 'Quick answers for everyday tasks' },
  { value: 'reasoning', label: 'Assistant Reasoning', description: 'Thinks longer on hard problems' },
]

const MANY_MODELS: PickerModel[] = [
  { value: 'pro', label: 'Assistant Pro', group: 'Northwind Labs' },
  { value: 'fast', label: 'Assistant Fast', group: 'Northwind Labs' },
  { value: 'reasoning', label: 'Assistant Reasoning', group: 'Northwind Labs' },
  { value: 'mini', label: 'Assistant Mini', group: 'Northwind Labs' },
  { value: 'open-large', label: 'Open Model Large', group: 'Open models' },
  { value: 'open-medium', label: 'Open Model Medium', group: 'Open models' },
  { value: 'open-small', label: 'Open Model Small', group: 'Open models' },
]

const TOOLS: PickerTool[] = [
  { value: 'web', label: 'Web search', description: 'Look things up and cite sources', icon: GlobeIcon },
  {
    value: 'research',
    label: 'Deep research',
    description: 'Plan, research and report (takes longer)',
    icon: TelescopeIcon,
  },
  {
    value: 'thinking',
    label: 'Extended thinking',
    description: 'Reason step by step before answering',
    icon: BrainIcon,
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Shell/Model and Tools Picker',
  tags: ['agent-builder'],
  component: ModelAndToolsPicker,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Which model answers and which tools it may use in this chat (`@/components/agent/model-and-tools-picker`), built on Popover + Command: the model trigger (Button outline) and “Tools · n” (Button ghost) open one popover with the models (a Command list, or a searchable Combobox with `searchModels`), the tools as Switch Fields, and Connectors (`onConnectorsClick`, `connectors` badge).',
      },
    },
    figmaProps: [
      {
        property: 'state',
        values: 'closed · open · search models',
        code: '`open` (Radix) · `searchModels` (a Combobox for long lists)',
      },
    ],
    guide: {
      use: [
        'In the composer or the chat header, when people can choose the model or turn tools on and off for this chat.',
        'Use the list for up to about six models; turn on `searchModels` (grouped by `group`) for longer lists.',
      ],
      avoid: [
        'Changing account-wide defaults: use a settings page.',
        'A single on/off option: put a Switch where it applies.',
        'Choosing from a short fixed list in a form: use Select.',
      ],
      content: [
        'Model names as the product calls them; the description says what each is best at, in a few words.',
        'Tool labels name the capability (“Web search”); the description says what turning it on does.',
      ],
      a11y: [
        'Both triggers open the same dialog-like popover; focus moves in, Escape closes, and focus returns to the trigger that opened it.',
        'Models are a Command list (arrow keys, Enter); each tool is a Switch labelled by its name.',
      ],
    },
  },
  args: {
    models: MODELS,
    tools: TOOLS,
    defaultModel: 'pro',
    defaultEnabledTools: ['web', 'thinking'],
    connectors: '3 connected',
    searchModels: false,
    open: false,
    onModelChange: fn(),
    onEnabledToolsChange: fn(),
    onConnectorsClick: fn(),
  },
  argTypes: {
    open: { control: 'boolean' },
    searchModels: { control: 'boolean' },
    connectors: { control: 'text' },
    models: { control: 'object' },
    tools: { control: false },
    model: { control: false },
    defaultModel: { control: 'text' },
    enabledTools: { control: false },
    defaultEnabledTools: { control: 'object' },
    onModelChange: { control: false, table: { category: 'Events' } },
    onEnabledToolsChange: { control: false, table: { category: 'Events' } },
    onConnectorsClick: { control: false, table: { category: 'Events' } },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onOpenAutoFocus: { control: false, table: { category: 'Events' } },
  },
})

/** Closed: the model and the tools count. Open it, or use the `open` control. */
export const Default = meta.story()

Default.test('picks a model and turns a tool on', async ({ canvas, canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: /Assistant Pro/ }))
  await userEvent.click(await body.findByRole('option', { name: /Assistant Fast/ }))
  await expect(args.onModelChange).toHaveBeenCalledWith('fast')
  await userEvent.click(body.getByRole('switch', { name: 'Deep research' }))
  await expect(args.onEnabledToolsChange).toHaveBeenCalledWith(['web', 'thinking', 'research'])
  await expect(canvas.getByRole('button', { name: 'Tools · 3' })).toBeVisible()
})

Default.test('focus returns to the trigger that opened it', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  const tools = canvas.getByRole('button', { name: /Tools/ })
  await userEvent.click(tools)
  await body.findByRole('switch', { name: 'Web search' })
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(tools).toHaveFocus())
})

/** Figma state open. */
export const Open = meta.story({ args: { open: true, onOpenAutoFocus: (e: Event) => e.preventDefault() } })

/** Figma state search models: a long list behind a searchable Combobox, grouped. */
export const SearchModels = meta.story({
  args: {
    open: true,
    searchModels: true,
    models: MANY_MODELS,
    onOpenAutoFocus: (e: Event) => e.preventDefault(),
  },
})

SearchModels.test('searches the models', async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(body.getByRole('combobox', { name: 'Model' }))
  await userEvent.type(await body.findByPlaceholderText('Search models…'), 'open s')
  await userEvent.click(await body.findByRole('option', { name: 'Open Model Small' }))
  await expect(args.onModelChange).toHaveBeenCalledWith('open-small')
})

/** Models only: no tools, no connectors. */
export const ModelOnly = meta.story({
  args: {
    tools: [],
    onConnectorsClick: undefined,
    open: true,
    onOpenAutoFocus: (e: Event) => e.preventDefault(),
  },
})
