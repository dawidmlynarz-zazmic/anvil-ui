import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'

import { SyncIndicator } from './sync-indicator'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10744-3903'

const LABELS = {
  updating: 'Updating dashboard…',
  synced: 'Synced · v4',
  'out-of-date': 'Chat has newer changes',
  conflict: 'You and the assistant edited the chart',
} as const

const onUpdate = fn()

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/Sync Indicator',
  tags: ['agent-builder', 'widgets'],
  component: SyncIndicator,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'updating · synced · out of date · conflict',
        code: '`status` prop (updating · synced · out-of-date · conflict)',
      },
      { property: 'label', values: 'text', code: '`children`' },
      { property: 'actions', values: 'buttons', code: '`actions` slot (ghost xs pill Buttons)' },
    ],
    guide: {
      use: [
        'In an Artifact Panel’s header (`sync`), to say whether the canvas matches the chat.',
        'Offer the fix inside it when there is one: Update when the chat is ahead, Keep mine / Use the assistant’s on a conflict.',
      ],
      avoid: [
        'A general status of a task: use Action Status or a Badge.',
        'Long explanations: keep it to a few words; put details in the thread.',
      ],
      content: [
        'Updating: what is changing (“Updating dashboard…”). Synced: the version (“Synced · v4”).',
        'Conflict: who changed what (“You and the assistant edited the chart”).',
      ],
      a11y: [
        'It is a `status` region, so a change of state is announced politely.',
        'The tone is backed by an icon and the label, never colour alone.',
      ],
    },
    docs: {
      description: {
        component:
          'Whether the canvas and the chat agree (`@/components/agent/sync-indicator`), on Badge (subtle, pill): `status` updating · synced · out-of-date · conflict, the label as `children`, and `actions` inside the pill.',
      },
    },
  },
  args: { status: 'synced' as const, children: 'Synced · v4' },
  argTypes: {
    status: { control: 'inline-radio', options: ['updating', 'synced', 'out-of-date', 'conflict'] },
    children: { control: 'text' },
    actions: { control: false },
  },
})

/** Status and label are in Controls. */
export const Default = meta.story()

Default.test('is a status with its label', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Synced · v4')
})

/** Figma states, with the actions out of date and conflict offer. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <SyncIndicator status="updating">{LABELS.updating}</SyncIndicator>
      <SyncIndicator status="synced">{LABELS.synced}</SyncIndicator>
      <SyncIndicator
        status="out-of-date"
        actions={
          <Button variant="ghost" intent="neutral" size="xs" shape="pill" onClick={onUpdate}>
            Update
          </Button>
        }
      >
        {LABELS['out-of-date']}
      </SyncIndicator>
      <SyncIndicator
        status="conflict"
        actions={
          <>
            <Button variant="ghost" intent="neutral" size="xs" shape="pill">
              Keep mine
            </Button>
            <Button variant="ghost" intent="neutral" size="xs" shape="pill">
              Use the assistant’s
            </Button>
          </>
        }
      >
        {LABELS.conflict}
      </SyncIndicator>
    </div>
  ),
})

States.test('offers the update', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Update' }))
  await expect(onUpdate).toHaveBeenCalledOnce()
})
