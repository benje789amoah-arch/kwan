import { Link, useLocation } from 'react-router-dom'
import { BusProgress } from '../BusProgress'
import { firstLeg, fromMinutes, getRoute, ghs, niceDate, plans, toMinutes, tripLines, type BusRoute } from '../data'
import { useStore, type Pass, type Scenario } from '../store'
import { Icon, Logo, Row, btnAccent, btnPrimary, btnQuiet } from '../ui'

const scenarios: { id: Scenario; label: string }[] = [
  { id: 'before', label: 'Before the first ride day' },
  { id: 'soon', label: 'Ride day: 10 minutes before the bus' },
  { id: 'left', label: 'Ride day: the bus just left my stop' },
  { id: 'gone', label: 'Ride day: the bus has finished its run' },
]

const label = 'text-sm font-bold uppercase tracking-wider'

/** The card at the top of home. What it says depends on the moment and on what the rider decided. */
function RideCard({ pass, route }: { pass: Pass; route: BusRoute }) {
  const { state } = useStore()
  const { scenario, outcome } = state
  const leg = firstLeg(route, pass.homeId, pass.workId, pass.trip)
  const board = leg.stops[leg.boardIdx]
  const alight = leg.stops[leg.alightIdx]
  const ride = leg.label.toLowerCase()
  const evening = pass.trip === 'both' ? tripLines(route, pass.homeId, pass.workId, pass.trip)[1] : null

  const code = (
    <Link to="/pass" className={`${btnAccent} mt-5`}>
      Show boarding code
    </Link>
  )
  const eveningNote = evening && (
    <p className="mt-3 rounded-2xl bg-leaf px-4 py-3 text-sm">
      Your evening seat today is still yours: {evening.board}, {evening.boardAt}.
    </p>
  )

  if (outcome?.kind === 'aboard') {
    return (
      <section className="mt-5 rounded-3xl bg-forest p-5 text-white">
        <p className={`${label} text-sun`}>Today · checked in</p>
        <h2 className="mt-2 text-3xl leading-tight font-extrabold">You are on the bus</h2>
        <p className="mt-2 text-lg">
          Arrive {alight.name} around {alight.time}.
        </p>
        <p className="mt-1 text-white/80">
          {pass.ridesLeft} of {pass.rides} seats left on your pass.
        </p>
      </section>
    )
  }

  if (scenario === 'before') {
    return (
      <section className="mt-5 rounded-3xl bg-forest p-5 text-white">
        <p className={`${label} text-sun`}>Next ride · {niceDate(pass.startsOn)}</p>
        <p className="mt-2 text-4xl font-extrabold">{board.time}</p>
        <p className="mt-1 text-lg font-semibold">Be at {board.name}</p>
        <p className="text-white/80">
          Arrive {alight.name} around {alight.time}
        </p>
        {code}
      </section>
    )
  }

  if (scenario === 'soon') {
    const busIdx = leg.boardIdx - 1
    return (
      <section className="mt-5 rounded-3xl bg-forest p-5 text-white">
        <p className={`${label} text-sun`}>Today · {fromMinutes(toMinutes(board.time) - 10)}</p>
        <h2 className="mt-2 text-3xl leading-tight font-extrabold">Your bus is 10 minutes away</h2>
        <p className="mt-2 text-lg">
          Head to {board.name} now. It leaves at {board.time}.
        </p>
        <BusProgress leg={leg} yourIdx={leg.boardIdx} busIdx={busIdx} busState="at" />
        {code}
      </section>
    )
  }

  if (outcome?.kind === 'catch') {
    const catchIdx = leg.stops.findIndex((s) => s.id === outcome.stopId)
    const stop = leg.stops[catchIdx]
    return (
      <section className="mt-5 rounded-3xl bg-forest p-5 text-white">
        <p className={`${label} text-sun`}>Today · catching up</p>
        <p className="mt-2 text-4xl font-extrabold">{stop.time}</p>
        <p className="mt-1 text-lg font-semibold">Be at {stop.name}</p>
        <p className="text-white/80">Your seat is held until then. The bus cannot wait.</p>
        <BusProgress leg={leg} yourIdx={catchIdx} busIdx={leg.boardIdx} busState="left" />
        {code}
      </section>
    )
  }

  if (outcome?.kind === 'saved') {
    return (
      <section className="mt-5 rounded-3xl border border-line bg-card p-5">
        <p className={`${label} text-forest`}>Today</p>
        <h2 className="mt-2 text-2xl leading-tight font-extrabold">Ride saved</h2>
        <p className="mt-2">
          This {ride} ride is back on your pass. Your pass now runs to <strong>{niceDate(pass.endsOn)}</strong>.
        </p>
        <p className="mt-1 text-sm text-muted">
          {pass.savesLeft} ride {pass.savesLeft === 1 ? 'save' : 'saves'} left on this pass.
        </p>
        {eveningNote}
      </section>
    )
  }

  if (outcome?.kind === 'used') {
    return (
      <section className="mt-5 rounded-3xl border border-line bg-card p-5">
        <p className={`${label} text-muted`}>Today</p>
        <h2 className="mt-2 text-2xl leading-tight font-extrabold">This {ride} ride is used</h2>
        <p className="mt-2">
          You have {pass.ridesLeft} of {pass.rides} seats left on your pass.
        </p>
        {eveningNote}
      </section>
    )
  }

  // The bus has gone and the rider has not said what happened.
  const now = fromMinutes(scenario === 'left' ? toMinutes(board.time) + 2 : toMinutes(alight.time) + 5)
  return (
    <section className="mt-5 rounded-3xl border-2 border-alert bg-card p-5">
      <p className={`${label} text-alert`}>Today · {now}</p>
      <h2 className="mt-2 text-2xl leading-tight font-extrabold">
        Your {board.time} bus has {scenario === 'left' ? `left ${board.name}` : 'finished its run'}
      </h2>
      <p className="mt-2 text-muted">Not on it? You still have options, and you do not need to call anyone.</p>
      <Link to="/missed" className={`${btnPrimary} mt-5`}>
        Missed it? See your options
      </Link>
    </section>
  )
}

export default function Home() {
  const { state, update, reset } = useStore()
  const { pass } = state
  const route = getRoute(pass?.routeId)
  const notice = (useLocation().state as { notice?: string } | null)?.notice

  return (
    <div className="flex min-h-dvh flex-col px-4 pt-5 pb-6">
      <header className="flex items-center justify-between">
        <Logo />
        <span className="grid size-11 place-items-center rounded-full bg-forest font-bold text-white" aria-hidden="true">
          {state.name.charAt(0).toUpperCase()}
        </span>
      </header>

      <h1 className="mt-6 text-3xl leading-tight font-extrabold">Hello, {state.name}.</h1>

      {pass && route ? (
        <>
          {notice && (
            <p role="status" className="mt-4 flex items-start gap-2 rounded-2xl bg-leaf px-4 py-3 font-semibold">
              <span className="mt-0.5 text-forest">
                <Icon name="check" size={20} />
              </span>
              {notice}
            </p>
          )}

          <RideCard pass={pass} route={route} />

          {state.scenario === 'before' && state.outcome?.kind !== 'aboard' && (
            <section className="mt-4 flex items-start gap-3 rounded-3xl border border-line bg-card p-4">
              <span className="mt-0.5 text-forest">
                <Icon name="clock" />
              </span>
              <div>
                <h2 className="font-bold">Bus tracking opens 30 minutes before</h2>
                <p className="text-sm text-muted">
                  You will see each stop the bus passes and get a text when it is 10 minutes away.
                </p>
              </div>
            </section>
          )}

          <section className="mt-4 rounded-3xl border border-line bg-card p-4">
            <h2 className="font-bold">Your pass</h2>
            <div className="mt-1">
              <Row label="Route" value={`${route.from} to ${route.to}`} />
              <Row label="Plan" value={plans.find((p) => p.id === pass.plan)!.name} />
              <Row label="Seats left" value={`${pass.ridesLeft} of ${pass.rides}`} />
              <Row label="Ride saves left" value={pass.savesLeft} />
              <Row label="Valid until" value={niceDate(pass.endsOn)} />
              <Row label="Paid" value={`${ghs(pass.total)} · ${pass.paidWith}`} />
            </div>
            <Link to="/change-stop" className={`${btnQuiet} mt-3`}>
              Change my stop
            </Link>
          </section>
        </>
      ) : (
        <>
          <p className="mt-1 text-muted">You do not have a pass yet.</p>
          <section className="mt-5 rounded-3xl border border-line bg-card p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-leaf text-forest">
              <Icon name="seat" size={26} />
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Find the bus that passes your junction</h2>
            <p className="mt-1 text-muted">See the stops, the times and the full price before you pay anything.</p>
            <Link to="/routes" className={`${btnPrimary} mt-5`}>
              Find my route <Icon name="next" />
            </Link>
          </section>
        </>
      )}

      <details className="mt-auto pt-8 text-sm">
        <summary className="cursor-pointer py-2 font-bold text-muted">Prototype controls</summary>
        <div className="mt-2 rounded-2xl border border-dashed border-line p-4">
          {pass && (
            <fieldset>
              <legend className="mb-2 text-muted">There is no live bus, so pick the moment to look at.</legend>
              <div className="space-y-1">
                {scenarios.map((s) => (
                  <label key={s.id} className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="scenario"
                      className="size-5 accent-forest"
                      checked={state.scenario === s.id}
                      onChange={() => update({ scenario: s.id, outcome: null })}
                      // Clicking the moment already selected replays it, clearing the last decision.
                      onClick={() => update({ scenario: s.id, outcome: null })}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <Link to="/driver" className="mt-2 flex min-h-11 items-center font-semibold underline">
            Open driver check-in
          </Link>
          <button type="button" onClick={reset} className="min-h-11 font-semibold underline">
            Start over
          </button>
        </div>
      </details>
    </div>
  )
}
