import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Icon, XIcon } from '@/components/ui/icon'

// Figma: Chip page → `chip` (8278:624). A selectable or removable token for filters and tags (on
// Toggle). `variant` default (--muted, hover --accent) · outline (--button-outline + --overlay-16
// stroke, hover --button-outline-hover); `size` sm (20px, 4px x, radius sm, text/xs/medium, 12px
// icons) · default (24px, 8px x, radius sm, text/sm/medium, 12px icons) · lg (32px, radius md,
// 16px icons). Figma content default · logo = what you put before the label (icon or 16px logo).
// pressed (Radix data-[state=on], Figma `pressed=true`) → --background-inverse / --foreground-inverse.
// Focus → focus/ring; disabled → 50%. With `onRemove` it is a removable token instead: the label
// plus its own remove button (Figma icon right), since a button can't hold another button.
// `shape` pill rounds it fully with 12px sides (contract shape; Quick Reply is a pill chip).
// `chipVariants` also styles non-toggle chips that act as buttons (Quick Reply).

const chipVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap text-foreground outline-none',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
    'focus-visible:focus-ring has-[button:focus-visible]:focus-ring disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    'data-[state=on]:bg-background-inverse data-[state=on]:text-foreground-inverse data-[state=on]:inset-ring-0',
    '[&_img]:shrink-0 [&_img]:rounded-sm [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted',
        outline: 'bg-button-outline inset-ring inset-ring-overlay-16',
      },
      // The toggle chip reacts to hover; a removable token doesn't (its remove button does).
      interactive: { true: '', false: '' },
      size: {
        sm: "h-5 rounded-sm px-1 type-text-xs-medium [&_img]:size-3 [&_svg:not([class*='size-'])]:size-3",
        default:
          "h-6 rounded-sm px-2 type-text-sm-medium [&_img]:size-4 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 rounded-md px-2 type-text-sm-medium [&_img]:size-4 [&_svg:not([class*='size-'])]:size-4",
      },
      // After size, so pill wins over the size's radius and padding.
      shape: { default: '', pill: 'rounded-full px-3' },
    },
    compoundVariants: [
      { interactive: true, variant: 'default', className: 'hover:bg-accent' },
      { interactive: true, variant: 'outline', className: 'hover:bg-button-outline-hover' },
    ],
    defaultVariants: { variant: 'default', size: 'default', shape: 'default', interactive: true },
  },
)

type ChipStyleProps = Omit<VariantProps<typeof chipVariants>, 'interactive'>

type RemovableChipProps = ChipStyleProps &
  Omit<React.ComponentProps<'span'>, 'onChange'> & {
    /** Makes it a removable token with a remove button. */
    onRemove: () => void
    /** Accessible name of the remove button. */
    removeLabel?: string
    disabled?: boolean
  }

type ToggleChipProps = ChipStyleProps &
  React.ComponentProps<typeof TogglePrimitive.Root> & { onRemove?: undefined }

function Chip(props: ToggleChipProps | RemovableChipProps) {
  if (props.onRemove) {
    const {
      variant,
      size,
      shape,
      className,
      children,
      onRemove,
      removeLabel = 'Remove',
      disabled,
      ...rest
    } = props as RemovableChipProps
    return (
      <span
        data-slot="chip"
        data-disabled={disabled || undefined}
        className={cn(chipVariants({ variant, size, shape, interactive: false }), 'pe-0.5', className)}
        {...rest}
      >
        {children}
        <button
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className="-me-0.5 flex size-4 items-center justify-center rounded-sm outline-none hover:bg-overlay-8"
        >
          <Icon icon={XIcon} />
        </button>
      </span>
    )
  }
  const { variant, size, shape, className, ...rest } = props as ToggleChipProps
  return (
    <TogglePrimitive.Root
      data-slot="chip"
      className={cn(chipVariants({ variant, size, shape }), className)}
      {...rest}
    />
  )
}

export { Chip, chipVariants, type ToggleChipProps, type RemovableChipProps }
