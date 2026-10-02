import { Toaster as Sonner, type ToasterProps } from 'sonner'

import {
  CircleCheckIcon,
  Icon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from '@/components/ui/icon'

// shadcn/ui Sonner (Toast), unchanged except for two adaptations:
// - `theme` is a prop (default "system") instead of next-themes' useTheme(); the Anvil theme is the
//   `.dark` class on <html>, so pass `theme="dark"` / `"light"` from wherever it is set.
// - Icons go through the Anvil Icon component.
// Restyled to the Figma Toast (8208:12599) in its own Step 4 PR.
const Toaster = ({ theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <Icon icon={CircleCheckIcon} />,
        info: <Icon icon={InfoIcon} />,
        warning: <Icon icon={TriangleAlertIcon} />,
        error: <Icon icon={OctagonXIcon} />,
        loading: <Icon icon={Loader2Icon} className="animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
