import type { BusRoute, TripId, TripLine } from './data'
import { Icon, choice, eyebrow, radio } from './ui'

/** Home and work stop pickers. The work stop is always kept after the home stop along the route. */
export function StopPicker({
  route,
  trip,
  homeId,
  workId,
  onChange,
}: {
  route: BusRoute
  trip: TripId
  homeId: string
  workId: string
  onChange: (homeId: string, workId: string) => void
}) {
  const last = route.stops[route.stops.length - 1].id
  const indexOf = (id: string) => route.stops.findIndex((s) => s.id === id)
  const homeStops = route.stops.slice(0, -1)
  const workStops = route.stops.slice(indexOf(homeId) + 1)
  const time = (s: BusRoute['stops'][number]) => (trip === 'evening' ? s.pm : s.am)

  function pickHome(id: string) {
    onChange(id, indexOf(workId) <= indexOf(id) ? last : workId)
  }

  return (
    <>
      <fieldset className="mt-6">
        <legend className="mb-2 font-bold">Your stop near home</legend>
        <div className="space-y-2">
          {homeStops.map((s) => (
            <label key={s.id} className={choice}>
              <input type="radio" name="home" className={radio} checked={homeId === s.id} onChange={() => pickHome(s.id)} />
              <span className="flex-1 font-semibold">{s.name}</span>
              <span className="text-sm text-fg-muted">{time(s)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-2 font-bold">Your stop near work</legend>
        <div className="space-y-2">
          {workStops.map((s) => (
            <label key={s.id} className={choice}>
              <input
                type="radio"
                name="work"
                className={radio}
                checked={workId === s.id}
                onChange={() => onChange(homeId, s.id)}
              />
              <span className="flex-1 font-semibold">{s.name}</span>
              <span className="text-sm text-fg-muted">{time(s)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}

/** Says in plain words where to stand and by when, for each trip. */
export function DayCard({ lines, title = 'Your day' }: { lines: TripLine[]; title?: string }) {
  return (
    <section aria-live="polite" className="mt-6 rounded-2xl bg-brand p-4 text-on-brand">
      <h2 className={`${eyebrow} flex items-center gap-2 text-accent`}>
        <Icon name="clock" size="sm" /> {title}
      </h2>
      <ul className="mt-2 space-y-3">
        {lines.map((l) => (
          <li key={l.label}>
            <p className="text-sm text-on-brand/75">{l.label}</p>
            <p className="text-lg leading-snug font-bold">
              Be at {l.board} by {l.boardAt}
            </p>
            <p className="text-on-brand/85">
              Arrive {l.arrive} around {l.arriveAt}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
