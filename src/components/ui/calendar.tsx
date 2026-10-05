import * as React from 'react'
import { DayPicker, getDefaultClassNames, type DayButton } from 'react-day-picker'

import { Button, buttonVariants } from '@/components/ui/button'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Date Picker page → `calendar` (10944:273) and `.calendar day` (10944:67). Month grid on
// react-day-picker: --background, 1px --border stroke, radius lg, padding 12 (transparent and
// borderless inside a Popover or Card). Header: 32px ghost · neutral nav buttons around the month
// (text/sm/medium); 12px to the weekdays (text/xs/medium muted) and the grid; weeks 4px apart.
// Day 36px, radius md, text/sm/normal: hover --muted, today --accent (medium), selected --primary,
// range start / end --primary with outer corners, range middle --accent square, outside
// --muted-foreground, disabled 50%; focus → focus/ring. Figma `mode` single · range = DayPicker mode.

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar rounded-lg border border-border bg-background p-3 [--cell-size:--spacing(9)]',
        '[[data-slot=card-content]_&]:border-0 [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:border-0 [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-6 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-3', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, intent: 'neutral', size: 'icon-sm' }),
          'select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, intent: 'neutral', size: 'icon-sm' }),
          'select-none aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-8 w-full items-center justify-center px-8',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-8 w-full items-center justify-center gap-1.5 type-text-sm-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative rounded-md inset-ring inset-ring-overlay-16 has-focus-visible:focus-ring',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 bg-popover opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'type-text-sm-medium text-foreground select-none',
          captionLayout === 'label'
            ? ''
            : 'flex h-8 items-center gap-1 rounded-md pr-1 pl-2 [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 rounded-md type-text-xs-medium text-muted-foreground select-none',
          defaultClassNames.weekday,
        ),
        week: cn('mt-1 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-(--cell-size) select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'type-text-xs-normal text-muted-foreground select-none',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md',
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-md'
            : '[&:first-child[data-selected=true]_button]:rounded-l-md',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-md bg-accent', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: cn(
          'rounded-md bg-accent text-foreground data-[selected=true]:rounded-none [&_button]:type-text-sm-medium',
          defaultClassNames.today,
        ),
        outside: cn('text-muted-foreground aria-selected:text-muted-foreground', defaultClassNames.outside),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        },
        Chevron: ({ className, orientation }) => {
          if (orientation === 'left') {
            return <Icon icon={ChevronLeftIcon} className={className} />
          }

          if (orientation === 'right') {
            return <Icon icon={ChevronRightIcon} className={className} />
          }

          return <Icon icon={ChevronDownIcon} className={className} />
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      intent="neutral"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-md type-text-sm-normal leading-none text-inherit hover:bg-muted',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:focus-ring',
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
        'data-[range-start=true]:rounded-md data-[range-start=true]:rounded-r-none data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
        'data-[range-end=true]:rounded-md data-[range-end=true]:rounded-l-none data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground',
        'data-[range-start=true]:data-[range-end=true]:rounded-md',
        'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-foreground',
        '[&>span]:type-text-xs-normal [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
