import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { CommandItem } from '@/components/ui/command'
import { CheckIcon, ChevronsUpDownIcon, Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Figma: Forms page → `combobox` (10892:270). shadcn/ui's Combobox pattern: Popover + Command.
// Pick one value from a long or searchable list (use Select for a short fixed list). The trigger is
// a bare control: wrap it in Field + FieldLabel for a label (CLAUDE.md → Labels). Figma `open` →
// data-[state=open]: (1.5px --border-action + focus/ring), invalid → aria-invalid:, disabled →
// disabled: (Figma draws Input's disabled look). `empty` is CommandEmpty. The popover is at the
// trigger's width, radius md, --border stroke; Figma's shadow/lg → elevation/raised (known gap).

// The popover is a role="dialog"; it is named by the trigger (aria-labelledby).
const ComboboxContext = React.createContext<{ triggerId: string; setTriggerId: (id: string) => void } | null>(
  null,
)

/** Popover root: controls `open` / `onOpenChange`. */
function Combobox(props: React.ComponentProps<typeof Popover>) {
  const fallbackId = React.useId()
  const [triggerId, setTriggerId] = React.useState(fallbackId)
  const ctx = React.useMemo(() => ({ triggerId, setTriggerId }), [triggerId])
  return (
    <ComboboxContext.Provider value={ctx}>
      <Popover data-slot="combobox" {...props} />
    </ComboboxContext.Provider>
  )
}

const comboboxTriggerVariants = cva(
  [
    'flex w-full items-center justify-between gap-2 rounded-md bg-background px-3 type-text-sm-normal whitespace-nowrap text-foreground outline-none',
    'inset-ring inset-ring-overlay-16 shadow-xs',
    'transition-[color,box-shadow] duration-(--duration-fast) ease-out',
    'data-[placeholder]:text-foreground-subtle',
    'hover:inset-ring-overlay-32',
    'focus-visible:inset-ring-border-action focus-visible:focus-ring',
    'data-[state=open]:inset-ring-[1.5px] data-[state=open]:inset-ring-border-action data-[state=open]:focus-ring',
    'aria-invalid:inset-ring-destructive',
    'disabled:cursor-not-allowed disabled:bg-background-disabled disabled:text-foreground-disabled disabled:shadow-none disabled:hover:inset-ring-overlay-16',
  ],
  {
    variants: {
      size: {
        sm: 'h-8',
        default: 'h-10',
        lg: 'h-12',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type ComboboxTriggerProps = React.ComponentProps<'button'> &
  VariantProps<typeof comboboxTriggerVariants> & {
    /** Shown (in --foreground-subtle) while there are no children. */
    placeholder?: string
  }

/** The field-like button (role="combobox"). Children are the selected value's label. */
function ComboboxTrigger({
  className,
  size = 'default',
  placeholder,
  children,
  id,
  ...props
}: ComboboxTriggerProps) {
  const ctx = React.useContext(ComboboxContext)
  const triggerId = id ?? ctx?.triggerId
  const setTriggerId = ctx?.setTriggerId
  React.useLayoutEffect(() => {
    if (id) setTriggerId?.(id)
  }, [id, setTriggerId])
  const empty = children == null || children === ''
  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        role="combobox"
        id={triggerId}
        data-slot="combobox-trigger"
        data-size={size}
        data-placeholder={empty ? '' : undefined}
        className={cn(comboboxTriggerVariants({ size }), className)}
        {...props}
      >
        <span data-slot="combobox-value" className="line-clamp-1 text-left">
          {empty ? placeholder : children}
        </span>
        <Icon icon={ChevronsUpDownIcon} className="size-3.5 text-foreground-subtle" />
      </button>
    </PopoverTrigger>
  )
}

/** PopoverContent sized to the trigger; put a Command (input, list, empty) inside. */
function ComboboxContent({
  className,
  align = 'start',
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const ctx = React.useContext(ComboboxContext)
  return (
    <PopoverContent
      data-slot="combobox-content"
      aria-labelledby={ctx?.triggerId}
      align={align}
      className={cn(
        'w-(--radix-popover-trigger-width) gap-0 overflow-hidden rounded-md p-0 inset-ring-border',
        // Figma: search row 8 / 8 / 8 / 12 with a 14px icon, list padding 4, empty padding 20 / 4.
        '**:data-[slot=command]:rounded-none',
        '**:data-[slot=command-input-wrapper]:py-2 **:data-[slot=command-input-wrapper]:pr-2 **:data-[slot=command-input-wrapper]:pl-3',
        '**:data-[slot=command-input-wrapper]:[&>svg]:size-3.5',
        '**:data-[slot=command-list]:p-1 **:data-[slot=command-empty]:px-1 **:data-[slot=command-empty]:py-5',
        className,
      )}
      {...props}
    />
  )
}

/** A CommandItem with the trailing check of the selected option (Figma dropdown item, radio type). */
function ComboboxItem({
  selected = false,
  children,
  ...props
}: React.ComponentProps<typeof CommandItem> & { selected?: boolean }) {
  return (
    <CommandItem data-slot="combobox-item" data-checked={selected} {...props}>
      {children}
      <Icon icon={CheckIcon} className={cn('ml-auto', !selected && 'invisible')} />
    </CommandItem>
  )
}

export { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, comboboxTriggerVariants }
