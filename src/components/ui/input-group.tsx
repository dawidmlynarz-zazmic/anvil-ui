import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// Figma: Forms page → `search` (1623:6796) is an Input Group: icon addon + input + optional Kbd
// shortcut addon. `size` sm · default · lg (32 / 40 / 48, padding 8 / 12 / 16). The group draws the
// field (Input's tokens: --overlay-16 stroke; hover --overlay-24 + inset shadow; focus 1.5px
// --border-action + focus ring; invalid 1.5px --danger), the control inside is borderless.
// Figma's search has some hand-set colors on hidden layers (CLAUDE.md → known gaps); ignored.

const inputGroupVariants = cva(
  [
    'group/input-group relative flex w-full min-w-0 items-center gap-2 rounded-md bg-background outline-none',
    'inset-ring inset-ring-overlay-16 transition-[color,box-shadow] duration-(--duration-fast) ease-out',
    'hover:inset-ring-overlay-24 hover:inset-shadow-xs has-[>textarea]:h-auto',

    // Variants based on alignment (shadcn).
    'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:items-stretch has-[>[data-align=block-start]]:[&>input]:pb-3',
    'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:items-stretch has-[>[data-align=block-end]]:[&>input]:pt-3',

    // Focus state.
    'has-[[data-slot=input-group-control]:focus-visible]:inset-ring-[1.5px] has-[[data-slot=input-group-control]:focus-visible]:inset-ring-border-action has-[[data-slot=input-group-control]:focus-visible]:focus-ring',

    // Error state.
    'has-[[data-slot][aria-invalid=true]]:inset-ring-[1.5px] has-[[data-slot][aria-invalid=true]]:inset-ring-danger',

    // Disabled (Figma draws Input's disabled look).
    'data-[disabled=true]:bg-background-disabled data-[disabled=true]:inset-ring-overlay-8 data-[disabled=true]:hover:inset-shadow-none',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2',
        default: 'h-10 px-3',
        lg: 'h-12 px-4',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

function InputGroup({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      data-size={size}
      role="group"
      className={cn(inputGroupVariants({ size }), className)}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 type-text-sm-medium text-foreground-subtle select-none group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start': 'order-first',
        // Figma: 16px between the search content and the shortcut.
        'inline-end': 'order-last ml-2',
        'block-start':
          'order-first w-full justify-start pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3',
        'block-end':
          'order-last w-full justify-start pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva('flex items-center gap-2 shadow-none', {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-sm px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3",
      sm: 'h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5',
      'icon-xs': 'size-6 rounded-sm p-0 has-[>svg]:p-0',
      'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
    },
  },
  defaultVariants: {
    size: 'xs',
  },
})

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  intent = 'neutral',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      intent={intent}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 type-text-sm-normal text-foreground-subtle [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

// The control is borderless; the group draws the field and its states.
const controlReset =
  'flex-1 rounded-none bg-transparent px-0 inset-ring-0 inset-shadow-none shadow-none hover:inset-ring-0 focus-visible:inset-ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 aria-invalid:inset-ring-0 disabled:bg-transparent disabled:inset-ring-0'

function InputGroupInput({ className, ...props }: Omit<React.ComponentProps<'input'>, 'size'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(controlReset, 'h-full placeholder:text-foreground-subtle', className)}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(controlReset, 'resize-none py-3', className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
