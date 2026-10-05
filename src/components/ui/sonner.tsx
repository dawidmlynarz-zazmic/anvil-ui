import { Toaster as Sonner, type ToasterProps } from 'sonner'

import {
  CircleCheckIcon,
  CircleXIcon,
  Icon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon,
} from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Toast page → `toast` (1247:14805). shadcn/ui Sonner, two adaptations kept from before:
// `theme` is a prop (default "system") instead of next-themes, and icons go through Icon.
// Sonner runs unstyled (it keeps positioning, stacking, swipe and timing); Anvil draws the toast:
// - `variant` compact (no description): 322px solid surface by `tone` — neutral
//   --background-inverse, success --success, destructive --danger — icon + message (text/xs),
//   an outline action (xs) and a close (icon-xs) in the surface's own color.
// - `variant` extended (with a description): 360px --background card, --overlay-8 stroke; icon in
//   a bordered tile tinted by `tone`, title (text/sm/semibold) + description (text/xs muted), then
//   cancel (outline · neutral, sm) and action (default · neutral, sm); close top right.
// `tone` is the Sonner type: toast() / info / warning / loading → neutral, success → success,
// error → destructive. Radius lg, shadow/xl.

const toastClassNames: NonNullable<ToasterProps['toastOptions']>['classNames'] = {
  toast: cn(
    'group/toast pointer-events-auto rounded-lg font-sans shadow-xl outline-none focus-visible:focus-ring',
    // compact
    'toast-compact:flex toast-compact:w-80.5 toast-compact:items-center toast-compact:gap-2 toast-compact:px-3 toast-compact:py-2',
    'toast-compact:bg-background-inverse toast-compact:text-foreground-inverse',
    'toast-compact:data-[type=success]:bg-success toast-compact:data-[type=success]:text-success-foreground',
    'toast-compact:data-[type=error]:bg-danger toast-compact:data-[type=error]:text-danger-foreground',
    // extended: icon | text spanning | close, buttons under the text
    'toast-extended:grid toast-extended:w-90 toast-extended:grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] toast-extended:gap-x-3 toast-extended:p-3',
    'toast-extended:bg-background toast-extended:text-foreground toast-extended:inset-ring toast-extended:inset-ring-overlay-8',
  ),
  icon: cn(
    "flex shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
    'toast-extended:col-start-1 toast-extended:row-span-2 toast-extended:row-start-1 toast-extended:size-8 toast-extended:self-start toast-extended:rounded-sm toast-extended:inset-ring toast-extended:inset-ring-border',
    'toast-extended:group-data-[type=success]/toast:text-success toast-extended:group-data-[type=error]/toast:text-destructive',
    'toast-extended:group-data-[type=info]/toast:text-info toast-extended:group-data-[type=warning]/toast:text-warning',
  ),
  content: cn(
    'flex min-w-0 flex-col gap-1',
    'toast-compact:mr-2 toast-compact:flex-1',
    'toast-extended:col-start-2 toast-extended:col-end-5 toast-extended:row-start-1',
  ),
  title: cn('toast-compact:type-text-xs-normal', 'toast-extended:type-text-sm-semibold'),
  description: 'type-text-xs-normal text-muted-foreground',
  actionButton: cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none select-none type-text-xs-semibold',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:focus-ring',
    // compact: outline in the surface color (Figma: --overlay-inverse-32 stroke on the solid tone)
    'toast-compact:h-6 toast-compact:rounded-sm toast-compact:bg-transparent toast-compact:px-2 toast-compact:text-current toast-compact:inset-ring toast-compact:inset-ring-current/32 toast-compact:hover:bg-current/16',
    // extended: Button default · neutral · sm, after the cancel when there is one
    'toast-extended:col-start-2 toast-extended:row-start-2 toast-extended:mt-2.5 toast-extended:h-8 toast-extended:justify-self-start toast-extended:rounded-md toast-extended:px-3',
    'toast-extended:bg-button-neutral toast-extended:text-button-neutral-foreground toast-extended:hover:bg-button-neutral-hover',
    'toast-extended:[[data-cancel]~&]:col-start-3 toast-extended:[[data-cancel]~&]:-ml-1',
  ),
  cancelButton: cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none select-none type-text-xs-semibold',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:focus-ring',
    'h-8 rounded-md px-3 bg-button-outline text-button-outline-foreground inset-ring inset-ring-overlay-16 hover:bg-button-outline-hover',
    'toast-compact:h-6 toast-compact:rounded-sm toast-compact:px-2 toast-compact:bg-transparent toast-compact:text-current toast-compact:inset-ring-current/32 toast-compact:hover:bg-current/16',
    'toast-extended:col-start-2 toast-extended:row-start-2 toast-extended:mt-2.5',
  ),
  // Sonner's own `[data-sonner-theme] [data-sonner-toast] [data-close-button]` rule paints the close
  // button even when unstyled, so its surface utilities are important.
  closeButton: cn(
    'inline-flex size-6 shrink-0 items-center justify-center rounded-sm border-0! bg-transparent! text-current! outline-none',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:focus-ring',
    'toast-compact:order-last toast-compact:hover:bg-current/16!',
    'toast-extended:col-start-5 toast-extended:row-start-1 toast-extended:self-start toast-extended:text-foreground! toast-extended:hover:bg-button-outline-hover!',
  ),
}

const Toaster = ({
  theme = 'system',
  closeButton = true,
  toastOptions,
  className,
  style,
  ...props
}: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      closeButton={closeButton}
      className={cn('toaster group z-(--z-toast)!', className)}
      icons={{
        success: <Icon icon={CircleCheckIcon} />,
        info: <Icon icon={InfoIcon} />,
        warning: <Icon icon={TriangleAlertIcon} />,
        error: <Icon icon={CircleXIcon} />,
        loading: <Icon icon={Loader2Icon} className="animate-spin" />,
        close: <Icon icon={XIcon} size="xs" />,
      }}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: { ...toastClassNames, ...toastOptions?.classNames },
      }}
      // Sonner lays the stack out at --width; extended toasts are the widest (360).
      style={{ '--width': 'calc(var(--spacing) * 90)', ...style } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster }
