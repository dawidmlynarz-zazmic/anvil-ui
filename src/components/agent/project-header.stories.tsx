import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { FileTextIcon, Icon, PencilIcon, RocketIcon, UsersIcon } from '@/components/ui/icon'

import { ProjectHeader } from './project-header'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2696'

const onShare = fn()

const ACTIONS = (
  <>
    <Button variant="ghost" intent="neutral" size="xs">
      <Icon icon={FileTextIcon} />
      Files
    </Button>
    <Button variant="ghost" intent="neutral" size="xs">
      <Icon icon={PencilIcon} />
      Instructions
    </Button>
    <Button variant="outline" intent="neutral" size="xs" onClick={onShare}>
      <Icon icon={UsersIcon} />
      Share
    </Button>
  </>
)

const meta = preview.meta({
  title: 'Agent Builder/Shell/Project Header',
  tags: ['agent-builder'],
  component: ProjectHeader,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'name', values: 'text', code: '`name` prop' },
      { property: 'details (meta)', values: 'text', code: '`details` prop' },
      {
        property: 'icon tile',
        values: 'instance',
        code: '`icon` prop (a Lucide glyph in an info Icon Tile)',
      },
      { property: 'buttons', values: '3 × button xs', code: '`actions` slot (Buttons, xs)' },
    ],
    guide: {
      use: [
        'Above the chats in a project: the project’s name, a line of facts, and its actions.',
        'Actions open the project’s files, its instructions and sharing; keep the primary one (Share) outline and the rest ghost.',
      ],
      avoid: [
        'The header of a chat window or panel: use the shell header of the surface.',
        'Showing the project instructions themselves in the thread: use Instructions Banner.',
        'Creating or editing a project: use Project Setup.',
      ],
      content: [
        '`name`: the project name as the user typed it (“Q3 launch plan”).',
        '`details`: counts and sharing, separated by “·” (“12 chats · 3 files · shared with 4 people”).',
        'Action labels say what opens: “Files”, “Instructions”, “Share”.',
      ],
      a11y: [
        'It is a `<header>`; the name is a heading (level 2).',
        'Name and details truncate on one line each; keep the full name available elsewhere (for example the project list).',
      ],
    },
    docs: {
      description: {
        component:
          'The bar above the chats in a project (`@/components/agent/project-header`), built on Item with an info Icon Tile: `name`, `details`, `icon` and `actions` (xs Buttons).',
      },
    },
  },
  args: {
    name: 'Q3 launch plan',
    details: '12 chats · 3 files · shared with 4 people',
  },
  argTypes: {
    name: { control: 'text' },
    details: { control: 'text' },
    icon: { control: false },
    actions: { control: false },
  },
  render: (args) => <ProjectHeader {...args} actions={ACTIONS} />,
})

/** Name and details are in Controls. */
export const Default = meta.story()

Default.test('names the project and offers its actions', async ({ canvas }) => {
  await expect(canvas.getByRole('heading', { name: 'Q3 launch plan' })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Share' }))
  await expect(onShare).toHaveBeenCalledOnce()
})

/** Name only: no details, no actions. */
export const Minimal = meta.story({
  args: { details: undefined },
  render: (args) => <ProjectHeader {...args} />,
})

/** A custom glyph. */
export const WithIcon = meta.story({
  args: { name: 'Northwind Sync launch', details: '4 chats · shared with Maya Chen' },
  render: (args) => <ProjectHeader {...args} icon={RocketIcon} actions={ACTIONS} />,
})

/** Long name and details truncate in a narrow column; the actions keep their size. */
export const LongContent = meta.story({
  decorators: [(Story) => <div className="max-w-110">{Story()}</div>],
  args: {
    name: 'Q3 launch plan for Northwind Sync across every region and partner channel',
    details: '128 chats · 46 files · shared with 12 people in Northwind Labs',
  },
})
