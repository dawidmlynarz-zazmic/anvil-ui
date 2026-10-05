import { cn } from '@/lib/utils'

import { Icon, LoaderCircleIcon, type IconProps } from '@/components/ui/icon'

// shadcn Spinner on the Anvil Icon (Lucide loader-circle, 1.33px stroke): `size` xs · default and
// `tone` come from Icon. Figma has no spinner component; Core Kit's pulse dot and typing indicator
// are "built on Spinner" (they keep its role="status" + label).
function Spinner({ className, ...props }: Omit<IconProps, 'icon'>) {
  return (
    <Icon
      icon={LoaderCircleIcon}
      label="Loading"
      role="status"
      className={cn('animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
