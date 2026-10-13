import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ShellFooter } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import { CheckIcon, Icon, ListChecksIcon, PencilIcon, SparklesIcon } from '@/components/ui/icon'

import { TaskCard, TaskCardBody, TaskStatusBadge } from './task-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10769-15815'

const meta = preview.meta({
  title: 'Design System/Molecules/Task Card',
  tags: ['molecule'],
  component: TaskCard,
  parameters: {
    layout: 'padded',
    // The shared card of the Agent Patterns: no Figma component of its own (Figma draws it inside each pattern).
    design: { type: 'figma', url: FIGMA },
    figmaProps: [],
    guide: {
      use: [
        'The shell for a pattern the agent shows in the thread: an icon tile, a title and subtitle, a status Badge, a body and a footer with the actions.',
        'Build a new pattern on it instead of drawing another bordered card: radius, shadow, width and header stay in one place.',
        'Pass `badge` a `TaskStatusBadge` (review · approved · accepted), your own Badge, or a control such as a Switch.',
      ],
      avoid: [
        'A plain container for content: use Card.',
        'A row in a list: use Item.',
        'A dialog or panel that covers the page: use Dialog, Sheet or Drawer.',
      ],
      content: [
        'The title names what the card is (“Research plan”); the subtitle gives the facts (“5 steps · ~15 min”).',
        'The footer has one brand action at most, and says what it does (“Approve plan”).',
      ],
      a11y: [
        'It is an `<article>` named by its title (`aria-labelledby`); a card without a title takes an `aria-label`.',
        'The status Badge says the state in words; actions in the footer are real buttons.',
      ],
    },
    docs: {
      description: {
        component:
          'The card the agent patterns share (`@/components/agent/task-card`): `icon` + `tone` (or `media`), `title`, `subtitle`, `badge`, `headerClassName`, `footer`, and `TaskCardBody` for a 16px body. No `title` means no header. `TaskStatusBadge` gives the review · approved · accepted states. Task Brief, Task Plan, Approval Card, Connector Card, Memory Manager, Insight Card and the other agent patterns are built on it.',
      },
    },
  },
  args: {
    icon: ListChecksIcon,
    tone: 'agent' as const,
    title: 'Research plan',
    subtitle: '5 steps · ~15 min',
  },
  argTypes: {
    icon: { control: false },
    tone: { control: 'select', options: ['neutral', 'agent', 'info', 'success', 'warning', 'destructive'] },
    media: { control: false },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: false },
    footer: { control: false },
    children: { control: false },
    headerClassName: { control: false },
    titleId: { control: false },
  },
  render: (args) => (
    <TaskCard
      {...args}
      badge={<TaskStatusBadge status="review" />}
      footer={
        <ShellFooter variant="card" align="end" note="Estimated 15 min">
          <Button variant="outline" intent="neutral" size="sm" onClick={fn()}>
            <Icon icon={PencilIcon} />
            Edit
          </Button>
          <Button intent="brand" size="sm" onClick={fn()}>
            <Icon icon={CheckIcon} />
            Approve
          </Button>
        </ShellFooter>
      }
    >
      <TaskCardBody>
        <p className="type-text-sm-normal text-foreground">The body is yours: text, a list or a form.</p>
      </TaskCardBody>
    </TaskCard>
  ),
})

/** Header, status Badge, body and footer. Tone, title and subtitle are in Controls. */
export const Default = meta.story()

Default.test('is an article named by its title, with a status and actions', async ({ canvas }) => {
  await expect(canvas.getByRole('article', { name: 'Research plan' })).toBeVisible()
  await expect(canvas.getByText('Needs approval')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Approve' }))
})

/** TaskStatusBadge: review, approved, accepted. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="flex w-full flex-col gap-4">
      {(['review', 'approved', 'accepted'] as const).map((status) => (
        <TaskCard
          key={status}
          {...args}
          title={`Status: ${status}`}
          badge={<TaskStatusBadge status={status} />}
        />
      ))}
    </div>
  ),
})

/** No `title`: no header (Insight Card draws its own first line). */
export const Headerless = meta.story({
  args: { title: undefined, subtitle: undefined, 'aria-label': 'Headerless card' },
  render: (args) => (
    <TaskCard {...args}>
      <TaskCardBody>
        <p className="flex items-center gap-2 type-text-sm-normal text-foreground">
          <Icon icon={SparklesIcon} />A card with no header.
        </p>
      </TaskCardBody>
    </TaskCard>
  ),
})

Headerless.test('is named by aria-label', async ({ canvas }) => {
  await expect(canvas.getByRole('article', { name: 'Headerless card' })).toBeVisible()
})
