import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRoute, ghs, routes } from '../data'
import { useStore } from '../store'
import { Icon, Note, PageTitle, card } from '../ui'

export default function FindRoute() {
  const { state } = useStore()
  const searchId = useId()
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const list = routes.filter(
    (r) => !term || [r.from, r.to, ...r.stops.map((s) => s.name)].some((n) => n.toLowerCase().includes(term)),
  )
  const current = getRoute(state.pass?.routeId)

  return (
    <main className="flex-1 animate-enter px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
      <PageTitle className="text-3xl leading-tight font-extrabold">Find your route</PageTitle>
      <p className="mt-1 text-fg-muted">See the stops, the times and the price before you pay.</p>

      {current && (
        <div className="mt-4">
          <Note tone="warn">
            You already have a pass on {current.from} to {current.to}. In this prototype, booking again replaces it.
          </Note>
        </div>
      )}

      <label htmlFor={searchId} className="mt-5 mb-2 block font-semibold">
        Search an area or stop
      </label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-fg-muted" />
        <input
          id={searchId}
          type="search"
          enterKeyHint="search"
          placeholder="For example, Madina"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-h-14 w-full rounded-xl border border-outline bg-surface pr-4 pl-12 text-lg text-fg placeholder:text-fg-muted focus:border-brand-fg"
        />
      </div>

      <p className="mt-4 text-sm font-semibold text-fg-muted" role="status">
        {list.length} {list.length === 1 ? 'route' : 'routes'}
        {term ? ` passing “${q.trim()}”` : ''}
      </p>

      <ul className="mt-2 space-y-3">
        {list.map((r) => {
          const first = r.stops[0]
          const last = r.stops[r.stops.length - 1]
          const few = r.seatsLeft <= 5
          return (
            <li key={r.id}>
              <Link
                to={`/routes/${r.id}`}
                className={`${card} block p-4 transition-colors duration-150 active:bg-sunken`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl leading-tight font-extrabold">
                    {r.from} <span className="font-semibold text-fg-muted">to</span> {r.to}
                  </h2>
                  <Icon name="chevron" size="lg" className="mt-0.5 text-brand-fg" />
                </div>
                <p className="mt-1 text-sm text-fg-muted">
                  {r.stops.length} stops · {ghs(r.perRide)} a ride
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-sunken px-3 py-2">
                    <dt className="text-xs font-semibold text-fg-muted">Morning leaves</dt>
                    <dd className="text-lg font-extrabold">{first.am}</dd>
                    <dd className="truncate text-xs text-fg-muted">{first.name}</dd>
                  </div>
                  <div className="rounded-xl bg-sunken px-3 py-2">
                    <dt className="text-xs font-semibold text-fg-muted">Evening leaves</dt>
                    <dd className="text-lg font-extrabold">{last.pm}</dd>
                    <dd className="truncate text-xs text-fg-muted">{last.name}</dd>
                  </div>
                </dl>

                <p
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                    few ? 'bg-accent-tint' : 'bg-brand-tint'
                  }`}
                >
                  <Icon name={few ? 'warn' : 'seat'} size="sm" />
                  {few ? `Only ${r.seatsLeft} seats left` : `${r.seatsLeft} seats left`}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>

      {list.length === 0 && (
        <div className="mt-2 rounded-2xl border border-dashed border-outline p-5 text-center">
          <p className="font-bold">No bus passes “{q.trim()}” yet.</p>
          <p className="mt-1 text-sm text-fg-muted">Try a nearby junction or a bigger area name.</p>
          <button
            type="button"
            onClick={() => setQ('')}
            className="mt-3 min-h-12 cursor-pointer px-4 font-semibold text-brand-fg underline"
          >
            Show all routes
          </button>
        </div>
      )}
    </main>
  )
}
