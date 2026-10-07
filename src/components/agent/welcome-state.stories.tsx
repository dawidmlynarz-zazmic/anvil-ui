import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { PromptInput } from '@/components/agent/prompt-input'
import { StarterPromptCard } from '@/components/agent/starter-prompt-card'
import { BotIcon, ChartColumnIcon, FileTextIcon, MailIcon, TelescopeIcon } from '@/components/ui/icon'

import { WelcomeState } from './welcome-state'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10727-2097'

const STARTERS = [
  {
    icon: FileTextIcon,
    title: 'Summarize a document',
    description: 'Upload a PDF or paste a link and get the key points.',
  },
  {
    icon: TelescopeIcon,
    title: 'Research a topic',
    description: 'Deep research with sources, approvals and a report.',
  },
  {
    icon: ChartColumnIcon,
    title: 'Analyze data',
    description: 'Upload a spreadsheet and ask questions about it.',
  },
  { icon: MailIcon, title: 'Draft an email', description: 'Write, shorten or change the tone of a message.' },
]

const onStart = fn()

/** The composer as drawn: attach, voice and send. */
const COMPOSER = <PromptInput aria-label="Message the assistant" onAttach={fn()} onVoice={fn()} />

const meta = preview.meta({
  title: 'Agent Builder/Shell/Welcome State',
  tags: ['agent-builder'],
  component: WelcomeState,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'greeting', values: 'text', code: '`greeting` prop' },
      { property: 'subtitle', values: 'text', code: '`subtitle` prop (default “How can I help today?”)' },
      { property: 'prompt input', values: 'instance', code: '`composer` slot (a Prompt Input)' },
      { property: 'starters', values: '4 × starter prompt card', code: '`children` (Starter Prompt Cards)' },
    ],
    guide: {
      use: [
        'The empty thread of a new chat: a greeting, the composer, and two to four Starter Prompt Cards.',
        'Use the person’s first name when you have it; otherwise greet without a name.',
      ],
      avoid: [
        'An empty list or a search with no results: use Empty State.',
        'A thread that already has messages: show the thread and keep the composer docked below it.',
        'More than four starters: pick the most useful four; more is harder to scan.',
      ],
      content: [
        '`greeting`: short and warm (“Good afternoon, Maya”). `subtitle`: an open question (“How can I help today?”).',
        'Starters: tasks the assistant does well in this product, not generic examples.',
      ],
      a11y: [
        'The greeting is a heading (level 2), so screen readers can jump to the new chat.',
        'The composer comes before the starters in the reading and tab order, as drawn.',
      ],
    },
    docs: {
      description: {
        component:
          'The new-chat screen (`@/components/agent/welcome-state`), built on Empty State with an agent Icon Tile: `greeting`, `subtitle`, `icon`, the `composer` slot (a Prompt Input) and Starter Prompt Cards as `children` (two columns from 736px, one below).',
      },
    },
  },
  args: {
    greeting: 'Good afternoon, Maya',
    subtitle: 'How can I help today?',
  },
  argTypes: {
    greeting: { control: 'text' },
    subtitle: { control: 'text' },
    icon: { control: false },
    composer: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <WelcomeState {...args} composer={COMPOSER}>
      {STARTERS.map((s) => (
        <StarterPromptCard key={s.title} {...s} onClick={() => onStart(s.title)} />
      ))}
    </WelcomeState>
  ),
})

/** Greeting and subtitle are in Controls. */
export const Default = meta.story()

Default.test('greets, and each starter starts its task', async ({ canvas }) => {
  await expect(canvas.getByRole('heading', { name: 'Good afternoon, Maya' })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: /Research a topic/ }))
  await expect(onStart).toHaveBeenCalledWith('Research a topic')
})

/** Without a name or starters: the greeting and composer only. */
export const Minimal = meta.story({
  args: { greeting: 'Good morning' },
  render: (args) => <WelcomeState {...args} composer={COMPOSER} />,
})

/** A narrow column (side panel): the starters stack. */
export const Narrow = meta.story({
  decorators: [(Story) => <div className="max-w-100">{Story()}</div>],
})

/** A custom agent: its own glyph, greeting and starters. */
export const CustomAgent = meta.story({
  args: {
    greeting: 'Hi, I’m the Northwind Labs launch assistant',
    subtitle: 'Ask about the Q3 launch plan.',
  },
  render: (args) => (
    <WelcomeState {...args} icon={BotIcon} composer={COMPOSER}>
      <StarterPromptCard
        icon={FileTextIcon}
        title="Summarize the Q3 launch plan"
        description="Goals, owners and dates on one page."
      />
      <StarterPromptCard
        icon={ChartColumnIcon}
        title="Check the launch metrics"
        description="Signups, conversion and revenue against target."
      />
    </WelcomeState>
  ),
})
