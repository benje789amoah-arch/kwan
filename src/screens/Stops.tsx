import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getRoute, tripLines, trips, type TripId } from '../data'
import { useStore } from '../store'
import { DayCard, StopPicker } from '../StopPicker'
import { Icon, Screen, btnPrimary, choice } from '../ui'

export default function Stops() {
  const { id } = useParams()
  const route = getRoute(id)
  const { state, updateDraft } = useStore()
  const nav = useNavigate()

  const sameRoute = state.draft.routeId === id
  const [homeId, setHomeId] = useState(() => (sameRoute && state.draft.homeId) || route?.stops[0].id || '')
  const [workId, setWorkId] = useState(
    () => (sameRoute && state.draft.workId) || route?.stops[route.stops.length - 1].id || '',
  )
  const [trip, setTrip] = useState<TripId>(state.draft.trip)

  if (!route) return <Navigate to="/routes" replace />

  function next() {
    updateDraft({ routeId: route!.id, homeId, workId, trip })
    nav('/plan')
  }

  return (
    <Screen
      title={`${route.from} to ${route.to}`}
      step={2}
      footer={
        <button className={btnPrimary} onClick={next}>
          Choose a plan <Icon name="next" />
        </button>
      }
    >
      <fieldset className="mt-2">
        <legend className="mb-2 font-bold">Which trips do you want?</legend>
        <div className="grid grid-cols-3 gap-2">
          {trips.map((t) => (
            <label key={t.id} className={`${choice} justify-center px-2 text-center font-bold`}>
              <input
                type="radio"
                name="trip"
                className="sr-only"
                checked={trip === t.id}
                onChange={() => setTrip(t.id)}
              />
              {t.name}
            </label>
          ))}
        </div>
      </fieldset>

      <StopPicker
        route={route}
        trip={trip}
        homeId={homeId}
        workId={workId}
        onChange={(h, w) => {
          setHomeId(h)
          setWorkId(w)
        }}
      />

      <DayCard lines={tripLines(route, homeId, workId, trip)} />
    </Screen>
  )
}
