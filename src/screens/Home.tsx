import { Link, useLocation } from 'react-router-dom'
import { BusProgress } from '../BusProgress'
import { firstLeg, fromMinutes, getRoute, niceDate, toMinutes, tripLines, type BusRoute } from '../data'
import { useStore, type Pass } from '../store'
import { Icon, Journey, Logo, Note, PageTitle, Row, btnAccent, btnPrimary, card, eyebrow } from '../ui'

const brandCard = 'mt-5 rounded-2xl bg-brand p-5 text-on-brand'
const plainCard = `${card} mt-5 p-5`

/** The card at the top of home. What it says depends on the moment and on what the rider decided. */
function RideCard({ pass, route }: { pass: Pass; route: BusRoute }) {
  const { state } = useStore()
  const { scenario, outcome } = state
  const leg = firstLeg(route, pass.homeId, pass.workId, pass.trip)
  const board = leg.stops[leg.boardIdx]
  const alight = leg.stops[leg.alightIdx]
  const ride = leg.label.toLowerCase()

  const code = (
    <Link to="/pass" className={`${btnAccent} mt-5`}>
      <Icon name="pass" /> Show boarding code
    </Link>
  )

  if (outcome?.kind === 'aboard') {
    return (
      <section className={brandCard}>
        <p className={`${eyebrow} flex items-center gap-1.5 text-accent`}>
          <Icon name="ok" size="sm" /> Today · checked in
        </p>
        <h2 className="mt-2 text-3xl leading-tight font-extrabold">You are on the bus</h2>
        <p className="mt-2 text-lg">
          Arrive {alight.name} around {alight.time}.
        </p>
      </section>
    )
  }

  if (scenario === 'before') {
    return (
      <section className={brandCard}>
        <p className={`${eyebrow} text-accent`}>Next ride · {niceDate(pass.startsOn)}</p>
        <Journey from={board.name} fromTime={board.time} to={alight.name} toTime={alight.time} />
        {code}
      </section>
    )
  }

  if (scenario === 'soon') {
    return (
      <section className={brandCard}>
        <p className={`${eyebrow} text-accent`}>Today · {fromMinutes(toMinutes(board.time) - 10)}</p>
        <h2 className="mt-2 text-3xl leading-tight font-extrabold">Your bus is 10 minutes away</h2>
        <p className="mt-2 text-lg">
          Head to {board.name} now. It leaves at {board.time}.
        </p>
        <BusProgress leg={leg} yourIdx={leg.boardIdx} busIdx={leg.boardIdx - 1} busState="at" />
        {code}
      </section>
    )
  }

  if (outcome?.kind === 'catch') {
    const catchIdx = leg.stops.findIndex((s) => s.id === outcome.stopId)
    const stop = leg.stops[catchIdx]
    return (
      <section className={brandCard}>
        <p className={`${eyebrow} text-accent`}>Today · catching up</p>
        <h2 className="mt-2 text-3xl leading-tight font-extrabold">
          Be at {stop.name} by {stop.time}
        </h2>
        <p className="mt-2 text-on-brand/85">Your seat is held until then. The bus cannot wait.</p>
        <BusProgress leg={leg} yourIdx={catchIdx} busIdx={leg.boardIdx} busState="left" />
        {code}
      </section>
    )
  }

  if (outcome?.kind === 'saved') {
    return (
      <section className={plainCard}>
        <p className={`${eyebrow} flex items-center gap-1.5 text-brand-fg`}>
          <Icon name="ok" size="sm" /> Today
        </p>
        <h2 className="mt-2 text-2xl leading-tight font-extrabold">Ride saved</h2>
        <p className="mt-2">
          This {ride} ride is back on your pass. Your pass now runs to <strong>{niceDate(pass.endsOn)}</strong>.
        </p>
      </section>
    )
  }

  if (outcome?.kind === 'used') {
    return (
      <section className={plainCard}>
        <p className={`${eyebrow} text-fg-muted`}>Today</p>
        <h2 className="mt-2 text-2xl leading-tight font-extrabold">This {ride} ride is used</h2>
        <p className="mt-2 text-fg-muted">It could not be moved, so it counts as one of your seats.</p>
      </section>
    )
  }

  // The bus has gone and the rider has not said what happened.
  const now = fromMinutes(scenario === 'left' ? toMinutes(board.time) + 2 : toMinutes(alight.time) + 5)
  return (
    <section className="mt-5 rounded-2xl border-2 border-danger-fg bg-surface p-5">
      <p className={`${eyebrow} flex items-center gap-1.5 text-danger-fg`}>
        <Icon name="warn" size="sm" /> Today · {now}
      </p>
      <h2 className="mt-2 text-2xl leading-tight font-extrabold">
        Your {board.time} bus has {scenario === 'left' ? `left ${board.name}` : 'finished its run'}
      </h2>
      <p className="mt-2 text-fg-muted">Not on it? You still have options, and you do not need to call anyone.</p>
      <Link to="/missed" className={`${btnPrimary} mt-5`}>
        Missed it? See your options
      </Link>
    </section>
  )
}

export default function Home() {
  const { state } = useStore()
  const { pass } = state
  const route = getRoute(pass?.routeId)
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  const evening = pass && route && pass.trip === 'both' ? tripLines(route, pass.homeId, pass.workId, pass.trip)[1] : null

  return (
    <main className="flex-1 animate-enter px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
      <Logo />
      <PageTitle className="mt-5 text-3xl leading-tight font-extrabold">Hello, {state.name}.</PageTitle>

      {pass && route ? (
        <>
          {notice && (
            <div className="mt-4">
              <Note icon="ok" status>
                <strong>{notice}</strong>
              </Note>
            </div>
          )}

          <RideCard pass={pass} route={route} />

          {evening && (
            <section className={`${card} mt-3 flex items-center gap-3 p-4`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand-fg">
                <Icon name="bus" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm text-fg-muted">Evening ride home</h2>
                <p className="truncate font-bold">
                  {evening.boardAt} · {evening.board}
                </p>
              </div>
            </section>
          )}

          {state.scenario === 'before' && state.outcome?.kind !== 'aboard' && (
            <div className="mt-3">
              <Note icon="clock">
                <strong>Bus tracking opens 30 minutes before.</strong> You will see each stop the bus passes and get a
                text when it is 10 minutes away.
              </Note>
            </div>
          )}

          <section className={`${card} mt-3 p-4`}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-bold">Your pass</h2>
              <p className="truncate text-sm text-fg-muted">
                {route.from} to {route.to}
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold">
              {pass.ridesLeft} of {pass.rides} seats left
            </p>
            <div className="mt-1.5 h-2 rounded-full bg-sunken" aria-hidden="true">
              <div
                className="h-2 rounded-full bg-brand-fg transition-[width] duration-300"
                style={{ width: `${(pass.ridesLeft / pass.rides) * 100}%` }}
              />
            </div>
            <div className="mt-3 border-t border-line pt-2">
              <Row label="Valid until" value={niceDate(pass.endsOn)} />
              <Row label="Ride saves left" value={pass.savesLeft} />
            </div>
            <Link
              to="/change-stop"
              className="mt-2 flex min-h-12 items-center justify-between rounded-xl border border-outline px-4 font-semibold transition-colors duration-150 active:bg-sunken"
            >
              Change my stop <Icon name="chevron" className="text-brand-fg" />
            </Link>
          </section>
        </>
      ) : (
        <>
          <p className="mt-1 text-fg-muted">You do not have a pass yet.</p>
          <section className={plainCard}>
            <span className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand-fg">
              <Icon name="seat" size="lg" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Find the bus that passes your junction</h2>
            <p className="mt-1 text-fg-muted">See the stops, the times and the full price before you pay anything.</p>
            <Link to="/routes" className={`${btnPrimary} mt-5`}>
              Find my route <Icon name="next" />
            </Link>
          </section>
        </>
      )}
    </main>
  )
}
