import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Button } from './button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronsUpDownIcon, Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-92'
const FIGMA_ITEM = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-91'
const ITEMS = ['Label 1', 'Label 2', 'Label 3']

type DemoProps = {
  /** Radix `type`: one item open at a time, or several. */
  type?: 'single' | 'multiple'
  /** Radix `collapsible` (single only): the open item can be closed. */
  collapsible?: boolean
  disabledItem?: boolean
}

function DemoAccordion({ type = 'single', collapsible = true, disabledItem = false }: DemoProps) {
  const items = ITEMS.map((label, i) => (
    <AccordionItem key={label} value={String(i + 1)} disabled={disabledItem && i === ITEMS.length - 1}>
      <AccordionTrigger>{label}</AccordionTrigger>
      <AccordionContent>Subtitle {i + 1}</AccordionContent>
    </AccordionItem>
  ))
  return type === 'multiple' ? (
    <Accordion type="multiple" defaultValue={['1']} className="w-120">
      {items}
    </Accordion>
  ) : (
    <Accordion type="single" collapsible={collapsible} defaultValue="1" className="w-120">
      {items}
    </Accordion>
  )
}

const meta = preview.meta({
  title: 'Components/Accordion',
  component: DemoAccordion,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Stacked sections that expand and collapse (shadcn/ui Accordion on Radix). Figma `accordion`: three items, the first open. `type` single (one open at a time) or multiple; `collapsible` lets the open item close. The trigger title underlines on hover and the chevron flips when open. A single item used alone is a Collapsible.',
      },
    },
  },
  args: { type: 'single', collapsible: true, disabledItem: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    collapsible: { if: { arg: 'type', eq: 'single' } },
  },
})

export const Default = meta.story()

Default.test('one item open at a time; Enter toggles', async ({ canvas }) => {
  const first = canvas.getByRole('button', { name: 'Label 1' })
  const second = canvas.getByRole('button', { name: 'Label 2' })
  await expect(first).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(second)
  await expect(second).toHaveAttribute('aria-expanded', 'true')
  await expect(first).toHaveAttribute('aria-expanded', 'false')
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(second).toHaveAttribute('aria-expanded', 'false'))
})

Default.test('arrow keys move between triggers', async ({ canvas }) => {
  canvas.getByRole('button', { name: 'Label 1' }).focus()
  await userEvent.keyboard('{ArrowDown}')
  await expect(canvas.getByRole('button', { name: 'Label 2' })).toHaveFocus()
})

/** type="multiple": several items open at once. */
export const Multiple = meta.story({ args: { type: 'multiple' } })

Multiple.test('opening one keeps the others open', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Label 2' }))
  await expect(canvas.getByRole('button', { name: 'Label 1' })).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByRole('button', { name: 'Label 2' })).toHaveAttribute('aria-expanded', 'true')
})

/** Figma accordion item: open × default · hover · focus (reference; use the State control on Default). */
export const ItemStates = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_ITEM } },
  render: () => (
    <div className="grid w-260 grid-cols-3 gap-x-10 gap-y-6">
      {[undefined, '1'].map((open) =>
        (['default', 'hover', 'focus-visible'] as const).map((state, i) => (
          <Accordion key={`${open}-${state}`} type="single" collapsible defaultValue={open}>
            <AccordionItem value="1">
              <AccordionTrigger className={state === 'default' ? undefined : `pseudo-${state}`}>
                Label {open ? i + 4 : i + 1}
              </AccordionTrigger>
              <AccordionContent>Subtitle</AccordionContent>
            </AccordionItem>
          </Accordion>
        )),
      )}
    </div>
  ),
})

/** Collapsible (shadcn/ui on Radix): one section, unstyled; bring your own trigger. */
export const CollapsibleSection = meta.story({
  name: 'Collapsible',
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false)
      return (
        <Collapsible open={open} onOpenChange={setOpen} className="flex w-80 flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="type-text-sm-medium">Title</span>
            <CollapsibleTrigger asChild>
              <Button size="icon-sm" variant="ghost" intent="neutral" aria-label="Label">
                <Icon icon={ChevronsUpDownIcon} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border border-border px-4 py-2 type-text-sm-normal">Value 1</div>
          <CollapsibleContent className="flex flex-col gap-2">
            <div className="rounded-md border border-border px-4 py-2 type-text-sm-normal">Value 2</div>
            <div className="rounded-md border border-border px-4 py-2 type-text-sm-normal">Value 3</div>
          </CollapsibleContent>
        </Collapsible>
      )
    }
    return <Demo />
  },
})

CollapsibleSection.test('the trigger shows and hides the content', async ({ canvas }) => {
  const trigger = canvas.getByRole('button', { name: 'Label' })
  await expect(canvas.queryByText('Value 2')).toBeNull()
  await userEvent.click(trigger)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByText('Value 2')).toBeVisible()
})
