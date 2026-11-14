import { Link } from 'react-router-dom'
import { getRoute, ghs, niceDate, plans } from '../data'
import { useStore, type Scenario } from '../store'
import { Button, Icon, PageTitle, Row, card, radio } from '../ui'

const scenarios: { id: Scenario; label: string }[] = [
  { id: 'before', label: 'Before the first ride day' },
  { id: 'soon', label: 'Ride day: 10 minutes before the bus' },
  { id: 'left', label: 'Ride day: the bus just left my stop' },
  { id: 'gone', label: 'Ride day: the bus has finished its run' },
]

export default function Account() {
  const { state, update, reset } = useStore()
  const { pass } = state
  const route = getRoute(pass?.routeId)

  return (
    <main className="flex-1 animate-enter px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
      <PageTitle className="text-3xl leading-tight font-extrabold">Account</PageTitle>

      <section className={`${card} mt-5 flex items-center gap-4 p-4`}>
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-xl font-extrabold text-on-brand" aria-hidden="true">
          {state.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-extrabold">{state.name}</h2>
          <p className="text-fg-muted">+233 {state.phone}</p>
        </div>
      </section>

      {pass && route && (
        <section className={`${card} mt-3 p-4`}>
          <h2 className="flex items-center gap-2 font-bold">
            <Icon name="wallet" className="text-brand-fg" /> Receipt
          </h2>
          <div className="mt-2">
            <Row label="Route" value={`${route.from} to ${route.to}`} />
            <Row label="Plan" value={plans.find((p) => p.id === pass.plan)!.name} />
            <Row label="Paid" value={`${ghs(pass.total)} · ${pass.paidWith}`} />
            <Row label="Valid" value={`${niceDate(pass.startsOn)} to ${niceDate(pass.endsOn)}`} />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-dashed border-outline p-4">
        <h2 className="font-bold">Prototype controls</h2>
        <p className="mt-1 text-sm text-fg-muted">For whoever is running a test. A real rider would not see this.</p>

        {pass ? (
          <fieldset className="mt-4">
            <legend className="mb-1 text-sm font-semibold">There is no live bus, so pick the moment to look at</legend>
            {scenarios.map((s) => (
              <label key={s.id} className="flex min-h-12 cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="scenario"
                  className={radio}
                  checked={state.scenario === s.id}
                  onChange={() => update({ scenario: s.id, outcome: null })}
                  // Clicking the moment already selected replays it, clearing the last decision.
                  onClick={() => update({ scenario: s.id, outcome: null })}
                />
                {s.label}
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="mt-3 text-sm">Book a pass to try the ride-day moments.</p>
        )}

        <Link
          to="/driver"
          className="mt-3 flex min-h-12 items-center justify-between rounded-xl border border-outline px-4 font-semibold transition-colors duration-150 active:bg-sunken"
        >
          Open driver check-in <Icon name="chevron" className="text-brand-fg" />
        </Link>
      </section>

      {/* Kept apart from everything else because it clears the rider's details and pass. */}
      <div className="mt-8">
        <Button variant="quiet" onClick={reset} className="text-danger-fg">
          <Icon name="restart" /> Start over
        </Button>
        <p className="mt-2 text-center text-sm text-fg-muted">Clears your details and pass from this phone.</p>
      </div>
    </main>
  )
}
