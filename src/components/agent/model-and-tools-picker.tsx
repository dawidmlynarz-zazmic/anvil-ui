import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from '@/components/ui/combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/components/ui/command'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Icon,
  PlugIcon,
  SlidersHorizontalIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

// Figma Agent Builder › Core Kit › Shell · model and tools picker (10727:2275): which model answers
// and which tools it may use in this chat. Built on Popover + Command (Figma: "Built on shadcn/ui:
// Popover + Command"), nothing re-drawn:
// - Triggers: the current model (Button outline sm with a chevron) and "Tools · n" (Button ghost sm,
//   sliders icon). Both open the same popover, anchored to the pair; focus returns to the one used.
// - Popover: 320px, radius xl, 8px padding. "Model" heading (text/xs/medium muted), then the models
//   as a Command list (title text/sm/medium + description text/xs muted, check on the current one).
//   Figma state search models = `searchModels`: the library Combobox (search, grouped by `group`)
//   for long lists.
// - Separator, "Tools" heading, one Field (horizontal) per tool: glyph, FieldLabel +
//   FieldDescription, Switch (Figma "tools use the toggle from Controls").
// - Connectors: a ghost row button with a plug glyph, an outline xs Badge ("3 connected") and a
//   chevron, when `onConnectorsClick` is set.
// Figma state closed · open → `open` (Radix). Figma draws shadow/lg; popovers use elevation/raised.

type PickerModel = {
  value: string
  label: string
  description?: string
  /** Search mode only: the group heading, e.g. the provider. */
  group?: string
}

type PickerTool = {
  value: string
  label: string
  description?: string
  icon: LucideIcon
}

const sectionLabel = 'px-2 py-1.5 type-text-xs-medium text-muted-foreground'

function ModelAndToolsPicker({
  models,
  model,
  defaultModel,
  onModelChange,
  searchModels = false,
  tools = [],
  enabledTools,
  defaultEnabledTools = [],
  onEnabledToolsChange,
  connectors,
  onConnectorsClick,
  open,
  defaultOpen,
  onOpenChange,
  onOpenAutoFocus,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  models: PickerModel[]
  /** The current model's `value`. */
  model?: string
  defaultModel?: string
  onModelChange?: (value: string) => void
  /** Figma state search models: a searchable Combobox instead of the list (long lists). */
  searchModels?: boolean
  tools?: PickerTool[]
  /** The `value`s of the tools that are on. */
  enabledTools?: string[]
  defaultEnabledTools?: string[]
  onEnabledToolsChange?: (values: string[]) => void
  /** The connectors badge, e.g. "3 connected". */
  connectors?: React.ReactNode
  /** Shows the Connectors row; opens the connector settings. */
  onConnectorsClick?: () => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Radix: prevent it to keep focus on the trigger (e.g. a story that opens on load). */
  onOpenAutoFocus?: React.ComponentProps<typeof PopoverContent>['onOpenAutoFocus']
}) {
  const [innerModel, setInnerModel] = React.useState(defaultModel ?? models[0]?.value)
  const [innerTools, setInnerTools] = React.useState(defaultEnabledTools)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const current = model ?? innerModel
  const enabled = enabledTools ?? innerTools
  const currentModel = models.find((m) => m.value === current)
  const id = React.useId()
  // Both triggers open one popover; Radix returns focus to one trigger, so remember the one used.
  const lastTrigger = React.useRef<HTMLButtonElement | null>(null)
  const remember = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    lastTrigger.current = event.currentTarget
  }

  const pick = (value: string) => {
    setInnerModel(value)
    onModelChange?.(value)
  }
  const toggle = (value: string, on: boolean) => {
    const next = on ? [...enabled, value] : enabled.filter((v) => v !== value)
    setInnerTools(next)
    onEnabledToolsChange?.(next)
  }
  // Search mode: the models by `group`, in first-seen order.
  const groups = models.reduce<[string, PickerModel[]][]>((acc, m) => {
    const key = m.group ?? ''
    const found = acc.find(([g]) => g === key)
    if (found) found[1].push(m)
    else acc.push([key, [m]])
    return acc
  }, [])

  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div
          data-slot="model-and-tools-picker"
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              intent="neutral"
              size="sm"
              onPointerDown={remember}
              onKeyDown={remember}
            >
              {currentModel?.label ?? 'Choose a model'}
              <Icon icon={ChevronDownIcon} />
            </Button>
          </PopoverTrigger>
          {tools.length > 0 && (
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                intent="neutral"
                size="sm"
                onPointerDown={remember}
                onKeyDown={remember}
              >
                <Icon icon={SlidersHorizontalIcon} />
                Tools · {enabled.length}
              </Button>
            </PopoverTrigger>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        aria-label="Model and tools"
        onOpenAutoFocus={onOpenAutoFocus}
        className="w-80 gap-0 rounded-xl p-2"
        onCloseAutoFocus={(event) => {
          if (!lastTrigger.current) return
          event.preventDefault()
          lastTrigger.current.focus()
        }}
      >
        {searchModels ? (
          <div className="flex flex-col gap-1">
            <div aria-hidden className={sectionLabel}>
              Model
            </div>
            <Combobox open={searchOpen} onOpenChange={setSearchOpen}>
              <ComboboxTrigger placeholder="Select a model…" aria-label="Model">
                {currentModel?.label}
              </ComboboxTrigger>
              <ComboboxContent>
                <Command>
                  <CommandInput placeholder="Search models…" />
                  <CommandList>
                    <CommandEmpty>No models found.</CommandEmpty>
                    {groups.map(([group, items]) => (
                      <CommandGroup key={group} heading={group || undefined}>
                        {items.map((m) => (
                          <ComboboxItem
                            key={m.value}
                            value={m.label}
                            selected={m.value === current}
                            onSelect={() => {
                              pick(m.value)
                              setSearchOpen(false)
                            }}
                          >
                            {m.label}
                          </ComboboxItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </ComboboxContent>
            </Combobox>
          </div>
        ) : (
          <Command className="bg-transparent" aria-label="Model">
            <CommandList className="max-h-none overflow-visible">
              <CommandGroup
                heading="Model"
                className="p-0 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5"
              >
                {models.map((m) => (
                  <ComboboxItem
                    key={m.value}
                    value={m.value}
                    keywords={[m.label]}
                    selected={m.value === current}
                    onSelect={() => pick(m.value)}
                    className="h-auto items-start py-2 [&>svg]:mt-0.5"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="type-text-sm-medium">{m.label}</span>
                      {m.description && (
                        <span className="type-text-xs-normal text-muted-foreground">{m.description}</span>
                      )}
                    </span>
                  </ComboboxItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
        {(tools.length > 0 || onConnectorsClick) && (
          <>
            <Separator className="my-1.5" />
            <div className={sectionLabel}>Tools</div>
            {tools.map((tool) => {
              const toolId = `${id}-${tool.value}`
              return (
                <Field
                  key={tool.value}
                  orientation="horizontal"
                  className="gap-2.5 rounded-md p-2 has-[>[data-slot=field-content]]:items-center"
                >
                  <Icon icon={tool.icon} />
                  <FieldContent className="gap-0">
                    <FieldLabel htmlFor={toolId} className="type-text-sm-medium">
                      {tool.label}
                    </FieldLabel>
                    {tool.description && (
                      <FieldDescription className="type-text-xs-normal">{tool.description}</FieldDescription>
                    )}
                  </FieldContent>
                  <Switch
                    id={toolId}
                    checked={enabled.includes(tool.value)}
                    onCheckedChange={(on) => toggle(tool.value, on)}
                  />
                </Field>
              )
            })}
            {onConnectorsClick && (
              <Button
                variant="ghost"
                intent="neutral"
                onClick={onConnectorsClick}
                className="h-auto w-full justify-start gap-2.5 p-2 type-text-sm-medium"
              >
                <Icon icon={PlugIcon} />
                <span className="flex-1 text-left">Connectors</span>
                {connectors && (
                  <Badge variant="outline" size="xs">
                    {connectors}
                  </Badge>
                )}
                <Icon icon={ChevronRightIcon} />
              </Button>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { ModelAndToolsPicker, type PickerModel, type PickerTool }
