import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartBarIcon, CheckIcon, Icon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › poll (10726:2310): one question with options; after voting the
// results show as bars with percentages and the user's choice highlighted. Composed: Card (--card,
// --border, radius xl, ≤480px, 16px padding, 12px gap) → an agent Icon Tile (xs, chart-bar) + the
// question (text/sm/semibold) → the options:
// - vote: outline · neutral Buttons (full width, left-aligned text/sm/normal; Figma 42px, Button
//   default 40px), 8px apart.
// - results: a list of 40px --muted rows (radius md) with a bar to the percentage behind the text
//   (the user's choice --info-subtle, others --border), the label (the choice semibold with a check)
//   and the percentage (text/sm/medium, tabular).
// → `meta` (text/xs muted: votes, closing time). Figma state vote · results = `vote`.

type PollOption = { value: string; label: React.ReactNode; percent?: number }

function Poll({
  question,
  options,
  vote,
  defaultVote,
  onVote,
  meta,
  className,
  ...props
}: React.ComponentProps<typeof Card> & {
  question: React.ReactNode
  /** The options; `percent` is shown once voted. */
  options: PollOption[]
  vote?: string
  defaultVote?: string
  onVote?: (value: string) => void
  /** Under the options, e.g. "128 votes · closes in 2 days". */
  meta?: React.ReactNode
}) {
  const [inner, setInner] = React.useState(defaultVote)
  const current = vote ?? inner
  const questionId = React.useId()
  return (
    <Card
      data-slot="poll"
      data-state={current === undefined ? 'vote' : 'results'}
      role="group"
      aria-labelledby={questionId}
      className={cn('max-w-120 min-w-0 gap-3 rounded-xl border-border p-4', className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <IconTile icon={ChartBarIcon} tone="agent" size="xs" />
        <p id={questionId} className="type-text-sm-semibold text-foreground">
          {question}
        </p>
      </div>
      {current === undefined ? (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              intent="neutral"
              className="h-auto min-h-10 justify-start py-2.5 text-left type-text-sm-normal whitespace-normal"
              onClick={() => {
                setInner(option.value)
                onVote?.(option.value)
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      ) : (
        <ul aria-label="Results" className="flex flex-col gap-2">
          {options.map((option) => {
            const chosen = option.value === current
            const percent = option.percent ?? 0
            return (
              <li
                key={option.value}
                data-chosen={chosen || undefined}
                className="relative flex min-h-10 items-center gap-2 overflow-hidden rounded-md bg-muted px-3 type-text-sm-normal text-foreground"
              >
                <span
                  aria-hidden
                  className={cn('absolute inset-y-0 left-0', chosen ? 'bg-info-subtle' : 'bg-border')}
                  style={{ width: `${percent}%` }}
                />
                <span className={cn('relative min-w-0 flex-1', chosen && 'type-text-sm-semibold')}>
                  {option.label}
                  {chosen && <span className="sr-only"> (your vote)</span>}
                </span>
                {chosen && <Icon icon={CheckIcon} size="xs" className="relative" />}
                <span className="relative type-text-sm-medium tabular-nums">{percent}%</span>
              </li>
            )
          })}
        </ul>
      )}
      {meta && <p className="type-text-xs-normal text-muted-foreground">{meta}</p>}
    </Card>
  )
}

export { Poll, type PollOption }
