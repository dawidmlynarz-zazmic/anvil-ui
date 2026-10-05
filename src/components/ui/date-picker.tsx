import * as React from 'react'

import { Button } from '@/components/ui/button'
import { CalendarIcon, Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Figma: Date Picker page → `date picker` (10944:397). shadcn's Date Picker pattern: an outline ·
// neutral Button with a calendar icon opening a Calendar in a Popover (the popover surface draws
// the radius lg and --overlay-4 stroke; the Calendar inside is transparent and borderless). Figma
// `open` → Popover open. Format the value yourself (e.g. date-fns `format`).

// The popover is a role="dialog"; it is named by the trigger (aria-labelledby), as in Combobox.
const DatePickerContext = React.createContext<{
  triggerId: string
  setTriggerId: (id: string) => void
} | null>(null)

/** Popover root: controls `open` / `onOpenChange`. */
function DatePicker(props: React.ComponentProps<typeof Popover>) {
  const fallbackId = React.useId()
  const [triggerId, setTriggerId] = React.useState(fallbackId)
  const ctx = React.useMemo(() => ({ triggerId, setTriggerId }), [triggerId])
  return (
    <DatePickerContext.Provider value={ctx}>
      <Popover data-slot="date-picker" {...props} />
    </DatePickerContext.Provider>
  )
}

type DatePickerTriggerProps = React.ComponentProps<typeof Button> & {
  /** Shown (in --foreground-subtle) while there are no children. */
  placeholder?: string
}

/** The field-like trigger: calendar icon + the formatted value (children) or the placeholder. */
function DatePickerTrigger({ className, placeholder, children, id, ...props }: DatePickerTriggerProps) {
  const ctx = React.useContext(DatePickerContext)
  const setTriggerId = ctx?.setTriggerId
  React.useLayoutEffect(() => {
    if (id) setTriggerId?.(id)
  }, [id, setTriggerId])
  const empty = children == null || children === ''
  return (
    <PopoverTrigger asChild>
      <Button
        id={id ?? ctx?.triggerId}
        data-slot="date-picker-trigger"
        data-empty={empty || undefined}
        variant="outline"
        intent="neutral"
        className={cn('justify-start type-text-sm-medium data-[empty]:text-foreground-subtle', className)}
        {...props}
      >
        <Icon icon={CalendarIcon} className="text-muted-foreground" />
        {empty ? placeholder : children}
      </Button>
    </PopoverTrigger>
  )
}

/** PopoverContent sized to its Calendar. */
function DatePickerContent({
  className,
  align = 'start',
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const ctx = React.useContext(DatePickerContext)
  return (
    <PopoverContent
      data-slot="date-picker-content"
      aria-labelledby={ctx?.triggerId}
      align={align}
      className={cn('w-auto gap-0 overflow-hidden p-0', className)}
      {...props}
    />
  )
}

export { DatePicker, DatePickerTrigger, DatePickerContent }
