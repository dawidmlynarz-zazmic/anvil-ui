import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, CheckIcon, CircleHelpIcon, Icon } from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'

// Figma Agent Builder › Core Kit › clarifying question (10732:2911): one tappable question from the
// agent. --card, --border, radius xl. Header (16px): 32px --agent-subtle tile with a help icon, title
// text/sm/semibold, description text/xs --muted-foreground. Options (16px sides, 6px apart): rows
// with an --input stroke, radius lg, 12/10px — 22px key badge (--border, radius sm, text/2xs/semibold
// --muted-foreground), label text/sm, 14px arrow; hover --muted (badge --accent). Footer (--muted,
// --border top, 16/12px): hint text/xs + Skip (ghost xs). Figma state answered = a value is set: the
// options collapse to the answer (--info-subtle, --border-action, check, text/sm/medium) + Change.
// Number keys pick an option while focus is inside the card.

type Option = { value: string; label: React.ReactNode }

function ClarifyingQuestion({
  title,
  description,
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  onSkip,
  hint,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title' | 'defaultValue'> & {
  title: React.ReactNode
  description?: React.ReactNode
  options: Option[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  onSkip?: () => void
  /** Footer hint; defaults to the number-key tip. */
  hint?: React.ReactNode
}) {
  const [inner, setInner] = React.useState<string | null>(defaultValue ?? null)
  const value = valueProp !== undefined ? valueProp : inner
  const setValue = (next: string | null) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const titleId = React.useId()
  const answer = options.find((option) => option.value === value)

  return (
    <section
      data-slot="clarifying-question"
      data-state={answer ? 'answered' : 'unanswered'}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (answer || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)
          return
        const index = Number(event.key) - 1
        if (Number.isInteger(index) && index >= 0 && index < options.length) {
          event.preventDefault()
          setValue(options[index].value)
        }
      }}
      className={cn(
        'flex w-full max-w-140 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-3 p-4">
        <IconTile icon={CircleHelpIcon} tone="agent" size="sm" />
        <div className="flex min-w-0 flex-col">
          <h3 id={titleId} className="type-text-sm-semibold text-foreground">
            {title}
          </h3>
          {(answer || description) && (
            <p className="type-text-xs-normal text-muted-foreground">{answer ? 'Answered' : description}</p>
          )}
        </div>
      </header>
      {answer ? (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2.5 rounded-lg bg-info-subtle px-3 py-2.5 inset-ring inset-ring-border-action">
            <Icon icon={CheckIcon} className="text-info-medium" />
            <span className="min-w-0 flex-1 type-text-sm-medium text-foreground">{answer.label}</span>
            <Button variant="ghost" intent="neutral" size="xs" onClick={() => setValue(null)}>
              Change
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ol className="flex flex-col gap-1.5 px-4 pb-4">
            {options.map((option, i) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => setValue(option.value)}
                  className="group/option flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left inset-ring inset-ring-input outline-none transition-colors duration-(--duration-fast) hover:bg-muted focus-visible:focus-ring"
                >
                  <kbd className="flex size-5.5 shrink-0 items-center justify-center rounded-sm type-text-2xs-semibold text-muted-foreground inset-ring inset-ring-border group-hover/option:bg-accent">
                    {i + 1}
                  </kbd>
                  <span className="min-w-0 flex-1 type-text-sm-normal text-foreground">{option.label}</span>
                  <Icon icon={ArrowRightIcon} className="size-3.5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ol>
          <footer className="flex items-center justify-between gap-2 border-t bg-muted px-4 py-3">
            <p className="type-text-xs-normal text-muted-foreground">
              {hint ?? `Press 1–${options.length} or type your own answer`}
            </p>
            {onSkip && (
              <Button variant="ghost" intent="neutral" size="xs" onClick={onSkip}>
                Skip
              </Button>
            )}
          </footer>
        </>
      )}
    </section>
  )
}

export { ClarifyingQuestion, type Option as ClarifyingOption }
