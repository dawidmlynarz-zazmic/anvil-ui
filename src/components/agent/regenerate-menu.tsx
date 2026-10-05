import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BriefcaseIcon,
  CommandIcon,
  CpuIcon,
  Icon,
  Maximize2Icon,
  Minimize2Icon,
  RotateCcwIcon,
  SmileIcon,
  SparklesIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'

// Figma Agent Builder › Core Kit › regenerate menu (10728:2250), built on Dropdown Menu: opened from
// the retry action. Try again (⌘R), "Modify response" — shorter, longer, simpler, more formal, more
// casual — then Switch model (submenu of the models you pass). 260px, radius xl, 6px padding
// (Figma), elevation/raised (Figma shadow/lg). Items are Dropdown Menu items (16px icons).

type Modification = 'shorter' | 'longer' | 'simpler' | 'formal' | 'casual'

const MODIFICATIONS: { value: Modification; label: string; icon: LucideIcon }[] = [
  { value: 'shorter', label: 'Shorter', icon: Minimize2Icon },
  { value: 'longer', label: 'Longer', icon: Maximize2Icon },
  { value: 'simpler', label: 'Simpler', icon: SparklesIcon },
  { value: 'formal', label: 'More formal', icon: BriefcaseIcon },
  { value: 'casual', label: 'More casual', icon: SmileIcon },
]

const RegenerateMenu = DropdownMenu
const RegenerateMenuTrigger = DropdownMenuTrigger

function RegenerateMenuContent({
  onTryAgain,
  onModify,
  models,
  model,
  onModelChange,
  className,
  align = 'start',
  ...props
}: React.ComponentProps<typeof DropdownMenuContent> & {
  onTryAgain?: () => void
  onModify?: (modification: Modification) => void
  /** Models for the Switch model submenu; omit to hide it. */
  models?: { value: string; label: string }[]
  /** The current model. */
  model?: string
  onModelChange?: (model: string) => void
}) {
  return (
    <DropdownMenuContent
      data-slot="regenerate-menu"
      align={align}
      className={cn('w-65 rounded-xl p-1.5', className)}
      {...props}
    >
      <DropdownMenuItem onSelect={onTryAgain}>
        <Icon icon={RotateCcwIcon} />
        Try again
        <Kbd className="ms-auto">
          <Icon icon={CommandIcon} />R
        </Kbd>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Modify response</DropdownMenuLabel>
      {MODIFICATIONS.map(({ value, label, icon }) => (
        <DropdownMenuItem key={value} onSelect={() => onModify?.(value)}>
          <Icon icon={icon} />
          {label}
        </DropdownMenuItem>
      ))}
      {models && models.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon icon={CpuIcon} />
              Switch model
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-xl p-1.5">
              <DropdownMenuRadioGroup value={model} onValueChange={onModelChange}>
                {models.map((m) => (
                  <DropdownMenuRadioItem key={m.value} value={m.value}>
                    {m.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </>
      )}
    </DropdownMenuContent>
  )
}

export { RegenerateMenu, RegenerateMenuTrigger, RegenerateMenuContent, type Modification }
