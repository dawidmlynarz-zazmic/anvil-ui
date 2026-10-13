import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { ToolbarButton, ToolbarSeparator } from '@/components/anvil/toolbar'
import { CommandGroup, CommandItem } from '@/components/ui/command'
import {
  AlignLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  EllipsisIcon,
  Icon,
  LanguagesIcon,
  Maximize2Icon,
  Minimize2Icon,
  PencilLineIcon,
  SmileIcon,
  SpellCheckIcon,
  WandSparklesIcon,
} from '@/components/ui/icon'

import { SelectionToolbar, SelectionToolbarMenu } from './selection-toolbar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10748-5572'

const onAction = fn()
const onPrompt = fn()

/** A menu item: runs, then closes the menu. */
const item = (label: string, glyph: typeof WandSparklesIcon, close: () => void, leadsOn = false) => (
  <CommandItem
    key={label}
    value={label}
    onSelect={() => {
      onAction(label)
      close()
    }}
  >
    <Icon icon={glyph} />
    {label}
    {leadsOn && <Icon icon={ChevronRightIcon} size="xs" className="ml-auto text-foreground-subtle" />}
  </CommandItem>
)

const menu = ({ close }: { close: () => void }) => (
  <>
    <CommandGroup heading="Edit">
      {item('Improve writing', WandSparklesIcon, close)}
      {item('Fix spelling and grammar', SpellCheckIcon, close)}
      {item('Make shorter', Minimize2Icon, close)}
      {item('Make longer', Maximize2Icon, close)}
      {item('Change tone', SmileIcon, close, true)}
    </CommandGroup>
    <CommandGroup heading="Generate">
      {item('Summarize', AlignLeftIcon, close)}
      {item('Explain this', CircleHelpIcon, close)}
      {item('Continue writing', PencilLineIcon, close)}
    </CommandGroup>
    <CommandGroup heading="Translate">{item('Translate to…', LanguagesIcon, close, true)}</CommandGroup>
  </>
)

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Selection Toolbar',
  tags: ['agent-builder'],
  component: SelectionToolbar,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component:
          'The AI toolbar over selected text (`@/components/agent/selection-toolbar`), on Toolbar (`size="compact"`) + a Popover with a Command list (a menu can’t hold the prompt field). `SelectionToolbar` (`working`, `workingLabel`, `onStop`) holds ToolbarButtons; `SelectionToolbarMenu` is the “Ask AI” button with a prompt row (`onPrompt`) above the CommandGroups you pass (or a function that gets `close`). Placing it over the selection is the host page’s job.',
      },
    },
    figmaProps: [
      {
        property: 'state',
        values: 'default · expanded · working',
        code: 'default · the menu `open` · `working`',
      },
      {
        property: 'ask ai · menu',
        values: 'button + menu',
        code: '`SelectionToolbarMenu` (`label`, `onPrompt`, `children` = menu groups)',
      },
      { property: 'status (working)', values: 'text shimmer', code: '`workingLabel`; Stop = `onStop`' },
    ],
    guide: {
      use: [
        'Over text the user selected in a document, an email or a form: quick AI actions (Improve, Fix grammar) and an Ask AI menu.',
        'Keep the bar to five or six actions; put the rest in the Ask AI menu, grouped (Edit, Generate, Translate).',
        'While the assistant works, set `working` with a status (“Rephrasing selection…”) so the user can Stop.',
      ],
      avoid: [
        'Actions on a chat message: use Message Actions.',
        'A long list of commands anywhere on the page: use Command Palette.',
        'A reviewable result: after the edit, show it as an Inline Suggestion.',
      ],
      content: [
        'Buttons are verbs (“Improve”, “Fix grammar”, “Summarize”); the prompt placeholder says what is possible.',
        'The working label says what is happening to the selection, in present tense.',
      ],
      a11y: [
        'It is a Toolbar: one Tab stop, arrow keys move between buttons.',
        'Ask AI opens a popover with the prompt focused; arrow keys move through the items, Enter runs the highlighted one (or sends the typed prompt), Escape closes it. While working, the status is announced.',
      ],
    },
  },
  args: { working: false, workingLabel: 'Rephrasing selection…', onStop: fn() },
  argTypes: {
    working: { control: 'boolean' },
    workingLabel: { control: 'text' },
    onStop: { control: false, table: { category: 'Events' } },
    children: { control: false },
  },
  render: (args) => (
    <div className="h-130">
      <SelectionToolbar {...args}>
        <SelectionToolbarMenu onPrompt={onPrompt} promptPlaceholder="Make it sound more confident">
          {menu}
        </SelectionToolbarMenu>
        <ToolbarSeparator />
        <ToolbarButton>
          <Icon icon={WandSparklesIcon} />
          Improve
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={SpellCheckIcon} />
          Fix grammar
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={AlignLeftIcon} />
          Summarize
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={LanguagesIcon} />
          Translate
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton size="icon-xs" aria-label="More">
          <Icon icon={EllipsisIcon} />
        </ToolbarButton>
      </SelectionToolbar>
    </div>
  ),
})

/** Figma state default. Working is in Controls. */
export const Default = meta.story()

Default.test('picks an action from the Ask AI menu', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Ask AI' }))
  await userEvent.click(await body.findByRole('option', { name: 'Make shorter' }))
  await expect(onAction).toHaveBeenCalledWith('Make shorter')
})

Default.test('runs a typed prompt on Enter', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Ask AI' }))
  const prompt = await body.findByRole('combobox', { name: 'Prompt' })
  await waitFor(() => expect(prompt).toHaveFocus())
  await userEvent.type(prompt, 'Make it sound more confident{Enter}')
  await expect(onPrompt).toHaveBeenCalledWith('Make it sound more confident')
})

Default.test('arrow keys pick an item and Enter runs it', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Ask AI' }))
  const prompt = await body.findByRole('combobox', { name: 'Prompt' })
  await waitFor(() => expect(prompt).toHaveFocus())
  await userEvent.keyboard('{ArrowDown}{Enter}')
  await expect(onAction).toHaveBeenCalledWith('Fix spelling and grammar')
})

/** Figma state expanded: the menu is open, the prompt focused. */
export const Expanded = meta.story({
  render: (args) => (
    <div className="h-130">
      <SelectionToolbar {...args}>
        <SelectionToolbarMenu defaultOpen onPrompt={onPrompt}>
          {menu}
        </SelectionToolbarMenu>
        <ToolbarSeparator />
        <ToolbarButton>
          <Icon icon={WandSparklesIcon} />
          Improve
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={SpellCheckIcon} />
          Fix grammar
        </ToolbarButton>
      </SelectionToolbar>
    </div>
  ),
})

/** Figma state working: the status and Stop. */
export const Working = meta.story({ args: { working: true } })

Working.test('shows the status and stops', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Rephrasing selection…')
  await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
  await expect(args.onStop).toHaveBeenCalledOnce()
})
