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

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column wrap or truncate, never overflow. */
export const LongContent = meta.story({
  args: { title: LONG, detail: UNBROKEN },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

LongContent.test('stays in its column and keeps text readable', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=instructions-banner]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
    // A text block squeezed by its neighbours wraps one character per line.
    if (el.childElementCount === 0 && (el.textContent ?? '').length > 20) {
      await expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    }
  }
})
