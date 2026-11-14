import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ghs, routes } from '../data'
import { Icon, Screen, field } from '../ui'

export default function FindRoute() {
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const list = routes.filter(
    (r) => !term || [r.from, r.to, ...r.stops.map((s) => s.name)].some((n) => n.toLowerCase().includes(term)),
  )

  return (
    <Screen title="Find your route" step={1}>
      <label className="relative mt-2 block">
        <span className="sr-only">Search an area or stop</span>
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
          <Icon name="search" />
        </span>
        <input
          className={`${field} pl-12`}
          type="search"
          placeholder="Area or stop, e.g. Madina"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <ul className="mt-4 space-y-3">
        {list.map((r) => {
          const first = r.stops[0]
          const last = r.stops[r.stops.length - 1]
          return (
            <li key={r.id}>
              <Link to={`/routes/${r.id}`} className="block rounded-3xl border border-line bg-card p-4 active:bg-leaf">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-extrabold leading-tight">
                    {r.from} <span className="text-muted">to</span> {r.to}
                  </h2>
                  <span className="mt-1 text-forest">
                    <Icon name="next" />
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{r.stops.length} stops</p>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-paper px-3 py-2">
                    <dt className="text-muted">Morning leaves</dt>
                    <dd className="text-base font-bold">{first.am}</dd>
                  </div>
                  <div className="rounded-xl bg-paper px-3 py-2">
                    <dt className="text-muted">Evening leaves</dt>
                    <dd className="text-base font-bold">{last.pm}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold">{ghs(r.perRide)} a ride</span>
                  <span className={`rounded-full px-3 py-1 font-semibold ${r.seatsLeft <= 5 ? 'bg-sun-soft' : 'bg-leaf'}`}>
                    {r.seatsLeft} seats left
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {list.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-line p-5 text-center">
          <p className="font-bold">No bus passes “{q.trim()}” yet.</p>
          <p className="mt-1 text-sm text-muted">Try a nearby junction or a bigger area name.</p>
        </div>
      )}
    </Screen>
  )
}
