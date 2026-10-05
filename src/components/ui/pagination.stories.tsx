import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-479'

/** Figma `full`: first, last, the current page with its neighbours, and ellipses between. */
function pagesFor(current: number, total: number): (number | 'ellipsis')[] {
  const set = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  return set.flatMap((p, i) => (i > 0 && p - set[i - 1] > 1 ? (['ellipsis', p] as const) : [p]))
}

type DemoProps = {
  /** Figma `type`. */
  type?: 'full' | 'compact'
  page?: number
  total?: number
}

function DemoPagination({ type = 'full', page: initial = 5, total = 12 }: DemoProps) {
  const [page, setPage] = useState(initial)
  const go = (p: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    setPage(Math.min(total, Math.max(1, p)))
  }
  const atFirst = page <= 1
  const atLast = page >= total
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#previous" aria-disabled={atFirst || undefined} onClick={go(page - 1)} />
        </PaginationItem>
        {type === 'compact' ? (
          <PaginationItem className="px-2 type-text-sm-normal text-muted-foreground" aria-live="polite">
            Page {page} of {total}
          </PaginationItem>
        ) : (
          pagesFor(page, total).map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink href={`#${p}`} isActive={p === page} onClick={go(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )
        )}
        <PaginationItem>
          <PaginationNext href="#next" aria-disabled={atLast || undefined} onClick={go(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

const meta = preview.meta({
  title: 'Components/Pagination',
  component: DemoPagination,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Paged navigation (shadcn/ui Pagination): links styled as Buttons — the current page outlined, the rest ghost. Figma `type` full lists pages with ellipses; compact shows "Page n of m". On the first or last page, Previous / Next take `aria-disabled`.',
      },
    },
  },
  args: { type: 'full', page: 5, total: 12 },
  argTypes: {
    type: { control: 'inline-radio', options: ['full', 'compact'] },
    page: { control: { type: 'number', min: 1, max: 12 } },
  },
  // Remount when the page control changes (the demo keeps its own page after clicks).
  decorators: [(Story, { args }) => <Story key={`${args.page}-${args.type}`} />],
})

export const Default = meta.story()

Default.test('the current page is marked; Next moves on', async ({ canvas }) => {
  await expect(canvas.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
  await expect(canvas.getByRole('link', { name: '5' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(canvas.getByRole('link', { name: 'Go to next page' }))
  await expect(canvas.getByRole('link', { name: '6' })).toHaveAttribute('aria-current', 'page')
})

/** Figma current=first: Previous is disabled. */
export const First = meta.story({ args: { page: 1 } })

First.test('Previous is disabled on the first page', async ({ canvas }) => {
  await expect(canvas.getByRole('link', { name: 'Go to previous page' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )
})

/** Figma current=last: Next is disabled. */
export const Last = meta.story({ args: { page: 12 } })

/** Figma type=compact. */
export const Compact = meta.story({ args: { type: 'compact' } })

Compact.test('shows the position as text', async ({ canvas }) => {
  await expect(canvas.getByText('Page 5 of 12')).toBeInTheDocument()
})
