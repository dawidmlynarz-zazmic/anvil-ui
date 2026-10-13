import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { CheckIcon, FileTextIcon, SearchIcon, SparklesIcon, TriangleAlertIcon } from '@/components/ui/icon'

import { Timeline, TimelineItem, type TimelineTone } from './timeline'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10851-5493'

const TONES: TimelineTone[] = ['neutral', 'agent', 'success', 'warning', 'destructive', 'info']

const meta = preview.meta({
  title: 'Design System/Molecules/Timeline',
  tags: ['molecule'],
  component: Timeline,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'marker', values: 'dot · tile', code: '`marker` prop (+ `icon` for the tile)' },
      {
        property: 'tone',
        values: 'neutral · agent · success · warning · danger · info',
        code: '`tone` prop (danger → destructive)',
      },
      {
        property: 'time · title · detail · actor',
        values: 'text',
        code: '`time` · `title` · `detail` · `actor` props',
      },
      {
        property: 'show time · detail · actor · connector · trailing',
        values: 'boolean',
        code: 'pass the prop or not; `last` drops the connector',
      },
    ],
    guide: {
      use: [
        'Events in time order: an incident, a run’s activity, an audit or change log, an itinerary.',
        'A tile marker (with a glyph) when the kind of event matters; dots when it is just a sequence.',
        '`trailing` for a Badge or Button that belongs to one event (“Needs review”).',
      ],
      avoid: [
        'The stages of one process: use Progress Steps.',
        'Messages in a conversation: use Message Row.',
        'A long feed that needs filtering and loading states: build it on Timeline items, with filters above.',
      ],
      content: [
        'Title: what happened, in the past tense (“Found 4 sources”). Detail: the result or reason, one line.',
        'Times in the user’s locale (“09:31”); the actor names who did it (“Northwind Labs”, “Maya Chen”).',
      ],
      a11y: [
        'An ordered list; the time is a `<time>` when you pass `dateTime`.',
        'The rail and marker are decorative; the tone is never the only signal, so say it in the title or detail.',
      ],
    },
    docs: {
      description: {
        component:
          'A time-ordered list (`@/components/anvil/timeline`, on Icon Tile): `Timeline` (`<ol>`) of `TimelineItem` with `time`, `title`, `detail`, `actor`, `trailing`, `marker` dot · tile, `icon`, `tone`, `last`.',
      },
    },
  },
  argTypes: { children: { control: false }, className: { control: false } },
  render: () => (
    <Timeline className="w-140">
      <TimelineItem
        time="09:31"
        title="Searched for launch benchmarks"
        detail="14 results"
        actor="Northwind Labs"
      />
      <TimelineItem
        time="09:32"
        title="Read 3 sources"
        detail="2 kept, 1 discarded as out of date"
        actor="Northwind Labs"
        tone="agent"
      />
      <TimelineItem time="09:35" title="Maya Chen approved the plan" actor="Maya Chen" tone="success" last />
    </Timeline>
  ),
})

/** Dot markers. */
export const Default = meta.story()

Default.test('is an ordered list of events', async ({ canvas }) => {
  await expect(canvas.getByRole('list')).toBeVisible()
  await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
})

/** Figma marker × tone. */
export const Markers = meta.story({
  render: () => (
    <div className="grid w-240 grid-cols-2 gap-x-10">
      {(['dot', 'tile'] as const).map((marker) => (
        <Timeline key={marker}>
          {TONES.map((tone, index) => (
            <TimelineItem
              key={tone}
              marker={marker}
              tone={tone}
              icon={
                [SparklesIcon, SearchIcon, CheckIcon, TriangleAlertIcon, TriangleAlertIcon, FileTextIcon][
                  index
                ]
              }
              time="09:31"
              title={`Event · ${tone}`}
              detail="Detail or result"
              actor="Northwind Labs"
              last={index === TONES.length - 1}
            />
          ))}
        </Timeline>
      ))}
    </div>
  ),
})

/** With a trailing Badge on one event, and events without time or detail. */
export const WithTrailing = meta.story({
  render: () => (
    <Timeline className="w-140">
      <TimelineItem
        marker="tile"
        icon={SearchIcon}
        tone="agent"
        time="09:31"
        title="Searched for launch benchmarks"
        actor="Northwind Labs"
      />
      <TimelineItem
        marker="tile"
        icon={TriangleAlertIcon}
        tone="warning"
        time="09:34"
        title="Two sources disagree"
        detail="Trial conversion is 4.6% in one and 5.1% in the other"
        trailing={
          <Badge variant="subtle" tone="warning" size="xs">
            Needs review
          </Badge>
        }
        last
      />
    </Timeline>
  ),
})
