import * as React from 'react'

import { FieldAnatomy, isInvalid, useFieldAnatomy, type FieldAnatomyProps } from '@/components/ui/field'
import { cn } from '@/lib/utils'

// Figma: Forms page → `textarea` (10939:229). Same rules and states as the text field (Input):
// built-in label and hint, minimum height 80, grows with its content.
const textareaClassName = [
  'flex field-sizing-content min-h-20 w-full rounded-md bg-background px-3 py-2.75 type-text-sm-normal text-foreground outline-none',
  'inset-ring inset-ring-overlay-16 inset-shadow-xs',
  'transition-[color,box-shadow] duration-(--duration-fast) ease-out',
  'placeholder:text-foreground-disabled selection:bg-primary selection:text-primary-foreground',
  'hover:inset-ring-overlay-24',
  'focus-visible:inset-ring-[1.5px] focus-visible:inset-ring-border-action focus-visible:focus-ring',
  'aria-invalid:inset-ring-[1.5px] aria-invalid:inset-ring-danger',
  'disabled:cursor-not-allowed disabled:bg-background-disabled disabled:text-foreground-disabled disabled:inset-ring-overlay-8',
]

type TextareaProps = React.ComponentProps<'textarea'> & FieldAnatomyProps

function Textarea({ className, label, hint, marker, id, ...props }: TextareaProps) {
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
      disabled={props.disabled}
    >
      <textarea
        data-slot="textarea"
        {...props}
        id={controlId}
        aria-describedby={ariaDescribedBy}
        className={cn(textareaClassName, className)}
      />
    </FieldAnatomy>
  )
}

export { Textarea, type TextareaProps }
