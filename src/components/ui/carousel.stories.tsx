import preview from '#.storybook/preview'
import { expect, userEvent, waitFor } from 'storybook/test'

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'

/** Recent projects: the Card content each slide shows. */
const PROJECTS = [
  { name: 'Q3 launch plan', meta: '14 chats · 6 files', status: 'Active' },
  { name: 'Competitor pricing research', meta: '5 chats · 3 sources', status: 'Active' },
  { name: 'Onboarding email draft', meta: '3 chats · 1 file', status: 'In review' },
  { name: 'Weekly metrics review', meta: '8 chats · 4 charts', status: 'Active' },
  { name: 'Northwind Sync beta', meta: '11 chats · 24 partners', status: 'Archived' },
  { name: 'Launch deck', meta: '2 chats · launch-deck.pptx', status: 'In review' },
]

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10945-121'

type DemoProps = {
  orientation?: 'horizontal' | 'vertical'
  /** Figma `show controls` / `show dots`. */
  controls?: boolean
  dots?: boolean
  loop?: boolean
  slides?: number
}

function DemoCarousel({
  orientation = 'horizontal',
  controls = true,
  dots = true,
  loop = false,
  slides = 5,
}: DemoProps) {
  const vertical = orientation === 'vertical'
  return (
    <Carousel
      orientation={orientation}
      opts={{ align: 'start', loop }}
      aria-label="Recent projects"
      className={vertical ? 'w-72' : 'w-150'}
    >
      <CarouselContent className={vertical ? 'h-100' : undefined}>
        {PROJECTS.slice(0, slides).map((project, i) => (
          <CarouselItem
            key={project.name}
            className={vertical ? 'basis-1/2' : 'basis-64'}
            aria-label={`${i + 1} of ${slides}`}
          >
            <Card className="h-full min-w-0 justify-between">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.meta}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                <Badge variant="subtle" tone={project.status === 'Archived' ? 'neutral' : 'brand'} size="sm">
                  {project.status}
                </Badge>
                <Button variant="ghost" intent="neutral" size="xs" aria-label={`Open ${project.name}`}>
                  Open
                </Button>
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {controls && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
      {dots && <CarouselDots />}
    </Carousel>
  )
}

const meta = preview.meta({
  title: 'Design System/Organisms/Carousel',
  tags: ['organism'],
  component: DemoCarousel,
  parameters: {
    shadcn: 'carousel',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'show controls',
        values: 'boolean',
        code: 'render `CarouselPrevious` / `CarouselNext` or not',
      },
      { property: 'show dots', values: 'boolean', code: 'render `CarouselDots` or not' },
      {
        property: 'current',
        values: 'start · middle · end',
        code: 'the selected slide (Embla state; controls `disabled:` at the ends), not a prop',
      },
    ],
    guide: {
      use: [
        'A short row of peer items the user browses one at a time: generated image options, product cards, template previews.',
        'When space is tight and the items don’t need to be compared side by side.',
      ],
      avoid: [
        'Content the user must read or compare in full (sources, plan options): use a grid of Cards or a Table.',
        'A scrolling row of chips or attachments: use `AttachmentGroup` or a Scroll Area.',
        'Auto-advancing slides for important content: users miss what moves on its own.',
      ],
      content: [
        'Keep slides the same kind and size; each one makes sense on its own.',
        'Show how many there are (dots) and keep Previous / Next visible.',
      ],
      a11y: [
        'The root is a region with `aria-roledescription="carousel"`, each item a group with `aria-roledescription="slide"`; name the region with `aria-label`.',
        'Arrow keys move it when focused; Previous / Next and the dots (“Go to slide 2”) are named buttons.',
        'If you add autoplay, provide a pause control and stop on hover and focus.',
      ],
    },
    docs: {
      description: {
        component:
          'A scrollable row of slides (shadcn/ui Carousel on Embla): `CarouselContent` › `CarouselItem`s (size them with `basis-*`), `CarouselPrevious` / `CarouselNext` (disabled at the ends) and `CarouselDots`. Drag, swipe, the arrow keys or the controls move it; `opts` and `plugins` go to Embla (`loop`, `align`, autoplay…). The stories compose Card slides (recent projects): put real components in the items, sized with `basis-*`.',
      },
    },
  },
  args: { orientation: 'horizontal', controls: true, dots: true, loop: false, slides: 5 },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    controls: { control: 'boolean' },
    dots: { control: 'boolean' },
    loop: { control: 'boolean' },
    slides: { control: { type: 'range', min: 2, max: 6, step: 1 } },
  },
})

/** Figma current=start: Previous disabled, the third slide peeks. */
export const Default = meta.story()

Default.test('Next and the dots move it; Previous is disabled at the start', async ({ canvas }) => {
  const prev = canvas.getByRole('button', { name: 'Previous slide' })
  await waitFor(() => expect(prev).toBeDisabled())
  await waitFor(() =>
    expect(canvas.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true'),
  )
  await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
  await waitFor(() =>
    expect(canvas.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true'),
  )
  await expect(prev).toBeEnabled()
  await userEvent.click(canvas.getByRole('button', { name: 'Go to slide 1' }))
  await waitFor(() => expect(prev).toBeDisabled())
})

Default.test('arrow keys scroll it', async ({ canvas }) => {
  canvas.getByRole('button', { name: 'Go to slide 1' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  await waitFor(() =>
    expect(canvas.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true'),
  )
})

/** Embla `loop`: the controls never disable. */
export const Loop = meta.story({ args: { loop: true } })

/** orientation="vertical" (a code prop in Figma). */
export const Vertical = meta.story({ args: { orientation: 'vertical', dots: false } })
