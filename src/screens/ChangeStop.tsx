import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getRoute, niceDate, tripLines } from '../data'
import { useStore } from '../store'
import { StopPicker } from '../StopPicker'
import { Button, Row, Screen, card } from '../ui'

export default function ChangeStop() {
  const { state, update } = useStore()
  const nav = useNavigate()
  const { pass } = state
  const route = getRoute(pass?.routeId)
  const [homeId, setHomeId] = useState(pass?.homeId ?? '')
  const [workId, setWorkId] = useState(pass?.workId ?? '')

  if (!pass || !route) return <Navigate to="/home" replace />

  const changed = homeId !== pass.homeId || workId !== pass.workId
  const before = tripLines(route, pass.homeId, pass.workId, pass.trip)
  const after = tripLines(route, homeId, workId, pass.trip)

  function confirm() {
    // The change starts from the next ride, so home goes back to showing that ride.
    update({ pass: { ...pass!, homeId, workId }, scenario: 'before', outcome: null })
    nav('/home', { replace: true, state: { notice: `Stop changed. Be at ${after[0].board} by ${after[0].boardAt}.` } })
  }

  return (
    <Screen
      title="Change your stop"
      footer={
        <Button disabled={!changed} onClick={confirm}>
          {changed ? 'Confirm change' : 'Pick a different stop first'}
        </Button>
      }
    >
      <p className="mt-2 text-fg-muted">
        Same route, same price. No need to call anyone. A different route needs a new pass.
      </p>

      <StopPicker
        route={route}
        trip={pass.trip}
        homeId={homeId}
        workId={workId}
        onChange={(h, w) => {
          setHomeId(h)
          setWorkId(w)
        }}
      />

      <section aria-live="polite" className={`${card} mt-6 p-4`}>
        <h2 className="font-bold">What changes</h2>
        {changed ? (
          <ul className="mt-2 space-y-3">
            {after.map((line, i) => (
              <li key={line.label}>
                <p className="text-sm text-fg-muted">{line.label}</p>
                {before[i].board !== line.board && (
                  <p className="text-sm text-fg-muted">
                    <span className="sr-only">Was: </span>
                    <s>
                      Be at {before[i].board} by {before[i].boardAt}
                    </s>
                  </p>
                )}
                <p className="text-lg leading-snug font-bold">
                  Be at {line.board} by {line.boardAt}
                </p>
                {before[i].arrive !== line.arrive && (
                  <p className="text-sm text-fg-muted">
                    <span className="sr-only">Was: </span>
                    <s>
                      Arrive {before[i].arrive} around {before[i].arriveAt}
                    </s>
                  </p>
                )}
                <p className="text-sm">
                  Arrive {line.arrive} around {line.arriveAt}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-fg-muted">Nothing yet. Pick a new stop above to see your new times.</p>
        )}
        <div className="mt-3 border-t border-line pt-2">
          <Row label="Price" value="No change" />
          <Row label="Boarding code" value={`Stays ${pass.code}`} />
          <Row label="Starts" value={`Next ride, ${niceDate(pass.startsOn)}`} />
        </div>
      </section>
    </Screen>
  )
}
