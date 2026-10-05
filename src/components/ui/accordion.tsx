import * as React from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { ChevronDownIcon, Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Accordion page → `accordion item` (10946:91) and `accordion` (10946:92). One section per
// item with a --border rule below every item (the last one too, as drawn). Trigger: padding 16 / 0,
// gap 16, text/sm/medium --foreground, 16px chevron (--muted-foreground) that flips when open.
// Content: text/sm/normal --muted-foreground, 16px bottom padding. `state` → selectors: hover →
// underline, focus → focus-visible: (focus/ring), open → data-[state=open]; disabled is not drawn
// (CLAUDE.md gaps) → 50%. `type` single · multiple and `collapsible` are Radix root props.

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-border', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-start justify-between gap-4 rounded-sm py-4 text-left type-text-sm-medium text-foreground outline-none hover:underline focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          icon={ChevronDownIcon}
          className="translate-y-0.5 text-muted-foreground transition-transform duration-(--duration-base)"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden type-text-sm-normal text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
