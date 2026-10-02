import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { Icon, LoaderCircleIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Button page → `button` (917:9268) and `icon button` (8218:5908). Icon button is this
// component with an icon-* size. Figma `state` maps to selectors: hover → hover:,
// focus → focus-visible: (focus/ring), disabled → disabled: (Figma draws 30% opacity).
// Outline strokes are inset rings so they sit inside the box like Figma's inside stroke.
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none select-none',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
    'focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-30',
    'data-[loading=true]:pointer-events-none',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: '',
        outline: 'inset-ring',
        ghost: 'bg-transparent',
      },
      intent: {
        neutral: '',
        brand: '',
        inverse: '',
        destructive: '',
      },
      size: {
        xs: "h-6 gap-1 rounded-sm px-2 type-text-xs-semibold [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-2 rounded-md px-3 type-text-xs-semibold',
        default: 'h-10 gap-2 rounded-lg px-3 type-text-sm-semibold',
        lg: 'h-12 gap-2 rounded-lg px-4 type-text-sm-semibold',
        'icon-xs': "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-md',
        icon: 'size-10 rounded-lg',
        'icon-lg': 'size-12 rounded-lg',
      },
      shape: {
        default: '',
        pill: 'rounded-full',
        circle: 'rounded-full',
      },
    },
    compoundVariants: [
      // default (solid)
      {
        variant: 'default',
        intent: 'brand',
        className: 'bg-primary text-primary-foreground hover:bg-button-primary-hover',
      },
      {
        variant: 'default',
        intent: 'neutral',
        className: 'bg-button-neutral text-button-neutral-foreground hover:bg-button-neutral-hover',
      },
      {
        variant: 'default',
        intent: 'inverse',
        className: 'bg-overlay-inverse-8 text-button-neutral-foreground hover:bg-overlay-inverse-16',
      },
      {
        variant: 'default',
        intent: 'destructive',
        className: 'bg-destructive text-destructive-foreground hover:bg-button-destructive-hover',
      },
      // outline
      {
        variant: 'outline',
        intent: 'neutral',
        className:
          'bg-button-outline text-foreground inset-ring-overlay-16 hover:bg-button-outline-hover hover:inset-ring-overlay-24',
      },
      {
        variant: 'outline',
        intent: 'brand',
        className:
          'bg-background text-foreground-link inset-ring-foreground-link hover:bg-info-subtle hover:text-info-medium hover:inset-ring-info-medium',
      },
      {
        variant: 'outline',
        intent: 'inverse',
        className:
          'bg-transparent text-button-neutral-foreground inset-ring-overlay-inverse-32 hover:bg-overlay-inverse-16 hover:inset-ring-overlay-inverse-24',
      },
      {
        variant: 'outline',
        intent: 'destructive',
        className: 'bg-background text-danger-medium inset-ring-danger-medium hover:bg-danger-subtle',
      },
      // ghost
      { variant: 'ghost', intent: 'neutral', className: 'text-foreground hover:bg-button-outline-hover' },
      {
        variant: 'ghost',
        intent: 'brand',
        className: 'text-foreground-link hover:bg-info-subtle hover:text-info-medium',
      },
      {
        variant: 'ghost',
        intent: 'inverse',
        className: 'text-button-neutral-foreground hover:bg-overlay-inverse-16',
      },
      { variant: 'ghost', intent: 'destructive', className: 'text-danger-medium hover:bg-danger-subtle' },
    ],
    defaultVariants: {
      variant: 'default',
      intent: 'brand',
      size: 'default',
      shape: 'default',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner before the label and blocks clicks; the button stays focusable. */
    loading?: boolean
  }

function Button({
  className,
  variant = 'default',
  intent = 'brand',
  size = 'default',
  shape = 'default',
  asChild = false,
  loading = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-intent={intent}
      data-size={size}
      data-shape={shape}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={cn(buttonVariants({ variant, intent, size, shape, className }))}
      onClick={loading ? (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault() : onClick}
      {...props}
    >
      {loading && <Icon icon={LoaderCircleIcon} data-slot="button-spinner" className="animate-spin" />}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps }
