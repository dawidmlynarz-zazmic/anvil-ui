import * as React from 'react'

import { cn } from '@/lib/utils'
import { CheckIcon, Icon, XIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Parts · stepper step (10851:5335): the stages of a process (not the numeric
// Controls › stepper, which is a quantity control). Only Icon.
// - ProgressSteps: the `<ol>`; its `variant` dots · bars is shared by the steps. Lay 3–5 steps in a row:
//   each fills an equal share.
// - ProgressStep: one stage: `label` (text/xs/medium), optional `meta` (a date; text/2xs --foreground-subtle),
//   `status` done · current · warning · failed · upcoming. A `<li>`; `current` is `aria-current="step"`,
//   and the status is also said in words (visually hidden), so colour is never the only signal.
//   dots: a 20px marker on a track of 2px lines — done a --success disc with a check, current a
//   --primary disc, warning a --warning disc, failed a --destructive disc with a cross, upcoming a hollow
//   ring; the line before a step is --success unless it is upcoming, the line after only when it is done,
//   and the first and last steps drop their outer line (Figma position first · middle · last, by
//   :first-child / :last-child). The label is centred.
//   bars: a 4px bar in the status colour (upcoming --border), the label start-aligned.

type StepStatus = 'done' | 'current' | 'warning' | 'failed' | 'upcoming'
type StepsVariant = 'dots' | 'bars'

const StepsContext = React.createContext<StepsVariant>('dots')

const STATUS_WORDS: Record<StepStatus, string> = {
  done: 'completed',
  current: 'current step',
  warning: 'needs attention',
  failed: 'failed',
  upcoming: 'upcoming',
}

const FILL: Record<StepStatus, string> = {
  done: 'bg-success border-success',
  current: 'bg-primary border-primary',
  warning: 'bg-warning border-warning',
  failed: 'bg-destructive border-destructive',
  upcoming: 'bg-background border-border-strong',
}

const BAR: Record<StepStatus, string> = {
  done: 'bg-success',
  current: 'bg-primary',
  warning: 'bg-warning',
  failed: 'bg-destructive',
  upcoming: 'bg-border',
}

function ProgressSteps({
  variant = 'dots',
  className,
  ...props
}: React.ComponentProps<'ol'> & { variant?: StepsVariant }) {
  return (
    <StepsContext.Provider value={variant}>
      <ol
        data-slot="progress-steps"
        data-variant={variant}
        className={cn('flex w-full', variant === 'bars' && 'gap-1.5', className)}
        {...props}
      />
    </StepsContext.Provider>
  )
}

function ProgressStep({
  status = 'upcoming',
  label,
  meta,
  className,
  ...props
}: Omit<React.ComponentProps<'li'>, 'children'> & {
  status?: StepStatus
  /** The stage: “Booked”, “Shipped”. */
  label: React.ReactNode
  /** A date or short note under the label. */
  meta?: React.ReactNode
}) {
  const variant = React.useContext(StepsContext)
  const words = <span className="sr-only"> ({STATUS_WORDS[status]})</span>
  return (
    <li
      data-slot="progress-step"
      data-status={status}
      aria-current={status === 'current' ? 'step' : undefined}
      className={cn(
        'group/step flex min-w-0 flex-1 flex-col gap-1.5',
        variant === 'dots' ? 'items-center' : 'items-start',
        className,
      )}
      {...props}
    >
      {variant === 'dots' ? (
        <div className="flex w-full items-center overflow-clip" aria-hidden>
          <span
            className={cn(
              'h-0.5 min-w-px flex-1 group-first/step:invisible',
              status === 'upcoming' ? 'bg-border' : 'bg-success',
            )}
          />
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
              FILL[status],
            )}
          >
            {status === 'done' && <Icon icon={CheckIcon} className="size-3 text-success-foreground" />}
            {status === 'failed' && <Icon icon={XIcon} className="size-3 text-destructive-foreground" />}
          </span>
          <span
            className={cn(
              'h-0.5 min-w-px flex-1 group-last/step:invisible',
              status === 'done' ? 'bg-success' : 'bg-border',
            )}
          />
        </div>
      ) : (
        <span aria-hidden className={cn('h-1 w-full rounded-2xs', BAR[status])} />
      )}
      <p className={cn('w-full type-text-xs-medium text-foreground', variant === 'dots' && 'text-center')}>
        {label}
        {words}
      </p>
      {meta && (
        <p
          className={cn(
            'w-full type-text-2xs-normal text-foreground-subtle',
            variant === 'dots' && 'text-center',
          )}
        >
          {meta}
        </p>
      )}
    </li>
  )
}

export { ProgressSteps, ProgressStep, type StepStatus, type StepsVariant }
