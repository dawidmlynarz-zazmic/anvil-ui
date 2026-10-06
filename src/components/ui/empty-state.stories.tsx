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
        <EmptyStateTitle>Title</EmptyStateTitle>
        <EmptyStateDescription>Subtitle</EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button variant="default" intent="neutral">
          <Icon icon={PlusIcon} />
          Add
        </Button>
        {link && (
          <a
            href="#more"
            className="rounded-sm type-text-xs-link text-foreground-link outline-none focus-visible:focus-ring"
          >
            Learn more
          </a>
        )}
      </EmptyStateContent>
    </EmptyState>
  )
}

const meta = preview.meta({
  title: 'Molecules/Empty State',
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
  await expect(canvas.getByText('Title')).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'Add' })).toBeEnabled()
})

/** shadcn EmptyStateMedia variant="icon", a dashed outline and the optional link. */
export const IconTile = meta.story({ args: { media: 'icon', bordered: true, link: true } })
