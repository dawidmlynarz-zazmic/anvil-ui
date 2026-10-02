import { useId, useMemo, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

import { Label, type LabelProps } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

// Figma: Forms page → `field` (10940:109): label + control + description + error for controls
// without a built-in label (Combobox, Input OTP, Slider, groups, horizontal Switch / Checkbox rows).
// Text field, Textarea and Select render this anatomy themselves; do not wrap them in a Field.
// `orientation` vertical (gap 8) · horizontal (gap 12, control first); Figma `state=invalid` is
// `data-invalid` on Field (label and error turn destructive, the description stays muted).
// FieldSet / FieldLegend / FieldGroup / FieldSeparator are not drawn in Figma: tokenized shadcn.

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-6',
        'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-3 text-foreground',
        'data-[variant=legend]:type-text-base-semibold',
        'data-[variant=label]:type-text-xs-medium',
        className,
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-6 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
        className,
      )}
      {...props}
    />
  )
}

const fieldVariants = cva('group/field flex w-full', {
  variants: {
    orientation: {
      vertical: ['flex-col gap-2 [&>*]:w-full [&>.sr-only]:w-auto'],
      horizontal: [
        'flex-row items-center gap-3',
        '[&>[data-slot=field-label]]:flex-auto',
        'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      ],
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn('group/field-content flex flex-1 flex-col gap-1', className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        // Choice-card styling (label wrapping a Field) is the Anvil ChoiceCard, not FieldLabel.
        'group/field-label peer/field-label flex w-fit group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-1 type-text-xs-medium text-foreground group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'type-text-sm-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance',
        '[[data-variant=legend]+&]:-mt-2',
        '[&>a]:text-foreground-link [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-2 h-5 type-text-sm-normal group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      // --danger-medium, not Figma's --destructive: red/50 on the dark background is 3.25:1 (see Label).
      className={cn('type-text-sm-normal text-danger-medium', className)}
      {...props}
    >
      {content}
    </div>
  )
}

// ── Built-in field anatomy ─────────────────────────────────────────────────────────────────
// Text field (Input), Textarea and Select render Field + FieldLabel + control + FieldDescription
// (or FieldError when invalid) when given a `label`; without one they are the bare control.

/** Props shared by controls with a built-in label. */
type FieldAnatomyProps = {
  /** Renders the field anatomy (Field + FieldLabel + hint) around the control. */
  label?: ReactNode
  /** Text under the control: FieldDescription, or FieldError when invalid. Needs `label`. */
  hint?: ReactNode
  marker?: LabelProps['marker']
}

/** Ids that tie the label and hint to the control. */
function useFieldAnatomy({
  id,
  label,
  hint,
  describedBy,
}: {
  id?: string
  label?: ReactNode
  hint?: ReactNode
  describedBy?: string
}) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const hintId = label && hint ? `${controlId}-hint` : undefined
  const ariaDescribedBy = [hintId, describedBy].filter(Boolean).join(' ') || undefined
  return { controlId, hintId, ariaDescribedBy }
}

function FieldAnatomy({
  controlId,
  hintId,
  label,
  hint,
  marker,
  invalid,
  disabled,
  children,
}: FieldAnatomyProps & {
  controlId: string
  hintId?: string
  invalid?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  if (!label) return children
  return (
    <Field data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={controlId} marker={marker}>
        {label}
      </FieldLabel>
      {children}
      {hint && invalid && <FieldError id={hintId}>{hint}</FieldError>}
      {hint && !invalid && <FieldDescription id={hintId}>{hint}</FieldDescription>}
    </Field>
  )
}

const isInvalid = (value: unknown) => value === true || value === 'true'

export {
  FieldAnatomy,
  useFieldAnatomy,
  isInvalid,
  type FieldAnatomyProps,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
