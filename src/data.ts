// All routes, times and prices are made up for the prototype.

export type Stop = {
  id: string
  name: string
  /** Time the morning bus (towards work) reaches this stop. */
  am: string
  /** Time the evening bus (towards home) reaches this stop. */
  pm: string
}

export type BusRoute = {
  id: string
  from: string
  to: string
  perRide: number
  seatsLeft: number
  stops: Stop[]
}

export const routes: BusRoute[] = [
  {
    id: 'adenta-airport',
    from: 'Adenta',
    to: 'Airport City',
    perRide: 15,
    seatsLeft: 9,
    stops: [
      { id: 'adenta-barrier', name: 'Adenta Barrier', am: '5:45 am', pm: '6:35 pm' },
      { id: 'madina-zongo', name: 'Madina Zongo Junction', am: '6:00 am', pm: '6:20 pm' },
      { id: 'atomic', name: 'Atomic Junction', am: '6:10 am', pm: '6:10 pm' },
      { id: 'okponglo', name: 'Okponglo', am: '6:20 am', pm: '6:00 pm' },
      { id: 'shiashie', name: 'Shiashie', am: '6:35 am', pm: '5:45 pm' },
      { id: 'airport-city', name: 'Airport City', am: '6:50 am', pm: '5:30 pm' },
    ],
  },
  {
    id: 'kasoa-ridge',
    from: 'Kasoa',
    to: 'Ridge',
    perRide: 18,
    seatsLeft: 4,
    stops: [
      { id: 'kasoa-overhead', name: 'Kasoa Overhead', am: '5:15 am', pm: '7:05 pm' },
      { id: 'weija', name: 'Weija Junction', am: '5:35 am', pm: '6:45 pm' },
      { id: 'mallam', name: 'Mallam Junction', am: '5:55 am', pm: '6:25 pm' },
      { id: 'kaneshie', name: 'Kaneshie First Light', am: '6:15 am', pm: '6:05 pm' },
      { id: 'circle', name: 'Kwame Nkrumah Circle', am: '6:35 am', pm: '5:45 pm' },
      { id: 'ridge', name: 'Ridge', am: '6:50 am', pm: '5:30 pm' },
    ],
  },
  {
    id: 'tema-cantonments',
    from: 'Tema Community 25',
    to: 'Cantonments',
    perRide: 20,
    seatsLeft: 12,
    stops: [
      { id: 'comm-25', name: 'Community 25', am: '5:30 am', pm: '7:00 pm' },
      { id: 'michel-camp', name: 'Michel Camp', am: '5:45 am', pm: '6:45 pm' },
      { id: 'ashaiman', name: 'Ashaiman Overhead', am: '6:00 am', pm: '6:30 pm' },
      { id: 'spintex', name: 'Spintex Road', am: '6:30 am', pm: '6:00 pm' },
      { id: 'tetteh-quarshie', name: 'Tetteh Quarshie', am: '6:45 am', pm: '5:45 pm' },
      { id: 'cantonments', name: 'Cantonments', am: '7:00 am', pm: '5:30 pm' },
    ],
  },
]

export type TripId = 'morning' | 'evening' | 'both'

export const trips: { id: TripId; name: string; ridesPerDay: number }[] = [
  { id: 'both', name: 'Both ways', ridesPerDay: 2 },
  { id: 'morning', name: 'Morning', ridesPerDay: 1 },
  { id: 'evening', name: 'Evening', ridesPerDay: 1 },
]

export type PlanId = 'week' | 'fortnight' | 'month'

export const plans: {
  id: PlanId
  name: string
  days: number
  discount: number
  note: string
  lastDayOffset: number
  /** Missed rides the rider can put back on the pass. */
  saves: number
}[] = [
  { id: 'week', name: '1 week', days: 5, discount: 0, note: 'A good first try', lastDayOffset: 4, saves: 1 },
  { id: 'fortnight', name: '2 weeks', days: 10, discount: 0.05, note: 'Save 5%', lastDayOffset: 11, saves: 2 },
  { id: 'month', name: '1 month', days: 22, discount: 0.1, note: 'Save 10%', lastDayOffset: 29, saves: 4 },
]

export function getRoute(id?: string) {
  return routes.find((r) => r.id === id)
}

export function getStop(route: BusRoute, id?: string) {
  return route.stops.find((s) => s.id === id)
}

export function priceFor(route: BusRoute, tripId: TripId, planId: PlanId) {
  const trip = trips.find((t) => t.id === tripId)!
  const plan = plans.find((p) => p.id === planId)!
  const rides = plan.days * trip.ridesPerDay
  const gross = rides * route.perRide
  const saving = Math.round(gross * plan.discount)
  return { plan, trip, rides, gross, saving, total: gross - saving }
}

export type TripLine = { label: 'Morning' | 'Evening'; board: string; boardAt: string; arrive: string; arriveAt: string }

/** Plain-language description of where to stand and when, for each trip on the pass. */
export function tripLines(route: BusRoute, homeId: string, workId: string, tripId: TripId): TripLine[] {
  const home = getStop(route, homeId)!
  const work = getStop(route, workId)!
  const lines: TripLine[] = []
  if (tripId !== 'evening') {
    lines.push({ label: 'Morning', board: home.name, boardAt: home.am, arrive: work.name, arriveAt: work.am })
  }
  if (tripId !== 'morning') {
    lines.push({ label: 'Evening', board: work.name, boardAt: work.pm, arrive: home.name, arriveAt: home.pm })
  }
  return lines
}

export type Leg = {
  label: 'Morning' | 'Evening'
  /** Every stop on the route, in the order the bus reaches them on this leg. */
  stops: { id: string; name: string; time: string }[]
  boardIdx: number
  alightIdx: number
}

/** The first ride of the day on a pass: morning, unless the pass is evening only. */
export function firstLeg(route: BusRoute, homeId: string, workId: string, tripId: TripId): Leg {
  const morning = tripId !== 'evening'
  const stops = morning
    ? route.stops.map((s) => ({ id: s.id, name: s.name, time: s.am }))
    : [...route.stops].reverse().map((s) => ({ id: s.id, name: s.name, time: s.pm }))
  return {
    label: morning ? 'Morning' : 'Evening',
    stops,
    boardIdx: stops.findIndex((s) => s.id === (morning ? homeId : workId)),
    alightIdx: stops.findIndex((s) => s.id === (morning ? workId : homeId)),
  }
}

export function toMinutes(time: string) {
  const m = time.match(/(\d+):(\d+) (am|pm)/)!
  return ((Number(m[1]) % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + Number(m[2])
}

export function fromMinutes(total: number) {
  const h24 = Math.floor(total / 60)
  return `${h24 % 12 || 12}:${String(total % 60).padStart(2, '0')} ${h24 >= 12 ? 'pm' : 'am'}`
}

export function nextWorkingDay(date: Date) {
  let d = addDays(date, 1)
  while (d.getDay() === 0 || d.getDay() === 6) d = addDays(d, 1)
  return d
}

export function ghs(amount: number) {
  // Whole cedis read cleaner; anything else always shows two decimals (13.50, not 13.5).
  const digits = Number.isInteger(amount) ? 0 : 2
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

export function nextMonday(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const add = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + add)
  return d
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function niceDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
