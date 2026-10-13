import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { AgentLane, ParallelAgents } from './parallel-agents'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10722-1845'
const FIGMA_LANE = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10722-1865'

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Parallel Agents',
  tags: ['agent-builder'],
  component: ParallelAgents,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state (card)', values: 'running · merging', code: '`status` prop' },
      {
        property: 'status (lane)',
        values: 'running · waiting · done · failed',
        code: '`AgentLane` `status` prop',
      },
      { property: 'merge note · footer note', values: 'text', code: '`mergeNote` · `footerNote`' },
      {
        property: 'footer actions',
        values: 'pause all · retry failed · add · view findings',
        code: '`onPauseAll` · `onRetryFailed` · `onAddAgent` · `onViewFindings`',
      },
    ],
    guide: {
      use: [
        'When the agent splits a task across sub-agents that run at the same time and their results merge into one.',
        'One lane per sub-agent, with what it is doing now and how far along it is.',
        'Say how the merge is going, and offer Retry failed so one failure does not stop the rest.',
      ],
      avoid: [
        'Steps that run one after another: use Progress Timeline.',
        'A log of everything each agent did: use Activity Feed.',
        'A single agent’s work: use Tool Call Accordion in the thread.',
      ],
      content: [
        'Lane titles name the sub-agent and its job (“Sub-agent B · EU trade data”).',
        'The current line is an action (“Extracting 2025 import shares from Eurostat”) or a result (“Finished · 3 findings merged”).',
        'Failures say why and when it retries (“Rate-limited by source · retry in 30s”).',
      ],
      a11y: [
        'Each lane is an article with its own progress bar; the status Badge says Running, Waiting, Done or Failed in words.',
        'The header Badge and the merge note are text, so the overall state is read without the colours.',
      ],
    },
    docs: {
      description: {
        component:
          'Sub-agent lanes with a merge status (`@/components/agent/parallel-agents`, on Task Card): `ParallelAgents` (`status` running · merging, `badge`, `mergeNote`, `footerNote`, callbacks) with `AgentLane` children (`status`, `title`, `current`, `counts`, `progress`).',
      },
    },
  },
  args: {
    status: 'running' as const,
    title: 'Parallel research',
    subtitle: '4 sub-agents · findings merge into one report',
    badge: '1 running · 1 failed',
    mergeNote: 'Findings merge into the report as each sub-agent finishes. 8 of 18 merged.',
    footerNote: 'All sub-agents finished in 9m 58s',
    onPauseAll: fn(),
    onRetryFailed: fn(),
    onAddAgent: fn(),
    onViewFindings: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['running', 'merging'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
    mergeNote: { control: 'text' },
    footerNote: { control: 'text' },
    children: { control: false },
    onPauseAll: { control: false, table: { category: 'Events' } },
    onRetryFailed: { control: false, table: { category: 'Events' } },
    onAddAgent: { control: false, table: { category: 'Events' } },
    onViewFindings: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <ParallelAgents {...args}>
      {args.status === 'merging' ? (
        <>
          <AgentLane
            status="done"
            title="Sub-agent A · Competitors"
            current="Finished · findings merged"
            counts="9 sources · 3 findings"
            progress={100}
          />
          <AgentLane
            status="done"
            title="Sub-agent B · EU price data"
            current="Finished · findings merged"
            counts="14 sources · 5 findings"
            progress={100}
          />
          <AgentLane
            status="done"
            title="Sub-agent C · US price data"
            current="Finished · findings merged"
            counts="6 sources · 1 finding"
            progress={100}
          />
          <AgentLane
            status="done"
            title="Sub-agent D · Feature limits"
            current="Finished · findings merged"
            counts="8 sources · 3 findings"
            progress={100}
          />
        </>
      ) : (
        <>
          <AgentLane
            status="done"
            title="Sub-agent A · Competitors"
            current="Finished · 3 findings merged"
            counts="9 sources · 3 findings"
            progress={100}
          />
          <AgentLane
            status="running"
            title="Sub-agent B · EU price data"
            current="Extracting 2025 plan prices from pricing.example"
            counts="14 sources · 5 findings"
            progress={62}
          />
          <AgentLane
            status="failed"
            title="Sub-agent C · US price data"
            current="Rate-limited by source · retry in 30s"
            counts="6 sources · 1 finding"
            progress={40}
          />
          <AgentLane
            status="waiting"
            title="Sub-agent D · Feature limits"
            current="Starts when sub-agent B finishes"
            progress={10}
          />
        </>
      )}
    </ParallelAgents>
  ),
})

/** Figma state running: one lane in each status. */
export const Default = meta.story()

Default.test('every lane says its status and the footer acts', async ({ canvas, args }) => {
  for (const word of ['Done', 'Running', 'Failed', 'Waiting'])
    await expect(canvas.getByText(word)).toBeVisible()
  await expect(canvas.getAllByRole('progressbar')).toHaveLength(4)
  await userEvent.click(canvas.getByRole('button', { name: 'Pause all' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Retry failed' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Add sub-agent' }))
  await expect(args.onPauseAll).toHaveBeenCalledOnce()
  await expect(args.onRetryFailed).toHaveBeenCalledOnce()
  await expect(args.onAddAgent).toHaveBeenCalledOnce()
})

/** Figma state merging: all lanes done, the merge in progress. */
export const Merging = meta.story({
  args: {
    status: 'merging',
    badge: 'Merging',
    mergeNote: 'Merging 18 findings and removing 4 duplicates…',
  },
})

Merging.test('offers the findings', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'View findings' }))
  await expect(args.onViewFindings).toHaveBeenCalledOnce()
})

/** Figma lane status: running, waiting, done, failed. */
export const Lanes = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_LANE } },
  render: () => (
    <div className="grid w-140 gap-3">
      <AgentLane
        status="running"
        title="Sub-agent A · Workstream"
        current="Current action"
        counts="9 items · 3 results"
        progress={40}
      />
      <AgentLane
        status="waiting"
        title="Sub-agent A · Workstream"
        current="Current action"
        counts="9 items · 3 results"
        progress={10}
      />
      <AgentLane
        status="done"
        title="Sub-agent A · Workstream"
        current="Current action"
        counts="9 items · 3 results"
        progress={100}
      />
      <AgentLane
        status="failed"
        title="Sub-agent A · Workstream"
        current="Current action"
        counts="9 items · 3 results"
        progress={40}
      />
    </div>
  ),
})
