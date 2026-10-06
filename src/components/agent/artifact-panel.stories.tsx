import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { MessageAction } from '@/components/agent/message-actions'
import { WidgetMetricCard, WidgetMetricGroup } from '@/components/agent/widget-metric-card'
import { IconTile } from '@/components/anvil/icon-tile'
import { Sparkline } from '@/components/anvil/sparkline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  CircleCheckIcon,
  CopyIcon,
  DownloadIcon,
  HistoryIcon,
  Icon,
  RotateCcwIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'

import { ArtifactPanel, type ArtifactView } from './artifact-panel'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2603'

const VERSIONS = [
  { value: 'v1', label: 'v1' },
  { value: 'v2', label: 'v2' },
  { value: 'v3', label: 'v3' },
]
const SERIES = [42, 50, 46, 54, 60, 57, 64, 68, 66, 71, 74, 72]

const actions = (
  <>
    {(
      [
        [HistoryIcon, 'History'],
        [CopyIcon, 'Copy'],
        [DownloadIcon, 'Download'],
      ] as const
    ).map(([icon, label]) => (
      <MessageAction key={label} label={label} size="icon-xs">
        <Icon icon={icon} />
      </MessageAction>
    ))}
  </>
)

const synced = (
  <Badge variant="semantic" tone="success" shape="pill">
    <Icon icon={CircleCheckIcon} size="xs" />
    Synced · v4
  </Badge>
)

/** The code view until Code Block is built: a plain `<pre>`. */
const code = (
  <pre tabIndex={0} className="p-5 type-code-xs text-foreground outline-none focus-visible:focus-ring">
    {`export default function Artifact() {
  return <div className="grid gap-4 p-6" />
}`}
  </pre>
)

/** Preview content: Widget Metric Cards and a chart (Sparkline) — the consumer's artifact. */
function Dashboard({ editing = false }: { editing?: boolean }) {
  return (
    <>
      <WidgetMetricGroup>
        {['Label 1', 'Label 2', 'Label 3'].map((label) => (
          <WidgetMetricCard key={label} size="compact" label={label} value="Value" />
        ))}
      </WidgetMetricGroup>
      <div className="relative">
        <Card
          className={
            editing
              ? 'h-60 justify-end rounded-lg border-border-action p-5 ring-1 ring-border-action'
              : 'h-60 justify-end rounded-lg p-5'
          }
        >
          <Sparkline values={SERIES} trend="neutral" label="Label" className="h-40 w-full" />
        </Card>
        {editing && (
          // Surfaces › inline assist: the prompt on the selection.
          <Card className="absolute top-3 left-24 w-fit flex-row items-center gap-3 rounded-lg p-2 shadow-elevation-raised">
            <IconTile icon={SparklesIcon} tone="agent" size="sm" />
            <span className="type-text-sm-normal">Subtitle</span>
            <Button intent="brand" size="xs">
              Apply
            </Button>
          </Card>
        )}
      </div>
    </>
  )
}

type DemoProps = {
  view?: ArtifactView
  title?: string
  status?: string
  editing?: boolean
  onPublish?: () => void
  onClose?: () => void
}

function Demo({ view = 'preview', title = 'Title', status, editing, onPublish, onClose }: DemoProps) {
  const [version, setVersion] = useState('v3')
  const [current, setCurrent] = useState<ArtifactView>(view)
  return (
    <ArtifactPanel
      title={title}
      version={version}
      versions={VERSIONS}
      onVersionChange={setVersion}
      sync={synced}
      view={current}
      onViewChange={setCurrent}
      actions={actions}
      onPublish={onPublish}
      onClose={onClose}
      code={code}
      status={status}
      className="h-150 w-180"
    >
      <Dashboard editing={editing} />
    </ArtifactPanel>
  )
}

const meta = preview.meta({
  title: 'Agent Blocks/Widgets & Artifacts/Artifact Panel',
  tags: ['feature'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'preview · code · editing',
        code: 'preview / code = `view` (Tabs); editing = your selection + inline assist in the preview, with `status`',
      },
      { property: 'title', values: 'text', code: '`title` prop' },
      {
        property: 'version',
        values: 'text',
        code: '`version`; `versions` + `onVersionChange` make it a Dropdown Menu',
      },
      { property: 'sync indicator', values: 'instance', code: '`sync` (a semantic pill Badge)' },
      { property: 'actions', values: 'history · copy · download', code: '`actions` (MessageAction icon-xs)' },
      { property: 'publish · close', values: 'button', code: '`onPublish`, `onClose`' },
      { property: 'status bar', values: 'text', code: '`status` (Shell Footer note)' },
    ],
    docs: {
      description: {
        component:
          'The canvas beside the chat (`@/components/agent/artifact-panel`): a header with the title, version picker, `sync` badge, the Preview / Code switch (`view` / `onViewChange`), `actions`, Publish and Close; the preview (children) or `code`; and a `status` bar. Composed from Card, Shell Header / Footer, Dropdown Menu, Tabs, Message Actions, Badge and Button. The code view takes a Code Block once it is built.',
      },
    },
  },
  args: {
    view: 'preview' as const,
    title: 'Title',
    status: 'Subtitle',
    editing: false,
    onPublish: fn(),
    onClose: fn(),
  },
  argTypes: {
    view: { control: 'inline-radio', options: ['preview', 'code'] },
    title: { control: 'text' },
    status: { control: 'text' },
    editing: { control: 'boolean' },
    onPublish: { control: false, table: { category: 'Events' } },
    onClose: { control: false, table: { category: 'Events' } },
  },
})

/** View, title, status and editing are in Controls. */
export const Default = meta.story()

Default.test('switches to code, publishes and closes', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('tab', { name: 'Code' }))
  await expect(canvas.getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'true')
  await expect(canvas.getByText(/export default function Artifact/)).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Publish' }))
  await expect(args.onPublish).toHaveBeenCalledOnce()
  await userEvent.click(canvas.getByRole('button', { name: 'Close' }))
  await expect(args.onClose).toHaveBeenCalledOnce()
})

Default.test('picks a version', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Version v3' }))
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByRole('menuitemradio', { name: 'v2' })).toBeVisible())
  await userEvent.click(body.getByRole('menuitemradio', { name: 'v2' }))
  await waitFor(() => expect(canvas.getByRole('button', { name: 'Version v2' })).toBeVisible())
})

/** Figma state code: the code view on --muted. */
export const Code = meta.story({ args: { view: 'code' } })

/** Figma state editing: a selection and the inline assist prompt (Surfaces). */
export const Editing = meta.story({ args: { editing: true, status: 'Subtitle' } })

/** The `sync` slot: the Figma sync indicator states as semantic pill Badges. */
export const Sync = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="semantic" tone="agent" shape="pill">
        <Spinner />
        Updating
      </Badge>
      {synced}
      <Badge variant="semantic" tone="warning" shape="pill">
        <Icon icon={RotateCcwIcon} size="xs" />
        Out of date
      </Badge>
      <Badge variant="semantic" tone="destructive" shape="pill">
        <Icon icon={TriangleAlertIcon} size="xs" />
        Conflict
      </Badge>
    </div>
  ),
})
