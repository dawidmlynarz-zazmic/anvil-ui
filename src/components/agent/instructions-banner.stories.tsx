import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { GlobeIcon, Icon, PencilIcon } from '@/components/ui/icon'

import { InstructionsBanner } from './instructions-banner'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10737-3041'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/System & Context/Instructions Banner',
  tags: ['agent-primitive'],
  component: InstructionsBanner,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'type',
        values: 'project · persona · notice',
        code: '`tone` prop (info · agent · neutral)',
      },
    ],
    docs: {
      description: {
        component:
          'Thread-level context at the top of a chat (`@/components/agent/instructions-banner`): `tone` info · agent · neutral (Figma type project · persona · notice), `icon` (defaults per tone), `title`, `detail`, `action`, and either expandable `children` (the full instructions, on Collapsible) or `onDismiss`.',
      },
    },
  },
  args: { tone: 'info' as const, title: 'Title', detail: 'Subtitle', onDismiss: fn() },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'agent', 'neutral'] },
    title: { control: 'text' },
    detail: { control: 'text' },
    icon: { control: false },
    action: { control: false },
    children: { control: 'text' },
    defaultOpen: { control: 'boolean' },
    open: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onDismiss: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <InstructionsBanner
      {...args}
      action={
        <Button variant="ghost" intent="neutral" size="xs">
          <Icon icon={PencilIcon} />
          Edit
        </Button>
      }
    >
      Subtitle
    </InstructionsBanner>
  ),
})

/** Tone, title and detail are in Controls; expand to read the instructions. */
export const Default = meta.story()

Default.test('expands to the instructions', async ({ canvas }) => {
  const toggle = canvas.getByRole('button', { name: 'Show instructions' })
  await userEvent.click(toggle)
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
})

/** Figma types: project, persona, notice. */
export const Types = meta.story({
  render: (args) => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-3">
      <InstructionsBanner
        {...args}
        tone="info"

        action={
          <Button variant="ghost" intent="neutral" size="xs">
            <Icon icon={PencilIcon} />
            Edit
          </Button>
        }
      >
        Subtitle
      </InstructionsBanner>
      <InstructionsBanner
        {...args}
        tone="agent"

        action={
          <Button variant="ghost" intent="neutral" size="xs">
            <Icon icon={PencilIcon} />
            Change
          </Button>
        }
      >
        Subtitle
      </InstructionsBanner>
      <InstructionsBanner
        {...args}
        tone="neutral"

        action={
          <Button variant="ghost" intent="neutral" size="xs">
            <Icon icon={GlobeIcon} />
            Turn on
          </Button>
        }
      />
    </div>
  ),
})
