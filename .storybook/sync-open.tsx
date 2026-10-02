import { useState, type ReactNode } from 'react'
import type { Decorator } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

/**
 * Overlays (Dialog, Sheet, Popover, Select, Dropdown Menu, Tooltip, Combobox…): when a story has a
 * boolean `open` arg, the component is controlled by it and every open / close (trigger, Escape,
 * outside click) writes back to the arg, so the `open` control always shows the real state.
 * React state mirrors the arg so it also works where args can't be updated (Vitest).
 */
function OpenState({
  openArg,
  onChange,
  children,
}: {
  openArg: boolean
  onChange: (open: boolean) => void
  children: (open: boolean, setOpen: (open: boolean) => void) => ReactNode
}) {
  const [state, setState] = useState({ open: openArg, arg: openArg })
  // The control changed: follow it (state adjusted during render, not in an effect).
  if (state.arg !== openArg) setState({ open: openArg, arg: openArg })
  return children(state.open, (next) => {
    setState({ open: next, arg: openArg })
    onChange(next)
  })
}

export const withSyncedOpen: Decorator = (Story, context) => {
  // Storybook hooks belong in decorators (not React components), which the React rule can't tell.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [, updateArgs] = useArgs()
  const { open: openArg, onOpenChange } = context.args as {
    open?: unknown
    onOpenChange?: (open: boolean) => void
  }
  if (typeof openArg !== 'boolean') return <Story />
  return (
    <OpenState
      openArg={openArg}
      onChange={(next) => {
        onOpenChange?.(next)
        updateArgs({ open: next })
      }}
    >
      {(open, setOpen) => <Story args={{ ...context.args, open, onOpenChange: setOpen }} />}
    </OpenState>
  )
}
