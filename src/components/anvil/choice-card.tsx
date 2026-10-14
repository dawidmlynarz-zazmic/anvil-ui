import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '@/components/ui/field'
import { type LucideIcon } from '@/components/ui/icon'
import { RadioGroupItem } from '@/components/ui/radio-group'

// Figma Forms › choice card (10851:5334, “Imported pattern (radio card)”): a selectable card for
// choices that need more than a label (plans, delivery, meeting mode, resolutions). It is shadcn's
// Field choice-card pattern: a `FieldLabel` around a horizontal `Field` holding the control, an optional
// Icon Tile, the title (text/sm/semibold) with its `detail` (text/xs muted) and a trailing value
// (text/sm/semibold). Radio / checkbox are the real controls, so keyboard, grouping and form behaviour
// are theirs.
// - Figma `control` radio · checkbox · none → `control`. Radio and none go inside a `RadioGroup` and use
//   `value`; none hides the dot but keeps the radio for keyboard and screen readers (the card itself is
//   the target). Checkbox is its own control: `checked` / `defaultChecked` / `onCheckedChange`.
// - Figma state: default · hover (--border-strong) · focus (--ring border + focus ring) · disabled (50%) ·
//   selected (`checked`: --info-subtle fill with a 2px --border-action stroke, drawn as border + inset
//   ring so the card does not grow by a pixel). Selectors only, never props.
// - Figma show tile / detail / value → pass `icon` / `detail` / `trailing` or leave them out. (Figma's
//   “value” is `trailing` here: `value` is the radio's form value.)

const card =
  'rounded-lg border bg-card transition-colors duration-(--duration-fast) ease-out [&>*]:data-[slot=field]:p-3 ' +
  'cursor-pointer hover:border-border-strong ' +
  'has-focus-visible:border-ring has-focus-visible:focus-ring ' +
  'has-data-[state=checked]:border-border-action has-data-[state=checked]:bg-info-subtle has-data-[state=checked]:inset-ring-1 has-data-[state=checked]:inset-ring-border-action ' +
  'dark:has-data-[state=checked]:bg-info-subtle has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:border-border'

type ChoiceCardProps = Omit<React.ComponentProps<'button'>, 'value' | 'title' | 'type' | 'onChange'> & {
  /** Figma control: a radio (default), a checkbox, or no visible control. */
  control?: 'radio' | 'checkbox' | 'none'
  /** The form value (radio and none, inside a `RadioGroup`). */
  value: string
  title: React.ReactNode
  detail?: React.ReactNode
  /** The glyph on the tile; leave it out to hide the tile (Figma show tile). */
  icon?: LucideIcon
  /** Text at the end of the row, such as a price (Figma value). */
  trailing?: React.ReactNode
  /** Checkbox only. */
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function ChoiceCard({
  control = 'radio',
  value,
  title,
  detail,
  icon,
  trailing,
  id,
  disabled,
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  ...props
}: ChoiceCardProps) {
  const reactId = React.useId()
  const controlId = id ?? reactId
  // axe does not name a button-role radio from the label that wraps it: point it at the card's text.
  const labelledBy = [
    `${controlId}-title`,
    detail && `${controlId}-detail`,
    trailing && `${controlId}-trailing`,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <FieldLabel
      htmlFor={controlId}
      data-slot="choice-card"
      data-control={control}
      className={cn(card, className)}
    >
      <Field orientation="horizontal" data-disabled={disabled || undefined} className="gap-3">
        {control === 'checkbox' ? (
          <Checkbox
            id={controlId}
            value={value}
            disabled={disabled}
            aria-labelledby={labelledBy}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={(next) => onCheckedChange?.(next === true)}
            {...props}
          />
        ) : (
          <RadioGroupItem
            id={controlId}
            value={value}
            disabled={disabled}
            aria-labelledby={labelledBy}
            className={control === 'none' ? 'sr-only' : undefined}
            {...props}
          />
        )}
        {icon && (
          <IconTile
            icon={icon}
            tone="neutral"
            size="sm"
            className="group-has-[[data-state=checked]]/field-label:border group-has-[[data-state=checked]]/field-label:bg-card"
          />
        )}
        <FieldContent className="min-w-0 gap-0.5">
          <FieldTitle id={`${controlId}-title`} className="type-text-sm-semibold">
            {title}
          </FieldTitle>
          {detail && (
            <FieldDescription id={`${controlId}-detail`} className="type-text-xs-normal">
              {detail}
            </FieldDescription>
          )}
        </FieldContent>
        {trailing && (
          <span
            id={`${controlId}-trailing`}
            className="shrink-0 type-text-sm-semibold whitespace-nowrap text-foreground"
          >
            {trailing}
          </span>
        )}
      </Field>
    </FieldLabel>
  )
}

export { ChoiceCard }
