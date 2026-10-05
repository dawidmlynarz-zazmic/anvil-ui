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
      aria-label="Label"
      className={vertical ? 'w-60' : 'w-130'}
    >
      <CarouselContent className={vertical ? 'h-100' : undefined}>
        {Array.from({ length: slides }, (_, i) => (
          <CarouselItem
            key={i}
            className={vertical ? 'basis-1/2' : 'basis-60'}
            aria-label={`${i + 1} of ${slides}`}
          >
            <div className="flex h-45 items-center justify-center rounded-lg bg-muted type-heading-3xl text-foreground">
              {i + 1}
            </div>
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
  title: 'Components/Carousel',
  tags: ['ui-component'],
  component: DemoCarousel,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A scrollable row of slides (shadcn/ui Carousel on Embla): `CarouselContent` › `CarouselItem`s (size them with `basis-*`), `CarouselPrevious` / `CarouselNext` (disabled at the ends) and `CarouselDots`. Drag, swipe, the arrow keys or the controls move it; `opts` and `plugins` go to Embla (`loop`, `align`, autoplay…).',
      },
    },
  },
  args: { orientation: 'horizontal', controls: true, dots: true, loop: false, slides: 5 },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
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
