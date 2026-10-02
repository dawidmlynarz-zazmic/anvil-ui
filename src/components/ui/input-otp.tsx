import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'

import { Icon, MinusIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Forms page → `input otp` (10855:5813). One-time code entry: separate 40×48 slots, 8px apart,
// radius md, --input stroke, digits in heading/xl. Figma `state` → selectors: the active slot gets a
// 2px --ring stroke (data-active); invalid (aria-invalid on InputOTP or a slot) a 2px --danger
// stroke on every slot; disabled 50%. Error keeps the digits; put the message in a Field under it.

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'group/input-otp flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-otp-group" className={cn('flex items-center gap-2', className)} {...props} />
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'relative flex h-12 w-10 items-center justify-center rounded-md bg-background type-heading-xl text-foreground outline-none',
        'inset-ring inset-ring-input transition-[box-shadow] duration-(--duration-fast) ease-out',
        'data-[active=true]:z-10 data-[active=true]:inset-ring-2 data-[active=true]:inset-ring-ring',
        'aria-invalid:inset-ring-2 aria-invalid:inset-ring-danger group-has-[input[aria-invalid=true]]/input-otp:inset-ring-2 group-has-[input[aria-invalid=true]]/input-otp:inset-ring-danger',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" className="text-foreground-subtle" {...props}>
      <Icon icon={MinusIcon} />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
