import { cn } from '@/lib/utils'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

// A keyboard hint: the keys, then what they do ("Tab to accept", "↑↓ Navigate"). Built on Kbd, nothing
// re-drawn. Used by the Command Palette legend and Ghost Text. Text is text/xs --muted-foreground,
// 6px gap. The keys are decorative for assistive tech (`aria-hidden`); the label says what to do, and
// the real key handling lives on the control.

function ShortcutHint({
  keys,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> & {
  /** One Kbd per entry, in order: `['⌘', '↵']`. */
  keys: string[]
}) {
  return (
    <span
      data-slot="shortcut-hint"
      className={cn(
        'inline-flex items-center gap-1.5 type-text-xs-normal whitespace-nowrap text-muted-foreground',
        className,
      )}
      {...props}
    >
      <KbdGroup aria-hidden>
        {keys.map((key) => (
          <Kbd key={key}>{key}</Kbd>
        ))}
      </KbdGroup>
      {children}
    </span>
  )
}

export { ShortcutHint }
