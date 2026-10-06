import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Select as SelectPrimitive } from 'radix-ui'

import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Icon } from '@/components/ui/icon'
import { FieldAnatomy, isInvalid, useFieldAnatomy, type FieldAnatomyProps } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { overlayMotion, overlayNudge } from '@/lib/motion'

// Figma: Forms page → `select` (56:121). Pick one value from a short fixed list; use Combobox for
// long or async lists. The trigger carries the built-in field anatomy (`label` / `hint` /
// `marker`). Figma `state` / `open` → selectors: hover → hover:, focus → focus-visible:,
// open → data-[state=open]: (1.5px --border-action + focus/ring, chevron up), invalid →
// aria-invalid:, disabled → data-[disabled] (Figma draws its own look). `empty` is the placeholder.
// The open list follows the Figma dropdown menu / dropdown item (Dropdown Menu page).

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const selectTriggerVariants = cva(
  [
    'flex w-full items-center justify-between rounded-md bg-background px-3 type-text-sm-medium whitespace-nowrap text-foreground outline-none',
    'inset-ring inset-ring-overlay-16 shadow-xs',
    'transition-[color,box-shadow] duration-(--duration-fast) ease-out',
    'data-[placeholder]:text-foreground-subtle',
    'hover:inset-ring-overlay-32',
    'focus-visible:inset-ring-border-action focus-visible:focus-ring',
    'data-[state=open]:inset-ring-[1.5px] data-[state=open]:inset-ring-border-action data-[state=open]:focus-ring',
    'aria-invalid:inset-ring-destructive',
    'data-[disabled]:cursor-not-allowed data-[disabled]:bg-background-disabled data-[disabled]:text-foreground-disabled data-[disabled]:shadow-none data-[disabled]:hover:inset-ring-overlay-16',
    '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    'data-[state=open]:[&>[data-slot=select-chevron]]:rotate-180',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 gap-2',
        default: 'h-10 gap-3',
        lg: 'h-12 gap-3',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants> &
  FieldAnatomyProps

function SelectTrigger({
  className,
  size = 'default',
  label,
  hint,
  marker,
  id,
  children,
  ...props
}: SelectTriggerProps) {
  const { controlId, hintId, ariaDescribedBy } = useFieldAnatomy({
    id,
    label,
    hint,
    describedBy: props['aria-describedby'],
  })

  return (
    <FieldAnatomy
      controlId={controlId}
      hintId={hintId}
      label={label}
      hint={hint}
      marker={marker}
      invalid={isInvalid(props['aria-invalid'])}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        {...props}
        id={controlId}
        data-size={size}
        aria-describedby={ariaDescribedBy}
        className={cn(selectTriggerVariants({ size }), className)}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <Icon
            icon={ChevronDownIcon}
            data-slot="select-chevron"
            className="transition-transform duration-(--duration-fast)"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    </FieldAnatomy>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'start',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Figma dropdown menu: --popover, 1px --overlay-4 stroke, radius lg, elevation/raised.
          'relative z-(--z-popover) max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground inset-ring inset-ring-overlay-4 shadow-elevation-raised',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          overlayNudge,
          overlayMotion,
          className,
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-2',
            position === 'popper' &&
              'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-2',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('px-2 py-1.5 type-text-xs-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

// Figma dropdown item, type=radio: 36px, type-text-sm-normal, check at the end when selected;
// highlighted → data-[highlighted]: --muted; disabled → 50% (Figma draws 50%).
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex h-9 w-full cursor-pointer items-center gap-2 rounded-md py-2 pr-8 pl-2 type-text-sm-normal text-foreground outline-hidden select-none',
        'data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        '*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
        className,
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-4 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <Icon icon={CheckIcon} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-2 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-pointer items-center justify-center py-1 text-foreground-subtle', className)}
      {...props}
    >
      <Icon icon={ChevronUpIcon} />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-pointer items-center justify-center py-1 text-foreground-subtle', className)}
      {...props}
    >
      <Icon icon={ChevronDownIcon} />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  selectTriggerVariants,
  SelectValue,
  type SelectTriggerProps,
}
