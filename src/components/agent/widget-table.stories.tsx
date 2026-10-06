import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { WidgetTable } from './widget-table'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3199'

const STATUS = {
  success: 'On track',
  warning: 'At risk',
  destructive: 'Below target',
} as const

type Row = { channel: string; signups: number; rate: number; status: keyof typeof STATUS }
const ROWS: Row[] = [
  { channel: 'Organic search', signups: 1284, rate: 5.8, status: 'success' },
  { channel: 'Newsletter', signups: 1102, rate: 5.1, status: 'success' },
  { channel: 'Paid social', signups: 986, rate: 3.9, status: 'warning' },
  { channel: 'Referral', signups: 1037, rate: 6.2, status: 'success' },
  { channel: 'Partner webinars', signups: 912, rate: 2.7, status: 'destructive' },
  { channel: 'Blog', signups: 874, rate: 4.8, status: 'success' },
]

function Pages() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" aria-disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

type DemoProps = { loading?: boolean; empty?: boolean; striped?: boolean }

/** A sortable table: Signups sorts descending, then ascending, then off. */
function Demo({ loading, empty, striped }: DemoProps) {
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('desc')
  const rows = [...ROWS].sort((a, b) =>
    sort === 'none' ? 0 : sort === 'asc' ? a.signups - b.signups : b.signups - a.signups,
  )
  return (
    <WidgetTable
      title="Trial signups by channel"
      rowCount="6 channels · last 4 weeks"
      loading={loading}
      empty={empty ? 'No trial signups in the last 4 weeks.' : undefined}
      striped={striped}
      pagination={<Pages />}
      header={
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead
              className="text-right"
              sort={sort}
              onSort={() => setSort((s) => (s === 'desc' ? 'asc' : s === 'asc' ? 'none' : 'desc'))}
            >
              Signups
            </TableHead>
            <TableHead className="text-right">Conversion</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
      }
    >
      {rows.map((row) => (
        <TableRow key={row.channel}>
          <TableCell>{row.channel}</TableCell>
          <TableCell className="text-right tabular-nums">{row.signups.toLocaleString('en')}</TableCell>
          <TableCell className="text-right tabular-nums">{row.rate}%</TableCell>
          <TableCell>
            <Badge variant="subtle" tone={row.status} size="sm">
              {STATUS[row.status]}
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </WidgetTable>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/Widget Table',
  tags: ['agent-builder', 'widgets'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'row count · show row count', values: 'text · boolean', code: '`rowCount` prop' },
      { property: 'show toolbar', values: 'boolean', code: 'pass `title` / `rowCount` / `actions` or not' },
      { property: 'show pagination', values: 'boolean', code: '`pagination` (a Pagination) or not' },
      { property: 'state', values: 'loaded · loading · empty', code: '`loading` · `empty` props' },
      {
        property: 'table header cell · sort · align',
        values: 'none · asc · desc × left · right',
        code: 'UI `TableHead` `sort` / `onSort`; right = `className="text-right"`',
      },
      {
        property: 'table cell · type · align',
        values: 'text · numeric · badge · link × left · right',
        code: 'UI `TableCell` content (a Badge, a Link); numeric = right-aligned, tabular',
      },
      {
        property: 'table row · stripe · density · state',
        values: 'odd · even × default · compact × default · hover · selected',
        code: 'UI `Table` `striped` / `density`; hover and `data-state=selected` come from the table',
      },
    ],
    guide: {
      use: [
        'When the answer is a set of records to compare: launch tasks, metrics by channel, search results with several fields.',
        'Up to a few dozen rows; add `pagination` beyond one screen and sortable heads (`sort` / `onSort`) for numeric columns.',
        'Status columns as subtle Badges, so the table scans at a glance.',
      ],
      avoid: [
        'Tables in app pages and settings: use the UI Table directly, without the widget card.',
        'One to four headline numbers: use Widget Metric Card in a `WidgetMetricGroup`.',
        'A table the user will edit or keep working on: open it in Artifact Panel.',
      ],
      content: [
        '`title` says what the rows are (“Trial signups by channel”); `rowCount` gives the count and range (“6 channels · last 4 weeks”).',
        'Column heads are short nouns; numbers are right-aligned with units in the head or the cell.',
        '`empty` says what is missing for this query (“No trial signups in the last 4 weeks.”).',
      ],
      a11y: [
        'It’s a real `table`: column heads are `columnheader`s and sortable ones expose `aria-sort`.',
        'While `loading`, the widget is `aria-busy` and shows no data rows.',
        'Status Badges carry their meaning in text, never by colour alone.',
      ],
    },
    docs: {
      description: {
        component:
          'A data table in an answer (`@/components/agent/widget-table`), composed from Card, ShellHeader (card), the UI Table (flush, compact, `striped`, sortable heads), Badge, Skeleton, Empty and Pagination. `title`, `rowCount`, `actions`, `header` (a TableHeader), rows as children, `loading`, `empty`, `pagination`.',
      },
    },
  },
  args: { loading: false, empty: false, striped: true },
  argTypes: {
    loading: { control: 'boolean' },
    empty: { control: 'boolean' },
    striped: { control: 'boolean' },
  },
  decorators: [(Story) => <div className="max-w-160">{Story()}</div>],
})

/** Loading, empty and stripes are in Controls; Signups sorts. */
export const Default = meta.story()

Default.test('the Signups column sorts', async ({ canvas }) => {
  const head = canvas.getByRole('columnheader', { name: /Signups/ })
  await expect(head).toHaveAttribute('aria-sort', 'descending')
  await userEvent.click(canvas.getByRole('button', { name: /Signups/ }))
  await expect(head).toHaveAttribute('aria-sort', 'ascending')
  await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('874')
})

/** Figma state loading: skeleton rows under the headings. */
export const Loading = meta.story({ args: { loading: true } })

Loading.test('is busy and shows no rows', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=widget-table]')).toHaveAttribute('aria-busy', 'true')
  await expect(canvas.getAllByRole('row')).toHaveLength(1)
})

/** Figma state empty: the message in place of rows. */
export const EmptyState = meta.story({ args: { empty: true } })
