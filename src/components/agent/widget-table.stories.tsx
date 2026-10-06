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

type Row = { label: string; users: number; rate: number; status: 'success' | 'warning' | 'destructive' }
const ROWS: Row[] = [
  { label: 'Label 1', users: 1284, rate: 91.2, status: 'success' },
  { label: 'Label 2', users: 1102, rate: 88.7, status: 'success' },
  { label: 'Label 3', users: 986, rate: 84.1, status: 'warning' },
  { label: 'Label 4', users: 1037, rate: 82.9, status: 'success' },
  { label: 'Label 5', users: 912, rate: 79.4, status: 'destructive' },
  { label: 'Label 6', users: 874, rate: 78.8, status: 'success' },
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

/** A sortable table: Users sorts descending, then ascending, then off. */
function Demo({ loading, empty, striped }: DemoProps) {
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('desc')
  const rows = [...ROWS].sort((a, b) =>
    sort === 'none' ? 0 : sort === 'asc' ? a.users - b.users : b.users - a.users,
  )
  return (
    <WidgetTable
      title="Title"
      rowCount="Subtitle"
      loading={loading}
      empty={empty ? 'Subtitle' : undefined}
      striped={striped}
      pagination={<Pages />}
      header={
        <TableHeader>
          <TableRow>
            <TableHead>Label 1</TableHead>
            <TableHead
              className="text-right"
              sort={sort}
              onSort={() => setSort((s) => (s === 'desc' ? 'asc' : s === 'asc' ? 'none' : 'desc'))}
            >
              Label 2
            </TableHead>
            <TableHead className="text-right">Label 3</TableHead>
            <TableHead>Label 4</TableHead>
          </TableRow>
        </TableHeader>
      }
    >
      {rows.map((row) => (
        <TableRow key={row.label}>
          <TableCell>{row.label}</TableCell>
          <TableCell className="text-right tabular-nums">{row.users.toLocaleString('en')}</TableCell>
          <TableCell className="text-right tabular-nums">{row.rate}%</TableCell>
          <TableCell>
            <Badge variant="semantic" tone={row.status} size="sm">
              Label
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </WidgetTable>
  )
}

const meta = preview.meta({
  title: 'Agent Blocks/Widgets & Artifacts/Widget Table',
  tags: ['feature'],
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

/** Loading, empty and stripes are in Controls; Label 2 sorts. */
export const Default = meta.story()

Default.test('the Label 2 column sorts', async ({ canvas }) => {
  const head = canvas.getByRole('columnheader', { name: /Label 2/ })
  await expect(head).toHaveAttribute('aria-sort', 'descending')
  await userEvent.click(canvas.getByRole('button', { name: /Label 2/ }))
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
