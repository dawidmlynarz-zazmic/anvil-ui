import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { CitationChip } from '@/components/agent/citation-chip'
import { ToolLogLine } from '@/components/agent/tool-log-line'
import { Button } from '@/components/ui/button'
import { CommandGroup } from '@/components/ui/command'
import {
  BookOpenIcon,
  FileTextIcon,
  Icon,
  MessageSquareIcon,
  SparklesIcon,
  TicketIcon,
  XIcon,
} from '@/components/ui/icon'

import {
  CommandPalette,
  CommandPaletteAnswer,
  CommandPaletteItem,
  CommandPaletteProgress,
} from './command-palette'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10750-6219'
const REQUEST = 'book 2 tickets for paper kingdoms saturday'

function Idle({ onSelect }: { onSelect?: () => void }) {
  return (
    <>
      <CommandGroup heading="Suggestions">
        <CommandPaletteItem
          kind="ask"
          icon={SparklesIcon}
          label="Ask Northwind Labs anything"
          meta="Answers use your account, bookings and the web"
          shortcut={['⌘', '↵']}
          onSelect={onSelect}
        />
        <CommandPaletteItem
          icon={TicketIcon}
          label="Find tickets"
          meta="Action · Tickets"
          shortcut={['⌘', 'H']}
          onSelect={onSelect}
        />
        <CommandPaletteItem
          icon={TicketIcon}
          label="View my bookings"
          meta="Action · Account"
          shortcut={['⌘', 'B']}
          onSelect={onSelect}
        />
      </CommandGroup>
      <CommandGroup heading="Recent">
        <CommandPaletteItem
          kind="page"
          icon={FileTextIcon}
          label="Paper Kingdoms · Lyric Hall"
          meta="Show page · viewed 2 h ago"
          onSelect={onSelect}
        />
        <CommandPaletteItem
          kind="page"
          icon={FileTextIcon}
          label="The Lantern Keeper · Grand Royal"
          meta="Show page · viewed yesterday"
          onSelect={onSelect}
        />
      </CommandGroup>
    </>
  )
}

function Results({ onSelect }: { onSelect?: () => void }) {
  return (
    <>
      <CommandGroup>
        <CommandPaletteItem
          kind="ask"
          icon={SparklesIcon}
          label="Ask Northwind Labs: book 2 tickets for Paper Kingdoms on Saturday"
          meta="Checks availability and holds the best seats for you"
          shortcut={['⌘', '↵']}
          onSelect={onSelect}
        />
      </CommandGroup>
      <CommandGroup heading="Actions">
        <CommandPaletteItem
          icon={TicketIcon}
          label="Hold 2 seats for Sat 17 Oct, 19:30"
          meta="Action · Tickets"
          shortcut={['⌘', 'H']}
          onSelect={onSelect}
        />
        <CommandPaletteItem
          icon={TicketIcon}
          label="Hold 2 seats for Sat 17 Oct, 14:30"
          meta="Action · Tickets · captioned"
          shortcut={['⌘', 'H']}
          onSelect={onSelect}
        />
      </CommandGroup>
      <CommandGroup heading="Shows">
        <CommandPaletteItem
          kind="page"
          icon={FileTextIcon}
          label="Paper Kingdoms · Lyric Hall"
          meta="Show page · 3 Oct – 15 Nov"
          onSelect={onSelect}
        />
      </CommandGroup>
      <CommandGroup heading="Help">
        <CommandPaletteItem
          kind="page"
          icon={BookOpenIcon}
          label="How seat holds work"
          meta="Help article · 2 min read"
          onSelect={onSelect}
        />
      </CommandGroup>
    </>
  )
}

const UNDERSTOOD = ['Book', '2 tickets', 'Paper Kingdoms', 'Sat 17 Oct', 'evening']

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Command Palette',
  tags: ['agent-builder'],
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'idle · results · ai answer · executing',
        code: 'content: the groups you pass (idle, results) · `answer` · `progress`; not a prop',
      },
      {
        property: 'palette item (type)',
        values: 'ai · action · page · person',
        code: '`CommandPaletteItem` `kind`',
      },
      {
        property: 'parse status',
        values: 'parsing · understood · unclear',
        code: '`parseStatus` + `understood` (the tokens; the options when unclear) + `understoodLabel` (the question)',
      },
      { property: 'legend item', values: 'instance', code: '`legend` (Shortcut Hints)' },
    ],
    guide: {
      use: [
        'A ⌘K surface that finds things, runs actions and also takes a question or a task for the assistant.',
        'Show what the assistant understood (`understood`) before it acts, and let people continue in the chat.',
        'Group results by kind: actions, pages, help. The first row can be “Ask …” so a question always has a way forward.',
      ],
      avoid: [
        'Only searching commands: use Command (organism).',
        'A long task or a conversation: continue it in the Chat Shell; the palette is for one quick answer or action.',
        'Running something with side effects without a clear step list and a Cancel.',
      ],
      content: [
        'Placeholder says both things are welcome: “Search or ask anything…”.',
        'Item labels are what happens (“Hold 2 seats for Sat 17 Oct, 19:30”); the meta line is the kind (“Action · Tickets”).',
        'Progress steps are short past-tense facts (“Found 2 performances on Sat 17 Oct”) and one present-tense line for the current step.',
      ],
      a11y: [
        'It is a Dialog named by `title`; focus starts in the prompt row, arrow keys move through the items, Enter runs one, Esc closes.',
        'The “Understood” row and the progress panel are polite status regions. The shortcut keys are decorative; every action also works by click.',
      ],
    },
    docs: {
      story: { inline: false, height: '620px' },
      description: {
        component:
          'The AI command palette (`@/components/agent/command-palette`), on Command Dialog: `query`, `ai` (sparkles in the prompt row), `understood` (parsed tokens), `answer` (a `CommandPaletteAnswer`), `progress` (a `CommandPaletteProgress` of Tool Log Lines), `legend`, and `CommandGroup`s of `CommandPaletteItem`s as children. Results are not filtered by the text; the app decides what matches.',
      },
    },
  },
  args: {
    open: true,
    placeholder: 'Search or ask Northwind Labs anything…',
    ai: false,
    onOpenChange: fn(),
    onQueryChange: fn(),
    onOpenAutoFocus: (event: Event) => event.preventDefault(),
  },
  argTypes: {
    open: { control: 'boolean' },
    query: { control: 'text', description: 'Controlled text; leave unset for the palette to hold it' },
    placeholder: { control: 'text' },
    ai: { control: 'boolean' },
    understood: { control: 'object' },
    understoodLabel: { control: 'text' },
    answer: { control: false },
    progress: { control: false },
    legend: { control: false },
    commandProps: { control: false },
    title: { control: 'text' },
    description: { control: 'text' },
    onOpenAutoFocus: { control: false },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onQueryChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <CommandPalette {...args}>
      <Idle />
    </CommandPalette>
  ),
})

/** Figma state idle: suggestions and recent. */
export const Default = meta.story()

Default.test('opens on the prompt row and runs the highlighted item', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  const input = await body.findByRole('combobox', { name: 'Command palette' })
  await expect(body.getAllByRole('option')).toHaveLength(5)
  await userEvent.type(input, 'tickets')
  await expect(input).toHaveValue('tickets')
})

/** Figma state results: the request, what was understood, and matching actions. */
export const WithResults = meta.story({
  args: { query: REQUEST, ai: true, understood: UNDERSTOOD },
  render: (args) => (
    <CommandPalette {...args}>
      <Results />
    </CommandPalette>
  ),
})

WithResults.test('shows what was understood and the ask row first', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByText('Understood:')).toBeVisible())
  await expect(body.getAllByRole('option')[0]).toHaveTextContent('Ask Northwind Labs: book 2 tickets')
})

/** Figma state ai answer: a short answer with sources, and a related action. */
export const AiAnswer = meta.story({
  args: { query: 'is the saturday matinee captioned?', ai: true },
  render: (args) => (
    <CommandPalette
      {...args}
      answer={
        <CommandPaletteAnswer
          name="Northwind Labs"
          sources={
            <>
              <CitationChip index={1} confidence="high" />
              <CitationChip index={2} confidence="medium" />
            </>
          }
          onContinue={fn()}
          onCopy={fn()}
        >
          Yes. The Saturday 17 Oct matinee at 14:30 is captioned, and the evening show at 19:30 isn’t. There’s
          also a relaxed performance on 1 Nov.
        </CommandPaletteAnswer>
      }
    >
      <CommandGroup heading="Related">
        <CommandPaletteItem
          icon={TicketIcon}
          label="Hold 2 seats for Sat 17 Oct, 14:30"
          meta="Action · Tickets · captioned"
          shortcut={['⌘', 'H']}
        />
      </CommandGroup>
    </CommandPalette>
  ),
})

AiAnswer.test('has the answer, sources and actions', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByText(/matinee at 14:30 is captioned/)).toBeVisible())
  await expect(body.getByRole('button', { name: 'Continue in chat' })).toBeVisible()
  await expect(body.getByRole('button', { name: 'Copy' })).toBeVisible()
})

/** Figma state executing: the steps of a running task, then Open in chat and Cancel. */
export const Executing = meta.story({
  args: { query: REQUEST, ai: true, understood: UNDERSTOOD },
  render: (args) => (
    <CommandPalette
      {...args}
      progress={
        <CommandPaletteProgress
          actions={
            <>
              <Button variant="outline" intent="neutral" size="xs">
                <Icon icon={MessageSquareIcon} />
                Open in chat
              </Button>
              <Button variant="ghost" intent="neutral" size="xs">
                <Icon icon={XIcon} />
                Cancel
              </Button>
            </>
          }
        >
          <ToolLogLine status="done">Found 2 performances on Sat 17 Oct</ToolLogLine>
          <ToolLogLine status="done">Picked 19:30 · 2 aisle seats together in row F</ToolLogLine>
          <ToolLogLine status="running">Holding seats F12–F13…</ToolLogLine>
        </CommandPaletteProgress>
      }
    />
  ),
})

Executing.test('shows the steps and a way to stop', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByText('Found 2 performances on Sat 17 Oct')).toBeVisible())
  await expect(body.getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(body.queryByRole('option')).toBeNull()
})

/** Figma parse status parsing: the request is being read; the list waits. */
export const Parsing = meta.story({
  args: { query: REQUEST, ai: true, parseStatus: 'parsing' },
})

Parsing.test('announces that it is reading the request', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByText('Understanding your request…')).toBeVisible())
})

/** Figma parse status unclear: a question, with the options as tokens. */
export const Unclear = meta.story({
  args: {
    query: 'book 2 tickets for paper kingdoms saturday',
    ai: true,
    parseStatus: 'unclear',
    understoodLabel: 'Which performance?',
    understood: ['14:30 matinee', '19:30 evening'],
  },
  render: (args) => (
    <CommandPalette {...args}>
      <Results />
    </CommandPalette>
  ),
})

Unclear.test('asks which one', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByText('Which performance?')).toBeVisible())
  await expect(body.getByText('19:30 evening')).toBeVisible()
})

/** Opens from a button and closes with Escape; the open control is live. */
export const Closed = meta.story({
  args: { open: false, onOpenAutoFocus: undefined },
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div className="p-6">
        <Button variant="outline" intent="neutral" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <CommandPalette {...args} open={open} onOpenChange={setOpen}>
          <Idle onSelect={() => setOpen(false)} />
        </CommandPalette>
      </div>
    )
  },
})

Closed.test('opens from the button and closes with Escape', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Open command palette' }))
  await waitFor(() => expect(body.getByRole('dialog')).toBeVisible())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
})
