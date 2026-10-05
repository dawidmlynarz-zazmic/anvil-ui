import preview from '#.storybook/preview'
import { Fragment } from 'react'
import { expect } from 'storybook/test'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb'
import { Button } from './button'
import { BotIcon, ChevronLeftIcon, Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=6223-29124'

type DemoProps = {
  /** Figma `back`, `level 3`, `active`: render or omit the part. */
  back?: boolean
  avatar?: boolean
  levels?: 1 | 2 | 3
  current?: boolean
}

function DemoBreadcrumb({ back = false, avatar = true, levels = 2, current = true }: DemoProps) {
  const crumbs = ['Label 1', 'Label 2', 'Label 3'].slice(0, levels)
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {back && (
          <BreadcrumbItem>
            <Button size="icon-xs" variant="ghost" intent="neutral" aria-label="Back">
              <Icon icon={ChevronLeftIcon} />
            </Button>
          </BreadcrumbItem>
        )}
        {crumbs.map((label, i) => (
          <Fragment key={label}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {i === 0 && avatar && (
                <span
                  className="flex size-6 items-center justify-center rounded-sm bg-agent-subtle text-agent"
                  aria-hidden
                >
                  <Icon icon={BotIcon} />
                </span>
              )}
              <BreadcrumbLink href={`#${i + 1}`}>{label}</BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        {current && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Label</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

const meta = preview.meta({
  title: 'Components/Breadcrumb',
  tags: ['ui-component'],
  component: DemoBreadcrumb,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'level 1 / level 2 / level 3',
        values: 'boolean',
        code: 'render a `BreadcrumbItem` (+ `BreadcrumbSeparator`) or not',
      },
      { property: 'active', values: 'boolean', code: 'render the current `BreadcrumbPage` or not' },
      {
        property: 'back',
        values: 'boolean',
        code: 'render a leading back `Button` (icon-xs, ghost · neutral) or not',
      },
      { property: 'type', values: 'default', code: 'nothing (single value)' },
    ],
    docs: {
      description: {
        component:
          'A hierarchical trail (shadcn/ui Breadcrumb): `BreadcrumbList` of `BreadcrumbItem`s with `BreadcrumbLink`s, `BreadcrumbSeparator`s and the current `BreadcrumbPage`. The first item may carry an avatar; an optional back button leads. Long trails collapse with `BreadcrumbEllipsis` (usually a Dropdown Menu trigger).',
      },
    },
  },
  args: { back: false, avatar: true, levels: 2, current: true },
  argTypes: {
    levels: { control: 'inline-radio', options: [1, 2, 3] },
    back: { control: 'boolean' },
    avatar: { control: 'boolean' },
    current: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('a navigation trail ending on the current page', async ({ canvas }) => {
  const nav = canvas.getByRole('navigation', { name: 'breadcrumb' })
  await expect(nav).toBeInTheDocument()
  await expect(canvas.getByRole('link', { name: 'Label 1' })).toHaveAttribute('href', '#1')
  await expect(canvas.getByText('Label', { selector: '[aria-current=page]' })).toBeInTheDocument()
})

/** Figma back on, three levels. */
export const WithBack = meta.story({ args: { back: true, levels: 3 } })

/** A collapsed trail: the ellipsis stands for the hidden middle levels. */
export const Collapsed = meta.story({
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#1">Label 1</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#4">Label 4</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Label</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
})
