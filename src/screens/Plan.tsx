import { Navigate, useNavigate } from 'react-router-dom'
import { getRoute, ghs, plans, priceFor } from '../data'
import { useStore } from '../store'
import { Icon, Row, Screen, btnPrimary, choice } from '../ui'

const promises = [
  ['First-ride promise', 'Not right after your first ride? Cancel that day and the rest of your pass is paid back.'],
  ['No booking fee', 'The total you see is all you pay.'],
  ['Route cancelled?', 'Every unused ride goes back to your mobile money.'],
]

export default function Plan() {
  const { state, updateDraft } = useStore()
  const nav = useNavigate()
  const { draft } = state
  const route = getRoute(draft.routeId)
  if (!route || !draft.homeId || !draft.workId) return <Navigate to="/routes" replace />

  const price = priceFor(route, draft.trip, draft.plan)

  return (
    <Screen
      title="Choose your plan"
      step={3}
      footer={
        <button className={btnPrimary} onClick={() => nav('/pay')}>
          Continue · {ghs(price.total)}
        </button>
      }
    >
      <fieldset className="mt-2">
        <legend className="sr-only">Plan length</legend>
        <div className="space-y-2">
          {plans.map((p) => {
            const option = priceFor(route, draft.trip, p.id)
            return (
              <label key={p.id} className={choice}>
                <input
                  type="radio"
                  name="plan"
                  className="size-5 accent-forest"
                  checked={draft.plan === p.id}
                  onChange={() => updateDraft({ plan: p.id })}
                />
                <span className="flex-1">
                  <span className="block text-lg font-extrabold">{p.name}</span>
                  <span className="block text-sm text-muted">
                    {p.days} working days · {p.note}
                  </span>
                </span>
                <span className="text-lg font-extrabold">{ghs(option.total)}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <section className="mt-6 rounded-3xl border border-line bg-card p-4">
        <h2 className="font-bold">How we get to {ghs(price.total)}</h2>
        <div className="mt-2 border-b border-line pb-2">
          <Row
            label={`${price.plan.days} days × ${price.trip.ridesPerDay} ${price.trip.ridesPerDay === 1 ? 'ride' : 'rides'} × ${ghs(route.perRide)}`}
            value={ghs(price.gross)}
          />
          {price.saving > 0 && <Row label={`${price.plan.name} saving`} value={`− ${ghs(price.saving)}`} />}
          <Row label="Booking fee" value="GHS 0" />
        </div>
        <Row label="You pay" value={ghs(price.total)} strong />
        <p className="text-sm text-muted">
          {price.rides} reserved seats, {ghs(Math.round((price.total / price.rides) * 100) / 100)} each.
        </p>
      </section>

      <section className="mt-4 rounded-3xl bg-leaf p-4">
        <h2 className="flex items-center gap-2 font-bold text-forest">
          <Icon name="shield" /> Before you pay
        </h2>
        <dl className="mt-3 space-y-3">
          {promises.map(([title, body]) => (
            <div key={title}>
              <dt className="font-bold">{title}</dt>
              <dd className="text-sm">{body}</dd>
            </div>
          ))}
          <div>
            <dt className="font-bold">Missed a bus?</dt>
            <dd className="text-sm">
              This plan includes {price.plan.saves} ride {price.plan.saves === 1 ? 'save' : 'saves'}. A saved ride goes
              back on your pass.
            </dd>
          </div>
        </dl>
      </section>
    </Screen>
  )
}
