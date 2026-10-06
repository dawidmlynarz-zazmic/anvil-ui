import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

function MessageBubbleGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-bubble-group"
      className={cn('flex min-w-0 flex-col gap-2', className)}
      {...props}
    />
  )
}

// shadcn Bubble, named Message Bubble in Anvil (reactions removed: the kit has none).
// Figma Agent Builder › message row draws the bubble: user = muted, assistant = ghost (plain
// text), failed send = muted + danger border (`aria-invalid`). The other variants keep shadcn's
// set, mapped to Anvil tokens.
const messageBubbleVariants = cva(
  'group/message-bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full',
  {
    variants: {
      variant: {
        default:
          '*:data-[slot=message-bubble-content]:bg-primary *:data-[slot=message-bubble-content]:text-primary-foreground [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-button-primary-hover',
        secondary:
          '*:data-[slot=message-bubble-content]:bg-secondary *:data-[slot=message-bubble-content]:text-secondary-foreground [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-accent',
        muted:
          '*:data-[slot=message-bubble-content]:bg-muted *:data-[slot=message-bubble-content]:text-foreground [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-accent',
        tinted:
          '*:data-[slot=message-bubble-content]:bg-agent-subtle *:data-[slot=message-bubble-content]:text-foreground [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-agent-soft',
        outline:
          '*:data-[slot=message-bubble-content]:border-border *:data-[slot=message-bubble-content]:bg-background *:data-[slot=message-bubble-content]:text-foreground [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-button-outline-hover',
        ghost:
          'border-none *:data-[slot=message-bubble-content]:rounded-none *:data-[slot=message-bubble-content]:bg-transparent *:data-[slot=message-bubble-content]:p-0 *:data-[slot=message-bubble-content]:text-foreground [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-accent',
        destructive:
          '*:data-[slot=message-bubble-content]:bg-danger-subtle *:data-[slot=message-bubble-content]:text-danger-medium [&>[data-slot=message-bubble-content]:is(button,a):hover]:bg-danger-soft',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function MessageBubble({
  variant = 'default',
  align = 'start',
  className,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof messageBubbleVariants> & {
    align?: 'start' | 'end'
  }) {
  return (
    <div
      data-slot="message-bubble"
      data-variant={variant}
      data-align={align}
      className={cn(messageBubbleVariants({ variant }), className)}
      {...props}
    />
  )
}

function MessageBubbleContent({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      data-slot="message-bubble-content"
      className={cn(
        'w-fit max-w-full min-w-0 overflow-hidden rounded-2xl border border-transparent px-4 py-2 type-text-sm-normal wrap-break-word group-data-[align=end]/bubble:self-end aria-invalid:border-danger [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:focus-ring',
        className,
      )}
      {...props}
    />
  )
}

export { MessageBubbleGroup, MessageBubble, MessageBubbleContent }
