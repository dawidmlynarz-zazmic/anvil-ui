import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ChartColumnIcon, FileTextIcon, MailIcon, TelescopeIcon } from '@/components/ui/icon'

import { StarterPromptCard } from './starter-prompt-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10727-2096'

const meta = preview.meta({
  title: 'Agent Builder/Shell/Starter Prompt Card',
  tags: ['agent-builder'],
  component: StarterPromptCard,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'default · hover · focus · disabled',
        code: 'Selectors: `hover:` · `focus-visible:` · `disabled` (the button’s own attribute)',
      },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'description', values: 'text', code: '`description` prop' },
      {
        property: 'icon tile · icon',
        values: 'instance',
        code: '`icon` prop (a Lucide glyph in a neutral Icon Tile)',
      },
    ],
    guide: {
      use: [
        'On the welcome screen, under the composer: two to four ways to start, each one task the assistant does well.',
        'Clicking it should start that task: fill the composer with the prompt, or send it straight away.',
      ],
      avoid: [
        'Picking one option inside a form: use Choice Card.',
        'Suggestions after an answer: use Quick Reply (follow-up suggestions).',
        'A link to another page: use a Card rendered as a link.',
      ],
      content: [
        '`title`: the task as a verb phrase (“Summarize a document”, “Draft an email”).',
        '`description`: what the user gives and gets, in one line (“Upload a PDF or paste a link and get the key points.”).',
        'Pick an icon that names the input or the result (a document, a chart, an envelope).',
      ],
      a11y: [
        'It is a `<button>`: its name is the title followed by the description.',
        'The icon is decorative. The focus ring is the standard one (Figma draws it).',
      ],
    },
    docs: {
      description: {
        component:
          'A prompt to start a chat from the welcome screen (`@/components/agent/starter-prompt-card`), built on the interactive Card (a `<button>`) with a neutral Icon Tile: `title`, `description`, `icon`, plus any button props (`onClick`, `disabled`). Used by Welcome State.',
      },
    },
  },
  args: {
    title: 'Summarize a document',
    description: 'Upload a PDF or paste a link and get the key points.',
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    disabled: { control: 'boolean' },
    icon: { control: false },
    onClick: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <StarterPromptCard {...args} className="w-92" />,
})

/** Title, description and disabled are in Controls. */
export const Default = meta.story()

Default.test('starts the task on click', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Summarize a document/ }))
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** Figma states: default, hover, focus, disabled. */
export const States = meta.story({
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
      <StarterPromptCard {...args} />
      <span className="pseudo-hover-all contents">
        <StarterPromptCard {...args} />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <StarterPromptCard {...args} />
      </span>
      <StarterPromptCard {...args} disabled />
    </div>
  ),
})

States.test('disabled cards can’t be pressed', async ({ canvas }) => {
  const cards = canvas.getAllByRole('button', { name: /Summarize a document/ })
  await expect(cards.at(-1)).toBeDisabled()
})

/** A different glyph per task. */
export const WithIcons = meta.story({
  render: (args) => (
    <div className="grid max-w-192 gap-4 sm:grid-cols-2">
      <StarterPromptCard {...args} icon={FileTextIcon} />
      <StarterPromptCard
        {...args}
        icon={TelescopeIcon}
        title="Research a topic"
        description="Deep research with sources, approvals and a report."
      />
      <StarterPromptCard
        {...args}
        icon={ChartColumnIcon}
        title="Analyze data"
        description="Upload a spreadsheet and ask questions about it."
      />
      <StarterPromptCard
        {...args}
        icon={MailIcon}
        title="Draft an email"
        description="Write, shorten or change the tone of a message."
      />
    </div>
  ),
})

/** Long copy wraps; the card keeps its padding. */
export const LongContent = meta.story({
  args: {
    title: 'Turn the Q3 launch plan into a one-page brief for the Northwind Labs leadership team',
    description:
      'Paste the plan or pick it from your files, and get the goals, risks, owners and dates on a single page you can share.',
  },
})
