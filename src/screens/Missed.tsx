import { Navigate, useNavigate } from 'react-router-dom'
import { firstLeg, fromMinutes, getRoute, nextWorkingDay, niceDate, toMinutes, tripLines } from '../data'
import { useStore, type Outcome, type Pass } from '../store'
import { Screen, btnPrimary, btnQuiet } from '../ui'

export default function Missed() {
  const { state, update } = useStore()
  const nav = useNavigate()
  const { pass, scenario, outcome } = state
  const route = getRoute(pass?.routeId)

  const missed = scenario === 'left' || scenario === 'gone'
  if (!pass || !route || !missed || outcome) return <Navigate to="/home" replace />

  const leg = firstLeg(route, pass.homeId, pass.workId, pass.trip)
  const board = leg.stops[leg.boardIdx]
  const alight = leg.stops[leg.alightIdx]
  const ride = leg.label.toLowerCase()

  // The rider can only catch up at a stop the bus has not reached, before the one they get off at.
  const next = scenario === 'left' && leg.boardIdx + 1 < leg.alightIdx ? leg.stops[leg.boardIdx + 1] : null
  const canSave = pass.savesLeft > 0
  const newEnd = nextWorkingDay(new Date(pass.endsOn))
  const now = fromMinutes(scenario === 'left' ? toMinutes(board.time) + 2 : toMinutes(alight.time) + 5)
  const evening = pass.trip === 'both' ? tripLines(route, pass.homeId, pass.workId, pass.trip)[1] : null

  function finish(result: Outcome, passPatch: Partial<Pass> = {}) {
    update({ outcome: result, pass: { ...pass!, ...passPatch } })
    nav('/home', { replace: true })
  }

  return (
    <Screen title="Missed your bus?">
      <p className="mt-2 rounded-2xl bg-sun-soft px-4 py-3">
        It is {now}. Your {board.time} bus left {board.name}
        {scenario === 'gone' ? ` and reached ${alight.name} at ${alight.time}` : ''}.
      </p>

      {next ? (
        <section className="mt-4 rounded-3xl border border-line bg-card p-4">
          <h2 className="text-lg font-extrabold">Catch it at the next stop</h2>
          <p className="mt-1 text-2xl font-extrabold text-forest">
            {next.name} · {next.time}
          </p>
          <p className="mt-1 text-sm text-muted">
            Your seat is held until then. The bus cannot wait, and getting there is up to you.
          </p>
          <button className={`${btnPrimary} mt-4`} onClick={() => finish({ kind: 'catch', stopId: next.id })}>
            I’ll catch it there
          </button>
        </section>
      ) : canSave && (
        <p className="mt-4 text-sm text-muted">
          {scenario === 'gone'
            ? 'The bus has finished its run, so there is no stop left to catch it at.'
            : `The next stop is ${alight.name}, where you get off, so there is no stop left to catch it at.`}
        </p>
      )}

      {canSave ? (
        <section className="mt-4 rounded-3xl border border-line bg-card p-4">
          <h2 className="text-lg font-extrabold">Save this ride for later</h2>
          <p className="mt-1">
            The ride goes back on your pass, and your pass runs one extra day, to{' '}
            <strong>{niceDate(newEnd.toISOString())}</strong>.
          </p>
          <p className="mt-1 text-sm text-muted">
            You have {pass.savesLeft} ride {pass.savesLeft === 1 ? 'save' : 'saves'} left on this pass.
          </p>
          <button
            className={`${next ? btnQuiet : btnPrimary} mt-4`}
            onClick={() => finish({ kind: 'saved' }, { savesLeft: pass.savesLeft - 1, endsOn: newEnd.toISOString() })}
          >
            Save this ride
          </button>
        </section>
      ) : next && (
        <p className="mt-4 text-sm text-muted">This pass has no ride saves left.</p>
      )}

      {!next && !canSave && (
        <section className="mt-4 rounded-3xl border-2 border-alert bg-card p-4">
          <h2 className="text-lg font-extrabold text-alert">This ride is used</h2>
          <p className="mt-1">
            There is no stop left to catch the bus at, and this pass has no ride saves left, so this {ride} ride cannot
            be moved.
          </p>
          <button className={`${btnPrimary} mt-4`} onClick={() => finish({ kind: 'used' }, { ridesLeft: pass.ridesLeft - 1 })}>
            OK, I understand
          </button>
        </section>
      )}

      {(next || canSave) && (
        <p className="mt-4 text-sm text-muted">If you choose nothing, this ride counts as used at the end of today.</p>
      )}

      {evening && (
        <p className="mt-4 rounded-2xl bg-leaf px-4 py-3 text-sm">
          Your evening seat is not affected: {evening.board}, {evening.boardAt}.
        </p>
      )}
    </Screen>
  )
}
