import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import type { LabelProps } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Figma: Forms page → `text field` (57:154). With `label` it renders the field anatomy
// (Field + FieldLabel + Input + FieldDescription, or FieldError when invalid); without a label it
// is the bare control. Never wrap it in another Field. Figma `state` → selectors:
// hover → hover:, focus → focus-visible: (1.5px --border-action stroke + focus/ring),
// invalid → aria-invalid: (1.5px --danger stroke), disabled → disabled: (Figma draws its own look).
// Strokes are inset rings (Figma inside stroke); `shadow/inner` → inset-shadow-xs.
const inputVariants = cva(
  [
    'w-full min-w-0 rounded-md bg-background type-text-sm-normal text-foreground outline-none',
    'inset-ring inset-ring-overlay-16 inset-shadow-xs',
    'transition-[color,box-shadow] duration-(--duration-fast) ease-out',
    'placeholder:text-foreground-disabled selection:bg-primary selection:text-primary-foreground',
    'file:inline-flex file:h-full file:border-0 file:bg-transparent file:type-text-sm-medium file:text-foreground',
    'hover:inset-ring-overlay-24',
    'focus-visible:inset-ring-[1.5px] focus-visible:inset-ring-border-action focus-visible:focus-ring',
    'aria-invalid:inset-ring-[1.5px] aria-invalid:inset-ring-danger',
    'disabled:cursor-not-allowed disabled:bg-background-disabled disabled:text-foreground-disabled disabled:inset-ring-overlay-8',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2',
        default: 'h-10 px-3',
        lg: 'h-12 px-3',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants> & {
    /** Renders the field anatomy (Field + FieldLabel + hint) around the input. */
    label?: React.ReactNode
    /** Text under the input: FieldDescription, or FieldError when `aria-invalid` is set. Needs `label`. */
    hint?: React.ReactNode
    marker?: LabelProps['marker']
  }

function Input({ className, type, size = 'default', label, hint, marker, id, ...props }: InputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  const hintId = label && hint ? `${inputId}-hint` : undefined

  const control = (
    <input
      {...props}
      type={type}
      id={inputId}
      data-slot="input"
      data-size={size}
      aria-describedby={[hintId, props['aria-describedby']].filter(Boolean).join(' ') || undefined}
      className={cn(inputVariants({ size }), className)}
    />
  )

  if (!label) return control

  return (
    <Field data-invalid={invalid || undefined} data-disabled={props.disabled || undefined}>
      <FieldLabel htmlFor={inputId} marker={marker}>
        {label}
      </FieldLabel>
      {control}
      {hint && invalid && <FieldError id={hintId}>{hint}</FieldError>}
      {hint && !invalid && <FieldDescription id={hintId}>{hint}</FieldDescription>}
    </Field>
  )
}

export { Input, inputVariants, type InputProps }
