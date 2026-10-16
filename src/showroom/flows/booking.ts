import type { Intent } from '../engine'

// Flow: book tickets for a show, built from the Catalog & scheduling pieces. Offers (a carousel) → a date
// (availability calendar) → a time (slot list) → how many (quantity selector) → an approval → confirmation
// with a ticket file. Every step waits for the user's pick; the widget then folds into a one-line summary.

const SHOWS = [
  {
    id: 'paper',
    title: 'Paper Kingdoms',
    badge: 'Musical',
    tone: 'info',
    subtitle: 'Lyric Hall · Manchester',
    price: 'From $29',
  },
  {
    id: 'lantern',
    title: 'The Lantern Keeper',
    badge: 'Family',
    tone: 'success',
    subtitle: 'Grand Royal · Glasgow',
    price: 'From $24',
  },
  {
    id: 'lights',
    title: 'Northern Lights',
    badge: 'New',
    tone: 'warning',
    subtitle: 'Empire Arts · Liverpool',
    price: 'From $35',
  },
] as const

const TIMES = [
  {
    id: '1430',
    time: '14:30',
    label: 'Matinee',
    price: '$29 – $95',
    availability: 'limited',
    availabilityLabel: '12 seats left',
  },
  {
    id: '1930',
    time: '19:30',
    label: 'Evening',
    price: '$39 – $125',
    availability: 'good',
    availabilityLabel: 'Good availability',
  },
  {
    id: '2200',
    time: '22:00',
    label: 'Late',
    price: '$29 – $79',
    availability: 'sold-out',
    availabilityLabel: 'Sold out',
  },
]

const TYPES = [
  { id: 'adult', label: 'Adult', detail: '16+', price: 45 },
  { id: 'child', label: 'Child', detail: 'Under 16, with an adult', price: 30 },
  { id: 'concession', label: 'Concession', detail: 'Students, 65+, with ID', price: 38 },
]

const PRICES: Record<string, number> = { adult: 45, child: 30, concession: 38 }
const LABELS: Record<string, string> = { adult: 'adult', child: 'child', concession: 'concession' }

export const booking: Intent = {
  id: 'booking',
  kind: 'flow',
  title: 'Book a show',
  prompt: 'Book two tickets for a show this weekend',
  hint: 'Offers, a calendar, times, tickets and an approval',
  match: [/\btickets?\b/i, /\bbook\b/i, /\b(theatre|theater|musical)\b/i, /\bthis weekend\b/i],
  async run(c) {
    const a = c.agent()
    await c.wait(500)
    await a.tools([
      { name: 'events.search', summary: '3 shows near you this weekend', duration: '1.2s' },
      { name: 'availability.check', summary: 'Dates and seats for 3 shows', duration: '0.9s' },
    ])
    await a.stream('Three shows match, all with seats on Saturday. The first has the best reviews.')
    const offers = a.widget({ kind: 'offers', shows: SHOWS.map((show) => ({ ...show })) })
    const showId = (await offers.resolved) as string
    const show = SHOWS.find((s) => s.id === showId) ?? SHOWS[0]
    offers.update({ chosen: show.id })
    c.marker(`Chose ${show.title}`)

    const b = c.agent()
    await c.wait(500)
    await b.stream(`${show.title}, good choice. Which day works? Green is wide open, orange is filling up.`)
    const calendar = b.widget({ kind: 'calendar', show: `${show.title} · ${show.subtitle.split(' · ')[0]}` })
    const day = (await calendar.resolved) as string
    calendar.update({ chosen: day })

    const d = c.agent()
    await c.wait(500)
    await d.stream('Three performances that day. The matinee is captioned.')
    const slots = d.widget({
      kind: 'slots',
      day,
      slots: TIMES,
      subtitle: `${show.subtitle.split(' · ')[0]} · 3 options`,
    })
    const slotId = (await slots.resolved) as string
    const slot = TIMES.find((t) => t.id === slotId) ?? TIMES[1]
    slots.update({ chosen: slot.id })

    const e = c.agent()
    await c.wait(500)
    await e.stream('And how many tickets? I’ll keep seats together.')
    const quantity = e.widget({
      kind: 'quantity',
      subtitle: `${show.title} · ${slot.time}`,
      types: TYPES,
    })
    const counts = (await quantity.resolved) as Record<string, number>
    quantity.update({ chosen: counts })
    const total = Object.entries(counts).reduce((sum, [id, n]) => sum + n * (PRICES[id] ?? 0), 0)
    const summary = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `${n} ${LABELS[id]}`)
      .join(', ')

    const f = c.agent()
    await c.wait(500)
    const approval = f.widget({
      kind: 'approval',
      title: 'Book the tickets',
      subtitle: 'Tickets · book_seats',
      fields: [
        ['Show', show.title],
        [
          'When',
          `${new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${slot.time}`,
        ],
        ['Tickets', summary],
        ['Total', `$${total}.00`],
      ],
      note: 'Your card on file will be charged. Tickets can be exchanged up to 24 hours before.',
    })
    if ((await approval.resolved) === 'deny') {
      approval.update({ status: 'denied', resultNote: 'Denied just now · nothing was booked' })
      await c.say('No problem. Nothing was booked, and your seats are released.')
      return
    }
    approval.update({ status: 'approved', resultNote: 'Approved just now · tickets booked' })
    c.marker('Booking confirmed · #PK-91274')
    const g = c.agent()
    await c.wait(500)
    await g.stream('Booked. Your tickets are on their way to your inbox, and here they are too.')
    const file = g.widget({
      kind: 'file',
      fileKind: 'pdf',
      name: 'tickets-PK-91274.pdf',
      meta: 'Preparing tickets…',
      status: 'generating',
      progress: 30,
    })
    await c.wait(1500)
    file.update({ status: 'ready', meta: `PDF · ${summary} · 0.4 MB`, progress: undefined })
    await c.say('Enjoy the show. If it rains, the umbrellas at the Lyric are surprisingly good.')
  },
}
