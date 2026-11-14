import { Navigate, useNavigate } from 'react-router-dom'
import { getRoute, ghs, plans, priceFor } from '../data'
import { useStore } from '../store'
import { Button, Icon, Row, Screen, card, choice, radio } from '../ui'

const perRide = (total: number, rides: number) => ghs(Math.round((total / rides) * 100) / 100)

export default function Plan() {
  const { state, updateDraft } = useStore()
  const nav = useNavigate()
  const { draft } = state
  const route = getRoute(draft.routeId)
  if (!route || !draft.homeId || !draft.workId) return <Navigate to="/routes" replace />

  const price = priceFor(route, draft.trip, draft.plan)
  const promises = [
    ['First-ride promise', 'Not right after your first ride? Cancel that day and the rest of your pass is paid back.'],
    ['No booking fee', 'The total you see is all you pay.'],
    ['Route cancelled?', 'Every unused ride goes back to your mobile money.'],
    [
      'Missed a bus?',
      `This plan includes ${price.plan.saves} ride ${price.plan.saves === 1 ? 'save' : 'saves'}. A saved ride goes back on your pass.`,
    ],
  ]

  return (
    <Screen
      title="Choose your plan"
      step={2}
      back="/routes"
      footer={<Button onClick={() => nav('/pay')}>Continue · {ghs(price.total)}</Button>}
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
                  className={radio}
                  checked={draft.plan === p.id}
                  onChange={() => updateDraft({ plan: p.id })}
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold">{p.name}</span>
                    <span className="rounded-full bg-accent-tint px-2 py-0.5 text-xs font-bold">{p.note}</span>
                  </span>
                  <span className="block text-sm text-fg-muted">
                    {p.days} working days · {perRide(option.total, option.rides)} a ride
                  </span>
                </span>
                <span className="text-lg font-extrabold whitespace-nowrap">{ghs(option.total)}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <section className={`${card} mt-6 p-4`} aria-live="polite">
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
        <p className="text-sm text-fg-muted">
          {price.rides} reserved seats, {perRide(price.total, price.rides)} each.
        </p>
      </section>

      <section className="mt-4 rounded-2xl bg-brand-tint p-4">
        <h2 className="flex items-center gap-2 font-bold text-brand-fg">
          <Icon name="shield" /> Before you pay
        </h2>
        <dl className="mt-3 space-y-3">
          {promises.map(([title, body]) => (
            <div key={title}>
              <dt className="font-bold">{title}</dt>
              <dd className="text-sm">{body}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Screen>
  )
}
