import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { GitCompareIcon, Icon, RotateCcwIcon, UserIcon } from '@/components/ui/icon'

import { VersionHistory, VersionHistoryItem } from './version-history'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10744-4072'

const VERSIONS = [
  {
    version: 'v4',
    summary: 'Weekly data and a label on the last bar',
    author: 'Assistant',
    time: '14:22',
    added: '+12',
    removed: '−3',
  },
  {
    version: 'v3',
    summary: 'Changed colours to match the brand',
    author: 'You',
    time: '14:15',
    added: '+4',
    removed: '−4',
    you: true,
  },
  {
    version: 'v2',
    summary: 'Added churn and revenue cards',
    author: 'Assistant',
    time: '14:09',
    added: '+38',
    removed: '−0',
  },
  {
    version: 'v1',
    summary: 'First version from your prompt',
    author: 'Assistant',
    time: '14:05',
    added: '+120',
    removed: '−0',
  },
]

const onRestore = fn()

function Demo({ defaultSelected = 'v3', onClose }: { defaultSelected?: string; onClose?: () => void }) {
  const [selected, setSelected] = useState(defaultSelected)
  return (
    <VersionHistory
      onClose={onClose}
      actions={
        <Button variant="ghost" intent="neutral" size="xs">
          <Icon icon={GitCompareIcon} />
          Compare
        </Button>
      }
      footer={
        <>
          <span className="flex-1 type-text-xs-normal text-muted-foreground">{selected} selected</span>
          <Button
            variant="outline"
            intent="neutral"
            size="xs"
            disabled={selected === 'v4'}
            onClick={() => onRestore(selected)}
          >
            <Icon icon={RotateCcwIcon} />
            Restore {selected}
          </Button>
        </>
      }
    >
      {VERSIONS.map(({ you, ...v }) => (
        <VersionHistoryItem
          key={v.version}
          {...v}
          icon={you ? UserIcon : undefined}
          current={v.version === 'v4'}
          selected={selected === v.version}
          onClick={() => setSelected(v.version)}
        />
      ))}
    </VersionHistory>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/Version History',
  tags: ['agent-builder', 'widgets'],
  component: VersionHistory,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'versions', values: 'version item × n', code: '`children` (VersionHistoryItems)' },
      {
        property: 'version item · state',
        values: 'default · current · selected',
        code: '`current` and `selected` props on VersionHistoryItem',
      },
      {
        property: 'version item · text',
        values: 'version, summary, author, time, added, removed',
        code: 'the props of the same names',
      },
      { property: 'compare · restore', values: 'buttons', code: '`actions` and `footer` slots' },
    ],
    guide: {
      use: [
        'From the canvas’s history action: see what changed in each version, pick one, compare or restore it.',
        'Mark the version the canvas shows with `current`; the picked one with `selected`.',
      ],
      avoid: [
        'Switching the version shown without context: the Artifact Panel’s version picker does that.',
        'An activity log of the task: use Activity Feed (Tasks).',
      ],
      content: [
        '`summary`: what changed, as a short sentence (“Changed colours to match the brand”).',
        '`author`: the assistant’s name or “You”. Lines as signed counts (“+12”, “−3”).',
        'Restore says which version (“Restore v3”).',
      ],
      a11y: [
        'The list is a radio group named “Version history”; each version is a radio with its whole row as the name.',
        'Restore is disabled for the current version.',
      ],
    },
    docs: {
      description: {
        component:
          'The canvas’s versions (`@/components/agent/version-history`), on Card with a Shell Header (`title`, `actions`, `onClose`) and a card Shell Footer (`footer`). `VersionHistoryItem`: `version`, `summary`, `author`, `time`, `added`, `removed`, `current`, `selected`, `icon` (bot, or a person for your edits).',
      },
    },
  },
  args: { title: 'Version history', onClose: fn() },
  argTypes: {
    title: { control: 'text' },
    actions: { control: false },
    footer: { control: false },
    children: { control: false },
    onClose: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <Demo onClose={args.onClose} />,
})

/** Pick a version to restore it. */
export const Default = meta.story()

Default.test('picks a version and restores it', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('radio', { name: /v2/ }))
  await expect(canvas.getByRole('radio', { name: /v2/ })).toHaveAttribute('aria-checked', 'true')
  await userEvent.click(canvas.getByRole('button', { name: 'Restore v2' }))
  await expect(onRestore).toHaveBeenCalledWith('v2')
})

/** The current version picked: nothing to restore. */
export const CurrentSelected = meta.story({ render: () => <Demo defaultSelected="v4" /> })

CurrentSelected.test('can’t restore the current version', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Restore v4' })).toBeDisabled()
})
