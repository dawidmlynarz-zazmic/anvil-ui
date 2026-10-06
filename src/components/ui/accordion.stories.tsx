import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Button } from './button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronsUpDownIcon, Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-92'
const FIGMA_ITEM = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-91'
const ITEMS = [
  {
    title: 'What can the assistant access?',
    body: 'Only the apps you connect in Settings: Calendar, Drive and Mail for this workspace.',
  },
  {
    title: 'How is my data used?',
    body: 'Your files and messages answer your requests. They are not used to train models.',
  },
  {
    title: 'Can I undo an action?',
    body: 'Drafts and edits can be undone. Sent emails and deleted files can’t, so I ask first.',
  },
]

type DemoProps = {
  /** Radix `type`: one item open at a time, or several. */
  type?: 'single' | 'multiple'
  /** Radix `collapsible` (single only): the open item can be closed. */
  collapsible?: boolean
  disabledItem?: boolean
}

function DemoAccordion({ type = 'single', collapsible = true, disabledItem = false }: DemoProps) {
  const items = ITEMS.map(({ title, body }, i) => (
    <AccordionItem key={title} value={String(i + 1)} disabled={disabledItem && i === ITEMS.length - 1}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>{body}</AccordionContent>
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
  title: 'Design System/Molecules/Accordion',
  tags: ['molecule'],
  component: DemoAccordion,
  parameters: {
    shadcn: 'accordion',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // Figma `accordion` has no properties; the rows are its `accordion item`.
    figmaProps: [
      { property: 'accordion item · title', values: 'text', code: '`AccordionTrigger` children' },
      { property: 'accordion item · body', values: 'text', code: '`AccordionContent` children' },
      {
        property: 'accordion item · open',
        values: 'false · true',
        code: 'Radix `value` / `defaultValue` on `Accordion` (selector `data-[state=open]:`)',
      },
      {
        property: 'accordion item · state',
        values: 'default · hover · focus',
        code: 'selectors: `hover:` · `focus-visible:` (not a prop)',
      },
    ],
    guide: {
      use: [
        'Long, scannable content where people need one or two sections at a time: FAQs, settings help, grouped tool details.',
        '`type="multiple"` when sections are independent and people compare them; `single` when only one matters at a time.',
        'A single expandable section (e.g. “3 sources used”) is Collapsible, not a one-item Accordion.',
      ],
      avoid: [
        'Switching between peer views of the same object: use Tabs.',
        'Content people must read to proceed (warnings, required fields): keep it visible or use Alert.',
        'Navigation menus: use Sidebar or Dropdown Menu.',
      ],
      content: [
        'Triggers are short questions or nouns that predict the content (“How is my data used?”).',
        'Keep each panel to a few sentences; link out for anything longer.',
      ],
      a11y: [
        'Triggers are buttons with `aria-expanded`; Enter and Space toggle, arrow keys move between triggers.',
        'Don’t hide the only copy of critical information in a closed section.',
        'Collapsible icon-only triggers need an `aria-label` that says what they reveal.',
      ],
    },
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
    collapsible: { control: 'boolean', if: { arg: 'type', eq: 'single' } },
    disabledItem: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('one item open at a time; Enter toggles', async ({ canvas }) => {
  const first = canvas.getByRole('button', { name: ITEMS[0].title })
  const second = canvas.getByRole('button', { name: ITEMS[1].title })
  await expect(first).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(second)
  await expect(second).toHaveAttribute('aria-expanded', 'true')
  await expect(first).toHaveAttribute('aria-expanded', 'false')
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(second).toHaveAttribute('aria-expanded', 'false'))
})

Default.test('arrow keys move between triggers', async ({ canvas }) => {
  canvas.getByRole('button', { name: ITEMS[0].title }).focus()
  await userEvent.keyboard('{ArrowDown}')
  await expect(canvas.getByRole('button', { name: ITEMS[1].title })).toHaveFocus()
})

/** type="multiple": several items open at once. */
export const Multiple = meta.story({ args: { type: 'multiple' } })

Multiple.test('opening one keeps the others open', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: ITEMS[1].title }))
  await expect(canvas.getByRole('button', { name: ITEMS[0].title })).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByRole('button', { name: ITEMS[1].title })).toHaveAttribute('aria-expanded', 'true')
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
                {ITEMS[i].title}
              </AccordionTrigger>
              <AccordionContent>{ITEMS[i].body}</AccordionContent>
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
            <span className="type-text-sm-medium">3 sources used</span>
            <CollapsibleTrigger asChild>
              <Button size="icon-sm" variant="ghost" intent="neutral" aria-label="Show all sources">
                <Icon icon={ChevronsUpDownIcon} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border border-border px-4 py-2 type-text-sm-normal">
            marketpulse.example
          </div>
          <CollapsibleContent className="flex flex-col gap-2">
            <div className="rounded-md border border-border px-4 py-2 type-text-sm-normal">
              devsurvey.example
            </div>
            <div className="rounded-md border border-border px-4 py-2 type-text-sm-normal">
              analyticsweekly.example
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }
    return <Demo />
  },
})

CollapsibleSection.test('the trigger shows and hides the content', async ({ canvas }) => {
  const trigger = canvas.getByRole('button', { name: 'Show all sources' })
  await expect(canvas.queryByText('devsurvey.example')).toBeNull()
  await userEvent.click(trigger)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByText('devsurvey.example')).toBeVisible()
})
