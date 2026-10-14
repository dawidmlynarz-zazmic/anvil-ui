import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckIcon, CopyIcon, Icon } from '@/components/ui/icon'

// Figma Code block page (10671:2535): a monospace viewer for payloads, tool arguments, commands and
// snippets. shadcn has no primitive (Typography: `<pre>`), so this is a `<pre>` on tokens.
// - `size` compact (the code alone, 12px padding) · default (adds a header: the `language` on the left,
//   a Copy button on the right, a --border divider).
// - `theme` default (--background, --border stroke) · terminal (--background-inverse, --foreground-inverse)
//   · terminal-error (the same dark block with --danger-soft text; Figma “terminal error”), for commands,
//   queries and output. Radius --radius (8px).
// - Code is code/xs (12px / 16px) in --font-mono: Figma draws 13px / 20px, which has no text style; the
//   Content Block `pre` uses the same step. Long lines scroll sideways, and the block is focusable so
//   keyboard users can scroll it.
// - Copy writes `code` to the clipboard, shows “Copied” for 2 seconds and calls `onCopy`.
// - Terminal header: Figma draws it light even on the dark block; here it is dark with an inverse divider
//   (flagged in docs/component-status.md).

const codeBlockVariants = cva('flex w-full flex-col overflow-hidden rounded-lg', {
  variants: {
    theme: {
      default: 'border bg-background text-foreground',
      terminal: 'bg-background-inverse text-foreground-inverse',
      'terminal-error': 'bg-background-inverse text-danger-soft',
    },
  },
  defaultVariants: { theme: 'default' },
})

function CodeBlock({
  code,
  language,
  size = 'compact',
  theme = 'default',
  copyLabel = 'Copy code',
  copiedLabel = 'Copied',
  onCopy,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  code: string
  /** Shown in the header (default size): “json”, “bash”. */
  language?: string
  size?: 'compact' | 'default'
  theme?: 'default' | 'terminal' | 'terminal-error'
  copyLabel?: string
  copiedLabel?: string
  onCopy?: (code: string) => void
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const copy = () => {
    // Clipboard access can be blocked (insecure context, permissions): still confirm and report.
    navigator.clipboard?.writeText(code).catch(() => {})
    onCopy?.(code)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }
  const dark = theme !== 'default'
  return (
    <div
      data-slot="code-block"
      data-size={size}
      data-theme={theme}
      className={cn(codeBlockVariants({ theme }), className)}
      {...props}
    >
      {size === 'default' && (
        <div
          data-slot="code-block-header"
          className={cn(
            'flex items-center justify-between gap-2 border-b px-3 py-2',
            dark && 'border-overlay-inverse-16',
          )}
        >
          <span
            className={cn(
              'type-text-xs-normal',
              dark ? 'text-foreground-inverse/70' : 'text-muted-foreground',
            )}
          >
            {language}
          </span>
          <Button
            variant="ghost"
            intent={dark ? 'inverse' : 'neutral'}
            size="icon-xs"
            aria-label={copied ? copiedLabel : copyLabel}
            onClick={copy}
          >
            <Icon icon={copied ? CheckIcon : CopyIcon} />
          </Button>
        </div>
      )}
      {/* The block scrolls sideways; focusable so the keyboard can reach it. */}
      <pre
        data-slot="code-block-body"
        tabIndex={0}
        className="overflow-x-auto p-3 type-code-xs outline-none focus-visible:focus-ring focus-visible:ring-inset focus-visible:ring-offset-0"
      >
        <code>{code}</code>
      </pre>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </div>
  )
}

export { CodeBlock, codeBlockVariants }
