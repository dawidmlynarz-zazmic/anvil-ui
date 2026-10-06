import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from './button'
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from './empty-state'
import { Icon, InboxIcon, PlusIcon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1623-6410'

type DemoProps = {
  /** Figma media: a plain 48px icon, or the shadcn icon tile. */
  media?: 'default' | 'icon'
  /** Figma `show link`. */
  link?: boolean
  bordered?: boolean
}

function DemoEmpty({ media = 'default', link = false, bordered = false }: DemoProps) {
  return (
    <EmptyState className={bordered ? 'w-120 border' : 'w-120'}>
      <EmptyStateHeader>
        <EmptyStateMedia variant={media}>
          <Icon icon={InboxIcon} />
        </EmptyStateMedia>
        <EmptyStateTitle>No conversations yet</EmptyStateTitle>
        <EmptyStateDescription>
          Start a chat to plan, research or draft with Assistant. Your conversations appear here.
        </EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button variant="default" intent="neutral">
          <Icon icon={PlusIcon} />
          New chat
        </Button>
        {link && (
          <a
            href="#more"
            className="rounded-sm type-text-xs-link text-foreground-link outline-none focus-visible:focus-ring"
          >
            How chats are saved
          </a>
        )}
      </EmptyStateContent>
    </EmptyState>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Empty State',
  tags: ['molecule'],
  component: DemoEmpty,
  parameters: {
    shadcn: 'empty',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'title', values: 'text', code: '`EmptyStateTitle` children' },
      { property: 'description', values: 'text', code: '`EmptyStateDescription` children' },
      { property: 'show actions', values: 'boolean', code: 'render `EmptyStateContent` (actions) or not' },
    ],
    guide: {
      use: [
        'A list or view with nothing in it yet: no conversations, no sources, no files, no search results.',
        'First-run moments, where one action gets people started (“New chat”, “Connect Drive”).',
      ],
      avoid: [
        'Loading: use Skeleton. Errors that need fixing: use Alert with a retry action.',
        'Small inline gaps in a list (one empty group): a short muted line of text is enough.',
      ],
      content: [
        'Title says what is empty (“No conversations yet”); the description says what will appear or what to do next.',
        'One primary action at most; a secondary link for help.',
      ],
      a11y: [
        'The icon is decorative; the title carries the meaning.',
        'When the view empties after an action (filters, deletion), move focus or announce the change.',
      ],
    },
    docs: {
      description: {
        component:
          'A placeholder for empty lists and zero-data views (shadcn/ui Empty, named Empty State in Anvil): `EmptyStateMedia` (icon or illustration), `EmptyStateHeader` with `EmptyStateTitle` and `EmptyStateDescription`, and `EmptyStateContent` for actions. Say what is empty and what to do next.',
      },
    },
  },
  args: { media: 'default', link: false, bordered: false },
  argTypes: {
    media: { control: 'inline-radio', options: ['default', 'icon'] },
    link: { control: 'boolean' },
    bordered: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('title, description and the next action', async ({ canvas }) => {
  await expect(canvas.getByText('No conversations yet')).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'New chat' })).toBeEnabled()
})

/** shadcn EmptyStateMedia variant="icon", a dashed outline and the optional link. */
export const IconTile = meta.story({ args: { media: 'icon', bordered: true, link: true } })
